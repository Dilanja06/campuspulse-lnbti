import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { OfficialClubRecord } from '../../types';
import { dataService } from '../../services/dataService';

export const OfficialRecords: React.FC = () => {
  const [clubs, setClubs] = useState<OfficialClubRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingClub, setEditingClub] = useState<OfficialClubRecord | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [coordinator, setCoordinator] = useState('Dr. Kavinda Silva');
  const [committeeStatus, setCommitteeStatus] = useState('Verified Quorum');
  const [statusVal, setStatusVal] = useState<'Active' | 'Charter Pending'>('Active');

  const loadClubs = async () => {
    setLoading(true);
    try {
      const list = await dataService.getOfficialClubs();
      setClubs(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClubs();
  }, []);

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;
    await dataService.registerOfficialClub({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      coordinator: coordinator.trim(),
      committee_status: committeeStatus,
      status: statusVal,
    });
    setShowNewModal(false);
    setCode('');
    setName('');
    await loadClubs();
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClub) return;
    await dataService.updateOfficialClub(editingClub.id, {
      name: editingClub.name,
      coordinator: editingClub.coordinator,
      committee_status: editingClub.committee_status,
      status: editingClub.status,
    });
    setEditingClub(null);
    await loadClubs();
  };

  const handleActivate = async (id: string) => {
    await dataService.activateOfficialClub(id);
    await loadClubs();
  };

  return (
    <AdminLayout>
      <main className="p-lg md:p-xl max-w-[1400px] w-full mx-auto flex flex-col gap-xl">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline text-headline-lg text-light-on-surface font-semibold m-0">
              Official Institutional Club Records (A03 · A04)
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant m-0">
              Manage chartered clubs, assign Faculty Coordinators, and activate verified charters.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-xs px-md py-sm rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold border-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Register Club Charter</span>
          </button>
        </header>

        <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-light-outline-variant bg-light-surface-container-low/50 text-light-on-surface-variant font-label text-label-sm">
                  <th className="px-md py-md">Code</th>
                  <th className="px-md py-md">Official Society Name</th>
                  <th className="px-md py-md">Assigned Coordinator</th>
                  <th className="px-md py-md">Committee Quorum</th>
                  <th className="px-md py-md">Charter Status</th>
                  <th className="px-md py-md text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-outline-variant">
                {loading ? (
                  <tr><td colSpan={6} className="p-xl text-center">Loading official records...</td></tr>
                ) : (
                  clubs.map((c) => (
                    <tr key={c.id} className="hover:bg-light-surface-container-low/30">
                      <td className="px-md py-md font-mono text-mono-md text-light-primary font-semibold whitespace-nowrap">
                        {c.code}
                      </td>
                      <td className="px-md py-md font-title text-title-md text-light-on-surface font-medium">
                        {c.name}
                      </td>
                      <td className="px-md py-md font-body text-body-md text-light-on-surface-variant">
                        {c.coordinator}
                      </td>
                      <td className="px-md py-md font-label text-label-md text-light-on-surface-variant">
                        {c.committee_status}
                      </td>
                      <td className="px-md py-md">
                        <span
                          className={`px-sm py-0.5 rounded-full font-label text-label-sm ${
                            c.status === 'Active'
                              ? 'bg-success-container text-on-success-container'
                              : 'bg-warning-container text-on-warning-container'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-md py-md text-right whitespace-nowrap">
                        <div className="inline-flex gap-xs">
                          <button
                            type="button"
                            onClick={() => setEditingClub({ ...c })}
                            className="px-sm py-xs rounded border border-light-outline-variant bg-transparent text-light-on-surface font-label text-label-sm cursor-pointer"
                          >
                            Edit Record
                          </button>
                          {c.status === 'Charter Pending' && (
                            <button
                              type="button"
                              onClick={() => handleActivate(c.id)}
                              className="px-sm py-xs rounded bg-light-primary text-light-on-primary font-label text-label-sm font-semibold border-0 cursor-pointer"
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {showNewModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-md">
            <form
              onSubmit={handleCreateClub}
              className="bg-light-surface-container-lowest rounded-lg max-w-md w-full p-lg border border-light-outline-variant shadow-xl flex flex-col gap-md"
            >
              <h2 className="font-headline text-headline-sm font-semibold m-0">Register Official Club Charter</h2>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Club Code (e.g., SOC-009)"
                className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest"
              />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Society Name"
                className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest"
              />
              <input
                type="text"
                required
                value={coordinator}
                onChange={(e) => setCoordinator(e.target.value)}
                placeholder="Assigned Faculty Coordinator"
                className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest"
              />
              <div className="flex justify-end gap-sm pt-sm">
                <button type="button" onClick={() => setShowNewModal(false)} className="px-md py-xs rounded border border-light-outline-variant bg-transparent cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-md py-xs rounded bg-light-primary text-light-on-primary font-semibold border-0 cursor-pointer">
                  Save Charter
                </button>
              </div>
            </form>
          </div>
        )}

        {editingClub && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-md">
            <form
              onSubmit={handleSaveEdit}
              className="bg-light-surface-container-lowest rounded-lg max-w-md w-full p-lg border border-light-outline-variant shadow-xl flex flex-col gap-md"
            >
              <h2 className="font-headline text-headline-sm font-semibold m-0">Edit Record · {editingClub.code}</h2>
              <label className="flex flex-col gap-xs">
                <span className="font-label text-label-md font-semibold">Society Name</span>
                <input
                  type="text"
                  required
                  value={editingClub.name}
                  onChange={(e) => setEditingClub({ ...editingClub, name: e.target.value })}
                  className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest"
                />
              </label>
              <label className="flex flex-col gap-xs">
                <span className="font-label text-label-md font-semibold">Assigned Coordinator</span>
                <input
                  type="text"
                  required
                  value={editingClub.coordinator}
                  onChange={(e) => setEditingClub({ ...editingClub, coordinator: e.target.value })}
                  className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest"
                />
              </label>
              <label className="flex flex-col gap-xs">
                <span className="font-label text-label-md font-semibold">Charter Status</span>
                <select
                  value={editingClub.status}
                  onChange={(e) => setEditingClub({ ...editingClub, status: e.target.value as 'Active' | 'Charter Pending' })}
                  className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest"
                >
                  <option value="Active">Active</option>
                  <option value="Charter Pending">Charter Pending</option>
                </select>
              </label>
              <div className="flex justify-end gap-sm pt-sm">
                <button type="button" onClick={() => setEditingClub(null)} className="px-md py-xs rounded border border-light-outline-variant bg-transparent cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-md py-xs rounded bg-light-primary text-light-on-primary font-semibold border-0 cursor-pointer">
                  Update Record
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </AdminLayout>
  );
};

export default OfficialRecords;
