import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';

export const OrganizerSidebar: React.FC = () => {
  const { user } = useAuth();
  const [pendingProposalsCount, setPendingProposalsCount] = useState(0);
  const [pendingRegistrationsCount, setPendingRegistrationsCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [proposals, registrations] = await Promise.all([
          dataService.getProposals(),
          dataService.getRegistrations(),
        ]);
        const inReview = proposals.filter(
          (p) =>
            p.status === 'Higher Authority' ||
            p.status === 'Revision Requested' ||
            p.status === 'In Review' ||
            p.status === 'Committee Review' ||
            p.status === 'Pending Review'
        ).length;
        setPendingProposalsCount(inReview);

        const pendingRegs = registrations.filter((r) => r.status === 'pending').length;
        setPendingRegistrationsCount(pendingRegs);
      } catch (err) {
        console.warn('Sidebar counts error:', err);
      }
    };
    fetchCounts();
  }, []);

  const navItems = [
    {
      label: 'Dashboard',
      to: '/organizer',
      icon: 'dashboard',
      exact: true,
    },
    {
      label: 'Proposals',
      to: '/organizer/proposals',
      icon: 'description',
      badge: pendingProposalsCount > 0 ? pendingProposalsCount : undefined,
    },
    {
      label: 'Events',
      to: '/organizer/events',
      icon: 'event',
    },
    {
      label: 'Registrations',
      to: '/organizer/registrations',
      icon: 'how_to_reg',
      badge: pendingRegistrationsCount > 0 ? pendingRegistrationsCount : undefined,
    },
    {
      label: 'QR Attendance',
      to: '/organizer/attendance',
      icon: 'qr_code_scanner',
    },
    {
      label: 'Refunds & Finance',
      to: '/organizer/refunds',
      icon: 'payments',
    },
    {
      label: 'Club & Members',
      to: '/organizer/members',
      icon: 'groups',
    },
  ];

  return (
    <aside 
      className="w-64 shrink-0 min-h-screen bg-light-surface-container-lowest border-r border-light-outline-variant flex flex-col justify-between"
      aria-label="Organizer navigation sidebar"
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
              Sports Club Officer
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav aria-label="Club organizer workspace" className="flex flex-col gap-xs">
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
              {({ isActive }) => (
                <>
                  <span className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span className="font-label text-label-lg whitespace-nowrap">
                      {item.label}
                    </span>
                  </span>
                  {item.badge !== undefined && (
                    <span
                      role="status"
                      className={`inline-flex items-center justify-center min-w-[20px] h-[20px] px-xs rounded-full font-label text-label-sm tabular-nums ${
                        isActive
                          ? 'bg-light-secondary text-light-on-secondary'
                          : 'bg-light-secondary-container text-light-on-secondary-container'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-lg border-t border-light-outline-variant flex flex-col gap-xs">
        <span className="font-label text-label-sm text-light-on-surface-variant">
          Authorized Organizer
        </span>
        <span className="font-mono text-mono-md text-light-on-surface-variant font-medium">
          {user?.student_id || user?.email || 'Officer ID'}
        </span>
      </div>
    </aside>
  );
};

export default OrganizerSidebar;
