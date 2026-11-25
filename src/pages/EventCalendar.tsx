import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { dataService } from '../services/dataService';
import { EventItem } from '../types';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function parseEventDate(dateStr: string): Date | null {
  const parsed = new Date(dateStr);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  // Support "12 Dec 2026"
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length === 3) {
    const attempt = new Date(`${parts[1]} ${parts[0]}, ${parts[2]}`);
    if (!Number.isNaN(attempt.getTime())) return attempt;
  }
  return null;
}

export const EventCalendar: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(11); // December 2026 (0-indexed)
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedDay, setSelectedDay] = useState<number>(12);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataService.getEvents().then((list) => {
      setEvents(list);
      setLoading(false);
    });
  }, []);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
    setSelectedDay(1);
  };

  const eventsForDay = (day: number) =>
    events.filter((ev) => {
      const d = parseEventDate(ev.start_date);
      return d && d.getFullYear() === viewYear && d.getMonth() === viewMonth && d.getDate() === day;
    });

  const selectedDayEvents = eventsForDay(selectedDay);

  // Build week slice around selectedDay
  const weekStart = Math.max(1, selectedDay - ((new Date(viewYear, viewMonth, selectedDay).getDay() + 7) % 7));
  const weekDays = Array.from({ length: 7 }, (_, i) => weekStart + i).filter((d) => d <= daysInMonth);

  return (
    <AppLayout>
      <main className="p-lg md:p-xl max-w-[1400px] w-full mx-auto flex flex-col gap-xl">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline text-headline-lg text-light-on-surface font-semibold m-0">
              Event Calendar
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant m-0">
              Schedule overview across campus clubs and societies. Select any date to view its agenda.
            </p>
          </div>

          <div className="flex items-center gap-sm flex-wrap">
            <div className="inline-flex rounded border border-light-outline-variant bg-light-surface-container-lowest overflow-hidden">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="px-sm py-xs bg-transparent border-0 cursor-pointer hover:bg-light-surface-container-low"
                aria-label="Previous month"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <span className="px-md py-xs font-label text-label-md font-bold text-light-on-surface flex items-center">
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="px-sm py-xs bg-transparent border-0 cursor-pointer hover:bg-light-surface-container-low"
                aria-label="Next month"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>

            <div className="inline-flex rounded border border-light-outline-variant bg-light-surface-container-low p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('month')}
                className={`px-md py-xs rounded font-label text-label-md border-0 cursor-pointer ${
                  viewMode === 'month' ? 'bg-light-surface-container-lowest shadow-sm font-semibold' : 'bg-transparent'
                }`}
              >
                Month
              </button>
              <button
                type="button"
                onClick={() => setViewMode('week')}
                className={`px-md py-xs rounded font-label text-label-md border-0 cursor-pointer ${
                  viewMode === 'week' ? 'bg-light-surface-container-lowest shadow-sm font-semibold' : 'bg-transparent'
                }`}
              >
                Week
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
          {/* Calendar Grid (8 cols) */}
          <section className="lg:col-span-8 bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-md shadow-sm">
            {loading ? (
              <div className="p-xl text-center text-light-on-surface-variant">Loading schedule...</div>
            ) : viewMode === 'month' ? (
              <div className="grid grid-cols-7 gap-xs">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="text-center font-label text-label-sm font-semibold text-light-on-surface-variant py-xs">
                    {d}
                  </div>
                ))}
                {Array.from({ length: firstWeekday }).map((_, i) => (
                  <div key={`pad-${i}`} className="h-24 rounded bg-light-surface-container-low/20" />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const dayEvents = eventsForDay(day);
                  const isSelected = selectedDay === day;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={`h-24 p-xs rounded border text-left flex flex-col justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-light-primary bg-light-primary-container/10'
                          : 'border-light-outline-variant bg-light-surface-container-lowest hover:bg-light-surface-container-low/40'
                      }`}
                    >
                      <span className={`font-label text-label-sm font-bold ${isSelected ? 'text-light-primary' : ''}`}>
                        {day}
                      </span>
                      <div className="flex flex-col gap-0.5 overflow-hidden">
                        {dayEvents.slice(0, 2).map((ev) => (
                          <span
                            key={ev.id}
                            className="px-1 py-0.5 rounded bg-light-primary text-light-on-primary text-[10px] font-medium truncate"
                          >
                            {ev.title}
                          </span>
                        ))}
                        {dayEvents.length > 2 && (
                          <span className="text-[10px] text-light-primary font-semibold">
                            +{dayEvents.length - 2} more
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-sm">
                <h2 className="font-title text-title-md font-semibold m-0">
                  Week of {MONTHS[viewMonth]} {weekDays[0]}, {viewYear}
                </h2>
                <div className="divide-y divide-light-outline-variant border border-light-outline-variant rounded">
                  {weekDays.map((day) => {
                    const dayEvs = eventsForDay(day);
                    return (
                      <div
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`p-md flex flex-col sm:flex-row sm:items-center justify-between gap-sm cursor-pointer ${
                          selectedDay === day ? 'bg-light-primary-container/10' : ''
                        }`}
                      >
                        <span className="font-label text-label-md font-bold w-28">
                          {MONTHS[viewMonth].slice(0, 3)} {day}
                        </span>
                        <div className="flex-1 flex flex-wrap gap-xs">
                          {dayEvs.length === 0 ? (
                            <span className="text-body-sm text-light-on-surface-variant">No scheduled events</span>
                          ) : (
                            dayEvs.map((ev) => (
                              <Link
                                key={ev.id}
                                to={`/events/${ev.id}`}
                                className="px-sm py-xs rounded bg-light-primary text-light-on-primary text-label-sm font-medium no-underline"
                              >
                                {ev.time} · {ev.title}
                              </Link>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* Selected Day Agenda (4 cols) */}
          <aside className="lg:col-span-4 bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
            <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold m-0">
              Agenda · {selectedDay} {MONTHS[viewMonth]} {viewYear}
            </h2>
            {selectedDayEvents.length === 0 ? (
              <p className="font-body text-body-md text-light-on-surface-variant m-0">
                No club events scheduled on this date. Select highlighted calendar cells to inspect events.
              </p>
            ) : (
              <div className="flex flex-col gap-sm">
                {selectedDayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-md rounded bg-light-surface-container-low/50 border border-light-outline-variant flex flex-col gap-xs"
                  >
                    <span className="font-mono text-mono-sm text-light-primary font-semibold">
                      {ev.time} · {ev.category}
                    </span>
                    <h3 className="font-title text-title-md text-light-on-surface font-bold m-0">{ev.title}</h3>
                    <span className="font-body text-body-sm text-light-on-surface-variant">
                      {ev.club_name} · {ev.venue}
                    </span>
                    <Link
                      to={`/events/${ev.id}`}
                      className="font-label text-label-md text-light-primary font-semibold no-underline hover:underline pt-xs"
                    >
                      Open Event Details →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </main>
    </AppLayout>
  );
};

export default EventCalendar;
