import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { CommitteeMemberProfile } from '../types';
import { isDemoModeEnabled } from '../context/AuthContext';

interface CommitteeSidebarProps {
  onRoleChanged?: () => void;
}

export const CommitteeSidebar: React.FC<CommitteeSidebarProps> = ({ onRoleChanged }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [members, setMembers] = useState<CommitteeMemberProfile[]>([]);
  const [currentMember, setCurrentMember] = useState<CommitteeMemberProfile>(
    dataService.getCurrentCommitteeMember()
  );
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      const mems = await dataService.getCommitteeMembers();
      if (!active) return;
      setMembers(mems);
      const activeMember = dataService.getCurrentCommitteeMember();
      setCurrentMember(activeMember);
      const actions = await dataService.getCommitteeActions();
      if (!active) return;
      const pending = actions.filter((a) => {
        const mySeat = a.seats.find(
          (s) => s.role.toLowerCase() === activeMember.role.toLowerCase()
        );
        return mySeat && mySeat.status === 'Pending' && a.my_status !== 'Rejected';
      }).length;
      setPendingCount(pending);
    };
    loadData();
    const unsub = dataService.subscribe(loadData);
    return () => {
      active = false;
      unsub();
    };
  }, [location.pathname]);

  const handleRoleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const updated = dataService.switchCommitteeMember(selectedId);
    setCurrentMember(updated);
    if (onRoleChanged) {
      onRoleChanged();
    } else {
      navigate(0); // refresh view with newly selected committee member
    }
  };

  const navItems = [
    {
      label: 'Dashboard',
      to: '/committee',
      icon: 'dashboard',
      exact: true,
    },
    {
      label: 'Assigned Actions',
      to: '/committee/actions',
      icon: 'fact_check',
      badge: pendingCount,
    },
  ];

  return (
    <aside
      className="w-64 shrink-0 min-h-screen bg-light-surface-container-lowest border-r border-light-outline-variant flex flex-col justify-between"
      aria-label="Club decision-maker workspace"
    >
      <div className="p-lg flex flex-col gap-xl">
        {/* Brand Mark with LNBTI Emblem */}
        <div className="flex items-center gap-sm">
          <div className="w-10 h-10 rounded bg-white border border-light-outline-variant p-1 flex items-center justify-center shrink-0 shadow-xs">
            <img src="/lnbti-emblem.png" alt="LNBTI Emblem" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-headline text-title-md text-light-on-surface font-bold tracking-tight">
                CampusPulse
              </span>
              <span className="text-[10px] font-bold text-white bg-light-primary px-1 rounded">
                LNBTI
              </span>
            </div>
            <span className="font-label text-label-sm text-light-on-surface-variant">
              Committee Portal
            </span>
          </div>
        </div>

        {/* Five Committee Decision-Makers Switcher (Demo Sandbox Only) / Locked Seat Display in Production */}
        <div className="flex flex-col gap-xs bg-light-surface-container-low p-sm rounded border border-light-outline-variant">
          <label htmlFor="committee-role-select" className="font-label text-label-sm text-light-on-surface-variant font-medium">
            {isDemoModeEnabled ? 'Active Committee Seat (Sandbox)' : 'Assigned Committee Seat'}
          </label>
          {isDemoModeEnabled ? (
            <select
              id="committee-role-select"
              value={currentMember.id}
              onChange={handleRoleSelect}
              className="w-full bg-light-surface-container-lowest border border-light-outline text-light-on-surface rounded px-sm py-xs font-label text-label-md focus:border-light-primary focus:ring-1 focus:ring-light-primary outline-none"
            >
              {members.map((m, index) => (
                <option key={m.id} value={m.id}>
                  {index + 1}. {m.role} ({m.name})
                </option>
              ))}
            </select>
          ) : (
            <div className="px-xs py-0.5 font-label text-label-md text-light-on-surface font-semibold">
              {currentMember.role} · {currentMember.name}
            </div>
          )}
        </div>

        {/* Navigation items */}
        <nav aria-label="Club decision-maker navigation" className="flex flex-col gap-xs">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center justify-between gap-sm px-md py-sm rounded transition-colors duration-state-change no-underline ${
                  isActive
                    ? 'bg-light-primary text-light-on-primary font-semibold'
                    : 'text-light-on-surface-variant hover:bg-light-surface-container-low hover:text-light-on-surface'
                }`
              }
            >
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="font-label text-label-lg whitespace-nowrap">
                  {item.label}
                </span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  role="status"
                  className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-xs rounded-full bg-light-secondary-container text-light-on-secondary-container text-label-sm font-label tabular-nums"
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-lg border-t border-light-outline-variant flex flex-col gap-xs">
        <span className="font-label text-label-sm text-light-on-surface-variant">
          Club Decision-Maker
        </span>
        <span className="font-mono text-mono-md text-light-on-surface-variant font-medium">
          {currentMember.student_id}
        </span>
      </div>
    </aside>
  );
};

export default CommitteeSidebar;
