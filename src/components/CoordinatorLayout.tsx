import React from 'react';
import { CoordinatorSidebar } from './CoordinatorSidebar';
import { TopBar } from './TopBar';

interface CoordinatorLayoutProps {
  children: React.ReactNode;
  unreadNotifications?: boolean;
}

export const CoordinatorLayout: React.FC<CoordinatorLayoutProps> = ({
  children,
  unreadNotifications = true,
}) => {
  return (
    <div className="min-h-screen flex bg-light-surface text-light-on-surface font-body">
      {/* Persistent Coordinator Sidebar */}
      <CoordinatorSidebar />

      {/* Main Workspace Column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar unreadNotifications={unreadNotifications} />
        {children}
      </div>
    </div>
  );
};

export default CoordinatorLayout;
