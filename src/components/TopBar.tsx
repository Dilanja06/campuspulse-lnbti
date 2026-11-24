import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  currentUser, 
  currentCoordinator, 
  currentAdmin, 
  currentAuthority,
  getActiveCommitteeMember 
} from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface TopBarProps {
  unreadNotifications?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ unreadNotifications = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, switchRole } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const isCommittee = location.pathname.startsWith('/committee');
  const isAuthority = location.pathname.startsWith('/authority');
  const isAdmin = location.pathname.startsWith('/admin');
  const isCoordinator = location.pathname.startsWith('/coordinator');
  const isOrganizer = location.pathname.startsWith('/organizer');

  const committeeMember = getActiveCommitteeMember();

  const currentWorkspaceValue = isCommittee
    ? 'Club Committee'
    : isAuthority
    ? 'University Authority'
    : isAdmin
    ? 'Central Administrator'
    : isCoordinator
    ? 'Lecturer Coordinator'
    : isOrganizer
    ? 'Sports Club Officer'
    : 'Student Workspace';

  const handleWorkspaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'Club Committee') {
      switchRole('committee');
      navigate('/committee');
    } else if (val === 'University Authority') {
      switchRole('authority');
      navigate('/authority');
    } else if (val === 'Central Administrator') {
      switchRole('admin');
      navigate('/admin');
    } else if (val === 'Lecturer Coordinator') {
      switchRole('coordinator');
      navigate('/coordinator');
    } else if (val === 'Sports Club Officer') {
      switchRole('organizer');
      navigate('/organizer');
    } else if (val === 'Student Workspace') {
      switchRole('student');
      navigate('/home');
    }
  };

  const userInitial = isCommittee
    ? committeeMember.avatar_initials
    : isAuthority
    ? currentAuthority.avatar_initials
    : isAdmin
    ? currentAdmin.avatar_initials
    : isCoordinator
    ? currentCoordinator.avatar_initials
    : (user?.avatar_initials || currentUser.avatar_initials);

  const userName = isCommittee
    ? committeeMember.name
    : isAuthority
    ? currentAuthority.name
    : isAdmin
    ? currentAdmin.name
    : isCoordinator
    ? currentCoordinator.name
    : (user?.name || currentUser.name);

  const userSubtitle = isCommittee
    ? `${committeeMember.club_name} ${committeeMember.role}`
    : isAuthority
    ? currentAuthority.role
    : isAdmin
    ? currentAdmin.role
    : isCoordinator
    ? currentCoordinator.role
    : isOrganizer
    ? 'Sports Club Secretary'
    : (user?.student_id || currentUser.degree);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-light-surface-container-lowest border-b border-light-outline-variant px-xl flex items-center justify-between gap-md sticky top-0 z-20">
      {/* Brand Logo & Workspace Selector */}
      <div className="flex items-center gap-md">
        <Link to="/home" className="flex items-center gap-xs no-underline group">
          <div className="w-8 h-8 rounded bg-white border border-light-outline-variant p-0.5 flex items-center justify-center shrink-0 shadow-xs group-hover:border-light-primary transition-colors">
            <img src="/lnbti-emblem.png" alt="LNBTI Emblem" className="w-full h-full object-contain" />
          </div>
          <div className="hidden md:flex flex-col">
            <span className="font-headline text-title-sm font-bold text-light-on-surface leading-tight">
              LNBTI
            </span>
            <span className="text-[10px] text-light-primary font-semibold leading-none">
              CampusPulse
            </span>
          </div>
        </Link>
        <span className="text-light-outline-variant hidden md:inline">|</span>
        <label htmlFor="workspace-selector" className="sr-only">Workspace selector</label>
        <div className="inline-flex items-center gap-xs bg-light-surface-container-low border border-light-outline-variant rounded px-sm py-xs">
          <span className="material-symbols-outlined text-[18px] text-light-primary" aria-hidden="true">
            swap_horiz
          </span>
          <select 
            id="workspace-selector"
            aria-label="Workspace selector"
            value={currentWorkspaceValue}
            onChange={handleWorkspaceChange}
            className="bg-transparent border-0 p-0 pr-md font-label text-label-md text-light-on-surface focus:ring-0 cursor-pointer outline-none"
          >
            <option value="Student Workspace">Student Workspace</option>
            <option value="Sports Club Officer">Sports Club Officer</option>
            <option value="Club Committee">Club Committee (5 Seats)</option>
            <option value="Lecturer Coordinator">Lecturer Coordinator</option>
            <option value="University Authority">University Authority</option>
            <option value="Central Administrator">Central Administrator</option>
          </select>
        </div>
      </div>

      {/* Right Controls: Notifications, User Avatar & Sign Out */}
      <div className="flex items-center gap-md">
        <Link
          to="/notifications"
          aria-label="Open notifications"
          className="relative inline-flex items-center justify-center w-[40px] h-[40px] rounded bg-light-surface-container-lowest text-light-on-surface-variant border border-light-outline-variant hover:bg-light-surface-container-low hover:text-light-on-surface transition-colors duration-state-change no-underline"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            notifications
          </span>
          {unreadNotifications && (
            <span
              role="status"
              aria-label="Unread notifications"
              className="absolute top-2 right-2 w-[8px] h-[8px] rounded-full bg-light-secondary ring-2 ring-light-surface-container-lowest"
            />
          )}
        </Link>

        {/* Profile Chip */}
        <button
          onClick={() => (!isAuthority && !isAdmin && !isCoordinator ? navigate('/my-profile') : null)}
          className={`flex items-center gap-sm pl-sm border-l border-light-outline-variant text-left bg-transparent border-0 p-0 ${
            !isAuthority && !isAdmin && !isCoordinator ? 'cursor-pointer group' : 'cursor-default'
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

        {/* Theme Toggle (Light / Dark) */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="inline-flex items-center justify-center w-[36px] h-[36px] rounded bg-light-surface-container-lowest text-light-on-surface-variant border border-light-outline-variant hover:bg-light-surface-container-low hover:text-light-on-surface transition-colors duration-state-change cursor-pointer shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* Sign Out Button */}
        <button
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
