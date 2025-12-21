// ============================================================================
// FILE: client/src/components/CalendarView.tsx
// DESCRIPTION: Interactive calendar component for viewing and managing training requests
// FEATURES: Drag & drop, color-coded events, event details modal, availability checking
// ============================================================================

import { useState, useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Event, SlotInfo } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays, isSameDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { trpc } from '@/lib/trpc';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, Users, Clock, Mail, Phone, MapPin, User } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Configure date-fns localizer for react-big-calendar
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: enUS }),
  getDay,
  locales,
});

// Custom event type with training request data
interface CalendarEvent extends Event {
  resource: {
    id: number;
    companyName: string;
    status: 'pending' | 'awaiting_client_confirmation' | 'approved' | 'rejected';
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
  };
}

export function CalendarView() {
  const { toast } = useToast();
  const utils = trpc.useContext();
  
  // State management
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedDates, setEditedDates] = useState<string[]>([]);
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [assignedTechnician, setAssignedTechnician] = useState('');

  // Fetch all training requests
  const { data: requests, isLoading } = trpc.trainingRequest.getAll.useQuery();

  // Mutation for updating dates
  const updateDatesMutation = trpc.trainingRequest.updateDates.useMutation({
    onSuccess: () => {
      toast({
        title: 'Dates Updated',
        description: 'Training dates have been updated successfully.',
      });
      utils.trainingRequest.getAll.invalidate();
      setIsDetailsOpen(false);
      setIsEditMode(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation for updating status
  const updateStatusMutation = trpc.trainingRequest.updateStatus.useMutation({
    onSuccess: () => {
      toast({
        title: 'Status Updated',
        description: 'Training request status has been updated.',
      });
      utils.trainingRequest.getAll.invalidate();
      setIsDetailsOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Convert training requests to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    if (!requests) return [];

    return requests.flatMap((request) => {
      // Determine which dates to display
      const datesToShow = request.approvedDates?.length 
        ? request.approvedDates 
        : request.preferredDates || [];

      // Create an event for each date (trainings last full days)
      return datesToShow.map((dateStr) => {
        const date = new Date(dateStr);
        return {
          id: `${request.id}-${dateStr}`,
          title: `${request.companyName} - ${request.trainingType}`,
          start: date,
          end: date, // Full day event
          allDay: true,
          resource: {
            id: request.id,
            companyName: request.companyName,
            status: request.status,
            contactPerson: request.contactPerson,
            email: request.email,
            phone: request.phone,
            preferredDates: request.preferredDates,
            approvedDates: request.approvedDates,
            assignedTechnician: request.assignedTechnician,
            technicianNotes: request.technicianNotes,
            rejectionReason: request.rejectionReason,
            address: request.address,
            city: request.city,
            state: request.state,
          },
        };
      });
    });
  }, [requests]);

  // Event styling based on status
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const colors = {
      pending: { backgroundColor: '#FCD34D', color: '#78350F' }, // Yellow
      awaiting_client_confirmation: { backgroundColor: '#60A5FA', color: '#1E3A8A' }, // Blue
      approved: { backgroundColor: '#34D399', color: '#065F46' }, // Green
      rejected: { backgroundColor: '#F87171', color: '#7F1D1D' }, // Red
    };

    return {
      style: {
        ...colors[event.resource.status],
        borderRadius: '4px',
        border: 'none',
        padding: '2px 5px',
        fontSize: '0.875rem',
        fontWeight: '500',
      },
    };
  }, []);

  // Handle event selection
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
    setIsEditMode(false);
    setTechnicianNotes(event.resource.technicianNotes || '');
    setAssignedTechnician(event.resource.assignedTechnician || '');
  }, []);

  // Handle drag and drop
  const handleEventDrop = useCallback(
    ({ event, start }: { event: CalendarEvent; start: Date }) => {
      // Only allow drag & drop for pending or awaiting_client_confirmation status
      if (event.resource.status === 'approved' || event.resource.status === 'rejected') {
        toast({
          title: 'Cannot Move Event',
          description: 'Only pending or awaiting confirmation events can be moved.',
          variant: 'destructive',
        });
        return;
      }

      // Update the date
      updateDatesMutation.mutate({
        id: event.resource.id,
        dates: [start.toISOString()],
      });
    },
    [updateDatesMutation, toast]
  );

  // Handle saving edited details
  const handleSaveDetails = () => {
    if (!selectedEvent) return;

    if (isEditMode && editedDates.length > 0) {
      updateDatesMutation.mutate({
        id: selectedEvent.resource.id,
        dates: editedDates,
        technicianNotes,
        assignedTechnician,
      });
    }
  };

  // Handle status change
  const handleStatusChange = (newStatus: 'pending' | 'awaiting_client_confirmation' | 'approved' | 'rejected') => {
    if (!selectedEvent) return;

    updateStatusMutation.mutate({
      id: selectedEvent.resource.id,
      status: newStatus,
      technicianNotes,
    });
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const variants: Record<string, any> = {
      pending: 'bg-yellow-100 text-yellow-800',
      awaiting_client_confirmation: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={variants[status]}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="h-[800px] bg-white rounded-lg shadow p-4">
      {/* Legend */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FCD34D' }} />
          <span className="text-sm">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#60A5FA' }} />
          <span className="text-sm">Awaiting Confirmation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#34D399' }} />
          <span className="text-sm">Approved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F87171' }} />
          <span className="text-sm">Rejected</span>
        </div>
      </div>

      {/* Calendar */}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100% - 3rem)' }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleSelectEvent}
        onEventDrop={handleEventDrop}
        draggableAccessor={(event: CalendarEvent) => 
          event.resource.status === 'pending' || 
          event.resource.status === 'awaiting_client_confirmation'
        }
        resizable={false}
        views={['month', 'week', 'day', 'agenda']}
        defaultView="month"
      />

      {/* Event Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Training Request Details</span>
              {selectedEvent && <StatusBadge status={selectedEvent.resource.status} />}
            </DialogTitle>
            <DialogDescription>
              View and manage training request information
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              {/* Company Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Company
                  </Label>
                  <p className="text-sm mt-1">{selectedEvent.resource.companyName}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Training Type</Label>
                  <p className="text-sm mt-1">{selectedEvent.resource.trainingType}</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Contact Person
                  </Label>
                  <p className="text-sm mt-1">{selectedEvent.resource.contactPerson}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <p className="text-sm mt-1">{selectedEvent.resource.email}</p>
                </div>
              </div>

              {selectedEvent.resource.phone && (
                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </Label>
                  <p className="text-sm mt-1">{selectedEvent.resource.phone}</p>
                </div>
              )}

              {/* Location */}
              <div>
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </Label>
                <p className="text-sm mt-1">
                  {selectedEvent.resource.address}
                  {selectedEvent.resource.city && `, ${selectedEvent.resource.city}`}
                  {selectedEvent.resource.state && `, ${selectedEvent.resource.state}`}
                </p>
              </div>

              {/* Training Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Participants
                  </Label>
                  <p className="text-sm mt-1">{selectedEvent.resource.numberOfParticipants}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Estimated Hours
                  </Label>
                  <p className="text-sm mt-1">{selectedEvent.resource.estimatedHours}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                {selectedEvent.resource.preferredDates && selectedEvent.resource.preferredDates.length > 0 && (
                  <div>
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      Preferred Dates
                    </Label>
                    <div className="mt-1 space-y-1">
                      {selectedEvent.resource.preferredDates.map((date) => (
                        <p key={date} className="text-sm">
                          {format(new Date(date), 'PPP')}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                {selectedEvent.resource.approvedDates && selectedEvent.resource.approvedDates.length > 0 && (
                  <div>
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      Approved Dates
                    </Label>
                    <div className="mt-1 space-y-1">
                      {selectedEvent.resource.approvedDates.map((date) => (
                        <p key={date} className="text-sm">
                          {format(new Date(date), 'PPP')}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Assigned Technician */}
              <div>
                <Label htmlFor="technician" className="text-sm font-semibold">
                  Assigned Technician
                </Label>
                <Input
                  id="technician"
                  value={assignedTechnician}
                  onChange={(e) => setAssignedTechnician(e.target.value)}
                  placeholder="Enter technician name"
                  className="mt-1"
                />
              </div>

              {/* Technician Notes */}
              <div>
                <Label htmlFor="notes" className="text-sm font-semibold">
                  Technician Notes
                </Label>
                <Textarea
                  id="notes"
                  value={technicianNotes}
                  onChange={(e) => setTechnicianNotes(e.target.value)}
                  placeholder="Add internal notes about this training..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              {/* Rejection Reason (if rejected) */}
              {selectedEvent.resource.status === 'rejected' && selectedEvent.resource.rejectionReason && (
                <div>
                  <Label className="text-sm font-semibold">Rejection Reason</Label>
                  <p className="text-sm mt-1 p-3 bg-red-50 rounded">
                    {selectedEvent.resource.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              {selectedEvent?.resource.status === 'pending' && (
                <>
                  <Button
                    onClick={() => handleStatusChange('awaiting_client_confirmation')}
                    variant="default"
                  >
                    Propose Dates
                  </Button>
                  <Button
                    onClick={() => handleStatusChange('rejected')}
                    variant="destructive"
                  >
                    Reject
                  </Button>
                </>
              )}
              {selectedEvent?.resource.status === 'awaiting_client_confirmation' && (
                <Button
                  onClick={() => handleStatusChange('approved')}
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Approve
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                Close
              </Button>
              <Button onClick={handleSaveDetails}>
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
