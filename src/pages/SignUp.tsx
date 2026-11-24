import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const SignUp: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [faculty, setFaculty] = useState('Faculty of Computing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { signUp } = useAuth();

  // Password complexity calculation (SRS S01: >=8 chars + complexity)
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const strengthScore = [hasMinLen, hasUpper, hasLower, hasDigit].filter(Boolean).length;
  const strengthLabel =
    strengthScore <= 1 ? 'Weak' : strengthScore === 2 || strengthScore === 3 ? 'Fair' : 'Strong';

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please enter a valid university campus email address.');
      return;
    }
    if (password.length < 8 || !hasUpper || !hasDigit) {
      setErrorMsg('Password must be at least 8 characters and include an uppercase letter and a number.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Password and Confirm Password do not match.');
      return;
    }
    if (!acceptTerms) {
      setErrorMsg('You must accept the LNBTI CampusPulse Code of Conduct & Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      // Security: public registration ALWAYS creates a 'student' account; staff/officer roles are Admin-assigned.
      const res = await signUp({
        email,
        password,
        fullName,
        studentId,
        faculty,
      });

      if (res.success) {
        navigate('/verify', {
          state: {
            fullName,
            identifier: studentId,
            email,
            faculty,
            needsVerification: res.needsVerification,
          },
        });
      } else {
        setErrorMsg(res.error || 'Failed to create student account');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during account creation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-md md:p-xl bg-light-surface gap-xl font-body">
      {/* Brand Mark */}
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
            LNBTI PORTAL
          </span>
        </div>
        <span className="font-label text-label-sm text-light-on-surface-variant">
          Student Onboarding · Roster Verification
        </span>
      </div>

      {/* Centered Auth Card */}
      <section className="w-full max-w-[500px] bg-light-surface-container-lowest border border-light-outline-variant rounded-lg p-xl flex flex-col gap-lg shadow-sm">
        <div className="flex flex-col gap-xs">
          <h1 className="font-headline text-headline-md text-light-on-surface font-bold">
            Create Student Account
          </h1>
          <p className="font-body text-body-md text-light-on-surface-variant">
            Register with your campus email and university student ID. Club officer and staff roles are granted separately by Central Administration.
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

        <form onSubmit={handleSignUp} className="flex flex-col gap-md">
          <label className="flex flex-col gap-xs">
            <span className="font-label text-label-md text-light-on-surface font-medium">
              Full name
            </span>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Nethmi Perera"
              className="w-full rounded border border-light-outline-variant bg-light-surface-container-lowest px-md py-sm font-body text-body-md text-light-on-surface placeholder:text-light-outline focus:border-light-primary focus:ring-1 focus:ring-light-primary outline-none"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <label className="flex flex-col gap-xs">
              <span className="font-label text-label-md text-light-on-surface font-medium">
                Student ID
              </span>
              <input
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="UG/2024/CS/0142"
                className="w-full rounded border border-light-outline-variant bg-light-surface-container-lowest px-md py-sm font-mono text-mono-md text-light-on-surface placeholder:text-light-outline focus:border-light-primary focus:ring-1 focus:ring-light-primary outline-none"
              />
            </label>

            <label className="flex flex-col gap-xs">
              <span className="font-label text-label-md text-light-on-surface font-medium">
                Faculty
              </span>
              <select
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="w-full rounded border border-light-outline-variant bg-light-surface-container-lowest px-md py-sm font-body text-body-md text-light-on-surface focus:border-light-primary focus:ring-1 focus:ring-light-primary outline-none"
              >
                <option value="Faculty of Computing">Faculty of Computing</option>
                <option value="Faculty of Engineering">Faculty of Engineering</option>
                <option value="Faculty of Management">Faculty of Management</option>
                <option value="Faculty of Science">Faculty of Science</option>
              </select>
            </label>
          </div>

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
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                inputMode="email"
                placeholder="name@university.edu"
                className="w-full rounded border border-light-outline-variant bg-light-surface-container-lowest pl-2xl pr-md py-sm font-body text-body-md text-light-on-surface placeholder:text-light-outline focus:border-light-primary focus:ring-1 focus:ring-light-primary outline-none"
              />
            </div>
          </label>

          <div className="flex flex-col gap-xs">
            <label className="flex flex-col gap-xs">
              <span className="font-label text-label-md text-light-on-surface font-medium">
                Password (min. 8 chars, uppercase + number)
              </span>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded border border-light-outline-variant bg-light-surface-container-lowest px-md py-sm font-body text-body-md text-light-on-surface placeholder:text-light-outline focus:border-light-primary focus:ring-1 focus:ring-light-primary outline-none"
              />
            </label>
            {password.length > 0 && (
              <div className="flex items-center justify-between text-xs">
                <div className="flex gap-1 flex-1 mr-sm">
                  {[1, 2, 3, 4].map((step) => (
                    <span
                      key={step}
                      className={`h-1.5 flex-1 rounded-full ${
                        strengthScore >= step
                          ? strengthScore === 4
                            ? 'bg-emerald-500'
                            : strengthScore >= 2
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                          : 'bg-light-surface-container-high'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-label font-semibold text-light-on-surface-variant">
                  {strengthLabel}
                </span>
              </div>
            )}
          </div>

          <label className="flex flex-col gap-xs">
            <span className="font-label text-label-md text-light-on-surface font-medium">
              Confirm Password
            </span>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded border border-light-outline-variant bg-light-surface-container-lowest px-md py-sm font-body text-body-md text-light-on-surface placeholder:text-light-outline focus:border-light-primary focus:ring-1 focus:ring-light-primary outline-none"
            />
          </label>

          <label className="flex items-start gap-sm cursor-pointer pt-xs">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-light-outline text-light-primary"
            />
            <span className="font-body text-label-sm text-light-on-surface-variant leading-relaxed">
              I agree to the LNBTI Student Governance Rules, Event Participation Policy, and CampusPulse Privacy Terms.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center px-md py-sm min-h-[44px] rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container transition-colors duration-state-change font-label text-label-lg font-semibold cursor-pointer border-0 shadow-sm disabled:opacity-50 mt-xs"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="pt-xs border-t border-light-outline-variant text-center">
          <span className="font-body text-body-md text-light-on-surface-variant">Already registered?</span>
          <Link
            to="/login"
            className="font-label text-label-md text-light-primary hover:underline ml-xs font-semibold"
          >
            Back to Login
          </Link>
        </div>
      </section>
    </main>
  );
};

export default SignUp;
