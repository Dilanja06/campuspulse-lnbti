import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthorityLayout } from '../../components/AuthorityLayout';
import { dataService } from '../../services/dataService';
import { ProposalItem } from '../../types';

export const ApprovalStages: React.FC = () => {
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStages = async () => {
      try {
        const all = await dataService.getProposals();
        const assigned = all.filter(
          (p) => p.stage === 3 || p.status === 'Higher Authority'
        );
        setProposals(assigned);
      } catch (err) {
        console.error('Failed to load assigned approval stages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStages();
  }, []);

  return (
    <AuthorityLayout>
      <main className="flex-1 p-xl max-w-[1280px] w-full mx-auto flex flex-col gap-lg">
        <div className="flex flex-col gap-xs">
          <h1 className="font-headline text-headline-lg text-light-on-surface">
            Assigned Approval Stages
          </h1>
          <p className="font-body text-body-md text-light-on-surface-variant">
            Proposals routed to the Dean of Student Affairs for executive sign-off.
          </p>
        </div>

        <section
          aria-label="Approval stages table"
          className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md overflow-hidden shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-light-surface-container-low border-b border-light-outline-variant">
                  <th className="px-md py-md font-label text-label-md text-light-on-surface-variant whitespace-nowrap">
                    Proposal ID
                  </th>
                  <th className="px-md py-md font-label text-label-md text-light-on-surface-variant whitespace-nowrap">
                    Event &amp; Club
                  </th>
                  <th className="px-md py-md font-label text-label-md text-light-on-surface-variant whitespace-nowrap">
                    Coordinator
                  </th>
                  <th className="px-md py-md font-label text-label-md text-light-on-surface-variant whitespace-nowrap">
                    Budget
                  </th>
                  <th className="px-md py-md font-label text-label-md text-light-on-surface-variant whitespace-nowrap">
                    Stage Status
                  </th>
                  <th className="px-md py-md font-label text-label-md text-light-on-surface-variant text-right whitespace-nowrap">
                    Decision
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-outline-variant">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-md py-xl text-center text-light-on-surface-variant font-body">
                      Loading assigned approval stages...
                    </td>
                  </tr>
                ) : proposals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-md py-xl text-center text-light-on-surface-variant font-body">
                      No proposals currently assigned for Dean executive sign-off.
                    </td>
                  </tr>
                ) : (
                  proposals.map((prop) => (
                    <tr key={prop.id} className="hover:bg-light-surface-container-low transition-colors duration-state-change">
                      <td className="px-md py-md font-mono text-mono-md text-light-on-surface-variant tabular-nums whitespace-nowrap">
                        {prop.code}
                      </td>
                      <td className="px-md py-md">
                        <div className="flex flex-col">
                          <span className="font-title text-title-md text-light-on-surface whitespace-nowrap font-medium">
                            {prop.title}
                          </span>
                          <span className="font-body text-body-md text-light-on-surface-variant">
                            {prop.club_name} · {prop.submitted_at || 'Nov 2026'}
                          </span>
                        </div>
                      </td>
                      <td className="px-md py-md font-body text-body-md text-light-on-surface whitespace-nowrap">
                        {prop.coordinator_endorsement?.name || prop.coordinator_endorsement?.by || 'Dr. Kavinda Silva'}
                      </td>
                      <td className="px-md py-md font-mono text-mono-md text-light-on-surface tabular-nums whitespace-nowrap">
                        LKR {prop.budget?.toLocaleString()}
                      </td>
                      <td className="px-md py-md whitespace-nowrap">
                        <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-info-container text-on-info-container whitespace-nowrap">
                          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                            hourglass_top
                          </span>
                          <span className="font-label text-label-sm">
                            Pending Decision
                          </span>
                        </span>
                      </td>
                      <td className="px-md py-md text-right whitespace-nowrap">
                        <Link
                          to={`/authority/stages/${prop.id}/sign-off`}
                          className="inline-flex items-center justify-center px-md py-xs rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container transition-colors duration-state-change no-underline"
                        >
                          <span className="font-label text-label-md whitespace-nowrap">Review</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </AuthorityLayout>
  );
};

export default ApprovalStages;
