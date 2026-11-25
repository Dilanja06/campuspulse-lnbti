import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { StatusChip } from '../components/StatusChip';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { RegistrationItem } from '../types';
import { getEventCoverImage } from '../utils/eventImages';

function formatHoldRemaining(expiresAt?: string): string | null {
  if (!expiresAt) return null;
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (Number.isNaN(diffMs)) return null;
  if (diffMs <= 0) return 'Expired';
  const mins = Math.floor(diffMs / 60000);
  const secs = Math.floor((diffMs % 60000) / 1000);
  return `${mins}m ${String(secs).padStart(2, '0')}s left`;
}

export const MyRegistrations: React.FC = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [, setTick] = useState(0);

  const loadRegs = async () => {
    setLoading(true);
    try {
      const data = await dataService.getRegistrations({
        userId: user?.id,
        userEmail: user?.email,
      });
      setRegistrations(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegs();
  }, [user?.id, user?.email]);

  useEffect(() => {
    const t = window.setInterval(() => setTick((c) => c + 1), 1000);
    return () => window.clearInterval(t);
  }, []);

  const handleCancel = async (reg: RegistrationItem) => {
    if (!window.confirm(`Cancel your registration ${reg.reg_code} for ${reg.event_title}?`)) return;
    await dataService.cancelRegistration(reg.id);
    await loadRegs();
  };

  const filtered = registrations.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  return (
    <AppLayout>
      <main className="p-lg md:p-xl max-w-[1400px] w-full mx-auto flex flex-col gap-xl">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline text-headline-lg text-light-on-surface font-semibold m-0">
              My Registrations &amp; Passes
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant m-0">
              Manage active seat holds, payment obligations, dynamic QR entry tickets, and cancellation refunds.
            </p>
          </div>
          <Link
            to="/events"
            className="px-md py-sm rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold no-underline hover:bg-light-primary-container w-fit"
          >
            Browse More Events
          </Link>
        </header>

        <div className="flex items-center gap-xs flex-wrap">
          {[
            { key: 'all', label: 'All Registrations' },
            { key: 'payment_pending', label: 'Payment Hold' },
            { key: 'pending', label: 'Pending Approval' },
            { key: 'confirmed', label: 'Confirmed' },
            { key: 'checked_in', label: 'Checked In' },
            { key: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-md py-xs rounded-full font-label text-label-md border cursor-pointer transition-colors ${
                statusFilter === tab.key
                  ? 'bg-light-primary text-light-on-primary border-light-primary'
                  : 'bg-light-surface-container-lowest text-light-on-surface-variant border-light-outline-variant hover:bg-light-surface-container-low'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-xl text-center text-light-on-surface-variant">Loading registrations...</div>
        ) : filtered.length === 0 ? (
          <section className="p-xl bg-light-surface-container-lowest border border-light-outline-variant rounded-md text-center text-light-on-surface-variant">
            No registrations in this category.
          </section>
        ) : (
          <div className="flex flex-col gap-md">
            {filtered.map((reg) => {
              const holdCountdown =
                reg.status === 'payment_pending' ? formatHoldRemaining(reg.hold_expires_at) : null;
              return (
                <article
                  key={reg.id}
                  className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-md md:p-lg flex flex-col md:flex-row md:items-center justify-between gap-md shadow-sm"
                >
                  <div className="flex items-start gap-md">
                    <img
                      src={getEventCoverImage({ id: reg.event_id, image_url: reg.image_url, title: reg.event_title })}
                      alt={reg.event_title}
                      className="w-20 h-20 rounded object-cover shrink-0 bg-slate-800 hidden sm:block"
                    />
                    <div className="flex flex-col gap-xs">
                      <div className="flex items-center gap-sm flex-wrap">
                        <span className="font-mono text-mono-sm text-light-primary font-semibold">
                          {reg.reg_code}
                        </span>
                        <StatusChip
                          label={reg.status === 'checked_in' ? 'Checked In' : reg.status.replace('_', ' ')}
                          status={reg.status === 'checked_in' ? 'confirmed' : reg.status}
                        />
                        {holdCountdown && (
                          <span
                            className={`px-xs py-0.5 rounded font-mono text-mono-sm font-semibold ${
                              holdCountdown === 'Expired'
                                ? 'bg-light-error-container text-light-on-error-container'
                                : 'bg-warning-container text-on-warning-container'
                            }`}
                          >
                            Hold: {holdCountdown}
                          </span>
                        )}
                      </div>

                      <h2 className="font-title text-title-lg text-light-on-surface font-semibold m-0">
                        {reg.event_title}
                      </h2>
                      <p className="font-body text-body-sm text-light-on-surface-variant m-0">
                        {reg.club_name} · {reg.date} · {reg.time} · {reg.venue}
                      </p>
                      {reg.activity && (
                        <span className="font-label text-label-sm text-light-on-surface-variant">
                          Track: {reg.activity} · Fee: {reg.fee > 0 ? `LKR ${reg.fee}` : 'Free'}
                        </span>
                      )}
                      {reg.status === 'rejected' && reg.rejection_reason && (
                        <div className="p-sm rounded bg-light-error-container/50 text-light-on-error-container text-label-sm">
                          <strong>Decline Reason:</strong> {reg.rejection_reason}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-xs shrink-0">
                    {reg.status === 'payment_pending' && (
                      <Link
                        to={`/payments?reg=${reg.reg_code}&event=${encodeURIComponent(reg.event_title)}&amount=${reg.fee}`}
                        className="px-md py-xs rounded bg-warning text-slate-950 font-label text-label-md font-bold no-underline"
                      >
                        Complete Payment
                      </Link>
                    )}

                    {(reg.status === 'confirmed' || reg.status === 'checked_in') && (
                      <Link
                        to="/my-qr"
                        className="px-md py-xs rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold no-underline"
                      >
                        Show QR Pass
                      </Link>
                    )}

                    {reg.status === 'cancelled' && reg.fee > 0 && (
                      <Link
                        to="/refunds"
                        className="px-md py-xs rounded bg-info-container text-on-info-container font-label text-label-md font-semibold no-underline"
                      >
                        View Refund Status
                      </Link>
                    )}

                    {(reg.status === 'confirmed' || reg.status === 'pending' || reg.status === 'payment_pending') && (
                      <button
                        type="button"
                        onClick={() => handleCancel(reg)}
                        className="px-md py-xs rounded border border-light-outline-variant bg-transparent text-light-error font-label text-label-md font-semibold cursor-pointer hover:bg-light-error-container/30"
                      >
                        Cancel Seat
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </AppLayout>
  );
};

export default MyRegistrations;
