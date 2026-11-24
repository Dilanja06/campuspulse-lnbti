import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { StatusChip } from '../components/StatusChip';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { EventItem, RegistrationItem, ClubPostItem } from '../types';
import { getEventCoverImage } from '../utils/eventImages';

export const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [userRegistration, setUserRegistration] = useState<RegistrationItem | null>(null);
  const [attendees, setAttendees] = useState<RegistrationItem[]>([]);
  const [posts, setPosts] = useState<ClubPostItem[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'attendees'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      if (!id) return;
      try {
        const [ev, userRegs, evRegs, allPosts] = await Promise.all([
          dataService.getEventById(id),
          dataService.getRegistrations({ userId: user?.id, userEmail: user?.email }),
          dataService.getRegistrationsByEvent(id),
          dataService.getClubPosts(false),
        ]);
        setEvent(ev);

        const activeReg = userRegs.find(
          (r) => r.event_id === id && r.status !== 'cancelled' && r.status !== 'rejected'
        );
        setUserRegistration(activeReg || null);

        setAttendees(
          evRegs.filter((r) => r.status === 'confirmed' || r.status === 'checked_in')
        );
        if (ev) {
          setPosts(allPosts.filter((p) => p.club_id === ev.club_id || p.club_name === ev.club_name));
        }
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [id, user?.id, user?.email]);

  if (loading) {
    return (
      <AppLayout>
        <main className="p-xl max-w-[1100px] mx-auto text-center text-light-on-surface-variant">
          Loading event details...
        </main>
      </AppLayout>
    );
  }

  if (!event) {
    return (
      <AppLayout>
        <main className="p-xl max-w-[900px] mx-auto text-center flex flex-col gap-md">
          <h1 className="font-headline text-headline-md text-light-on-surface font-semibold">
            Event Edition Not Found
          </h1>
          <Link to="/events" className="text-light-primary font-label text-label-md no-underline">
            ← Back to Explore Events
          </Link>
        </main>
      </AppLayout>
    );
  }

  const seatsLeft = Math.max(0, event.capacity - event.registered);
  const canRegister = event.status === 'published' && seatsLeft > 0 && !userRegistration;

  return (
    <AppLayout>
      <main className="p-lg md:p-xl max-w-[1200px] w-full mx-auto flex flex-col gap-xl">
        <div className="flex items-center gap-xs text-label-md text-light-on-surface-variant">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-xs bg-transparent border-0 text-light-on-surface-variant hover:text-light-on-surface cursor-pointer p-0 font-label text-label-md"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Events</span>
          </button>
          <span>/</span>
          <span className="font-mono text-light-primary">{event.code}</span>
        </div>

        {/* Hero Card */}
        <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-lg overflow-hidden shadow-sm">
          <div className="h-56 md:h-72 relative bg-slate-900">
            <img
              src={getEventCoverImage(event)}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-lg md:p-xl text-white">
              <div className="flex items-center gap-sm flex-wrap mb-xs">
                <span className="px-sm py-0.5 rounded bg-teal-500 text-slate-950 font-label text-label-sm font-bold">
                  {event.category}
                </span>
                <span className="font-label text-label-md text-slate-200">{event.club_name}</span>
                {event.manual_approval && (
                  <span className="px-sm py-0.5 rounded bg-amber-400/90 text-slate-950 font-label text-label-sm font-bold">
                    Organizer Screening Enabled
                  </span>
                )}
              </div>
              <h1 className="font-headline text-headline-lg md:text-display-sm font-bold m-0 text-white">
                {event.title}
              </h1>
            </div>
          </div>

          {event.status === 'cancelled' && (
            <div className="p-md bg-light-error-container text-light-on-error-container font-body text-body-md flex items-center gap-sm">
              <span className="material-symbols-outlined">cancel</span>
              <span>
                <strong>Event Cancelled:</strong> {event.cancellation_reason || 'Cancelled by organizing club.'}
              </span>
            </div>
          )}

          {/* Action / Tabs Bar */}
          <div className="px-lg py-md border-b border-light-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-md">
            <div className="flex gap-md">
              {[
                { key: 'overview' as const, label: 'Details & Schedule' },
                { key: 'posts' as const, label: `Club Posts (${posts.length})` },
                { key: 'attendees' as const, label: `Confirmed Attendees (${attendees.length})` },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTab(t.key)}
                  className={`py-xs px-sm border-b-2 font-label text-label-md font-semibold bg-transparent border-t-0 border-l-0 border-r-0 cursor-pointer transition-colors ${
                    activeTab === t.key
                      ? 'border-light-primary text-light-primary'
                      : 'border-transparent text-light-on-surface-variant hover:text-light-on-surface'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-md">
              {userRegistration ? (
                <div className="flex items-center gap-sm">
                  <StatusChip
                    label={userRegistration.status === 'checked_in' ? 'Checked In' : userRegistration.status.replace('_', ' ')}
                    status={userRegistration.status === 'checked_in' ? 'confirmed' : userRegistration.status}
                  />
                  <Link
                    to={userRegistration.status === 'payment_pending' ? '/payments' : '/my-qr'}
                    className="px-md py-xs rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold no-underline"
                  >
                    {userRegistration.status === 'payment_pending' ? 'Complete Payment' : 'View QR Ticket'}
                  </Link>
                </div>
              ) : canRegister ? (
                <Link
                  to={`/events/${event.id}/register`}
                  className="px-lg py-sm rounded bg-light-primary text-light-on-primary font-label text-label-lg font-semibold no-underline hover:bg-light-primary-container"
                >
                  Register Now · {event.fee > 0 ? `LKR ${event.fee}` : 'Free'}
                </Link>
              ) : (
                <span className="px-md py-xs rounded bg-light-surface-container text-light-on-surface-variant font-label text-label-md font-semibold">
                  {event.status === 'cancelled'
                    ? 'Event Cancelled'
                    : event.status === 'closed'
                    ? 'Registrations Closed'
                    : 'Capacity Reached'}
                </span>
              )}
            </div>
          </div>

          {/* Tab Body */}
          <div className="p-lg md:p-xl grid grid-cols-1 lg:grid-cols-12 gap-xl">
            <div className="lg:col-span-8 flex flex-col gap-lg">
              {activeTab === 'overview' && (
                <>
                  <section>
                    <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold m-0 mb-xs">
                      About This Event
                    </h2>
                    <p className="font-body text-body-md text-light-on-surface-variant m-0 leading-relaxed">
                      {event.description}
                    </p>
                  </section>

                  {event.manual_approval && (
                    <div className="p-md rounded bg-info-container/40 border border-info-container text-on-info-container text-body-md flex items-start gap-sm">
                      <span className="material-symbols-outlined shrink-0 mt-0.5">verified_user</span>
                      <span>
                        <strong>Manual Screening Notice:</strong> Submitting a registration form places your entry in <em>Pending Approval</em> until reviewed by the organizing club officer.
                      </span>
                    </div>
                  )}

                  {event.schedule && event.schedule.length > 0 && (
                    <section>
                      <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold m-0 mb-md">
                        Event Schedule
                      </h2>
                      <div className="flex flex-col gap-sm">
                        {event.schedule.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-md rounded bg-light-surface-container-low/50 border border-light-outline-variant flex flex-col sm:flex-row sm:items-center gap-md"
                          >
                            <span className="font-mono text-mono-md text-light-primary font-semibold shrink-0 w-24">
                              {item.time}
                            </span>
                            <div>
                              <h3 className="font-title text-title-md text-light-on-surface font-semibold m-0">
                                {item.title}
                              </h3>
                              <p className="font-body text-body-sm text-light-on-surface-variant m-0">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}

              {activeTab === 'posts' && (
                <section className="flex flex-col gap-md">
                  <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold m-0">
                    Organizing Club Announcements
                  </h2>
                  {posts.length === 0 ? (
                    <p className="text-light-on-surface-variant font-body text-body-md">
                      No announcements published by {event.club_name} yet.
                    </p>
                  ) : (
                    posts.map((post) => (
                      <article
                        key={post.id}
                        className="p-md rounded bg-light-surface-container-low/40 border border-light-outline-variant flex flex-col gap-xs"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-title text-title-md font-semibold m-0">{post.title}</h3>
                          <span className="font-label text-label-sm text-light-on-surface-variant">
                            {post.created_at}
                          </span>
                        </div>
                        <p className="font-body text-body-md text-light-on-surface-variant m-0">
                          {post.content}
                        </p>
                      </article>
                    ))
                  )}
                </section>
              )}

              {activeTab === 'attendees' && (
                <section className="flex flex-col gap-md">
                  <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold m-0">
                    Confirmed Participant Roster
                  </h2>
                  {attendees.length === 0 ? (
                    <p className="text-light-on-surface-variant font-body text-body-md">
                      No confirmed attendees listed publicly yet.
                    </p>
                  ) : (
                    <ul className="divide-y divide-light-outline-variant border border-light-outline-variant rounded">
                      {attendees.map((att) => (
                        <li key={att.id} className="p-md flex items-center justify-between">
                          <div>
                            <div className="font-title text-title-sm font-semibold">{att.user_name || 'Student Member'}</div>
                            <div className="font-label text-label-sm text-light-on-surface-variant">{att.activity || 'Participant'}</div>
                          </div>
                          <span className="font-mono text-mono-sm text-light-on-surface-variant">Confirmed</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}
            </div>

            {/* Event Meta Sidebar */}
            <aside className="lg:col-span-4 bg-light-surface-container-low/40 border border-light-outline-variant rounded-md p-lg flex flex-col gap-md h-fit">
              <h2 className="font-title text-title-md text-light-on-surface font-semibold m-0">
                Key Information
              </h2>
              <dl className="flex flex-col gap-sm text-body-md m-0">
                <div className="flex justify-between">
                  <dt className="text-light-on-surface-variant">Date</dt>
                  <dd className="font-semibold m-0">{event.start_date}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-light-on-surface-variant">Time</dt>
                  <dd className="font-semibold m-0">{event.time}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-light-on-surface-variant">Venue</dt>
                  <dd className="font-semibold m-0 text-right">{event.venue}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-light-on-surface-variant">Eligibility</dt>
                  <dd className="font-semibold m-0 text-right">{event.eligibility}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-light-on-surface-variant">Seats Remaining</dt>
                  <dd className="font-semibold m-0 tabular-nums">{seatsLeft} / {event.capacity}</dd>
                </div>
                <div className="flex justify-between pt-sm border-t border-light-outline-variant">
                  <dt className="text-light-on-surface-variant">Fee</dt>
                  <dd className="font-mono font-bold text-light-primary m-0">
                    {event.fee > 0 ? `LKR ${event.fee.toLocaleString()}` : 'Free'}
                  </dd>
                </div>
              </dl>
              {event.refund_policy && (
                <div className="text-label-sm text-light-on-surface-variant pt-sm border-t border-light-outline-variant">
                  <strong>Refund Policy:</strong> {event.refund_policy}
                </div>
              )}
            </aside>
          </div>
        </section>
      </main>
    </AppLayout>
  );
};

export default EventDetails;
