import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth, UserRole, getRoleHomeRoute } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, role, switchRole } = useAuth();

  // If user is not logged in, navigate to /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is defined and current role is not in allowedRoles
  if (allowedRoles && !allowedRoles.includes(role)) {
    const primaryAllowed = allowedRoles[0];

    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-md md:p-xl bg-light-surface gap-lg text-center font-body">
        <div className="w-16 h-16 rounded-full bg-light-error-container text-light-error flex items-center justify-center">
          <span className="material-symbols-outlined text-[36px]" aria-hidden="true">
            lock
          </span>
        </div>

        <div className="flex flex-col gap-xs max-w-[480px]">
          <h1 className="font-headline text-headline-md text-light-on-surface font-bold">
            Role Permission Required
          </h1>
          <p className="font-body text-body-md text-light-on-surface-variant">
            You are currently signed in as <strong className="text-light-on-surface capitalize">{user.role}</strong> ({user.name}).
            This section requires <strong>{allowedRoles.map((r) => r.toUpperCase()).join(' or ')}</strong> clearance.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-sm pt-sm">
          <Link
            to={getRoleHomeRoute(role)}
            className="px-md py-sm rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold no-underline hover:bg-light-primary-container transition-colors"
          >
            Go to My {role.toUpperCase()} Workspace
          </Link>
          <button
            onClick={() => switchRole(primaryAllowed)}
            className="px-md py-sm rounded bg-light-surface-container-lowest text-light-primary border border-light-outline-variant font-label text-label-md font-semibold hover:bg-light-surface-container-low transition-colors cursor-pointer"
          >
            Switch to {primaryAllowed.toUpperCase()} Role
          </button>
        </div>
      </main>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
