import React from 'react';
import { Link } from 'react-router-dom';
import { CoordinatorLayout } from '../../components/CoordinatorLayout';

export const AssignedClubs: React.FC = () => {
  const clubs = [
    {
      id: 'CLB-01',
      name: 'Sports Club',
      status: 'Active',
      stats: '148 members · 3 active events · 1 revision pending',
      leader: 'Sec: Nethmi Perera',
    },
    {
      id: 'CLB-04',
      name: 'IEEE Student Branch',
      status: 'Active',
      stats: '215 members · 2 active events · 1 proposal pending',
      leader: 'Chair: Ashan Perera',
    },
    {
      id: 'CLB-07',
      name: 'Robotics Society',
      status: 'Active',
      stats: '94 members · 1 active event · 1 proposal pending',
      leader: 'Pres: Tharindu W.',
    },
  ];

  return (
    <CoordinatorLayout>
      <main className="flex-1 p-xl max-w-[1280px] w-full mx-auto flex flex-col gap-lg">
        <div className="flex flex-col gap-xs">
          <h1 className="font-headline text-headline-lg text-light-on-surface">
            Assigned Clubs
          </h1>
          <p className="font-body text-body-md text-light-on-surface-variant">
            Student clubs under your faculty oversight for Academic Term 2026.
          </p>
        </div>

        <section aria-label="Assigned student clubs" className="grid grid-cols-1 md:grid-cols-3 gap-lg items-stretch">
          {clubs.map((club) => (
            <article
              key={club.id}
              className="h-full bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col justify-between gap-md shadow-sm"
            >
              <div className="flex flex-col gap-sm">
                <div className="flex items-center justify-between gap-sm">
                  <span className="font-mono text-mono-md text-light-on-surface-variant">
                    {club.id}
                  </span>
                  <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-success-container text-on-success-container whitespace-nowrap">
                    <span className="font-label text-label-sm">
                      {club.status}
                    </span>
                  </span>
                </div>
                <h2 className="font-title text-title-lg text-light-on-surface font-semibold">
                  {club.name}
                </h2>
                <p className="font-body text-body-md text-light-on-surface-variant tabular-nums">
                  {club.stats}
                </p>
              </div>

              <div className="flex items-center justify-between gap-md pt-md border-t border-light-outline-variant">
                <span className="font-label text-label-sm text-light-on-surface-variant">
                  {club.leader}
                </span>
                <Link
                  to="/coordinator/proposals"
                  className="font-label text-label-md text-light-primary hover:underline whitespace-nowrap no-underline font-medium"
                >
                  View Proposals
                </Link>
              </div>
            </article>
          ))}
        </section>
      </main>
    </CoordinatorLayout>
  );
};

export default AssignedClubs;
