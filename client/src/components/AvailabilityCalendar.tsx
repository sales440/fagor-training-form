import { useState } from 'react';
import { addDays, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvailabilityCalendarProps {
  trainingDays: number;
  onDateSelect: (startDate: Date, endDate: Date) => void;
  availability?: Array<{ date: string; status: 'available' | 'pending' | 'booked' | 'unavailable'; details?: string }>;
}

export default function AvailabilityCalendar({ trainingDays, onDateSelect, availability = [] }: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStart, setSelectedStart] = useState<Date | null>(null);

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
    
    const endDate = addDays(date, trainingDays - 1);
    setSelectedStart(date);
    onDateSelect(date, endDate);
  };

  return (
    <div className="p-4">
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
          const isSelected = selectedStart && format(day, 'yyyy-MM-dd') === format(selectedStart, 'yyyy-MM-dd');
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
                isSelected && 'ring-2 ring-blue-500',
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
    </div>
  );
}
