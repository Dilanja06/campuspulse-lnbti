import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OrganizerLayout } from '../../components/OrganizerLayout';
import { dataService } from '../../services/dataService';

export const CreateEventProposal: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('Table Tennis Open Tournament');
  const [category, setCategory] = useState('Sports & Recreation');
  const [venue, setVenue] = useState('Indoor Gymnasium · Main Hall');
  const [eventDate, setEventDate] = useState('2026-12-08');
  const [timeWindow, setTimeWindow] = useState('09:00 AM – 04:00 PM');
  const [capacity, setCapacity] = useState('64');
  const [fee, setFee] = useState('350');
  const [seatHold, setSeatHold] = useState('10 minutes (Standard)');
  const [manualApproval, setManualApproval] = useState(true);
  const [budget, setBudget] = useState('24500');
  const [externalApproval, setExternalApproval] = useState('No — On-campus internal event');
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveDraft = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await dataService.createProposal({
        title,
        club_id: 'club-sports',
        club_name: 'University Sports Council',
        category,
        event_date: eventDate,
        time: timeWindow,
        venue,
        capacity: parseInt(capacity) || 50,
        fee: parseFloat(fee) || 0,
        budget: parseFloat(budget) || 20000,
        status: 'Draft',
        stage: 1,
        stage_label: 'Committee Draft',
        comment: 'Draft saved by officer',
        hold_duration: seatHold,
        require_manual_approval: manualApproval,
        external_approval: externalApproval,
      });
      navigate('/organizer/proposals');
    } catch (err) {
      console.warn('Error saving draft:', err);
      navigate('/organizer/proposals');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await dataService.createProposal({
        title,
        club_id: 'club-sports',
        club_name: 'University Sports Council',
        category,
        event_date: eventDate,
        time: timeWindow,
        venue,
        capacity: parseInt(capacity) || 50,
        fee: parseFloat(fee) || 0,
        budget: parseFloat(budget) || 20000,
        status: 'Higher Authority',
        stage: 2,
        stage_label: 'Lecturer Coordinator Review',
        hold_duration: seatHold,
        require_manual_approval: manualApproval,
        external_approval: externalApproval,
      });
      navigate('/organizer/proposals');
    } catch (err) {
      console.warn('Error creating proposal:', err);
      navigate('/organizer/proposals');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFileName(e.target.files[0].name);
    }
  };

  return (
    <OrganizerLayout>
      {/* Top Header bar with Back link */}
      <div className="h-14 bg-light-surface-container-lowest border-b border-light-outline-variant px-xl flex items-center justify-between gap-md sticky top-16 z-10">
        <div className="flex items-center gap-md">
          <Link
            to="/organizer/proposals"
            className="inline-flex items-center gap-xs text-light-primary hover:underline font-label text-label-lg no-underline"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              arrow_back
            </span>
            <span>Back to Proposals</span>
          </Link>
          <span className="text-light-outline-variant" aria-hidden="true">
            |
          </span>
          <span className="font-title text-title-md text-light-on-surface font-semibold">
            Create Event Proposal
          </span>
        </div>

        <div className="flex items-center gap-sm">
          <span className="font-mono text-mono-md text-light-on-surface-variant tabular-nums">
            Draft · PROP-1102
          </span>
        </div>
      </div>

      {/* Single-Column Form Workspace */}
      <main className="flex-1 p-xl max-w-[960px] w-full mx-auto flex flex-col gap-xl">
        <div className="flex flex-col gap-xs">
          <h1 className="font-headline text-headline-lg text-light-on-surface">
            New Event Proposal
          </h1>
          <p className="font-body text-body-md text-light-on-surface-variant">
            Submitted proposals route to the five Sports Club committee decision-makers and Lecturer Coordinator for review.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
          {/* Section 1: Event Core Details */}
          <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
            <h2 className="font-headline text-headline-sm text-light-on-surface">
              1. Event Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="flex flex-col gap-xs md:col-span-2">
                <label
                  htmlFor="event-title"
                  className="font-label text-label-md text-light-on-surface"
                >
                  Event Title
                </label>
                <input
                  id="event-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-md py-sm rounded bg-light-surface-container-lowest border border-light-outline text-light-on-surface font-body text-body-md focus:border-light-primary focus:ring-2 focus:ring-light-primary/20 outline-none"
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label
                  htmlFor="event-category"
                  className="font-label text-label-md text-light-on-surface"
                >
                  Category
                </label>
                <select
                  id="event-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-md py-sm rounded bg-light-surface-container-lowest border border-light-outline text-light-on-surface font-body text-body-md focus:border-light-primary focus:ring-2 focus:ring-light-primary/20 outline-none"
                >
                  <option>Sports &amp; Recreation</option>
                  <option>Workshop &amp; Clinic</option>
                  <option>Inter-University Championship</option>
                </select>
              </div>

              <div className="flex flex-col gap-xs">
                <label
                  htmlFor="event-venue"
                  className="font-label text-label-md text-light-on-surface"
                >
                  Proposed Venue
                </label>
                <input
                  id="event-venue"
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-md py-sm rounded bg-light-surface-container-lowest border border-light-outline text-light-on-surface font-body text-body-md focus:border-light-primary focus:ring-2 focus:ring-light-primary/20 outline-none"
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label
                  htmlFor="event-date"
                  className="font-label text-label-md text-light-on-surface"
                >
                  Event Date
                </label>
                <input
                  id="event-date"
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-md py-sm rounded bg-light-surface-container-lowest border border-light-outline text-light-on-surface font-body text-body-md tabular-nums focus:border-light-primary focus:ring-2 focus:ring-light-primary/20 outline-none"
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label
                  htmlFor="event-time"
                  className="font-label text-label-md text-light-on-surface"
                >
                  Time Window
                </label>
                <input
                  id="event-time"
                  type="text"
                  required
                  value={timeWindow}
                  onChange={(e) => setTimeWindow(e.target.value)}
                  className="w-full px-md py-sm rounded bg-light-surface-container-lowest border border-light-outline text-light-on-surface font-body text-body-md tabular-nums focus:border-light-primary focus:ring-2 focus:ring-light-primary/20 outline-none"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Registration & Fee Rules */}
          <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
            <h2 className="font-headline text-headline-sm text-light-on-surface">
              2. Registration &amp; Fee Policy
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              <div className="flex flex-col gap-xs">
                <label
                  htmlFor="event-capacity"
                  className="font-label text-label-md text-light-on-surface"
                >
                  Seat Capacity
                </label>
                <input
                  id="event-capacity"
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full px-md py-sm rounded bg-light-surface-container-lowest border border-light-outline text-light-on-surface font-body text-body-md tabular-nums focus:border-light-primary focus:ring-2 focus:ring-light-primary/20 outline-none"
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label
                  htmlFor="event-fee"
                  className="font-label text-label-md text-light-on-surface"
                >
                  Entry Fee (LKR)
                </label>
                <input
                  id="event-fee"
                  type="text"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  className="w-full px-md py-sm rounded bg-light-surface-container-lowest border border-light-outline text-light-on-surface font-body text-body-md tabular-nums focus:border-light-primary focus:ring-2 focus:ring-light-primary/20 outline-none"
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label
                  htmlFor="seat-hold"
                  className="font-label text-label-md text-light-on-surface"
                >
                  Payment Seat Hold
                </label>
                <select
                  id="seat-hold"
                  value={seatHold}
                  onChange={(e) => setSeatHold(e.target.value)}
                  className="w-full px-md py-sm rounded bg-light-surface-container-lowest border border-light-outline text-light-on-surface font-body text-body-md focus:border-light-primary focus:ring-2 focus:ring-light-primary/20 outline-none"
                >
                  <option>10 minutes (Standard)</option>
                  <option>15 minutes</option>
                  <option>No hold (Free event)</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-sm pt-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={manualApproval}
                onChange={(e) => setManualApproval(e.target.checked)}
                className="rounded border-light-outline text-light-primary focus:ring-light-primary w-4 h-4"
              />
              <span className="flex flex-col gap-xs">
                <span className="font-label text-label-md text-light-on-surface font-medium">
                  Require manual officer approval before payment
                </span>
                <span className="font-body text-body-md text-light-on-surface-variant">
                  Verify student eligibility or team roster before releasing payment links.
                </span>
              </span>
            </label>
          </section>

          {/* Section 3: Budget & Supporting Evidence */}
          <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
            <h2 className="font-headline text-headline-sm text-light-on-surface">
              3. Budget &amp; Supporting Documents
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="flex flex-col gap-xs">
                <label
                  htmlFor="estimated-budget"
                  className="font-label text-label-md text-light-on-surface"
                >
                  Estimated Total Budget (LKR)
                </label>
                <input
                  id="estimated-budget"
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-md py-sm rounded bg-light-surface-container-lowest border border-light-outline text-light-on-surface font-body text-body-md tabular-nums focus:border-light-primary focus:ring-2 focus:ring-light-primary/20 outline-none"
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label
                  htmlFor="external-approval"
                  className="font-label text-label-md text-light-on-surface"
                >
                  External Approval Required?
                </label>
                <select
                  id="external-approval"
                  value={externalApproval}
                  onChange={(e) => setExternalApproval(e.target.value)}
                  className="w-full px-md py-sm rounded bg-light-surface-container-lowest border border-light-outline text-light-on-surface font-body text-body-md focus:border-light-primary focus:ring-2 focus:ring-light-primary/20 outline-none"
                >
                  <option>No — On-campus internal event</option>
                  <option>Yes — External venue / sponsor clearance</option>
                </select>
              </div>
            </div>

            <div className="border border-dashed border-light-outline rounded-md p-lg bg-light-surface-container-low flex flex-wrap items-center justify-between gap-md">
              <div className="flex items-center gap-md">
                <span className="material-symbols-outlined text-[24px] text-light-primary" aria-hidden="true">
                  upload_file
                </span>
                <div className="flex flex-col gap-xs">
                  <span className="font-title text-title-md text-light-on-surface font-medium">
                    {attachedFileName ? `Attached: ${attachedFileName}` : 'Venue Booking & Equipment Quote'}
                  </span>
                  <span className="font-body text-body-md text-light-on-surface-variant">
                    PDF or DOCX up to 10 MB for Lecturer Coordinator verification
                  </span>
                </div>
              </div>
              <label className="cursor-pointer px-md py-sm rounded bg-light-surface-container-lowest text-light-primary border border-light-outline-variant hover:bg-light-surface-container transition-colors duration-state-change font-label text-label-md">
                {attachedFileName ? 'Change File' : 'Attach Document'}
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </section>

          {/* Form Actions */}
          <div className="flex flex-wrap items-center justify-between gap-md pt-sm">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="px-md py-sm rounded bg-light-surface-container-lowest text-light-on-surface border border-light-outline-variant hover:bg-light-surface-container-low transition-colors duration-state-change font-label text-label-lg cursor-pointer"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-xs px-lg py-sm rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container transition-colors duration-state-change font-label text-label-lg cursor-pointer disabled:opacity-50"
            >
              Submit Proposal for Review
            </button>
          </div>
        </form>
      </main>
    </OrganizerLayout>
  );
};

export default CreateEventProposal;
