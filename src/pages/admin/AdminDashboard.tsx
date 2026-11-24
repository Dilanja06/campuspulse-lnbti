import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import {
  OfficialClubRecord,
  QRScannerDevice,
  PaymentMerchant,
  StudentRosterEntry,
  SupportRequestItem,
  AuditLog,
} from '../../types';
import { dataService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<OfficialClubRecord[]>([]);
  const [devices, setDevices] = useState<QRScannerDevice[]>([]);
  const [merchants, setMerchants] = useState<PaymentMerchant[]>([]);
  const [roster, setRoster] = useState<StudentRosterEntry[]>([]);
  const [tickets, setTickets] = useState<SupportRequestItem[]>([]);
  const [audits, setAudits] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const [c, d, m, r, t, a] = await Promise.all([
          dataService.getOfficialClubs(),
          dataService.getQRDevices(),
          dataService.getPaymentMerchants(),
          dataService.getStudentRoster(),
          dataService.getSupportRequests(),
          dataService.getAuditLogs(),
        ]);
        setClubs(c);
        setDevices(d);
        setMerchants(m);
        setRoster(r);
        setTickets(t);
        setAudits(a);
      } finally {
        setLoading(false);
      }
    };
    loadMetrics();
  }, []);

  const authorizedDevices = devices.filter((d) => d.status === 'Authorized').length;
  const openTickets = tickets.filter((t) => t.status === 'Open').length;

  return (
    <AdminLayout>
      <main className="p-lg md:p-xl max-w-[1400px] w-full mx-auto flex flex-col gap-xl">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline text-headline-lg text-light-on-surface font-semibold m-0">
              Central System Administration (A01)
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant m-0">
              Signed in as {user?.name || 'Amila Dissanayake'} ({user?.staff_id || 'STAFF/ADM/0003'}) · Strict infrastructure, roster, and RBAC separation-of-powers governance.
            </p>
          </div>
          <Link
            to="/admin/governance"
            className="inline-flex items-center gap-xs px-md py-sm rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold no-underline hover:bg-light-primary-container"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span>Roster, Moderation &amp; System Config</span>
          </Link>
        </header>

        {/* Live Telemetry Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
          <Link
            to="/admin/records"
            className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-xs shadow-sm no-underline hover:border-light-primary"
          >
            <span className="font-label text-label-md text-light-on-surface-variant">Chartered Official Clubs</span>
            <span className="font-headline text-display-sm text-light-primary font-bold tabular-nums">
              {clubs.length}
            </span>
            <span className="font-label text-label-sm text-light-on-surface-variant">
              {clubs.filter((c) => c.status === 'Active').length} Active charters
            </span>
          </Link>

          <Link
            to="/admin/merchants"
            className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-xs shadow-sm no-underline hover:border-light-primary"
          >
            <span className="font-label text-label-md text-light-on-surface-variant">Authorized QR Gate Scanners</span>
            <span className="font-headline text-display-sm text-success font-bold tabular-nums">
              {authorizedDevices} / {devices.length}
            </span>
            <span className="font-label text-label-sm text-light-on-surface-variant">
              {merchants.length} Payment gateways provisioned
            </span>
          </Link>

          <Link
            to="/admin/governance"
            className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-xs shadow-sm no-underline hover:border-light-primary"
          >
            <span className="font-label text-label-md text-light-on-surface-variant">Verified Student Roster</span>
            <span className="font-headline text-display-sm text-info-primary font-bold tabular-nums">
              {roster.length}
            </span>
            <span className="font-label text-label-sm text-light-on-surface-variant">
              {openTickets} open privacy/device tickets
            </span>
          </Link>

          <Link
            to="/admin/audits"
            className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-xs shadow-sm no-underline hover:border-light-primary"
          >
            <span className="font-label text-label-md text-light-on-surface-variant">System Audit Trail Events</span>
            <span className="font-headline text-display-sm text-light-on-surface font-bold tabular-nums">
              {audits.length}
            </span>
            <span className="font-label text-label-sm text-light-on-surface-variant">
              Immutable ledger records
            </span>
          </Link>
        </section>

        {/* Recent Audits */}
        <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md shadow-sm overflow-hidden">
          <div className="px-lg py-md border-b border-light-outline-variant flex items-center justify-between bg-light-surface-container-low/50">
            <h2 className="font-headline text-headline-sm font-semibold m-0">
              Latest Governance &amp; Security Audit Entries
            </h2>
            <Link to="/admin/audits" className="font-label text-label-md text-light-primary no-underline hover:underline">
              Full Audit Log →
            </Link>
          </div>

          <div className="divide-y divide-light-outline-variant">
            {loading ? (
              <div className="p-lg text-center text-light-on-surface-variant">Loading audit stream...</div>
            ) : (
              audits.slice(0, 6).map((log) => (
                <div key={log.id} className="p-md flex flex-col sm:flex-row sm:items-center justify-between gap-xs">
                  <div>
                    <span className="font-title text-title-sm text-light-on-surface font-semibold">{log.action}</span>
                    <span className="block font-label text-label-sm text-light-on-surface-variant">
                      Actor: {log.actor} · Target: <code>{log.target}</code>
                    </span>
                  </div>
                  <span className="font-mono text-mono-sm text-light-on-surface-variant whitespace-nowrap">
                    {log.timestamp}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </AdminLayout>
  );
};

export default AdminDashboard;
