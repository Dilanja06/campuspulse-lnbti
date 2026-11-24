import React from 'react';
import { AuthoritySidebar } from './AuthoritySidebar';
import { ResponsiveShell } from './ResponsiveShell';

interface AuthorityLayoutProps {
  children: React.ReactNode;
  unreadNotifications?: boolean;
}

export const AuthorityLayout: React.FC<AuthorityLayoutProps> = ({
  children,
  unreadNotifications = true,
}) => (
  <ResponsiveShell sidebar={<AuthoritySidebar />} unreadNotifications={unreadNotifications}>
    {children}
  </ResponsiveShell>
);

export default AuthorityLayout;
