import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth, getRoleHomeRoute, UserRole } from '../context/AuthContext';

export const AccountVerification: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, resendVerification, refreshVerificationStatus } = useAuth();
  const state = location.state as any;

  const fullName = state?.fullName || user?.name || 'Student Member';
  const identifier = state?.identifier || user?.student_id || user?.staff_id || 'Pending Roster Match';
  const email = state?.email || user?.email || '';
  const role: UserRole = user?.role || 'student';
  const isVerified = user?.email_verified ?? false;

  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  const destination = getRoleHomeRoute(role);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setFeedback(null);
    const res = await resendVerification(email);
    setResending(false);
    if (res.success) {
      setFeedback({ type: 'success', text: `Verification email re-sent to ${email}. Check your campus inbox.` });
    } else {
      setFeedback({ type: 'error', text: res.error || 'Could not resend verification email.' });
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    setFeedback(null);
    const verifiedNow = await refreshVerificationStatus();
    setChecking(false);
    if (verifiedNow) {
      setFeedback({ type: 'success', text: 'Email confirmation verified! You can now enter your workspace.' });
    } else {
      setFeedback({
        type: 'info',
        text: 'Verification link has not been confirmed yet. Please open the confirmation link sent to your email.',
      });
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-md md:p-xl bg-light-surface gap-xl font-body">
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
            {isVerified ? 'LNBTI VERIFIED' : 'VERIFICATION'}
          </span>
        </div>
      </div>

      <section className="w-full max-w-[480px] bg-light-surface-container-lowest border border-light-outline-variant rounded-lg p-xl flex flex-col gap-lg shadow-sm text-center">
        <div className="flex flex-col items-center gap-sm">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isVerified ? 'bg-success-container text-success' : 'bg-warning-container text-warning'
            }`}
          >
            <span className="material-symbols-outlined text-[36px]">
              {isVerified ? 'check_circle' : 'mark_email_unread'}
            </span>
          </div>
          <span
            className={`inline-flex items-center px-sm py-xs rounded-full text-label-sm font-label font-semibold ${
              isVerified ? 'bg-success-container text-success' : 'bg-warning-container text-on-warning-container'
            }`}
          >
            {isVerified ? `Account Activated · ${role.toUpperCase()}` : 'Verification Pending'}
          </span>
          <h1 className="font-headline text-headline-md text-light-on-surface font-bold mt-xs">
            {isVerified ? `Welcome, ${fullName.split(' ')[0]}!` : 'Verify Your Campus Email'}
          </h1>
          <p className="font-body text-body-md text-light-on-surface-variant">
            {isVerified
              ? 'Your campus email and academic identity are active.'
              : `A verification link has been sent to ${email || 'your campus email'}. Click the link to activate full portal access.`}
          </p>
        </div>

        {feedback && (
          <div
            role="status"
            className={`p-sm rounded text-body-md text-left ${
              feedback.type === 'success'
                ? 'bg-success-container text-on-success-container'
                : feedback.type === 'error'
                ? 'bg-light-error-container text-light-on-error-container'
                : 'bg-info-container text-on-info-container'
            }`}
          >
            {feedback.text}
          </div>
        )}

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
            <span className="font-body text-body-md text-light-on-surface">{email || '—'}</span>
          </div>
        </div>

        {isVerified ? (
          <button
            type="button"
            onClick={() => navigate(destination)}
            className="w-full inline-flex items-center justify-center px-md py-sm min-h-[44px] rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container transition-colors duration-state-change font-label text-label-lg font-semibold cursor-pointer border-0 shadow-sm"
          >
            Continue to {role.toUpperCase()} Workspace
          </button>
        ) : (
          <div className="flex flex-col gap-sm">
            <button
              type="button"
              onClick={handleCheckStatus}
              disabled={checking}
              className="w-full inline-flex items-center justify-center px-md py-sm min-h-[44px] rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container transition-colors duration-state-change font-label text-label-lg font-semibold cursor-pointer border-0 shadow-sm disabled:opacity-50"
            >
              {checking ? 'Checking Verification...' : "I've Verified My Email · Check Status"}
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || !email}
              className="w-full inline-flex items-center justify-center px-md py-sm rounded bg-light-surface-container-low text-light-primary border border-light-outline-variant hover:bg-light-surface-container transition-colors font-label text-label-md font-semibold cursor-pointer disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </div>
        )}

        <div className="text-center pt-xs">
          <Link to="/login" className="font-label text-label-sm text-light-primary hover:underline">
            &larr; Back to Sign In
          </Link>
        </div>
      </section>
    </main>
  );
};

export default AccountVerification;
