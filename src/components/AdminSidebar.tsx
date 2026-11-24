import React from 'react';
import { NavLink } from 'react-router-dom';
import { currentAdmin } from '../data/mockData';

export const AdminSidebar: React.FC = () => {
  const navItems = [
    {
      label: 'Dashboard',
      to: '/admin',
      icon: 'dashboard',
      exact: true,
    },
    {
      label: 'Official Records',
      to: '/admin/records',
      icon: 'account_balance',
    },
    {
      label: 'Roles & Permissions',
      to: '/admin/roles',
      icon: 'admin_panel_settings',
    },
    {
      label: 'Merchants & Devices',
      to: '/admin/merchants',
      icon: 'point_of_sale',
    },
    {
      label: 'System Audits',
      to: '/admin/audits',
      icon: 'history',
    },
  ];

  return (
    <aside 
      className="w-64 shrink-0 min-h-screen bg-light-surface-container-lowest border-r border-light-outline-variant flex flex-col justify-between"
      aria-label="Central administrator navigation sidebar"
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
              Central Admin
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav aria-label="Central administrator workspace" className="flex flex-col gap-xs">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-sm px-md py-sm rounded transition-colors duration-state-change no-underline ${
                  isActive
                    ? 'bg-light-primary text-light-on-primary font-semibold'
                    : 'text-light-on-surface-variant hover:bg-light-surface-container-low hover:text-light-on-surface'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                {item.icon}
              </span>
              <span className="font-label text-label-lg whitespace-nowrap">
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-lg border-t border-light-outline-variant flex flex-col gap-xs">
        <span className="font-label text-label-sm text-light-on-surface-variant">
          Central Administrator
        </span>
        <span className="font-mono text-mono-md text-light-on-surface-variant font-medium">
          {currentAdmin.staff_id}
        </span>
      </div>
    </aside>
  );
};

export default AdminSidebar;
