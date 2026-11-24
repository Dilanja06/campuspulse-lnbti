import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { OrganizerLayout } from '../../components/OrganizerLayout';
import { dataService } from '../../services/dataService';
import { EventItem, ProposalItem, RegistrationItem } from '../../types';

export const OrganizerDashboard: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [pendingMemberRequestsCount, setPendingMemberRequestsCount] = useState(4);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [allEvents, allProposals, allRegs, allMembers] = await Promise.all([
          dataService.getEvents(),
          dataService.getProposals(),
          dataService.getRegistrations(),
          dataService.getClubMembers('club-sports'),
        ]);

        setEvents(allEvents.filter((e) => e.club_id === 'club-sports' || e.id === 'evt-1' || e.id === 'evt-7'));
        setProposals(allProposals);
        setRegistrations(allRegs);
        setPendingMemberRequestsCount(allMembers.filter((m) => m.status === 'Pending').length);
      } catch (err) {
        console.warn('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const pendingReviewRegs = registrations.filter((r) => r.status === 'pending');
  const inReviewProposals = proposals.filter((p) => p.status === 'Higher Authority' || p.status === 'Revision Requested' || p.status === 'In Review');

  return (
    <OrganizerLayout>
      <main className="flex-1 p-xl max-w-[1280px] w-full mx-auto flex flex-col gap-xl">
        {/* Header & Primary Action */}
        <div className="flex flex-wrap items-end justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline text-headline-lg text-light-on-surface">
              Sports Club Workspace
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant">
              Manage event proposals, approval stages, student registrations, and club membership requests.
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

        {/* Action Required Banner */}
        <section
          aria-label="Pending organizer actions"
          className="bg-warning-container text-on-warning-container rounded-md p-md flex flex-wrap items-center justify-between gap-md shadow-sm"
        >
          <div className="flex items-center gap-md">
            <span className="material-symbols-outlined text-[24px] shrink-0" aria-hidden="true">
              pending_actions
            </span>
            <div className="flex flex-col gap-xs">
              <span className="font-title text-title-md font-bold">
                {pendingReviewRegs.length} student registration{pendingReviewRegs.length !== 1 ? 's' : ''} awaiting officer review
              </span>
              <span className="font-body text-body-md tabular-nums">
                University Indoor Games Day · Approve eligible applicants to release payment links.
              </span>
            </div>
          </div>
          <Link
            to="/organizer/registrations"
            className="inline-flex items-center justify-center px-md py-xs rounded bg-light-surface-container-lowest text-light-primary border border-light-outline-variant hover:bg-light-surface-container-low transition-colors duration-state-change font-label text-label-md whitespace-nowrap no-underline"
          >
            Review Queue
          </Link>
        </section>

        {/* Glanceable Metrics */}
        <section
          aria-label="Club performance metrics"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg items-stretch"
        >
          {/* Card 1: Active Events */}
          <div className="h-full bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col justify-between gap-sm">
            <span className="font-label text-label-md text-light-on-surface-variant">
              Active Events
            </span>
            <div className="flex items-baseline justify-between gap-sm">
              <span className="font-headline text-headline-md text-light-on-surface tabular-nums">
                2
              </span>
              <span className="font-label text-label-sm text-on-success-container bg-success-container px-sm py-xs rounded-full">
                Registration Open
              </span>
            </div>
          </div>

          {/* Card 2: Pending Proposals */}
          <div className="h-full bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col justify-between gap-sm">
            <span className="font-label text-label-md text-light-on-surface-variant">
              Pending Proposals
            </span>
            <div className="flex items-baseline justify-between gap-sm">
              <span className="font-headline text-headline-md text-light-on-surface tabular-nums">
                {inReviewProposals.length}
              </span>
              <span className="font-label text-label-sm text-on-info-container bg-info-container px-sm py-xs rounded-full">
                In Review
              </span>
            </div>
          </div>

          {/* Card 3: Confirmed Attendees */}
          <div className="h-full bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col justify-between gap-sm">
            <span className="font-label text-label-md text-light-on-surface-variant">
              Confirmed Attendees
            </span>
            <div className="flex items-baseline justify-between gap-sm">
              <span className="font-headline text-headline-md text-light-on-surface tabular-nums">
                94
              </span>
              <span className="font-mono text-mono-md text-light-on-surface-variant tabular-nums">
                of 120 seats
              </span>
            </div>
          </div>

          {/* Card 4: Collected Fees */}
          <div className="h-full bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col justify-between gap-sm">
            <div className="flex items-center justify-between gap-xs">
              <span className="font-label text-label-md text-light-on-surface-variant whitespace-nowrap">
                Collected Fees
              </span>
              <span className="font-label text-label-sm text-light-on-surface-variant whitespace-nowrap">
                This Term
              </span>
            </div>
            <span className="font-headline text-headline-md text-light-on-surface tabular-nums whitespace-nowrap">
              LKR 14,000
            </span>
          </div>
        </section>

        {/* Two-Column Operational Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
          {/* Upcoming Managed Events (7 cols) */}
          <section aria-label="Upcoming managed events" className="lg:col-span-7 flex flex-col gap-md">
            <div className="flex items-center justify-between gap-md">
              <h2 className="font-headline text-headline-sm text-light-on-surface">
                Upcoming Managed Events
              </h2>
              <Link
                to="/organizer/events"
                className="font-label text-label-md text-light-primary hover:underline no-underline"
              >
                Manage All
              </Link>
            </div>

            {/* Event 1 Card */}
            <article className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md overflow-hidden flex flex-col sm:flex-row shadow-sm">
              <img
                src="https://lh3.googleusercontent.com/aida/ALJJyrAvs_a5eVeVsidNSMPhk0_89s2EaOqj7kb0x-Rz3jocZbKT1aBIgH01GKJ5quU1TU7DEnqThYCz0opGFovadYYXsujAo8AEbF6H3cdtLp4tTt1oQFzchwAiMpBWXfdlZr8keMUZczSQbWLZM-vEjdBffY2aUOw-tkxo063HkEfFKjhxo2ZY16SaJdamoi4-1ZHRvWuS3dJUNLIbISYURqhI5uvc5hQrLlLUvI54W6U0UU49eYHqh44I9AZo"
                alt="University Indoor Games Day at Main Hall"
                className="w-full sm:w-48 h-44 sm:h-auto object-cover shrink-0"
              />
              <div className="p-lg flex-1 flex flex-col justify-between gap-md">
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
                  <h3 className="font-title text-title-lg text-light-on-surface font-semibold">
                    University Indoor Games Day
                  </h3>
                  <p className="font-body text-body-md text-light-on-surface-variant tabular-nums">
                    15 Nov 2026 · 09:00 AM – 04:30 PM · Main Hall
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-md pt-sm border-t border-light-outline-variant">
                  <span className="font-mono text-mono-md text-light-on-surface tabular-nums">
                    28 of 40 seats filled
                  </span>
                  <Link
                    to="/organizer/registrations"
                    className="inline-flex items-center justify-center px-md py-xs rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container transition-colors duration-state-change font-label text-label-md whitespace-nowrap no-underline"
                  >
                    View Roster
                  </Link>
                </div>
              </div>
            </article>

            {/* Event 2 Card */}
            <article className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-wrap items-center justify-between gap-md shadow-sm">
              <div className="flex flex-col gap-xs">
                <div className="flex items-center gap-sm">
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
                <h3 className="font-title text-title-md text-light-on-surface font-semibold">
                  Inter-Faculty Futsal Cup
                </h3>
                <p className="font-body text-body-md text-light-on-surface-variant tabular-nums">
                  29 Nov 2026 · University Sports Complex · 66 of 80 seats filled
                </p>
              </div>
              <Link
                to="/organizer/registrations"
                className="inline-flex items-center justify-center px-md py-xs rounded bg-light-surface-container-lowest text-light-primary border border-light-outline-variant hover:bg-light-surface-container-low transition-colors duration-state-change font-label text-label-md whitespace-nowrap no-underline"
              >
                View Roster
              </Link>
            </article>
          </section>

          {/* Proposal Approval Tracker (5 cols) */}
          <section aria-label="Proposal approval tracker" className="lg:col-span-5 flex flex-col gap-md">
            <div className="flex items-center justify-between gap-md">
              <h2 className="font-headline text-headline-sm text-light-on-surface">
                Proposal Pipeline
              </h2>
              <Link
                to="/organizer/proposals"
                className="font-label text-label-md text-light-primary hover:underline no-underline"
              >
                View All
              </Link>
            </div>

            <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
              <div className="flex flex-col gap-xs pb-md border-b border-light-outline-variant">
                <div className="flex items-center justify-between gap-sm">
                  <span className="font-mono text-mono-md text-light-on-surface-variant tabular-nums">
                    PROP-1084
                  </span>
                  <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-info-container text-on-info-container">
                    <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                      hourglass_top
                    </span>
                    <span className="font-label text-label-sm">
                      Higher Authority
                    </span>
                  </span>
                </div>
                <span className="font-title text-title-md text-light-on-surface font-semibold">
                  Annual Athletics Meet 2026
                </span>
                <span className="font-body text-body-md text-light-on-surface-variant">
                  Stage 3 of 4 · Lecturer Coordinator endorsed
                </span>
              </div>

              <div className="flex flex-col gap-xs pb-md border-b border-light-outline-variant">
                <div className="flex items-center justify-between gap-sm">
                  <span className="font-mono text-mono-md text-light-on-surface-variant tabular-nums">
                    PROP-1091
                  </span>
                  <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-warning-container text-on-warning-container">
                    <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                      edit_note
                    </span>
                    <span className="font-label text-label-sm">
                      Revision Requested
                    </span>
                  </span>
                </div>
                <span className="font-title text-title-md text-light-on-surface font-semibold">
                  Badminton Coaching Clinic
                </span>
                <span className="font-body text-body-md text-light-on-surface-variant">
                  Update safety equipment quote from Treasurer
                </span>
              </div>

              <div className="flex items-center justify-between gap-md pt-xs">
                <span className="font-body text-body-md text-light-on-surface-variant">
                  {pendingMemberRequestsCount} pending club join requests
                </span>
                <Link
                  to="/organizer/members"
                  className="font-label text-label-md text-light-primary hover:underline whitespace-nowrap no-underline"
                >
                  Review Members
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </OrganizerLayout>
  );
};

export default OrganizerDashboard;
