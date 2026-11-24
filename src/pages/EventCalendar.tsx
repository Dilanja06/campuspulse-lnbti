import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { EventItem } from '../types';
import { dataService } from '../services/dataService';

export const EventCalendar: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth] = useState('December 2026');

  useEffect(() => {
    async function loadCalendarEvents() {
      setLoading(true);
      const data = await dataService.getEvents();
      setEvents(data);
      setLoading(false);
    }
    loadCalendarEvents();
  }, []);

  // Days in December 2026: starts on Tuesday
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const getEventsForDay = (day: number) => {
    return events.filter((ev) => {
      if (!ev.start_date) return false;
      // Match day number
      const datePart = ev.start_date.split('-')[2];
      return datePart && parseInt(datePart, 10) === day;
    });
  };

  return (
    <AppLayout>
      {/* Title */}
      <div className="flex flex-wrap items-end justify-between gap-md">
        <div className="flex flex-col gap-xs">
          <h1 className="font-headline text-headline-lg text-light-on-surface font-bold">
            Campus Event Calendar
          </h1>
          <p className="font-body text-body-md text-light-on-surface-variant">
            Official academic schedule, club tournaments, and society meeting dates.
          </p>
        </div>

        <div className="inline-flex items-center gap-xs bg-light-surface-container-low border border-light-outline-variant rounded px-md py-xs">
          <span className="material-symbols-outlined text-[20px] text-light-primary">calendar_month</span>
          <span className="font-headline text-title-md font-bold text-light-on-surface">{currentMonth}</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md overflow-hidden shadow-sm">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-light-outline-variant bg-light-surface-container-low text-center text-label-sm font-label text-light-on-surface-variant font-semibold py-sm">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-light-outline-variant min-h-[500px]">
          {/* Leading blank days for Dec 2026 (Dec 1 is Tuesday, so Sun & Mon are blank) */}
          <div className="p-xs bg-light-surface-container-low/40"></div>
          <div className="p-xs bg-light-surface-container-low/40"></div>

          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isToday = day === 5;

            return (
              <div
                key={day}
                className={`p-xs sm:p-sm flex flex-col justify-between min-h-[85px] transition-colors hover:bg-light-surface-container-low/60 ${
                  isToday ? 'bg-light-primary-container/15' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <span
                    className={`font-mono text-label-sm font-semibold rounded-full w-6 h-6 flex items-center justify-center ${
                      isToday ? 'bg-light-primary text-light-on-primary' : 'text-light-on-surface'
                    }`}
                  >
                    {day}
                  </span>
                </div>

                <div className="flex flex-col gap-1 mt-1">
                  {dayEvents.map((ev) => (
                    <button
                      key={ev.id}
                      onClick={() => navigate(`/events/${ev.id}`)}
                      className="w-full text-left p-1 rounded bg-light-primary-container text-light-on-primary-container text-[11px] font-label truncate hover:opacity-90 border-0 cursor-pointer shadow-xs"
                      title={ev.title}
                    >
                      {ev.title}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default EventCalendar;
