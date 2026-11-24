import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface AppLayoutProps {
  children: React.ReactNode;
  registrationCount?: number;
  unreadNotifications?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  registrationCount = 5,
  unreadNotifications = true
}) => {
  return (
    <div className="min-h-screen flex bg-light-surface text-light-on-surface font-body antialiased">
      {/* Persistent Left Sidebar */}
      <Sidebar registrationCount={registrationCount} />

      {/* Main Workspace Column */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <TopBar unreadNotifications={unreadNotifications} />

        <main className="flex-1 p-md md:p-xl max-w-[1280px] w-full mx-auto flex flex-col gap-xl">
          {children}
        </main>

        <footer className="border-t border-light-outline-variant bg-light-surface-container-lowest px-xl py-md text-center text-label-sm text-light-on-surface-variant">
          <span>&copy; 2026 CampusPulse · Lanka Nippon BizTech Institute (LNBTI) · Japanese IT University</span>
        </footer>
      </div>
    </div>
  );
};

export default AppLayout;
