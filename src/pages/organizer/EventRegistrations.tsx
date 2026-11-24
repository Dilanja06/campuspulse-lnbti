import React, { useEffect, useState } from 'react';
import { OrganizerLayout } from '../../components/OrganizerLayout';
import { dataService } from '../../services/dataService';
import { RegistrationItem } from '../../types';

export const EventRegistrations: React.FC = () => {
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('evt-1');
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'payment_pending' | 'checked_in'>('pending');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const fetchRegistrations = async () => {
    try {
      const data = await dataService.getRegistrations();
      setRegistrations(data);
    } catch (err) {
      console.warn('Error fetching registrations:', err);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleApprove = async (id: string, name: string) => {
    await dataService.approveRegistration(id);
    setActionSuccessMsg(`Approved registration for ${name}. Payment link released.`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
    fetchRegistrations();
  };

  const handleDecline = async (id: string, name: string) => {
    await dataService.declineRegistration(id, 'Officer review: Eligibility criteria not met.');
    setActionSuccessMsg(`Declined registration for ${name}.`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
    fetchRegistrations();
  };

  const handleCheckIn = async (id: string, name: string) => {
    await dataService.checkInRegistration(id);
    setActionSuccessMsg(`Checked in ${name} at venue. Participation badge activated.`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
    fetchRegistrations();
  };

  // Filter registrations by event and status tab
  const eventRegistrations = registrations.filter((r) => r.event_id === selectedEventId || selectedEventId === 'all');

  const pendingList = eventRegistrations.filter((r) => r.status === 'pending');
  const confirmedList = eventRegistrations.filter((r) => r.status === 'confirmed');
  const paymentPendingList = eventRegistrations.filter((r) => r.status === 'payment_pending');
  const checkedInList = eventRegistrations.filter((r) => r.status === 'checked_in');

  const currentTabList = () => {
    switch (activeTab) {
      case 'pending':
        return pendingList;
      case 'confirmed':
        return confirmedList;
      case 'payment_pending':
        return paymentPendingList;
      case 'checked_in':
        return checkedInList;
      default:
        return pendingList;
    }
  };

  const exportRosterCsv = () => {
    const rows = [
      ['Registration ID', 'Student Name', 'Student ID', 'Category / Activity', 'Status', 'Fee (LKR)'],
      ...eventRegistrations.map((r) => [
        r.reg_code,
        r.user_name || 'Student Member',
        r.student_id || 'UG/2024/0000',
        r.activity || 'General',
        r.status,
        r.fee.toString(),
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Roster_${selectedEventId}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <OrganizerLayout>
      <main className="flex-1 p-xl max-w-[1280px] w-full mx-auto flex flex-col gap-lg">
        {/* Toast / Feedback Banner */}
        {actionSuccessMsg && (
          <div className="bg-success-container text-on-success-container px-lg py-md rounded-md flex items-center justify-between gap-md shadow-sm transition-all">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span className="font-label text-label-md">{actionSuccessMsg}</span>
            </div>
            <button
              onClick={() => setActionSuccessMsg(null)}
              className="text-on-success-container hover:opacity-75 cursor-pointer bg-transparent border-0 p-0"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        {/* Event Selector & Export */}
        <div className="flex flex-wrap items-end justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline text-headline-lg text-light-on-surface">
              Event Registrations
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant tabular-nums">
              University Indoor Games Day · 15 Nov 2026 · {confirmedList.length + checkedInList.length} of 40 seats confirmed
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-sm">
            <select
              aria-label="Select event"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="px-md py-sm rounded bg-light-surface-container-lowest border border-light-outline text-light-on-surface font-label text-label-md focus:border-light-primary focus:ring-2 focus:ring-light-primary/20 outline-none"
            >
              <option value="evt-1">University Indoor Games Day (15 Nov)</option>
              <option value="evt-7">Inter-Faculty Futsal Cup (29 Nov)</option>
              <option value="all">All Managed Events</option>
            </select>
            <button
              type="button"
              onClick={exportRosterCsv}
              className="inline-flex items-center gap-xs px-md py-sm rounded bg-light-surface-container-lowest text-light-primary border border-light-outline-variant hover:bg-light-surface-container-low transition-colors duration-state-change font-label text-label-md whitespace-nowrap cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                download
              </span>
              <span>Export Roster</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div role="tablist" aria-label="Registration status filters" className="flex flex-wrap items-center gap-sm border-b border-light-outline-variant pb-md">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'pending'}
            onClick={() => setActiveTab('pending')}
            className={`px-md py-xs rounded-full cursor-pointer transition-colors ${
              activeTab === 'pending'
                ? 'bg-light-primary text-light-on-primary font-semibold'
                : 'bg-light-surface-container-lowest text-light-on-surface-variant border border-light-outline-variant hover:bg-light-surface-container-low'
            }`}
          >
            <span className="font-label text-label-md">
              Pending Review ({pendingList.length})
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'confirmed'}
            onClick={() => setActiveTab('confirmed')}
            className={`px-md py-xs rounded-full cursor-pointer transition-colors ${
              activeTab === 'confirmed'
                ? 'bg-light-primary text-light-on-primary font-semibold'
                : 'bg-light-surface-container-lowest text-light-on-surface-variant border border-light-outline-variant hover:bg-light-surface-container-low'
            }`}
          >
            <span className="font-label text-label-md">
              Confirmed ({confirmedList.length})
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'payment_pending'}
            onClick={() => setActiveTab('payment_pending')}
            className={`px-md py-xs rounded-full cursor-pointer transition-colors ${
              activeTab === 'payment_pending'
                ? 'bg-light-primary text-light-on-primary font-semibold'
                : 'bg-light-surface-container-lowest text-light-on-surface-variant border border-light-outline-variant hover:bg-light-surface-container-low'
            }`}
          >
            <span className="font-label text-label-md">
              Payment Pending ({paymentPendingList.length})
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'checked_in'}
            onClick={() => setActiveTab('checked_in')}
            className={`px-md py-xs rounded-full cursor-pointer transition-colors ${
              activeTab === 'checked_in'
                ? 'bg-light-primary text-light-on-primary font-semibold'
                : 'bg-light-surface-container-lowest text-light-on-surface-variant border border-light-outline-variant hover:bg-light-surface-container-low'
            }`}
          >
            <span className="font-label text-label-md">
              Checked In ({checkedInList.length})
            </span>
          </button>
        </div>

        {/* Registrations Roster Table */}
        <section aria-label="Student registrations table" className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-light-outline-variant bg-light-surface-container-low">
                  <th scope="col" className="px-md py-sm font-label text-label-sm text-light-on-surface-variant uppercase tracking-wider">
                    Registration ID
                  </th>
                  <th scope="col" className="px-md py-sm font-label text-label-sm text-light-on-surface-variant uppercase tracking-wider">
                    Student Name
                  </th>
                  <th scope="col" className="px-md py-sm font-label text-label-sm text-light-on-surface-variant uppercase tracking-wider">
                    Category / Activity
                  </th>
                  <th scope="col" className="px-md py-sm font-label text-label-sm text-light-on-surface-variant uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-md py-sm font-label text-label-sm text-light-on-surface-variant uppercase tracking-wider text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-outline-variant">
                {currentTabList().map((reg) => (
                  <tr key={reg.id} className="hover:bg-light-surface-container-low/50 transition-colors">
                    <td className="px-md py-md font-mono text-mono-md text-light-on-surface-variant tabular-nums whitespace-nowrap">
                      {reg.reg_code}
                    </td>
                    <td className="px-md py-md">
                      <div className="flex flex-col">
                        <span className="font-title text-title-md text-light-on-surface font-semibold whitespace-nowrap">
                          {reg.user_name || 'Nethmi Perera'}
                        </span>
                        <span className="font-mono text-mono-md text-light-on-surface-variant">
                          {reg.student_id || 'UG/2024/CS/0142'}
                        </span>
                      </div>
                    </td>
                    <td className="px-md py-md font-body text-body-md text-light-on-surface whitespace-nowrap">
                      {reg.activity || 'Indoor Games Selection'}
                    </td>
                    <td className="px-md py-md whitespace-nowrap">
                      {reg.status === 'pending' && (
                        <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-info-container text-on-info-container">
                          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                            hourglass_top
                          </span>
                          <span className="font-label text-label-sm">
                            Pending Review
                          </span>
                        </span>
                      )}
                      {reg.status === 'confirmed' && (
                        <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-success-container text-on-success-container">
                          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                            check_circle
                          </span>
                          <span className="font-label text-label-sm">
                            Confirmed
                          </span>
                        </span>
                      )}
                      {reg.status === 'payment_pending' && (
                        <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-warning-container text-on-warning-container">
                          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                            timer
                          </span>
                          <span className="font-label text-label-sm">
                            Payment Pending
                          </span>
                        </span>
                      )}
                      {reg.status === 'checked_in' && (
                        <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-light-secondary-container text-light-on-secondary-container">
                          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                            qr_code_scanner
                          </span>
                          <span className="font-label text-label-sm">
                            Checked In {reg.checked_in_time ? `(${reg.checked_in_time})` : ''}
                          </span>
                        </span>
                      )}
                    </td>
                    <td className="px-md py-md text-right whitespace-nowrap">
                      {reg.status === 'pending' && (
                        <div className="inline-flex items-center gap-sm">
                          <button
                            type="button"
                            onClick={() => handleApprove(reg.id, reg.user_name || 'Applicant')}
                            className="px-md py-xs rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container transition-colors duration-state-change font-label text-label-md cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDecline(reg.id, reg.user_name || 'Applicant')}
                            className="px-md py-xs rounded bg-light-surface-container-lowest text-light-error border border-light-outline-variant hover:bg-light-error-container transition-colors duration-state-change font-label text-label-md cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                      {reg.status === 'confirmed' && (
                        <button
                          type="button"
                          onClick={() => handleCheckIn(reg.id, reg.user_name || 'Applicant')}
                          className="px-md py-xs rounded bg-light-surface-container-lowest text-light-primary border border-light-outline-variant hover:bg-light-surface-container-low transition-colors duration-state-change font-label text-label-md cursor-pointer"
                        >
                          Check In
                        </button>
                      )}
                      {reg.status === 'payment_pending' && (
                        <span className="font-mono text-mono-md text-warning font-medium">
                          Hold: LKR {reg.fee}
                        </span>
                      )}
                      {reg.status === 'checked_in' && (
                        <span className="inline-flex items-center gap-xs font-label text-label-sm text-success font-semibold">
                          <span className="material-symbols-outlined text-[16px]">verified</span>
                          Badge Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {currentTabList().length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-lg py-xl text-center text-light-on-surface-variant font-body text-body-md">
                      No registrations found in this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </OrganizerLayout>
  );
};

export default EventRegistrations;
