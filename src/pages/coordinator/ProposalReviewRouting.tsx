import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CoordinatorLayout } from '../../components/CoordinatorLayout';
import { dataService } from '../../services/dataService';
import { ProposalItem, ProposalDocument } from '../../types';
import { getEventCoverImage } from '../../utils/eventImages';
import { DocumentViewerModal } from '../../components/DocumentViewerModal';
import { getProposalDocuments } from '../../utils/documentUtils';

export const ProposalReviewRouting: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [proposal, setProposal] = useState<ProposalItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Authority Checkboxes
  const [deanStudentAffairs, setDeanStudentAffairs] = useState(true);
  const [facultyDean, setFacultyDean] = useState(true);
  const [bursarFinance, setBursarFinance] = useState(false);
  const [externalApproval, setExternalApproval] = useState(true);

  // Comment
  const [comment, setComment] = useState(
    'Budget and external sponsorship MoU verified. Routing to Dean of Student Affairs and External Verification.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDocument, setActiveDocument] = useState<ProposalDocument | null>(null);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const targetId = id || 'prop-1094';
        const data = await dataService.getProposalById(targetId);
        if (data) {
          setProposal(data);
          if (data.comment) setComment(data.comment);
        } else {
          // Fallback to first pending proposal
          const all = await dataService.getProposals();
          setProposal(all[0]);
        }
      } catch (err) {
        console.warn('Error loading proposal for review:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProposal();
  }, [id]);

  const handleApproveAndRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposal) return;
    setIsSubmitting(true);
    const selectedAuthorities: string[] = [];
    if (deanStudentAffairs) selectedAuthorities.push('Dean of Student Affairs');
    if (facultyDean) selectedAuthorities.push('Faculty Dean');
    if (bursarFinance) selectedAuthorities.push('University Bursar / Finance Office');
    if (externalApproval) selectedAuthorities.push('External-Approval Verification Staff');

    await dataService.endorseProposal(proposal.id, selectedAuthorities, comment);
    navigate('/coordinator/proposals');
  };

  const handleRequestRevision = async () => {
    if (!proposal) return;
    setIsSubmitting(true);
    await dataService.requestRevisionProposal(proposal.id, comment);
    navigate('/coordinator/proposals');
  };

  const handleReject = async () => {
    if (!proposal) return;
    setIsSubmitting(true);
    await dataService.rejectProposal(proposal.id, comment);
    navigate('/coordinator/proposals');
  };

  const propCode = proposal?.code || 'PROP-1094';
  const propTitle = proposal?.title || 'Inter-University Robotics Hackathon';
  const propClub = proposal?.club_name || 'Robotics Society';
  const propDate = proposal?.event_date || '05 Dec 2026';
  const propTime = proposal?.time || '08:00 AM – 08:00 PM';
  const propVenue = proposal?.venue || 'Engineering Block B · Innovation Lab';
  const propCapacity = proposal?.capacity || 120;
  const propBudget = proposal?.budget || 120000;
  const propDesc =
    proposal?.description ||
    '24-hour hardware prototyping challenge open to undergraduates across 4 partner universities, with external industry mentorship and prize pool sponsorship.';

  const documents = getProposalDocuments(proposal);

  return (
    <CoordinatorLayout>
      {/* Header Bar with Back Link */}
      <div className="h-16 bg-light-surface-container-lowest border-b border-light-outline-variant px-xl flex items-center justify-between gap-md sticky top-16 z-10">
        <div className="flex items-center gap-md">
          <Link
            to="/coordinator/proposals"
            className="inline-flex items-center gap-xs text-light-primary hover:underline font-label text-label-lg no-underline"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              arrow_back
            </span>
            <span>Back to Review Queue</span>
          </Link>
          <span className="text-light-outline-variant" aria-hidden="true">
            |
          </span>
          <span className="font-title text-title-md text-light-on-surface font-semibold">
            Proposal Review &amp; Authority Routing
          </span>
        </div>

        <span className="font-mono text-mono-md text-light-on-surface-variant tabular-nums">
          {propCode}
        </span>
      </div>

      <main className="flex-1 p-xl max-w-[1160px] w-full mx-auto flex flex-col gap-xl">
        {/* Proposal Header */}
        <div className="flex flex-wrap items-start justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <div className="flex flex-wrap items-center gap-sm">
              <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-info-container text-on-info-container whitespace-nowrap">
                <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                  hourglass_top
                </span>
                <span className="font-label text-label-sm">
                  Pending Coordinator Review
                </span>
              </span>
              <span className="font-label text-label-md text-light-on-surface-variant">
                Submitted by {propClub}
              </span>
            </div>
            <h1 className="font-headline text-headline-lg text-light-on-surface">
              {propTitle}
            </h1>
          </div>
        </div>

        {/* Cover Preview */}
        <div className="h-44 rounded-lg overflow-hidden relative shadow-sm border border-light-outline-variant bg-slate-900">
          <img
            src={getEventCoverImage(proposal || { code: propCode, title: propTitle })}
            alt={propTitle}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-md flex items-end justify-between text-white">
            <span className="text-xs font-mono px-sm py-xs rounded bg-black/60 backdrop-blur-sm border border-white/10">
              Cover Flyer Attached · {propCode}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
          {/* Left: Proposal Summary & Committee Sign-offs (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-lg">
            <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
              <h2 className="font-headline text-headline-sm text-light-on-surface">
                Event &amp; Budget Summary
              </h2>
              <div className="grid grid-cols-2 gap-md">
                <div className="flex flex-col gap-xs">
                  <span className="font-label text-label-sm text-light-on-surface-variant">
                    Date &amp; Time
                  </span>
                  <span className="font-body text-body-md text-light-on-surface tabular-nums">
                    {propDate} · {propTime}
                  </span>
                </div>
                <div className="flex flex-col gap-xs">
                  <span className="font-label text-label-sm text-light-on-surface-variant">
                    Venue
                  </span>
                  <span className="font-body text-body-md text-light-on-surface">
                    {propVenue}
                  </span>
                </div>
                <div className="flex flex-col gap-xs">
                  <span className="font-label text-label-sm text-light-on-surface-variant">
                    Expected Capacity
                  </span>
                  <span className="font-mono text-mono-md text-light-on-surface tabular-nums">
                    {propCapacity} participants
                  </span>
                </div>
                <div className="flex flex-col gap-xs">
                  <span className="font-label text-label-sm text-light-on-surface-variant">
                    Proposed Budget
                  </span>
                  <span className="font-mono text-mono-md text-light-on-surface tabular-nums font-semibold">
                    LKR {propBudget.toLocaleString()}
                  </span>
                </div>
              </div>
              <p className="font-body text-body-md text-light-on-surface-variant pt-sm border-t border-light-outline-variant">
                {propDesc}
              </p>
            </section>

            {/* Uploaded Documents & Clearances Section */}
            <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
              <div className="flex items-center justify-between gap-md flex-wrap">
                <div>
                  <h2 className="font-headline text-headline-sm text-light-on-surface m-0">
                    Uploaded Proposal Documents &amp; Clearances
                  </h2>
                  <p className="font-body text-body-sm text-light-on-surface-variant m-0 mt-0.5">
                    Official files attached by the organizing club for lecturer coordinator review and compliance check.
                  </p>
                </div>
                <span className="font-mono text-mono-sm font-semibold text-light-primary bg-light-primary-container/20 px-sm py-xs rounded-full">
                  {documents.length} File{documents.length !== 1 ? 's' : ''} Attached
                </span>
              </div>

              <div className="flex flex-col gap-sm">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-md rounded-lg bg-light-surface-container-low/40 border border-light-outline-variant hover:border-light-primary/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-md"
                  >
                    <div className="flex items-start gap-md min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-light-primary/10 text-light-primary flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                        <span className="material-symbols-outlined text-[22px]">
                          {doc.type === 'clearance'
                            ? 'verified_user'
                            : doc.type === 'flyer'
                            ? 'image'
                            : 'description'}
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
                          <span>Uploaded {doc.uploaded_at}</span>
                          {doc.issuer && (
                            <>
                              <span>·</span>
                              <span className="text-light-primary font-medium">Issuer: {doc.issuer}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-xs shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setActiveDocument(doc)}
                        className="inline-flex items-center gap-xs px-md py-xs rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container font-label text-label-sm font-semibold cursor-pointer border-0 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        <span>View Document</span>
                      </button>
                    </div>
                  </div>
                ))}

                {documents.length === 0 && (
                  <p className="font-body text-body-md text-light-on-surface-variant p-md bg-light-surface-container-low/40 rounded text-center">
                    No documents attached to this proposal yet.
                  </p>
                )}
              </div>
            </section>

            <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
              <h2 className="font-headline text-headline-sm text-light-on-surface">
                Committee Sign-offs (5 of 5)
              </h2>
              <ul className="divide-y divide-light-outline-variant list-none p-0 m-0">
                <li className="py-sm flex items-center justify-between gap-md">
                  <div className="flex flex-col">
                    <span className="font-title text-title-md text-light-on-surface font-medium">
                      Kavindu Senaratne
                    </span>
                    <span className="font-label text-label-sm text-light-on-surface-variant">
                      President · Robotics Society
                    </span>
                  </div>
                  <span className="font-label text-label-sm text-on-success-container bg-success-container px-sm py-xs rounded-full whitespace-nowrap">
                    Approved · 08 Nov
                  </span>
                </li>

                <li className="py-sm flex items-center justify-between gap-md">
                  <div className="flex flex-col">
                    <span className="font-title text-title-md text-light-on-surface font-medium">
                      Nisal Fonseka
                    </span>
                    <span className="font-label text-label-sm text-light-on-surface-variant">
                      Secretary
                    </span>
                  </div>
                  <span className="font-label text-label-sm text-on-success-container bg-success-container px-sm py-xs rounded-full whitespace-nowrap">
                    Approved · 08 Nov
                  </span>
                </li>

                <li className="py-sm flex items-center justify-between gap-md">
                  <div className="flex flex-col">
                    <span className="font-title text-title-md text-light-on-surface font-medium">
                      Dinithi Perera
                    </span>
                    <span className="font-label text-label-sm text-light-on-surface-variant">
                      Treasurer
                    </span>
                  </div>
                  <span className="font-label text-label-sm text-on-success-container bg-success-container px-sm py-xs rounded-full whitespace-nowrap">
                    Approved · 07 Nov
                  </span>
                </li>

                <li className="py-sm flex items-center justify-between gap-md">
                  <div className="flex flex-col">
                    <span className="font-title text-title-md text-light-on-surface font-medium">
                      Heshan Alwis
                    </span>
                    <span className="font-label text-label-sm text-light-on-surface-variant">
                      Technical Lead
                    </span>
                  </div>
                  <span className="font-label text-label-sm text-on-success-container bg-success-container px-sm py-xs rounded-full whitespace-nowrap">
                    Approved · 07 Nov
                  </span>
                </li>

                <li className="py-sm flex items-center justify-between gap-md">
                  <div className="flex flex-col">
                    <span className="font-title text-title-md text-light-on-surface font-medium">
                      Minoli Jayasuriya
                    </span>
                    <span className="font-label text-label-sm text-light-on-surface-variant">
                      Vice President
                    </span>
                  </div>
                  <span className="font-label text-label-sm text-on-success-container bg-success-container px-sm py-xs rounded-full whitespace-nowrap">
                    Approved · 07 Nov
                  </span>
                </li>
              </ul>
            </section>
          </div>

          {/* Right: Coordinator Decision & Higher Authority Routing (5 cols) */}
          <aside className="lg:col-span-5 bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-lg shadow-sm">
            <h2 className="font-headline text-headline-sm text-light-on-surface">
              Coordinator Decision
            </h2>

            <form onSubmit={handleApproveAndRoute} className="flex flex-col gap-md">
              <div className="flex flex-col gap-xs">
                <span className="font-label text-label-md text-light-on-surface font-semibold">
                  Select Higher Authorities for Approval
                </span>
                <p className="font-body text-body-md text-light-on-surface-variant">
                  Choose the university authorities required to sign off after your endorsement.
                </p>

                <div className="flex flex-col gap-sm pt-xs select-none">
                  <label className="flex items-center gap-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={deanStudentAffairs}
                      onChange={(e) => setDeanStudentAffairs(e.target.checked)}
                      className="rounded border-light-outline text-light-primary focus:ring-light-primary w-4 h-4"
                    />
                    <span className="font-body text-body-md text-light-on-surface">
                      Dean of Student Affairs
                    </span>
                  </label>
                  <label className="flex items-center gap-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={facultyDean}
                      onChange={(e) => setFacultyDean(e.target.checked)}
                      className="rounded border-light-outline text-light-primary focus:ring-light-primary w-4 h-4"
                    />
                    <span className="font-body text-body-md text-light-on-surface">
                      Faculty Dean (Engineering)
                    </span>
                  </label>
                  <label className="flex items-center gap-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bursarFinance}
                      onChange={(e) => setBursarFinance(e.target.checked)}
                      className="rounded border-light-outline text-light-primary focus:ring-light-primary w-4 h-4"
                    />
                    <span className="font-body text-body-md text-light-on-surface">
                      University Bursar / Finance Office
                    </span>
                  </label>
                  <label className="flex items-center gap-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={externalApproval}
                      onChange={(e) => setExternalApproval(e.target.checked)}
                      className="rounded border-light-outline text-light-primary focus:ring-light-primary w-4 h-4"
                    />
                    <span className="font-body text-body-md text-light-on-surface">
                      External-Approval Verification Staff
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-xs pt-sm border-t border-light-outline-variant">
                <label
                  htmlFor="coordinator-comment"
                  className="font-label text-label-md text-light-on-surface font-semibold"
                >
                  Coordinator Comments / Instructions
                </label>
                <textarea
                  id="coordinator-comment"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add endorsement notes or revision instructions for the club organizer..."
                  className="w-full px-md py-sm rounded bg-light-surface-container-lowest border border-light-outline text-light-on-surface font-body text-body-md focus:border-light-primary focus:ring-2 focus:ring-light-primary/20 outline-none resize-none"
                />
              </div>

              <div className="flex flex-col gap-sm pt-sm">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-sm px-md rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container transition-colors duration-state-change font-label text-label-lg cursor-pointer disabled:opacity-50"
                >
                  Approve &amp; Route to Authorities
                </button>
                <div className="grid grid-cols-2 gap-sm">
                  <button
                    type="button"
                    onClick={handleRequestRevision}
                    disabled={isSubmitting}
                    className="py-sm px-md rounded bg-warning-container text-on-warning-container hover:opacity-90 transition-colors duration-state-change font-label text-label-md cursor-pointer"
                  >
                    Request Revision
                  </button>
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={isSubmitting}
                    className="py-sm px-md rounded bg-light-surface-container-lowest text-light-error border border-light-outline-variant hover:bg-light-error-container transition-colors duration-state-change font-label text-label-md cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </form>
          </aside>
        </div>
      </main>

      <DocumentViewerModal
        isOpen={!!activeDocument}
        onClose={() => setActiveDocument(null)}
        document={activeDocument}
        proposalCode={propCode}
        proposalTitle={propTitle}
        clubName={propClub}
        budget={propBudget}
        venue={propVenue}
        eventDate={propDate}
      />
    </CoordinatorLayout>
  );
};

export default ProposalReviewRouting;
