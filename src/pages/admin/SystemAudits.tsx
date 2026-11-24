import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { dataService } from '../../services/dataService';
import { AuditLog } from '../../types';

export const SystemAudits: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAudits = async () => {
      try {
        const data = await dataService.getAuditLogs();
        setLogs(data);
      } catch (err) {
        console.warn('Error fetching audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAudits();
  }, []);

  const exportAuditCsv = () => {
    const rows = [
      ['Audit ID', 'Timestamp', 'Actor', 'Action', 'Target'],
      ...logs.map((log) => [
        log.id,
        `"${log.timestamp}"`,
        `"${log.actor}"`,
        `"${log.action}"`,
        `"${log.target}"`,
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CampusPulse_Audit_Log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <main className="flex-1 p-xl max-w-[1280px] w-full mx-auto flex flex-col gap-lg">
        <div className="flex flex-wrap items-end justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline text-headline-lg text-light-on-surface">
              System Audits &amp; Logs
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant">
              Immutable security, approval, payment, and device authorization records across CampusPulse.
            </p>
          </div>
          <button
            type="button"
            onClick={exportAuditCsv}
            className="inline-flex items-center gap-xs px-md py-sm rounded bg-light-surface-container-lowest text-light-primary border border-light-outline-variant hover:bg-light-surface-container-low transition-colors duration-state-change font-label text-label-lg whitespace-nowrap cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              download
            </span>
            <span>Export Audit CSV</span>
          </button>
        </div>

        <section aria-label="Audit log table" className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-light-surface-container-low border-b border-light-outline-variant">
                  <th scope="col" className="px-md py-md font-label text-label-sm text-light-on-surface-variant uppercase tracking-wider">
                    Audit ID
                  </th>
                  <th scope="col" className="px-md py-md font-label text-label-sm text-light-on-surface-variant uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th scope="col" className="px-md py-md font-label text-label-sm text-light-on-surface-variant uppercase tracking-wider">
                    Actor
                  </th>
                  <th scope="col" className="px-md py-md font-label text-label-sm text-light-on-surface-variant uppercase tracking-wider">
                    Action
                  </th>
                  <th scope="col" className="px-md py-md font-label text-label-sm text-light-on-surface-variant uppercase tracking-wider">
                    Target
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-outline-variant">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-light-surface-container-low/40 transition-colors">
                    <td className="px-md py-md font-mono text-mono-md text-light-on-surface-variant tabular-nums whitespace-nowrap">
                      {log.id}
                    </td>
                    <td className="px-md py-md font-mono text-mono-md text-light-on-surface-variant tabular-nums whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="px-md py-md font-body text-body-md text-light-on-surface font-medium whitespace-nowrap">
                      {log.actor}
                    </td>
                    <td className="px-md py-md font-body text-body-md text-light-on-surface whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="px-md py-md font-mono text-mono-md text-light-on-surface-variant whitespace-nowrap font-medium">
                      {log.target}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </AdminLayout>
  );
};

export default SystemAudits;
