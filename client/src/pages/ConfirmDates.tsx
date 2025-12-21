// ============================================================================
// FILE: client/src/pages/ConfirmDates.tsx
// DESCRIPTION: Client confirmation page for proposed training dates
// ACCESS: Public (token-based authentication via email link)
// ============================================================================

import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Calendar, Users, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import DateSelectionCalendar from '@/components/DateSelectionCalendar';

export default function ConfirmDates() {
  const [, params] = useRoute('/confirm-dates/:token');
  const [, navigate] = useLocation();
  const token = params?.token || '';

  // State management
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isAccepting, setIsAccepting] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Fetch request details by token
  const { data: request, isLoading, error } = trpc.trainingRequest.getByToken?.useQuery(
    { token },
    { enabled: !!token && !isSubmitted }
  );

  // Confirmation mutation
  const confirmMutation = trpc.trainingRequest.confirmDates.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      setSubmissionSuccess(true);
    },
    onError: (error) => {
      setIsSubmitted(true);
      setSubmissionSuccess(false);
    },
  });

  // Handle confirmation (accept)
  const handleAccept = () => {
    setIsAccepting(true);
    setShowConfirmation(true);
  };

  // Handle rejection
  const handleReject = () => {
    setIsAccepting(false);
    setShowConfirmation(true);
  };

  // Handle submission
  const handleSubmit = () => {
    if (!isAccepting && !rejectionReason.trim()) {
      return;
    }

    confirmMutation.mutate({
      token,
      confirmed: isAccepting,
      rejectionReason: isAccepting ? undefined : rejectionReason,
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your training details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <CardTitle>Invalid Link</CardTitle>
                <CardDescription>This confirmation link is not valid</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error?.message || 'The confirmation link is invalid or has expired. Please contact support if you need assistance.'}
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full mt-4"
            >
              Go to Home Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show success/error submission result
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                submissionSuccess ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {submissionSuccess ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div>
                <CardTitle>
                  {submissionSuccess ? 'Response Received!' : 'Something Went Wrong'}
                </CardTitle>
                <CardDescription>
                  {submissionSuccess
                    ? 'Thank you for your response'
                    : 'Unable to process your response'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Alert className={submissionSuccess ? 'bg-green-50 border-green-200' : ''}>
              <AlertDescription className={submissionSuccess ? 'text-green-900' : ''}>
                {submissionSuccess ? (
                  isAccepting ? (
                    <div>
                      <p className="font-medium mb-2">Training Confirmed!</p>
                      <p className="text-sm">
                        Your training has been confirmed and scheduled. You will receive a confirmation email shortly with all the details.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium mb-2">Feedback Received</p>
                      <p className="text-sm">
                        We've received your feedback. Our team will review your comments and propose new dates soon.
                      </p>
                    </div>
                  )
                ) : (
                  confirmMutation.error?.message || 'An error occurred. Please try again or contact support.'
                )}
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => navigate('/')}
              className="w-full mt-4"
            >
              Return to Home Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main confirmation interface
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Training Date Confirmation
          </h1>
          <p className="text-muted-foreground">
            Please review and confirm the proposed training dates
          </p>
        </div>

        {/* Request Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Training Request Details</CardTitle>
            <CardDescription>
              Review your training information and proposed dates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Company Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold">Company</Label>
                <p className="text-sm mt-1">{request?.companyName}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold">Contact Person</Label>
                <p className="text-sm mt-1">{request?.contactPerson}</p>
              </div>
            </div>

            {/* Training Details */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-semibold">Training Type</Label>
                <p className="text-sm mt-1">{request?.trainingType}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Participants
                </Label>
                <p className="text-sm mt-1">{request?.numberOfParticipants}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Duration
                </Label>
                <p className="text-sm mt-1">{request?.estimatedHours} hours</p>
              </div>
            </div>

            {/* Proposed Dates - Highlighted */}
            {request?.approvedDates && request.approvedDates.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <Label className="text-sm font-semibold flex items-center gap-2 text-blue-900">
                  <Calendar className="h-4 w-4" />
                  Proposed Training Dates
                </Label>
                <div className="mt-3 space-y-2">
                  {request.approvedDates.map((date, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-blue-600 rounded-full" />
                      <span className="text-base font-medium text-blue-900">
                        {format(new Date(date), 'EEEE, MMMM dd, yyyy')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Your Original Preferences */}
            {request?.preferredDates && request.preferredDates.length > 0 && (
              <div className="mt-4">
                <Label className="text-sm font-semibold text-muted-foreground">
                  Your Original Preferred Dates
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {request.preferredDates.map((date, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-gray-100 rounded">
                      {format(new Date(date), 'MMM dd, yyyy')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Technician Assignment */}
            {request?.assignedTechnician && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <Label className="text-sm font-semibold">Assigned Technician</Label>
                <p className="text-sm mt-1">{request.assignedTechnician}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {!showConfirmation ? (
          <div className="flex gap-4">
            <Button
              onClick={handleAccept}
              className="flex-1 h-auto py-6 flex flex-col gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-6 w-6" />
              <span className="text-lg font-semibold">Accept Dates</span>
              <span className="text-xs opacity-90">Confirm the proposed training dates</span>
            </Button>
            <Button
              onClick={handleReject}
              variant="outline"
              className="flex-1 h-auto py-6 flex flex-col gap-2 border-2 hover:bg-red-50 hover:border-red-300"
            >
              <XCircle className="h-6 w-6" />
              <span className="text-lg font-semibold">Request Changes</span>
              <span className="text-xs opacity-70">Propose different dates</span>
            </Button>
          </div>
        ) : (
          /* Confirmation Dialog */
          <Card>
            <CardHeader>
              <CardTitle>
                {isAccepting ? 'Confirm Acceptance' : 'Request Different Dates'}
              </CardTitle>
              <CardDescription>
                {isAccepting
                  ? 'Please confirm that you accept the proposed training dates'
                  : 'Please tell us why these dates don\'t work for you'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isAccepting && (
                <div>
                  <Label htmlFor="rejection-reason" className="text-sm font-semibold">
                    Why don't these dates work? *
                  </Label>
                  <Textarea
                    id="rejection-reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please explain why you need different dates (e.g., conflict with other commitments, prefer earlier/later dates, etc.)"
                    rows={4}
                    className="mt-2"
                    required
                  />
                  {!rejectionReason.trim() && (
                    <p className="text-xs text-muted-foreground mt-1">
                      A brief explanation helps us propose better alternatives
                    </p>
                  )}
                </div>
              )}

              <Alert className={isAccepting ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}>
                <AlertCircle className={`h-4 w-4 ${isAccepting ? 'text-green-600' : 'text-yellow-600'}`} />
                <AlertDescription className={isAccepting ? 'text-green-900' : 'text-yellow-900'}>
                  {isAccepting ? (
                    'By accepting, you confirm the proposed dates and we will schedule your training accordingly.'
                  ) : (
                    'Your request will be sent back to our team. We will review your feedback and propose new dates soon.'
                  )}
                </AlertDescription>
              </Alert>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1"
                  disabled={confirmMutation.isLoading}
                >
                  Go Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  className={`flex-1 ${isAccepting ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  disabled={(!isAccepting && !rejectionReason.trim()) || confirmMutation.isLoading}
                >
                  {confirmMutation.isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    isAccepting ? 'Confirm Acceptance' : 'Submit Feedback'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
