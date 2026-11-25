import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { OrganizerLayout } from '../../components/OrganizerLayout';
import { ProposalItem, ProposalRevision } from '../../types';
import { dataService } from '../../services/dataService';

export const ProposalDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [proposal, setProposal] = useState<ProposalItem | null>(null);
  const [revisions, setRevisions] = useState<ProposalRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Revision form (O05)
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [venue, setVenue] = useState('');
  const [capacity, setCapacity] = useState('150');
  const [fee, setFee] = useState('0');
  const [budget, setBudget] = useState('50000');
  const [description, setDescription] = useState('');
  const [revisionNote, setRevisionNote] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const loadProposalData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const prop = await dataService.getProposalById(id);
      setProposal(prop);
      if (prop) {
        const revHistory = await dataService.getProposalRevisions(prop.id);
        setRevisions(revHistory);
        setTitle(prop.title);
        setEventDate(prop.event_date);
        setVenue(prop.venue);
        setCapacity(String(prop.capacity));
        setFee(String(prop.fee));
        setBudget(String(prop.budget));
        setDescription(prop.description || prop.purpose || '');
        setDocumentName(prop.document_name || '');
        setDocumentUrl(prop.document_url || '');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProposalData();
  }, [id]);

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploaded = await dataService.uploadAsset(file, 'documents');
      setDocumentName(uploaded.name);
      setDocumentUrl(uploaded.url);
    } catch (err) {
      setActionMsg({ type: 'error', text: 'Failed to attach updated document.' });
    }
  };

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposal) return;
    setSaving(true);
    setActionMsg(null);
    try {
      const res = await dataService.reviseProposal(proposal.id, {
        title,
        event_date: eventDate,
        venue,
        capacity: Number(capacity) || proposal.capacity,
        fee: Number(fee) || 0,
        budget: Number(budget) || proposal.budget,
        description,
        comment: revisionNote || 'Officer revised details and resubmitted for review.',
        document_name: documentName || proposal.document_name,
        document_url: documentUrl || proposal.document_url,
      });
      if (res.success) {
        setEditMode(false);
        setRevisionNote('');
        setActionMsg({
          type: 'success',
          text: `Revision #${res.proposal?.current_revision || 2} submitted and routed to Coordinator review.`,
        });
        await loadProposalData();
      } else {
        setActionMsg({ type: 'error', text: 'Could not save revision.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePublishEventEdition = async () => {
    if (!proposal) return;
    setPublishing(true);
    setActionMsg(null);
    try {
      const res = await dataService.publishApprovedProposal(proposal.id);
      if (res.success && res.event) {
        setActionMsg({
          type: 'success',
          text: `Published live Event Edition "${res.event.title}" (${res.event.code}). Students can now register.`,
        });
        await loadProposalData();
      } else {
        setActionMsg({ type: 'error', text: res.error || 'Publication blocked by governance rules.' });
      }
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <OrganizerLayout>
        <main className="p-xl max-w-[1200px] mx-auto text-center text-light-on-surface-variant font-body text-body-md">
          Loading proposal details...
        </main>
      </OrganizerLayout>
    );
  }

  if (!proposal) {
    return (
      <OrganizerLayout>
        <main className="p-xl max-w-[1000px] mx-auto text-center flex flex-col gap-md">
          <h1 className="font-headline text-headline-md text-light-on-surface font-semibold">
            Proposal Not Found
          </h1>
          <Link to="/organizer/proposals" className="text-light-primary font-label text-label-md no-underline hover:underline">
            ← Back to Proposals &amp; Approvals
          </Link>
        </main>
      </OrganizerLayout>
    );
  }

  const canRevise = proposal.status === 'Revision Requested' || proposal.status === 'Draft';
  const isApproved = proposal.status === 'Approved' || proposal.stage >= 4;
  const isAlreadyPublished = proposal.status === 'Approved & Published';

  return (
    <OrganizerLayout>
      <main className="p-lg md:p-xl max-w-[1300px] w-full mx-auto flex flex-col gap-xl">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-md pb-md border-b border-light-outline-variant">
          <div className="flex flex-col gap-xs">
            <div className="flex items-center gap-sm flex-wrap">
              <button
                type="button"
                onClick={() => navigate('/organizer/proposals')}
                className="inline-flex items-center gap-xs text-light-on-surface-variant hover:text-light-on-surface font-label text-label-md bg-transparent border-0 cursor-pointer p-0"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>All Proposals</span>
              </button>
              <span className="text-light-outline">•</span>
              <span className="font-mono text-mono-md text-light-primary">{proposal.code}</span>
              <span className="font-label text-label-sm bg-light-surface-container-low px-sm py-0.5 rounded-full">
                Revision #{proposal.current_revision || 1}
              </span>
            </div>
            <h1 className="font-headline text-headline-lg text-light-on-surface font-semibold">
              {proposal.title}
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant">
              {proposal.club_name} · {proposal.category} · Stage {proposal.stage}: {proposal.stage_label || proposal.status}
            </p>
          </div>

          <div className="flex items-center gap-sm flex-wrap">
            {canRevise && (
              <button
                type="button"
                onClick={() => setEditMode(!editMode)}
                className="inline-flex items-center gap-xs px-md py-sm rounded bg-warning-container text-on-warning-container font-label text-label-md font-semibold cursor-pointer border-0"
              >
                <span className="material-symbols-outlined text-[18px]">edit_note</span>
                <span>{editMode ? 'Cancel Editing' : 'Revise & Resubmit'}</span>
              </button>
            )}

            <button
              type="button"
              disabled={!isApproved || isAlreadyPublished || publishing}
              onClick={handlePublishEventEdition}
              className={`inline-flex items-center gap-xs px-md py-sm rounded font-label text-label-md font-semibold border-0 transition-colors ${
                isApproved && !isAlreadyPublished
                  ? 'bg-light-primary text-light-on-primary hover:bg-light-primary-container cursor-pointer'
                  : 'bg-light-surface-container text-light-on-surface-variant opacity-60 cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">publish</span>
              <span>
                {isAlreadyPublished
                  ? 'Published Live'
                  : publishing
                  ? 'Publishing...'
                  : 'Publish Event Edition'}
              </span>
            </button>
          </div>
        </header>

        {actionMsg && (
          <div
            className={`p-md rounded-md border flex items-center gap-sm font-body text-body-md ${
              actionMsg.type === 'success'
                ? 'bg-success-container/30 border-success text-on-success-container'
                : 'bg-light-error-container border-light-error text-light-on-error-container'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {actionMsg.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{actionMsg.text}</span>
          </div>
        )}

        {!isApproved && !isAlreadyPublished && (
          <div className="p-md rounded-md bg-info-container/40 border border-info-container text-on-info-container flex items-start gap-sm text-body-md">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">shield_lock</span>
            <div>
              <strong>Governance Gate Enforced:</strong> Event publication is locked until both Lecturer Coordinator endorsement and Higher University Authority final approval are completed.
              {proposal.comment && <p className="mt-xs text-label-md"><strong>Reviewer Feedback:</strong> {proposal.comment}</p>}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
          {/* Left Column: Proposal Details OR O05 Revision Form */}
          <div className="lg:col-span-7 flex flex-col gap-lg">
            {editMode ? (
              <form
                onSubmit={handleResubmit}
                className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm"
              >
                <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold">
                  Revise Proposal (Creating Revision #{(proposal.current_revision || 1) + 1})
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <label className="flex flex-col gap-xs md:col-span-2">
                    <span className="font-label text-label-md text-light-on-surface font-semibold">Event Title</span>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest text-light-on-surface font-body text-body-md"
                    />
                  </label>
                  <label className="flex flex-col gap-xs">
                    <span className="font-label text-label-md text-light-on-surface font-semibold">Proposed Date</span>
                    <input
                      type="text"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest text-light-on-surface font-body text-body-md"
                    />
                  </label>
                  <label className="flex flex-col gap-xs">
                    <span className="font-label text-label-md text-light-on-surface font-semibold">Venue</span>
                    <input
                      type="text"
                      required
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest text-light-on-surface font-body text-body-md"
                    />
                  </label>
                  <label className="flex flex-col gap-xs">
                    <span className="font-label text-label-md text-light-on-surface font-semibold">Capacity</span>
                    <input
                      type="number"
                      min={1}
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest text-light-on-surface font-body text-body-md"
                    />
                  </label>
                  <label className="flex flex-col gap-xs">
                    <span className="font-label text-label-md text-light-on-surface font-semibold">Ticket Fee (LKR)</span>
                    <input
                      type="number"
                      min={0}
                      value={fee}
                      onChange={(e) => setFee(e.target.value)}
                      className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest text-light-on-surface font-body text-body-md"
                    />
                  </label>
                  <label className="flex flex-col gap-xs">
                    <span className="font-label text-label-md text-light-on-surface font-semibold">Updated Budget (LKR)</span>
                    <input
                      type="number"
                      min={0}
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest text-light-on-surface font-body text-body-md"
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-xs">
                  <span className="font-label text-label-md text-light-on-surface font-semibold">Updated Proposal Scope &amp; Purpose</span>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest text-light-on-surface font-body text-body-md resize-none"
                  />
                </label>

                <label className="flex flex-col gap-xs">
                  <span className="font-label text-label-md text-light-on-surface font-semibold">Summary of Revisions Made</span>
                  <input
                    type="text"
                    required
                    value={revisionNote}
                    onChange={(e) => setRevisionNote(e.target.value)}
                    placeholder="e.g., Adjusted lighting rental budget per Dean's stipulation"
                    className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest text-light-on-surface font-body text-body-md"
                  />
                </label>

                <label className="flex flex-col gap-xs">
                  <span className="font-label text-label-md text-light-on-surface font-semibold">Attach Revised Proposal PDF (Optional)</span>
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleDocumentUpload} className="text-body-sm" />
                  {documentName && <span className="text-label-sm text-light-primary">Attached: {documentName}</span>}
                </label>

                <div className="flex justify-end gap-sm pt-sm">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-lg py-sm rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold cursor-pointer border-0"
                  >
                    {saving ? 'Submitting Revision...' : 'Submit Revision to Coordinator'}
                  </button>
                </div>
              </form>
            ) : (
              <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
                <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold">
                  Proposal Specification
                </h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-md text-body-md">
                  <div>
                    <dt className="font-label text-label-sm text-light-on-surface-variant">Date &amp; Time</dt>
                    <dd className="font-semibold text-light-on-surface">{proposal.event_date} · {proposal.time}</dd>
                  </div>
                  <div>
                    <dt className="font-label text-label-sm text-light-on-surface-variant">Venue</dt>
                    <dd className="font-semibold text-light-on-surface">{proposal.venue}</dd>
                  </div>
                  <div>
                    <dt className="font-label text-label-sm text-light-on-surface-variant">Capacity</dt>
                    <dd className="font-semibold text-light-on-surface tabular-nums">{proposal.capacity} seats</dd>
                  </div>
                  <div>
                    <dt className="font-label text-label-sm text-light-on-surface-variant">Ticket Fee</dt>
                    <dd className="font-semibold text-light-on-surface tabular-nums">
                      {proposal.fee > 0 ? `LKR ${proposal.fee.toLocaleString()}` : 'Free Entry'}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-label text-label-sm text-light-on-surface-variant">Requested Budget</dt>
                    <dd className="font-mono font-semibold text-light-on-surface tabular-nums">
                      LKR {proposal.budget.toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-label text-label-sm text-light-on-surface-variant">Manual Approval Mode</dt>
                    <dd className="font-semibold text-light-on-surface">
                      {proposal.require_manual_approval ? 'Enabled' : 'Instant Reservation'}
                    </dd>
                  </div>
                </dl>
                {proposal.description && (
                  <div className="pt-sm border-t border-light-outline-variant">
                    <span className="font-label text-label-sm text-light-on-surface-variant">Description</span>
                    <p className="font-body text-body-md text-light-on-surface mt-xs">{proposal.description}</p>
                  </div>
                )}
              </section>
            )}

            {/* Immutable Revision History (SRS 3-Entity Versioning) */}
            <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
              <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold">
                Immutable Proposal Revisions ({revisions.length})
              </h2>
              {revisions.length === 0 ? (
                <p className="font-body text-body-md text-light-on-surface-variant">
                  Revision #1 initial snapshot active.
                </p>
              ) : (
                <div className="flex flex-col gap-sm">
                  {revisions.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-md rounded bg-light-surface-container-low/50 border border-light-outline-variant flex flex-col gap-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-label text-label-md text-light-primary font-bold">
                          Revision #{rev.revision_number} · {rev.status}
                        </span>
                        <span className="font-label text-label-sm text-light-on-surface-variant">
                          {rev.submitted_at}
                        </span>
                      </div>
                      <span className="font-body text-body-md text-light-on-surface">
                        {rev.title} · {rev.venue} · Budget LKR {rev.budget.toLocaleString()}
                      </span>
                      {rev.reviewer_comment && (
                        <span className="font-label text-label-sm text-light-on-surface-variant italic">
                          Note: {rev.reviewer_comment}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column: 4-Stage Sign-Off Timeline */}
          <aside className="lg:col-span-5 bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
            <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold">
              Multi-Stage Approval Timeline
            </h2>

            <ol className="flex flex-col gap-md">
              <li className="flex items-start gap-sm">
                <span className="material-symbols-outlined text-[20px] text-success mt-0.5">check_circle</span>
                <div className="flex flex-col">
                  <span className="font-title text-title-md text-light-on-surface font-semibold">
                    Stage 1: Club Committee Quorum
                  </span>
                  <span className="font-label text-label-sm text-light-on-surface-variant">
                    Mandatory officer signatures before Faculty routing
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-sm">
                <span
                  className={`material-symbols-outlined text-[20px] mt-0.5 ${
                    proposal.stage >= 3 || proposal.coordinator_endorsement ? 'text-success' : 'text-info-primary'
                  }`}
                >
                  {proposal.stage >= 3 || proposal.coordinator_endorsement ? 'check_circle' : 'hourglass_top'}
                </span>
                <div className="flex flex-col">
                  <span className="font-title text-title-md text-light-on-surface font-semibold">
                    Stage 2: Lecturer Coordinator Endorsement
                  </span>
                  <span className="font-label text-label-sm text-light-on-surface-variant">
                    {proposal.coordinator_endorsement
                      ? `Endorsed by ${proposal.coordinator_endorsement.name || proposal.coordinator_endorsement.by} (${proposal.coordinator_endorsement.date})`
                      : proposal.stage === 2
                      ? 'Currently under Faculty Coordinator review'
                      : 'Pending Coordinator vetting'}
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-sm">
                <span
                  className={`material-symbols-outlined text-[20px] mt-0.5 ${
                    proposal.stage >= 4 || proposal.status === 'Approved' || proposal.status === 'Approved & Published'
                      ? 'text-success'
                      : proposal.stage === 3
                      ? 'text-info-primary'
                      : 'text-light-on-surface-variant'
                  }`}
                >
                  {proposal.stage >= 4 || proposal.status === 'Approved' || proposal.status === 'Approved & Published'
                    ? 'check_circle'
                    : proposal.stage === 3
                    ? 'pending_actions'
                    : 'radio_button_unchecked'}
                </span>
                <div className="flex flex-col">
                  <span className="font-title text-title-md text-light-on-surface font-semibold">
                    Stage 3: Higher University Authority Sign-Off
                  </span>
                  <span className="font-label text-label-sm text-light-on-surface-variant">
                    {proposal.authorities && proposal.authorities.length > 0
                      ? `Routed to: ${proposal.authorities.join(', ')}`
                      : 'Dean / Bursar / Registrar sign-off'}
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-sm">
                <span
                  className={`material-symbols-outlined text-[20px] mt-0.5 ${
                    isAlreadyPublished ? 'text-success' : isApproved ? 'text-light-primary' : 'text-light-on-surface-variant'
                  }`}
                >
                  {isAlreadyPublished ? 'verified' : isApproved ? 'publish' : 'lock'}
                </span>
                <div className="flex flex-col">
                  <span className="font-title text-title-md text-light-on-surface font-semibold">
                    Stage 4: Publication as Event Edition
                  </span>
                  <span className="font-label text-label-sm text-light-on-surface-variant">
                    {isAlreadyPublished
                      ? 'Published and accepting student registrations'
                      : isApproved
                      ? 'Ready to publish via Publish Event Edition above'
                      : 'Locked until Stage 3 Authority approval completes'}
                  </span>
                </div>
              </li>
            </ol>
          </aside>
        </div>
      </main>
    </OrganizerLayout>
  );
};

export default ProposalDetails;
