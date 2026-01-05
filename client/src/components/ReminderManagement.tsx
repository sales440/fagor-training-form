// ============================================================================
// FILE: client/src/components/ReminderManagement.tsx
// DESCRIPTION: Reminder management component for admin dashboard
// FEATURES: View upcoming trainings, trigger manual reminders, view reminder history
// ============================================================================

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Bell, Calendar, CheckCircle, Clock, Mail, RefreshCw } from 'lucide-react';

export function ReminderManagement() {
  const [isTriggering, setIsTriggering] = useState(false);
  
  // Fetch all training requests
  const { data: requests, refetch } = trpc.trainingRequest.getAll.useQuery();
  
  // Trigger manual reminder check
  const triggerMutation = trpc.admin.triggerReminders.useMutation({
    onSuccess: () => {
      toast.success('Reminder check completed successfully');
      refetch();
      setIsTriggering(false);
    },
    onError: (error) => {
      toast.error(`Failed to trigger reminders: ${error.message}`);
      setIsTriggering(false);
    }
  });

  // Filter approved trainings
  const approvedTrainings = requests?.filter(r => r.status === 'approved') || [];
  
  // Calculate upcoming trainings (next 14 days)
  const today = new Date();
  const twoWeeksFromNow = new Date(today);
  twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
  
  const upcomingTrainings = approvedTrainings.filter(r => {
    if (!r.requestedStartDate) return false;
    const startDate = new Date(r.requestedStartDate);
    return startDate >= today && startDate <= twoWeeksFromNow;
  }).sort((a, b) => {
    const dateA = new Date(a.requestedStartDate!).getTime();
    const dateB = new Date(b.requestedStartDate!).getTime();
    return dateA - dateB;
  });

  // Filter trainings that already have reminders sent
  const remindersAlreadySent = upcomingTrainings.filter(r => r.reminderSent);
  const remindersPending = upcomingTrainings.filter(r => !r.reminderSent);

  const handleTriggerReminders = () => {
    setIsTriggering(true);
    triggerMutation.mutate();
  };

  const getDaysUntilTraining = (startDate: Date | null) => {
    if (!startDate) return null;
    const start = new Date(startDate);
    const diffTime = start.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header with manual trigger */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#DC241F]" />
                Training Reminders
              </CardTitle>
              <CardDescription>
                Automated reminders are sent 7 days before training. Manual trigger available for testing.
              </CardDescription>
            </div>
            <Button
              onClick={handleTriggerReminders}
              disabled={isTriggering}
              className="bg-[#DC241F] hover:bg-[#B01D19]"
            >
              {isTriggering ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Trigger Reminder Check
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{upcomingTrainings.length}</div>
              <div className="text-sm text-blue-600">Upcoming Trainings (14 days)</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{remindersAlreadySent.length}</div>
              <div className="text-sm text-green-600">Reminders Sent</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700">{remindersPending.length}</div>
              <div className="text-sm text-yellow-600">Reminders Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming trainings list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Trainings (Next 14 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingTrainings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming trainings in the next 14 days</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingTrainings.map((training) => {
                const daysUntil = getDaysUntilTraining(training.requestedStartDate);
                const isWithin7Days = daysUntil !== null && daysUntil <= 7;
                
                return (
                  <div
                    key={training.id}
                    className={`p-4 border rounded-lg ${
                      isWithin7Days ? 'border-[#DC241F] bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{training.companyName}</h3>
                          {training.reminderSent ? (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Reminder Sent
                            </Badge>
                          ) : isWithin7Days ? (
                            <Badge variant="default" className="bg-yellow-600">
                              <Clock className="w-3 h-3 mr-1" />
                              Due Soon
                            </Badge>
                          ) : (
                            <Badge variant="outline">Scheduled</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Contact:</span> {training.contactPerson}
                          </div>
                          <div>
                            <span className="font-medium">Reference:</span> {training.referenceCode}
                          </div>
                          <div>
                            <span className="font-medium">Start Date:</span>{' '}
                            {training.requestedStartDate
                              ? new Date(training.requestedStartDate).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Days Until:</span>{' '}
                            <span className={daysUntil !== null && daysUntil <= 7 ? 'text-[#DC241F] font-bold' : ''}>
                              {daysUntil !== null ? `${daysUntil} days` : 'N/A'}
                            </span>
                          </div>
                          {training.assignedTechnician && (
                            <div>
                              <span className="font-medium">Technician:</span> {training.assignedTechnician}
                            </div>
                          )}
                          {training.reminderSentAt && (
                            <div>
                              <span className="font-medium">Reminder Sent:</span>{' '}
                              {new Date(training.reminderSentAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scheduler info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Automated Scheduler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Schedule:</strong> Daily at 9:00 AM Central Time (CT)
            </p>
            <p>
              <strong>Logic:</strong> Automatically sends reminder emails to clients and SERVICE team 7 days before
              approved training sessions
            </p>
            <p>
              <strong>Recipients:</strong> Client email + all active notification emails (SERVICE team)
            </p>
            <p className="text-muted-foreground">
              The scheduler runs automatically in the background. Use the manual trigger button above for testing or
              immediate execution.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
