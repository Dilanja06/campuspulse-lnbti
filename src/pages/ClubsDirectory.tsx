import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { StatusChip } from '../components/StatusChip';
import { ClubItem } from '../types';
import { dataService } from '../services/dataService';

export const ClubsDirectory: React.FC = () => {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    async function loadClubs() {
      setLoading(true);
      const data = await dataService.getClubs();
      setClubs(data);
      setLoading(false);
    }
    loadClubs();
  }, []);

  const filteredClubs = clubs.filter((c) => {
    return filterCategory === 'All' || c.category === filterCategory;
  });

  const handleJoin = (clubId: string) => {
    setClubs((prev) =>
      prev.map((c) => {
        if (c.id === clubId) {
          return { ...c, status: 'Application Sent' as const };
        }
        return c;
      })
    );
    alert('Application submitted! View status under My Memberships.');
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-md">
        <div className="flex flex-col gap-xs">
          <h1 className="font-headline text-headline-lg text-light-on-surface font-bold">
            Clubs Directory
          </h1>
          <p className="font-body text-body-md text-light-on-surface-variant">
            Explore chartered student organizations, professional society chapters, and athletic clubs.
          </p>
        </div>
        <Link
          to="/my-memberships"
          className="inline-flex items-center gap-xs text-label-lg font-label text-light-secondary hover:underline no-underline font-semibold"
        >
          <span>My Memberships</span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </Link>
      </div>

      {/* Filter Category Tabs */}
      <div className="flex items-center gap-xs overflow-x-auto pb-xs">
        {['All', 'Technical', 'Sports', 'Community Service', 'Cultural'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-md py-xs rounded-full text-label-md font-label font-medium transition-all cursor-pointer border-0 ${
              filterCategory === cat
                ? 'bg-light-primary text-light-on-primary font-semibold shadow-sm'
                : 'bg-light-surface-container-lowest border border-light-outline-variant text-light-on-surface-variant hover:bg-light-surface-container-low'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 2-Column Card Grid */}
      {loading ? (
        <div className="py-xl text-center">
          <p className="font-body text-body-md text-light-on-surface-variant">Loading clubs from Supabase...</p>
        </div>
      ) : filteredClubs.length === 0 ? (
        <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-2xl text-center flex flex-col items-center gap-sm">
          <span className="material-symbols-outlined text-[36px] text-light-outline">groups</span>
          <span className="font-title text-title-md font-semibold text-light-on-surface">No Clubs Found</span>
          <p className="font-body text-body-md text-light-on-surface-variant">
            No clubs are registered in this category yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {filteredClubs.map((club) => (
            <div
              key={club.id}
              className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col justify-between gap-md shadow-sm hover:border-light-primary transition-all"
            >
              <div className="flex flex-col gap-sm">
                <div className="flex items-center justify-between">
                  <span className="text-label-sm font-label text-light-secondary font-semibold uppercase tracking-wider">
                    {club.category}
                  </span>
                  <StatusChip
                    label={club.status}
                    status={
                      club.status === 'Active Member'
                        ? 'confirmed'
                        : club.status === 'Application Sent'
                        ? 'warning'
                        : 'info'
                    }
                  />
                </div>

                <div className="flex items-start gap-md">
                  <div className="w-12 h-12 rounded-lg bg-light-primary-container text-light-on-primary-container flex items-center justify-center font-headline text-headline-sm font-bold shrink-0">
                    {club.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-headline text-title-lg font-bold text-light-on-surface m-0">
                      <Link
                        to={`/clubs/${club.id}`}
                        className="text-light-on-surface hover:text-light-primary no-underline"
                      >
                        {club.name}
                      </Link>
                    </h3>
                    <span className="font-mono text-label-sm text-light-on-surface-variant">
                      {club.member_count} active members · LKR {club.annual_fee}/year
                    </span>
                  </div>
                </div>

                <p className="font-body text-body-md text-light-on-surface-variant m-0 leading-relaxed">
                  {club.description}
                </p>
              </div>

              <div className="pt-sm border-t border-light-outline-variant flex items-center justify-between">
                <span className="font-label text-label-sm text-light-on-surface-variant">
                  Lead: {club.lead}
                </span>

                <div className="flex items-center gap-xs">
                  <button
                    onClick={() => navigate(`/clubs/${club.id}`)}
                    className="px-md py-xs rounded bg-light-surface-container-low text-light-primary border border-light-outline-variant font-label text-label-md font-semibold hover:bg-light-surface-container cursor-pointer"
                  >
                    View Club
                  </button>

                  {club.status === 'Not Joined' && (
                    <button
                      onClick={() => handleJoin(club.id)}
                      className="px-md py-xs rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold hover:bg-light-primary-container cursor-pointer border-0 shadow-sm"
                    >
                      Apply to Join · LKR {club.annual_fee}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default ClubsDirectory;
