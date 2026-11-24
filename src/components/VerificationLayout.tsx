import React from 'react';
import { VerificationSidebar } from './VerificationSidebar';
import { ResponsiveShell } from './ResponsiveShell';

interface VerificationLayoutProps {
  children: React.ReactNode;
  unreadNotifications?: boolean;
}

export const VerificationLayout: React.FC<VerificationLayoutProps> = ({
  children,
  unreadNotifications = true,
}) => (
  <ResponsiveShell sidebar={<VerificationSidebar />} unreadNotifications={unreadNotifications}>
    {children}
  </ResponsiveShell>
);

export default VerificationLayout;
