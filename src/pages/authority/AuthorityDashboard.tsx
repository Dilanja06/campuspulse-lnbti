import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthorityLayout } from '../../components/AuthorityLayout';
import { dataService } from '../../services/dataService';
import { ProposalItem, DecisionRecord } from '../../types';

export const AuthorityDashboard: React.FC = () => {
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [props, decs] = await Promise.all([
          dataService.getProposals(),
          dataService.getAuthorityDecisionHistory(),
        ]);
        setProposals(props);
        setDecisions(decs);
      } catch (err) {
        console.error('Failed to load authority dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const pendingProposals = proposals.filter(
    (p) => p.stage === 3 || p.status === 'Higher Authority'
  );

  const approvedCount = 19 + decisions.filter((d) => d.outcome === 'Approved').length - 2; // base + recent
  const returnedCount = 2 + decisions.filter((d) => d.outcome === 'Returned').length - 1;

  return (
    <AuthorityLayout>
      <main className="flex-1 p-xl max-w-[1280px] w-full mx-auto flex flex-col gap-xl">
        <div className="flex flex-wrap items-end justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline text-headline-lg text-light-on-surface">
              Welcome, Prof. Maheshika
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant">
              Review proposals routed by Lecturer Coordinators and record your decision on assigned approval stages.
            </p>
          </div>
          <Link
            to="/authority/stages"
            className="inline-flex items-center justify-center gap-xs px-md py-sm rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container transition-colors duration-state-change no-underline"
          >
            <span className="font-label text-label-lg whitespace-nowrap">Open Approval Stages</span>
          </Link>
        </div>

        {/* Glanceable Metrics */}
        <section aria-label="Authority approval metrics" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg items-stretch">
          <div className="h-full bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col justify-between gap-sm shadow-sm">
            <span className="font-label text-label-md text-light-on-surface-variant">
              Pending Decision
            </span>
            <div className="flex items-baseline justify-between gap-sm">
              <span className="font-headline text-headline-md text-light-on-surface tabular-nums">
                {pendingProposals.length}
              </span>
              <span className="font-label text-label-sm text-on-info-container bg-info-container px-sm py-xs rounded-full whitespace-nowrap">
                Assigned
              </span>
            </div>
          </div>

          <div className="h-full bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col justify-between gap-sm shadow-sm">
            <span className="font-label text-label-md text-light-on-surface-variant">
              Approved This Term
            </span>
            <div className="flex items-baseline justify-between gap-sm">
              <span className="font-headline text-headline-md text-light-on-surface tabular-nums">
                {Math.max(approvedCount, 19)}
              </span>
              <span className="font-label text-label-sm text-on-success-container bg-success-container px-sm py-xs rounded-full whitespace-nowrap">
                Signed Off
              </span>
            </div>
          </div>

          <div className="h-full bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col justify-between gap-sm shadow-sm">
            <span className="font-label text-label-md text-light-on-surface-variant">
              Returned / Declined
            </span>
            <div className="flex items-baseline justify-between gap-sm">
              <span className="font-headline text-headline-md text-light-on-surface tabular-nums">
                {Math.max(returnedCount, 2)}
              </span>
              <span className="font-label text-label-sm text-on-warning-container bg-warning-container px-sm py-xs rounded-full whitespace-nowrap">
                Term 2026
              </span>
            </div>
          </div>

          <div className="h-full bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col justify-between gap-sm shadow-sm">
            <span className="font-label text-label-md text-light-on-surface-variant">
              Avg. Turnaround
            </span>
            <div className="flex items-baseline justify-between gap-sm">
              <span className="font-headline text-headline-md text-light-on-surface tabular-nums">
                1.4d
              </span>
              <span className="font-label text-label-sm text-light-on-surface-variant whitespace-nowrap">
                Per Stage
              </span>
            </div>
          </div>
        </section>

        {/* Assigned Stages Requiring Decision */}
        <section aria-label="Proposals awaiting authority decision" className="flex flex-col gap-md">
          <div className="flex items-center justify-between gap-md">
            <h2 className="font-headline text-headline-sm text-light-on-surface">
              Awaiting Your Decision
            </h2>
            <Link
              to="/authority/stages"
              className="font-label text-label-md text-light-primary hover:underline whitespace-nowrap"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <div className="p-xl text-center text-light-on-surface-variant font-body">
              Loading assigned proposals...
            </div>
          ) : pendingProposals.length === 0 ? (
            <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-xl text-center flex flex-col items-center gap-sm">
              <span className="material-symbols-outlined text-[36px] text-light-outline">
                check_circle
              </span>
              <span className="font-title text-title-md text-light-on-surface">
                All Stages Signed Off
              </span>
              <span className="font-body text-body-md text-light-on-surface-variant">
                No pending proposals currently requiring Dean executive review.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg items-stretch">
              {pendingProposals.slice(0, 4).map((prop) => (
                <article
                  key={prop.id}
                  className="h-full bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col justify-between gap-md shadow-sm"
                >
                  <div className="flex flex-col gap-xs">
                    <div className="flex items-center justify-between gap-sm">
                      <span className="font-mono text-mono-md text-light-on-surface-variant tabular-nums">
                        {prop.code}
                      </span>
                      <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-info-container text-on-info-container whitespace-nowrap">
                        <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                          hourglass_top
                        </span>
                        <span className="font-label text-label-sm">
                          Stage 3 · Dean
                        </span>
                      </span>
                    </div>
                    <h3 className="font-title text-title-lg text-light-on-surface font-semibold">
                      {prop.title}
                    </h3>
                    <p className="font-body text-body-md text-light-on-surface-variant tabular-nums">
                      {prop.club_name} · {prop.submitted_at || 'Nov 2026'} · {prop.venue} · LKR {prop.budget?.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-md pt-md border-t border-light-outline-variant">
                    <span className="font-label text-label-sm text-on-success-container">
                      Endorsed by {prop.coordinator_endorsement?.name || prop.coordinator_endorsement?.by || 'Dr. Kavinda Silva'}
                    </span>
                    <Link
                      to={`/authority/stages/${prop.id}/sign-off`}
                      className="px-md py-xs rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container transition-colors duration-state-change no-underline"
                    >
                      <span className="font-label text-label-md whitespace-nowrap">Review &amp; Decide</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </AuthorityLayout>
  );
};

export default AuthorityDashboard;
