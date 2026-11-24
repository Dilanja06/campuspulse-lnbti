import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { StatusChip } from '../components/StatusChip';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { EventItem, RegistrationItem, NotificationItem, ClubItem } from '../types';
import { getEventCoverImage } from '../utils/eventImages';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [evList, regList, notifList, clubList] = await Promise.all([
          dataService.getEvents(),
          dataService.getRegistrations({ userId: user?.id, userEmail: user?.email }),
          dataService.getNotifications(user?.id),
          dataService.getClubs(),
        ]);
        setEvents(evList.filter((e) => e.status === 'published'));
        setRegistrations(regList.filter((r) => r.status !== 'cancelled' && r.status !== 'rejected'));
        setNotifications(notifList);
        setClubs(clubList);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, [user?.id, user?.email]);

  const paymentPendingRegs = registrations.filter((r) => r.status === 'payment_pending');
  const confirmedRegs = registrations.filter((r) => r.status === 'confirmed' || r.status === 'checked_in');
  const unreadNotifs = notifications.filter((n) => !n.read);

  return (
    <AppLayout>
      <main className="p-lg md:p-xl max-w-[1400px] w-full mx-auto flex flex-col gap-xl">
        {/* Welcome Hero */}
        <section className="rounded-lg bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-lg">
          <div className="flex flex-col gap-xs max-w-2xl">
            <span className="font-label text-label-sm uppercase tracking-wider text-teal-300 font-semibold">
              Student Portal · {user?.faculty || 'Faculty of Computing & Engineering'}
            </span>
            <h1 className="font-headline text-headline-lg font-bold m-0 text-white">
              Welcome back, {user?.name || 'Student Member'}
            </h1>
            <p className="font-body text-body-md text-slate-300 m-0">
              Discover university clubs, register for verified campus events, manage ticket holds, and access your dynamic check-in QR passes.
            </p>
          </div>
          <div className="flex flex-wrap gap-sm shrink-0">
            <Link
              to="/events"
              className="px-md py-sm rounded bg-teal-500 text-slate-950 font-label text-label-md font-bold no-underline hover:bg-teal-400 transition-colors"
            >
              Explore Events
            </Link>
            <Link
              to="/my-qr"
              className="px-md py-sm rounded bg-white/10 text-white border border-white/25 font-label text-label-md font-semibold no-underline hover:bg-white/20 transition-colors"
            >
              Open My QR Pass
            </Link>
          </div>
        </section>

        {/* Active Payment Hold Alert Banner */}
        {paymentPendingRegs.length > 0 && (
          <section className="bg-warning-container/40 border border-warning rounded-md p-md flex flex-col sm:flex-row sm:items-center justify-between gap-md">
            <div className="flex items-start gap-sm text-on-warning-container">
              <span className="material-symbols-outlined text-[24px] shrink-0 mt-0.5">timer</span>
              <div>
                <h2 className="font-title text-title-md font-semibold m-0">
                  Payment Hold Active ({paymentPendingRegs.length})
                </h2>
                <p className="font-body text-body-sm m-0">
                  Complete payment verification for <strong>{paymentPendingRegs[0].event_title}</strong> ({paymentPendingRegs[0].reg_code}) before your seat hold expires.
                </p>
              </div>
            </div>
            <Link
              to={`/payments?reg=${paymentPendingRegs[0].reg_code}&event=${encodeURIComponent(paymentPendingRegs[0].event_title)}&amount=${paymentPendingRegs[0].fee}`}
              className="px-md py-xs rounded bg-warning text-slate-950 font-label text-label-md font-bold no-underline shrink-0 self-start sm:self-center"
            >
              Complete Payment →
            </Link>
          </section>
        )}

        {/* Quick Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
          <Link
            to="/my-registrations"
            className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-xs shadow-sm no-underline hover:border-light-primary transition-colors"
          >
            <span className="font-label text-label-md text-light-on-surface-variant">Active Registrations</span>
            <span className="font-headline text-display-sm text-light-primary font-bold tabular-nums">
              {registrations.length}
            </span>
            <span className="font-label text-label-sm text-light-on-surface-variant">
              {confirmedRegs.length} confirmed · {paymentPendingRegs.length} payment pending
            </span>
          </Link>

          <Link
            to="/events"
            className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-xs shadow-sm no-underline hover:border-light-primary transition-colors"
          >
            <span className="font-label text-label-md text-light-on-surface-variant">Open Campus Events</span>
            <span className="font-headline text-display-sm text-success font-bold tabular-nums">
              {events.length}
            </span>
            <span className="font-label text-label-sm text-light-on-surface-variant">
              Published for student sign-up
            </span>
          </Link>

          <Link
            to="/clubs"
            className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-xs shadow-sm no-underline hover:border-light-primary transition-colors"
          >
            <span className="font-label text-label-md text-light-on-surface-variant">Joined &amp; Followed Clubs</span>
            <span className="font-headline text-display-sm text-info-primary font-bold tabular-nums">
              {clubs.filter((c) => c.status === 'Active Member' || c.status === 'Following').length}
            </span>
            <span className="font-label text-label-sm text-light-on-surface-variant">
              Across {clubs.length} university societies
            </span>
          </Link>

          <Link
            to="/notifications"
            className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-xs shadow-sm no-underline hover:border-light-primary transition-colors"
          >
            <span className="font-label text-label-md text-light-on-surface-variant">Unread Notifications</span>
            <span className="font-headline text-display-sm text-warning font-bold tabular-nums">
              {unreadNotifs.length}
            </span>
            <span className="font-label text-label-sm text-light-on-surface-variant">
              Alerts &amp; approval notices
            </span>
          </Link>
        </section>

        {/* Two-column body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
          {/* Featured Events */}
          <section className="lg:col-span-8 flex flex-col gap-md">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold m-0">
                Featured Campus Events
              </h2>
              <Link to="/events" className="font-label text-label-md text-light-primary no-underline hover:underline">
                View All Events →
              </Link>
            </div>

            {loading ? (
              <div className="p-xl text-center text-light-on-surface-variant">Loading upcoming events...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                {events.slice(0, 4).map((ev) => {
                  const userReg = registrations.find((r) => r.event_id === ev.id);
                  return (
                    <article
                      key={ev.id}
                      className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md overflow-hidden shadow-sm flex flex-col"
                    >
                      <div className="h-36 relative bg-slate-900 overflow-hidden">
                        <img
                          src={getEventCoverImage(ev)}
                          alt={ev.title}
                          className="w-full h-full object-cover"
                        />
                        {userReg && (
                          <div className="absolute top-2 right-2">
                            <StatusChip
                              label={userReg.status === 'checked_in' ? 'Checked In' : userReg.status.replace('_', ' ')}
                              status={userReg.status === 'checked_in' ? 'confirmed' : userReg.status}
                            />
                          </div>
                        )}
                      </div>
                      <div className="p-md flex flex-col gap-xs flex-1 justify-between">
                        <div>
                          <span className="font-label text-label-sm text-light-primary font-semibold">
                            {ev.category} · {ev.club_name}
                          </span>
                          <h3 className="font-title text-title-md text-light-on-surface font-semibold m-0 mt-0.5">
                            {ev.title}
                          </h3>
                          <p className="font-body text-body-sm text-light-on-surface-variant m-0 mt-1">
                            {ev.start_date} · {ev.venue}
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-sm border-t border-light-outline-variant mt-sm">
                          <span className="font-mono text-mono-sm font-bold text-light-on-surface">
                            {ev.fee > 0 ? `LKR ${ev.fee}` : 'Free'}
                          </span>
                          <Link
                            to={`/events/${ev.id}`}
                            className="font-label text-label-md text-light-primary font-semibold no-underline hover:underline"
                          >
                            {userReg ? 'View Ticket →' : 'Details →'}
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Latest Notifications */}
          <aside className="lg:col-span-4 bg-light-surface-container-lowest border border-light-outline-variant rounded-md shadow-sm overflow-hidden">
            <div className="px-lg py-md border-b border-light-outline-variant flex items-center justify-between bg-light-surface-container-low/50">
              <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold m-0">
                Recent Alerts
              </h2>
              <Link to="/notifications" className="font-label text-label-md text-light-primary no-underline hover:underline">
                View All
              </Link>
            </div>
            <div className="divide-y divide-light-outline-variant">
              {notifications.slice(0, 4).map((n) => (
                <div key={n.id} className="p-md flex flex-col gap-xs">
                  <div className="flex items-center justify-between gap-xs">
                    <span className="font-title text-title-sm text-light-on-surface font-semibold">
                      {n.title}
                    </span>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-light-primary shrink-0" />}
                  </div>
                  <p className="font-body text-body-sm text-light-on-surface-variant m-0 line-clamp-2">
                    {n.description}
                  </p>
                  <span className="font-label text-label-sm text-light-on-surface-variant">{n.timestamp}</span>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="p-lg text-center text-light-on-surface-variant font-body text-body-sm">
                  You have no notifications.
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </AppLayout>
  );
};

export default Home;
