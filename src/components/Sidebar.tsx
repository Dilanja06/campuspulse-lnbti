import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  registrationCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ registrationCount }) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { to: '/home', label: 'Home', icon: 'home' },
    { to: '/events', label: 'Explore Events', icon: 'explore' },
    { to: '/calendar', label: 'Calendar', icon: 'calendar_month' },
    {
      to: '/my-registrations',
      label: 'My Registrations',
      icon: 'confirmation_number',
      badge: registrationCount,
    },
    { to: '/clubs', label: 'Clubs', icon: 'groups' },
    { to: '/payment', label: 'Payments', icon: 'receipt_long' },
    { to: '/refund-status', label: 'Refunds', icon: 'currency_exchange' },
    { to: '/my-badges', label: 'Badges', icon: 'workspace_premium' },
    { to: '/my-profile', label: 'Profile', icon: 'person' },
  ];

  return (
    <aside className="w-64 shrink-0 min-h-screen bg-light-surface-container-lowest border-r border-light-outline-variant flex flex-col justify-between select-none">
      <div className="p-lg flex flex-col gap-xl">
        <NavLink to="/home" className="flex items-center gap-sm no-underline group">
          <div className="w-10 h-10 rounded bg-white border border-light-outline-variant p-1 flex items-center justify-center shrink-0 shadow-xs group-hover:border-light-primary transition-colors">
            <img src="/lnbti-emblem.png" alt="LNBTI Emblem" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-headline text-title-md text-light-on-surface font-bold tracking-tight">
                CampusPulse
              </span>
              <span className="text-[10px] font-bold text-white bg-light-primary px-1 rounded">LNBTI</span>
            </div>
            <span className="font-label text-label-sm text-light-on-surface-variant">Student Portal</span>
          </div>
        </NavLink>

        <nav aria-label="Student workspace" className="flex flex-col gap-xs">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between gap-sm px-md py-sm rounded transition-colors duration-state-change no-underline ${
                  isActive
                    ? 'bg-light-primary text-light-on-primary font-medium shadow-sm'
                    : 'text-light-on-surface-variant hover:bg-light-surface-container-low hover:text-light-on-surface'
                }`
              }
            >
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="font-label text-label-lg whitespace-nowrap">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-xs rounded-full bg-light-secondary-container text-light-on-secondary-container text-label-sm font-mono tabular-nums font-semibold">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-lg border-t border-light-outline-variant flex flex-col gap-sm">
        <div className="flex flex-col gap-xs">
          <span className="font-label text-label-sm text-light-on-surface-variant">Academic Term 2026</span>
          <span className="font-mono text-mono-md text-light-on-surface-variant font-medium">
            {user?.student_id || user?.email || 'Verified Student'}
          </span>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-xs text-label-md text-light-error hover:underline pt-xs text-left border-0 bg-transparent cursor-pointer p-0"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
