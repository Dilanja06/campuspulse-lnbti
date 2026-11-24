import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth, getRoleHomeRoute, UserRole } from '../context/AuthContext';

export const AccountVerification: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const state = location.state as any;

  const fullName = state?.fullName || user?.name || 'Nethmi Perera';
  const identifier = state?.identifier || user?.student_id || user?.staff_id || 'UG/2024/CS/0142';
  const email = state?.email || user?.email || 'nethmi.p@university.edu';
  const role: UserRole = state?.role || user?.role || 'student';

  const destination = getRoleHomeRoute(role);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-md md:p-xl bg-light-surface gap-xl font-body">
      {/* Brand Mark with LNBTI Logo */}
      <div className="flex flex-col items-center gap-xs text-center">
        <div className="bg-white px-md py-sm rounded-lg border border-light-outline-variant shadow-sm inline-flex items-center justify-center">
          <img
            src="/lnbti-logo.png"
            alt="LNBTI - Lanka Nippon BizTech Institute"
            className="h-12 max-w-[260px] object-contain"
          />
        </div>
        <div className="flex items-center gap-xs mt-xs">
          <span className="font-headline text-title-lg text-light-on-surface font-bold tracking-tight">
            CampusPulse
          </span>
          <span className="text-[11px] font-bold text-white bg-light-primary px-1.5 py-0.5 rounded tracking-wide">
            LNBTI VERIFIED
          </span>
        </div>
      </div>

      {/* Verification Card */}
      <section className="w-full max-w-[480px] bg-light-surface-container-lowest border border-light-outline-variant rounded-lg p-xl flex flex-col gap-lg shadow-sm text-center">
        <div className="flex flex-col items-center gap-sm">
          <div className="w-16 h-16 rounded-full bg-success-container text-success flex items-center justify-center">
            <span className="material-symbols-outlined text-[36px]">check_circle</span>
          </div>
          <span className="inline-flex items-center px-sm py-xs rounded-full bg-success-container text-success text-label-sm font-label font-semibold">
            Account Activated · {role.toUpperCase()}
          </span>
          <h1 className="font-headline text-headline-md text-light-on-surface font-bold mt-xs">
            Welcome to CampusPulse, {fullName.split(' ')[0]}!
          </h1>
          <p className="font-body text-body-md text-light-on-surface-variant">
            Your university identity has been verified against the official academic roster.
          </p>
        </div>

        {/* Info panel */}
        <div className="bg-light-surface-container-low rounded-md p-lg text-left flex flex-col gap-sm border border-light-outline-variant">
          <div className="flex justify-between items-center py-xs border-b border-light-outline-variant/50">
            <span className="font-label text-label-sm text-light-on-surface-variant">Name</span>
            <span className="font-title text-title-md text-light-on-surface font-semibold">{fullName}</span>
          </div>
          <div className="flex justify-between items-center py-xs border-b border-light-outline-variant/50">
            <span className="font-label text-label-sm text-light-on-surface-variant">Identifier</span>
            <span className="font-mono text-mono-md text-light-on-surface font-medium">{identifier}</span>
          </div>
          <div className="flex justify-between items-center py-xs border-b border-light-outline-variant/50">
            <span className="font-label text-label-sm text-light-on-surface-variant">Assigned Role</span>
            <span className="font-label text-label-sm text-light-primary font-semibold uppercase">{role}</span>
          </div>
          <div className="flex justify-between items-center py-xs">
            <span className="font-label text-label-sm text-light-on-surface-variant">Campus Email</span>
            <span className="font-body text-body-md text-light-on-surface">{email}</span>
          </div>
        </div>

        <button
          onClick={() => navigate(destination)}
          className="w-full inline-flex items-center justify-center px-md py-sm min-h-[44px] rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container transition-colors duration-state-change font-label text-label-lg font-semibold cursor-pointer border-0 shadow-sm"
        >
          Continue to {role.toUpperCase()} Workspace
        </button>

        <div className="text-center pt-xs">
          <Link to={destination} className="font-label text-label-sm text-light-primary hover:underline">
            Go to workspace directly &rarr;
          </Link>
        </div>
      </section>
    </main>
  );
};

export default AccountVerification;
