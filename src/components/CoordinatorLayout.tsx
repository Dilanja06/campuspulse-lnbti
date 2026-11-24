import React from 'react';
import { CoordinatorSidebar } from './CoordinatorSidebar';
import { ResponsiveShell } from './ResponsiveShell';

interface CoordinatorLayoutProps {
  children: React.ReactNode;
  unreadNotifications?: boolean;
}

export const CoordinatorLayout: React.FC<CoordinatorLayoutProps> = ({
  children,
  unreadNotifications = true,
}) => (
  <ResponsiveShell sidebar={<CoordinatorSidebar />} unreadNotifications={unreadNotifications}>
    {children}
  </ResponsiveShell>
);

export default CoordinatorLayout;
