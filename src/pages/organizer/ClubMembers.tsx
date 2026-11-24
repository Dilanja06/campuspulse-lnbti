import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { OrganizerLayout } from '../../components/OrganizerLayout';
import { dataService } from '../../services/dataService';
import { ClubMemberItem } from '../../types';

export const ClubMembers: React.FC = () => {
  const [members, setMembers] = useState<ClubMemberItem[]>([]);
  const [clubSummary, setClubSummary] = useState(
    'Official student sports body organizing inter-faculty tournaments, indoor games, and athletics training.'
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchMembers = async () => {
    try {
      const data = await dataService.getClubMembers('club-sports');
      setMembers(data);
    } catch (err) {
      console.warn('Error fetching club members:', err);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleApproveMember = async (id: string, name: string) => {
    await dataService.approveClubMember(id);
    setToastMessage(`Approved membership for ${name}. Membership fee notice released.`);
    setTimeout(() => setToastMessage(null), 4000);
    fetchMembers();
  };

  const handleDeclineMember = async (id: string, name: string) => {
    await dataService.declineClubMember(id);
    setToastMessage(`Declined join request for ${name}.`);
    setTimeout(() => setToastMessage(null), 4000);
    fetchMembers();
  };

  const handleSaveClubContent = () => {
    setToastMessage('Public club summary updated successfully.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const pendingRequests = members.filter((m) => m.status === 'Pending');
  const activeMembers = members.filter((m) => m.status === 'Active');

  return (
    <OrganizerLayout>
      <main className="flex-1 p-xl max-w-[1280px] w-full mx-auto flex flex-col gap-xl">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="bg-success-container text-on-success-container px-lg py-md rounded-md flex items-center justify-between gap-md shadow-sm transition-all">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span className="font-label text-label-md">{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-on-success-container hover:opacity-75 cursor-pointer bg-transparent border-0 p-0"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        {/* Header & Public Club Link */}
        <div className="flex flex-wrap items-end justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline text-headline-lg text-light-on-surface">
              Sports Club &amp; Members
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant tabular-nums">
              148 active members · {pendingRequests.length} pending join requests · Annual membership fee: LKR 1,000
            </p>
          </div>
          <Link
            to="/clubs/club-sports"
            className="px-md py-sm rounded bg-light-surface-container-lowest text-light-primary border border-light-outline-variant hover:bg-light-surface-container-low transition-colors duration-state-change font-label text-label-lg whitespace-nowrap no-underline"
          >
            View Public Club Profile
          </Link>
        </div>

        {/* 2-Column Operational Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
          {/* Pending Join Requests (7 cols) */}
          <section aria-label="Pending membership requests" className="lg:col-span-7 flex flex-col gap-md">
            <h2 className="font-headline text-headline-sm text-light-on-surface">
              Pending Join Requests ({pendingRequests.length})
            </h2>

            <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md divide-y divide-light-outline-variant shadow-sm">
              {pendingRequests.map((req) => (
                <div key={req.id} className="p-lg flex flex-wrap items-center justify-between gap-md hover:bg-light-surface-container-low/40 transition-colors">
                  <div className="flex flex-col gap-xs">
                    <span className="font-title text-title-md text-light-on-surface font-semibold">
                      {req.name}
                    </span>
                    <span className="font-body text-body-md text-light-on-surface-variant tabular-nums">
                      {req.student_id} · Requested {req.requested_date || 'Recently'}
                    </span>
                  </div>
                  <div className="flex items-center gap-sm">
                    <button
                      type="button"
                      onClick={() => handleApproveMember(req.id, req.name)}
                      className="px-md py-xs rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container transition-colors duration-state-change font-label text-label-md cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeclineMember(req.id, req.name)}
                      className="px-md py-xs rounded bg-light-surface-container-lowest text-light-error border border-light-outline-variant hover:bg-light-error-container transition-colors duration-state-change font-label text-label-md cursor-pointer"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}

              {pendingRequests.length === 0 && (
                <div className="p-xl text-center flex flex-col items-center justify-center gap-sm">
                  <span className="material-symbols-outlined text-[32px] text-success">
                    check_circle
                  </span>
                  <p className="font-body text-body-md text-light-on-surface-variant">
                    All membership join requests have been processed!
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Club Committee & Profile Content (5 cols) */}
          <section aria-label="Club committee and profile settings" className="lg:col-span-5 flex flex-col gap-md">
            <h2 className="font-headline text-headline-sm text-light-on-surface">
              Committee &amp; Club Content
            </h2>

            <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
              <div className="flex flex-col gap-xs">
                <span className="font-label text-label-md text-light-on-surface-variant">
                  Five Club Decision-Makers
                </span>
                <ul className="flex flex-col gap-xs pt-xs list-none p-0 m-0">
                  <li className="flex items-center justify-between text-body-md py-xs border-b border-light-outline-variant/50">
                    <span className="text-light-on-surface font-medium">President · Ishara De Silva</span>
                    <span className="font-label text-label-sm text-on-success-container bg-success-container px-sm py-xs rounded-full">
                      Active
                    </span>
                  </li>
                  <li className="flex items-center justify-between text-body-md py-xs border-b border-light-outline-variant/50">
                    <span className="text-light-on-surface font-medium">Secretary · Nethmi Perera</span>
                    <span className="font-label text-label-sm text-on-info-container bg-info-container px-sm py-xs rounded-full">
                      Authorized Organizer
                    </span>
                  </li>
                  <li className="flex items-center justify-between text-body-md py-xs">
                    <span className="text-light-on-surface font-medium">Treasurer · Chamod Perera</span>
                    <span className="font-label text-label-sm text-on-success-container bg-success-container px-sm py-xs rounded-full">
                      Active
                    </span>
                  </li>
                </ul>
              </div>

              <div className="pt-md border-t border-light-outline-variant flex flex-col gap-sm">
                <label
                  htmlFor="club-tagline"
                  className="font-label text-label-md text-light-on-surface font-medium"
                >
                  Public Club Summary
                </label>
                <textarea
                  id="club-tagline"
                  rows={3}
                  value={clubSummary}
                  onChange={(e) => setClubSummary(e.target.value)}
                  className="w-full px-md py-sm rounded bg-light-surface-container-lowest border border-light-outline text-light-on-surface font-body text-body-md focus:border-light-primary focus:ring-2 focus:ring-light-primary/20 outline-none resize-none"
                />
                <button
                  type="button"
                  onClick={handleSaveClubContent}
                  className="self-end px-md py-xs rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container transition-colors duration-state-change font-label text-label-md cursor-pointer"
                >
                  Save Club Content
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </OrganizerLayout>
  );
};

export default ClubMembers;
