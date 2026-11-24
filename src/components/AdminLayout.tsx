import React from 'react';
import { AdminSidebar } from './AdminSidebar';
import { TopBar } from './TopBar';

interface AdminLayoutProps {
  children: React.ReactNode;
  unreadNotifications?: boolean;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  unreadNotifications = true,
}) => {
  return (
    <div className="min-h-screen flex bg-light-surface text-light-on-surface font-body">
      {/* Persistent Admin Sidebar */}
      <AdminSidebar />

      {/* Main Workspace Column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar unreadNotifications={unreadNotifications} />
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
