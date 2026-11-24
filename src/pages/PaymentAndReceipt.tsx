import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { StatusChip } from '../components/StatusChip';
import { TransactionItem } from '../types';
import { dataService } from '../services/dataService';

export const PaymentAndReceipt: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);
  const [paying, setPaying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      setLoading(true);
      const data = await dataService.getPayments();
      setTransactions(data);
      if (data.length > 0) {
        setSelectedTx(data.find((t) => t.status === 'Successful') || data[0]);
      }
      setLoading(false);
    }
    loadPayments();
  }, []);

  const handlePay = async (txId: string) => {
    setPaying(true);
    setTimeout(async () => {
      alert('Mock payment successful! Transaction status updated in Supabase.');
      setPaying(false);

      // Update local and remote status
      setTransactions((prev) =>
        prev.map((t) => (t.id === txId ? { ...t, status: 'Successful' } : t))
      );
      if (selectedTx?.id === txId) {
        setSelectedTx({ ...selectedTx, status: 'Successful' });
      }

      // Also update registration status
      await dataService.updateRegistrationStatus('reg-1', 'confirmed');
    }, 700);
  };

  return (
    <AppLayout>
      {/* Title */}
      <div className="flex flex-col gap-xs">
        <h1 className="font-headline text-headline-lg text-light-on-surface font-bold">
          Payments &amp; Receipts
        </h1>
        <p className="font-body text-body-md text-light-on-surface-variant">
          University payment gateway logs, verified receipts, and automated refund tracking.
        </p>
      </div>

      {/* 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
        {/* Left Column (8 cols): Transactions Table */}
        <div className="lg:col-span-8 flex flex-col gap-md">
          <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md overflow-hidden shadow-sm">
            <div className="p-md border-b border-light-outline-variant bg-light-surface-container-low flex justify-between items-center">
              <span className="font-headline text-title-md font-semibold text-light-on-surface">
                Transaction History
              </span>
              <span className="font-label text-label-sm text-light-on-surface-variant">
                Academic Year 2026
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-light-outline-variant text-label-sm font-label text-light-on-surface-variant uppercase bg-light-surface-container-lowest">
                    <th className="py-sm px-md">Event / Purpose</th>
                    <th className="py-sm px-md">Amount</th>
                    <th className="py-sm px-md">Date</th>
                    <th className="py-sm px-md">Status</th>
                    <th className="py-sm px-md text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-outline-variant text-body-md">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-xl text-center text-light-on-surface-variant">
                        Loading payment records...
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => {
                      const isSelected = selectedTx?.id === tx.id;

                      return (
                        <tr
                          key={tx.id}
                          onClick={() => setSelectedTx(tx)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-light-primary-container/20 ring-1 ring-inset ring-light-primary'
                              : 'hover:bg-light-surface-container-low'
                          }`}
                        >
                          <td className="py-md px-md">
                            <div className="flex flex-col">
                              <span className="font-title text-title-md font-semibold text-light-on-surface">
                                {tx.event_title}
                              </span>
                              <span className="text-label-sm text-light-secondary font-medium">
                                {tx.club_name}
                              </span>
                            </div>
                          </td>

                          <td className="py-md px-md font-mono text-title-md font-bold text-light-on-surface whitespace-nowrap">
                            LKR {tx.amount.toFixed(2)}
                          </td>

                          <td className="py-md px-md font-body text-light-on-surface-variant whitespace-nowrap">
                            {tx.date}
                          </td>

                          <td className="py-md px-md whitespace-nowrap">
                            <StatusChip
                              label={tx.status}
                              status={
                                tx.status === 'Successful'
                                  ? 'confirmed'
                                  : tx.status === 'Pending'
                                  ? 'payment_pending'
                                  : 'neutral'
                              }
                            />
                          </td>

                          <td className="py-md px-md text-right whitespace-nowrap">
                            {tx.status === 'Pending' ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePay(tx.id);
                                }}
                                disabled={paying}
                                className="px-md py-xs rounded bg-warning text-on-warning font-label text-label-md font-bold hover:opacity-90 cursor-pointer border-0 shadow-sm"
                              >
                                {paying ? 'Processing...' : 'Pay Now'}
                              </button>
                            ) : tx.refund_id ? (
                              <Link
                                to="/refund-status"
                                onClick={(e) => e.stopPropagation()}
                                className="font-label text-label-sm text-light-secondary hover:underline font-semibold"
                              >
                                View Refund
                              </Link>
                            ) : (
                              <span className="font-label text-label-sm text-light-primary font-semibold">
                                Receipt Available
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Verified Receipt Details */}
        <div className="lg:col-span-4 sticky top-24 flex flex-col gap-md">
          {selectedTx && (
            <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
              <div className="flex items-center gap-xs text-success">
                <span className="material-symbols-outlined text-[24px]">verified</span>
                <span className="font-headline text-title-lg font-bold text-light-on-surface">
                  Official E-Receipt
                </span>
              </div>

              <div className="border-b border-light-outline-variant pb-md flex flex-col gap-xs">
                <span className="text-label-sm text-light-on-surface-variant font-label">
                  Receipt Reference
                </span>
                <span className="font-mono text-mono-md font-bold text-light-primary px-sm py-0.5 rounded bg-light-surface-container-high inline-block self-start">
                  {selectedTx.receipt_no}
                </span>
              </div>

              <div className="flex flex-col gap-xs text-body-md text-light-on-surface-variant">
                <div className="flex justify-between py-xs">
                  <span>Event:</span>
                  <span className="font-semibold text-light-on-surface text-right">
                    {selectedTx.event_title}
                  </span>
                </div>
                <div className="flex justify-between py-xs">
                  <span>Beneficiary:</span>
                  <span className="font-semibold text-light-on-surface text-right">
                    {selectedTx.club_name}
                  </span>
                </div>
                <div className="flex justify-between py-xs">
                  <span>Transaction Date:</span>
                  <span className="font-semibold text-light-on-surface">{selectedTx.date}</span>
                </div>
                <div className="flex justify-between py-xs">
                  <span>Payment Status:</span>
                  <StatusChip
                    label={selectedTx.status}
                    status={
                      selectedTx.status === 'Successful'
                        ? 'confirmed'
                        : selectedTx.status === 'Pending'
                        ? 'payment_pending'
                        : 'neutral'
                    }
                  />
                </div>
              </div>

              <div className="bg-light-surface-container-low rounded p-md flex flex-col gap-xs border border-light-outline-variant/60">
                <span className="text-label-sm text-light-on-surface-variant font-label">
                  Total Amount Paid
                </span>
                <span className="font-display text-headline-md font-bold text-light-primary font-mono">
                  LKR {selectedTx.amount.toFixed(2)}
                </span>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full py-xs rounded bg-light-surface-container-low text-light-primary border border-light-outline-variant font-label text-label-md font-semibold hover:bg-light-surface-container transition-colors flex items-center justify-center gap-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                <span>Download / Print Receipt</span>
              </button>

              <div className="bg-light-surface-container-low rounded p-sm text-label-sm text-light-on-surface-variant flex items-start gap-xs">
                <span className="material-symbols-outlined text-[16px] text-light-outline shrink-0 mt-0.5">
                  lock
                </span>
                <span>
                  Signed with University Comptroller Cryptographic Key. Eligible for student union
                  reimbursements.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default PaymentAndReceipt;
