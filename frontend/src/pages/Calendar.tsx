import React, { useState, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  parseISO
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Filter,
  Plus,
  Loader2,
  AlertCircle
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import AddAcademicEventModal from '../components/admin/AddAcademicEventModal';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  type: 'academic' | 'drive' | 'job';
  category?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  meta?: {
    createdBy?: string;
  };
}

const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [filterType, setFilterType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      
      // Fetch data for the current month view (plus padding for week boundaries)
      const rangeStart = startOfWeek(monthStart);
      const rangeEnd = endOfWeek(monthEnd);

      const response = await api.get('/calendar', {
        params: {
          start: rangeStart.toISOString(),
          end: rangeEnd.toISOString()
        }
      });
      setEvents(response.data.data);
    } catch (err: any) {
      console.error('Failed to fetch calendar events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-blue-600" />
            Academic Calendar
          </h1>
          <p className="text-gray-500 mt-1">Institutional events, placement drives, and deadlines</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
            <button 
              onClick={prevMonth}
              className="p-2 hover:bg-gray-50 rounded-md transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="px-4 font-semibold text-gray-900 min-w-[140px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button 
              onClick={nextMonth}
              className="p-2 hover:bg-gray-50 rounded-md transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <select 
            className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Events</option>
            <option value="academic">Academic</option>
            <option value="drive">Drives</option>
            <option value="job">Job Deadlines</option>
          </select>
          {user?.role === 'admin' && (
             <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
             >
                <Plus className="w-4 h-4" />
                Add Event
             </button>
          )}
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 mb-2 border-b border-gray-100 pb-2">
        {days.map((day, idx) => (
          <div key={idx} className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const filteredEvents = events.filter(e => filterType === 'all' || e.type === filterType);

    return (
      <div className="grid grid-cols-7 grid-rows-6 auto-rows-fr h-[calc(100vh-350px)] min-h-[500px] border-l border-t border-gray-100 bg-white rounded-xl overflow-hidden shadow-sm">
        {days.map((day, idx) => {
          const dayEvents = filteredEvents.filter(event => isSameDay(parseISO(event.start), day));
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, monthStart);

          return (
            <div
              key={idx}
              className={`border-r border-b border-gray-100 p-2 transition-all cursor-pointer relative ${
                !isCurrentMonth ? 'bg-gray-50/50' : 'bg-white'
              } ${isSameDay(day, selectedDate!) ? 'ring-2 ring-blue-500 ring-inset z-10' : 'hover:bg-blue-50/30'}`}
              onClick={() => setSelectedDate(day)}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-sm font-semibold rounded-full w-7 h-7 flex items-center justify-center ${
                  isToday ? 'bg-blue-600 text-white shadow-sm' : 
                  isCurrentMonth ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  {format(day, 'd')}
                </span>
              </div>
              <div className="space-y-1 overflow-hidden">
                {dayEvents.slice(0, 3).map(event => (
                  <div 
                    key={event.id} 
                    className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium ${
                      event.type === 'academic' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      event.type === 'drive' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                      'bg-rose-100 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {event.type === 'drive' && '🚗 '}{event.type === 'job' && '⌛ '}{event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-gray-400 font-medium pl-1">
                    + {dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderEventDetails = () => {
    if (!selectedDate) return null;
    const dayEvents = events.filter(event => isSameDay(parseISO(event.start), selectedDate));
    const filteredDayEvents = dayEvents.filter(e => filterType === 'all' || e.type === filterType);

    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-350px)] min-h-[500px]">
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <h3 className="font-bold text-gray-900">{format(selectedDate, 'EEEE, MMMM do')}</h3>
          <p className="text-xs text-gray-500">{filteredDayEvents.length} events scheduled</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredDayEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <CalendarIcon className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">No events scheduled for this day</p>
            </div>
          ) : (
            filteredDayEvents.map(event => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={event.id} 
                className={`p-4 rounded-xl border-l-4 shadow-sm bg-white border ${
                  event.type === 'academic' ? 'border-l-amber-500 border-gray-100' :
                  event.type === 'drive' ? 'border-l-indigo-500 border-gray-100' :
                  'border-l-rose-500 border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    event.type === 'academic' ? 'bg-amber-100 text-amber-700' :
                    event.type === 'drive' ? 'bg-indigo-100 text-indigo-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {event.type}
                  </span>
                  {event.priority === 'HIGH' && (
                    <span className="flex items-center gap-1 text-[10px] text-red-600 font-bold uppercase tracking-wider">
                      <AlertCircle className="w-3 h-3" />
                      Priority
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-gray-900 leading-tight mb-1">{event.title}</h4>
                {event.description && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{event.description}</p>}
                
                <div className="space-y-1.5">
                   <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{format(parseISO(event.start), 'p')} {event.end && `- ${format(parseISO(event.end), 'p')}`}</span>
                   </div>
                   {event.category && (
                     <div className="flex items-center gap-2 text-xs text-gray-600 uppercase tracking-tighter font-semibold">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{event.category}</span>
                     </div>
                   )}
                </div>
                
                {event.type === 'drive' && (
                  <button className="mt-4 w-full py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-100 transition-colors">
                    View Drive Details
                  </button>
                )}
                {event.type === 'job' && (
                  <button className="mt-4 w-full py-2 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg hover:bg-rose-100 transition-colors">
                    Apply Now
                  </button>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {renderHeader()}

      {loading && !events.length ? (
        <div className="h-[60vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <div className="h-[60vh] flex items-center justify-center text-red-500 gap-2">
          <AlertCircle className="w-6 h-6" />
          <p>{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3">
            {renderDays()}
            {renderCells()}
            
            {/* Legend */}
            <div className="mt-6 flex gap-6 text-xs font-medium text-gray-500">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-amber-400 rounded-full" />
                 <span>Institutional Events</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-indigo-500 rounded-full" />
                 <span>Placement Drives</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-rose-500 rounded-full" />
                 <span>Job Deadlines</span>
               </div>
            </div>
          </div>
          
          <div className="xl:col-span-1">
            <AnimatePresence mode="wait">
               {renderEventDetails()}
            </AnimatePresence>
          </div>
        </div>
      )}

      <AddAcademicEventModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEventAdded={fetchEvents}
        initialDate={selectedDate || new Date()}
      />
    </div>
  );
};

export default CalendarPage;
