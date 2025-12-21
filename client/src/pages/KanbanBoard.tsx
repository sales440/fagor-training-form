// ============================================================================
// FILE: client/src/components/KanbanBoard.tsx
// DESCRIPTION: Kanban board with drag & drop for managing training request workflow
// FEATURES: 4 columns (Pending, Awaiting Confirmation, Approved, Rejected), @dnd-kit integration
// ============================================================================

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Users, Clock, Mail, Phone, MapPin, GripVertical } from 'lucide-react';
import { format } from 'date-fns';

// Type definitions
type Status = 'pending' | 'awaiting_client_confirmation' | 'dates_selected' | 'approved' | 'rejected' | 'completed';

interface TrainingRequest {
  id: number;
  companyName: string;
  status: Status;
  contactPerson: string;
  email: string;
  phone?: string;
  preferredDates?: string[];
  approvedDates?: string[];
  assignedTechnician?: string;
  technicianNotes?: string;
  rejectionReason?: string;
  address: string;
  city?: string;
  state?: string;
  createdAt: Date;
}

// Column configuration
const COLUMNS = [
  { id: 'pending', title: 'Pending Approval', color: 'bg-yellow-50 border-yellow-200' },
  { id: 'awaiting_client_confirmation', title: 'Awaiting Client Confirmation', color: 'bg-blue-50 border-blue-200' },
  { id: 'approved', title: 'Approved', color: 'bg-green-50 border-green-200' },
  { id: 'rejected', title: 'Rejected', color: 'bg-red-50 border-red-200' },
] as const;

