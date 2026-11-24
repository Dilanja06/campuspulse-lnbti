import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { StatusChip } from '../components/StatusChip';
import { ClubItem, EventItem } from '../types';
import { dataService } from '../services/dataService';
import { getEventCoverImage } from '../utils/eventImages';

export const ClubProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [club, setClub] = useState<ClubItem | null>(null);
  const [clubEvents, setClubEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(true);

  useEffect(() => {
    async function loadClubData() {
      if (!id) return;
      setLoading(true);
      const [clubData, allEvents] = await Promise.all([
        dataService.getClubById(id),
        dataService.getEvents(),
      ]);
      setClub(clubData);
      setClubEvents(allEvents.filter((e) => e.club_id === id));
      setLoading(false);
    }
    loadClubData();
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="py-2xl text-center">
          <p className="font-body text-body-lg text-light-on-surface-variant">Loading club details from Supabase...</p>
        </div>
      </AppLayout>
    );
  }

  if (!club) {
    return (
      <AppLayout>
        <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-2xl text-center flex flex-col items-center gap-md">
          <span className="material-symbols-outlined text-[48px] text-light-outline">groups</span>
          <h2 className="font-headline text-headline-sm font-bold text-light-on-surface m-0">Club Not Found</h2>
          <p className="font-body text-body-md text-light-on-surface-variant max-w-md m-0">
            The requested club could not be found in the university portal.
          </p>
          <Link to="/clubs" className="px-md py-sm rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold no-underline">
            Back to Clubs Directory
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/clubs"
          className="inline-flex items-center gap-xs font-label text-label-md text-light-primary hover:underline no-underline"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to clubs</span>
        </Link>
        <StatusChip label={club.status} status={club.status === 'Active Member' ? 'confirmed' : 'info'} />
      </div>

      {/* Club Profile Header */}
      <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col md:flex-row md:items-center justify-between gap-lg shadow-sm">
        <div className="flex items-start gap-lg">
          <div className="w-16 h-16 rounded-xl bg-light-primary text-light-on-primary flex items-center justify-center font-headline text-headline-md font-bold shrink-0 shadow-md">
            {club.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col gap-xs">
            <div className="flex items-center gap-sm">
              <span className="text-label-sm font-label text-light-secondary font-semibold uppercase tracking-wider">
                {club.category}
              </span>
              <span className="font-mono text-label-sm text-light-on-surface-variant">
                · {club.member_count} Members
              </span>
            </div>
            <h1 className="font-headline text-headline-md font-bold text-light-on-surface m-0">
              {club.name}
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant max-w-2xl m-0">
              {club.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-sm shrink-0">
          <button
            onClick={() => setFollowing(!following)}
            className={`px-md py-sm rounded font-label text-label-md font-semibold flex items-center gap-xs cursor-pointer transition-all ${
              following
                ? 'bg-light-surface-container-low text-light-primary border border-light-outline-variant hover:bg-light-surface-container'
                : 'bg-light-primary text-light-on-primary border-0'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {following ? 'notifications_active' : 'notifications'}
            </span>
            <span>{following ? 'Following' : 'Follow Club'}</span>
          </button>
        </div>
      </div>

      {/* 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
        {/* Left Column (8 cols): Upcoming Events & Posts */}
        <div className="lg:col-span-8 flex flex-col gap-xl">
          {/* Upcoming Events */}
          <div className="flex flex-col gap-md">
            <h2 className="font-headline text-headline-sm font-semibold text-light-on-surface m-0">
              Upcoming Club Events
            </h2>

            {clubEvents.length === 0 ? (
              <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg text-center text-body-md text-light-on-surface-variant">
                No scheduled events for this club right now.
              </div>
            ) : (
              clubEvents.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => navigate(`/events/${ev.id}`)}
                  className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-md flex flex-col sm:flex-row sm:items-center justify-between gap-md shadow-sm hover:border-light-primary transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-md">
                    <img
                      src={getEventCoverImage(ev)}
                      alt={ev.title}
                      className="w-14 h-14 rounded object-cover shrink-0 border border-light-outline-variant"
                    />
                    <div className="flex flex-col">
                      <h3 className="font-headline text-title-md font-semibold text-light-on-surface m-0 group-hover:text-light-primary transition-colors">
                        {ev.title}
                      </h3>
                      <span className="font-body text-label-sm text-light-on-surface-variant">
                        {ev.start_date} · {ev.venue}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/events/${ev.id}`);
                    }}
                    className="px-md py-xs rounded bg-light-surface-container-low text-light-primary border border-light-outline-variant font-label text-label-md font-semibold hover:bg-light-surface-container cursor-pointer shrink-0"
                  >
                    View Details
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Information Panel */}
        <div className="lg:col-span-4 flex flex-col gap-md">
          <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
            <h2 className="font-headline text-title-lg font-semibold text-light-on-surface m-0">
              Club Administration
            </h2>

            <div className="pt-xs flex flex-col gap-sm text-body-md text-light-on-surface-variant">
              <div className="flex justify-between">
                <span>Annual Fee:</span>
                <span className="font-mono font-semibold text-light-on-surface">LKR {club.annual_fee}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Members:</span>
                <span className="font-mono font-semibold text-light-on-surface">{club.member_count}</span>
              </div>
              <div className="flex flex-col gap-0.5 border-t border-light-outline-variant pt-sm">
                <span className="text-label-sm font-label text-light-on-surface-variant">Club Advisor:</span>
                <span className="font-semibold text-light-on-surface">{club.lead}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ClubProfile;
