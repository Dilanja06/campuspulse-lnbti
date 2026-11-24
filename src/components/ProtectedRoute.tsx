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
  const { user, role, signOut } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Strict RBAC enforcement: never render an escalation button to switch into disallowed roles
  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-md md:p-xl bg-light-surface gap-lg text-center font-body">
        <div className="w-16 h-16 rounded-full bg-light-error-container text-light-error flex items-center justify-center">
          <span className="material-symbols-outlined text-[36px]" aria-hidden="true">
            lock
          </span>
        </div>

        <div className="flex flex-col gap-xs max-w-[480px]">
          <h1 className="font-headline text-headline-md text-light-on-surface font-bold">
            Access Restricted
          </h1>
          <p className="font-body text-body-md text-light-on-surface-variant">
            You are signed in as <strong className="text-light-on-surface capitalize">{role}</strong> ({user.name}).
            This workspace requires <strong>{allowedRoles.map((r) => r.toUpperCase()).join(' or ')}</strong> authorization.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-sm pt-sm">
          <Link
            to={getRoleHomeRoute(role)}
            className="px-md py-sm rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold no-underline hover:bg-light-primary-container transition-colors"
          >
            Return to My {role.toUpperCase()} Workspace
          </Link>
          <button
            type="button"
            onClick={() => signOut()}
            className="px-md py-sm rounded bg-light-surface-container-lowest text-light-on-surface border border-light-outline-variant font-label text-label-md font-semibold hover:bg-light-surface-container-low transition-colors cursor-pointer"
          >
            Sign In with Another Account
          </button>
        </div>
      </main>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
