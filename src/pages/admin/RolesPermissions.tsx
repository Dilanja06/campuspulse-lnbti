import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { RoleAssignment } from '../../types';
import { dataService } from '../../services/dataService';

export const RolesPermissions: React.FC = () => {
  const [assignments, setAssignments] = useState<RoleAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleAssignment | null>(null);

  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [role, setRole] = useState('Coordinator');
  const [scope, setScope] = useState('Faculty of Computing');

  const loadRoles = async () => {
    setLoading(true);
    try {
      const list = await dataService.getRoleAssignments();
      setAssignments(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !identifier.trim()) return;
    await dataService.assignRole({
      name: name.trim(),
      identifier: identifier.trim(),
      role,
      scope: scope.trim(),
      status: role.includes('Organizer') || role.includes('Committee') ? 'Officer Permission' : 'Active',
    });
    setShowGrantModal(false);
    setName('');
    setIdentifier('');
    await loadRoles();
  };

  const handleSaveScope = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    await dataService.updateRoleAssignment(editingRole.id, {
      role: editingRole.role,
      scope: editingRole.scope,
      status: editingRole.status,
    });
    setEditingRole(null);
    await loadRoles();
  };

  const handleRevoke = async (id: string) => {
    if (!window.confirm('Revoke this role assignment?')) return;
    await dataService.revokeRole(id);
    await loadRoles();
  };

  return (
    <AdminLayout>
      <main className="p-lg md:p-xl max-w-[1400px] w-full mx-auto flex flex-col gap-xl">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline text-headline-lg text-light-on-surface font-semibold m-0">
              RBAC Roles &amp; Institutional Scopes
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant m-0">
              Enforce Separation of Powers by assigning Coordinator, Authority, Verification, and Officer scopes without overlapping privileges.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowGrantModal(true)}
            className="inline-flex items-center gap-xs px-md py-sm rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold border-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Assign Institutional Role</span>
          </button>
        </header>

        <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-light-outline-variant bg-light-surface-container-low/50 text-light-on-surface-variant font-label text-label-sm">
                  <th className="px-md py-md">Assignee</th>
                  <th className="px-md py-md">ID / Account</th>
                  <th className="px-md py-md">Granted Role</th>
                  <th className="px-md py-md">Governance Scope</th>
                  <th className="px-md py-md">Status</th>
                  <th className="px-md py-md text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-outline-variant">
                {loading ? (
                  <tr><td colSpan={6} className="p-xl text-center">Loading RBAC ledger...</td></tr>
                ) : (
                  assignments.map((item) => (
                    <tr key={item.id} className="hover:bg-light-surface-container-low/30">
                      <td className="px-md py-md font-title text-title-md text-light-on-surface font-medium">
                        {item.name}
                      </td>
                      <td className="px-md py-md font-mono text-mono-sm text-light-on-surface-variant">
                        {item.identifier}
                      </td>
                      <td className="px-md py-md font-label text-label-md font-semibold text-light-primary">
                        {item.role}
                      </td>
                      <td className="px-md py-md font-body text-body-md text-light-on-surface-variant">
                        {item.scope}
                      </td>
                      <td className="px-md py-md">
                        <span className="px-sm py-0.5 rounded-full bg-info-container text-on-info-container font-label text-label-sm">
                          {item.status}
                        </span>
                      </td>
                      <td className="px-md py-md text-right whitespace-nowrap">
                        <div className="inline-flex gap-xs">
                          <button
                            type="button"
                            onClick={() => setEditingRole({ ...item })}
                            className="px-sm py-xs rounded border border-light-outline-variant bg-transparent font-label text-label-sm cursor-pointer"
                          >
                            Manage Scope
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRevoke(item.id)}
                            className="px-sm py-xs rounded bg-light-error-container text-light-on-error-container font-label text-label-sm border-0 cursor-pointer"
                          >
                            Revoke
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {showGrantModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-md">
            <form
              onSubmit={handleGrant}
              className="bg-light-surface-container-lowest rounded-lg max-w-md w-full p-lg border border-light-outline-variant shadow-xl flex flex-col gap-md"
            >
              <h2 className="font-headline text-headline-sm font-semibold m-0">Assign Institutional Role</h2>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest"
              />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Staff/Student ID or Email"
                className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest"
              >
                <option value="Coordinator">Coordinator (Faculty Vetting)</option>
                <option value="Higher Authority">Higher Authority (Dean/Bursar)</option>
                <option value="Verification Staff">External Verification Staff</option>
                <option value="Organizer">Club Organizer</option>
                <option value="Committee Member">Committee Member</option>
              </select>
              <input
                type="text"
                required
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                placeholder="Governance Scope (Faculty or Club)"
                className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest"
              />
              <div className="flex justify-end gap-sm pt-sm">
                <button type="button" onClick={() => setShowGrantModal(false)} className="px-md py-xs rounded border border-light-outline-variant bg-transparent cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-md py-xs rounded bg-light-primary text-light-on-primary font-semibold border-0 cursor-pointer">
                  Grant Access
                </button>
              </div>
            </form>
          </div>
        )}

        {editingRole && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-md">
            <form
              onSubmit={handleSaveScope}
              className="bg-light-surface-container-lowest rounded-lg max-w-md w-full p-lg border border-light-outline-variant shadow-xl flex flex-col gap-md"
            >
              <h2 className="font-headline text-headline-sm font-semibold m-0">Manage Scope · {editingRole.name}</h2>
              <label className="flex flex-col gap-xs">
                <span className="font-label text-label-md font-semibold">Assigned Role</span>
                <input
                  type="text"
                  required
                  value={editingRole.role}
                  onChange={(e) => setEditingRole({ ...editingRole, role: e.target.value })}
                  className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest"
                />
              </label>
              <label className="flex flex-col gap-xs">
                <span className="font-label text-label-md font-semibold">Governance Scope</span>
                <input
                  type="text"
                  required
                  value={editingRole.scope}
                  onChange={(e) => setEditingRole({ ...editingRole, scope: e.target.value })}
                  className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest"
                />
              </label>
              <div className="flex justify-end gap-sm pt-sm">
                <button type="button" onClick={() => setEditingRole(null)} className="px-md py-xs rounded border border-light-outline-variant bg-transparent cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-md py-xs rounded bg-light-primary text-light-on-primary font-semibold border-0 cursor-pointer">
                  Save Scope
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </AdminLayout>
  );
};

export default RolesPermissions;
