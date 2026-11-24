import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { StatusChip } from '../components/StatusChip';
import { EventItem, RegistrationItem } from '../types';
import { dataService } from '../services/dataService';
import { getEventCoverImage } from '../utils/eventImages';

export const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [registration, setRegistration] = useState<RegistrationItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvent() {
      if (!id) return;
      setLoading(true);
      const [ev, regs] = await Promise.all([
        dataService.getEventById(id),
        dataService.getRegistrations(),
      ]);
      setEvent(ev);
      const userReg = regs.find((r) => r.event_id === id);
      if (userReg) setRegistration(userReg);
      setLoading(false);
    }
    loadEvent();
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="py-2xl text-center">
          <p className="font-body text-body-lg text-light-on-surface-variant">Loading event details from Supabase...</p>
        </div>
      </AppLayout>
    );
  }

  if (!event) {
    return (
      <AppLayout>
        <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-2xl text-center flex flex-col items-center gap-md">
          <span className="material-symbols-outlined text-[48px] text-light-outline">event_busy</span>
          <h2 className="font-headline text-headline-sm font-bold text-light-on-surface m-0">Event Not Found</h2>
          <p className="font-body text-body-md text-light-on-surface-variant max-w-md m-0">
            The requested event ID could not be located in the university database.
          </p>
          <Link to="/events" className="px-md py-sm rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold no-underline">
            Back to Event Explorer
          </Link>
        </div>
      </AppLayout>
    );
  }

  const capacityPercent = Math.min(100, Math.round((event.registered / event.capacity) * 100));
  const remaining = event.capacity - event.registered;

  return (
    <AppLayout>
      {/* Top Breadcrumb & Reference ID */}
      <div className="flex items-center justify-between">
        <Link
          to="/events"
          className="inline-flex items-center gap-xs text-label-md font-label text-light-primary hover:underline no-underline"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to events</span>
        </Link>
        <span className="font-mono text-mono-md text-light-on-surface-variant px-sm py-0.5 rounded bg-light-surface-container-high">
          {event.code}
        </span>
      </div>

      {/* Hero Banner */}
      <div className="h-64 md:h-80 rounded-lg p-xl flex flex-col justify-end text-white relative shadow-sm overflow-hidden bg-slate-900">
        <img
          src={getEventCoverImage(event)}
          alt={event.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
        <div className="absolute top-md right-md z-10">
          <StatusChip label={event.status} status={event.status} />
        </div>
        <div className="flex flex-col gap-xs max-w-3xl z-10">
          <span className="text-teal-300 font-label text-label-md font-semibold uppercase tracking-wider drop-shadow">
            {event.category} · Organized by {event.club_name}
          </span>
          <h1 className="font-headline text-headline-lg font-bold text-white m-0 drop-shadow-md">
            {event.title}
          </h1>
        </div>
      </div>

      {/* 12-Column Split: Details & Sticky Registration Action */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
        {/* Left Column (8 cols): Event Description, Metadata, Schedule */}
        <div className="lg:col-span-8 flex flex-col gap-xl">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-md bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg shadow-sm">
            <div className="flex items-start gap-sm">
              <span className="material-symbols-outlined text-[24px] text-light-primary shrink-0">calendar_today</span>
              <div className="flex flex-col">
                <span className="font-label text-label-sm text-light-on-surface-variant font-medium">Date</span>
                <span className="font-body text-body-md text-light-on-surface font-semibold">{event.start_date}</span>
              </div>
            </div>

            <div className="flex items-start gap-sm">
              <span className="material-symbols-outlined text-[24px] text-light-primary shrink-0">schedule</span>
              <div className="flex flex-col">
                <span className="font-label text-label-sm text-light-on-surface-variant font-medium">Time</span>
                <span className="font-body text-body-md text-light-on-surface font-semibold">{event.time}</span>
              </div>
            </div>

            <div className="flex items-start gap-sm">
              <span className="material-symbols-outlined text-[24px] text-light-primary shrink-0">location_on</span>
              <div className="flex flex-col">
                <span className="font-label text-label-sm text-light-on-surface-variant font-medium">Venue</span>
                <span className="font-body text-body-md text-light-on-surface font-semibold">{event.venue}</span>
              </div>
            </div>
          </div>

          {/* About This Event */}
          <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
            <h2 className="font-headline text-headline-sm font-semibold text-light-on-surface m-0">
              About This Event
            </h2>
            <p className="font-body text-body-lg text-light-on-surface-variant leading-relaxed m-0">
              {event.description}
            </p>
          </div>

          {/* Event Schedule Timeline */}
          {event.schedule && event.schedule.length > 0 && (
            <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
              <h2 className="font-headline text-headline-sm font-semibold text-light-on-surface m-0">
                Event Schedule &amp; Itinerary
              </h2>

              <div className="flex flex-col divide-y divide-light-outline-variant">
                {event.schedule.map((slot, idx) => (
                  <div key={idx} className="py-md flex flex-col sm:flex-row gap-sm sm:gap-lg first:pt-0">
                    <span className="font-mono text-mono-md font-semibold text-light-primary min-w-[100px] shrink-0">
                      {slot.time}
                    </span>
                    <div className="flex flex-col gap-xs">
                      <span className="font-title text-title-md font-semibold text-light-on-surface">
                        {slot.title}
                      </span>
                      <span className="font-body text-body-md text-light-on-surface-variant">
                        {slot.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Eligibility Panel */}
          <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-sm shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-headline-sm font-semibold text-light-on-surface m-0">
                Participation Eligibility
              </h2>
              <span className="inline-flex items-center gap-xs px-sm py-0.5 rounded-full bg-success-container text-success font-label text-label-sm font-semibold">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                Verified Roster
              </span>
            </div>
            <p className="font-body text-body-md text-light-on-surface-variant m-0">
              {event.eligibility}. Your verified academic student status meets the criteria for entry.
            </p>
          </div>
        </div>

        {/* Right Column (4 cols): Sticky Registration Card */}
        <div className="lg:col-span-4 sticky top-24 flex flex-col gap-md">
          <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-lg shadow-sm">
            <div className="flex items-baseline justify-between">
              <span className="font-label text-label-md text-light-on-surface-variant">Registration Fee</span>
              <span className="font-display text-headline-md font-bold text-light-primary">
                {event.fee === 0 ? 'Free' : `LKR ${event.fee}`}
              </span>
            </div>

            {/* Capacity Progress Bar */}
            <div className="flex flex-col gap-xs">
              <div className="flex justify-between text-label-sm font-mono text-light-on-surface-variant">
                <span>Capacity</span>
                <span>{event.registered} / {event.capacity} seats</span>
              </div>
              <div className="w-full h-2 rounded-full bg-light-surface-container-high overflow-hidden">
                <div
                  className="h-full bg-light-secondary rounded-full transition-all duration-300"
                  style={{ width: `${capacityPercent}%` }}
                />
              </div>
              <span className="text-label-sm text-light-on-surface-variant">
                {remaining > 0 ? `${remaining} remaining spots available` : 'At maximum capacity'}
              </span>
            </div>

            {/* Action CTA */}
            {registration ? (
              <div className="flex flex-col gap-sm">
                <div className="p-sm rounded bg-light-surface-container-low border border-light-outline-variant flex items-center justify-between">
                  <span className="font-label text-label-sm text-light-on-surface-variant">Your Status</span>
                  <StatusChip label={registration.status} status={registration.status} />
                </div>
                <button
                  onClick={() => navigate('/my-registrations')}
                  className="w-full py-sm rounded bg-light-primary text-light-on-primary font-label text-label-lg font-semibold hover:bg-light-primary-container transition-all cursor-pointer border-0"
                >
                  Manage Registration
                </button>
              </div>
            ) : event.status === 'cancelled' ? (
              <button disabled className="w-full py-sm rounded bg-light-surface-container-high text-light-error font-label text-label-lg font-semibold cursor-not-allowed border-0">
                Event Cancelled
              </button>
            ) : event.status === 'closed' || remaining <= 0 ? (
              <button disabled className="w-full py-sm rounded bg-light-surface-container-high text-light-on-surface-variant font-label text-label-lg font-medium opacity-60 cursor-not-allowed border-0">
                Registration Closed
              </button>
            ) : (
              <button
                onClick={() => navigate(`/events/${event.id}/register`)}
                className="w-full py-sm rounded bg-light-primary text-light-on-primary font-label text-label-lg font-bold hover:bg-light-primary-container transition-all cursor-pointer border-0 shadow-md"
              >
                Register Now
              </button>
            )}

            {/* Refund & Policy Note */}
            <div className="bg-light-surface-container-low rounded p-md flex items-start gap-xs text-light-on-surface-variant">
              <span className="material-symbols-outlined text-[18px] text-light-outline shrink-0 mt-0.5">policy</span>
              <p className="font-body text-label-sm m-0 leading-relaxed">
                Full refund guaranteed if cancelled at least 48 hours prior to start time. Instant digital QR pass generated upon confirmation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default EventDetails;
