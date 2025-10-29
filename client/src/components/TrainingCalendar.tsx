import React, { useState } from 'react';
import { trpc } from '../lib/trpc';

interface TrainingCalendarProps {
  referenceCode: string;
  trainingDays: number;
  assignedTechnician: string;
  onDatesSelected: () => void;
}

export function TrainingCalendar({ referenceCode, trainingDays, assignedTechnician, onDatesSelected }: TrainingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectDatesMutation = trpc.trainingRequest.selectDates.useMutation({
    onSuccess: () => {
      onDatesSelected();
    },
    onError: (error) => {
      alert(`Error selecting dates: ${error.message}`);
      setIsSubmitting(false);
    },
  });

  const handleDateSelect = async () => {
    if (!selectedDate) {
      alert('Please select a start date');
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

  // Calculate minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Calculate maximum date (1 year from now)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateStr = maxDate.toISOString().split('T')[0];

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
        {selectedDate && (
          <p className="mt-2 text-xs sm:text-sm text-gray-600">
            Training will run from <strong>{selectedDate}</strong> to{' '}
            <strong>
              {new Date(new Date(selectedDate).getTime() + (trainingDays - 1) * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0]}
            </strong>
          </p>
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
        disabled={!selectedDate || isSubmitting}
        className="w-full bg-red-600 text-white py-2 sm:py-3 px-4 sm:px-6 text-sm sm:text-base rounded-md font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Submitting...' : 'Confirm Training Dates'}
      </button>
    </div>
  );
}

