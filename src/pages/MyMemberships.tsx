import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { ClubItem, ClubMemberItem } from '../types';

export const MyMemberships: React.FC = () => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [applications, setApplications] = useState<ClubMemberItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [clubList, appList] = await Promise.all([
          dataService.getClubs(),
          dataService.getStudentClubMemberships(user?.email),
        ]);
        setClubs(clubList);
        setApplications(appList);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.email]);

  const activeOrPendingClubs = clubs.filter((c) => c.status !== 'Not Joined');

  return (
    <AppLayout>
      <main className="p-lg md:p-xl max-w-[1300px] w-full mx-auto flex flex-col gap-xl">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline text-headline-lg text-light-on-surface font-semibold m-0">
              My Club Memberships (S13)
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant m-0">
              Track active society memberships, pending applications, and followed organizations.
            </p>
          </div>
          <Link
            to="/clubs"
            className="px-md py-sm rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold no-underline w-fit"
          >
            Explore All Clubs
          </Link>
        </header>

        {loading ? (
          <div className="p-xl text-center text-light-on-surface-variant">Loading your memberships...</div>
        ) : (
          <div className="flex flex-col gap-xl">
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
              {activeOrPendingClubs.map((club) => (
                <article
                  key={club.id}
                  className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col justify-between gap-md shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-sm mb-xs">
                      <span className="font-label text-label-sm text-light-primary font-semibold">{club.category}</span>
                      <span
                        className={`px-sm py-0.5 rounded-full font-label text-label-sm ${
                          club.status === 'Active Member'
                            ? 'bg-success-container text-on-success-container'
                            : club.status === 'Application Sent'
                            ? 'bg-warning-container text-on-warning-container'
                            : 'bg-info-container text-on-info-container'
                        }`}
                      >
                        {club.status}
                      </span>
                    </div>
                    <h2 className="font-title text-title-lg font-bold m-0">{club.name}</h2>
                    <p className="font-body text-body-sm text-light-on-surface-variant m-0 mt-xs line-clamp-2">
                      {club.description}
                    </p>
                  </div>
                  <Link
                    to={`/clubs/${club.id}`}
                    className="font-label text-label-md text-light-primary font-semibold no-underline hover:underline pt-sm border-t border-light-outline-variant"
                  >
                    Open Club Page →
                  </Link>
                </article>
              ))}
            </section>

            {applications.length > 0 && (
              <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md shadow-sm overflow-hidden">
                <div className="px-lg py-md border-b border-light-outline-variant bg-light-surface-container-low/50">
                  <h2 className="font-headline text-headline-sm font-semibold m-0">
                    Submitted Membership Roster Entries
                  </h2>
                </div>
                <div className="divide-y divide-light-outline-variant">
                  {applications.map((app) => (
                    <div key={app.id} className="p-md flex items-center justify-between gap-md">
                      <div>
                        <span className="font-title text-title-md font-semibold">{app.club_id}</span>
                        <span className="block font-label text-label-sm text-light-on-surface-variant">
                          Role: {app.role} · Requested {app.requested_date || 'Recently'}
                        </span>
                      </div>
                      <span className="px-sm py-0.5 rounded-full bg-light-surface-container-low font-label text-label-sm">
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </AppLayout>
  );
};

export default MyMemberships;
