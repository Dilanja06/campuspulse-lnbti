import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';

export const AuthoritySidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    let active = true;
    const fetchCount = async () => {
      const proposals = await dataService.getProposals();
      if (!active) return;
      const count = proposals.filter(
        (p) =>
          p.status === 'Higher Authority' ||
          (p.stage === 3 &&
            p.status !== 'Revision Requested' &&
            p.status !== 'Rejected' &&
            p.status !== 'Approved' &&
            p.status !== 'Approved & Published')
      ).length;
      setPendingCount(count);
    };
    fetchCount();
    const unsub = dataService.subscribe(fetchCount);
    return () => {
      active = false;
      unsub();
    };
  }, [location.pathname]);

  const navItems = [
    {
      label: 'Dashboard',
      to: '/authority',
      icon: 'dashboard',
      exact: true,
    },
    {
      label: 'Approval Stages',
      to: '/authority/stages',
      icon: 'verified_user',
      badge: pendingCount,
    },
    {
      label: 'Decision History',
      to: '/authority/history',
      icon: 'history',
    },
  ];

  return (
    <aside
      className="w-64 shrink-0 min-h-screen bg-light-surface-container-lowest border-r border-light-outline-variant flex flex-col justify-between"
      aria-label="Higher university authority workspace"
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
              University Authority
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav aria-label="Higher university authority workspace" className="flex flex-col gap-xs">
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
          Higher University Authority
        </span>
        <span className="font-mono text-mono-md text-light-on-surface-variant font-medium">
          {user?.staff_id || 'AUTH/DSA/001'}
        </span>
      </div>
    </aside>
  );
};

export default AuthoritySidebar;
