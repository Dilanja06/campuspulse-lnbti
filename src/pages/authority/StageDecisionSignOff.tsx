import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { dataService } from '../../services/dataService';
import { ProposalItem, ProposalDocument } from '../../types';
import { DocumentViewerModal } from '../../components/DocumentViewerModal';
import { getProposalDocuments } from '../../utils/documentUtils';

export const StageDecisionSignOff: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [proposal, setProposal] = useState<ProposalItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState(
    'Approved subject to university medical unit standby confirmation 48 hours prior to the event.'
  );
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeDocument, setActiveDocument] = useState<ProposalDocument | null>(null);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const all = await dataService.getProposals();
        // If an id is provided in URL, search by id or code; if not, default to the first pending proposal or PROP-1084
        let found = id ? all.find((p) => p.id === id || p.code === id) : null;
        if (!found) {
          found = all.find((p) => p.code === 'PROP-1084' || p.stage === 3) || all[0];
        }
        setProposal(found || null);
      } catch (err) {
        console.error('Failed to load proposal for authority sign-off:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProposal();
  }, [id]);

  const handleDecision = async (action: 'approve' | 'return' | 'reject') => {
    if (!proposal) return;
    setSubmitting(true);
    try {
      if (action === 'approve') {
        await dataService.approveAuthorityStage(proposal.id, remarks);
      } else if (action === 'return') {
        await dataService.returnAuthorityStage(proposal.id, remarks);
      } else {
        await dataService.rejectAuthorityStage(proposal.id, remarks);
      }
      setStatusMessage({
        type: 'success',
        text: `Proposal ${proposal.code} successfully ${
          action === 'approve' ? 'approved' : action === 'return' ? 'returned for revision' : 'rejected'
        }.`,
      });
      setTimeout(() => {
        navigate('/authority/history');
      }, 1000);
    } catch (err) {
      console.error(`Failed to execute ${action} decision:`, err);
      setStatusMessage({ type: 'error', text: 'An error occurred while saving executive decision.' });
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 p-xl max-w-[1160px] w-full mx-auto flex items-center justify-center">
        <p className="text-light-on-surface-variant font-body">Loading proposal for sign-off...</p>
      </main>
    );
  }

  if (!proposal) {
    return (
      <main className="flex-1 p-xl max-w-[1160px] w-full mx-auto flex flex-col gap-md items-center justify-center">
        <h2 className="font-headline text-headline-sm text-light-on-surface">Proposal Not Found</h2>
        <Link
          to="/authority/stages"
          className="px-md py-sm bg-light-primary text-light-on-primary rounded font-label text-label-md"
        >
          Return to Approval Stages
        </Link>
      </main>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Focused Task Flow Header */}
      <header className="h-16 bg-light-surface-container-lowest border-b border-light-outline-variant px-xl flex items-center justify-between gap-md sticky top-0 z-20">
        <div className="flex items-center gap-md">
          <Link
            to="/authority/stages"
            className="inline-flex items-center gap-xs text-light-primary hover:underline font-label text-label-lg whitespace-nowrap no-underline"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              arrow_back
            </span>
            <span>Back to Approval Stages</span>
          </Link>
          <span className="text-light-outline-variant" aria-hidden="true">|</span>
          <span className="font-title text-title-md text-light-on-surface">
            Stage 3: Dean of Student Affairs
          </span>
        </div>

        <span className="font-mono text-mono-md text-light-on-surface-variant tabular-nums">
          {proposal.code}
        </span>
      </header>

      <main className="flex-1 p-xl max-w-[1160px] w-full mx-auto flex flex-col gap-xl">
        {statusMessage && (
          <div
            className={`p-md rounded border flex items-center gap-sm ${
              statusMessage.type === 'success'
                ? 'bg-success-container text-on-success-container border-success/30'
                : 'bg-light-error-container text-light-on-error-container border-light-error/30'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {statusMessage.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span className="font-body text-body-md">{statusMessage.text}</span>
          </div>
        )}

        <div className="flex flex-col gap-xs">
          <div className="flex flex-wrap items-center gap-sm">
            <span
              role="status"
              className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-info-container text-on-info-container whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                verified_user
              </span>
              <span className="font-label text-label-sm">
                Assigned to Dean of Student Affairs
              </span>
            </span>
            <span className="font-label text-label-md text-light-on-surface-variant">
              {proposal.club_name}
            </span>
          </div>
          <h1 className="font-headline text-headline-lg text-light-on-surface">
            {proposal.title}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
          {/* Left: Proposal & Prior Approvals (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-lg">
            <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
              <h2 className="font-headline text-headline-sm text-light-on-surface">
                Proposal Overview
              </h2>
              <div className="grid grid-cols-2 gap-md">
                <div className="flex flex-col gap-xs">
                  <span className="font-label text-label-sm text-light-on-surface-variant">
                    Proposed Date
                  </span>
                  <span className="font-body text-body-md text-light-on-surface tabular-nums">
                    {proposal.submitted_at || '12 Dec 2026'} · 07:30 AM – 05:30 PM
                  </span>
                </div>
                <div className="flex flex-col gap-xs">
                  <span className="font-label text-label-sm text-light-on-surface-variant">
                    Venue
                  </span>
                  <span className="font-body text-body-md text-light-on-surface">
                    {proposal.venue}
                  </span>
                </div>
                <div className="flex flex-col gap-xs">
                  <span className="font-label text-label-sm text-light-on-surface-variant">
                    Requested Budget
                  </span>
                  <span className="font-mono text-mono-md text-light-on-surface tabular-nums font-semibold">
                    LKR {proposal.budget?.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col gap-xs">
                  <span className="font-label text-label-sm text-light-on-surface-variant">
                    Expected Attendance
                  </span>
                  <span className="font-mono text-mono-md text-light-on-surface tabular-nums">
                    {proposal.capacity} students
                  </span>
                </div>
              </div>
              <p className="font-body text-body-md text-light-on-surface-variant pt-sm border-t border-light-outline-variant">
                {proposal.description ||
                  'Annual inter-faculty track and field championship with medical standby unit, certified track marshals, and digital QR check-in for all athletes.'}
              </p>
            </section>

            {/* Attached Documents for Sign-off Review */}
            <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
              <div className="flex items-center justify-between gap-md flex-wrap">
                <div>
                  <h2 className="font-headline text-headline-sm text-light-on-surface m-0 font-semibold">
                    Attached Documents &amp; Compliance Clearances
                  </h2>
                  <p className="font-body text-body-sm text-light-on-surface-variant m-0 mt-0.5">
                    Endorsed by Lecturer Coordinator for Higher Authority executive audit.
                  </p>
                </div>
                <span className="font-mono text-mono-sm font-semibold text-light-primary bg-light-primary-container/20 px-sm py-xs rounded-full">
                  {getProposalDocuments(proposal).length} Document{getProposalDocuments(proposal).length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex flex-col gap-sm">
                {getProposalDocuments(proposal).map((doc) => (
                  <div
                    key={doc.id}
                    className="p-md rounded-lg bg-light-surface-container-low/40 border border-light-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-md"
                  >
                    <div className="flex items-start gap-md min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-light-primary/10 text-light-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[22px]">
                          {doc.type === 'clearance'
                            ? 'verified_user'
                            : doc.type === 'flyer'
                            ? 'image'
                            : 'picture_as_pdf'}
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-xs flex-wrap">
                          <span className="font-title text-title-md font-semibold text-light-on-surface truncate">
                            {doc.name}
                          </span>
                          <span
                            className={`font-label text-label-xs px-xs py-0.5 rounded-full ${
                              doc.verified
                                ? 'bg-success-container text-on-success-container'
                                : 'bg-info-container text-on-info-container'
                            }`}
                          >
                            {doc.verified ? 'Verified' : 'Attached'}
                          </span>
                        </div>
                        <div className="flex items-center gap-xs text-label-sm text-light-on-surface-variant flex-wrap mt-0.5">
                          <span>{doc.category_label || doc.type.toUpperCase()}</span>
                          <span>·</span>
                          <span>{doc.size || '350 KB'}</span>
                          <span>·</span>
                          <span>{doc.uploaded_at}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveDocument(doc)}
                      className="inline-flex items-center gap-xs px-md py-xs rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container font-label text-label-sm font-semibold cursor-pointer border-0 shrink-0 self-end sm:self-auto"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      <span>View Document</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
              <h2 className="font-headline text-headline-sm text-light-on-surface">
                Approval Chain Progress
              </h2>
              <ul className="divide-y divide-light-outline-variant">
                <li className="py-sm flex items-center justify-between gap-md">
                  <span className="font-body text-body-md text-light-on-surface">
                    1. {proposal.club_name} Committee (5 of 5)
                  </span>
                  <span className="font-label text-label-sm text-on-success-container bg-success-container px-sm py-xs rounded-full whitespace-nowrap">
                    Approved · 01 Nov
                  </span>
                </li>
                <li className="py-sm flex items-center justify-between gap-md">
                  <span className="font-body text-body-md text-light-on-surface">
                    2. {proposal.coordinator_endorsement?.name || proposal.coordinator_endorsement?.by || 'Dr. Kavinda Silva'} (Coordinator)
                  </span>
                  <span className="font-label text-label-sm text-on-success-container bg-success-container px-sm py-xs rounded-full whitespace-nowrap">
                    Endorsed · {proposal.coordinator_endorsement?.date || '03 Nov'}
                  </span>
                </li>
                <li className="py-sm flex items-center justify-between gap-md">
                  <span className="font-title text-title-md text-light-primary font-semibold">
                    3. Dean of Student Affairs
                  </span>
                  <span className="font-label text-label-sm text-on-info-container bg-info-container px-sm py-xs rounded-full whitespace-nowrap">
                    Current Stage
                  </span>
                </li>
              </ul>
            </section>
          </div>

          {/* Right: Authority Decision Form (5 cols) */}
          <aside className="lg:col-span-5 bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-lg shadow-sm">
            <h2 className="font-headline text-headline-sm text-light-on-surface">
              Executive Decision
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleDecision('approve');
              }}
              className="flex flex-col gap-md"
            >
              <div className="flex flex-col gap-xs">
                <label
                  htmlFor="authority-remarks"
                  className="font-label text-label-md text-light-on-surface font-medium"
                >
                  Official Remarks / Conditions
                </label>
                <textarea
                  id="authority-remarks"
                  rows={4}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-md py-sm rounded bg-light-surface-container-lowest border border-light-outline text-light-on-surface font-body text-body-md focus:border-light-primary focus:ring-2 focus:ring-light-primary/20"
                  placeholder="Enter remarks or approval stipulations..."
                  required
                />
              </div>

              <div className="flex flex-col gap-sm pt-sm">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-sm px-md rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container transition-colors duration-state-change font-label text-label-lg font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Recording Decision...' : 'Approve Assigned Stage'}
                </button>
                <div className="grid grid-cols-2 gap-sm">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleDecision('return')}
                    className="py-sm px-md rounded bg-warning-container text-on-warning-container hover:opacity-90 transition-colors duration-state-change font-label text-label-md font-medium disabled:opacity-50"
                  >
                    Return for Revision
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleDecision('reject')}
                    className="py-sm px-md rounded bg-light-surface-container-lowest text-light-error border border-light-outline-variant hover:bg-light-error-container transition-colors duration-state-change font-label text-label-md font-medium disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </form>
          </aside>
        </div>
      </main>

      {proposal && (
        <DocumentViewerModal
          isOpen={!!activeDocument}
          onClose={() => setActiveDocument(null)}
          document={activeDocument}
          proposalCode={proposal.code}
          proposalTitle={proposal.title}
          clubName={proposal.club_name}
          budget={proposal.budget}
          venue={proposal.venue}
          eventDate={proposal.event_date}
        />
      )}
    </div>
  );
};

export default StageDecisionSignOff;
