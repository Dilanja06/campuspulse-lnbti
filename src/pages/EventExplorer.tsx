import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { StatusChip } from '../components/StatusChip';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { EventItem, RegistrationItem } from '../types';
import { getEventCoverImage } from '../utils/eventImages';

export const EventExplorer: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [feeFilter, setFeeFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [evs, regs] = await Promise.all([
          dataService.getEvents(),
          dataService.getRegistrations({ userId: user?.id, userEmail: user?.email }),
        ]);
        setEvents(evs);
        // Strictly ignore cancelled/rejected records when showing "Registered"
        setRegistrations(regs.filter((r) => r.status !== 'cancelled' && r.status !== 'rejected'));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user?.id, user?.email]);

  const categories = ['All', 'Technical', 'Sports', 'Cultural', 'Academic', 'Community Service'];

  const filteredEvents = events.filter((ev) => {
    const matchSearch =
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.club_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.venue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'All' || ev.category === selectedCategory;
    const matchFee =
      feeFilter === 'all' || (feeFilter === 'free' && ev.fee === 0) || (feeFilter === 'paid' && ev.fee > 0);
    const matchMonth = monthFilter === 'all' || ev.start_date.toLowerCase().includes(monthFilter.toLowerCase());
    return matchSearch && matchCategory && matchFee && matchMonth;
  });

  return (
    <AppLayout>
      <main className="p-lg md:p-xl max-w-[1400px] w-full mx-auto flex flex-col gap-xl">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline text-headline-lg text-light-on-surface font-semibold">
              Explore Campus Events
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant">
              Browse authority-approved student club events, workshops, tournaments, and community initiatives.
            </p>
          </div>
          <Link
            to="/calendar"
            className="inline-flex items-center gap-xs px-md py-sm rounded bg-light-surface-container-lowest border border-light-outline-variant text-light-on-surface font-label text-label-md font-semibold no-underline hover:bg-light-surface-container-low w-fit"
          >
            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            <span>Calendar View</span>
          </Link>
        </header>

        {/* Search & Filter Controls */}
        <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-md flex flex-col gap-md shadow-sm">
          <div className="flex flex-col md:flex-row gap-md">
            <div className="relative flex-1">
              <span className="material-symbols-outlined text-[20px] text-light-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2">
                search
              </span>
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by event name, club, or venue..."
                className="w-full pl-10 pr-md py-sm rounded border border-light-outline bg-light-surface-container-lowest text-light-on-surface font-body text-body-md"
              />
            </div>

            <select
              value={feeFilter}
              onChange={(e) => setFeeFilter(e.target.value as 'all' | 'free' | 'paid')}
              className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest font-body text-body-md"
            >
              <option value="all">All Prices</option>
              <option value="free">Free Entry</option>
              <option value="paid">Paid Events</option>
            </select>

            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest font-body text-body-md"
            >
              <option value="all">All Dates</option>
              <option value="Nov">November 2026</option>
              <option value="Dec">December 2026</option>
              <option value="Jan">January 2027</option>
            </select>
          </div>

          <div className="flex items-center gap-xs flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-md py-xs rounded-full font-label text-label-md border cursor-pointer transition-colors ${
                  selectedCategory === cat
                    ? 'bg-light-primary text-light-on-primary border-light-primary'
                    : 'bg-light-surface-container-low text-light-on-surface-variant border-light-outline-variant hover:bg-light-surface-container'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Events Grid */}
        {loading ? (
          <div className="p-xl text-center text-light-on-surface-variant">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-xl text-center bg-light-surface-container-lowest rounded-md border border-light-outline-variant text-light-on-surface-variant">
            No events match your current search or filter criteria.
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {filteredEvents.map((ev) => {
              const userReg = registrations.find((r) => r.event_id === ev.id);
              const seatsLeft = Math.max(0, ev.capacity - ev.registered);

              return (
                <article
                  key={ev.id}
                  className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md overflow-hidden shadow-sm flex flex-col hover:border-light-primary/60 transition-colors"
                >
                  <div className="h-44 relative bg-slate-900 overflow-hidden">
                    <img
                      src={getEventCoverImage(ev)}
                      alt={ev.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex gap-xs">
                      <span className="px-sm py-0.5 rounded bg-black/60 text-white font-label text-label-sm backdrop-blur-sm">
                        {ev.category}
                      </span>
                      {ev.status !== 'published' && (
                        <StatusChip label={ev.status.toUpperCase()} status={ev.status === 'cancelled' ? 'cancelled' : 'warning'} />
                      )}
                    </div>
                    {userReg && (
                      <div className="absolute top-3 right-3">
                        <StatusChip
                          label={userReg.status === 'checked_in' ? 'Checked In' : userReg.status.replace('_', ' ')}
                          status={userReg.status === 'checked_in' ? 'confirmed' : userReg.status}
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-lg flex flex-col gap-md flex-1 justify-between">
                    <div className="flex flex-col gap-xs">
                      <span className="font-label text-label-sm text-light-primary font-semibold">
                        {ev.club_name}
                      </span>
                      <h2 className="font-title text-title-lg text-light-on-surface font-bold m-0">
                        {ev.title}
                      </h2>
                      <p className="font-body text-body-sm text-light-on-surface-variant m-0 line-clamp-2">
                        {ev.description}
                      </p>

                      <div className="flex flex-col gap-xs pt-xs text-label-sm text-light-on-surface-variant">
                        <div className="flex items-center gap-xs">
                          <span className="material-symbols-outlined text-[16px]">event</span>
                          <span>{ev.start_date} · {ev.time}</span>
                        </div>
                        <div className="flex items-center gap-xs">
                          <span className="material-symbols-outlined text-[16px]">location_on</span>
                          <span>{ev.venue}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-md border-t border-light-outline-variant">
                      <div className="flex flex-col">
                        <span className="font-mono text-title-md font-bold text-light-on-surface">
                          {ev.fee > 0 ? `LKR ${ev.fee.toLocaleString()}` : 'Free'}
                        </span>
                        <span className="font-label text-label-sm text-light-on-surface-variant tabular-nums">
                          {seatsLeft > 0 ? `${seatsLeft} seats left` : 'Full'}
                        </span>
                      </div>

                      <Link
                        to={`/events/${ev.id}`}
                        className="px-md py-sm rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold no-underline hover:bg-light-primary-container transition-colors"
                      >
                        {userReg ? 'View Registration' : ev.status === 'published' ? 'View & Register' : 'View Notice'}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </AppLayout>
  );
};

export default EventExplorer;
