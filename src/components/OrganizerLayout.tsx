import React from 'react';
import { OrganizerSidebar } from './OrganizerSidebar';
import { TopBar } from './TopBar';

interface OrganizerLayoutProps {
  children: React.ReactNode;
  unreadNotifications?: boolean;
}

export const OrganizerLayout: React.FC<OrganizerLayoutProps> = ({
  children,
  unreadNotifications = true,
}) => {
  return (
    <div className="min-h-screen flex bg-light-surface text-light-on-surface font-body">
      {/* Persistent Organizer Sidebar */}
      <OrganizerSidebar />

      {/* Main Workspace Column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar unreadNotifications={unreadNotifications} />
        {children}
      </div>
    </div>
  );
};

export default OrganizerLayout;
