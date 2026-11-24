import React from 'react';
import { AuthoritySidebar } from './AuthoritySidebar';
import { TopBar } from './TopBar';

interface AuthorityLayoutProps {
  children: React.ReactNode;
  unreadNotifications?: boolean;
}

export const AuthorityLayout: React.FC<AuthorityLayoutProps> = ({
  children,
  unreadNotifications = true,
}) => {
  return (
    <div className="min-h-screen flex bg-light-surface text-light-on-surface font-body">
      {/* Persistent Authority Sidebar */}
      <AuthoritySidebar />

      {/* Main Workspace Column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar unreadNotifications={unreadNotifications} />
        {children}
      </div>
    </div>
  );
};

export default AuthorityLayout;
