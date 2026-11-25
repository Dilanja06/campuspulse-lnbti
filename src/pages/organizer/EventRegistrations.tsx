import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { OrganizerLayout } from '../../components/OrganizerLayout';
import { RegistrationItem, EventItem } from '../../types';
import { dataService } from '../../services/dataService';

export const EventRegistrations: React.FC = () => {
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [declineTarget, setDeclineTarget] = useState<RegistrationItem | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [regs, evs] = await Promise.all([
        dataService.getRegistrations(),
        dataService.getEvents(),
      ]);
      setRegistrations(regs);
      setEvents(evs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = registrations.filter((r) => {
    const matchEvent = selectedEventId === 'all' || r.event_id === selectedEventId;
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchEvent && matchStatus;
  });

  const handleApprove = async (id: string) => {
    await dataService.approveRegistration(id);
    await loadData();
  };

  const handleDeclineConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!declineTarget) return;
    await dataService.declineRegistration(declineTarget.id, declineReason || 'Seat requirements not met.');
    setDeclineTarget(null);
    setDeclineReason('');
    await loadData();
  };

  const handleExportCSV = () => {
    const headers = ['RegCode', 'StudentName', 'StudentID', 'Email', 'Event', 'Status', 'CheckIn', 'Fee'];
    const rows = filtered.map((r) => [
      r.reg_code,
      r.user_name || '',
      r.student_id || '',
      r.user_email || '',
      r.event_title,
      r.status,
      r.check_in_status || 'not_checked_in',
      String(r.fee),
    ]);
    const csv = [headers, ...rows].map((row) => row.map((v) => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campuspulse-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <OrganizerLayout>
      <main className="p-lg md:p-xl max-w-[1400px] w-full mx-auto flex flex-col gap-xl">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline text-headline-lg text-light-on-surface font-semibold">
              Event Registrations &amp; Participant Queue
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant">
              Approve manual-approval registrations, export attendee rosters, and enforce live QR gate check-in without manual check-in overrides.
            </p>
          </div>
          <div className="flex items-center gap-sm flex-wrap">
            <Link
              to="/organizer/attendance"
              className="inline-flex items-center gap-xs px-md py-sm rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold no-underline"
            >
              <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
              <span>Open Live QR Check-In</span>
            </Link>
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-xs px-md py-sm rounded border border-light-outline-variant bg-light-surface-container-lowest text-light-on-surface font-label text-label-md font-semibold cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Export CSV</span>
            </button>
          </div>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap gap-md items-center bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-md">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="px-md py-xs rounded border border-light-outline bg-light-surface-container-lowest font-body text-body-md"
          >
            <option value="all">All Events ({registrations.length} registrations)</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.title}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-md py-xs rounded border border-light-outline bg-light-surface-container-lowest font-body text-body-md"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Manual Approval</option>
            <option value="payment_pending">Payment Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked In (QR Verified)</option>
            <option value="rejected">Declined / Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-light-outline-variant bg-light-surface-container-low/50 text-light-on-surface-variant font-label text-label-sm">
                  <th className="px-md py-md">Reg Code</th>
                  <th className="px-md py-md">Student</th>
                  <th className="px-md py-md">Event &amp; Track</th>
                  <th className="px-md py-md">Status</th>
                  <th className="px-md py-md">Attendance</th>
                  <th className="px-md py-md text-right">Officer Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-outline-variant">
                {loading ? (
                  <tr><td colSpan={6} className="p-xl text-center">Loading registrations...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="p-xl text-center">No registrations match your filter.</td></tr>
                ) : (
                  filtered.map((reg) => (
                    <tr key={reg.id} className="hover:bg-light-surface-container-low/30">
                      <td className="px-md py-md font-mono text-mono-md text-light-primary whitespace-nowrap">
                        {reg.reg_code}
                      </td>
                      <td className="px-md py-md">
                        <div className="font-title text-title-md text-light-on-surface font-medium">
                          {reg.user_name || 'Student Participant'}
                        </div>
                        <div className="font-mono text-mono-sm text-light-on-surface-variant">
                          {reg.student_id || 'UG/2024'}
                        </div>
                      </td>
                      <td className="px-md py-md">
                        <div className="font-body text-body-md text-light-on-surface">{reg.event_title}</div>
                        <div className="font-label text-label-sm text-light-on-surface-variant">{reg.activity || 'Participant'}</div>
                      </td>
                      <td className="px-md py-md whitespace-nowrap">
                        <span
                          className={`px-sm py-0.5 rounded-full font-label text-label-sm ${
                            reg.status === 'confirmed' || reg.status === 'checked_in'
                              ? 'bg-success-container text-on-success-container'
                              : reg.status === 'pending' || reg.status === 'payment_pending'
                              ? 'bg-warning-container text-on-warning-container'
                              : 'bg-light-error-container text-light-on-error-container'
                          }`}
                        >
                          {reg.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-md py-md font-label text-label-sm text-light-on-surface-variant whitespace-nowrap">
                        {reg.check_in_status === 'checked_in'
                          ? `Verified (${reg.checked_in_time || 'QR'})`
                          : 'Awaiting QR Gate Scan'}
                      </td>
                      <td className="px-md py-md text-right whitespace-nowrap">
                        {reg.status === 'pending' ? (
                          <div className="inline-flex gap-xs">
                            <button
                              type="button"
                              onClick={() => handleApprove(reg.id)}
                              className="px-sm py-xs rounded bg-light-primary text-light-on-primary font-label text-label-sm border-0 cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeclineTarget(reg)}
                              className="px-sm py-xs rounded bg-light-error-container text-light-on-error-container font-label text-label-sm border-0 cursor-pointer"
                            >
                              Decline
                            </button>
                          </div>
                        ) : (
                          <span className="font-label text-label-sm text-light-on-surface-variant">
                            {reg.status === 'confirmed' ? 'QR Ready' : '—'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {declineTarget && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-md">
            <form
              onSubmit={handleDeclineConfirm}
              className="bg-light-surface-container-lowest rounded-lg max-w-md w-full p-lg border border-light-outline-variant shadow-xl flex flex-col gap-md"
            >
              <h2 className="font-headline text-headline-sm text-light-error font-semibold m-0">
                Decline Registration · {declineTarget.reg_code}
              </h2>
              <label className="flex flex-col gap-xs">
                <span className="font-label text-label-md font-semibold">Reason shown to student</span>
                <textarea
                  rows={3}
                  required
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="e.g., Prerequisites or faculty eligibility requirement not satisfied."
                  className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest resize-none"
                />
              </label>
              <div className="flex justify-end gap-sm">
                <button
                  type="button"
                  onClick={() => setDeclineTarget(null)}
                  className="px-md py-xs rounded border border-light-outline-variant bg-transparent cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-md py-xs rounded bg-light-error text-white font-semibold border-0 cursor-pointer"
                >
                  Confirm Decline
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </OrganizerLayout>
  );
};

export default EventRegistrations;
