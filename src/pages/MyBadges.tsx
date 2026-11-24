import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/AppLayout';
import { StatusChip } from '../components/StatusChip';
import { BadgeItem } from '../types';
import { dataService } from '../services/dataService';

export const MyBadges: React.FC = () => {
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBadges() {
      setLoading(true);
      const data = await dataService.getBadges();
      setBadges(data);
      setLoading(false);
    }
    loadBadges();
  }, []);

  const membershipBadges = badges.filter((b) => b.type === 'Membership');
  const participationBadges = badges.filter((b) => b.type === 'Participation');

  const renderBadgeCard = (badge: BadgeItem) => (
    <div
      key={badge.id}
      className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col justify-between gap-md shadow-sm hover:border-light-primary transition-all"
    >
      <div className="flex items-start justify-between gap-sm">
        <div className="w-12 h-12 rounded-lg bg-light-secondary-container text-light-on-secondary-container flex items-center justify-center shrink-0 shadow-sm">
          <span className="material-symbols-outlined text-[28px]">{badge.icon}</span>
        </div>
        <StatusChip label={badge.status} status={badge.status === 'Issued' ? 'confirmed' : 'warning'} />
      </div>

      <div className="flex flex-col gap-xs">
        <span className="font-label text-label-sm text-light-secondary font-semibold">
          {badge.club}
        </span>
        <h3 className="font-headline text-title-lg font-semibold text-light-on-surface m-0">
          {badge.name}
        </h3>
        <p className="font-body text-body-md text-light-on-surface-variant m-0">
          {badge.description}
        </p>
      </div>

      <div className="pt-sm border-t border-light-outline-variant flex items-center justify-between text-label-sm">
        <span className="font-mono text-mono-md text-light-outline font-medium">
          {badge.code}
        </span>
        {badge.date_issued && (
          <span className="text-light-on-surface-variant font-medium">
            Issued {badge.date_issued}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <AppLayout>
      {/* Title */}
      <div className="flex flex-col gap-xs">
        <h1 className="font-headline text-headline-lg text-light-on-surface font-bold">
          My Badges
        </h1>
        <p className="font-body text-body-md text-light-on-surface-variant">
          Verifiable digital badges recognized by university faculties and campus leadership portfolios.
        </p>
      </div>

      {loading ? (
        <div className="py-xl text-center">
          <p className="font-body text-body-md text-light-on-surface-variant">Loading badges from Supabase...</p>
        </div>
      ) : badges.length === 0 ? (
        <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-2xl text-center flex flex-col items-center gap-sm">
          <span className="material-symbols-outlined text-[36px] text-light-outline">workspace_premium</span>
          <span className="font-title text-title-md font-semibold text-light-on-surface">No Badges Earned Yet</span>
          <p className="font-body text-body-md text-light-on-surface-variant max-w-sm">
            Participate in club tournaments and active society sessions to earn official verified credentials.
          </p>
        </div>
      ) : (
        <>
          {/* Section 1: Membership Badges */}
          {membershipBadges.length > 0 && (
            <div className="flex flex-col gap-md">
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-[22px] text-light-primary">verified</span>
                <h2 className="font-headline text-headline-sm font-semibold text-light-on-surface m-0">
                  Society &amp; Club Membership Badges
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                {membershipBadges.map(renderBadgeCard)}
              </div>
            </div>
          )}

          {/* Section 2: Participation & Achievement Badges */}
          {participationBadges.length > 0 && (
            <div className="flex flex-col gap-md">
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-[22px] text-light-primary">military_tech</span>
                <h2 className="font-headline text-headline-sm font-semibold text-light-on-surface m-0">
                  Competitions &amp; Achievement Badges
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                {participationBadges.map(renderBadgeCard)}
              </div>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
};

export default MyBadges;
