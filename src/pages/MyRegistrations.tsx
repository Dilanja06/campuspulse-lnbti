import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { StatusChip } from '../components/StatusChip';
import { RegistrationItem } from '../types';
import { dataService } from '../services/dataService';

export const MyRegistrations: React.FC = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'confirmed' | 'payment_pending' | 'pending' | 'rejected' | 'cancelled'>('all');

  useEffect(() => {
    async function loadRegs() {
      setLoading(true);
      const data = await dataService.getRegistrations();
      setRegistrations(data);
      setLoading(false);
    }
    loadRegs();
  }, []);

  const filteredRegistrations = registrations.filter((reg) => {
    if (activeTab === 'all') return true;
    return reg.status === activeTab;
  });

  const counts = {
    all: registrations.length,
    confirmed: registrations.filter(r => r.status === 'confirmed').length,
    payment_pending: registrations.filter(r => r.status === 'payment_pending').length,
    pending: registrations.filter(r => r.status === 'pending').length,
    rejected: registrations.filter(r => r.status === 'rejected').length,
    cancelled: registrations.filter(r => r.status === 'cancelled').length,
  };

  const tabs: Array<{ key: typeof activeTab; label: string; count: number }> = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'confirmed', label: 'Confirmed', count: counts.confirmed },
    { key: 'payment_pending', label: 'Payment Pending', count: counts.payment_pending },
    { key: 'pending', label: 'Pending Review', count: counts.pending },
    { key: 'rejected', label: 'Rejected', count: counts.rejected },
    { key: 'cancelled', label: 'Cancelled', count: counts.cancelled },
  ];

  return (
    <AppLayout registrationCount={registrations.length}>
      {/* Header */}
      <div className="flex flex-col gap-xs">
        <h1 className="font-headline text-headline-lg text-light-on-surface font-bold">
          My Registrations
        </h1>
        <p className="font-body text-body-md text-light-on-surface-variant">
          Track entry passes, payment clearance, advisor reviews, and attendance verification.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-xs overflow-x-auto pb-xs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-xs px-md py-xs rounded-full text-label-md font-label font-medium transition-all cursor-pointer whitespace-nowrap border-0 ${
              activeTab === tab.key
                ? 'bg-light-primary text-light-on-primary shadow-sm font-semibold'
                : 'bg-light-surface-container-lowest border border-light-outline-variant text-light-on-surface-variant hover:bg-light-surface-container-low'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-xs font-mono tabular-nums ${
                activeTab === tab.key
                  ? 'bg-white/20 text-white'
                  : 'bg-light-surface-container-high text-light-on-surface-variant'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Registrations List */}
      <div className="flex flex-col gap-md">
        {loading ? (
          <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-xl text-center">
            <p className="font-body text-body-md text-light-on-surface-variant">Connecting to Supabase...</p>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-xl text-center flex flex-col items-center gap-sm">
            <span className="material-symbols-outlined text-[36px] text-light-outline">
              confirmation_number
            </span>
            <span className="font-title text-title-md text-light-on-surface font-semibold">
              No registrations found
            </span>
            <p className="font-body text-body-md text-light-on-surface-variant">
              There are no event registrations in this category.
            </p>
          </div>
        ) : (
          filteredRegistrations.map((reg) => (
            <div
              key={reg.id}
              className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col md:flex-row md:items-center justify-between gap-lg shadow-sm hover:border-light-primary transition-all"
            >
              {/* Left Details */}
              <div className="flex flex-col gap-sm flex-1">
                <div className="flex items-center gap-sm">
                  <StatusChip label={reg.status.replace('_', ' ')} status={reg.status} />
                  <span className="font-mono text-mono-md text-light-on-surface-variant">
                    {reg.reg_code}
                  </span>
                </div>

                <div className="flex flex-col">
                  <h3 className="font-headline text-title-lg text-light-on-surface font-semibold m-0">
                    <Link to={`/events/${reg.event_id}`} className="text-light-on-surface hover:text-light-primary no-underline">
                      {reg.event_title}
                    </Link>
                  </h3>
                  <span className="font-label text-label-sm text-light-secondary font-semibold mt-0.5">
                    {reg.club_name}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-lg gap-y-xs text-body-md text-light-on-surface-variant">
                  <div className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                    <span>{reg.date} · {reg.time}</span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    <span>{reg.venue}</span>
                  </div>
                </div>

                {reg.rejection_reason && (
                  <div className="bg-light-error-container text-light-on-error-container p-sm rounded text-label-sm flex items-start gap-xs mt-xs">
                    <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
                    <span>Reason: {reg.rejection_reason}</span>
                  </div>
                )}
              </div>

              {/* Right Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-sm shrink-0">
                {reg.status === 'confirmed' && (
                  <button
                    onClick={() => navigate('/my-qr')}
                    className="inline-flex items-center justify-center gap-xs px-md py-sm rounded bg-light-surface-container-lowest text-light-primary border border-light-outline-variant font-label text-label-md font-bold hover:bg-light-surface-container-low transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">qr_code</span>
                    <span>View Attendance QR</span>
                  </button>
                )}

                {reg.status === 'payment_pending' && (
                  <>
                    <button
                      onClick={() => navigate('/payment')}
                      className="inline-flex items-center justify-center gap-xs px-md py-sm rounded bg-warning text-on-warning font-label text-label-md font-bold hover:opacity-95 transition-all cursor-pointer border-0 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[20px]">payment</span>
                      <span>Complete Payment · LKR {reg.fee}</span>
                    </button>
                    <button
                      onClick={() => alert('Registration hold released.')}
                      className="px-md py-sm rounded bg-transparent text-light-on-surface-variant hover:text-light-error text-label-md font-medium border-0 cursor-pointer"
                    >
                      Cancel Hold
                    </button>
                  </>
                )}

                {reg.status === 'pending' && (
                  <span className="inline-flex items-center gap-xs text-label-md font-label text-info px-md py-sm rounded bg-info-container">
                    <span className="material-symbols-outlined text-[18px]">pending</span>
                    <span>Pending Staff Review</span>
                  </span>
                )}

                {reg.status === 'cancelled' && (
                  <Link
                    to="/refund-status"
                    className="font-label text-label-md text-light-secondary hover:underline flex items-center gap-xs no-underline font-semibold"
                  >
                    <span>Check Refund Status</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                )}

                {reg.status === 'rejected' && (
                  <Link
                    to={`/events/${reg.event_id}`}
                    className="px-md py-sm rounded bg-light-surface-container-low text-light-primary border border-light-outline-variant font-label text-label-md font-semibold hover:bg-light-surface-container no-underline"
                  >
                    View Event Info
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </AppLayout>
  );
};

export default MyRegistrations;
