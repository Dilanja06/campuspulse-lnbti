import React from 'react';
import { OrganizerSidebar } from './OrganizerSidebar';
import { ResponsiveShell } from './ResponsiveShell';

interface OrganizerLayoutProps {
  children: React.ReactNode;
  unreadNotifications?: boolean;
}

export const OrganizerLayout: React.FC<OrganizerLayoutProps> = ({
  children,
  unreadNotifications = true,
}) => (
  <ResponsiveShell sidebar={<OrganizerSidebar />} unreadNotifications={unreadNotifications}>
    {children}
  </ResponsiveShell>
);

export default OrganizerLayout;
