import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrganizerLayout } from '../../components/OrganizerLayout';
import { ProposalItem } from '../../types';
import { dataService } from '../../services/dataService';
import { getEventCoverImage } from '../../utils/eventImages';

export const CreateEventProposal: React.FC = () => {
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Technical' | 'Sports' | 'Cultural' | 'Academic' | 'Community Service'>('Technical');
  const [clubId, setClubId] = useState('club-cs');
  const [eventDate, setEventDate] = useState('15 Dec 2026');
  const [time, setTime] = useState('09:00 AM');
  const [venue, setVenue] = useState('Main Auditorium');
  const [capacity, setCapacity] = useState('150');
  const [fee, setFee] = useState('0');
  const [budget, setBudget] = useState('85000');
  const [description, setDescription] = useState('');
  const [refundPolicy, setRefundPolicy] = useState('Full refund up to 48 hours prior or upon official cancellation.');
  const [holdDuration, setHoldDuration] = useState('10 mins');
  const [requireManualApproval, setRequireManualApproval] = useState(false);
  const [externalApproval, setExternalApproval] = useState('None Required');

  const [imageUrl, setImageUrl] = useState('');
  const [imageName, setImageName] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [clubs, setClubs] = useState<{ id: string; name: string }[]>([
    { id: 'club-cs', name: 'Computer Society (CS)' },
    { id: 'club-sports', name: 'University Sports Council' },
    { id: 'club-robotics', name: 'Robotics & Automation Society' },
    { id: 'club-drama', name: 'Drama & Performing Arts Circle' },
    { id: 'club-rotaract', name: 'Rotaract Club' },
  ]);

  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    dataService.getClubs().then((loaded) => {
      if (loaded.length > 0) {
        setClubs(loaded.map((c) => ({ id: c.id, name: c.name })));
      }
    });
  }, []);

  const selectedClub = clubs.find((c) => c.id === clubId)?.name || 'Computer Society (CS)';
  const fallbackPreviewImg = getEventCoverImage({ category });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const uploaded = await dataService.uploadAsset(file, 'flyers');
      setImageUrl(uploaded.url);
      setImageName(uploaded.name);
    } catch {
      setErrorMsg('Failed to upload flyer image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDoc(true);
    try {
      const uploaded = await dataService.uploadAsset(file, 'documents');
      setDocumentUrl(uploaded.url);
      setDocumentName(uploaded.name);
    } catch {
      setErrorMsg('Failed to upload proposal document.');
    } finally {
      setUploadingDoc(false);
    }
  };

  const submitProposal = async (asDraft = false) => {
    if (!title.trim()) {
      setErrorMsg('Please enter an Event Title before submitting.');
      setActiveStep(1);
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const statusVal: ProposalItem['status'] = asDraft ? 'Draft' : 'Pending Review';
      const created = await dataService.createProposal({
        title: title.trim(),
        club_id: clubId,
        club_name: selectedClub,
        category,
        event_date: eventDate,
        time,
        venue,
        capacity: Number(capacity) || 100,
        fee: Number(fee) || 0,
        budget: Number(budget) || 0,
        status: statusVal,
        stage: asDraft ? 1 : 2,
        stage_label: asDraft ? 'Officer Draft (Unsent)' : 'Submitted to Coordinator Review',
        hold_duration: holdDuration,
        require_manual_approval: requireManualApproval,
        external_approval: externalApproval,
        image_url: imageUrl || fallbackPreviewImg,
        description: description.trim() || `${selectedClub} official campus event proposal.`,
        refund_policy: refundPolicy,
        document_name: documentName || undefined,
        document_url: documentUrl || undefined,
      });

      // SRS Governance Rule: NEVER auto-publish a live Event Edition before Coordinator & Higher Authority approvals.
      navigate(`/organizer/proposals/${created.id}`);
    } catch (err) {
      console.error('Proposal creation failed:', err);
      setErrorMsg('Failed to persist proposal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitProposal(false);
  };

  return (
    <OrganizerLayout>
      <main className="p-lg md:p-xl max-w-[1100px] w-full mx-auto flex flex-col gap-xl">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline text-headline-lg text-light-on-surface font-semibold">
              Create Event Proposal (O03)
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant">
              Proposals enter Committee Quorum &amp; Coordinator Review prior to Higher Authority sign-off. Events only publish after full approval.
            </p>
          </div>
          <div className="flex items-center gap-sm">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center gap-xs px-md py-sm rounded bg-light-surface-container-lowest border border-light-outline-variant text-light-on-surface font-label text-label-md font-semibold cursor-pointer hover:bg-light-surface-container-low"
            >
              <span className="material-symbols-outlined text-[18px]">visibility</span>
              <span>Preview Card</span>
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => submitProposal(true)}
              className="px-md py-sm rounded bg-light-surface-container-lowest border border-light-outline-variant text-light-on-surface-variant font-label text-label-md font-semibold cursor-pointer hover:bg-light-surface-container-low"
            >
              Save Draft
            </button>
          </div>
        </header>

        {/* Interactive Step Pills */}
        <nav aria-label="Proposal creation steps" className="grid grid-cols-3 gap-sm bg-light-surface-container-low p-xs rounded-md">
          {[
            { num: 1 as const, label: '1. Core Event Details' },
            { num: 2 as const, label: '2. Budget, Seats & Policy' },
            { num: 3 as const, label: '3. Media & Governance' },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setActiveStep(s.num)}
              className={`py-sm px-md rounded font-label text-label-md font-semibold border-0 cursor-pointer transition-all ${
                activeStep === s.num
                  ? 'bg-light-surface-container-lowest text-light-primary shadow-sm'
                  : 'bg-transparent text-light-on-surface-variant hover:text-light-on-surface'
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>

        {errorMsg && (
          <div className="p-md rounded bg-light-error-container text-light-on-error-container font-body text-body-md">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg md:p-xl flex flex-col gap-lg shadow-sm">
          {activeStep === 1 && (
            <div className="flex flex-col gap-md">
              <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold m-0">
                Core Event Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <label className="flex flex-col gap-xs md:col-span-2">
                  <span className="font-label text-label-md text-light-on-surface font-semibold">Event Title *</span>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Inter-Faculty Robotics Challenge 2026"
                    className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest text-light-on-surface font-body text-body-md"
                  />
                </label>

                <label className="flex flex-col gap-xs">
                  <span className="font-label text-label-md text-light-on-surface font-semibold">Organizing Club</span>
                  <select
                    value={clubId}
                    onChange={(e) => setClubId(e.target.value)}
                    className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest text-light-on-surface font-body text-body-md"
                  >
                    {clubs.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-xs">
                  <span className="font-label text-label-md text-light-on-surface font-semibold">Category</span>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest text-light-on-surface font-body text-body-md"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Sports">Sports</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Academic">Academic</option>
                    <option value="Community Service">Community Service</option>
                  </select>
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
                  <span className="font-label text-label-md text-light-on-surface font-semibold">Start Time</span>
                  <input
                    type="text"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest text-light-on-surface font-body text-body-md"
                  />
                </label>

                <label className="flex flex-col gap-xs md:col-span-2">
                  <span className="font-label text-label-md text-light-on-surface font-semibold">Campus Venue</span>
                  <input
                    type="text"
                    required
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest text-light-on-surface font-body text-body-md"
                  />
                </label>

                <label className="flex flex-col gap-xs md:col-span-2">
                  <span className="font-label text-label-md text-light-on-surface font-semibold">Description &amp; Objectives</span>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Outline event schedule, expected learning outcomes, and safety preparations..."
                    className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest text-light-on-surface font-body text-body-md resize-none"
                  />
                </label>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="flex flex-col gap-md">
              <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold m-0">
                Capacity, Fee &amp; Financial Policy
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <label className="flex flex-col gap-xs">
                  <span className="font-label text-label-md text-light-on-surface font-semibold">Max Seat Capacity</span>
                  <input
                    type="number"
                    min={1}
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest text-light-on-surface font-body text-body-md"
                  />
                </label>

                <label className="flex flex-col gap-xs">
                  <span className="font-label text-label-md text-light-on-surface font-semibold">Ticket Fee (LKR, 0 for Free)</span>
                  <input
                    type="number"
                    min={0}
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest text-light-on-surface font-body text-body-md"
                  />
                </label>

                <label className="flex flex-col gap-xs">
                  <span className="font-label text-label-md text-light-on-surface font-semibold">Estimated Total Budget (LKR)</span>
                  <input
                    type="number"
                    min={0}
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest text-light-on-surface font-body text-body-md"
                  />
                </label>

                <label className="flex flex-col gap-xs">
                  <span className="font-label text-label-md text-light-on-surface font-semibold">Payment Seat Hold Window</span>
                  <select
                    value={holdDuration}
                    onChange={(e) => setHoldDuration(e.target.value)}
                    className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest text-light-on-surface font-body text-body-md"
                  >
                    <option value="10 mins">10 minutes (Standard)</option>
                    <option value="15 mins">15 minutes</option>
                    <option value="30 mins">30 minutes</option>
                  </select>
                </label>

                <label className="flex flex-col gap-xs md:col-span-2">
                  <span className="font-label text-label-md text-light-on-surface font-semibold">Refund &amp; Cancellation Policy</span>
                  <textarea
                    rows={2}
                    value={refundPolicy}
                    onChange={(e) => setRefundPolicy(e.target.value)}
                    className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest text-light-on-surface font-body text-body-md resize-none"
                  />
                </label>

                <label className="flex items-center gap-sm md:col-span-2 cursor-pointer pt-xs">
                  <input
                    type="checkbox"
                    checked={requireManualApproval}
                    onChange={(e) => setRequireManualApproval(e.target.checked)}
                    className="w-4 h-4 rounded text-light-primary"
                  />
                  <span className="font-body text-body-md text-light-on-surface">
                    Require manual organizer registration approval before ticket/payment confirmation
                  </span>
                </label>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="flex flex-col gap-md">
              <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold m-0">
                Promotional Flyer &amp; External Clearances
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="flex flex-col gap-xs p-md border border-dashed border-light-outline rounded bg-light-surface-container-low/40">
                  <span className="font-label text-label-md text-light-on-surface font-semibold">
                    Event Flyer / Cover Image (PNG/JPG)
                  </span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="text-body-sm" />
                  {uploadingImage && <span className="text-label-sm text-light-primary">Uploading flyer to Storage...</span>}
                  {imageName && <span className="text-label-sm text-success">Uploaded: {imageName}</span>}
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Or paste HTTPS image URL..."
                    className="px-sm py-xs rounded border border-light-outline-variant bg-light-surface-container-lowest text-body-sm mt-xs"
                  />
                </div>

                <div className="flex flex-col gap-xs p-md border border-dashed border-light-outline rounded bg-light-surface-container-low/40">
                  <span className="font-label text-label-md text-light-on-surface font-semibold">
                    Budget &amp; Safety Proposal PDF
                  </span>
                  <input type="file" accept=".pdf,.doc,.docx,image/*" onChange={handleDocumentUpload} className="text-body-sm" />
                  {uploadingDoc && <span className="text-label-sm text-light-primary">Uploading document...</span>}
                  {documentName && <span className="text-label-sm text-success">Attached: {documentName}</span>}
                </div>

                <label className="flex flex-col gap-xs md:col-span-2">
                  <span className="font-label text-label-md text-light-on-surface font-semibold">External Body Clearance Requirement</span>
                  <select
                    value={externalApproval}
                    onChange={(e) => setExternalApproval(e.target.value)}
                    className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest text-light-on-surface font-body text-body-md"
                  >
                    <option value="None Required">None Required (On-Campus Standard)</option>
                    <option value="Sports Ministry">Sports Ministry Endorsement Required</option>
                    <option value="IEEE / IET Sponsor">External Professional Chapter Clearance</option>
                    <option value="Municipal Sound Permit">Outdoor Municipal / Safety Permit</option>
                  </select>
                </label>
              </div>
            </div>
          )}

          {/* Footer Navigation */}
          <div className="flex items-center justify-between pt-md border-t border-light-outline-variant">
            <button
              type="button"
              onClick={() => (activeStep > 1 ? setActiveStep((activeStep - 1) as 1 | 2) : navigate('/organizer/proposals'))}
              className="px-lg py-sm rounded border border-light-outline-variant text-light-on-surface font-label text-label-md font-semibold bg-transparent cursor-pointer"
            >
              {activeStep > 1 ? '← Previous Step' : 'Cancel'}
            </button>

            <div className="flex items-center gap-sm">
              {activeStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setActiveStep((activeStep + 1) as 2 | 3)}
                  className="px-lg py-sm rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold border-0 cursor-pointer hover:bg-light-primary-container"
                >
                  Continue Step →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-xl py-sm rounded bg-light-primary text-light-on-primary font-label text-label-lg font-semibold border-0 cursor-pointer hover:bg-light-primary-container"
                >
                  {isSubmitting ? 'Submitting Proposal...' : 'Submit Proposal for Review'}
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Preview Card Modal */}
        {showPreview && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-md">
            <div className="bg-light-surface-container-lowest rounded-lg max-w-md w-full overflow-hidden border border-light-outline-variant shadow-xl">
              <div className="h-44 relative bg-slate-900 overflow-hidden">
                <img
                  src={imageUrl || fallbackPreviewImg}
                  alt={title || 'Event Flyer Preview'}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white border-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
              <div className="p-lg flex flex-col gap-sm">
                <span className="font-label text-label-sm text-light-primary font-semibold uppercase">
                  {category} · {selectedClub}
                </span>
                <h3 className="font-headline text-headline-sm text-light-on-surface font-bold m-0">
                  {title || 'Untitled Event Proposal'}
                </h3>
                <p className="font-body text-body-md text-light-on-surface-variant m-0">
                  {eventDate} · {time} · {venue}
                </p>
                <div className="flex items-center justify-between pt-sm border-t border-light-outline-variant">
                  <span className="font-mono font-bold text-light-on-surface">
                    {Number(fee) > 0 ? `LKR ${fee}` : 'Free Entry'}
                  </span>
                  <span className="font-label text-label-sm text-light-on-surface-variant">
                    {capacity} seats
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </OrganizerLayout>
  );
};

export default CreateEventProposal;
