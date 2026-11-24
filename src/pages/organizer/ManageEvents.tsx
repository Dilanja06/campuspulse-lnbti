import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { OrganizerLayout } from '../../components/OrganizerLayout';
import { dataService } from '../../services/dataService';
import { EventItem } from '../../types';

export const ManageEvents: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const allEvents = await dataService.getEvents();
        // Filter sports council events or relevant managed events
        const sportsEvents = allEvents.filter(
          (e) => e.club_id === 'club-sports' || e.id === 'evt-1' || e.id === 'evt-7' || e.id === 'evt-8'
        );
        setEvents(sportsEvents);
      } catch (err) {
        console.warn('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <OrganizerLayout>
      <main className="flex-1 p-xl max-w-[1280px] w-full mx-auto flex flex-col gap-lg">
        <div className="flex flex-wrap items-end justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline text-headline-lg text-light-on-surface">
              Manage Events
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant">
              Monitor live capacity, toggle registration windows, and open event attendance rosters.
            </p>
          </div>
          <Link
            to="/organizer/proposals/new"
            className="inline-flex items-center justify-center gap-xs px-md py-sm rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container transition-colors duration-state-change no-underline"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              add
            </span>
            <span className="font-label text-label-lg whitespace-nowrap">
              New Proposal
            </span>
          </Link>
        </div>

        {/* Managed Events List */}
        <section aria-label="Sports Club events" className="flex flex-col gap-md">
          {/* Event 1: University Indoor Games Day */}
          <article className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md overflow-hidden flex flex-col md:flex-row shadow-sm">
            <img
              src="https://lh3.googleusercontent.com/aida/ALJJyrAvs_a5eVeVsidNSMPhk0_89s2EaOqj7kb0x-Rz3jocZbKT1aBIgH01GKJ5quU1TU7DEnqThYCz0opGFovadYYXsujAo8AEbF6H3cdtLp4tTt1oQFzchwAiMpBWXfdlZr8keMUZczSQbWLZM-vEjdBffY2aUOw-tkxo063HkEfFKjhxo2ZY16SaJdamoi4-1ZHRvWuS3dJUNLIbISYURqhI5uvc5hQrLlLUvI54W6U0UU49eYHqh44I9AZo"
              alt="University Indoor Games Day"
              className="w-full md:w-64 h-48 md:h-auto object-cover shrink-0"
            />
            <div className="p-lg flex-1 flex flex-col justify-between gap-md">
              <div className="flex flex-wrap items-start justify-between gap-md">
                <div className="flex flex-col gap-xs">
                  <div className="flex flex-wrap items-center gap-sm">
                    <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-success-container text-on-success-container">
                      <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                        check_circle
                      </span>
                      <span className="font-label text-label-sm">
                        Registration Open
                      </span>
                    </span>
                    <span className="font-mono text-mono-md text-light-on-surface-variant tabular-nums">
                      EVT-2026-041
                    </span>
                  </div>
                  <h2 className="font-title text-title-lg text-light-on-surface font-semibold">
                    University Indoor Games Day
                  </h2>
                  <p className="font-body text-body-md text-light-on-surface-variant tabular-nums">
                    15 Nov 2026 · 09:00 AM – 04:30 PM · Main Hall · Entry Fee: LKR 500
                  </p>
                </div>

                <div className="flex flex-col md:items-end gap-xs">
                  <span className="font-mono text-mono-md text-light-on-surface font-semibold tabular-nums">
                    28 of 40 seats filled
                  </span>
                  <span className="font-label text-label-sm text-light-secondary flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[14px]">qr_code_scanner</span>
                    Dynamic QR Attendance Validation Enabled
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-md pt-md border-t border-light-outline-variant">
                <span className="font-body text-body-md text-light-on-surface-variant">
                  Approval Queue Active · Requires officer sign-off before payment
                </span>
                <div className="flex items-center gap-sm">
                  <Link
                    to="/events/evt-1"
                    className="px-md py-xs rounded bg-light-surface-container-lowest text-light-primary border border-light-outline-variant hover:bg-light-surface-container-low transition-colors duration-state-change font-label text-label-md whitespace-nowrap no-underline"
                  >
                    Preview Public Page
                  </Link>
                  <Link
                    to="/organizer/registrations"
                    className="px-md py-xs rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container transition-colors duration-state-change font-label text-label-md whitespace-nowrap no-underline"
                  >
                    Manage Registrations
                  </Link>
                </div>
              </div>
            </div>
          </article>

          {/* Event 2: Inter-Faculty Futsal Cup */}
          <article className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-md">
              <div className="flex flex-col gap-xs">
                <div className="flex flex-wrap items-center gap-sm">
                  <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-success-container text-on-success-container">
                    <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                      check_circle
                    </span>
                    <span className="font-label text-label-sm">
                      Registration Open
                    </span>
                  </span>
                  <span className="font-mono text-mono-md text-light-on-surface-variant tabular-nums">
                    EVT-2026-049
                  </span>
                </div>
                <h2 className="font-title text-title-lg text-light-on-surface font-semibold">
                  Inter-Faculty Futsal Cup
                </h2>
                <p className="font-body text-body-md text-light-on-surface-variant tabular-nums">
                  29 Nov 2026 · 08:00 AM – 06:00 PM · University Sports Complex · Free Entry
                </p>
              </div>

              <div className="flex flex-col items-end gap-xs">
                <span className="font-mono text-mono-md text-light-on-surface tabular-nums font-semibold">
                  66 of 80 seats filled
                </span>
                <span className="font-label text-label-sm text-light-on-surface-variant">
                  Auto-Confirm Enabled
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-md pt-md border-t border-light-outline-variant">
              <span className="font-body text-body-md text-light-on-surface-variant">
                Team Captain &amp; Squad Verification Active
              </span>
              <div className="flex items-center gap-sm">
                <Link
                  to="/events/evt-7"
                  className="px-md py-xs rounded bg-light-surface-container-lowest text-light-primary border border-light-outline-variant hover:bg-light-surface-container-low transition-colors duration-state-change font-label text-label-md whitespace-nowrap no-underline"
                >
                  Preview Public Page
                </Link>
                <Link
                  to="/organizer/registrations"
                  className="px-md py-xs rounded bg-light-surface-container-lowest text-light-primary border border-light-outline-variant hover:bg-light-surface-container-low transition-colors duration-state-change font-label text-label-md whitespace-nowrap no-underline"
                >
                  Manage Registrations
                </Link>
              </div>
            </div>
          </article>

          {/* Event 3: Completed Freshers Sports Orientation */}
          <article className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-wrap items-center justify-between gap-md shadow-sm">
            <div className="flex flex-col gap-xs">
              <div className="flex flex-wrap items-center gap-sm">
                <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-light-surface-container text-light-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                    task_alt
                  </span>
                  <span className="font-label text-label-sm">
                    Completed
                  </span>
                </span>
                <span className="font-mono text-mono-md text-light-on-surface-variant tabular-nums">
                  EVT-2026-018
                </span>
              </div>
              <h2 className="font-title text-title-lg text-light-on-surface font-semibold">
                Freshers Sports Orientation
              </h2>
              <p className="font-body text-body-md text-light-on-surface-variant tabular-nums">
                18 Oct 2026 · 112 attended · 112 participation badges issued
              </p>
            </div>
            <Link
              to="/organizer/registrations"
              className="px-md py-xs rounded bg-light-surface-container-lowest text-light-primary border border-light-outline-variant hover:bg-light-surface-container-low transition-colors duration-state-change font-label text-label-md whitespace-nowrap no-underline"
            >
              View Attendance Log
            </Link>
          </article>
        </section>
      </main>
    </OrganizerLayout>
  );
};

export default ManageEvents;
