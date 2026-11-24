import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CommitteeLayout } from '../../components/CommitteeLayout';
import { dataService } from '../../services/dataService';
import { CommitteeActionItem, CommitteeMemberProfile } from '../../types';

export const AssignedCommitteeActions: React.FC = () => {
  const [actions, setActions] = useState<CommitteeActionItem[]>([]);
  const [currentMember, setCurrentMember] = useState<CommitteeMemberProfile>(
    dataService.getCurrentCommitteeMember()
  );
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const allActions = await dataService.getCommitteeActions();
      setActions(allActions);
      setCurrentMember(dataService.getCurrentCommitteeMember());
    } catch (err) {
      console.error('Failed to load committee actions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <CommitteeLayout onRoleChanged={loadData}>
      <main className="flex-1 p-xl max-w-[1280px] w-full mx-auto flex flex-col gap-lg">
        <div className="flex flex-col gap-xs">
          <h1 className="font-headline text-headline-lg text-light-on-surface">
            Assigned Committee Actions
          </h1>
          <p className="font-body text-body-md text-light-on-surface-variant">
            Proposals and financial items requiring your individual {currentMember.role} decision-maker action.
          </p>
        </div>

        <section
          aria-label="Committee action table"
          className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md overflow-hidden shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-light-surface-container-low border-b border-light-outline-variant">
                  <th className="px-md py-md font-label text-label-md text-light-on-surface-variant whitespace-nowrap">
                    Ref ID
                  </th>
                  <th className="px-md py-md font-label text-label-md text-light-on-surface-variant whitespace-nowrap">
                    Item
                  </th>
                  <th className="px-md py-md font-label text-label-md text-light-on-surface-variant whitespace-nowrap">
                    Assigned Role Action
                  </th>
                  <th className="px-md py-md font-label text-label-md text-light-on-surface-variant whitespace-nowrap">
                    Committee Vote
                  </th>
                  <th className="px-md py-md font-label text-label-md text-light-on-surface-variant whitespace-nowrap">
                    My Status
                  </th>
                  <th className="px-md py-md font-label text-label-md text-light-on-surface-variant text-right whitespace-nowrap">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-outline-variant">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-md py-xl text-center text-light-on-surface-variant font-body">
                      Loading committee actions...
                    </td>
                  </tr>
                ) : actions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-md py-xl text-center text-light-on-surface-variant font-body">
                      No actions assigned to this committee.
                    </td>
                  </tr>
                ) : (
                  actions.map((act) => {
                    // Check seat status for current member
                    const mySeat = act.seats.find(
                      (s) => s.role.toLowerCase() === currentMember.role.toLowerCase()
                    );
                    const isPending = !mySeat || mySeat.status === 'Pending';

                    return (
                      <tr key={act.id} className="hover:bg-light-surface-container-low transition-colors duration-state-change">
                        <td className="px-md py-md font-mono text-mono-md text-light-on-surface-variant tabular-nums whitespace-nowrap">
                          {act.code}
                        </td>
                        <td className="px-md py-md font-title text-title-md text-light-on-surface whitespace-nowrap font-medium">
                          {act.item_title}
                        </td>
                        <td className="px-md py-md font-body text-body-md text-light-on-surface-variant whitespace-nowrap">
                          {act.assigned_role_action}
                        </td>
                        <td className="px-md py-md font-mono text-mono-md text-light-on-surface tabular-nums whitespace-nowrap">
                          {act.signed_count} of {act.total_seats} signed
                        </td>
                        <td className="px-md py-md whitespace-nowrap">
                          <span
                            role="status"
                            className={`inline-flex items-center gap-xs px-sm py-xs rounded-full whitespace-nowrap ${
                              isPending
                                ? 'bg-warning-container text-on-warning-container'
                                : 'bg-success-container text-on-success-container'
                            }`}
                          >
                            <span className="font-label text-label-sm font-semibold">
                              {isPending ? 'Pending' : 'Signed'}
                            </span>
                          </span>
                        </td>
                        <td className="px-md py-md text-right whitespace-nowrap">
                          <Link
                            to={`/committee/actions/${act.id}`}
                            className={`inline-flex items-center justify-center px-md py-xs rounded transition-colors duration-state-change no-underline ${
                              isPending
                                ? 'bg-light-primary text-light-on-primary hover:bg-light-primary-container'
                                : 'bg-light-surface-container-lowest text-light-primary border border-light-outline-variant hover:bg-light-surface-container-low'
                            }`}
                          >
                            <span className="font-label text-label-md whitespace-nowrap">
                              {isPending ? 'Act Now' : 'View'}
                            </span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </CommitteeLayout>
  );
};

export default AssignedCommitteeActions;
