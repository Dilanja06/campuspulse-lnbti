import React, { useEffect, useState } from 'react';
import { OrganizerLayout } from '../../components/OrganizerLayout';
import { EventItem, QRScannerDevice, AttendanceScanLog, QRScanOutcome } from '../../types';
import { dataService } from '../../services/dataService';
import { isDemoModeEnabled } from '../../context/AuthContext';

export const AttendanceScanner: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [devices, setDevices] = useState<QRScannerDevice[]>([]);
  const [logs, setLogs] = useState<AttendanceScanLog[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [qrInput, setQrInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState<{ outcome: QRScanOutcome; message: string; log: AttendanceScanLog } | null>(null);

  const loadScannerState = async () => {
    const [evList, devList, logList] = await Promise.all([
      dataService.getEvents(),
      dataService.getQRDevices(),
      dataService.getAttendanceLogs(),
    ]);
    setEvents(evList);
    setDevices(devList);
    setLogs(logList);
    if (!selectedEventId && evList.length > 0) setSelectedEventId(evList[0].id);
    if (!selectedDeviceId && devList.length > 0) setSelectedDeviceId(devList[0].device_id);
  };

  useEffect(() => {
    loadScannerState();
  }, []);

  const handleVerifyScan = async (tokenOverride?: string) => {
    const token = (tokenOverride ?? qrInput).trim();
    if (!token || !selectedEventId || !selectedDeviceId) return;

    setScanning(true);
    try {
      const res = await dataService.verifyAndScanQR({
        qrToken: token,
        eventId: selectedEventId,
        deviceId: selectedDeviceId,
      });
      setLastResult(res);
      const updatedLogs = await dataService.getAttendanceLogs();
      setLogs(updatedLogs);
      if (res.outcome === 'Verified') setQrInput('');
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerifyScan();
  };

  const outcomeStyle = (outcome: QRScanOutcome) => {
    if (outcome === 'Verified') return 'bg-success-container text-on-success-container border-success';
    if (outcome === 'Already Checked In' || outcome === 'Already Used' || outcome === 'Expired') {
      return 'bg-warning-container text-on-warning-container border-warning';
    }
    return 'bg-light-error-container text-light-on-error-container border-light-error';
  };

  return (
    <OrganizerLayout>
      <main className="p-lg md:p-xl max-w-[1400px] w-full mx-auto flex flex-col gap-xl">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline text-headline-lg text-light-on-surface font-semibold">
              QR Attendance Scanner &amp; Check-In Logs (O11 · M05–M07)
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant">
              Strict cryptographic check-in gate using dynamic 30s student QR tokens and authorized scanner devices. Manual registration check-in bypass is disabled.
            </p>
          </div>
          <span className="inline-flex items-center gap-xs px-md py-xs rounded-full bg-info-container text-on-info-container font-label text-label-sm whitespace-nowrap">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span>Live Verification Policy Active</span>
          </span>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
          {/* Scanner Terminal (5 cols) */}
          <section className="lg:col-span-5 bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
            <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold">
              Gate Verification Terminal
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-md">
              <label className="flex flex-col gap-xs">
                <span className="font-label text-label-md text-light-on-surface font-semibold">Active Event Check-In Gate</span>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest text-light-on-surface font-body text-body-md"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.code} · {ev.title} ({ev.status})
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-xs">
                <span className="font-label text-label-md text-light-on-surface font-semibold">Authorized Scanner Device</span>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest text-light-on-surface font-mono text-body-md"
                >
                  {devices.map((dev) => (
                    <option key={dev.id} value={dev.device_id}>
                      {dev.device_id} · {dev.hardware_officer} [{dev.status}]
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-xs">
                <span className="font-label text-label-md text-light-on-surface font-semibold">
                  Scanned QR Payload or Registration Code
                </span>
                <input
                  type="text"
                  required
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  placeholder="CP1|REG-2026-8841|ev-hackathon|1760000000000"
                  className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest text-light-on-surface font-mono text-body-md"
                />
              </label>

              <button
                type="submit"
                disabled={scanning}
                className="w-full py-sm px-md rounded bg-light-primary text-light-on-primary font-label text-label-lg font-semibold cursor-pointer border-0 hover:bg-light-primary-container transition-colors"
              >
                {scanning ? 'Verifying Token...' : 'Verify & Check In Participant'}
              </button>
            </form>

            {lastResult && (
              <div className={`p-md rounded border flex flex-col gap-xs ${outcomeStyle(lastResult.outcome)}`}>
                <div className="flex items-center justify-between">
                  <span className="font-label text-label-md font-bold">Outcome: {lastResult.outcome}</span>
                  <span className="font-mono text-mono-sm">{lastResult.log.scanned_at}</span>
                </div>
                <p className="font-body text-body-md m-0">{lastResult.message}</p>
              </div>
            )}

            {isDemoModeEnabled && (
              <div className="pt-sm border-t border-light-outline-variant flex flex-col gap-xs">
                <span className="font-label text-label-sm text-light-on-surface-variant font-semibold uppercase tracking-wider">
                  Sandbox Scan Outcome Simulators (M06 Validation)
                </span>
                <div className="flex flex-wrap gap-xs">
                  <button
                    type="button"
                    onClick={() =>
                      handleVerifyScan(`CP1|REG-2026-8841|${selectedEventId}|${Date.now()}`)
                    }
                    className="px-sm py-xs rounded bg-success-container text-on-success-container text-label-sm font-medium border-0 cursor-pointer"
                  >
                    Fresh Live Token
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleVerifyScan(`CP1|REG-2026-8841|${selectedEventId}|${Date.now() - 120000}`)
                    }
                    className="px-sm py-xs rounded bg-warning-container text-on-warning-container text-label-sm font-medium border-0 cursor-pointer"
                  >
                    Expired (120s)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerifyScan(`CP1|REG-2026-8841|ev-wrong-999|${Date.now()}`)}
                    className="px-sm py-xs rounded bg-light-error-container text-light-on-error-container text-label-sm font-medium border-0 cursor-pointer"
                  >
                    Wrong Event
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Attendance Scan Audit Logs (7 cols) */}
          <section className="lg:col-span-7 bg-light-surface-container-lowest border border-light-outline-variant rounded-md shadow-sm overflow-hidden flex flex-col">
            <div className="px-lg py-md border-b border-light-outline-variant flex items-center justify-between bg-light-surface-container-low/50">
              <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold">
                Scan Telemetry &amp; Attendance Logs ({logs.length})
              </h2>
              <button
                type="button"
                onClick={loadScannerState}
                className="font-label text-label-md text-light-primary bg-transparent border-0 cursor-pointer hover:underline"
              >
                Refresh Logs
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-light-outline-variant bg-light-surface-container-low/40 text-light-on-surface-variant font-label text-label-sm">
                    <th className="px-md py-sm">Time</th>
                    <th className="px-md py-sm">Reg Code</th>
                    <th className="px-md py-sm">Participant</th>
                    <th className="px-md py-sm">Device</th>
                    <th className="px-md py-sm">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-outline-variant">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-light-surface-container-low/30">
                      <td className="px-md py-sm font-mono text-mono-sm text-light-on-surface-variant whitespace-nowrap">
                        {log.scanned_at}
                      </td>
                      <td className="px-md py-sm font-mono text-mono-sm text-light-primary whitespace-nowrap">
                        {log.reg_code}
                      </td>
                      <td className="px-md py-sm">
                        <div className="flex flex-col">
                          <span className="font-body text-body-md text-light-on-surface font-medium">
                            {log.student_name}
                          </span>
                          <span className="font-label text-label-sm text-light-on-surface-variant">
                            {log.message}
                          </span>
                        </div>
                      </td>
                      <td className="px-md py-sm font-mono text-mono-sm text-light-on-surface-variant whitespace-nowrap">
                        {log.device_id}
                      </td>
                      <td className="px-md py-sm whitespace-nowrap">
                        <span
                          className={`inline-flex px-sm py-0.5 rounded-full font-label text-label-sm border ${outcomeStyle(log.outcome)}`}
                        >
                          {log.outcome}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-xl text-center text-light-on-surface-variant font-body text-body-md">
                        No QR scan logs recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </OrganizerLayout>
  );
};

export default AttendanceScanner;
