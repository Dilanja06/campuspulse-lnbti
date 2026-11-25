import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { ClubItem, EventItem, ClubPostItem } from '../types';
import { getEventCoverImage } from '../utils/eventImages';

export const ClubProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [club, setClub] = useState<ClubItem | null>(null);
  const [clubEvents, setClubEvents] = useState<EventItem[]>([]);
  const [clubPosts, setClubPosts] = useState<ClubPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState('');

  const loadClub = async () => {
    if (!id) return;
    try {
      const [c, allEvents, allPosts] = await Promise.all([
        dataService.getClubById(id),
        dataService.getEvents(),
        dataService.getClubPosts(false),
      ]);
      setClub(c);
      if (c) {
        setClubEvents(allEvents.filter((e) => e.club_id === c.id || e.club_name === c.name));
        setClubPosts(allPosts.filter((p) => p.club_id === c.id || p.club_name === c.name));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClub();
  }, [id]);

  const handleApplyToJoin = async () => {
    if (!club || !user) return;
    setApplying(true);
    try {
      await dataService.joinClub(club, {
        id: user.id,
        name: user.name,
        email: user.email,
        studentId: user.student_id || 'UG/2024/0000',
        faculty: user.faculty,
      });
      setMessage(`Membership application submitted to ${club.name}!`);
      await loadClub();
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <main className="p-xl max-w-[1100px] mx-auto text-center text-light-on-surface-variant">
          Loading club profile...
        </main>
      </AppLayout>
    );
  }

  if (!club) {
    return (
      <AppLayout>
        <main className="p-xl max-w-[900px] mx-auto text-center flex flex-col gap-md">
          <h1 className="font-headline text-headline-md m-0">Club Not Found</h1>
          <Link to="/clubs" className="text-light-primary font-label text-label-md">← Back to Clubs Directory</Link>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="p-lg md:p-xl max-w-[1200px] w-full mx-auto flex flex-col gap-xl">
        <Link to="/clubs" className="inline-flex items-center gap-xs text-light-on-surface-variant font-label text-label-md no-underline w-fit">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Clubs Directory</span>
        </Link>

        {/* Club Header Card */}
        <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-lg p-lg md:p-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-lg">
          <div className="flex flex-col gap-xs max-w-2xl">
            <div className="flex items-center gap-sm flex-wrap">
              <span className="font-label text-label-sm text-light-primary font-semibold uppercase">
                {club.category}
              </span>
              <span className="px-sm py-0.5 rounded-full bg-light-surface-container-low text-light-on-surface font-label text-label-sm">
                {club.status}
              </span>
            </div>
            <h1 className="font-headline text-headline-lg text-light-on-surface font-bold m-0">
              {club.name}
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant m-0">
              {club.description}
            </p>
            <div className="font-label text-label-md text-light-on-surface-variant pt-xs">
              Faculty Lead / President: <strong>{club.lead}</strong> · {club.member_count} active members · Annual Dues:{' '}
              <strong>{club.annual_fee > 0 ? `LKR ${club.annual_fee}` : 'Free'}</strong>
            </div>
          </div>

          <div className="shrink-0">
            {club.status === 'Not Joined' || club.status === 'Following' ? (
              <button
                type="button"
                disabled={applying}
                onClick={handleApplyToJoin}
                className="px-lg py-sm rounded bg-light-primary text-light-on-primary font-label text-label-md font-bold border-0 cursor-pointer hover:bg-light-primary-container"
              >
                {applying ? 'Submitting Application...' : 'Apply for Membership'}
              </button>
            ) : (
              <span className="px-md py-sm rounded bg-success-container text-on-success-container font-label text-label-md font-semibold">
                {club.status}
              </span>
            )}
          </div>
        </section>

        {message && (
          <div className="p-md rounded bg-success-container/30 border border-success text-on-success-container font-body text-body-md">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
          {/* Announcements & Upcoming Events */}
          <div className="lg:col-span-8 flex flex-col gap-lg">
            <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
              <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold m-0">
                Recent Club Posts &amp; Notices ({clubPosts.length})
              </h2>
              {clubPosts.length === 0 && (!club.announcements || club.announcements.length === 0) ? (
                <p className="text-light-on-surface-variant font-body text-body-md m-0">
                  No recent notices posted by {club.name}.
                </p>
              ) : (
                <div className="flex flex-col gap-sm">
                  {clubPosts.map((post) => (
                    <article key={post.id} className="p-md rounded bg-light-surface-container-low/40 border border-light-outline-variant">
                      <div className="flex items-center justify-between">
                        <h3 className="font-title text-title-md font-semibold m-0">{post.title}</h3>
                        <span className="font-label text-label-sm text-light-on-surface-variant">{post.created_at}</span>
                      </div>
                      <p className="font-body text-body-md text-light-on-surface-variant m-0 mt-xs">{post.content}</p>
                    </article>
                  ))}
                  {club.announcements?.map((ann, i) => (
                    <article key={i} className="p-md rounded bg-light-surface-container-low/40 border border-light-outline-variant">
                      <div className="flex items-center justify-between">
                        <h3 className="font-title text-title-md font-semibold m-0">{ann.title}</h3>
                        <span className="font-label text-label-sm text-light-on-surface-variant">{ann.date}</span>
                      </div>
                      <p className="font-body text-body-md text-light-on-surface-variant m-0 mt-xs">{ann.content}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="flex flex-col gap-md">
              <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold m-0">
                Events Hosted by {club.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                {clubEvents.map((ev) => (
                  <Link
                    key={ev.id}
                    to={`/events/${ev.id}`}
                    className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md overflow-hidden shadow-sm no-underline hover:border-light-primary transition-colors"
                  >
                    <img
                      src={getEventCoverImage(ev)}
                      alt={ev.title}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80';
                      }}
                    />
                    <div className="p-md">
                      <h3 className="font-title text-title-md text-light-on-surface font-semibold m-0">{ev.title}</h3>
                      <p className="font-body text-body-sm text-light-on-surface-variant m-0 mt-xs">
                        {ev.start_date} · {ev.venue}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Committee Roster */}
          <aside className="lg:col-span-4 bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
            <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold m-0">
              Executive Committee
            </h2>
            <ul className="divide-y divide-light-outline-variant m-0 p-0 list-none">
              {(club.committee && club.committee.length > 0
                ? club.committee
                : [{ name: club.lead, role: 'Club Lead' }]
              ).map((member, idx) => (
                <li key={idx} className="py-sm flex items-center justify-between">
                  <span className="font-title text-title-md text-light-on-surface font-medium">{member.name}</span>
                  <span className="font-label text-label-sm text-light-primary">{member.role}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </main>
    </AppLayout>
  );
};

export default ClubProfile;
