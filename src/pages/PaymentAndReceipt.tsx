import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { TransactionItem, RegistrationItem } from '../types';

export const PaymentAndReceipt: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const regCodeParam = searchParams.get('reg') || '';
  const eventParam = searchParams.get('event') || '';
  const amountParam = Number(searchParams.get('amount') || '0');

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [pendingRegs, setPendingRegs] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Request Refund Modal
  const [refundTargetTx, setRefundTargetTx] = useState<TransactionItem | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [submittingRefund, setSubmittingRefund] = useState(false);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const [txList, regs] = await Promise.all([
        dataService.getPayments(user?.id),
        dataService.getRegistrations({ userId: user?.id, userEmail: user?.email }),
      ]);
      setTransactions(txList);
      setPendingRegs(regs.filter((r) => r.status === 'payment_pending'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [user?.id, user?.email]);

  const handlePayNow = async (opts: { transactionId?: string; registrationId?: string; eventTitle?: string; amount?: number }) => {
    setProcessingId(opts.transactionId || opts.registrationId || 'checkout');
    setStatusBanner(null);
    try {
      const res = await dataService.confirmPayment({
        ...opts,
        userId: user?.id,
      });
      if (!res.success) {
        setStatusBanner({
          type: 'error',
          text: res.error || 'Payment verification failed.',
        });
      } else {
        setStatusBanner({
          type: 'success',
          text: `Payment settled (${res.transaction?.receipt_no}). Registration confirmed and QR ticket issued!`,
        });
      }
      await loadPayments();
    } finally {
      setProcessingId(null);
    }
  };

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundTargetTx || !user || !refundReason.trim()) return;
    setSubmittingRefund(true);
    try {
      const req = await dataService.requestRefund({
        tx: refundTargetTx,
        reason: refundReason.trim(),
        studentName: user.name,
        studentId: user.student_id || 'UG/2024/0000',
        userId: user.id,
      });
      setStatusBanner({
        type: 'success',
        text: `Refund request ${req.refund_code} submitted for ${refundTargetTx.event_title}. Track status under Refunds.`,
      });
      setRefundTargetTx(null);
      setRefundReason('');
      await loadPayments();
    } finally {
      setSubmittingRefund(false);
    }
  };

  return (
    <AppLayout>
      <main className="p-lg md:p-xl max-w-[1300px] w-full mx-auto flex flex-col gap-xl">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline text-headline-lg text-light-on-surface font-semibold m-0">
              Payments &amp; Official Receipts (S09 · S10)
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant m-0">
              Settle held registration fees via PayHere University Gateway or download receipts and file refunds.
            </p>
          </div>
          <Link
            to="/refunds"
            className="px-md py-sm rounded bg-light-surface-container-lowest border border-light-outline-variant text-light-on-surface font-label text-label-md font-semibold no-underline w-fit"
          >
            Track Refund Status →
          </Link>
        </header>

        {statusBanner && (
          <div
            className={`p-md rounded border flex items-center gap-sm text-body-md ${
              statusBanner.type === 'success'
                ? 'bg-success-container/30 border-success text-on-success-container'
                : 'bg-light-error-container border-light-error text-light-on-error-container'
            }`}
          >
            <span className="material-symbols-outlined">
              {statusBanner.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{statusBanner.text}</span>
          </div>
        )}

        {/* Active Payment Checkout Hold Box */}
        {(pendingRegs.length > 0 || (regCodeParam && amountParam > 0)) && (
          <section className="bg-light-surface-container-lowest border-2 border-light-primary rounded-lg p-lg shadow-sm flex flex-col gap-md">
            <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold m-0">
              Active Registration Holds Awaiting Settlement
            </h2>

            <div className="flex flex-col gap-sm">
              {pendingRegs.map((reg) => (
                <div
                  key={reg.id}
                  className="p-md rounded bg-warning-container/25 border border-warning flex flex-col sm:flex-row sm:items-center justify-between gap-md"
                >
                  <div>
                    <span className="font-mono text-mono-sm text-light-primary font-bold">{reg.reg_code}</span>
                    <h3 className="font-title text-title-md font-semibold m-0">{reg.event_title}</h3>
                    <span className="font-label text-label-sm text-light-on-surface-variant">
                      {reg.club_name} · Fee: <strong>LKR {reg.fee.toLocaleString()}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={processingId !== null}
                    onClick={() =>
                      handlePayNow({
                        registrationId: reg.id,
                        eventTitle: reg.event_title,
                        amount: reg.fee,
                      })
                    }
                    className="px-lg py-sm rounded bg-light-primary text-light-on-primary font-label text-label-md font-bold border-0 cursor-pointer hover:bg-light-primary-container shrink-0"
                  >
                    {processingId ? 'Verifying PayHere Hold...' : `Confirm & Pay LKR ${reg.fee}`}
                  </button>
                </div>
              ))}

              {pendingRegs.length === 0 && regCodeParam && amountParam > 0 && (
                <div className="p-md rounded bg-warning-container/25 border border-warning flex flex-col sm:flex-row sm:items-center justify-between gap-md">
                  <div>
                    <span className="font-mono text-mono-sm text-light-primary font-bold">{regCodeParam}</span>
                    <h3 className="font-title text-title-md font-semibold m-0">{eventParam || 'Event Ticket'}</h3>
                    <span className="font-label text-label-sm text-light-on-surface-variant">
                      Amount due: <strong>LKR {amountParam.toLocaleString()}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={processingId !== null}
                    onClick={() =>
                      handlePayNow({
                        registrationId: regCodeParam,
                        eventTitle: eventParam,
                        amount: amountParam,
                      })
                    }
                    className="px-lg py-sm rounded bg-light-primary text-light-on-primary font-label text-label-md font-bold border-0 cursor-pointer"
                  >
                    {processingId ? 'Processing...' : `Pay LKR ${amountParam}`}
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Transactions Table */}
        <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md shadow-sm overflow-hidden">
          <div className="px-lg py-md border-b border-light-outline-variant bg-light-surface-container-low/50">
            <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold m-0">
              Payment Receipts &amp; Ledger ({transactions.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-light-outline-variant bg-light-surface-container-low/30 text-light-on-surface-variant font-label text-label-sm">
                  <th className="px-md py-md">Receipt No</th>
                  <th className="px-md py-md">Event &amp; Club</th>
                  <th className="px-md py-md">Date</th>
                  <th className="px-md py-md">Amount</th>
                  <th className="px-md py-md">Status</th>
                  <th className="px-md py-md text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-outline-variant">
                {loading ? (
                  <tr><td colSpan={6} className="p-xl text-center">Loading transactions...</td></tr>
                ) : transactions.length === 0 ? (
                  <tr><td colSpan={6} className="p-xl text-center">No payment transactions recorded.</td></tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-light-surface-container-low/30">
                      <td className="px-md py-md font-mono text-mono-md text-light-primary whitespace-nowrap">
                        {tx.receipt_no}
                      </td>
                      <td className="px-md py-md">
                        <div className="font-title text-title-md text-light-on-surface font-medium">{tx.event_title}</div>
                        <div className="font-label text-label-sm text-light-on-surface-variant">{tx.club_name}</div>
                      </td>
                      <td className="px-md py-md font-body text-body-md text-light-on-surface-variant whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="px-md py-md font-mono font-bold text-light-on-surface tabular-nums whitespace-nowrap">
                        LKR {tx.amount.toLocaleString()}
                      </td>
                      <td className="px-md py-md whitespace-nowrap">
                        <span
                          className={`px-sm py-0.5 rounded-full font-label text-label-sm ${
                            tx.status === 'Successful'
                              ? 'bg-success-container text-on-success-container'
                              : tx.status === 'Pending'
                              ? 'bg-warning-container text-on-warning-container'
                              : tx.status === 'Refund Completed'
                              ? 'bg-info-container text-on-info-container'
                              : 'bg-light-error-container text-light-on-error-container'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-md py-md text-right whitespace-nowrap">
                        {tx.status === 'Pending' ? (
                          <button
                            type="button"
                            onClick={() => handlePayNow({ transactionId: tx.id, eventTitle: tx.event_title, amount: tx.amount })}
                            className="px-sm py-xs rounded bg-light-primary text-light-on-primary font-label text-label-sm font-semibold border-0 cursor-pointer"
                          >
                            Pay Now
                          </button>
                        ) : tx.status === 'Successful' && !tx.refund_id ? (
                          <button
                            type="button"
                            onClick={() => setRefundTargetTx(tx)}
                            className="px-sm py-xs rounded border border-light-outline-variant bg-transparent text-light-on-surface font-label text-label-sm font-medium cursor-pointer hover:bg-light-surface-container-low"
                          >
                            Request Refund
                          </button>
                        ) : tx.refund_id ? (
                          <Link to="/refunds" className="font-label text-label-sm text-light-primary no-underline hover:underline">
                            Refund {tx.refund_id}
                          </Link>
                        ) : (
                          <span className="text-label-sm text-light-on-surface-variant">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {refundTargetTx && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-md">
            <form
              onSubmit={handleRefundSubmit}
              className="bg-light-surface-container-lowest rounded-lg max-w-md w-full p-lg border border-light-outline-variant shadow-xl flex flex-col gap-md"
            >
              <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold m-0">
                Request Refund · {refundTargetTx.receipt_no}
              </h2>
              <p className="font-body text-body-sm text-light-on-surface-variant m-0">
                Claiming LKR {refundTargetTx.amount.toLocaleString()} for <strong>{refundTargetTx.event_title}</strong>.
              </p>
              <label className="flex flex-col gap-xs">
                <span className="font-label text-label-md font-semibold">Reason for Refund</span>
                <textarea
                  rows={3}
                  required
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g., Schedule clash with lab examination"
                  className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest resize-none"
                />
              </label>
              <div className="flex justify-end gap-sm">
                <button
                  type="button"
                  onClick={() => setRefundTargetTx(null)}
                  className="px-md py-xs rounded border border-light-outline-variant bg-transparent cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRefund}
                  className="px-md py-xs rounded bg-light-primary text-light-on-primary font-semibold border-0 cursor-pointer"
                >
                  {submittingRefund ? 'Submitting...' : 'Submit Refund Request'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </AppLayout>
  );
};

export default PaymentAndReceipt;
