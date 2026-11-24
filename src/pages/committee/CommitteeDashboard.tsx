import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CommitteeLayout } from '../../components/CommitteeLayout';
import { dataService } from '../../services/dataService';
import { CommitteeMemberProfile, CommitteeActionItem } from '../../types';

export const CommitteeDashboard: React.FC = () => {
  const [currentMember, setCurrentMember] = useState<CommitteeMemberProfile>(
    dataService.getCurrentCommitteeMember()
  );
  const [members, setMembers] = useState<CommitteeMemberProfile[]>([]);
  const [actions, setActions] = useState<CommitteeActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [mems, acts] = await Promise.all([
        dataService.getCommitteeMembers(),
        dataService.getCommitteeActions(),
      ]);
      setMembers(mems);
      setActions(acts);
      setCurrentMember(dataService.getCurrentCommitteeMember());
    } catch (err) {
      console.error('Failed to load committee dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectMember = (id: string) => {
    const updated = dataService.switchCommitteeMember(id);
    setCurrentMember(updated);
    loadData();
  };

  // Filter actions assigned to current member's seat
  const myAssignedActions = actions.filter((a) => {
    const seat = a.seats.find(
      (s) => s.role.toLowerCase() === currentMember.role.toLowerCase()
    );
    return seat && seat.status === 'Pending';
  });

  return (
    <CommitteeLayout onRoleChanged={loadData}>
      <main className="flex-1 p-xl max-w-[1280px] w-full mx-auto flex flex-col gap-xl">
        <div className="flex flex-wrap items-end justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline text-headline-lg text-light-on-surface">
              Committee Activity &amp; Actions
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant">
              Monitor {currentMember.club_name} proposals and complete your individually assigned {currentMember.role} sign-offs.
            </p>
          </div>
          <Link
            to="/committee/actions"
            className="inline-flex items-center justify-center gap-xs px-md py-sm rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container transition-colors duration-state-change no-underline"
          >
            <span className="font-label text-label-lg whitespace-nowrap">View Assigned Actions</span>
          </Link>
        </div>

        {/* Glanceable Metrics */}
        <section aria-label="Committee metrics" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg items-stretch">
          <div className="h-full bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col justify-between gap-sm shadow-sm">
            <span className="font-label text-label-md text-light-on-surface-variant">
              My Pending Actions
            </span>
            <div className="flex items-baseline justify-between gap-sm">
              <span className="font-headline text-headline-md text-light-on-surface tabular-nums">
                {myAssignedActions.length}
              </span>
              <span className={`font-label text-label-sm px-sm py-xs rounded-full whitespace-nowrap ${
                myAssignedActions.length > 0 
                  ? 'text-on-warning-container bg-warning-container' 
                  : 'text-on-success-container bg-success-container'
              }`}>
                {myAssignedActions.length > 0 ? 'Due Soon' : 'All Clear'}
              </span>
            </div>
          </div>

          <div className="h-full bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col justify-between gap-sm shadow-sm">
            <span className="font-label text-label-md text-light-on-surface-variant">
              Committee Seats
            </span>
            <div className="flex items-baseline justify-between gap-sm">
              <span className="font-headline text-headline-md text-light-on-surface tabular-nums">
                5 / 5
              </span>
              <span className="font-label text-label-sm text-on-success-container bg-success-container px-sm py-xs rounded-full whitespace-nowrap">
                Active
              </span>
            </div>
          </div>

          <div className="h-full bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col justify-between gap-sm shadow-sm">
            <div className="flex items-center justify-between gap-xs">
              <span className="font-label text-label-md text-light-on-surface-variant whitespace-nowrap">
                Club Treasury
              </span>
              <span className="font-label text-label-sm text-light-on-surface-variant whitespace-nowrap">
                Balance
              </span>
            </div>
            <span className="font-headline text-headline-md text-light-on-surface tabular-nums whitespace-nowrap">
              LKR 142,500
            </span>
          </div>

          <div className="h-full bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col justify-between gap-sm shadow-sm">
            <span className="font-label text-label-md text-light-on-surface-variant">
              Active Members
            </span>
            <div className="flex items-baseline justify-between gap-sm">
              <span className="font-headline text-headline-md text-light-on-surface tabular-nums">
                148
              </span>
              <span className="font-label text-label-sm text-light-on-surface-variant whitespace-nowrap">
                Term 2026
              </span>
            </div>
          </div>
        </section>

        {/* Two-Column View: Assigned Actions & Five Decision-Makers Status */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
          <section aria-label="My assigned actions" className="lg:col-span-7 flex flex-col gap-md">
            <div className="flex items-center justify-between gap-md">
              <h2 className="font-headline text-headline-sm text-light-on-surface">
                Assigned to You ({currentMember.role})
              </h2>
              <Link
                to="/committee/actions"
                className="font-label text-label-md text-light-primary hover:underline whitespace-nowrap no-underline"
              >
                View All
              </Link>
            </div>

            {loading ? (
              <div className="p-xl text-center text-light-on-surface-variant font-body">
                Loading assigned committee actions...
              </div>
            ) : myAssignedActions.length === 0 ? (
              <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-xl text-center flex flex-col items-center gap-sm">
                <span className="material-symbols-outlined text-[36px] text-success">
                  check_circle
                </span>
                <span className="font-title text-title-md text-light-on-surface font-semibold">
                  No Actions Pending
                </span>
                <span className="font-body text-body-md text-light-on-surface-variant">
                  You have completed all assigned {currentMember.role} votes and sign-offs for this cycle.
                </span>
              </div>
            ) : (
              myAssignedActions.map((action) => (
                <article
                  key={action.id}
                  className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-wrap items-center justify-between gap-md shadow-sm"
                >
                  <div className="flex flex-col gap-xs">
                    <div className="flex items-center gap-sm">
                      <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-warning-container text-on-warning-container whitespace-nowrap font-label text-label-sm">
                        {action.assigned_role_action}
                      </span>
                      <span className="font-mono text-mono-md text-light-on-surface-variant tabular-nums">
                        {action.code}
                      </span>
                    </div>
                    <h3 className="font-title text-title-lg text-light-on-surface font-semibold">
                      {action.item_title}
                    </h3>
                    <p className="font-body text-body-md text-light-on-surface-variant tabular-nums">
                      Requested budget: LKR {action.budget?.toLocaleString()} · {action.signed_count} of {action.total_seats} committee members signed
                    </p>
                  </div>
                  <Link
                    to={`/committee/actions/${action.id}`}
                    className="px-md py-sm rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container transition-colors duration-state-change no-underline"
                  >
                    <span className="font-label text-label-md whitespace-nowrap">Review &amp; Sign Off</span>
                  </Link>
                </article>
              ))
            )}
          </section>

          {/* Five Committee Decision-Makers */}
          <section aria-label="Five club decision-makers" className="lg:col-span-5 flex flex-col gap-md">
            <h2 className="font-headline text-headline-sm text-light-on-surface">
              Five Club Decision-Makers
            </h2>
            <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-sm shadow-sm">
              {members.map((m, index) => {
                const isSelected = m.id === currentMember.id;
                // Calculate dynamic pending count for this member
                const pendingForM = actions.filter((a) => {
                  const s = a.seats.find((st) => st.role.toLowerCase() === m.role.toLowerCase());
                  return s && s.status === 'Pending';
                }).length;

                return (
                  <button
                    key={m.id}
                    onClick={() => handleSelectMember(m.id)}
                    className={`flex items-center justify-between py-sm px-sm rounded transition-colors text-left border-0 bg-transparent cursor-pointer ${
                      isSelected
                        ? 'bg-light-surface-container-low ring-1 ring-light-primary/30'
                        : 'hover:bg-light-surface-container-low/50'
                    } ${index < members.length - 1 ? 'border-b border-light-outline-variant' : ''}`}
                  >
                    <div className="flex items-center gap-sm">
                      <span className="font-body text-body-md text-light-on-surface">
                        <strong className={isSelected ? 'text-light-primary' : ''}>
                          {index + 1}. {m.role}
                        </strong>{' '}
                        · {m.name} {isSelected && '(Active)'}
                      </span>
                    </div>
                    <span
                      className={`font-label text-label-sm px-sm py-xs rounded-full whitespace-nowrap ${
                        pendingForM > 0
                          ? 'text-on-warning-container bg-warning-container font-semibold'
                          : 'text-on-success-container bg-success-container'
                      }`}
                    >
                      {pendingForM > 0 ? `${pendingForM} Pending` : '0 Pending'}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </CommitteeLayout>
  );
};

export default CommitteeDashboard;
