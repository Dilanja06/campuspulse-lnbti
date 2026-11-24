import React from 'react';
import { Sidebar } from './Sidebar';
import { ResponsiveShell } from './ResponsiveShell';
import { MobileBottomNav } from './MobileBottomNav';

interface AppLayoutProps {
  children: React.ReactNode;
  registrationCount?: number;
  unreadNotifications?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  registrationCount,
  unreadNotifications = true,
}) => {
  return (
    <ResponsiveShell
      sidebar={<Sidebar registrationCount={registrationCount} />}
      unreadNotifications={unreadNotifications}
      bottomNav={<MobileBottomNav />}
      footer={
        <footer className="border-t border-light-outline-variant bg-light-surface-container-lowest px-xl py-md text-center text-label-sm text-light-on-surface-variant">
          <span>
            &copy; 2026 CampusPulse · Lanka Nippon BizTech Institute (LNBTI) · Japanese IT University
          </span>
        </footer>
      }
    >
      <main className="flex-1 p-md md:p-xl max-w-[1280px] w-full mx-auto flex flex-col gap-xl">
        {children}
      </main>
    </ResponsiveShell>
  );
};

export default AppLayout;
