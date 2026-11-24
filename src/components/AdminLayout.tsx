import React from 'react';
import { AdminSidebar } from './AdminSidebar';
import { ResponsiveShell } from './ResponsiveShell';

interface AdminLayoutProps {
  children: React.ReactNode;
  unreadNotifications?: boolean;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  unreadNotifications = true,
}) => (
  <ResponsiveShell sidebar={<AdminSidebar />} unreadNotifications={unreadNotifications}>
    {children}
  </ResponsiveShell>
);

export default AdminLayout;
