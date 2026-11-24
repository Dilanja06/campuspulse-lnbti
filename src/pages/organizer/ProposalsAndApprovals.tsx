import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { OrganizerLayout } from '../../components/OrganizerLayout';
import { dataService } from '../../services/dataService';
import { ProposalItem } from '../../types';

export const ProposalsAndApprovals: React.FC = () => {
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [activeTab, setActiveTab] = useState<'All' | 'In Review' | 'Approved' | 'Drafts'>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const data = await dataService.getProposals();
        setProposals(data);
      } catch (err) {
        console.warn('Error fetching proposals:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, []);

  const inReviewList = proposals.filter(
    (p) => p.status === 'Higher Authority' || p.status === 'Revision Requested' || p.status === 'In Review' || p.status === 'Committee Review'
  );
  const approvedList = proposals.filter((p) => p.status === 'Approved & Published');
  const draftsList = proposals.filter((p) => p.status === 'Draft');

  const filteredProposals = proposals.filter((p) => {
    if (activeTab === 'In Review') {
      return p.status === 'Higher Authority' || p.status === 'Revision Requested' || p.status === 'In Review' || p.status === 'Committee Review';
    }
    if (activeTab === 'Approved') {
      return p.status === 'Approved & Published';
    }
    if (activeTab === 'Drafts') {
      return p.status === 'Draft';
    }
    return true;
  });

  return (
    <OrganizerLayout>
      <main className="flex-1 p-xl max-w-[1280px] w-full mx-auto flex flex-col gap-lg">
        {/* Header & CTA */}
        <div className="flex flex-wrap items-end justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline text-headline-lg text-light-on-surface">
              Proposals &amp; Approvals
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant">
              Track multi-stage university approvals across club committee, lecturer coordinator, and higher authorities.
            </p>
          </div>
          <Link
            to="/organizer/proposals/new"
            className="inline-flex items-center justify-center gap-xs px-md py-sm rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container transition-colors duration-state-change no-underline"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              add
            </span>
            <span className="font-label text-label-lg whitespace-nowrap">
              New Proposal
            </span>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div role="tablist" aria-label="Proposal status filters" className="flex flex-wrap items-center gap-sm border-b border-light-outline-variant pb-md">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'All'}
            onClick={() => setActiveTab('All')}
            className={`px-md py-xs rounded-full cursor-pointer transition-colors ${
              activeTab === 'All'
                ? 'bg-light-primary text-light-on-primary font-semibold'
                : 'bg-light-surface-container-lowest text-light-on-surface-variant border border-light-outline-variant hover:bg-light-surface-container-low'
            }`}
          >
            <span className="font-label text-label-md">
              All ({proposals.length})
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'In Review'}
            onClick={() => setActiveTab('In Review')}
            className={`px-md py-xs rounded-full cursor-pointer transition-colors ${
              activeTab === 'In Review'
                ? 'bg-light-primary text-light-on-primary font-semibold'
                : 'bg-light-surface-container-lowest text-light-on-surface-variant border border-light-outline-variant hover:bg-light-surface-container-low'
            }`}
          >
            <span className="font-label text-label-md">
              In Review ({inReviewList.length})
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'Approved'}
            onClick={() => setActiveTab('Approved')}
            className={`px-md py-xs rounded-full cursor-pointer transition-colors ${
              activeTab === 'Approved'
                ? 'bg-light-primary text-light-on-primary font-semibold'
                : 'bg-light-surface-container-lowest text-light-on-surface-variant border border-light-outline-variant hover:bg-light-surface-container-low'
            }`}
          >
            <span className="font-label text-label-md">
              Approved ({approvedList.length})
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'Drafts'}
            onClick={() => setActiveTab('Drafts')}
            className={`px-md py-xs rounded-full cursor-pointer transition-colors ${
              activeTab === 'Drafts'
                ? 'bg-light-primary text-light-on-primary font-semibold'
                : 'bg-light-surface-container-lowest text-light-on-surface-variant border border-light-outline-variant hover:bg-light-surface-container-low'
            }`}
          >
            <span className="font-label text-label-md">
              Drafts ({draftsList.length})
            </span>
          </button>
        </div>

        {/* Proposals List */}
        <section aria-label="Proposal list" className="flex flex-col gap-md">
          {filteredProposals.map((prop) => {
            if (prop.code === 'PROP-1084' || prop.status === 'Higher Authority') {
              return (
                <article
                  key={prop.id}
                  className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-md">
                    <div className="flex flex-col gap-xs">
                      <div className="flex flex-wrap items-center gap-sm">
                        <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-info-container text-on-info-container">
                          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                            hourglass_top
                          </span>
                          <span className="font-label text-label-sm">
                            Higher Authority
                          </span>
                        </span>
                        <span className="font-mono text-mono-md text-light-on-surface-variant tabular-nums">
                          {prop.code}
                        </span>
                      </div>
                      <h2 className="font-title text-title-lg text-light-on-surface font-semibold">
                        {prop.title}
                      </h2>
                      <p className="font-body text-body-md text-light-on-surface-variant tabular-nums">
                        Proposed Date: {prop.event_date} · {prop.venue} · Budget: LKR {prop.budget.toLocaleString()}
                      </p>
                    </div>
                    <span className="font-label text-label-md text-light-on-surface-variant tabular-nums">
                      Submitted {prop.submitted_at}
                    </span>
                  </div>

                  {/* 4-Stage Approval Progress */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-sm pt-md border-t border-light-outline-variant">
                    <div className="flex items-center gap-xs text-on-success-container font-medium">
                      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                        check_circle
                      </span>
                      <span className="font-label text-label-sm">
                        1. Club Committee (5/5)
                      </span>
                    </div>
                    <div className="flex items-center gap-xs text-on-success-container font-medium">
                      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                        check_circle
                      </span>
                      <span className="font-label text-label-sm">
                        2. Lecturer Coordinator
                      </span>
                    </div>
                    <div className="flex items-center gap-xs text-on-info-container font-semibold">
                      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                        pending
                      </span>
                      <span className="font-label text-label-sm">
                        3. Dean of Student Affairs
                      </span>
                    </div>
                    <div className="flex items-center gap-xs text-light-on-surface-variant">
                      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                        radio_button_unchecked
                      </span>
                      <span className="font-label text-label-sm">
                        4. External Verification
                      </span>
                    </div>
                  </div>
                </article>
              );
            }

            if (prop.code === 'PROP-1091' || prop.status === 'Revision Requested') {
              return (
                <article
                  key={prop.id}
                  className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-wrap items-center justify-between gap-lg shadow-sm"
                >
                  <div className="flex flex-col gap-xs max-w-prose">
                    <div className="flex flex-wrap items-center gap-sm">
                      <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-warning-container text-on-warning-container">
                        <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                          edit_note
                        </span>
                        <span className="font-label text-label-sm">
                          Revision Requested
                        </span>
                      </span>
                      <span className="font-mono text-mono-md text-light-on-surface-variant tabular-nums">
                        {prop.code}
                      </span>
                    </div>
                    <h2 className="font-title text-title-lg text-light-on-surface font-semibold">
                      {prop.title}
                    </h2>
                    <p className="font-body text-body-md text-light-on-surface-variant">
                      {prop.comment || 'Comment from Dr. Kavinda Silva (Lecturer Coordinator): Please attach updated quotation.'}
                    </p>
                  </div>
                  <Link
                    to="/organizer/proposals/new"
                    className="inline-flex items-center justify-center px-md py-sm rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container transition-colors duration-state-change font-label text-label-lg whitespace-nowrap no-underline"
                  >
                    Edit &amp; Resubmit
                  </Link>
                </article>
              );
            }

            if (prop.status === 'Approved & Published') {
              return (
                <article
                  key={prop.id}
                  className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-wrap items-center justify-between gap-lg shadow-sm"
                >
                  <div className="flex flex-col gap-xs">
                    <div className="flex flex-wrap items-center gap-sm">
                      <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-success-container text-on-success-container">
                        <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                          check_circle
                        </span>
                        <span className="font-label text-label-sm">
                          Approved &amp; Published
                        </span>
                      </span>
                      <span className="font-mono text-mono-md text-light-on-surface-variant tabular-nums">
                        {prop.code}
                      </span>
                    </div>
                    <h2 className="font-title text-title-lg text-light-on-surface font-semibold">
                      {prop.title}
                    </h2>
                    <p className="font-body text-body-md text-light-on-surface-variant tabular-nums">
                      {prop.event_date} · {prop.venue} · Live on Student Event Explorer
                    </p>
                  </div>
                  <Link
                    to="/organizer/events"
                    className="inline-flex items-center justify-center px-md py-sm rounded bg-light-surface-container-lowest text-light-primary border border-light-outline-variant hover:bg-light-surface-container-low transition-colors duration-state-change font-label text-label-lg whitespace-nowrap no-underline"
                  >
                    Open Event
                  </Link>
                </article>
              );
            }

            // Drafts or newly created proposals
            return (
              <article
                key={prop.id}
                className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-wrap items-center justify-between gap-lg shadow-sm"
              >
                <div className="flex flex-col gap-xs">
                  <div className="flex flex-wrap items-center gap-sm">
                    <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-light-surface-container text-light-on-surface-variant">
                      <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                        draft
                      </span>
                      <span className="font-label text-label-sm">
                        {prop.status}
                      </span>
                    </span>
                    <span className="font-mono text-mono-md text-light-on-surface-variant tabular-nums">
                      {prop.code}
                    </span>
                  </div>
                  <h2 className="font-title text-title-lg text-light-on-surface font-semibold">
                    {prop.title}
                  </h2>
                  <p className="font-body text-body-md text-light-on-surface-variant tabular-nums">
                    {prop.comment || `Submitted ${prop.submitted_at} · Budget: LKR ${prop.budget?.toLocaleString()}`}
                  </p>
                </div>
                <Link
                  to="/organizer/proposals/new"
                  className="inline-flex items-center justify-center px-md py-sm rounded bg-light-surface-container-lowest text-light-primary border border-light-outline-variant hover:bg-light-surface-container-low transition-colors duration-state-change font-label text-label-lg whitespace-nowrap no-underline"
                >
                  {prop.status === 'Draft' ? 'Continue Draft' : 'View Details'}
                </Link>
              </article>
            );
          })}

          {filteredProposals.length === 0 && (
            <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-xl text-center flex flex-col items-center justify-center gap-sm">
              <span className="material-symbols-outlined text-[32px] text-light-on-surface-variant">
                folder_open
              </span>
              <p className="font-body text-body-md text-light-on-surface-variant">
                No proposals found under this filter.
              </p>
            </div>
          )}
        </section>
      </main>
    </OrganizerLayout>
  );
};

export default ProposalsAndApprovals;
