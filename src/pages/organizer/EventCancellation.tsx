import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { OrganizerLayout } from '../../components/OrganizerLayout';
import { EventItem, RegistrationItem } from '../../types';
import { dataService } from '../../services/dataService';

export const EventCancellation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [confirmWord, setConfirmWord] = useState('');
  const [notifyParticipants, setNotifyParticipants] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ affectedRegistrations: number; refundsCreated: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const [ev, regs] = await Promise.all([
          dataService.getEventById(id),
          dataService.getRegistrationsByEvent(id),
        ]);
        setEvent(ev);
        setRegistrations(regs);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const activeRegs = registrations.filter((r) => r.status !== 'cancelled' && r.status !== 'rejected');
  const eligibleRefunds = activeRegs.filter((r) => (r.status === 'confirmed' || r.status === 'checked_in') && r.fee > 0);

  const handleConfirmCancellation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    if (!reason.trim()) {
      setErrorMsg('Please enter an official cancellation reason for participants and audit logs.');
      return;
    }
    if (confirmWord.trim().toUpperCase() !== 'CANCEL') {
      setErrorMsg('Please type CANCEL in uppercase to confirm irreversible event cancellation.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await dataService.cancelEventWithImpact(event.id, reason.trim(), notifyParticipants);
      if (res.success) {
        setResult({
          affectedRegistrations: res.affectedRegistrations,
          refundsCreated: res.refundsCreated,
        });
      } else {
        setErrorMsg(res.error || 'Cancellation failed.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <OrganizerLayout>
      <main className="p-lg md:p-xl max-w-[900px] w-full mx-auto flex flex-col gap-xl">
        <header className="flex flex-col gap-xs">
          <Link
            to="/organizer/events"
            className="inline-flex items-center gap-xs text-light-on-surface-variant hover:text-light-on-surface font-label text-label-md no-underline w-fit"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to Manage Events</span>
          </Link>
          <h1 className="font-headline text-headline-lg text-light-error font-semibold mt-xs">
            Cancel Published Event (O15)
          </h1>
          <p className="font-body text-body-md text-light-on-surface-variant">
            Cancelling a live Event Edition halts all new registrations, updates active tickets to Cancelled, and automatically initiates refunds for eligible paid participants.
          </p>
        </header>

        {loading ? (
          <div className="p-xl text-center text-light-on-surface-variant font-body text-body-md">
            Evaluating impact...
          </div>
        ) : !event ? (
          <div className="p-xl text-center text-light-on-surface-variant font-body text-body-md">
            Event not found.
          </div>
        ) : result ? (
          <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-xl flex flex-col gap-md shadow-sm">
            <div className="flex items-center gap-sm text-success">
              <span className="material-symbols-outlined text-[28px]">task_alt</span>
              <h2 className="font-headline text-headline-sm font-semibold m-0">
                Event Cancelled &amp; Impact Processed
              </h2>
            </div>
            <p className="font-body text-body-md text-light-on-surface">
              <strong>{event.title}</strong> ({event.code}) is now marked as Cancelled.
            </p>
            <ul className="list-disc pl-lg font-body text-body-md text-light-on-surface-variant flex flex-col gap-xs">
              <li>Active student registrations cancelled: <strong>{result.affectedRegistrations}</strong></li>
              <li>Refund requests auto-approved and queued: <strong>{result.refundsCreated}</strong></li>
              <li>Participant notification dispatched: <strong>{notifyParticipants ? 'Yes' : 'No'}</strong></li>
            </ul>
            <div className="flex gap-sm pt-sm">
              <button
                type="button"
                onClick={() => navigate('/organizer/events')}
                className="px-lg py-sm rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold cursor-pointer border-0"
              >
                Return to Manage Events
              </button>
              <Link
                to="/organizer/refunds"
                className="px-lg py-sm rounded bg-light-surface-container-low text-light-on-surface border border-light-outline-variant font-label text-label-md font-semibold no-underline"
              >
                Review Queued Refunds
              </Link>
            </div>
          </section>
        ) : (
          <form
            onSubmit={handleConfirmCancellation}
            className="bg-light-surface-container-lowest border border-light-error/40 rounded-md p-lg flex flex-col gap-lg shadow-sm"
          >
            {/* Impact Summary Box */}
            <section className="bg-light-error-container/30 border border-light-error/30 rounded p-md flex flex-col gap-sm">
              <h2 className="font-title text-title-md text-light-error font-semibold m-0">
                Cancellation Impact Summary · {event.title}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-md text-body-md">
                <div>
                  <span className="font-label text-label-sm text-light-on-surface-variant block">Event Code</span>
                  <span className="font-mono font-bold text-light-on-surface">{event.code}</span>
                </div>
                <div>
                  <span className="font-label text-label-sm text-light-on-surface-variant block">Affected Participants</span>
                  <span className="font-bold text-light-on-surface tabular-nums">{activeRegs.length}</span>
                </div>
                <div>
                  <span className="font-label text-label-sm text-light-on-surface-variant block">Auto-Approved Refunds</span>
                  <span className="font-bold text-light-error tabular-nums">{eligibleRefunds.length} paid tickets</span>
                </div>
              </div>
            </section>

            {errorMsg && (
              <div className="p-sm rounded bg-light-error-container text-light-on-error-container text-label-md font-medium">
                {errorMsg}
              </div>
            )}

            <label className="flex flex-col gap-xs">
              <span className="font-label text-label-md text-light-on-surface font-semibold">
                Official Reason for Cancellation <span className="text-light-error">*</span>
              </span>
              <textarea
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Main Auditorium electrical maintenance scheduled by University Maintenance Unit"
                className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest text-light-on-surface font-body text-body-md resize-none"
              />
            </label>

            <label className="flex items-center gap-sm cursor-pointer">
              <input
                type="checkbox"
                checked={notifyParticipants}
                onChange={(e) => setNotifyParticipants(e.target.checked)}
                className="w-4 h-4 rounded text-light-primary"
              />
              <span className="font-body text-body-md text-light-on-surface">
                Dispatch immediate portal notification and refund instructions to all affected participants
              </span>
            </label>

            <label className="flex flex-col gap-xs">
              <span className="font-label text-label-md text-light-on-surface font-semibold">
                Type <code>CANCEL</code> to confirm
              </span>
              <input
                type="text"
                value={confirmWord}
                onChange={(e) => setConfirmWord(e.target.value)}
                placeholder="CANCEL"
                className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest text-light-on-surface font-mono text-body-md uppercase"
              />
            </label>

            <div className="flex items-center justify-end gap-sm pt-sm border-t border-light-outline-variant">
              <Link
                to="/organizer/events"
                className="px-lg py-sm rounded border border-light-outline-variant text-light-on-surface font-label text-label-md font-semibold no-underline"
              >
                Keep Event Live
              </Link>
              <button
                type="submit"
                disabled={submitting || event.status === 'cancelled'}
                className="px-lg py-sm rounded bg-light-error text-white font-label text-label-md font-semibold cursor-pointer border-0 disabled:opacity-50"
              >
                {submitting ? 'Cancelling & Processing Refunds...' : 'Confirm Official Cancellation'}
              </button>
            </div>
          </form>
        )}
      </main>
    </OrganizerLayout>
  );
};

export default EventCancellation;
