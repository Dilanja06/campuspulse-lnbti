import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CoordinatorLayout } from '../../components/CoordinatorLayout';
import { dataService } from '../../services/dataService';
import { ProposalItem } from '../../types';

export const ProposalReviewQueue: React.FC = () => {
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'revision' | 'endorsed'>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const all = await dataService.getProposals();
        setProposals(all);
      } catch (err) {
        console.warn('Error fetching review queue:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, []);

  const pendingList = proposals.filter((p) => p.status === 'Pending Review' || p.stage === 2);
  const revisionList = proposals.filter((p) => p.status === 'Revision Requested');
  const endorsedList = proposals.filter(
    (p) => p.status === 'Higher Authority' || p.status === 'Approved & Published' || p.status === 'Endorsed' || p.stage >= 3
  );

  const currentTabList = () => {
    if (activeTab === 'pending') return pendingList;
    if (activeTab === 'revision') return revisionList;
    if (activeTab === 'endorsed') return endorsedList;
    return pendingList;
  };

  return (
    <CoordinatorLayout>
      <main className="flex-1 p-xl max-w-[1280px] w-full mx-auto flex flex-col gap-lg">
        <div className="flex flex-col gap-xs">
          <h1 className="font-headline text-headline-lg text-light-on-surface">
            Proposal Review Queue
          </h1>
          <p className="font-body text-body-md text-light-on-surface-variant">
            Proposals endorsed by all 5 club decision-makers from your assigned clubs.
          </p>
        </div>

        {/* Filter Tabs */}
        <div role="tablist" aria-label="Proposal review filters" className="flex flex-wrap items-center gap-sm border-b border-light-outline-variant pb-md">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'pending'}
            onClick={() => setActiveTab('pending')}
            className={`px-md py-xs rounded-full cursor-pointer transition-colors ${
              activeTab === 'pending'
                ? 'bg-light-primary text-light-on-primary font-semibold'
                : 'bg-light-surface-container-lowest text-light-on-surface-variant border border-light-outline-variant hover:bg-light-surface-container-low'
            }`}
          >
            <span className="font-label text-label-md">
              Pending Review ({pendingList.length})
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'revision'}
            onClick={() => setActiveTab('revision')}
            className={`px-md py-xs rounded-full cursor-pointer transition-colors ${
              activeTab === 'revision'
                ? 'bg-light-primary text-light-on-primary font-semibold'
                : 'bg-light-surface-container-lowest text-light-on-surface-variant border border-light-outline-variant hover:bg-light-surface-container-low'
            }`}
          >
            <span className="font-label text-label-md">
              Revision Requested ({revisionList.length})
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'endorsed'}
            onClick={() => setActiveTab('endorsed')}
            className={`px-md py-xs rounded-full cursor-pointer transition-colors ${
              activeTab === 'endorsed'
                ? 'bg-light-primary text-light-on-primary font-semibold'
                : 'bg-light-surface-container-lowest text-light-on-surface-variant border border-light-outline-variant hover:bg-light-surface-container-low'
            }`}
          >
            <span className="font-label text-label-md">
              Endorsed &amp; Escalated ({endorsedList.length})
            </span>
          </button>
        </div>

        {/* Proposals Table */}
        <section aria-label="Proposals awaiting review" className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-light-surface-container-low border-b border-light-outline-variant">
                  <th scope="col" className="px-md py-md font-label text-label-md text-light-on-surface-variant whitespace-nowrap">
                    ID
                  </th>
                  <th scope="col" className="px-md py-md font-label text-label-md text-light-on-surface-variant whitespace-nowrap">
                    Event &amp; Club
                  </th>
                  <th scope="col" className="px-md py-md font-label text-label-md text-light-on-surface-variant whitespace-nowrap">
                    Date
                  </th>
                  <th scope="col" className="px-md py-md font-label text-label-md text-light-on-surface-variant whitespace-nowrap">
                    Budget
                  </th>
                  <th scope="col" className="px-md py-md font-label text-label-md text-light-on-surface-variant whitespace-nowrap">
                    Status
                  </th>
                  <th scope="col" className="px-md py-md font-label text-label-md text-light-on-surface-variant text-right whitespace-nowrap">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-outline-variant">
                {currentTabList().map((prop) => (
                  <tr key={prop.id} className="hover:bg-light-surface-container-low/40 transition-colors">
                    <td className="px-md py-md font-mono text-mono-md text-light-on-surface-variant tabular-nums whitespace-nowrap">
                      {prop.code}
                    </td>
                    <td className="px-md py-md">
                      <div className="flex flex-col">
                        <span className="font-title text-title-md text-light-on-surface font-semibold whitespace-nowrap">
                          {prop.title}
                        </span>
                        <span className="font-body text-body-md text-light-on-surface-variant">
                          {prop.club_name} {prop.comment ? `· ${prop.comment}` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-md py-md font-body text-body-md text-light-on-surface tabular-nums whitespace-nowrap">
                      {prop.event_date}
                    </td>
                    <td className="px-md py-md font-mono text-mono-md text-light-on-surface tabular-nums whitespace-nowrap">
                      LKR {prop.budget.toLocaleString()}
                    </td>
                    <td className="px-md py-md whitespace-nowrap">
                      {prop.status === 'Pending Review' || prop.stage === 2 && prop.status !== 'Revision Requested' ? (
                        <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-info-container text-on-info-container whitespace-nowrap">
                          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                            hourglass_top
                          </span>
                          <span className="font-label text-label-sm">
                            Pending Review
                          </span>
                        </span>
                      ) : prop.status === 'Revision Requested' ? (
                        <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-warning-container text-on-warning-container whitespace-nowrap">
                          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                            edit_note
                          </span>
                          <span className="font-label text-label-sm">
                            Revision Sent
                          </span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-success-container text-on-success-container whitespace-nowrap">
                          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                            check_circle
                          </span>
                          <span className="font-label text-label-sm">
                            Endorsed
                          </span>
                        </span>
                      )}
                    </td>
                    <td className="px-md py-md text-right whitespace-nowrap">
                      <Link
                        to={`/coordinator/proposals/${prop.id}/review`}
                        className={`inline-flex items-center justify-center px-md py-xs rounded font-label text-label-md whitespace-nowrap no-underline transition-colors ${
                          prop.status === 'Pending Review' || (prop.stage === 2 && prop.status !== 'Revision Requested')
                            ? 'bg-light-primary text-light-on-primary hover:bg-light-primary-container'
                            : 'bg-light-surface-container-lowest text-light-primary border border-light-outline-variant hover:bg-light-surface-container-low'
                        }`}
                      >
                        {prop.status === 'Pending Review' || (prop.stage === 2 && prop.status !== 'Revision Requested') ? 'Review' : 'View'}
                      </Link>
                    </td>
                  </tr>
                ))}

                {currentTabList().length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-lg py-xl text-center text-light-on-surface-variant font-body text-body-md">
                      No proposals found in this section.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </CoordinatorLayout>
  );
};

export default ProposalReviewQueue;
