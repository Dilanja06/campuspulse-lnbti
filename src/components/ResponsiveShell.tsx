import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { TopBar } from './TopBar';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';

interface ResponsiveShellProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  unreadNotifications?: boolean;
  bottomNav?: React.ReactNode;
  footer?: React.ReactNode;
}

export const ResponsiveShell: React.FC<ResponsiveShellProps> = ({
  sidebar,
  children,
  unreadNotifications = true,
  bottomNav,
  footer,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  // Reduce unread notification count automatically when user reviews each section
  useEffect(() => {
    dataService.markNotificationsReadForRoute(location.pathname, user?.id);
  }, [location.pathname, user?.id]);

  return (
    <div className="min-h-screen flex bg-light-surface text-light-on-surface font-body antialiased">
      {/* Desktop Sticky Sidebar */}
      <div className="hidden md:flex shrink-0">{sidebar}</div>

      {/* Mobile Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation drawer"
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            className="relative z-10 w-64 max-w-[85vw] h-full overflow-y-auto bg-light-surface-container-lowest shadow-2xl"
            onClick={() => setMobileMenuOpen(false)}
          >
            {sidebar}
          </div>
        </div>
      )}

      {/* Main Content Column */}
      <div className={`flex-1 min-w-0 flex flex-col min-h-screen ${bottomNav ? 'pb-16 md:pb-0' : ''}`}>
        <TopBar
          unreadNotifications={unreadNotifications}
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        {children}
        {footer}
      </div>

      {bottomNav}
    </div>
  );
};

export default ResponsiveShell;
