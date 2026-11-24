import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, UserRole, getRoleHomeRoute, isDemoModeEnabled } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { DatabaseStatusBadge } from '../components/DatabaseStatusBadge';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const navigate = useNavigate();
  const { signIn, signInDemoPreset, resetPassword } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await signIn(email, password);
      if (res.success) {
        navigate(getRoleHomeRoute(res.role));
      } else {
        setErrorMsg(res.error || 'Invalid email or password.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword('password123');
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await signInDemoPreset(presetEmail);
      if (res.success) {
        navigate(getRoleHomeRoute(res.role));
      } else {
        setErrorMsg(res.error || 'Demo sign-in unavailable.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus(null);
    const res = await resetPassword(resetEmail || email);
    if (res.success) {
      setResetStatus({
        type: 'success',
        text: `Password reset instructions dispatched to ${(resetEmail || email).trim()}.`,
      });
    } else {
      setResetStatus({
        type: 'error',
        text: res.error || 'Could not dispatch reset instructions.',
      });
    }
  };

  const quickRoles: Array<{ label: string; email: string; role: UserRole; icon: string }> = [
    { label: 'Student', email: 'nethmi.p@university.edu', role: 'student', icon: 'person' },
    { label: 'Club Officer', email: 'organizer@university.edu', role: 'organizer', icon: 'sports_score' },
    { label: 'Committee (Treasurer)', email: 'chamod.p@university.edu', role: 'committee', icon: 'fact_check' },
    { label: 'Lecturer Coordinator', email: 'kavinda.s@university.edu', role: 'coordinator', icon: 'co_present' },
    { label: 'University Authority', email: 'maheshika.p@university.edu', role: 'authority', icon: 'verified_user' },
    { label: 'Verification Staff', email: 'rohan.v@university.edu', role: 'verification', icon: 'task_alt' },
    { label: 'Central Admin', email: 'amila.d@university.edu', role: 'admin', icon: 'admin_panel_settings' },
  ];

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-md md:p-xl bg-light-surface gap-lg font-body">
      <div className="absolute top-md right-md flex items-center gap-sm">
        <DatabaseStatusBadge />
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="inline-flex items-center justify-center w-[40px] h-[40px] rounded-full bg-light-surface-container-lowest text-light-on-surface-variant border border-light-outline-variant hover:bg-light-surface-container-low transition-colors shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
      </div>

      {/* Brand Mark */}
      <div className="flex flex-col items-center gap-xs text-center mt-xl sm:mt-0">
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
            LNBTI PORTAL
          </span>
        </div>
        <span className="font-label text-label-sm text-light-on-surface-variant">
          Japanese IT University · Club &amp; Event Governance
        </span>
      </div>

      {/* Centered Auth Card */}
      <section className="w-full max-w-[480px] bg-light-surface-container-lowest border border-light-outline-variant rounded-lg p-xl flex flex-col gap-lg shadow-sm">
        <div className="flex flex-col gap-xs">
          <h1 className="font-headline text-headline-md text-light-on-surface font-bold">
            Sign in to CampusPulse
          </h1>
          <p className="font-body text-body-md text-light-on-surface-variant">
            Authenticate with your university credentials to access your assigned workspace.
          </p>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="bg-light-error-container text-light-on-error-container p-sm rounded text-body-md border border-light-error/30 flex items-center gap-xs"
          >
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-md">
          <label className="flex flex-col gap-xs">
            <span className="font-label text-label-md text-light-on-surface font-medium">
              Campus email
            </span>
            <div className="relative flex items-center">
              <span
                className="material-symbols-outlined text-[20px] text-light-outline absolute left-md pointer-events-none"
                aria-hidden="true"
              >
                mail
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                inputMode="email"
                required
                className="w-full rounded border border-light-outline-variant bg-light-surface-container-lowest pl-2xl pr-md py-sm font-body text-body-md text-light-on-surface focus:border-light-primary focus:ring-1 focus:ring-light-primary outline-none transition-all"
                placeholder="name@university.edu"
              />
            </div>
          </label>

          <div className="flex flex-col gap-xs">
            <div className="flex items-center justify-between gap-sm">
              <label
                htmlFor="login-password"
                className="font-label text-label-md text-light-on-surface font-medium"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setResetStatus(null);
                  setShowForgotModal((prev) => !prev);
                }}
                className="font-label text-label-sm text-light-primary hover:underline bg-transparent border-0 cursor-pointer p-0"
              >
                Forgot password?
              </button>
            </div>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded border border-light-outline-variant bg-light-surface-container-lowest px-md py-sm font-body text-body-md text-light-on-surface focus:border-light-primary focus:ring-1 focus:ring-light-primary outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <label className="flex items-center gap-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-light-outline text-light-primary"
            />
            <span className="font-label text-label-sm text-light-on-surface-variant">
              Keep me signed in on this trusted browser
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center px-md py-sm min-h-[44px] rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container transition-colors duration-state-change font-label text-label-lg font-semibold cursor-pointer border-0 shadow-sm disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Inline Forgot Password Recovery */}
        {showForgotModal && (
          <form
            onSubmit={handleForgotSubmit}
            className="bg-light-surface-container-low border border-light-outline-variant rounded-md p-md flex flex-col gap-sm"
          >
            <span className="font-title text-title-sm font-semibold text-light-on-surface">
              Reset Campus Password
            </span>
            <input
              type="email"
              required
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="Enter registered campus email"
              className="w-full rounded border border-light-outline-variant bg-light-surface-container-lowest px-md py-xs font-body text-body-md text-light-on-surface outline-none"
            />
            {resetStatus && (
              <p
                className={`text-xs m-0 ${
                  resetStatus.type === 'success' ? 'text-success' : 'text-light-error'
                }`}
              >
                {resetStatus.text}
              </p>
            )}
            <div className="flex items-center justify-end gap-xs">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-sm py-1 text-xs rounded border border-light-outline-variant bg-light-surface-container-lowest text-light-on-surface cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-md py-1 text-xs rounded border-0 bg-light-primary text-light-on-primary font-semibold cursor-pointer"
              >
                Send Reset Link
              </button>
            </div>
          </form>
        )}

        {/* Sandbox Demo Quick Role Access (Only visible when VITE_DEMO_MODE=true) */}
        {isDemoModeEnabled && (
          <div className="flex flex-col gap-xs pt-xs border-t border-light-outline-variant">
            <div className="flex items-center justify-between">
              <span className="font-label text-label-sm text-light-on-surface-variant font-medium">
                Sandbox Quick Role Access (Dev Only):
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-warning-container text-on-warning-container font-semibold">
                VITE_DEMO_MODE
              </span>
            </div>
            <div className="grid grid-cols-2 gap-xs">
              {quickRoles.map((qr) => (
                <button
                  key={qr.email}
                  type="button"
                  onClick={() => handleQuickLogin(qr.email)}
                  disabled={loading}
                  className="flex items-center gap-xs px-sm py-xs rounded bg-light-surface-container-low hover:bg-light-surface-container-high border border-light-outline-variant text-left transition-colors cursor-pointer text-light-on-surface"
                >
                  <span className="material-symbols-outlined text-[16px] text-light-primary" aria-hidden="true">
                    {qr.icon}
                  </span>
                  <span className="font-label text-label-sm truncate">{qr.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="pt-xs border-t border-light-outline-variant text-center">
          <span className="font-body text-body-md text-light-on-surface-variant">New student?</span>
          <Link
            to="/signup"
            className="font-label text-label-md text-light-primary hover:underline ml-xs font-semibold"
          >
            Create student account
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Login;
