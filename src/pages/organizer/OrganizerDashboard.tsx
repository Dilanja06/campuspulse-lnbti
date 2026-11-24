import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { OrganizerLayout } from '../../components/OrganizerLayout';
import { EventItem, ProposalItem, RegistrationItem, RefundRequestItem, ClubMemberItem } from '../../types';
import { dataService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import { getEventCoverImage } from '../../utils/eventImages';

export const OrganizerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [refunds, setRefunds] = useState<RefundRequestItem[]>([]);
  const [members, setMembers] = useState<ClubMemberItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ev, pr, rg, rf, mb] = await Promise.all([
          dataService.getEvents(),
          dataService.getProposals(),
          dataService.getRegistrations(),
          dataService.getRefundRequests(),
          dataService.getClubMembers(),
        ]);
        setEvents(ev);
        setProposals(pr);
        setRegistrations(rg);
        setRefunds(rf);
        setMembers(mb);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const activeEvents = events.filter((e) => e.status === 'published');
  const pendingProps = proposals.filter((p) => p.status !== 'Approved & Published' && p.status !== 'Rejected');
  const activeRegs = registrations.filter((r) => r.status !== 'cancelled' && r.status !== 'rejected');
  const pendingRefunds = refunds.filter((r) => r.status === 'Requested' || r.status === 'Under Review');
  const pendingMembers = members.filter((m) => m.status === 'Pending');

  return (
    <OrganizerLayout>
      <main className="p-lg md:p-xl max-w-[1400px] w-full mx-auto flex flex-col gap-xl">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline text-headline-lg text-light-on-surface font-semibold">
              Club Officer Console
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant">
              Welcome, {user?.name || 'Amara Silva'} · Real-time metrics across proposals, registrations, QR gates, and refunds.
            </p>
          </div>
          <div className="flex items-center gap-sm flex-wrap">
            <Link
              to="/organizer/attendance"
              className="inline-flex items-center gap-xs px-md py-sm rounded bg-light-surface-container-lowest border border-light-outline-variant text-light-on-surface font-label text-label-md font-semibold no-underline hover:bg-light-surface-container-low"
            >
              <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
              <span>QR Attendance Gate</span>
            </Link>
            <Link
              to="/organizer/proposals/new"
              className="inline-flex items-center gap-xs px-md py-sm rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold no-underline hover:bg-light-primary-container"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Create Proposal</span>
            </Link>
          </div>
        </header>

        {/* Live KPI Strip */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
          <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-xs shadow-sm">
            <span className="font-label text-label-md text-light-on-surface-variant">Published Events</span>
            <span className="font-headline text-display-sm text-light-primary font-bold tabular-nums">
              {activeEvents.length}
            </span>
            <Link to="/organizer/events" className="font-label text-label-sm text-light-primary no-underline hover:underline">
              Manage editions →
            </Link>
          </div>

          <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-xs shadow-sm">
            <span className="font-label text-label-md text-light-on-surface-variant">Active Student Registrations</span>
            <span className="font-headline text-display-sm text-success font-bold tabular-nums">
              {activeRegs.length}
            </span>
            <Link to="/organizer/registrations" className="font-label text-label-sm text-light-primary no-underline hover:underline">
              Review roster →
            </Link>
          </div>

          <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-xs shadow-sm">
            <span className="font-label text-label-md text-light-on-surface-variant">Proposals in Workflow</span>
            <span className="font-headline text-display-sm text-info-primary font-bold tabular-nums">
              {pendingProps.length}
            </span>
            <Link to="/organizer/proposals" className="font-label text-label-sm text-light-primary no-underline hover:underline">
              Track approvals →
            </Link>
          </div>

          <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-xs shadow-sm">
            <span className="font-label text-label-md text-light-on-surface-variant">Pending Refunds &amp; Members</span>
            <span className="font-headline text-display-sm text-warning font-bold tabular-nums">
              {pendingRefunds.length + pendingMembers.length}
            </span>
            <div className="flex gap-sm text-label-sm">
              <Link to="/organizer/refunds" className="text-light-primary no-underline hover:underline">
                {pendingRefunds.length} Refunds
              </Link>
              <span>·</span>
              <Link to="/organizer/members" className="text-light-primary no-underline hover:underline">
                {pendingMembers.length} Members
              </Link>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
          {/* Live Events Card List */}
          <section className="lg:col-span-7 bg-light-surface-container-lowest border border-light-outline-variant rounded-md shadow-sm overflow-hidden">
            <div className="px-lg py-md border-b border-light-outline-variant flex items-center justify-between bg-light-surface-container-low/50">
              <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold m-0">
                Active Event Editions
              </h2>
              <Link to="/organizer/events" className="font-label text-label-md text-light-primary no-underline hover:underline">
                Manage All →
              </Link>
            </div>

            <div className="divide-y divide-light-outline-variant">
              {loading ? (
                <div className="p-lg text-center text-light-on-surface-variant">Loading dashboard...</div>
              ) : (
                events.slice(0, 4).map((ev) => (
                  <div key={ev.id} className="p-md flex items-center justify-between gap-md hover:bg-light-surface-container-low/30">
                    <div className="flex items-center gap-md">
                      <img
                        src={getEventCoverImage(ev)}
                        alt={ev.title}
                        className="w-14 h-14 rounded object-cover shrink-0 bg-slate-800"
                      />
                      <div className="flex flex-col">
                        <span className="font-title text-title-md text-light-on-surface font-semibold">
                          {ev.title}
                        </span>
                        <span className="font-label text-label-sm text-light-on-surface-variant">
                          {ev.start_date} · {ev.venue}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-mono-md font-bold text-light-on-surface tabular-nums block">
                        {ev.registered}/{ev.capacity}
                      </span>
                      <span className="font-label text-label-sm text-light-on-surface-variant">Seats filled</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Recent Proposals */}
          <section className="lg:col-span-5 bg-light-surface-container-lowest border border-light-outline-variant rounded-md shadow-sm overflow-hidden">
            <div className="px-lg py-md border-b border-light-outline-variant flex items-center justify-between bg-light-surface-container-low/50">
              <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold m-0">
                Proposal Pipeline
              </h2>
              <Link to="/organizer/proposals" className="font-label text-label-md text-light-primary no-underline hover:underline">
                View All →
              </Link>
            </div>

            <div className="divide-y divide-light-outline-variant">
              {proposals.slice(0, 5).map((p) => (
                <Link
                  key={p.id}
                  to={`/organizer/proposals/${p.id}`}
                  className="p-md flex items-center justify-between gap-md no-underline hover:bg-light-surface-container-low/30 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-mono text-mono-sm text-light-primary">{p.code} · Rev #{p.current_revision || 1}</span>
                    <span className="font-title text-title-md text-light-on-surface font-medium">{p.title}</span>
                  </div>
                  <span className="font-label text-label-sm px-sm py-0.5 rounded-full bg-light-surface-container-low text-light-on-surface whitespace-nowrap">
                    {p.status}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </OrganizerLayout>
  );
};

export default OrganizerDashboard;
