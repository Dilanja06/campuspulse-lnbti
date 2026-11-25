import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { OrganizerLayout } from '../../components/OrganizerLayout';
import { ProposalItem } from '../../types';
import { dataService } from '../../services/dataService';

export const ProposalsAndApprovals: React.FC = () => {
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [bannerMsg, setBannerMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadProposals = async () => {
    setLoading(true);
    try {
      const data = await dataService.getProposals();
      setProposals(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
  }, []);

  const handlePublish = async (prop: ProposalItem) => {
    setBannerMsg(null);
    const res = await dataService.publishApprovedProposal(prop.id);
    if (res.success && res.event) {
      setBannerMsg({
        type: 'success',
        text: `Published live Event Edition "${res.event.title}" (${res.event.code}).`,
      });
      await loadProposals();
    } else {
      setBannerMsg({
        type: 'error',
        text: res.error || 'Proposal cannot be published yet.',
      });
    }
  };

  const filtered = proposals.filter((p) => {
    if (statusFilter === 'All') return true;
    if (statusFilter === 'Pending') {
      return p.status === 'Pending Review' || p.status === 'Higher Authority' || p.status === 'Draft';
    }
    return p.status.includes(statusFilter);
  });

  const statusChipClass = (status: string) => {
    if (status === 'Approved' || status === 'Approved & Published') {
      return 'bg-success-container text-on-success-container';
    }
    if (status === 'Revision Requested') return 'bg-warning-container text-on-warning-container';
    if (status === 'Rejected') return 'bg-light-error-container text-light-on-error-container';
    return 'bg-info-container text-on-info-container';
  };

  return (
    <OrganizerLayout>
      <main className="p-lg md:p-xl max-w-[1400px] w-full mx-auto flex flex-col gap-xl">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline text-headline-lg text-light-on-surface font-semibold">
              Event Proposals &amp; Approvals
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant">
              Track Committee Quorum, Coordinator Endorsement, Higher Authority sign-offs, revisions, and publication readiness.
            </p>
          </div>
          <Link
            to="/organizer/proposals/new"
            className="inline-flex items-center gap-xs px-md py-sm rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold no-underline hover:bg-light-primary-container"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>New Proposal</span>
          </Link>
        </header>

        {bannerMsg && (
          <div
            className={`p-md rounded-md border flex items-center gap-sm text-body-md ${
              bannerMsg.type === 'success'
                ? 'bg-success-container/30 border-success text-on-success-container'
                : 'bg-light-error-container border-light-error text-light-on-error-container'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {bannerMsg.type === 'success' ? 'check_circle' : 'gpp_bad'}
            </span>
            <span>{bannerMsg.text}</span>
          </div>
        )}

        <div className="flex items-center gap-xs flex-wrap">
          {['All', 'Pending', 'Revision Requested', 'Approved', 'Rejected'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-md py-xs rounded-full font-label text-label-md border cursor-pointer transition-colors ${
                statusFilter === tab
                  ? 'bg-light-primary text-light-on-primary border-light-primary'
                  : 'bg-light-surface-container-lowest text-light-on-surface-variant border-light-outline-variant hover:bg-light-surface-container-low'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-light-outline-variant bg-light-surface-container-low/50 text-light-on-surface-variant font-label text-label-sm">
                  <th className="px-md py-md">Code / Rev</th>
                  <th className="px-md py-md">Proposal Title &amp; Club</th>
                  <th className="px-md py-md">Date &amp; Budget</th>
                  <th className="px-md py-md">Current Stage</th>
                  <th className="px-md py-md text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-outline-variant">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-xl text-center text-light-on-surface-variant">
                      Loading proposals...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-xl text-center text-light-on-surface-variant">
                      No proposals found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((prop) => {
                    const isPublishable = prop.status === 'Approved' && prop.stage >= 4;
                    return (
                      <tr key={prop.id} className="hover:bg-light-surface-container-low/30">
                        <td className="px-md py-md whitespace-nowrap">
                          <div className="font-mono text-mono-md text-light-primary font-semibold">
                            {prop.code}
                          </div>
                          <div className="font-label text-label-sm text-light-on-surface-variant">
                            Rev #{prop.current_revision || 1}
                          </div>
                        </td>
                        <td className="px-md py-md">
                          <Link
                            to={`/organizer/proposals/${prop.id}`}
                            className="font-title text-title-md text-light-on-surface font-semibold no-underline hover:text-light-primary"
                          >
                            {prop.title}
                          </Link>
                          <div className="font-label text-label-sm text-light-on-surface-variant">
                            {prop.club_name} · {prop.venue}
                          </div>
                        </td>
                        <td className="px-md py-md whitespace-nowrap">
                          <div className="font-body text-body-md text-light-on-surface">{prop.event_date}</div>
                          <div className="font-mono text-mono-sm text-light-on-surface-variant tabular-nums">
                            LKR {prop.budget.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-md py-md whitespace-nowrap">
                          <span className={`inline-flex px-sm py-0.5 rounded-full font-label text-label-sm ${statusChipClass(prop.status)}`}>
                            Stage {prop.stage}: {prop.status}
                          </span>
                        </td>
                        <td className="px-md py-md text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-xs">
                            <Link
                              to={`/organizer/proposals/${prop.id}`}
                              className="px-sm py-xs rounded border border-light-outline-variant bg-light-surface-container-lowest text-light-on-surface font-label text-label-md font-medium no-underline hover:bg-light-surface-container-low"
                            >
                              {prop.status === 'Revision Requested' ? 'Revise' : 'Details'}
                            </Link>
                            {isPublishable && (
                              <button
                                type="button"
                                onClick={() => handlePublish(prop)}
                                className="px-sm py-xs rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold border-0 cursor-pointer hover:bg-light-primary-container"
                              >
                                Publish Event
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </OrganizerLayout>
  );
};

export default ProposalsAndApprovals;
