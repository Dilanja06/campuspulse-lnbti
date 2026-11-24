import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { dataService } from '../../services/dataService';
import { OfficialClubRecord } from '../../types';

export const OfficialRecords: React.FC = () => {
  const [clubs, setClubs] = useState<OfficialClubRecord[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState('CLB-22');
  const [newName, setNewName] = useState('');
  const [newCoordinator, setNewCoordinator] = useState('Dr. Kavinda Silva');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchRecords = async () => {
    try {
      const data = await dataService.getOfficialClubs();
      setClubs([...data]);
    } catch (err) {
      console.warn('Error fetching official club records:', err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleActivate = async (id: string, name: string) => {
    await dataService.activateOfficialClub(id);
    await dataService.logAuditEvent(`Activated Official Club Charter: ${name}`, id);
    setToastMessage(`Official charter for "${name}" successfully activated.`);
    setTimeout(() => setToastMessage(null), 4000);
    fetchRecords();
  };

  const handleRegisterClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    await dataService.registerOfficialClub({
      code: newCode,
      name: newName,
      coordinator: newCoordinator,
      committee_status: '5/5 Verified',
      status: 'Active',
    });
    await dataService.logAuditEvent(`Registered New Official Club: ${newName}`, newCode);
    setShowAddModal(false);
    setNewName('');
    setToastMessage(`Official club "${newName}" successfully chartered.`);
    setTimeout(() => setToastMessage(null), 4000);
    fetchRecords();
  };

  return (
    <AdminLayout>
      <main className="flex-1 p-xl max-w-[1280px] w-full mx-auto flex flex-col gap-lg">
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

        <div className="flex flex-wrap items-end justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline text-headline-lg text-light-on-surface">
              Official Club Records
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant">
              University-chartered clubs, assigned lecturer coordinators, and committee verification status.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-xs px-md py-sm rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container transition-colors duration-state-change font-label text-label-lg whitespace-nowrap cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              add
            </span>
            <span>Register Official Club</span>
          </button>
        </div>

        {/* Modal for Registering New Club */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-md">
            <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-xl max-w-md w-full flex flex-col gap-md shadow-lg">
              <h2 className="font-headline text-headline-sm text-light-on-surface">
                Charter New Official Club
              </h2>
              <form onSubmit={handleRegisterClub} className="flex flex-col gap-md">
                <div className="flex flex-col gap-xs">
                  <label className="font-label text-label-md text-light-on-surface">
                    Club Code
                  </label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="px-md py-sm rounded bg-light-surface-container-low border border-light-outline text-light-on-surface font-body text-body-md focus:border-light-primary outline-none"
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label text-label-md text-light-on-surface">
                    Official Club Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Media & Photography Guild"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="px-md py-sm rounded bg-light-surface-container-low border border-light-outline text-light-on-surface font-body text-body-md focus:border-light-primary outline-none"
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label text-label-md text-light-on-surface">
                    Lecturer Coordinator
                  </label>
                  <input
                    type="text"
                    required
                    value={newCoordinator}
                    onChange={(e) => setNewCoordinator(e.target.value)}
                    className="px-md py-sm rounded bg-light-surface-container-low border border-light-outline text-light-on-surface font-body text-body-md focus:border-light-primary outline-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-sm pt-sm">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-md py-sm rounded bg-light-surface-container-lowest text-light-on-surface border border-light-outline-variant hover:bg-light-surface-container-low font-label text-label-md cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-md py-sm rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container font-label text-label-md cursor-pointer"
                  >
                    Charter Club
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <section aria-label="Official clubs table" className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-light-surface-container-low border-b border-light-outline-variant">
                  <th scope="col" className="px-md py-md font-label text-label-md text-light-on-surface-variant whitespace-nowrap">
                    Club Code
                  </th>
                  <th scope="col" className="px-md py-md font-label text-label-md text-light-on-surface-variant whitespace-nowrap">
                    Official Name
                  </th>
                  <th scope="col" className="px-md py-md font-label text-label-md text-light-on-surface-variant whitespace-nowrap">
                    Lecturer Coordinator
                  </th>
                  <th scope="col" className="px-md py-md font-label text-label-md text-light-on-surface-variant whitespace-nowrap">
                    Committee
                  </th>
                  <th scope="col" className="px-md py-md font-label text-label-md text-light-on-surface-variant whitespace-nowrap">
                    Status
                  </th>
                  <th scope="col" className="px-md py-md font-label text-label-md text-light-on-surface-variant text-right whitespace-nowrap">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-outline-variant">
                {clubs.map((club) => (
                  <tr key={club.id} className="hover:bg-light-surface-container-low/40 transition-colors">
                    <td className="px-md py-md font-mono text-mono-md text-light-on-surface-variant whitespace-nowrap">
                      {club.code}
                    </td>
                    <td className="px-md py-md font-title text-title-md text-light-on-surface font-semibold whitespace-nowrap">
                      {club.name}
                    </td>
                    <td className="px-md py-md font-body text-body-md text-light-on-surface whitespace-nowrap">
                      {club.coordinator}
                    </td>
                    <td className="px-md py-md font-mono text-mono-md text-light-on-surface-variant tabular-nums whitespace-nowrap">
                      {club.committee_status}
                    </td>
                    <td className="px-md py-md whitespace-nowrap">
                      {club.status === 'Active' ? (
                        <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-success-container text-on-success-container whitespace-nowrap">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          <span className="font-label text-label-sm">Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-warning-container text-on-warning-container whitespace-nowrap">
                          <span className="material-symbols-outlined text-[14px]">hourglass_top</span>
                          <span className="font-label text-label-sm">Charter Pending</span>
                        </span>
                      )}
                    </td>
                    <td className="px-md py-md text-right whitespace-nowrap">
                      {club.status === 'Active' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setToastMessage(`Viewing club profile record for ${club.name}.`);
                            setTimeout(() => setToastMessage(null), 3000);
                          }}
                          className="px-md py-xs rounded bg-light-surface-container-lowest text-light-primary border border-light-outline-variant hover:bg-light-surface-container-low transition-colors duration-state-change font-label text-label-md cursor-pointer"
                        >
                          Edit Record
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleActivate(club.id, club.name)}
                          className="px-md py-xs rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container transition-colors duration-state-change font-label text-label-md cursor-pointer"
                        >
                          Activate
                        </button>
                      )}
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

export default OfficialRecords;
