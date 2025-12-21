import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { trpc } from '@/lib/trpc';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface DateSelectionCalendarProps {
  trainingDays: number;
  assignedTechnician: string;
  onDateSelect: (startDate: Date, endDate: Date) => void;
}

export default function DateSelectionCalendar({
  trainingDays,
  assignedTechnician,
  onDateSelect,
}: DateSelectionCalendarProps) {
  const [selectedStart, setSelectedStart] = useState<Date | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  // Fetch technician availability
  const { data: availability } = trpc.trainingRequest.getTechnicianAvailability.useQuery({
    technician: assignedTechnician,
  });

  useEffect(() => {
    if (availability) {
      // Convert availability data to calendar events with color coding
      const calendarEvents = availability.map((item: any) => ({
        title: item.status,
        start: new Date(item.date),
        end: new Date(item.date),
        resource: {
          status: item.status,
          color: getStatusColor(item.status),
        },
      }));
      setEvents(calendarEvents);
    }
  }, [availability]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return '#10b981'; // Green
      case 'pending':
        return '#f59e0b'; // Yellow
      case 'booked':
        return '#ef4444'; // Red
      default:
        return '#9ca3af'; // Gray
    }
  };

  const handleSelectSlot = ({ start }: { start: Date }) => {
    const endDate = addDays(start, trainingDays - 1);
    setSelectedStart(start);
    onDateSelect(start, endDate);
  };

  const eventStyleGetter = (event: any) => {
    return {
      style: {
        backgroundColor: event.resource?.color || '#3174ad',
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  return (
    <div className="h-[500px] p-4">
      <div className="mb-4 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>Pending Confirmation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
          <span>Unavailable</span>
        </div>
      </div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 450 }}
        onSelectSlot={handleSelectSlot}
        selectable
        eventPropGetter={eventStyleGetter}
        views={['month']}
        defaultView="month"
      />
      {selectedStart && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm font-medium">
            Selected: {format(selectedStart, 'MMM dd, yyyy')} -{' '}
            {format(addDays(selectedStart, trainingDays - 1), 'MMM dd, yyyy')}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Training Duration: {trainingDays} day{trainingDays > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
