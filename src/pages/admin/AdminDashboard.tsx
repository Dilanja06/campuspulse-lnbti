import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { dataService } from '../../services/dataService';
import { AuditLog, OfficialClubRecord, QRScannerDevice } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [officialClubs, setOfficialClubs] = useState<OfficialClubRecord[]>([]);
  const [devices, setDevices] = useState<QRScannerDevice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [logs, clubs, devs] = await Promise.all([
          dataService.getAuditLogs(),
          dataService.getOfficialClubs(),
          dataService.getQRDevices(),
        ]);
        setAuditLogs(logs);
        setOfficialClubs(clubs);
        setDevices(devs);
      } catch (err) {
        console.warn('Error loading admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  return (
    <AdminLayout>
      <main className="flex-1 p-xl max-w-[1280px] w-full mx-auto flex flex-col gap-xl">
        <div className="flex flex-wrap items-end justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline text-headline-lg text-light-on-surface">
              System Control Center
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant">
              Manage official university club records, role permissions, payment merchants, QR scanner devices, and audit logs.
            </p>
          </div>
          <Link
            to="/admin/audits"
            className="inline-flex items-center justify-center gap-xs px-md py-sm rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container transition-colors duration-state-change font-label text-label-lg whitespace-nowrap no-underline"
          >
            View Audit Trail
          </Link>
        </div>

        {/* System Health Metrics */}
        <section aria-label="System metrics" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg items-stretch">
          <div className="h-full bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col justify-between gap-sm shadow-sm">
            <span className="font-label text-label-md text-light-on-surface-variant">
              Official Clubs
            </span>
            <div className="flex items-baseline justify-between gap-sm">
              <span className="font-headline text-headline-md text-light-on-surface tabular-nums">
                18
              </span>
              <span className="font-label text-label-sm text-on-success-container bg-success-container px-sm py-xs rounded-full whitespace-nowrap">
                17 Active
              </span>
            </div>
          </div>

          <div className="h-full bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col justify-between gap-sm shadow-sm">
            <span className="font-label text-label-md text-light-on-surface-variant">
              Verified Users
            </span>
            <div className="flex items-baseline justify-between gap-sm">
              <span className="font-headline text-headline-md text-light-on-surface tabular-nums">
                4,820
              </span>
              <span className="font-label text-label-sm text-light-on-surface-variant whitespace-nowrap">
                Students &amp; Staff
              </span>
            </div>
          </div>

          <div className="h-full bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col justify-between gap-sm shadow-sm">
            <span className="font-label text-label-md text-light-on-surface-variant">
              Payment Gateways
            </span>
            <div className="flex items-baseline justify-between gap-sm">
              <span className="font-headline text-headline-md text-light-on-surface tabular-nums">
                2
              </span>
              <span className="font-label text-label-sm text-on-success-container bg-success-container px-sm py-xs rounded-full whitespace-nowrap">
                Online
              </span>
            </div>
          </div>

          <div className="h-full bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col justify-between gap-sm shadow-sm">
            <span className="font-label text-label-md text-light-on-surface-variant">
              QR Scanner Devices
            </span>
            <div className="flex items-baseline justify-between gap-sm">
              <span className="font-headline text-headline-md text-light-on-surface tabular-nums">
                14
              </span>
              <span className="font-label text-label-sm text-on-info-container bg-info-container px-sm py-xs rounded-full whitespace-nowrap">
                Authorized
              </span>
            </div>
          </div>
        </section>

        {/* Two-Column Admin Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
          {/* Recent Audit Events (7 cols) */}
          <section aria-label="Recent audit events" className="lg:col-span-7 flex flex-col gap-md">
            <div className="flex items-center justify-between gap-md">
              <h2 className="font-headline text-headline-sm text-light-on-surface">
                Recent Audit Events
              </h2>
              <Link
                to="/admin/audits"
                className="font-label text-label-md text-light-primary hover:underline whitespace-nowrap no-underline"
              >
                All Logs
              </Link>
            </div>

            <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md divide-y divide-light-outline-variant shadow-sm">
              {auditLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="p-lg flex items-center justify-between gap-md hover:bg-light-surface-container-low/40 transition-colors">
                  <div className="flex flex-col gap-xs">
                    <span className="font-title text-title-md text-light-on-surface font-semibold">
                      {log.action}
                    </span>
                    <span className="font-body text-body-md text-light-on-surface-variant tabular-nums">
                      {log.target} · {log.timestamp}
                    </span>
                  </div>
                  <span className="font-mono text-mono-md text-light-on-surface-variant tabular-nums whitespace-nowrap font-medium">
                    {log.id}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Administrative Controls (5 cols) */}
          <section aria-label="Quick administrative controls" className="lg:col-span-5 flex flex-col gap-md">
            <h2 className="font-headline text-headline-sm text-light-on-surface">
              Governance Shortcuts
            </h2>

            <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
              <Link
                to="/admin/records"
                className="p-md rounded bg-light-surface-container-low hover:bg-light-surface-container flex items-center justify-between gap-md transition-colors duration-state-change no-underline"
              >
                <div className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-[22px] text-light-primary" aria-hidden="true">
                    account_balance
                  </span>
                  <div className="flex flex-col">
                    <span className="font-title text-title-md text-light-on-surface font-semibold">
                      Official Club Registry
                    </span>
                    <span className="font-body text-body-md text-light-on-surface-variant">
                      1 charter renewal pending
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[20px] text-light-on-surface-variant" aria-hidden="true">
                  chevron_right
                </span>
              </Link>

              <Link
                to="/admin/roles"
                className="p-md rounded bg-light-surface-container-low hover:bg-light-surface-container flex items-center justify-between gap-md transition-colors duration-state-change no-underline"
              >
                <div className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-[22px] text-light-primary" aria-hidden="true">
                    admin_panel_settings
                  </span>
                  <div className="flex flex-col">
                    <span className="font-title text-title-md text-light-on-surface font-semibold">
                      Authority &amp; Staff Roles
                    </span>
                    <span className="font-body text-body-md text-light-on-surface-variant">
                      28 staff permissions active
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[20px] text-light-on-surface-variant" aria-hidden="true">
                  chevron_right
                </span>
              </Link>

              <Link
                to="/admin/merchants"
                className="p-md rounded bg-light-surface-container-low hover:bg-light-surface-container flex items-center justify-between gap-md transition-colors duration-state-change no-underline"
              >
                <div className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-[22px] text-light-primary" aria-hidden="true">
                    point_of_sale
                  </span>
                  <div className="flex flex-col">
                    <span className="font-title text-title-md text-light-on-surface font-semibold">
                      Merchants &amp; QR Scanners
                    </span>
                    <span className="font-body text-body-md text-light-on-surface-variant">
                      2 gateways · 14 devices
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[20px] text-light-on-surface-variant" aria-hidden="true">
                  chevron_right
                </span>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </AdminLayout>
  );
};

export default AdminDashboard;
