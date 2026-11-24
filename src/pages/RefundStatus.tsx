import React from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { StatusChip } from '../components/StatusChip';

export const RefundStatus: React.FC = () => {
  const steps = [
    {
      title: 'Refund Requested',
      date: 'Nov 15, 2026 · 10:14 AM',
      description: 'Cancellation confirmed within the allowable 48-hour pre-event window.',
      done: true,
    },
    {
      title: 'Payment Gateway Notified',
      date: 'Nov 16, 2026 · 02:30 PM',
      description: 'Batch authorization transmission approved by University Finance Office.',
      done: true,
    },
    {
      title: 'Refund Credited to Student Account',
      date: 'Nov 18, 2026 · 09:45 AM',
      description: 'LKR 500.00 returned to originating Visa debit card. Bank reference: #TX-990182.',
      done: true,
    },
  ];

  return (
    <AppLayout>
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/payment"
          className="inline-flex items-center gap-xs font-label text-label-md text-light-primary hover:underline no-underline"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to payments</span>
        </Link>
        <div className="flex items-center gap-sm">
          <span className="font-mono text-mono-md text-light-on-surface-variant px-sm py-0.5 rounded bg-light-surface-container-high">
            RFD-2026-1182
          </span>
          <StatusChip label="Completed" status="confirmed" />
        </div>
      </div>

      {/* 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
        {/* Left Column (7 cols): Timeline */}
        <div className="lg:col-span-7 flex flex-col gap-md">
          <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-lg shadow-sm">
            <h2 className="font-headline text-headline-sm font-bold text-light-on-surface m-0">
              Processing Timeline
            </h2>

            <div className="relative pl-6 flex flex-col gap-lg border-l-2 border-light-secondary ml-3 my-2">
              {steps.map((step, idx) => (
                <div key={idx} className="relative flex flex-col gap-xs">
                  {/* Pin Dot */}
                  <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-light-secondary flex items-center justify-center ring-4 ring-light-surface-container-lowest">
                    <span className="material-symbols-outlined text-[12px] text-white">check</span>
                  </span>

                  <span className="font-headline text-title-md font-bold text-light-on-surface">
                    {step.title}
                  </span>
                  <span className="font-mono text-label-sm text-light-secondary font-medium">
                    {step.date}
                  </span>
                  <p className="font-body text-body-md text-light-on-surface-variant m-0">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Summary */}
        <div className="lg:col-span-5 sticky top-24 flex flex-col gap-md">
          <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
            <span className="font-headline text-title-md font-bold text-light-on-surface">
              Refund Summary
            </span>

            <div className="h-24 bg-gradient-to-r from-slate-900 to-indigo-950 rounded p-md flex flex-col justify-end text-white">
              <span className="text-xs font-mono text-teal-300">Robotics Bootcamp Kit</span>
              <span className="font-headline text-title-md font-bold text-white">IEEE Robotics Chapter</span>
            </div>

            <div className="flex flex-col gap-xs text-body-md text-light-on-surface-variant border-b border-light-outline-variant pb-md">
              <div className="flex justify-between">
                <span>Original Invoice:</span>
                <span className="font-mono font-semibold text-light-on-surface">RCT-2026-3109</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Channel:</span>
                <span className="font-semibold text-light-on-surface">Online Visa Debit</span>
              </div>
              <div className="flex justify-between">
                <span>Resolution Time:</span>
                <span className="font-semibold text-light-on-surface">3 Business Days</span>
              </div>
            </div>

            <div className="flex flex-col gap-xs">
              <span className="text-label-sm text-light-on-surface-variant font-label">Total Amount Credited</span>
              <span className="font-display text-headline-md font-bold text-success font-mono">
                LKR 1,500.00
              </span>
            </div>

            <div className="bg-light-surface-container-low rounded p-md text-label-sm text-light-on-surface-variant flex items-start gap-xs">
              <span className="material-symbols-outlined text-[18px] text-light-outline shrink-0 mt-0.5">help</span>
              <span>
                Need assistance with your settlement? Reach out to the University Bursar Office quoting reference <strong>RFD-2026-1182</strong>.
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default RefundStatus;
