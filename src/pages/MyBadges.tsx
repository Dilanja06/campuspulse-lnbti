import React, { useEffect, useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { BadgeItem } from '../types';

export const MyBadges: React.FC = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataService.getBadges(user?.id).then((list) => {
      setBadges(list);
      setLoading(false);
    });
  }, [user?.id]);

  return (
    <AppLayout>
      <main className="p-lg md:p-xl max-w-[1300px] w-full mx-auto flex flex-col gap-xl">
        <header className="flex flex-col gap-xs">
          <h1 className="font-headline text-headline-lg text-light-on-surface font-semibold m-0">
            Verified Badges &amp; Credentials
          </h1>
          <p className="font-body text-body-md text-light-on-surface-variant m-0">
            Cryptographically verifiable co-curricular badges earned via club memberships and QR-verified event attendance.
          </p>
        </header>

        {loading ? (
          <div className="p-xl text-center text-light-on-surface-variant">Loading credentials...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {badges.map((badge) => (
              <article
                key={badge.id}
                className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col justify-between gap-md shadow-sm"
              >
                <div className="flex flex-col gap-sm">
                  <div className="flex items-start justify-between gap-sm">
                    <div className="w-12 h-12 rounded-lg bg-light-primary-container/15 text-light-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[28px]">{badge.icon || 'military_tech'}</span>
                    </div>
                    <span
                      className={`px-sm py-0.5 rounded-full font-label text-label-sm ${
                        badge.status === 'Issued'
                          ? 'bg-success-container text-on-success-container'
                          : badge.status === 'Revoked'
                          ? 'bg-light-error-container text-light-on-error-container'
                          : 'bg-warning-container text-on-warning-container'
                      }`}
                    >
                      {badge.status}
                    </span>
                  </div>

                  <div>
                    <span className="font-mono text-mono-sm text-light-on-surface-variant">{badge.code} · {badge.type}</span>
                    <h2 className="font-title text-title-lg text-light-on-surface font-bold m-0">{badge.name}</h2>
                    <span className="font-label text-label-sm text-light-primary font-medium">{badge.club}</span>
                  </div>

                  <p className="font-body text-body-sm text-light-on-surface-variant m-0">{badge.description}</p>
                  {badge.status === 'Revoked' && badge.revoke_reason && (
                    <p className="p-sm rounded bg-light-error-container/50 text-light-on-error-container text-label-sm m-0">
                      Revoked: {badge.revoke_reason}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-sm border-t border-light-outline-variant">
                  <span className="font-label text-label-sm text-light-on-surface-variant">
                    {badge.date_issued ? `Issued ${badge.date_issued}` : 'Pending completion'}
                  </span>
                  {badge.status === 'Issued' && (
                    <button
                      type="button"
                      onClick={() => setSelectedBadge(badge)}
                      className="font-label text-label-md text-light-primary font-semibold bg-transparent border-0 cursor-pointer hover:underline"
                    >
                      Verify Credential
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {selectedBadge && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-md">
            <div className="bg-light-surface-container-lowest rounded-lg max-w-md w-full p-xl border border-light-outline-variant shadow-xl text-center flex flex-col items-center gap-md">
              <div className="w-16 h-16 rounded-full bg-success-container text-on-success-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[36px]">verified</span>
              </div>
              <span className="font-mono text-mono-md text-light-primary font-bold">{selectedBadge.code}</span>
              <h2 className="font-headline text-headline-sm font-bold m-0">{selectedBadge.name}</h2>
              <p className="font-body text-body-md text-light-on-surface-variant m-0">
                Awarded to <strong>{user?.name}</strong> ({user?.student_id}) by <strong>{selectedBadge.club}</strong> on {selectedBadge.date_issued}.
              </p>
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="px-lg py-sm rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold border-0 cursor-pointer"
              >
                Close Certificate Preview
              </button>
            </div>
          </div>
        )}
      </main>
    </AppLayout>
  );
};

export default MyBadges;
