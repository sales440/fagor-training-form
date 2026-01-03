import { useState } from 'react';
import { addDays, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Hardcoded Fagor logo URL
const FAGOR_LOGO = "https://www.fagorautomation.com/images/fagor-automation-logo.svg";

interface AvailabilityCalendarProps {
  trainingDays: number;
  onSubmitDates: (startDate: Date, endDate: Date) => void;
  availability?: Array<{ date: string; status: 'available' | 'pending' | 'booked' | 'unavailable'; details?: string }>;
  isSubmitting?: boolean;
}

export default function AvailabilityCalendar({ trainingDays, onSubmitDates, availability = [], isSubmitting = false }: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStart, setSelectedStart] = useState<Date | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submittedDates, setSubmittedDates] = useState<{ start: Date; end: Date } | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

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

  const handleDayClick = (date: Date) => {
    const dayStatus = getDayStatus(date);
    if (dayStatus.status === 'booked') return;
    
    // Just select the date, don't submit
    setSelectedStart(date);
  };

  const handleSubmit = () => {
    if (selectedStart) {
      const endDate = addDays(selectedStart, trainingDays - 1);
      setSubmittedDates({ start: selectedStart, end: endDate });
      onSubmitDates(selectedStart, endDate);
      setShowConfirmation(true);
    }
  };

  return (
    <div className="p-4">
      {/* FAGOR Logo */}
      <div className="flex justify-center mb-6">
        <img 
          src={FAGOR_LOGO} 
          alt="FAGOR Automation" 
          className="h-16 w-auto"
          onError={(e) => {
            // Fallback to text if image fails to load
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
      
      {/* Legend */}
      <div className="mb-4 flex gap-3 text-xs flex-wrap">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div><span>Available</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div><span>Pending</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div><span>Booked</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div><span>Unavailable</span></div>
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
          
          // Check if this day is within the selected range
          const isInSelectedRange = selectedStart && (() => {
            const endDate = addDays(selectedStart, trainingDays - 1);
            const dayTime = day.getTime();
            const startTime = selectedStart.getTime();
            const endTime = endDate.getTime();
            return dayTime >= startTime && dayTime <= endTime;
          })();
          
          const isStartDay = selectedStart && format(day, 'yyyy-MM-dd') === format(selectedStart, 'yyyy-MM-dd');
          
          return (
            <button
              key={day.toString()}
              onClick={() => handleDayClick(day)}
              disabled={status.status === 'booked'}
              title={status.details || status.status}
              className={cn(
                'p-2 text-sm border rounded transition-colors relative group',
                getStatusColor(status.status),
                !isSameMonth(day, currentMonth) && 'opacity-30',
                isInSelectedRange && 'ring-2 ring-blue-500 bg-blue-100 font-bold',
                isStartDay && 'ring-4 ring-blue-600',
                status.status === 'booked' && 'cursor-not-allowed opacity-50'
              )}
            >
              {format(day, 'd')}
              {status.details && (
                <div className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10">
                  {status.details}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Range */}
      {selectedStart && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm font-medium">Selected: {format(selectedStart, 'MMM dd, yyyy')} - {format(addDays(selectedStart, trainingDays - 1), 'MMM dd, yyyy')}</p>
          <p className="text-xs text-gray-600 mt-1">Duration: {trainingDays} day{trainingDays > 1 ? 's' : ''}</p>
        </div>
      )}

      {/* Submit Button - Only shows when dates are selected */}
      {selectedStart && (
        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#DC241F] hover:bg-[#B01D1A] text-white px-8 py-3 text-lg font-semibold"
          >
            {isSubmitting ? 'Submitting...' : 'SUBMIT SELECTED DATES'}
          </Button>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <img src={FAGOR_LOGO} alt="FAGOR Automation" className="h-12 w-auto" />
            </div>
            <DialogTitle className="text-center text-xl text-green-600">
              ✓ Dates Submitted Successfully
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {submittedDates && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4 text-center">
                <p className="font-semibold text-blue-800">Selected Training Dates:</p>
                <p className="text-blue-700">
                  {format(submittedDates.start, 'MMMM dd, yyyy')} - {format(submittedDates.end, 'MMMM dd, yyyy')}
                </p>
                <p className="text-sm text-blue-600 mt-1">({trainingDays} day{trainingDays > 1 ? 's' : ''})</p>
              </div>
            )}
            
            <div className="bg-yellow-50 border border-yellow-300 rounded p-4">
              <p className="text-yellow-800 font-semibold text-center mb-2">⚠️ Important Notice</p>
              <p className="text-yellow-700 text-sm text-center">
                The selected dates will be reviewed and confirmed by the <strong>SERVICE office of FAGOR Automation USA</strong>.
              </p>
              <p className="text-yellow-700 text-sm text-center mt-2">
                You will receive a confirmation email with the final approved dates or alternative dates if necessary.
              </p>
            </div>
            
            <div className="flex justify-center mt-4">
              <Button
                onClick={() => setShowConfirmation(false)}
                className="bg-[#DC241F] hover:bg-[#B01D1A] text-white px-6"
              >
                OK
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
