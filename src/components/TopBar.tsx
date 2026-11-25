import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getActiveCommitteeMember } from '../data/mockData';
import { useAuth, UserRole, getRoleHomeRoute } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { dataService } from '../services/dataService';
import { DatabaseStatusBadge } from './DatabaseStatusBadge';

interface TopBarProps {
  unreadNotifications?: boolean;
  onMenuClick?: () => void;
}

const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Student Workspace',
  organizer: 'Sports Club Officer',
  committee: 'Club Committee (5 Seats)',
  coordinator: 'Lecturer Coordinator',
  authority: 'University Authority',
  verification: 'External Verification Staff',
  admin: 'Central Administrator',
};

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, signOut, switchRole } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let active = true;
    const loadUnread = async () => {
      try {
        const items = await dataService.getNotifications(user?.id);
        if (active) {
          setUnreadCount(items.filter((n) => !n.read).length);
        }
      } catch (err) {
        console.warn('TopBar notification count error:', err);
      }
    };
    loadUnread();
    const unsub = dataService.subscribe(loadUnread);
    return () => {
      active = false;
      unsub();
    };
  }, [user?.id, location.pathname]);

  const isCommittee = location.pathname.startsWith('/committee');
  const isStaffWorkspace =
    location.pathname.startsWith('/authority') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/coordinator') ||
    location.pathname.startsWith('/verification');

  const committeeMember = getActiveCommitteeMember();
  const availableRoles: UserRole[] = user?.available_roles || [role];
  const canSwitchWorkspace = availableRoles.length > 1;

  const handleWorkspaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextRole = e.target.value as UserRole;
    if (switchRole(nextRole)) {
      navigate(getRoleHomeRoute(nextRole));
    }
  };

  const userInitial = isCommittee ? committeeMember.avatar_initials : user?.avatar_initials || 'ST';
  const userName = isCommittee ? committeeMember.name : user?.name || 'Campus User';
  const userSubtitle = isCommittee
    ? `${committeeMember.club_name} · ${committeeMember.role}`
    : role === 'organizer'
    ? user?.club_name || 'Sports Club Officer'
    : user?.staff_id || user?.student_id || ROLE_LABELS[role];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-light-surface-container-lowest border-b border-light-outline-variant px-md md:px-xl flex items-center justify-between gap-sm md:gap-md sticky top-0 z-20">
      {/* Left: Mobile Menu Button + Brand Logo + Authorized Role Context */}
      <div className="flex items-center gap-sm md:gap-md min-w-0">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded bg-light-surface-container-low border border-light-outline-variant text-light-on-surface cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>
        )}

        <Link to={getRoleHomeRoute(role)} className="flex items-center gap-xs no-underline group shrink-0">
          <div className="w-8 h-8 rounded bg-white border border-light-outline-variant p-0.5 flex items-center justify-center shrink-0 shadow-xs group-hover:border-light-primary transition-colors">
            <img src="/lnbti-emblem.png" alt="LNBTI Emblem" className="w-full h-full object-contain" />
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="font-headline text-title-sm font-bold text-light-on-surface leading-tight">
              LNBTI
            </span>
            <span className="text-[10px] text-light-primary font-semibold leading-none">
              CampusPulse
            </span>
          </div>
        </Link>

        <span className="text-light-outline-variant hidden md:inline">|</span>

        {canSwitchWorkspace ? (
          <div className="inline-flex items-center gap-xs bg-light-surface-container-low border border-light-outline-variant rounded px-sm py-xs min-w-0">
            <span className="material-symbols-outlined text-[18px] text-light-primary shrink-0" aria-hidden="true">
              swap_horiz
            </span>
            <label htmlFor="workspace-selector" className="sr-only">
              Authorized workspace selector
            </label>
            <select
              id="workspace-selector"
              aria-label="Authorized workspace selector"
              value={role}
              onChange={handleWorkspaceChange}
              className="bg-transparent border-0 p-0 pr-md font-label text-label-md text-light-on-surface focus:ring-0 cursor-pointer outline-none truncate"
            >
              {availableRoles.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="inline-flex items-center gap-xs bg-light-surface-container-low border border-light-outline-variant rounded px-sm py-xs min-w-0">
            <span className="material-symbols-outlined text-[16px] text-light-primary shrink-0" aria-hidden="true">
              verified_user
            </span>
            <span className="font-label text-label-md text-light-on-surface font-medium truncate">
              {ROLE_LABELS[role]}
            </span>
          </div>
        )}

        {user?.is_demo_session && (
          <span className="hidden xl:inline-flex items-center px-sm py-0.5 rounded-full bg-warning-container text-on-warning-container text-[11px] font-mono font-bold">
            SANDBOX
          </span>
        )}
      </div>

      {/* Right Controls: Database Health, Notifications, User Avatar, Theme Toggle & Sign Out */}
      <div className="flex items-center gap-xs sm:gap-md shrink-0">
        <DatabaseStatusBadge />

        <Link
          to="/notifications"
          aria-label={unreadCount > 0 ? `Open notifications (${unreadCount} unread)` : 'Open notifications'}
          className="relative inline-flex items-center justify-center w-[40px] h-[40px] rounded bg-light-surface-container-lowest text-light-on-surface-variant border border-light-outline-variant hover:bg-light-surface-container-low hover:text-light-on-surface transition-colors duration-state-change no-underline"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            notifications
          </span>
          {unreadCount > 0 && (
            <span
              role="status"
              aria-label={`${unreadCount} unread notifications`}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-light-error text-white text-[10px] font-mono font-bold flex items-center justify-center ring-2 ring-light-surface-container-lowest tabular-nums"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Profile Chip */}
        <button
          type="button"
          onClick={() => (!isStaffWorkspace ? navigate('/my-profile') : null)}
          className={`flex items-center gap-sm pl-sm border-l border-light-outline-variant text-left bg-transparent border-0 p-0 ${
            !isStaffWorkspace ? 'cursor-pointer group' : 'cursor-default'
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-light-primary-container text-light-on-primary-container flex items-center justify-center font-label text-label-md font-bold shadow-sm">
            {userInitial}
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-label text-label-md text-light-on-surface font-semibold">
              {userName}
            </span>
            <span className="font-label text-label-sm text-light-on-surface-variant">
              {userSubtitle}
            </span>
          </div>
        </button>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="inline-flex items-center justify-center w-[36px] h-[36px] rounded bg-light-surface-container-lowest text-light-on-surface-variant border border-light-outline-variant hover:bg-light-surface-container-low hover:text-light-on-surface transition-colors duration-state-change cursor-pointer shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* Sign Out */}
        <button
          type="button"
          onClick={handleSignOut}
          title="Sign out of CampusPulse"
          aria-label="Sign out"
          className="inline-flex items-center justify-center w-[36px] h-[36px] rounded bg-light-surface-container-lowest text-light-on-surface-variant border border-light-outline-variant hover:bg-light-error-container hover:text-light-error transition-colors duration-state-change cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            logout
          </span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
