import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { StatusChip } from '../components/StatusChip';
import { ClubItem } from '../types';
import { dataService } from '../services/dataService';

export const MyMemberships: React.FC = () => {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMemberships() {
      setLoading(true);
      const allClubs = await dataService.getClubs();
      // Show clubs that have active status or applications
      const userClubs = allClubs.filter((c) => c.status !== 'Not Joined');
      setClubs(userClubs.length > 0 ? userClubs : allClubs);
      setLoading(false);
    }
    loadMemberships();
  }, []);

  return (
    <AppLayout>
      {/* Title */}
      <div className="flex flex-wrap items-end justify-between gap-md">
        <div className="flex flex-col gap-xs">
          <h1 className="font-headline text-headline-lg text-light-on-surface font-bold">
            My Club Memberships
          </h1>
          <p className="font-body text-body-md text-light-on-surface-variant">
            Manage your verified student organization credentials, renewal timelines, and voting roles.
          </p>
        </div>
        <Link
          to="/clubs"
          className="inline-flex items-center gap-xs px-md py-sm rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container font-label text-label-md font-semibold no-underline"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Explore More Clubs</span>
        </Link>
      </div>

      {/* Memberships List */}
      <div className="flex flex-col gap-md">
        {loading ? (
          <div className="p-xl text-center">
            <p className="font-body text-body-md text-light-on-surface-variant">Loading memberships from Supabase...</p>
          </div>
        ) : clubs.length === 0 ? (
          <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-2xl text-center flex flex-col items-center gap-sm">
            <span className="material-symbols-outlined text-[36px] text-light-outline">badge</span>
            <span className="font-title text-title-md font-semibold text-light-on-surface">No Active Memberships</span>
            <p className="font-body text-body-md text-light-on-surface-variant max-w-sm">
              You are not a member of any student organizations yet. Browse the clubs directory to join.
            </p>
            <Link to="/clubs" className="px-md py-sm rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold no-underline mt-xs">
              View Clubs Directory
            </Link>
          </div>
        ) : (
          clubs.map((club) => (
            <div
              key={club.id}
              className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col md:flex-row md:items-center justify-between gap-lg shadow-sm"
            >
              <div className="flex flex-col gap-sm">
                <div className="flex items-center gap-sm">
                  <StatusChip
                    label={club.status}
                    status={
                      club.status === 'Active Member'
                        ? 'confirmed'
                        : club.status === 'Application Sent'
                        ? 'payment_pending'
                        : 'neutral'
                    }
                  />
                  <span className="font-mono text-mono-md text-light-on-surface-variant">
                    {club.id}
                  </span>
                </div>

                <div className="flex flex-col">
                  <h3 className="font-headline text-title-lg font-bold text-light-on-surface m-0">
                    {club.name}
                  </h3>
                  <span className="text-label-sm font-label text-light-secondary font-semibold">
                    {club.category} · Advisor: {club.lead}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-lg gap-y-xs text-body-md text-light-on-surface-variant">
                  <span>Active Members: <strong className="text-light-on-surface font-medium">{club.member_count}</strong></span>
                  <span>Annual Fee: <strong className="font-mono text-light-on-surface font-medium">LKR {club.annual_fee}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-sm shrink-0">
                {club.status === 'Application Sent' && (
                  <button
                    onClick={() => navigate('/payment')}
                    className="px-md py-sm rounded bg-warning text-on-warning font-label text-label-md font-bold hover:opacity-90 cursor-pointer border-0 shadow-sm"
                  >
                    Pay Joining Fee · LKR {club.annual_fee}
                  </button>
                )}

                <Link
                  to={`/clubs/${club.id}`}
                  className="px-md py-sm rounded bg-light-surface-container-low text-light-primary border border-light-outline-variant font-label text-label-md font-semibold hover:bg-light-surface-container no-underline"
                >
                  View Portal
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </AppLayout>
  );
};

export default MyMemberships;
