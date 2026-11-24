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
  const [recentPayment, setRecentPayment] = useState<{
    event_title: string;
    amount: number;
    reg_code?: string;
    event_id?: string;
  } | null>(null);

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

      // Check for recently confirmed payment
      try {
        const raw = localStorage.getItem('lnbti_recent_payment');
        if (raw) {
          const parsed = JSON.parse(raw);
          // Show for 30 minutes after payment
          if (Date.now() - (parsed.timestamp || 0) < 30 * 60 * 1000) {
            setRecentPayment(parsed);
          }
        }
      } catch (e) {
        console.warn('recent payment check error:', e);
      }

      setLoading(false);
    }
    loadHome();
  }, []);

  const pendingReg = registrations.find((r) => r.status === 'payment_pending');
  const displayedRegistrations = registrations
    .filter((r) => r.status === 'confirmed' || r.status === 'payment_pending')
    .slice(0, 2);

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

      {/* Payment Status Banner: Shows Confirmed State if recently paid, or Hold Warning if pending */}
      {recentPayment ? (
        <section
          aria-label="Payment Confirmed"
          className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 rounded-md p-md flex flex-wrap items-center justify-between gap-md border border-emerald-300 dark:border-emerald-700/60 shadow-sm transition-all animate-fadeIn"
        >
          <div className="flex items-center gap-md">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
                verified
              </span>
            </div>
            <div className="flex flex-col gap-xs">
              <div className="flex items-center gap-sm flex-wrap">
                <span className="font-title text-title-md font-bold text-emerald-950 dark:text-emerald-100">
                  Payment Confirmed: {recentPayment.event_title}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 font-mono font-bold">
                  LKR {recentPayment.amount.toFixed(2)} PAID
                </span>
              </div>
              <span className="font-body text-body-md opacity-90">
                Your payment hold was converted into a verified seat reservation. Attendance QR Pass is now live!
              </span>
            </div>
          </div>
          <div className="flex items-center gap-sm">
            <Link
              to="/my-qr"
              className="inline-flex items-center justify-center gap-xs px-md py-xs min-h-[38px] rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors duration-state-change no-underline font-label text-label-md font-bold shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">qr_code</span>
              <span>View Attendance QR</span>
            </Link>
            <Link
              to="/payment"
              className="inline-flex items-center justify-center px-md py-xs min-h-[38px] rounded bg-light-surface-container-lowest text-light-primary border border-light-outline-variant hover:bg-light-surface-container-low transition-colors no-underline font-label text-label-md font-medium"
            >
              Receipt
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('lnbti_recent_payment');
                setRecentPayment(null);
              }}
              title="Dismiss banner"
              className="p-1 rounded text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200/50 dark:hover:bg-emerald-800/50 border-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </section>
      ) : pendingReg ? (
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
      ) : null}

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
                {displayedRegistrations.map((reg) => {
                  const isConfirmed = reg.status === 'confirmed';

                  return (
                    <div
                      key={reg.id}
                      onClick={() => navigate(`/events/${reg.event_id}`)}
                      className={`bg-light-surface-container-lowest border rounded-md overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all cursor-pointer group ${
                        isConfirmed
                          ? 'border-light-outline-variant hover:border-light-primary'
                          : 'border-amber-300 hover:border-amber-500'
                      }`}
                    >
                      <div className={`h-40 relative overflow-hidden ${isConfirmed ? 'bg-slate-900' : 'bg-amber-950'}`}>
                        <img
                          src={getEventCoverImage({ image_url: reg.image_url, title: reg.event_title })}
                          alt={reg.event_title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/40 p-md flex flex-col justify-between text-white">
                          <div className="flex justify-between items-start">
                            <span className="px-sm py-0.5 rounded bg-black/60 text-xs font-mono backdrop-blur-sm border border-white/10">
                              {reg.reg_code}
                            </span>
                            <StatusChip
                              label={isConfirmed ? 'Confirmed' : 'Payment Pending'}
                              status={isConfirmed ? 'confirmed' : 'payment_pending'}
                            />
                          </div>
                          <span
                            className={`text-xs uppercase tracking-wider font-semibold truncate drop-shadow ${
                              isConfirmed ? 'text-teal-300' : 'text-amber-300'
                            }`}
                          >
                            {reg.club_name}
                          </span>
                        </div>
                      </div>

                      <div className="p-lg flex flex-col gap-sm flex-1">
                        <h3 className="font-headline text-title-lg text-light-on-surface font-semibold line-clamp-1 group-hover:text-light-primary transition-colors">
                          {reg.event_title}
                        </h3>

                        <div className="flex flex-col gap-xs text-light-on-surface-variant text-body-md">
                          <div className="flex items-center gap-xs">
                            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                            <span>
                              {reg.date} · {reg.time}
                            </span>
                          </div>
                          <div className="flex items-center gap-xs">
                            <span className="material-symbols-outlined text-[18px]">location_on</span>
                            <span className="truncate">{reg.venue}</span>
                          </div>
                        </div>
                      </div>

                      <div
                        onClick={(e) => e.stopPropagation()}
                        className={`p-md border-t flex items-center justify-between ${
                          isConfirmed
                            ? 'bg-light-surface-container-low border-light-outline-variant'
                            : 'bg-warning-container/30 border-amber-200'
                        }`}
                      >
                        {isConfirmed ? (
                          <>
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
                          </>
                        ) : (
                          <>
                            <span className="text-title-md font-mono font-bold text-light-primary">
                              LKR {reg.fee}
                            </span>
                            <button
                              onClick={() => navigate('/payment')}
                              className="px-md py-xs rounded bg-warning text-on-warning font-label text-label-md font-semibold hover:opacity-95 cursor-pointer border-0 flex items-center gap-xs shadow-sm"
                            >
                              <span>Pay Now</span>
                              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
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
