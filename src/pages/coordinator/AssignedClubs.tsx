import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CoordinatorLayout } from '../../components/CoordinatorLayout';
import { ClubItem, OfficialClubRecord, ProposalItem } from '../../types';
import { dataService } from '../../services/dataService';

export const AssignedClubs: React.FC = () => {
  const [officialClubs, setOfficialClubs] = useState<OfficialClubRecord[]>([]);
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [offData, clubData, propData] = await Promise.all([
          dataService.getOfficialClubs(),
          dataService.getClubs(),
          dataService.getProposals(),
        ]);
        setOfficialClubs(offData);
        setClubs(clubData);
        setProposals(propData);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <CoordinatorLayout>
      <main className="p-lg md:p-xl max-w-[1400px] w-full mx-auto flex flex-col gap-xl">
        <header className="flex flex-col gap-xs">
          <h1 className="font-headline text-headline-lg text-light-on-surface font-semibold">
            Assigned Clubs &amp; Societies
          </h1>
          <p className="font-body text-body-md text-light-on-surface-variant">
            Chartered clubs and societies under your Coordinator faculty oversight.
          </p>
        </header>

        {loading ? (
          <div className="p-xl text-center text-light-on-surface-variant font-body text-body-md">
            Loading assigned clubs...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {officialClubs.map((off) => {
              const matchingClub = clubs.find((c) => c.name === off.name);
              const clubProps = proposals.filter((p) => p.club_name === off.name);
              const pendingCount = clubProps.filter((p) => p.status === 'Pending Review').length;

              return (
                <article
                  key={off.id}
                  className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm"
                >
                  <div className="flex items-start justify-between gap-md">
                    <div className="flex flex-col">
                      <span className="font-mono text-mono-sm text-light-on-surface-variant">
                        {off.code}
                      </span>
                      <h2 className="font-title text-title-lg text-light-on-surface font-semibold">
                        {off.name}
                      </h2>
                    </div>
                    <span
                      className={`font-label text-label-sm px-sm py-xs rounded-full whitespace-nowrap ${
                        off.status === 'Active'
                          ? 'bg-success-container text-on-success-container'
                          : 'bg-warning-container text-on-warning-container'
                      }`}
                    >
                      {off.status}
                    </span>
                  </div>

                  <p className="font-body text-body-md text-light-on-surface-variant line-clamp-2">
                    {matchingClub?.description || 'Chartered student club overseen by Faculty Coordinator.'}
                  </p>

                  <div className="grid grid-cols-2 gap-sm pt-sm border-t border-light-outline-variant text-label-sm">
                    <div className="flex flex-col">
                      <span className="text-light-on-surface-variant">Committee Status</span>
                      <span className="font-semibold text-light-on-surface">{off.committee_status}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-light-on-surface-variant">Members</span>
                      <span className="font-semibold text-light-on-surface tabular-nums">
                        {matchingClub?.member_count ?? 120}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-light-on-surface-variant">Faculty Coordinator</span>
                      <span className="font-semibold text-light-on-surface">{off.coordinator}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-light-on-surface-variant">Pending Proposals</span>
                      <span className="font-semibold text-light-primary tabular-nums">{pendingCount}</span>
                    </div>
                  </div>

                  <div className="pt-sm flex items-center justify-end border-t border-light-outline-variant">
                    <Link
                      to="/coordinator/proposals"
                      className="font-label text-label-md text-light-primary font-semibold no-underline hover:underline"
                    >
                      Review Club Proposals ({clubProps.length}) →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </CoordinatorLayout>
  );
};

export default AssignedClubs;
