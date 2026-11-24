import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CoordinatorLayout } from '../../components/CoordinatorLayout';
import { ProposalItem, OfficialClubRecord } from '../../types';
import { dataService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';

export const CoordinatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [officialClubs, setOfficialClubs] = useState<OfficialClubRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [propData, clubsData] = await Promise.all([
          dataService.getProposals(),
          dataService.getOfficialClubs(),
        ]);
        setProposals(propData);
        setOfficialClubs(clubsData);
      } catch (err) {
        console.error('Error loading coordinator dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const pendingReviews = proposals.filter(
    (p) =>
      p.status === 'Pending Review' ||
      (p.stage === 2 &&
        p.status !== 'Revision Requested' &&
        p.status !== 'Higher Authority' &&
        p.status !== 'Approved' &&
        p.status !== 'Approved & Published' &&
        p.status !== 'Rejected')
  );
  const revisionRequested = proposals.filter((p) => p.status === 'Revision Requested');
  const endorsedProposals = proposals.filter(
    (p) =>
      p.status === 'Higher Authority' ||
      p.status === 'Endorsed' ||
      p.status === 'Approved' ||
      p.status === 'Approved & Published'
  );

  const facultyName = user?.name || 'Dr. Kavinda Silva';

  return (
    <CoordinatorLayout>
      <main className="p-lg md:p-xl max-w-[1400px] w-full mx-auto flex flex-col gap-xl">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline text-headline-lg text-light-on-surface font-semibold">
              Coordinator Workspace
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant">
              Faculty oversight, proposal vetting, and Higher Authority routing for {facultyName}.
            </p>
          </div>
          <div className="flex items-center gap-sm">
            <Link
              to="/coordinator/proposals"
              className="inline-flex items-center gap-xs px-md py-sm rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold no-underline hover:bg-light-primary-container transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">rate_review</span>
              <span>Open Review Queue ({pendingReviews.length})</span>
            </Link>
          </div>
        </header>

        {/* Live Overview Metrics */}
        <section aria-label="Coordinator overview metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
          <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-xs shadow-sm">
            <span className="font-label text-label-md text-light-on-surface-variant">Assigned Clubs</span>
            <span className="font-headline text-display-sm text-light-primary font-bold tabular-nums">
              {officialClubs.length}
            </span>
            <span className="font-label text-label-sm text-light-on-surface-variant">
              Chartered societies under oversight
            </span>
          </div>

          <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-xs shadow-sm">
            <span className="font-label text-label-md text-light-on-surface-variant">Pending Coordinator Review</span>
            <span className="font-headline text-display-sm text-info-primary font-bold tabular-nums">
              {pendingReviews.length}
            </span>
            <span className="font-label text-label-sm text-on-info-container">
              Awaiting your endorsement
            </span>
          </div>

          <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-xs shadow-sm">
            <span className="font-label text-label-md text-light-on-surface-variant">Revisions Requested</span>
            <span className="font-headline text-display-sm text-warning font-bold tabular-nums">
              {revisionRequested.length}
            </span>
            <span className="font-label text-label-sm text-on-warning-container">
              Returned to club officers
            </span>
          </div>

          <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-xs shadow-sm">
            <span className="font-label text-label-md text-light-on-surface-variant">Endorsed / Routed Forward</span>
            <span className="font-headline text-display-sm text-success font-bold tabular-nums">
              {endorsedProposals.length}
            </span>
            <span className="font-label text-label-sm text-on-success-container">
              Routed to Higher Authority
            </span>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
          {/* Pending Queue Preview */}
          <section className="lg:col-span-8 bg-light-surface-container-lowest border border-light-outline-variant rounded-md shadow-sm overflow-hidden flex flex-col">
            <div className="px-lg py-md border-b border-light-outline-variant flex items-center justify-between bg-light-surface-container-low/50">
              <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold">
                Proposals Awaiting Coordinator Review
              </h2>
              <Link
                to="/coordinator/proposals"
                className="font-label text-label-md text-light-primary no-underline hover:underline"
              >
                View Full Queue →
              </Link>
            </div>

            <div className="divide-y divide-light-outline-variant">
              {loading ? (
                <div className="p-lg text-center text-light-on-surface-variant font-body text-body-md">
                  Loading review queue...
                </div>
              ) : pendingReviews.length === 0 ? (
                <div className="p-xl text-center text-light-on-surface-variant font-body text-body-md">
                  No proposals are currently pending Coordinator review.
                </div>
              ) : (
                pendingReviews.map((prop) => (
                  <div
                    key={prop.id}
                    className="p-lg flex flex-col sm:flex-row sm:items-center justify-between gap-md hover:bg-light-surface-container-low/30 transition-colors"
                  >
                    <div className="flex flex-col gap-xs">
                      <div className="flex items-center gap-sm flex-wrap">
                        <span className="font-mono text-mono-sm text-light-primary bg-light-primary-container/15 px-sm py-0.5 rounded">
                          {prop.code}
                        </span>
                        <span className="font-label text-label-sm text-on-info-container bg-info-container px-sm py-0.5 rounded-full">
                          Stage {prop.stage}: Review
                        </span>
                        <span className="font-label text-label-sm text-light-on-surface-variant">
                          Rev #{prop.current_revision || 1}
                        </span>
                      </div>
                      <h3 className="font-title text-title-md text-light-on-surface font-semibold">
                        {prop.title}
                      </h3>
                      <p className="font-body text-body-md text-light-on-surface-variant">
                        {prop.club_name} · {prop.event_date} · Budget LKR {prop.budget.toLocaleString()}
                      </p>
                    </div>

                    <Link
                      to={`/coordinator/proposals/${prop.id}/review`}
                      className="inline-flex items-center justify-center gap-xs px-md py-sm rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold no-underline hover:bg-light-primary-container shrink-0"
                    >
                      <span>Review &amp; Route</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Assigned Clubs Overview */}
          <aside className="lg:col-span-4 bg-light-surface-container-lowest border border-light-outline-variant rounded-md shadow-sm overflow-hidden flex flex-col">
            <div className="px-lg py-md border-b border-light-outline-variant flex items-center justify-between bg-light-surface-container-low/50">
              <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold">
                Assigned Clubs
              </h2>
              <Link
                to="/coordinator/clubs"
                className="font-label text-label-md text-light-primary no-underline hover:underline"
              >
                Directory
              </Link>
            </div>
            <ul className="divide-y divide-light-outline-variant">
              {officialClubs.map((club) => (
                <li key={club.id} className="p-md flex items-center justify-between gap-md">
                  <div className="flex flex-col">
                    <span className="font-title text-title-md text-light-on-surface font-medium">
                      {club.name}
                    </span>
                    <span className="font-label text-label-sm text-light-on-surface-variant">
                      {club.code} · {club.coordinator}
                    </span>
                  </div>
                  <span
                    className={`font-label text-label-sm px-sm py-0.5 rounded-full whitespace-nowrap ${
                      club.status === 'Active'
                        ? 'bg-success-container text-on-success-container'
                        : 'bg-warning-container text-on-warning-container'
                    }`}
                  >
                    {club.status}
                  </span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </main>
    </CoordinatorLayout>
  );
};

export default CoordinatorDashboard;
