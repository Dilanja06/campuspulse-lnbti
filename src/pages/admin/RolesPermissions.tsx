import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { dataService } from '../../services/dataService';
import { RoleAssignment } from '../../types';

export const RolesPermissions: React.FC = () => {
  const [roles, setRoles] = useState<RoleAssignment[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIdentifier, setNewIdentifier] = useState('');
  const [newRole, setNewRole] = useState('Authorized Club Organizer');
  const [newScope, setNewScope] = useState('Robotics Society (CLB-07)');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchRoles = async () => {
    try {
      const data = await dataService.getRoleAssignments();
      setRoles([...data]);
    } catch (err) {
      console.warn('Error fetching roles:', err);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleRevokeRole = async (id: string, name: string) => {
    await dataService.revokeRole(id);
    await dataService.logAuditEvent(`Revoked Permission for ${name}`, id);
    setToastMessage(`Revoked permissions for ${name}.`);
    setTimeout(() => setToastMessage(null), 4000);
    fetchRoles();
  };

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newIdentifier) return;
    await dataService.assignRole({
      name: newName,
      identifier: newIdentifier,
      role: newRole,
      scope: newScope,
      status: newRole.includes('Organizer') ? 'Officer Permission' : 'Active',
    });
    await dataService.logAuditEvent(`Assigned Role: ${newRole} to ${newName}`, newIdentifier);
    setShowAssignModal(false);
    setNewName('');
    setNewIdentifier('');
    setToastMessage(`Successfully granted ${newRole} to ${newName}.`);
    setTimeout(() => setToastMessage(null), 4000);
    fetchRoles();
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
              Roles &amp; Permissions
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant">
              Assign university approval authorities, verification staff, lecturer coordinators, and authorized club organizers.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAssignModal(true)}
            className="inline-flex items-center justify-center gap-xs px-md py-sm rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container transition-colors duration-state-change font-label text-label-lg whitespace-nowrap cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              person_add
            </span>
            <span>Assign Role</span>
          </button>
        </div>

        {/* Modal for Assigning Role */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-md">
            <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-xl max-w-md w-full flex flex-col gap-md shadow-lg">
              <h2 className="font-headline text-headline-sm text-light-on-surface">
                Assign System / Club Role
              </h2>
              <form onSubmit={handleAssignRole} className="flex flex-col gap-md">
                <div className="flex flex-col gap-xs">
                  <label className="font-label text-label-md text-light-on-surface">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dinithi Perera"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="px-md py-sm rounded bg-light-surface-container-low border border-light-outline text-light-on-surface font-body text-body-md focus:border-light-primary outline-none"
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label text-label-md text-light-on-surface">
                    Staff ID / Student ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UG/2024/CS/0881"
                    value={newIdentifier}
                    onChange={(e) => setNewIdentifier(e.target.value)}
                    className="px-md py-sm rounded bg-light-surface-container-low border border-light-outline text-light-on-surface font-body text-body-md focus:border-light-primary outline-none"
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label text-label-md text-light-on-surface">
                    Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="px-md py-sm rounded bg-light-surface-container-low border border-light-outline text-light-on-surface font-body text-body-md focus:border-light-primary outline-none"
                  >
                    <option>Authorized Club Organizer</option>
                    <option>Lecturer Coordinator</option>
                    <option>External Verification Staff</option>
                    <option>Higher University Authority</option>
                  </select>
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label text-label-md text-light-on-surface">
                    Scope / Assigned Department
                  </label>
                  <input
                    type="text"
                    required
                    value={newScope}
                    onChange={(e) => setNewScope(e.target.value)}
                    className="px-md py-sm rounded bg-light-surface-container-low border border-light-outline text-light-on-surface font-body text-body-md focus:border-light-primary outline-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-sm pt-sm">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="px-md py-sm rounded bg-light-surface-container-lowest text-light-on-surface border border-light-outline-variant hover:bg-light-surface-container-low font-label text-label-md cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-md py-sm rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container font-label text-label-md cursor-pointer"
                  >
                    Grant Role
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <section aria-label="Role assignments table" className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-light-surface-container-low border-b border-light-outline-variant">
                  <th scope="col" className="px-md py-md font-label text-label-sm text-light-on-surface-variant uppercase tracking-wider">
                    Staff / Student
                  </th>
                  <th scope="col" className="px-md py-md font-label text-label-sm text-light-on-surface-variant uppercase tracking-wider">
                    Assigned Role
                  </th>
                  <th scope="col" className="px-md py-md font-label text-label-sm text-light-on-surface-variant uppercase tracking-wider">
                    Scope
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
                {roles.map((item) => (
                  <tr key={item.id} className="hover:bg-light-surface-container-low/40 transition-colors">
                    <td className="px-md py-md">
                      <div className="flex flex-col">
                        <span className="font-title text-title-md text-light-on-surface font-semibold whitespace-nowrap">
                          {item.name}
                        </span>
                        <span className="font-mono text-mono-md text-light-on-surface-variant">
                          {item.identifier}
                        </span>
                      </div>
                    </td>
                    <td className="px-md py-md font-body text-body-md text-light-on-surface whitespace-nowrap">
                      {item.role}
                    </td>
                    <td className="px-md py-md font-body text-body-md text-light-on-surface-variant whitespace-nowrap">
                      {item.scope}
                    </td>
                    <td className="px-md py-md whitespace-nowrap">
                      {item.status === 'Active' ? (
                        <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-success-container text-on-success-container whitespace-nowrap">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          <span className="font-label text-label-sm">Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-info-container text-on-info-container whitespace-nowrap">
                          <span className="material-symbols-outlined text-[14px]">badge</span>
                          <span className="font-label text-label-sm">Officer Permission</span>
                        </span>
                      )}
                    </td>
                    <td className="px-md py-md text-right whitespace-nowrap">
                      {item.status === 'Officer Permission' ? (
                        <button
                          type="button"
                          onClick={() => handleRevokeRole(item.id, item.name)}
                          className="px-md py-xs rounded bg-light-surface-container-lowest text-light-error border border-light-outline-variant hover:bg-light-error-container transition-colors duration-state-change font-label text-label-md cursor-pointer"
                        >
                          Revoke
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setToastMessage(`Editing scope for ${item.name}.`);
                            setTimeout(() => setToastMessage(null), 3000);
                          }}
                          className="px-md py-xs rounded bg-light-surface-container-lowest text-light-primary border border-light-outline-variant hover:bg-light-surface-container-low transition-colors duration-state-change font-label text-label-md cursor-pointer"
                        >
                          Manage
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

export default RolesPermissions;
