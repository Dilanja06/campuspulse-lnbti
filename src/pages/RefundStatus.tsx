import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { RefundRequestItem } from '../types';

export const RefundStatus: React.FC = () => {
  const { user } = useAuth();
  const [refunds, setRefunds] = useState<RefundRequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataService.getRefundRequests(user?.id).then((list) => {
      setRefunds(list);
      setLoading(false);
    });
  }, [user?.id]);

  const progressStage = (status: RefundRequestItem['status']) => {
    if (status === 'Requested') return 1;
    if (status === 'Under Review') return 2;
    if (status === 'Approved' || status === 'Processing') return 3;
    if (status === 'Completed') return 4;
    return 0;
  };

  return (
    <AppLayout>
      <main className="p-lg md:p-xl max-w-[1100px] w-full mx-auto flex flex-col gap-xl">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline text-headline-lg text-light-on-surface font-semibold m-0">
              Refund Status &amp; Claims (S12)
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant m-0">
              Real-time status tracking for cancelled ticket reimbursements and manual refund requests.
            </p>
          </div>
          <Link
            to="/payments"
            className="px-md py-sm rounded bg-light-surface-container-lowest border border-light-outline-variant text-light-on-surface font-label text-label-md font-semibold no-underline w-fit"
          >
            Back to Receipts
          </Link>
        </header>

        {loading ? (
          <div className="p-xl text-center text-light-on-surface-variant">Loading refund claims...</div>
        ) : refunds.length === 0 ? (
          <section className="p-xl bg-light-surface-container-lowest border border-light-outline-variant rounded-md text-center flex flex-col gap-sm">
            <span className="material-symbols-outlined text-[40px] text-light-on-surface-variant">receipt_long</span>
            <h2 className="font-headline text-headline-sm m-0">No Refund Claims Found</h2>
            <p className="font-body text-body-md text-light-on-surface-variant m-0">
              Eligible claims from cancelled paid events or submitted requests on Receipts will appear here.
            </p>
          </section>
        ) : (
          <div className="flex flex-col gap-lg">
            {refunds.map((item) => {
              const stage = progressStage(item.status);
              return (
                <article
                  key={item.id}
                  className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm pb-sm border-b border-light-outline-variant">
                    <div>
                      <span className="font-mono text-mono-md text-light-primary font-bold">
                        {item.refund_code} · Receipt {item.receipt_no}
                      </span>
                      <h2 className="font-title text-title-lg text-light-on-surface font-semibold m-0">
                        {item.event_title}
                      </h2>
                      <span className="font-label text-label-sm text-light-on-surface-variant">
                        Requested {item.requested_at} · {item.club_name}
                      </span>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="font-mono text-headline-sm font-bold text-light-on-surface">
                        LKR {item.amount.toLocaleString()}
                      </div>
                      <span
                        className={`inline-flex px-sm py-0.5 rounded-full font-label text-label-sm ${
                          item.status === 'Completed'
                            ? 'bg-success-container text-on-success-container'
                            : item.status === 'Rejected'
                            ? 'bg-light-error-container text-light-on-error-container'
                            : 'bg-info-container text-on-info-container'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <p className="font-body text-body-md text-light-on-surface-variant m-0">
                    <strong>Reason:</strong> {item.reason}
                  </p>
                  {item.officer_note && (
                    <p className="font-body text-body-sm text-light-on-surface bg-light-surface-container-low p-sm rounded m-0">
                      <strong>Officer Note:</strong> {item.officer_note}
                    </p>
                  )}

                  {item.status !== 'Rejected' && (
                    <div className="grid grid-cols-4 gap-xs pt-xs text-center">
                      {['Requested', 'Under Review', 'Approved', 'Settled'].map((label, idx) => (
                        <div key={label} className="flex flex-col gap-1">
                          <div
                            className={`h-2 rounded-full ${
                              idx + 1 <= stage ? 'bg-light-primary' : 'bg-light-surface-container'
                            }`}
                          />
                          <span className="font-label text-label-sm text-light-on-surface-variant">{label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>
    </AppLayout>
  );
};

export default RefundStatus;
