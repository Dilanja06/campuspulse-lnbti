import React from 'react';
import { CommitteeSidebar } from './CommitteeSidebar';
import { TopBar } from './TopBar';

interface CommitteeLayoutProps {
  children: React.ReactNode;
  unreadNotifications?: boolean;
  onRoleChanged?: () => void;
}

export const CommitteeLayout: React.FC<CommitteeLayoutProps> = ({
  children,
  unreadNotifications = true,
  onRoleChanged,
}) => {
  return (
    <div className="min-h-screen flex bg-light-surface text-light-on-surface font-body">
      {/* Persistent Committee Sidebar */}
      <CommitteeSidebar onRoleChanged={onRoleChanged} />

      {/* Main Workspace Column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar unreadNotifications={unreadNotifications} />
        {children}
      </div>
    </div>
  );
};

export default CommitteeLayout;