// Sortable card component
function KanbanCard({ request, onClick }: { request: TrainingRequest; onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: request.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Determine which dates to display
  const displayDates = request.approvedDates?.length ? request.approvedDates : request.preferredDates;

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="mb-3 cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1" onClick={onClick}>
              <CardTitle className="text-sm font-semibold">{request.companyName}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">{request.controllerModel}</p>
            </div>
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1">
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-3" onClick={onClick}>
          <div className="space-y-2 text-xs">
            {/* Contact Information */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate">{request.contactPerson}</span>
            </div>

            {/* Participants and Hours */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span>{"N/A"} participants</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span>{request.trainingDays || 0} days</span>
              </div>
            </div>

            {/* Dates */}
            {displayDates && displayDates.length > 0 && (
              <div className="flex items-start gap-2">
                <Calendar className="h-3 w-3 text-muted-foreground mt-0.5" />
                <div className="flex flex-col gap-1">
                  {displayDates.slice(0, 2).map((date, idx) => (
                    <span key={idx} className="text-xs">
                      {format(new Date(date), 'MMM dd, yyyy')}
                    </span>
                  ))}
                  {displayDates.length > 2 && (
                    <span className="text-xs text-muted-foreground">+{displayDates.length - 2} more</span>
                  )}
                </div>
              </div>
            )}

            {/* Assigned Technician */}
            {request.assignedTechnician && (
              <div className="mt-2 pt-2 border-t">
                <Badge variant="secondary" className="text-xs">
                  {request.assignedTechnician}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Droppable column component
function KanbanColumn({
  column,
  requests,
  onCardClick,
}: {
  column: typeof COLUMNS[number];
  requests: TrainingRequest[];
  onCardClick: (request: TrainingRequest) => void;
}) {
  return (
    <div className={`${column.color} rounded-lg border-2 p-4 min-h-[500px]`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-sm">{column.title}</h2>
        <Badge variant="outline">{requests.length}</Badge>
      </div>
      <SortableContext items={requests.map((r) => r.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {requests.map((request) => (
            <KanbanCard key={request.id} request={request} onClick={() => onCardClick(request)} />
          ))}
        </div>
      </SortableContext>
      {requests.length === 0 && (
        <div className="text-center text-sm text-muted-foreground py-8">
          No requests in this stage
        </div>
      )}
    </div>
  );
}

export function KanbanBoard() {
  const { toast } = useToast();
  const utils = trpc.useContext();

  // State management
  const [activeId, setActiveId] = useState<number | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<TrainingRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [technicianNotes, setTechnicianNotes] = useState('');

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum drag distance to activate
      },
    })
  );

  // Fetch all training requests
  const { data: requests, isLoading } = trpc.trainingRequest.getAll.useQuery();

  // Mutation for updating status
  const updateStatusMutation = trpc.trainingRequest.updateStatus.useMutation({
    onSuccess: () => {
      toast({
        title: 'Status Updated',
        description: 'Training request has been moved successfully.',
      });
      utils.trainingRequest.getAll.invalidate();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Group requests by status
  const requestsByStatus = {
    pending: requests?.filter((r) => r.status === 'pending') || [],
    awaiting_client_confirmation: requests?.filter((r) => r.status === 'awaiting_client_confirmation') || [],
    approved: requests?.filter((r) => r.status === 'approved') || [],
    rejected: requests?.filter((r) => r.status === 'rejected') || [],
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeRequest = requests?.find((r) => r.id === active.id);
    if (!activeRequest) return;

    // Determine the target column
    let targetStatus: Status | null = null;

    // Check if dropped over a column container
    const overId = over.id.toString();
    if (COLUMNS.some((col) => col.id === overId)) {
      targetStatus = overId as Status;
    } else {
      // Dropped over another card, find its status
      const targetRequest = requests?.find((r) => r.id === over.id);
      if (targetRequest) {
        targetStatus = targetRequest.status;
      }
    }

    // If status changed, handle the update
    if (targetStatus && targetStatus !== activeRequest.status) {
      // If moving to rejected, show rejection dialog
      if (targetStatus === 'rejected') {
        setSelectedRequest(activeRequest);
        setIsRejectDialogOpen(true);
        return;
      }

      // Otherwise, update status directly
      updateStatusMutation.mutate({
        id: activeRequest.id,
        status: targetStatus,
        technicianNotes: activeRequest.technicianNotes,
      });
    }
  };

  // Handle card click to show details
  const handleCardClick = (request: TrainingRequest) => {
    setSelectedRequest(request);
    setTechnicianNotes(request.technicianNotes || '');
    setIsDetailsOpen(true);
  };

  // Handle rejection confirmation
  const handleConfirmRejection = () => {
    if (!selectedRequest) return;

    updateStatusMutation.mutate({
      id: selectedRequest.id,
      status: 'rejected',
      rejectionReason,
      technicianNotes,
    });

    setIsRejectDialogOpen(false);
    setRejectionReason('');
  };

  // Handle saving technician notes
  const handleSaveNotes = () => {
    if (!selectedRequest) return;

    updateStatusMutation.mutate({
      id: selectedRequest.id,
      status: selectedRequest.status,
      technicianNotes,
    });

    setIsDetailsOpen(false);
  };

  // Get the active request for drag overlay
  const activeRequest = requests?.find((r) => r.id === activeId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading kanban board...</div>
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              requests={requestsByStatus[column.id]}
              onCardClick={handleCardClick}
            />
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeRequest ? (
            <Card className="shadow-lg opacity-90">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">{activeRequest.companyName}</CardTitle>
                <p className="text-xs text-muted-foreground">{activeRequest.machineType || "N/A"}</p>
              </CardHeader>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Training Request Details</DialogTitle>
            <DialogDescription>
              View and update training request information
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              {/* Company Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Company</Label>
                  <p className="text-sm mt-1">{selectedRequest.companyName}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Training Type</Label>
                  <p className="text-sm mt-1">{selectedRequest.machineType || "N/A"}</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Contact Person
                  </Label>
                  <p className="text-sm mt-1">{selectedRequest.contactPerson}</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.email}</p>
                </div>
                {selectedRequest.phone && (
                  <div>
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </Label>
                    <p className="text-sm mt-1">{selectedRequest.phone}</p>
                  </div>
                )}
              </div>

              {/* Location */}
              <div>
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </Label>
                <p className="text-sm mt-1">
                  {selectedRequest.address}
                  {selectedRequest.city && `, ${selectedRequest.city}`}
                  {selectedRequest.state && `, ${selectedRequest.state}`}
                </p>
              </div>

              {/* Training Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Participants
                  </Label>
                  <p className="text-sm mt-1">{selectedRequest.trainees || 0}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Estimated Hours
                  </Label>
                  <p className="text-sm mt-1">{selectedRequest.trainingDays || 0}</p>
                </div>
              </div>

              {/* Dates */}
              {selectedRequest.preferredDates && selectedRequest.preferredDates.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Preferred Dates
                  </Label>
                  <div className="mt-1 space-y-1">
                    {selectedRequest.preferredDates.map((date, idx) => (
                      <p key={idx} className="text-sm">
                        {format(new Date(date), 'PPP')}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {selectedRequest.approvedDates && selectedRequest.approvedDates.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Approved Dates
                  </Label>
                  <div className="mt-1 space-y-1">
                    {selectedRequest.approvedDates.map((date, idx) => (
                      <p key={idx} className="text-sm">
                        {format(new Date(date), 'PPP')}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Technician Notes */}
              <div>
                <Label htmlFor="tech-notes" className="text-sm font-semibold">
                  Technician Notes
                </Label>
                <Textarea
                  id="tech-notes"
                  value={technicianNotes}
                  onChange={(e) => setTechnicianNotes(e.target.value)}
                  placeholder="Add notes about this training request..."
                  rows={4}
                  className="mt-1"
                />
              </div>

              {/* Rejection Reason (if rejected) */}
              {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
                <div>
                  <Label className="text-sm font-semibold">Rejection Reason</Label>
                  <p className="text-sm mt-1 p-3 bg-red-50 rounded">{selectedRequest.rejectionReason}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNotes}>Save Notes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Confirmation Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Training Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this training request. This will be sent to the client.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-reason" className="text-sm font-semibold">
                Rejection Reason *
              </Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this request is being rejected..."
                rows={4}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="rejection-notes" className="text-sm font-semibold">
                Internal Notes (Optional)
              </Label>
              <Textarea
                id="rejection-notes"
                value={technicianNotes}
                onChange={(e) => setTechnicianNotes(e.target.value)}
                placeholder="Add internal notes..."
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmRejection}
              disabled={!rejectionReason.trim()}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
