import { useState } from 'react';
import { addDays, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths, isAfter, isBefore, isSameDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvailabilityCalendarProps {
  trainingDays: number;
  onSubmit: (selectedDates: Date[]) => void;
  isSubmitting?: boolean;
  availability?: Array<{ date: string; status: 'available' | 'pending' | 'booked' | 'unavailable'; details?: string }>;
}

export default function AvailabilityCalendar({ trainingDays, onSubmit, isSubmitting = false, availability = [] }: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get today's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 hover:bg-green-200 border-green-300';
      case 'pending': return 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300';
      case 'booked': return 'bg-red-100 hover:bg-red-200 border-red-300';
      default: return 'bg-gray-100 hover:bg-gray-200 border-gray-300';
    }
  };

  const getDayStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availability.find(a => a.date === dateStr) || { status: 'available', details: '' };
  };

  const isDateSelected = (date: Date) => {
    return selectedDates.some(d => isSameDay(d, date));
  };

  const handleDayClick = (date: Date) => {
    const dayStatus = getDayStatus(date);
    if (dayStatus.status === 'booked') return;
    
    // Don't allow past dates
    if (isBefore(date, today)) return;

    // Check if date is already selected
    if (isDateSelected(date)) {
      // Remove the date and all dates after it
      setSelectedDates(prev => prev.filter(d => isBefore(d, date)));
    } else {
      // If no dates selected, start fresh
      if (selectedDates.length === 0) {
        setSelectedDates([date]);
      } else {
        // Check if this date is consecutive to the last selected date
        const lastSelected = selectedDates[selectedDates.length - 1];
        const nextDay = addDays(lastSelected, 1);
        
        if (isSameDay(date, nextDay)) {
          // Add consecutive date
          if (selectedDates.length < trainingDays) {
            setSelectedDates(prev => [...prev, date]);
          }
        } else {
          // Start new selection
          setSelectedDates([date]);
        }
      }
    }
  };

  const handleSubmit = () => {
    if (selectedDates.length === trainingDays) {
      onSubmit(selectedDates);
    }
  };

  const canSelectMore = selectedDates.length < trainingDays;
  const canSubmit = selectedDates.length === trainingDays;

  return (
    <div className="p-4">
      {/* Instructions */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm font-medium text-blue-800">
          Please select {trainingDays} consecutive day{trainingDays > 1 ? 's' : ''} for your training.
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Click on dates to select them. Selected: {selectedDates.length} of {trainingDays} days
        </p>
      </div>

      {/* Legend */}
      <div className="mb-4 flex gap-3 text-xs flex-wrap">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div><span>Available</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div><span>Pending</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div><span>Booked</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-500 rounded"></div><span>Selected</span></div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold text-lg">{format(currentMonth, 'MMMM yyyy')}</h3>
        <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">{day}</div>
        ))}
        {days.map(day => {
          const status = getDayStatus(day);
          const isSelected = isDateSelected(day);
          const isPast = isBefore(day, today);
          const isDisabled = status.status === 'booked' || isPast || (!isSelected && !canSelectMore && selectedDates.length > 0);
          
          // Check if this day can be selected (consecutive to last selected)
          let canSelect = !isDisabled;
          if (canSelect && selectedDates.length > 0 && !isSelected) {
            const lastSelected = selectedDates[selectedDates.length - 1];
            const nextDay = addDays(lastSelected, 1);
            canSelect = isSameDay(day, nextDay);
          }

          return (
            <button
              key={day.toString()}
              onClick={() => handleDayClick(day)}
              disabled={isDisabled && !isSelected}
              title={isPast ? 'Past date' : status.details || status.status}
              className={cn(
                'p-2 text-sm border rounded transition-colors relative group',
                isSelected ? 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600' : getStatusColor(status.status),
                !isSameMonth(day, currentMonth) && 'opacity-30',
                isPast && 'opacity-30 cursor-not-allowed',
                (isDisabled && !isSelected) && 'cursor-not-allowed opacity-50'
              )}
            >
              {format(day, 'd')}
              {status.details && !isSelected && (
                <div className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10">
                  {status.details}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Dates Summary */}
      {selectedDates.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-sm font-medium text-green-800">Selected Training Dates:</p>
          <ul className="text-sm text-green-700 mt-1">
            {selectedDates.map((date, index) => (
              <li key={index}>Day {index + 1}: {format(date, 'EEEE, MMMM d, yyyy')}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Submit Button */}
      <div className="mt-6 flex justify-end gap-3">
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="bg-[#DC241F] hover:bg-[#B01D1A] text-white px-8"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            `SUBMIT SELECTED DATES (${selectedDates.length}/${trainingDays})`
          )}
        </Button>
      </div>
    </div>
  );
}
