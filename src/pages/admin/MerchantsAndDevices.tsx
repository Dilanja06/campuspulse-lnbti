import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { PaymentMerchant, QRScannerDevice } from '../../types';
import { dataService } from '../../services/dataService';

export const MerchantsAndDevices: React.FC = () => {
  const [merchants, setMerchants] = useState<PaymentMerchant[]>([]);
  const [devices, setDevices] = useState<QRScannerDevice[]>([]);
  const [loading, setLoading] = useState(true);

  const [showMerchantModal, setShowMerchantModal] = useState(false);
  const [merchName, setMerchName] = useState('');
  const [merchDesc, setMerchDesc] = useState('');
  const [merchSettlement, setMerchSettlement] = useState('LNBTI Bursar Trust Account');

  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [devId, setDevId] = useState('');
  const [devOfficer, setDevOfficer] = useState('');
  const [devEvent, setDevEvent] = useState('All Authorized Venues');

  const loadInfra = async () => {
    setLoading(true);
    try {
      const [mList, dList] = await Promise.all([
        dataService.getPaymentMerchants(),
        dataService.getQRDevices(),
      ]);
      setMerchants(mList);
      setDevices(dList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInfra();
  }, []);

  const handleCreateMerchant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchName.trim()) return;
    await dataService.createPaymentMerchant({
      name: merchName.trim(),
      description: merchDesc.trim() || 'Provisioned institutional settlement endpoint.',
      status: 'Live',
      settlement: merchSettlement.trim(),
    });
    setShowMerchantModal(false);
    setMerchName('');
    setMerchDesc('');
    await loadInfra();
  };

  const handleToggleMerchant = async (id: string) => {
    await dataService.toggleMerchantStatus(id);
    await loadInfra();
  };

  const handlePairDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devId.trim() || !devOfficer.trim()) return;
    await dataService.pairQRDevice({
      device_id: devId.trim().toUpperCase(),
      hardware_officer: devOfficer.trim(),
      assigned_event: devEvent.trim(),
      status: 'Authorized',
    });
    setShowDeviceModal(false);
    setDevId('');
    setDevOfficer('');
    await loadInfra();
  };

  const handleRevokeDevice = async (id: string) => {
    await dataService.revokeQRDevice(id);
    await loadInfra();
  };

  return (
    <AdminLayout>
      <main className="p-lg md:p-xl max-w-[1400px] w-full mx-auto flex flex-col gap-xl">
        <header className="flex flex-col gap-xs">
          <h1 className="font-headline text-headline-lg text-light-on-surface font-semibold m-0">
            Payment Merchants &amp; QR Gate Devices
          </h1>
          <p className="font-body text-body-md text-light-on-surface-variant m-0">
            Configure institutional PayHere merchant gateways and manage hardware QR gate scanner authorizations.
          </p>
        </header>

        {/* Payment Merchants */}
        <section className="flex flex-col gap-md">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-headline-sm font-semibold m-0">Payment Gateways ({merchants.length})</h2>
            <button
              type="button"
              onClick={() => setShowMerchantModal(true)}
              className="px-md py-xs rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold border-0 cursor-pointer"
            >
              + Add Merchant
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {merchants.map((m) => (
              <article
                key={m.id}
                className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col justify-between gap-md shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-xs mb-xs">
                    <h3 className="font-title text-title-md font-bold m-0">{m.name}</h3>
                    <span
                      className={`px-sm py-0.5 rounded-full font-label text-label-sm ${
                        m.status === 'Live'
                          ? 'bg-success-container text-on-success-container'
                          : 'bg-warning-container text-on-warning-container'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                  <p className="font-body text-body-sm text-light-on-surface-variant m-0">{m.description}</p>
                  <span className="block font-label text-label-sm text-light-primary mt-sm">
                    Settlement: {m.settlement}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleMerchant(m.id)}
                  className="self-start px-md py-xs rounded border border-light-outline-variant bg-transparent font-label text-label-sm font-semibold cursor-pointer hover:bg-light-surface-container-low"
                >
                  {m.status === 'Live' ? 'Switch to Maintenance' : 'Set Gateway Live'}
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* QR Devices */}
        <section className="flex flex-col gap-md">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-headline-sm font-semibold m-0">
              Authorized QR Gate Devices ({devices.length})
            </h2>
            <button
              type="button"
              onClick={() => setShowDeviceModal(true)}
              className="px-md py-xs rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold border-0 cursor-pointer"
            >
              + Pair Scanner Device
            </button>
          </div>

          <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-light-outline-variant bg-light-surface-container-low/50 text-light-on-surface-variant font-label text-label-sm">
                  <th className="px-md py-md">Device ID</th>
                  <th className="px-md py-md">Assigned Hardware Officer</th>
                  <th className="px-md py-md">Venue / Event Assignment</th>
                  <th className="px-md py-md">Authorization</th>
                  <th className="px-md py-md text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-outline-variant">
                {loading ? (
                  <tr><td colSpan={5} className="p-xl text-center">Loading scanners...</td></tr>
                ) : (
                  devices.map((d) => (
                    <tr key={d.id}>
                      <td className="px-md py-md font-mono text-mono-md text-light-primary font-semibold">{d.device_id}</td>
                      <td className="px-md py-md font-title text-title-md">{d.hardware_officer}</td>
                      <td className="px-md py-md font-body text-body-md text-light-on-surface-variant">{d.assigned_event}</td>
                      <td className="px-md py-md">
                        <span
                          className={`px-sm py-0.5 rounded-full font-label text-label-sm ${
                            d.status === 'Authorized'
                              ? 'bg-success-container text-on-success-container'
                              : 'bg-light-error-container text-light-on-error-container'
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="px-md py-md text-right">
                        {d.status === 'Authorized' && (
                          <button
                            type="button"
                            onClick={() => handleRevokeDevice(d.id)}
                            className="px-sm py-xs rounded bg-light-error-container text-light-on-error-container font-label text-label-sm border-0 cursor-pointer"
                          >
                            Revoke Key
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {showMerchantModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-md">
            <form
              onSubmit={handleCreateMerchant}
              className="bg-light-surface-container-lowest rounded-lg max-w-md w-full p-lg border border-light-outline-variant shadow-xl flex flex-col gap-md"
            >
              <h2 className="font-headline text-headline-sm font-semibold m-0">Provision Payment Merchant</h2>
              <input
                type="text"
                required
                value={merchName}
                onChange={(e) => setMerchName(e.target.value)}
                placeholder="Merchant Name (e.g., PayHere Sports Gate)"
                className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest"
              />
              <input
                type="text"
                value={merchDesc}
                onChange={(e) => setMerchDesc(e.target.value)}
                placeholder="Gateway purpose"
                className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest"
              />
              <input
                type="text"
                required
                value={merchSettlement}
                onChange={(e) => setMerchSettlement(e.target.value)}
                placeholder="Settlement Account"
                className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest"
              />
              <div className="flex justify-end gap-sm">
                <button type="button" onClick={() => setShowMerchantModal(false)} className="px-md py-xs rounded border border-light-outline-variant bg-transparent cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-md py-xs rounded bg-light-primary text-light-on-primary font-semibold border-0 cursor-pointer">
                  Provision Gateway
                </button>
              </div>
            </form>
          </div>
        )}

        {showDeviceModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-md">
            <form
              onSubmit={handlePairDevice}
              className="bg-light-surface-container-lowest rounded-lg max-w-md w-full p-lg border border-light-outline-variant shadow-xl flex flex-col gap-md"
            >
              <h2 className="font-headline text-headline-sm font-semibold m-0">Pair Hardware QR Scanner</h2>
              <input
                type="text"
                required
                value={devId}
                onChange={(e) => setDevId(e.target.value)}
                placeholder="Hardware ID (e.g., GATE-09-EAST)"
                className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest font-mono"
              />
              <input
                type="text"
                required
                value={devOfficer}
                onChange={(e) => setDevOfficer(e.target.value)}
                placeholder="Hardware Custodian Name"
                className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest"
              />
              <input
                type="text"
                required
                value={devEvent}
                onChange={(e) => setDevEvent(e.target.value)}
                placeholder="Assigned Event / Venue"
                className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest"
              />
              <div className="flex justify-end gap-sm">
                <button type="button" onClick={() => setShowDeviceModal(false)} className="px-md py-xs rounded border border-light-outline-variant bg-transparent cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-md py-xs rounded bg-light-primary text-light-on-primary font-semibold border-0 cursor-pointer">
                  Authorize Scanner
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </AdminLayout>
  );
};

export default MerchantsAndDevices;
