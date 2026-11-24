import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { StatusChip } from '../components/StatusChip';
import { currentUser } from '../data/mockData';
import { RegistrationItem, ClubItem, NotificationItem } from '../types';
import { dataService } from '../services/dataService';
import { getEventCoverImage } from '../utils/eventImages';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHome() {
      setLoading(true);
      const [regs, clubList, notifs] = await Promise.all([
        dataService.getRegistrations(),
        dataService.getClubs(),
        dataService.getNotifications(),
      ]);
      setRegistrations(regs);
      setClubs(clubList);
      setNotifications(notifs);
      setLoading(false);
    }
    loadHome();
  }, []);

  const confirmedReg = registrations.find((r) => r.status === 'confirmed');
  const pendingReg = registrations.find((r) => r.status === 'payment_pending');

  return (
    <AppLayout registrationCount={registrations.length}>
      {/* Welcome & Quick Action */}
      <div className="flex flex-wrap items-end justify-between gap-md">
        <div className="flex flex-col gap-xs">
          <div className="flex items-center gap-sm">
            <span className="text-[11px] font-bold text-light-primary bg-light-primary-container/10 border border-light-primary/20 px-2 py-0.5 rounded tracking-wide uppercase">
              LNBTI Campus
            </span>
            <span className="text-label-sm text-light-on-surface-variant font-medium">
              Japanese IT University
            </span>
          </div>
          <h1 className="font-headline text-headline-lg text-light-on-surface font-bold">
            Welcome back, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="font-body text-body-md text-light-on-surface-variant">
            {loading ? (
              'Syncing your dashboard with university records...'
            ) : pendingReg ? (
              'You have 1 pending payment hold awaiting completion.'
            ) : (
              'Your club activities and event registrations are up to date.'
            )}
          </p>
        </div>
        <Link
          to="/events"
          className="inline-flex items-center justify-center gap-xs px-md py-sm rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container transition-colors duration-state-change no-underline font-label text-label-lg font-semibold shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">explore</span>
          <span>Explore Events</span>
        </Link>
      </div>

      {/* Urgent Reminder Banner (Only rendered if actual pending payment exists in Supabase) */}
      {pendingReg && (
        <section
          aria-label="Action required"
          className="bg-warning-container text-on-warning-container rounded-md p-md flex flex-wrap items-center justify-between gap-md border border-amber-300 shadow-sm"
        >
          <div className="flex items-center gap-md">
            <span className="material-symbols-outlined text-[28px] shrink-0 text-warning" aria-hidden="true">
              timer
            </span>
            <div className="flex flex-col gap-xs">
              <span className="font-title text-title-md font-semibold">
                Payment hold active for {pendingReg.event_title}
              </span>
              <span className="font-body text-body-md tabular-nums opacity-90">
                Complete LKR {pendingReg.fee} payment to confirm your reserved seat.
              </span>
            </div>
          </div>
          <Link
            to="/payment"
            className="inline-flex items-center justify-center px-md py-xs min-h-[38px] rounded bg-light-surface-container-lowest text-light-primary border border-light-outline-variant hover:bg-light-surface-container-low transition-colors duration-state-change no-underline font-label text-label-md font-bold shadow-sm"
          >
            Complete Payment
          </Link>
        </section>
      )}

      {/* Two-Column Dashboard Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
        {/* Left Column (8 cols): Upcoming For You + Followed Clubs */}
        <div className="lg:col-span-8 flex flex-col gap-xl">
          {/* Upcoming for you section */}
          <div className="flex flex-col gap-md">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold">
                Upcoming for you
              </h2>
              {registrations.length > 0 && (
                <Link
                  to="/my-registrations"
                  className="font-label text-label-md text-light-secondary hover:underline flex items-center gap-xs no-underline font-medium"
                >
                  <span>View all ({registrations.length})</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              )}
            </div>

            {loading ? (
              <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-xl text-center">
                <p className="font-body text-body-md text-light-on-surface-variant">Loading registrations from Supabase...</p>
              </div>
            ) : registrations.length === 0 ? (
              <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-xl text-center flex flex-col items-center gap-sm shadow-sm">
                <span className="material-symbols-outlined text-[36px] text-light-outline">event_available</span>
                <span className="font-title text-title-md font-semibold text-light-on-surface">No Registered Events</span>
                <p className="font-body text-body-md text-light-on-surface-variant max-w-sm">
                  You have not registered for any events yet. Explore upcoming campus events to get started!
                </p>
                <Link
                  to="/events"
                  className="px-md py-xs rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold no-underline mt-xs"
                >
                  Browse Campus Events
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                {confirmedReg && (
                  <div 
                    onClick={() => navigate(`/events/${confirmedReg.event_id}`)}
                    className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md overflow-hidden flex flex-col justify-between shadow-sm hover:border-light-primary hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="h-40 relative overflow-hidden bg-slate-900">
                      <img
                        src={getEventCoverImage({ image_url: confirmedReg.image_url, title: confirmedReg.event_title })}
                        alt={confirmedReg.event_title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/40 p-md flex flex-col justify-between text-white">
                        <div className="flex justify-between items-start">
                          <span className="px-sm py-0.5 rounded bg-black/60 text-xs font-mono backdrop-blur-sm border border-white/10">
                            {confirmedReg.reg_code}
                          </span>
                          <StatusChip label="Confirmed" status="confirmed" />
                        </div>
                        <span className="text-xs uppercase tracking-wider text-teal-300 font-semibold truncate drop-shadow">
                          {confirmedReg.club_name}
                        </span>
                      </div>
                    </div>

                    <div className="p-lg flex flex-col gap-sm flex-1">
                      <h3 className="font-headline text-title-lg text-light-on-surface font-semibold line-clamp-1 group-hover:text-light-primary transition-colors">
                        {confirmedReg.event_title}
                      </h3>

                      <div className="flex flex-col gap-xs text-light-on-surface-variant text-body-md">
                        <div className="flex items-center gap-xs">
                          <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                          <span>{confirmedReg.date} · {confirmedReg.time}</span>
                        </div>
                        <div className="flex items-center gap-xs">
                          <span className="material-symbols-outlined text-[18px]">location_on</span>
                          <span className="truncate">{confirmedReg.venue}</span>
                        </div>
                      </div>
                    </div>

                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="p-md bg-light-surface-container-low border-t border-light-outline-variant flex items-center justify-between"
                    >
                      <span className="text-label-sm font-label text-success font-semibold flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        <span>Verified Pass</span>
                      </span>
                      <button
                        onClick={() => navigate('/my-qr')}
                        className="px-md py-xs rounded bg-light-secondary text-light-on-secondary font-label text-label-md font-semibold hover:opacity-95 cursor-pointer border-0 flex items-center gap-xs"
                      >
                        <span className="material-symbols-outlined text-[18px]">qr_code</span>
                        <span>View QR</span>
                      </button>
                    </div>
                  </div>
                )}

                {pendingReg && (
                  <div 
                    onClick={() => navigate(`/events/${pendingReg.event_id}`)}
                    className="bg-light-surface-container-lowest border border-amber-300 rounded-md overflow-hidden flex flex-col justify-between shadow-sm hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="h-40 relative overflow-hidden bg-amber-950">
                      <img
                        src={getEventCoverImage({ image_url: pendingReg.image_url, title: pendingReg.event_title })}
                        alt={pendingReg.event_title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/40 p-md flex flex-col justify-between text-white">
                        <div className="flex justify-between items-start">
                          <span className="px-sm py-0.5 rounded bg-black/60 text-xs font-mono backdrop-blur-sm border border-white/10">
                            {pendingReg.reg_code}
                          </span>
                          <StatusChip label="Payment Pending" status="payment_pending" />
                        </div>
                        <span className="text-xs uppercase tracking-wider text-amber-300 font-semibold truncate drop-shadow">
                          {pendingReg.club_name}
                        </span>
                      </div>
                    </div>

                    <div className="p-lg flex flex-col gap-sm flex-1">
                      <h3 className="font-headline text-title-lg text-light-on-surface font-semibold line-clamp-1 group-hover:text-light-primary transition-colors">
                        {pendingReg.event_title}
                      </h3>

                      <div className="flex flex-col gap-xs text-light-on-surface-variant text-body-md">
                        <div className="flex items-center gap-xs">
                          <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                          <span>{pendingReg.date} · {pendingReg.time}</span>
                        </div>
                        <div className="flex items-center gap-xs">
                          <span className="material-symbols-outlined text-[18px]">location_on</span>
                          <span className="truncate">{pendingReg.venue}</span>
                        </div>
                      </div>
                    </div>

                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="p-md bg-warning-container/30 border-t border-amber-200 flex items-center justify-between"
                    >
                      <span className="text-title-md font-mono font-bold text-light-primary">
                        LKR {pendingReg.fee}
                      </span>
                      <button
                        onClick={() => navigate('/payment')}
                        className="px-md py-xs rounded bg-warning text-on-warning font-label text-label-md font-semibold hover:opacity-95 cursor-pointer border-0 flex items-center gap-xs shadow-sm"
                      >
                        <span>Pay Now</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Followed Clubs Section */}
          <div className="flex flex-col gap-md">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold">
                Your Club Communities
              </h2>
              {clubs.length > 0 && (
                <Link to="/clubs" className="font-label text-label-md text-light-secondary hover:underline flex items-center gap-xs no-underline font-medium">
                  <span>All Clubs Directory</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              )}
            </div>

            {loading ? (
              <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg text-center text-body-md text-light-on-surface-variant">
                Loading clubs from Supabase...
              </div>
            ) : clubs.length === 0 ? (
              <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg text-center text-body-md text-light-on-surface-variant">
                No clubs found in the database.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
                {clubs.slice(0, 3).map((club) => (
                  <div
                    key={club.id}
                    className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-md flex flex-col justify-between gap-md hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-sm">
                      <div className="w-10 h-10 rounded-full bg-light-primary-container text-light-on-primary-container flex items-center justify-center font-bold text-sm shrink-0">
                        {club.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-headline text-title-md text-light-on-surface font-semibold truncate">
                          {club.name}
                        </span>
                        <span className="font-mono text-label-sm text-light-on-surface-variant">
                          {club.member_count} members
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/clubs/${club.id}`)}
                      className="w-full py-xs rounded bg-light-surface-container-low text-light-primary border border-light-outline-variant font-label text-label-md font-medium hover:bg-light-surface-container transition-colors cursor-pointer"
                    >
                      View Club
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Announcements & Quick Access */}
        <div className="lg:col-span-4 flex flex-col gap-lg">
          {/* Announcements Card */}
          <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
            <div className="flex items-center gap-xs text-light-primary">
              <span className="material-symbols-outlined text-[22px]">campaign</span>
              <h2 className="font-headline text-title-lg font-semibold text-light-on-surface m-0">
                Official Bulletins
              </h2>
            </div>

            {notifications.length === 0 ? (
              <p className="font-body text-body-md text-light-on-surface-variant m-0">
                No bulletins published yet.
              </p>
            ) : (
              <div className="flex flex-col divide-y divide-light-outline-variant">
                {notifications.slice(0, 3).map((notif) => (
                  <div key={notif.id} className="py-md flex flex-col gap-xs first:pt-0">
                    <div className="flex justify-between items-center text-label-sm">
                      <span className="text-light-secondary font-semibold">{notif.type}</span>
                      <span className="font-mono text-light-on-surface-variant">{notif.timestamp}</span>
                    </div>
                    <h4 className="font-title text-title-md font-medium text-light-on-surface m-0">
                      {notif.title}
                    </h4>
                    <p className="font-body text-body-md text-light-on-surface-variant m-0">
                      {notif.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Access Action Card */}
          <div className="bg-light-primary text-light-on-primary rounded-md p-lg flex flex-col gap-md shadow-sm">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-[24px]">qr_code_scanner</span>
              <span className="font-headline text-title-md font-semibold">Digital Attendance Pass</span>
            </div>
            <p className="font-body text-body-md opacity-90 m-0">
              Show your cryptographic dynamic QR pass at the entrance of confirmed events for verified check-in.
            </p>
            <button
              onClick={() => navigate('/my-qr')}
              className="w-full py-sm rounded bg-light-secondary-container text-light-on-secondary-container font-label text-label-lg font-bold hover:opacity-95 transition-all cursor-pointer border-0 mt-xs"
            >
              Open Active QR Pass
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Home;
