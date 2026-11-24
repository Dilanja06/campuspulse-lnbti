import React from 'react';
import { CommitteeSidebar } from './CommitteeSidebar';
import { ResponsiveShell } from './ResponsiveShell';

interface CommitteeLayoutProps {
  children: React.ReactNode;
  unreadNotifications?: boolean;
  onRoleChanged?: () => void;
}

export const CommitteeLayout: React.FC<CommitteeLayoutProps> = ({
  children,
  unreadNotifications = true,
  onRoleChanged,
}) => (
  <ResponsiveShell
    sidebar={<CommitteeSidebar onRoleChanged={onRoleChanged} />}
    unreadNotifications={unreadNotifications}
  >
    {children}
  </ResponsiveShell>
);

export default CommitteeLayout;
