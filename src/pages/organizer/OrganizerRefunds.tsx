import React, { useEffect, useState } from 'react';
import { OrganizerLayout } from '../../components/OrganizerLayout';
import { RefundRequestItem } from '../../types';
import { dataService } from '../../services/dataService';

export const OrganizerRefunds: React.FC = () => {
  const [refunds, setRefunds] = useState<RefundRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRefund, setSelectedRefund] = useState<RefundRequestItem | null>(null);
  const [officerNote, setOfficerNote] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadRefunds = async () => {
    setLoading(true);
    try {
      const data = await dataService.getRefundRequests();
      setRefunds(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRefunds();
  }, []);

  const filtered = refunds.filter((r) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return r.status === 'Requested' || r.status === 'Under Review';
    return r.status === filterStatus;
  });

  const handleDecision = async (status: 'Approved' | 'Completed' | 'Rejected') => {
    if (!selectedRefund) return;
    setProcessing(true);
    try {
      await dataService.processRefundDecision(
        selectedRefund.id,
        status,
        officerNote.trim() || `Processed as ${status} by club finance officer.`
      );
      setSelectedRefund(null);
      setOfficerNote('');
      await loadRefunds();
    } finally {
      setProcessing(false);
    }
  };

  return (
    <OrganizerLayout>
      <main className="p-lg md:p-xl max-w-[1400px] w-full mx-auto flex flex-col gap-xl">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline text-headline-lg text-light-on-surface font-semibold">
              Refund Claims &amp; Financial Settlement
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant">
              Review student refund requests, approve eligible cancellation claims, and record settlement completions.
            </p>
          </div>
          <div className="flex items-center gap-xs flex-wrap">
            {['all', 'pending', 'Approved', 'Completed', 'Rejected'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterStatus(tab)}
                className={`px-md py-xs rounded-full font-label text-label-md border transition-colors cursor-pointer ${
                  filterStatus === tab
                    ? 'bg-light-primary text-light-on-primary border-light-primary'
                    : 'bg-light-surface-container-lowest text-light-on-surface-variant border-light-outline-variant hover:bg-light-surface-container-low'
                }`}
              >
                {tab === 'all' ? 'All Claims' : tab === 'pending' ? 'Pending Action' : tab}
              </button>
            ))}
          </div>
        </header>

        <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-light-outline-variant bg-light-surface-container-low/50 text-light-on-surface-variant font-label text-label-sm">
                  <th className="px-md py-md">Refund Code</th>
                  <th className="px-md py-md">Participant</th>
                  <th className="px-md py-md">Event &amp; Reason</th>
                  <th className="px-md py-md">Amount</th>
                  <th className="px-md py-md">Status</th>
                  <th className="px-md py-md text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-outline-variant">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-xl text-center text-light-on-surface-variant">
                      Loading refund queue...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-xl text-center text-light-on-surface-variant">
                      No refund requests matching filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-light-surface-container-low/30">
                      <td className="px-md py-md font-mono text-mono-md text-light-primary whitespace-nowrap">
                        {item.refund_code}
                        <div className="font-label text-label-sm text-light-on-surface-variant">
                          {item.receipt_no}
                        </div>
                      </td>
                      <td className="px-md py-md">
                        <div className="font-title text-title-md text-light-on-surface font-medium">
                          {item.student_name}
                        </div>
                        <div className="font-mono text-mono-sm text-light-on-surface-variant">
                          {item.student_id}
                        </div>
                      </td>
                      <td className="px-md py-md">
                        <div className="font-body text-body-md text-light-on-surface font-medium">
                          {item.event_title}
                        </div>
                        <div className="font-label text-label-sm text-light-on-surface-variant">
                          {item.reason}
                        </div>
                      </td>
                      <td className="px-md py-md font-mono font-bold text-light-on-surface tabular-nums whitespace-nowrap">
                        LKR {item.amount.toLocaleString()}
                      </td>
                      <td className="px-md py-md whitespace-nowrap">
                        <span
                          className={`inline-flex px-sm py-0.5 rounded-full font-label text-label-sm ${
                            item.status === 'Completed'
                              ? 'bg-success-container text-on-success-container'
                              : item.status === 'Rejected'
                              ? 'bg-light-error-container text-light-on-error-container'
                              : 'bg-warning-container text-on-warning-container'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-md py-md text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRefund(item);
                            setOfficerNote(item.officer_note || '');
                          }}
                          className="px-md py-xs rounded bg-light-primary text-light-on-primary font-label text-label-md font-medium border-0 cursor-pointer hover:bg-light-primary-container"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {selectedRefund && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-md">
            <div className="bg-light-surface-container-lowest rounded-lg max-w-lg w-full p-lg border border-light-outline-variant shadow-xl flex flex-col gap-md">
              <div className="flex items-center justify-between">
                <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold">
                  Process Refund · {selectedRefund.refund_code}
                </h2>
                <button
                  type="button"
                  onClick={() => setSelectedRefund(null)}
                  className="p-xs rounded-full hover:bg-light-surface-container-low bg-transparent border-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="text-body-md text-light-on-surface-variant flex flex-col gap-xs bg-light-surface-container-low/50 p-md rounded">
                <div><strong>Student:</strong> {selectedRefund.student_name} ({selectedRefund.student_id})</div>
                <div><strong>Event:</strong> {selectedRefund.event_title}</div>
                <div><strong>Refund Amount:</strong> LKR {selectedRefund.amount.toLocaleString()}</div>
                <div><strong>Reason:</strong> {selectedRefund.reason}</div>
              </div>

              <label className="flex flex-col gap-xs">
                <span className="font-label text-label-md text-light-on-surface font-semibold">
                  Treasurer / Organizer Remarks
                </span>
                <textarea
                  rows={3}
                  value={officerNote}
                  onChange={(e) => setOfficerNote(e.target.value)}
                  placeholder="Enter bank transfer reference, policy note, or rejection reason..."
                  className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest text-light-on-surface font-body text-body-md resize-none"
                />
              </label>

              <div className="flex flex-wrap justify-end gap-sm pt-sm border-t border-light-outline-variant">
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleDecision('Rejected')}
                  className="px-md py-sm rounded bg-light-error-container text-light-on-error-container font-label text-label-md font-semibold border-0 cursor-pointer"
                >
                  Reject Claim
                </button>
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleDecision('Approved')}
                  className="px-md py-sm rounded bg-info-container text-on-info-container font-label text-label-md font-semibold border-0 cursor-pointer"
                >
                  Approve Claim
                </button>
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleDecision('Completed')}
                  className="px-md py-sm rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold border-0 cursor-pointer"
                >
                  Mark Settlement Completed
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </OrganizerLayout>
  );
};

export default OrganizerRefunds;
