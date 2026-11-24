import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CoordinatorLayout } from '../../components/CoordinatorLayout';
import { dataService } from '../../services/dataService';
import { ProposalItem } from '../../types';

export const CoordinatorDashboard: React.FC = () => {
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const all = await dataService.getProposals();
        setProposals(all);
      } catch (err) {
        console.warn('Coordinator dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, []);

  const pendingList = proposals.filter((p) => p.status === 'Pending Review' || p.stage === 2);
  const revisionList = proposals.filter((p) => p.status === 'Revision Requested');
  const endorsedList = proposals.filter((p) => p.status === 'Higher Authority' || p.status === 'Approved & Published' || p.status === 'Endorsed');

  return (
    <CoordinatorLayout>
      <main className="flex-1 p-xl max-w-[1280px] w-full mx-auto flex flex-col gap-xl">
        {/* Header & Primary Action */}
        <div className="flex flex-wrap items-end justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline text-headline-lg text-light-on-surface">
              Welcome, Dr. Kavinda
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant">
              Review club event proposals, add coordinator feedback, and select higher university authorities for sign-off.
            </p>
          </div>
          <Link
            to="/coordinator/proposals"
            className="inline-flex items-center justify-center gap-xs px-md py-sm rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container transition-colors duration-state-change font-label text-label-lg whitespace-nowrap no-underline"
          >
            Open Review Queue
          </Link>
        </div>

        {/* Action Required Banner */}
        <section
          aria-label="Proposals awaiting coordinator action"
          className="bg-info-container text-on-info-container rounded-md p-md flex flex-wrap items-center justify-between gap-md shadow-sm"
        >
          <div className="flex items-center gap-md">
            <span className="material-symbols-outlined text-[24px] shrink-0" aria-hidden="true">
              assignment_late
            </span>
            <div className="flex flex-col gap-xs">
              <span className="font-title text-title-md font-bold">
                {pendingList.length || 3} event proposals cleared club committee vote
              </span>
              <span className="font-body text-body-md">
                All 5 club decision-makers have signed off. Ready for your review and authority routing.
              </span>
            </div>
          </div>
          <Link
            to="/coordinator/proposals/prop-1094/review"
            className="inline-flex items-center justify-center px-md py-xs rounded bg-light-surface-container-lowest text-light-primary border border-light-outline-variant hover:bg-light-surface-container-low transition-colors duration-state-change font-label text-label-md whitespace-nowrap no-underline"
          >
            Review Next
          </Link>
        </section>

        {/* Glanceable Metrics */}
        <section
          aria-label="Coordinator metrics"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg items-stretch"
        >
          {/* Metric 1: Pending My Review */}
          <div className="h-full bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col justify-between gap-sm">
            <span className="font-label text-label-md text-light-on-surface-variant">
              Pending My Review
            </span>
            <div className="flex items-baseline justify-between gap-sm">
              <span className="font-headline text-headline-md text-light-on-surface tabular-nums">
                {pendingList.length || 3}
              </span>
              <span className="font-label text-label-sm text-on-info-container bg-info-container px-sm py-xs rounded-full whitespace-nowrap font-medium">
                Action Needed
              </span>
            </div>
          </div>

          {/* Metric 2: Awaiting Revision */}
          <div className="h-full bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col justify-between gap-sm">
            <span className="font-label text-label-md text-light-on-surface-variant">
              Awaiting Revision
            </span>
            <div className="flex items-baseline justify-between gap-sm">
              <span className="font-headline text-headline-md text-light-on-surface tabular-nums">
                {revisionList.length || 1}
              </span>
              <span className="font-label text-label-sm text-on-warning-container bg-warning-container px-sm py-xs rounded-full whitespace-nowrap font-medium">
                Returned
              </span>
            </div>
          </div>

          {/* Metric 3: Endorsed This Term */}
          <div className="h-full bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col justify-between gap-sm">
            <span className="font-label text-label-md text-light-on-surface-variant">
              Endorsed This Term
            </span>
            <div className="flex items-baseline justify-between gap-sm">
              <span className="font-headline text-headline-md text-light-on-surface tabular-nums">
                11
              </span>
              <span className="font-label text-label-sm text-on-success-container bg-success-container px-sm py-xs rounded-full whitespace-nowrap font-medium">
                Approved
              </span>
            </div>
          </div>

          {/* Metric 4: Assigned Clubs */}
          <div className="h-full bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col justify-between gap-sm">
            <span className="font-label text-label-md text-light-on-surface-variant">
              Assigned Clubs
            </span>
            <div className="flex items-baseline justify-between gap-sm">
              <span className="font-headline text-headline-md text-light-on-surface tabular-nums">
                3
              </span>
              <span className="font-label text-label-sm text-light-on-surface-variant whitespace-nowrap font-medium">
                Active
              </span>
            </div>
          </div>
        </section>

        {/* Priority Review List */}
        <section aria-label="Priority proposals for review" className="flex flex-col gap-md">
          <div className="flex items-center justify-between gap-md">
            <h2 className="font-headline text-headline-sm text-light-on-surface">
              Priority Proposals
            </h2>
            <Link
              to="/coordinator/proposals"
              className="font-label text-label-md text-light-primary hover:underline no-underline"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg items-stretch">
            {/* Card 1: PROP-1094 */}
            <article className="h-full bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col justify-between gap-md shadow-sm">
              <div className="flex flex-col gap-xs">
                <div className="flex items-center justify-between gap-sm">
                  <span className="font-mono text-mono-md text-light-on-surface-variant tabular-nums">
                    PROP-1094
                  </span>
                  <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-info-container text-on-info-container whitespace-nowrap">
                    <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                      hourglass_top
                    </span>
                    <span className="font-label text-label-sm">
                      Pending Review
                    </span>
                  </span>
                </div>
                <h3 className="font-title text-title-lg text-light-on-surface font-semibold">
                  Inter-University Robotics Hackathon
                </h3>
                <p className="font-body text-body-md text-light-on-surface-variant tabular-nums">
                  Robotics Society · 05 Dec 2026 · Engineering Block B · LKR 120,000
                </p>
              </div>
              <div className="flex items-center justify-between gap-md pt-md border-t border-light-outline-variant">
                <span className="font-label text-label-sm text-on-success-container font-medium flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Committee 5/5 Signed
                </span>
                <Link
                  to="/coordinator/proposals/prop-1094/review"
                  className="px-md py-xs rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container transition-colors duration-state-change font-label text-label-md whitespace-nowrap no-underline"
                >
                  Review &amp; Route
                </Link>
              </div>
            </article>

            {/* Card 2: PROP-1096 */}
            <article className="h-full bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col justify-between gap-md shadow-sm">
              <div className="flex flex-col gap-xs">
                <div className="flex items-center justify-between gap-sm">
                  <span className="font-mono text-mono-md text-light-on-surface-variant tabular-nums">
                    PROP-1096
                  </span>
                  <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-info-container text-on-info-container whitespace-nowrap">
                    <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                      hourglass_top
                    </span>
                    <span className="font-label text-label-sm">
                      Pending Review
                    </span>
                  </span>
                </div>
                <h3 className="font-title text-title-lg text-light-on-surface font-semibold">
                  Cloud &amp; Embedded Systems Bootcamp
                </h3>
                <p className="font-body text-body-md text-light-on-surface-variant tabular-nums">
                  IEEE Student Branch · 10 Dec 2026 · Lecture Hall 03 · LKR 35,000
                </p>
              </div>
              <div className="flex items-center justify-between gap-md pt-md border-t border-light-outline-variant">
                <span className="font-label text-label-sm text-on-success-container font-medium flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Committee 5/5 Signed
                </span>
                <Link
                  to="/coordinator/proposals/prop-1096/review"
                  className="px-md py-xs rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container transition-colors duration-state-change font-label text-label-md whitespace-nowrap no-underline"
                >
                  Review &amp; Route
                </Link>
              </div>
            </article>
          </div>
        </section>
      </main>
    </CoordinatorLayout>
  );
};

export default CoordinatorDashboard;
