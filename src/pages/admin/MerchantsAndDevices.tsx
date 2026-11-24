import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { dataService } from '../../services/dataService';
import { PaymentMerchant, QRScannerDevice } from '../../types';

export const MerchantsAndDevices: React.FC = () => {
  const [merchants, setMerchants] = useState<PaymentMerchant[]>([]);
  const [devices, setDevices] = useState<QRScannerDevice[]>([]);
  const [showPairModal, setShowPairModal] = useState(false);
  const [newDeviceId, setNewDeviceId] = useState('DEV-QR-018');
  const [newHardwareOfficer, setNewHardwareOfficer] = useState('');
  const [newEvent, setNewEvent] = useState('University Indoor Games Day');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [merchData, devData] = await Promise.all([
        dataService.getPaymentMerchants(),
        dataService.getQRDevices(),
      ]);
      setMerchants(merchData);
      setDevices([...devData]);
    } catch (err) {
      console.warn('Error fetching merchants & devices:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRevokeDevice = async (id: string, hardware: string) => {
    await dataService.revokeQRDevice(id);
    await dataService.logAuditEvent(`Revoked QR Scanner Authorization: ${hardware}`, id);
    setToastMessage(`Revoked scanning authorization for device ${id}.`);
    setTimeout(() => setToastMessage(null), 4000);
    fetchData();
  };

  const handlePairDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHardwareOfficer) return;
    await dataService.pairQRDevice({
      device_id: newDeviceId,
      hardware_officer: newHardwareOfficer,
      assigned_event: newEvent,
      status: 'Authorized',
    });
    await dataService.logAuditEvent(`Paired QR Scanner Device (${newEvent})`, newDeviceId);
    setShowPairModal(false);
    setNewHardwareOfficer('');
    setToastMessage(`Device ${newDeviceId} successfully paired and authorized.`);
    setTimeout(() => setToastMessage(null), 4000);
    fetchData();
  };

  return (
    <AdminLayout>
      <main className="flex-1 p-xl max-w-[1280px] w-full mx-auto flex flex-col gap-xl">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="bg-success-container text-on-success-container px-lg py-md rounded-md flex items-center justify-between gap-md shadow-sm transition-all">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span className="font-label text-label-md">{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-on-success-container hover:opacity-75 cursor-pointer bg-transparent border-0 p-0"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        <div className="flex flex-col gap-xs">
          <h1 className="font-headline text-headline-lg text-light-on-surface">
            Merchants &amp; QR Devices
          </h1>
          <p className="font-body text-body-md text-light-on-surface-variant">
            Configure university payment merchant accounts and authorize mobile devices for event-day QR attendance scanning.
          </p>
        </div>

        {/* Payment Merchants Section */}
        <section aria-label="Payment merchants" className="flex flex-col gap-md">
          <div className="flex items-center justify-between gap-md">
            <h2 className="font-headline text-headline-sm text-light-on-surface">
              Payment Gateways &amp; Merchants
            </h2>
            <button
              type="button"
              onClick={() => {
                setToastMessage('Payment merchant configurations are synchronized with the bursar.');
                setTimeout(() => setToastMessage(null), 3000);
              }}
              className="px-md py-xs rounded bg-light-surface-container-lowest text-light-primary border border-light-outline-variant hover:bg-light-surface-container-low transition-colors duration-state-change font-label text-label-md cursor-pointer"
            >
              Add Merchant
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg items-stretch">
            {merchants.map((merch) => (
              <article
                key={merch.id}
                className="h-full bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col justify-between gap-md shadow-sm"
              >
                <div className="flex items-start justify-between gap-md">
                  <div className="flex flex-col gap-xs">
                    <span className="font-mono text-mono-md text-light-on-surface-variant">
                      {merch.id.toUpperCase()}
                    </span>
                    <h3 className="font-title text-title-lg text-light-on-surface font-semibold">
                      {merch.name}
                    </h3>
                    <p className="font-body text-body-md text-light-on-surface-variant">
                      {merch.description}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-success-container text-on-success-container whitespace-nowrap">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    <span className="font-label text-label-sm">{merch.status}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between gap-md pt-md border-t border-light-outline-variant">
                  <span className="font-mono text-mono-md text-light-on-surface tabular-nums">
                    {merch.settlement}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setToastMessage(`Opened gateway settings for ${merch.name}.`);
                      setTimeout(() => setToastMessage(null), 3000);
                    }}
                    className="font-label text-label-md text-light-primary hover:underline whitespace-nowrap cursor-pointer bg-transparent border-0 p-0"
                  >
                    Configure
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* QR Attendance Scanners Section */}
        <section aria-label="Authorized QR scanners" className="flex flex-col gap-md">
          <div className="flex items-center justify-between gap-md">
            <h2 className="font-headline text-headline-sm text-light-on-surface">
              Authorized QR Attendance Scanners
            </h2>
            <button
              type="button"
              onClick={() => setShowPairModal(true)}
              className="px-md py-xs rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container transition-colors duration-state-change font-label text-label-md whitespace-nowrap cursor-pointer"
            >
              Pair New Device
            </button>
          </div>

          {/* Modal for Pairing Device */}
          {showPairModal && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-md">
              <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-xl max-w-md w-full flex flex-col gap-md shadow-lg">
                <h2 className="font-headline text-headline-sm text-light-on-surface">
                  Pair &amp; Authorize QR Scanner
                </h2>
                <form onSubmit={handlePairDevice} className="flex flex-col gap-md">
                  <div className="flex flex-col gap-xs">
                    <label className="font-label text-label-md text-light-on-surface">
                      Device Hardware ID
                    </label>
                    <input
                      type="text"
                      required
                      value={newDeviceId}
                      onChange={(e) => setNewDeviceId(e.target.value)}
                      className="px-md py-sm rounded bg-light-surface-container-low border border-light-outline text-light-on-surface font-body text-body-md focus:border-light-primary outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label text-label-md text-light-on-surface">
                      Hardware Model &amp; Officer Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. iPad Air · Chamod Perera"
                      value={newHardwareOfficer}
                      onChange={(e) => setNewHardwareOfficer(e.target.value)}
                      className="px-md py-sm rounded bg-light-surface-container-low border border-light-outline text-light-on-surface font-body text-body-md focus:border-light-primary outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label text-label-md text-light-on-surface">
                      Assigned Event
                    </label>
                    <input
                      type="text"
                      required
                      value={newEvent}
                      onChange={(e) => setNewEvent(e.target.value)}
                      className="px-md py-sm rounded bg-light-surface-container-low border border-light-outline text-light-on-surface font-body text-body-md focus:border-light-primary outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-sm pt-sm">
                    <button
                      type="button"
                      onClick={() => setShowPairModal(false)}
                      className="px-md py-sm rounded bg-light-surface-container-lowest text-light-on-surface border border-light-outline-variant hover:bg-light-surface-container-low font-label text-label-md cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-md py-sm rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container font-label text-label-md cursor-pointer"
                    >
                      Authorize Scanner
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-light-surface-container-low border-b border-light-outline-variant">
                    <th scope="col" className="px-md py-md font-label text-label-sm text-light-on-surface-variant uppercase tracking-wider">
                      Device ID
                    </th>
                    <th scope="col" className="px-md py-md font-label text-label-sm text-light-on-surface-variant uppercase tracking-wider">
                      Hardware / Officer
                    </th>
                    <th scope="col" className="px-md py-md font-label text-label-sm text-light-on-surface-variant uppercase tracking-wider">
                      Assigned Event
                    </th>
                    <th scope="col" className="px-md py-md font-label text-label-sm text-light-on-surface-variant uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-md py-md font-label text-label-sm text-light-on-surface-variant uppercase tracking-wider text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-outline-variant">
                  {devices.map((dev) => (
                    <tr key={dev.id} className="hover:bg-light-surface-container-low/40 transition-colors">
                      <td className="px-md py-md font-mono text-mono-md text-light-on-surface-variant whitespace-nowrap">
                        {dev.device_id}
                      </td>
                      <td className="px-md py-md font-body text-body-md text-light-on-surface whitespace-nowrap">
                        {dev.hardware_officer}
                      </td>
                      <td className="px-md py-md font-body text-body-md text-light-on-surface-variant whitespace-nowrap">
                        {dev.assigned_event}
                      </td>
                      <td className="px-md py-md whitespace-nowrap">
                        {dev.status === 'Authorized' ? (
                          <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-success-container text-on-success-container whitespace-nowrap">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            <span className="font-label text-label-sm">Authorized</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-light-surface-container text-light-on-surface-variant whitespace-nowrap">
                            <span className="material-symbols-outlined text-[14px]">block</span>
                            <span className="font-label text-label-sm">Revoked</span>
                          </span>
                        )}
                      </td>
                      <td className="px-md py-md text-right whitespace-nowrap">
                        {dev.status === 'Authorized' && (
                          <button
                            type="button"
                            onClick={() => handleRevokeDevice(dev.id, dev.hardware_officer)}
                            className="px-md py-xs rounded bg-light-surface-container-lowest text-light-error border border-light-outline-variant hover:bg-light-error-container transition-colors duration-state-change font-label text-label-md cursor-pointer"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </AdminLayout>
  );
};

export default MerchantsAndDevices;
