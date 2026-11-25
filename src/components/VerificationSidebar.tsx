import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';

export const VerificationSidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let active = true;
    const loadPending = () => {
      dataService.getExternalVerifications().then((items) => {
        if (active) {
          setPendingCount(items.filter((v) => v.status === 'Pending Verification').length);
        }
      });
    };
    loadPending();
    const unsub = dataService.subscribe(loadPending);
    return () => {
      active = false;
      unsub();
    };
  }, [location.pathname]);

  const navItems = [
    { label: 'Evidence Queue', to: '/verification', icon: 'verified', exact: true, badge: pendingCount > 0 ? pendingCount : undefined },
    { label: 'Verification History', to: '/verification/history', icon: 'history' },
  ];

  return (
    <aside
      className="w-64 shrink-0 min-h-screen bg-light-surface-container-lowest border-r border-light-outline-variant flex flex-col justify-between"
      aria-label="External verification navigation sidebar"
    >
      <div className="p-lg flex flex-col gap-xl">
        <div className="flex items-center gap-sm">
          <div className="w-10 h-10 rounded bg-white border border-light-outline-variant p-1 flex items-center justify-center shrink-0 shadow-xs">
            <img src="/lnbti-emblem.png" alt="LNBTI Emblem" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-headline text-title-md text-light-on-surface font-bold tracking-tight">
                CampusPulse
              </span>
              <span className="text-[10px] font-bold text-white bg-light-primary px-1 rounded">LNBTI</span>
            </div>
            <span className="font-label text-label-sm text-light-on-surface-variant">
              Verification Staff
            </span>
          </div>
        </div>

        <nav aria-label="External verification workspace" className="flex flex-col gap-xs">
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
              <span className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="font-label text-label-lg whitespace-nowrap">{item.label}</span>
              </span>
              {item.badge !== undefined && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-xs rounded-full bg-light-secondary-container text-light-on-secondary-container text-label-sm font-label tabular-nums">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-lg border-t border-light-outline-variant flex flex-col gap-xs">
        <span className="font-label text-label-sm text-light-on-surface-variant">External Evidence Unit</span>
        <span className="font-mono text-mono-md text-light-on-surface-variant font-medium">
          {user?.staff_id || 'STAFF/VER/0011'}
        </span>
      </div>
    </aside>
  );
};

export default VerificationSidebar;
