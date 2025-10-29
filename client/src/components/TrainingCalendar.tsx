import React, { useState, useEffect } from 'react';
import { trpc } from '../lib/trpc';
import { AlertCircle, Calendar, CheckCircle, Clock, Loader2 } from 'lucide-react';

interface TrainingCalendarProps {
  referenceCode: string;
  trainingDays: number;
  assignedTechnician: string;
  onDatesSelected: () => void;
}

export function TrainingCalendar({ referenceCode, trainingDays, assignedTechnician, onDatesSelected }: TrainingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availability, setAvailability] = useState<{ available: boolean; conflicts: any[] } | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const selectDatesMutation = trpc.trainingRequest.selectDates.useMutation({
    onSuccess: () => {
      onDatesSelected();
    },
    onError: (error) => {
      alert(`Error selecting dates: ${error.message}`);
      setIsSubmitting(false);
    },
  });

  // Check availability when date is selected
  useEffect(() => {
    if (selectedDate) {
      checkAvailability();
    } else {
      setAvailability(null);
      setShowSuggestions(false);
    }
  }, [selectedDate]);

  const checkAvailability = async () => {
    if (!selectedDate) return;

    setIsCheckingAvailability(true);
    setShowSuggestions(false);

    try {
      const endDate = new Date(selectedDate);
      endDate.setDate(endDate.getDate() + trainingDays - 1);
      const endDateStr = endDate.toISOString().split('T')[0];

      const result = await trpc.trainingRequest.checkDateAvailability.query({
        startDate: selectedDate,
        endDate: endDateStr,
      });

      setAvailability(result);

      // If dates are not available, fetch suggestions
      if (!result.available) {
        const suggestionsResult = await trpc.trainingRequest.suggestAlternativeDates.query({
          requestedStartDate: selectedDate,
          trainingDays,
        });
        setSuggestions(suggestionsResult.suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailability({ available: true, conflicts: [] }); // Fallback to available if check fails
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleDateSelect = async () => {
    if (!selectedDate) {
      alert('Please select a start date');
      return;
    }

    if (availability && !availability.available) {
      alert('Selected dates are not available. Please choose from the suggested dates or select a different date.');
      return;
    }

    setIsSubmitting(true);

    // Calculate end date based on training days
    const startDate = new Date(selectedDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + trainingDays - 1);

    try {
      await selectDatesMutation.mutateAsync({
        referenceCode,
        startDate: selectedDate,
        endDate: endDate.toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Error selecting dates:', error);
    }
  };

  const handleSuggestionClick = (suggestedDate: string) => {
    setSelectedDate(suggestedDate);
    setShowSuggestions(false);
  };

  // Calculate minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Calculate maximum date (1 year from now)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  // Calculate end date for display
  const endDateDisplay = selectedDate
    ? new Date(new Date(selectedDate).getTime() + (trainingDays - 1) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
    : '';

  return (
    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg">
      <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-4">Select Training Dates</h2>
      
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded space-y-2">
        <p className="text-xs sm:text-sm text-gray-600">
          <strong className="font-semibold">Reference Code:</strong> {referenceCode}
        </p>
        <p className="text-xs sm:text-sm text-gray-600">
          <strong className="font-semibold">Assigned Technician:</strong> {assignedTechnician}
        </p>
        <p className="text-xs sm:text-sm text-gray-600">
          <strong className="font-semibold">Training Duration:</strong> {trainingDays} day{trainingDays > 1 ? 's' : ''}
        </p>
      </div>

      <div className="mb-4 sm:mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Training Start Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={minDate}
          max={maxDateStr}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
          disabled={isSubmitting}
        />
        
        {/* Date Range Display */}
        {selectedDate && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Training Period
                </p>
                <p className="text-sm text-blue-700">
                  <strong>{selectedDate}</strong> to <strong>{endDateDisplay}</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Availability Check Loading */}
        {isCheckingAvailability && (
          <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
            <span className="text-sm text-gray-600">Checking availability...</span>
          </div>
        )}

        {/* Availability Status */}
        {!isCheckingAvailability && availability && selectedDate && (
          <>
            {availability.available ? (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">Dates Available</p>
                  <p className="text-xs text-green-700 mt-1">
                    These dates are free and ready to be booked.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">Dates Not Available</p>
                    <p className="text-xs text-red-700 mt-1">
                      {availability.conflicts.length} conflict{availability.conflicts.length > 1 ? 's' : ''} found during this period.
                    </p>
                  </div>
                </div>
                
                {/* Show conflicts */}
                {availability.conflicts.length > 0 && (
                  <div className="mt-2 pl-7">
                    <p className="text-xs font-medium text-red-800 mb-1">Conflicts:</p>
                    <ul className="space-y-1">
                      {availability.conflicts.map((conflict, index) => (
                        <li key={index} className="text-xs text-red-700">
                          • {conflict.summary} ({conflict.start} - {conflict.end})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Alternative Date Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-start gap-2 mb-3">
              <Clock className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">Alternative Dates Available</p>
                <p className="text-xs text-yellow-700 mt-1">
                  We found {suggestions.length} alternative date{suggestions.length > 1 ? 's' : ''} that work for your training:
                </p>
              </div>
            </div>
            
            <div className="space-y-2 mt-3">
              {suggestions.map((suggestion, index) => {
                const suggestionEndDate = new Date(suggestion);
                suggestionEndDate.setDate(suggestionEndDate.getDate() + trainingDays - 1);
                const suggestionEndDateStr = suggestionEndDate.toISOString().split('T')[0];
                
                return (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left p-3 bg-white border border-yellow-300 rounded-md hover:bg-yellow-50 hover:border-yellow-400 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      Option {index + 1}: {suggestion} to {suggestionEndDateStr}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {trainingDays} day{trainingDays > 1 ? 's' : ''} of training
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 sm:p-4 mb-4 sm:mb-6">
        <p className="text-xs sm:text-sm text-yellow-700">
          <strong>Note:</strong> Your selected dates will be marked as "Pending Confirmation" in our calendar.
          You will receive a confirmation email once the dates are approved.
        </p>
      </div>

      <button
        onClick={handleDateSelect}
        disabled={!selectedDate || isSubmitting || isCheckingAvailability || (availability && !availability.available)}
        className="w-full bg-red-600 text-white py-2 sm:py-3 px-4 sm:px-6 text-sm sm:text-base rounded-md font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Submitting...' : 'Confirm Training Dates'}
      </button>
    </div>
  );
}
