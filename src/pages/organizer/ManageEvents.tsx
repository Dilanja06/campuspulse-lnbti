import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { OrganizerLayout } from '../../components/OrganizerLayout';
import { EventItem } from '../../types';
import { dataService } from '../../services/dataService';
import { getEventCoverImage } from '../../utils/eventImages';

export const ManageEvents: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [editCapacity, setEditCapacity] = useState('100');
  const [editFee, setEditFee] = useState('0');
  const [editVenue, setEditVenue] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const list = await dataService.getEvents();
      setEvents(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleToggleClose = async (ev: EventItem) => {
    if (ev.status === 'cancelled') return;
    const nextStatus = ev.status === 'published' ? 'closed' : 'published';
    await dataService.updateEvent(ev.id, { status: nextStatus });
    await loadEvents();
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    setSavingEdit(true);
    try {
      await dataService.updateEvent(editingEvent.id, {
        capacity: Number(editCapacity) || editingEvent.capacity,
        fee: Number(editFee) || 0,
        venue: editVenue.trim() || editingEvent.venue,
      });
      setEditingEvent(null);
      await loadEvents();
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <OrganizerLayout>
      <main className="p-lg md:p-xl max-w-[1400px] w-full mx-auto flex flex-col gap-xl">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline text-headline-lg text-light-on-surface font-semibold">
              Manage Published Events (O06)
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant">
              Control capacity, registration availability, check-in scanners, and official event cancellations.
            </p>
          </div>
          <div className="flex items-center gap-sm">
            <Link
              to="/organizer/attendance"
              className="inline-flex items-center gap-xs px-md py-sm rounded bg-light-surface-container-lowest border border-light-outline-variant text-light-on-surface font-label text-label-md font-semibold no-underline hover:bg-light-surface-container-low"
            >
              <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
              <span>QR Scanner Terminal</span>
            </Link>
            <Link
              to="/organizer/proposals"
              className="inline-flex items-center gap-xs px-md py-sm rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold no-underline hover:bg-light-primary-container"
            >
              <span className="material-symbols-outlined text-[18px]">publish</span>
              <span>Publish Approved Proposal</span>
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {loading ? (
            <div className="col-span-full p-xl text-center text-light-on-surface-variant">Loading events...</div>
          ) : (
            events.map((ev) => {
              const fillPct = ev.capacity > 0 ? Math.min(100, Math.round((ev.registered / ev.capacity) * 100)) : 0;
              return (
                <article
                  key={ev.id}
                  className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md overflow-hidden shadow-sm flex flex-col"
                >
                  <div className="h-36 relative bg-slate-900 overflow-hidden">
                    <img
                      src={getEventCoverImage(ev)}
                      alt={ev.title}
                      className="w-full h-full object-cover"
                    />
                    <span
                      className={`absolute top-3 right-3 px-sm py-0.5 rounded-full font-label text-label-sm font-semibold ${
                        ev.status === 'published'
                          ? 'bg-success-container text-on-success-container'
                          : ev.status === 'closed'
                          ? 'bg-warning-container text-on-warning-container'
                          : 'bg-light-error-container text-light-on-error-container'
                      }`}
                    >
                      {ev.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="p-lg flex flex-col gap-md flex-1 justify-between">
                    <div className="flex flex-col gap-xs">
                      <div className="flex items-center justify-between text-label-sm text-light-on-surface-variant">
                        <span className="font-mono text-light-primary font-semibold">{ev.code}</span>
                        <span>{ev.start_date}</span>
                      </div>
                      <h2 className="font-title text-title-lg text-light-on-surface font-semibold m-0">
                        {ev.title}
                      </h2>
                      <p className="font-body text-body-sm text-light-on-surface-variant m-0">
                        {ev.club_name} · {ev.venue}
                      </p>
                      <div className="flex items-center gap-xs flex-wrap pt-xs">
                        {ev.manual_approval && (
                          <span className="px-xs py-0.5 rounded bg-info-container text-on-info-container font-label text-label-sm">
                            Manual Approval
                          </span>
                        )}
                        <span className="px-xs py-0.5 rounded bg-light-surface-container-low text-light-on-surface font-mono text-label-sm">
                          {ev.fee > 0 ? `LKR ${ev.fee}` : 'Free'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-xs">
                      <div className="flex justify-between font-label text-label-sm">
                        <span className="text-light-on-surface-variant">Seat Occupancy</span>
                        <span className="font-semibold tabular-nums">
                          {ev.registered} / {ev.capacity} ({fillPct}%)
                        </span>
                      </div>
                      <div className="h-2 bg-light-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-light-primary transition-all" style={{ width: `${fillPct}%` }} />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-xs pt-sm border-t border-light-outline-variant">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingEvent(ev);
                          setEditCapacity(String(ev.capacity));
                          setEditFee(String(ev.fee));
                          setEditVenue(ev.venue);
                        }}
                        className="px-sm py-xs rounded border border-light-outline-variant bg-transparent text-light-on-surface font-label text-label-sm font-medium cursor-pointer hover:bg-light-surface-container-low"
                      >
                        Edit Seats/Fee
                      </button>

                      {ev.status !== 'cancelled' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleToggleClose(ev)}
                            className="px-sm py-xs rounded border border-light-outline-variant bg-light-surface-container-low text-light-on-surface font-label text-label-sm font-medium cursor-pointer"
                          >
                            {ev.status === 'published' ? 'Close Regs' : 'Re-open Regs'}
                          </button>

                          <Link
                            to={`/organizer/events/${ev.id}/cancel`}
                            className="px-sm py-xs rounded bg-light-error-container text-light-on-error-container font-label text-label-sm font-semibold no-underline hover:opacity-90"
                          >
                            Cancel (O15)
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>

        {editingEvent && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-md">
            <form
              onSubmit={handleSaveEdit}
              className="bg-light-surface-container-lowest rounded-lg max-w-md w-full p-lg border border-light-outline-variant shadow-xl flex flex-col gap-md"
            >
              <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold m-0">
                Update Edition · {editingEvent.code}
              </h2>
              <label className="flex flex-col gap-xs">
                <span className="font-label text-label-md font-semibold">Seat Capacity</span>
                <input
                  type="number"
                  min={editingEvent.registered}
                  value={editCapacity}
                  onChange={(e) => setEditCapacity(e.target.value)}
                  className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest"
                />
              </label>
              <label className="flex flex-col gap-xs">
                <span className="font-label text-label-md font-semibold">Ticket Fee (LKR)</span>
                <input
                  type="number"
                  min={0}
                  value={editFee}
                  onChange={(e) => setEditFee(e.target.value)}
                  className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest"
                />
              </label>
              <label className="flex flex-col gap-xs">
                <span className="font-label text-label-md font-semibold">Campus Venue</span>
                <input
                  type="text"
                  required
                  value={editVenue}
                  onChange={(e) => setEditVenue(e.target.value)}
                  className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest"
                />
              </label>
              <div className="flex justify-end gap-sm pt-sm">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-md py-xs rounded border border-light-outline-variant bg-transparent cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-md py-xs rounded bg-light-primary text-light-on-primary font-semibold border-0 cursor-pointer"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </OrganizerLayout>
  );
};

export default ManageEvents;
