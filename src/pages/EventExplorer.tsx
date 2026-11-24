import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { StatusChip } from '../components/StatusChip';
import { EventItem, RegistrationItem } from '../types';
import { dataService } from '../services/dataService';

export const EventExplorer: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedClub, setSelectedClub] = useState('All');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [evList, regList] = await Promise.all([
        dataService.getEvents(),
        dataService.getRegistrations(),
      ]);
      setEvents(evList);
      setRegistrations(regList);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      ev.club_name.toLowerCase().includes(search.toLowerCase()) ||
      ev.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || ev.category === selectedCategory;
    const matchesClub = selectedClub === 'All' || ev.club_name.includes(selectedClub);
    return matchesSearch && matchesCategory && matchesClub;
  });

  const getActionForEvent = (event: EventItem) => {
    const reg = registrations.find((r) => r.event_id === event.id);
    if (reg) {
      return (
        <button
          onClick={() => navigate('/my-registrations')}
          className="px-md py-xs rounded bg-light-surface-container-low text-light-primary border border-light-outline-variant font-label text-label-md font-semibold hover:bg-light-surface-container transition-colors cursor-pointer"
        >
          View Registration
        </button>
      );
    }

    if (event.status === 'cancelled') {
      return (
        <span className="font-label text-label-md text-light-error font-semibold flex items-center gap-xs">
          <span className="material-symbols-outlined text-[16px]">cancel</span>
          Cancelled
        </span>
      );
    }

    if (event.status === 'closed' || event.registered >= event.capacity) {
      return (
        <button
          disabled
          className="px-md py-xs rounded bg-light-surface-container-high text-light-on-surface-variant font-label text-label-md font-medium opacity-60 cursor-not-allowed border-0"
        >
          Registration Closed
        </button>
      );
    }

    return (
      <button
        onClick={() => navigate(`/events/${event.id}/register`)}
        className="px-md py-xs rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold hover:bg-light-primary-container transition-colors cursor-pointer border-0 shadow-sm"
      >
        Register Now
      </button>
    );
  };

  return (
    <AppLayout registrationCount={registrations.length}>
      {/* Page Title */}
      <div className="flex flex-col gap-xs">
        <h1 className="font-headline text-headline-lg text-light-on-surface font-bold">
          Explore Events
        </h1>
        <p className="font-body text-body-md text-light-on-surface-variant">
          Discover certified university competitions, club workshops, hackathons, and cultural galas.
        </p>
      </div>

      {/* Filter Bar */}
      <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-md grid grid-cols-1 md:grid-cols-4 gap-md shadow-sm">
        {/* Search */}
        <div className="relative flex items-center md:col-span-2">
          <span className="material-symbols-outlined text-[20px] text-light-outline absolute left-md pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by event title, keyword, or club..."
            className="w-full rounded border border-light-outline-variant bg-light-surface-container-lowest pl-2xl pr-md py-sm font-body text-body-md text-light-on-surface placeholder:text-light-outline focus:border-light-primary focus:ring-1 focus:ring-light-primary outline-none"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded border border-light-outline-variant bg-light-surface-container-lowest px-md py-sm font-body text-body-md text-light-on-surface focus:border-light-primary focus:ring-1 focus:ring-light-primary outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Technical">Technical</option>
            <option value="Sports">Sports</option>
            <option value="Cultural">Cultural</option>
            <option value="Academic">Academic</option>
            <option value="Community Service">Community Service</option>
          </select>
        </div>

        {/* Club Filter */}
        <div>
          <select
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value)}
            className="w-full rounded border border-light-outline-variant bg-light-surface-container-lowest px-md py-sm font-body text-body-md text-light-on-surface focus:border-light-primary focus:ring-1 focus:ring-light-primary outline-none"
          >
            <option value="All">All Clubs</option>
            <option value="IEEE">IEEE Student Branch</option>
            <option value="Sports">Sports Council</option>
            <option value="Rotaract">Rotaract Club</option>
            <option value="Drama">Drama Society</option>
            <option value="Research">Academic Research Forum</option>
          </select>
        </div>
      </section>

      {/* Result Count */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-mono-md text-light-on-surface-variant font-medium">
          {loading ? 'Loading events...' : `${filteredEvents.length} events found`}
        </span>
      </div>

      {/* 3-Column Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
        {filteredEvents.map((ev) => {
          const remaining = ev.capacity - ev.registered;

          return (
            <div
              key={ev.id}
              onClick={() => navigate(`/events/${ev.id}`)}
              className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md hover:border-light-primary transition-all cursor-pointer group"
            >
              <div>
                {/* Event Top Banner */}
                <div className="h-40 bg-gradient-to-br from-slate-900 to-indigo-950 p-md flex flex-col justify-between text-white relative group-hover:brightness-105 transition-all">
                  <div className="flex justify-between items-start">
                    <span className="px-sm py-0.5 rounded bg-black/50 text-xs font-mono backdrop-blur-sm">
                      {ev.code}
                    </span>
                    <StatusChip label={ev.status} status={ev.status} />
                  </div>
                  <span className="text-xs uppercase tracking-wider text-teal-300 font-semibold">
                    {ev.category} · {ev.club_name}
                  </span>
                </div>

                {/* Event Content */}
                <div className="p-lg flex flex-col gap-sm">
                  <h3 className="font-headline text-title-lg text-light-on-surface font-semibold line-clamp-2 m-0 group-hover:text-light-primary transition-colors">
                    <span className="text-light-on-surface group-hover:text-light-primary">
                      {ev.title}
                    </span>
                  </h3>

                  <div className="flex flex-col gap-xs text-light-on-surface-variant text-body-md mt-xs">
                    <div className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                      <span>{ev.start_date} · {ev.time}</span>
                    </div>
                    <div className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[18px]">location_on</span>
                      <span>{ev.venue}</span>
                    </div>
                    <div className="flex items-center gap-xs font-mono text-label-sm mt-xs">
                      <span className="material-symbols-outlined text-[18px]">group</span>
                      <span className={remaining <= 20 ? 'text-warning font-bold' : ''}>
                        {ev.registered}/{ev.capacity} registered ({remaining > 0 ? `${remaining} seats left` : 'Full'})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div 
                onClick={(e) => e.stopPropagation()}
                className="p-md bg-light-surface-container-low border-t border-light-outline-variant flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="font-label text-label-sm text-light-on-surface-variant">Fee</span>
                  <span className="font-mono text-title-md font-bold text-light-primary">
                    {ev.fee === 0 ? 'Free' : `LKR ${ev.fee}`}
                  </span>
                </div>

                <div className="flex items-center gap-xs">
                  <button
                    onClick={() => navigate(`/events/${ev.id}`)}
                    className="p-xs text-light-on-surface-variant hover:text-light-primary bg-transparent border-0 cursor-pointer flex items-center justify-center rounded"
                    title="View details"
                  >
                    <span className="material-symbols-outlined text-[20px]">info</span>
                  </button>
                  {getActionForEvent(ev)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default EventExplorer;
