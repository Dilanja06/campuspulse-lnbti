import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { dataService } from '../../services/dataService';
import { CommitteeActionItem, CommitteeMemberProfile } from '../../types';

export const CommitteeActionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [actionItem, setActionItem] = useState<CommitteeActionItem | null>(null);
  const [currentMember, setCurrentMember] = useState<CommitteeMemberProfile>(
    dataService.getCurrentCommitteeMember()
  );
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState(
    'Updated vendor quotation verified against Sports Club Term 2026 allocation.'
  );
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchAction = async () => {
      try {
        const all = await dataService.getCommitteeActions();
        let found = id ? all.find((a) => a.id === id || a.code === id) : null;
        if (!found) {
          found = all[0];
        }
        setActionItem(found || null);
        setCurrentMember(dataService.getCurrentCommitteeMember());
      } catch (err) {
        console.error('Failed to load committee action detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAction();
  }, [id]);

  const handleDecision = async (decision: 'approve' | 'request_changes') => {
    if (!actionItem) return;
    setSubmitting(true);
    try {
      if (decision === 'approve') {
        await dataService.signOffCommitteeAction(actionItem.id, note);
        setStatusMessage({
          type: 'success',
          text: `Official ${currentMember.role} sign-off recorded successfully for ${actionItem.code}.`,
        });
      } else {
        await dataService.requestCommitteeActionChanges(actionItem.id, note);
        setStatusMessage({
          type: 'success',
          text: `Change request submitted back to club organizer for ${actionItem.code}.`,
        });
      }

      setTimeout(() => {
        navigate('/committee/actions');
      }, 1000);
    } catch (err) {
      console.error('Error recording committee decision:', err);
      setStatusMessage({ type: 'error', text: 'Failed to record decision.' });
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 p-xl max-w-[1160px] w-full mx-auto flex items-center justify-center">
        <p className="text-light-on-surface-variant font-body">Loading action details...</p>
      </main>
    );
  }

  if (!actionItem) {
    return (
      <main className="flex-1 p-xl max-w-[1160px] w-full mx-auto flex flex-col gap-md items-center justify-center">
        <h2 className="font-headline text-headline-sm text-light-on-surface">Action Item Not Found</h2>
        <Link
          to="/committee/actions"
          className="px-md py-sm bg-light-primary text-light-on-primary rounded font-label text-label-md no-underline"
        >
          Return to Assigned Actions
        </Link>
      </main>
    );
  }

  const mySeat = actionItem.seats.find(
    (s) => s.role.toLowerCase() === currentMember.role.toLowerCase()
  );
  const isAlreadySigned = mySeat?.status === 'Signed';

  return (
    <div className="min-h-screen flex flex-col bg-light-surface text-light-on-surface font-body">
      {/* Focused Task Flow Header */}
      <header className="h-16 bg-light-surface-container-lowest border-b border-light-outline-variant px-xl flex items-center justify-between gap-md sticky top-0 z-20">
        <div className="flex items-center gap-md">
          <Link
            to="/committee/actions"
            className="inline-flex items-center gap-xs text-light-primary hover:underline font-label text-label-lg whitespace-nowrap no-underline"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              arrow_back
            </span>
            <span>Back to Assigned Actions</span>
          </Link>
          <span className="text-light-outline-variant" aria-hidden="true">|</span>
          <span className="font-title text-title-md text-light-on-surface">
            {actionItem.assigned_role_action}
          </span>
        </div>

        <span className="font-mono text-mono-md text-light-on-surface-variant tabular-nums">
          {actionItem.code}
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
              className={`inline-flex items-center gap-xs px-sm py-xs rounded-full whitespace-nowrap ${
                isAlreadySigned
                  ? 'bg-success-container text-on-success-container'
                  : 'bg-warning-container text-on-warning-container'
              }`}
            >
              <span className="font-label text-label-sm font-semibold">
                {isAlreadySigned
                  ? `Signed (${actionItem.signed_count}/${actionItem.total_seats})`
                  : `Awaiting Your Sign-off (${actionItem.signed_count}/${actionItem.total_seats})`}
              </span>
            </span>
            <span className="font-label text-label-md text-light-on-surface-variant">
              Submitted by {actionItem.submitted_by || 'Club Committee'}
            </span>
          </div>
          <h1 className="font-headline text-headline-lg text-light-on-surface">
            {actionItem.item_title}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
          {/* Left: Proposal & 5-Member Matrix (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-lg">
            <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
              <h2 className="font-headline text-headline-sm text-light-on-surface">
                Budget Breakdown
              </h2>
              <div className="grid grid-cols-2 gap-md">
                <div className="flex flex-col gap-xs">
                  <span className="font-label text-label-sm text-light-on-surface-variant">
                    Event Date
                  </span>
                  <span className="font-body text-body-md text-light-on-surface tabular-nums">
                    {actionItem.date} · {actionItem.venue}
                  </span>
                </div>
                <div className="flex flex-col gap-xs">
                  <span className="font-label text-label-sm text-light-on-surface-variant">
                    Total Requested
                  </span>
                  <span className="font-mono text-mono-md text-light-on-surface tabular-nums font-semibold">
                    LKR {actionItem.budget?.toLocaleString()}
                  </span>
                </div>
              </div>
              {actionItem.line_items && actionItem.line_items.length > 0 && (
                <ul className="divide-y divide-light-outline-variant pt-sm border-t border-light-outline-variant">
                  {actionItem.line_items.map((line, idx) => (
                    <li key={idx} className="py-xs flex items-center justify-between text-body-md">
                      <span className="text-light-on-surface">{line.label}</span>
                      <span className="font-mono text-mono-md text-light-on-surface tabular-nums">
                        LKR {line.amount.toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
              <h2 className="font-headline text-headline-sm text-light-on-surface">
                Committee Sign-off Matrix (5 Seats)
              </h2>
              <ul className="divide-y divide-light-outline-variant">
                {actionItem.seats.map((seat) => {
                  const isCurrentRole =
                    seat.role.toLowerCase() === currentMember.role.toLowerCase();
                  return (
                    <li key={seat.seat_number} className="py-sm flex items-center justify-between gap-md">
                      <span
                        className={`font-body text-body-md ${
                          isCurrentRole ? 'text-light-primary font-semibold' : 'text-light-on-surface'
                        }`}
                      >
                        {seat.seat_number}. {seat.role} · {seat.name} {isCurrentRole && '(You)'}
                      </span>
                      <span
                        className={`font-label text-label-sm px-sm py-xs rounded-full whitespace-nowrap ${
                          seat.status === 'Signed'
                            ? 'text-on-success-container bg-success-container font-semibold'
                            : 'text-on-warning-container bg-warning-container font-semibold'
                        }`}
                      >
                        {seat.status}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

          {/* Right: Individual Decision Form (5 cols) */}
          <aside className="lg:col-span-5 bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-lg shadow-sm">
            <h2 className="font-headline text-headline-sm text-light-on-surface">
              Your Assigned Action
            </h2>

            {isAlreadySigned ? (
              <div className="flex flex-col gap-md">
                <div className="p-md rounded bg-success-container text-on-success-container flex items-center gap-sm">
                  <span className="material-symbols-outlined text-[20px]">verified</span>
                  <span className="font-label text-label-md font-semibold">
                    You have signed off on this item.
                  </span>
                </div>
                <div className="flex flex-col gap-xs">
                  <span className="font-label text-label-sm text-light-on-surface-variant">
                    Recorded Sign-off Note:
                  </span>
                  <p className="font-body text-body-md text-light-on-surface p-sm bg-light-surface-container-low rounded border border-light-outline-variant">
                    {mySeat?.note || 'Verified and approved according to committee charter.'}
                  </p>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDecision('approve');
                }}
                className="flex flex-col gap-md"
              >
                <div className="flex flex-col gap-xs">
                  <label
                    htmlFor="treasurer-note"
                    className="font-label text-label-md text-light-on-surface font-medium"
                  >
                    {currentMember.role} Verification Note
                  </label>
                  <textarea
                    id="treasurer-note"
                    rows={4}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-md py-sm rounded bg-light-surface-container-lowest border border-light-outline text-light-on-surface font-body text-body-md focus:border-light-primary focus:ring-2 focus:ring-light-primary/20"
                    placeholder="Enter verification notes or sign-off remarks..."
                    required
                  />
                </div>

                <div className="flex flex-col gap-sm pt-sm">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-sm px-md rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container transition-colors duration-state-change font-label text-label-lg font-semibold disabled:opacity-50"
                  >
                    {submitting ? 'Recording Sign-off...' : 'Approve & Sign Off'}
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleDecision('request_changes')}
                    className="w-full py-sm px-md rounded bg-light-surface-container-lowest text-light-error border border-light-outline-variant hover:bg-light-error-container transition-colors duration-state-change font-label text-label-md font-medium disabled:opacity-50"
                  >
                    Request Organizer Changes
                  </button>
                </div>
              </form>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
};

export default CommitteeActionDetail;
