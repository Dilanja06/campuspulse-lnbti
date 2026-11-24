import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { currentCoordinator } from '../data/mockData';
import { dataService } from '../services/dataService';

export const CoordinatorSidebar: React.FC = () => {
  const [pendingReviewCount, setPendingReviewCount] = useState(3);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const proposals = await dataService.getProposals();
        const pending = proposals.filter((p) => p.status === 'Pending Review' || p.status === 'Higher Authority' || p.stage === 2).length;
        setPendingReviewCount(pending || 3);
      } catch (err) {
        console.warn('CoordinatorSidebar count error:', err);
      }
    };
    fetchCounts();
  }, []);

  const navItems = [
    {
      label: 'Dashboard',
      to: '/coordinator',
      icon: 'dashboard',
      exact: true,
    },
    {
      label: 'Review Queue',
      to: '/coordinator/proposals',
      icon: 'rate_review',
      badge: pendingReviewCount > 0 ? pendingReviewCount : undefined,
    },
    {
      label: 'Assigned Clubs',
      to: '/coordinator/clubs',
      icon: 'diversity_3',
    },
  ];

  return (
    <aside 
      className="w-64 shrink-0 min-h-screen bg-light-surface-container-lowest border-r border-light-outline-variant flex flex-col justify-between"
      aria-label="Coordinator navigation sidebar"
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
              Lecturer Coordinator
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav aria-label="Lecturer coordinator workspace" className="flex flex-col gap-xs">
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
          Assigned Coordinator
        </span>
        <span className="font-mono text-mono-md text-light-on-surface-variant font-medium">
          {currentCoordinator.faculty_id}
        </span>
      </div>
    </aside>
  );
};

export default CoordinatorSidebar;
