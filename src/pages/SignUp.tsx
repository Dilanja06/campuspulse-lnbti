import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';

export const SignUp: React.FC = () => {
  const [fullName, setFullName] = useState('Nethmi Perera');
  const [role, setRole] = useState<UserRole>('student');
  const [identifier, setIdentifier] = useState('UG/2024/CS/0142');
  const [faculty, setFaculty] = useState('Computing');
  const [email, setEmail] = useState('nethmi.p@university.edu');
  const [password, setPassword] = useState('Pass123456');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'coordinator') {
      setIdentifier('STAFF/ENG/0042');
      setFaculty('Faculty of Engineering');
    } else if (newRole === 'authority') {
      setIdentifier('AUTH/DSA/001');
      setFaculty('Dean of Student Affairs');
    } else if (newRole === 'admin') {
      setIdentifier('ADM/SYS/0089');
      setFaculty('Central Administration');
    } else if (newRole === 'committee') {
      setIdentifier('UG/2023/MG/0088');
      setFaculty('Faculty of Management');
    } else {
      setIdentifier('UG/2024/CS/0142');
      setFaculty('Computing');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const isStaff = role === 'coordinator' || role === 'authority' || role === 'admin';
      const res = await signUp({
        email,
        password,
        fullName,
        role,
        studentId: !isStaff ? identifier : undefined,
        staffId: isStaff ? identifier : undefined,
        faculty: faculty,
        department: isStaff ? faculty : undefined,
        clubName: role === 'organizer' || role === 'committee' ? 'Sports Club' : undefined,
      });

      if (res.success) {
        navigate('/verify', {
          state: {
            fullName,
            identifier,
            email,
            faculty,
            role,
          },
        });
      } else {
        setErrorMsg(res.error || 'Failed to create account');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during account creation');
    } finally {
      setLoading(false);
    }
  };

  const isStaff = role === 'coordinator' || role === 'authority' || role === 'admin';

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
            LNBTI PORTAL
          </span>
        </div>
        <span className="font-label text-label-sm text-light-on-surface-variant">
          Register with Official LNBTI Student or Staff Credentials
        </span>
      </div>

      {/* Centered Auth Card */}
      <section className="w-full max-w-[500px] bg-light-surface-container-lowest border border-light-outline-variant rounded-lg p-xl flex flex-col gap-lg shadow-sm">
        <div className="flex flex-col gap-xs">
          <h1 className="font-headline text-headline-md text-light-on-surface font-bold">
            Create University Account
          </h1>
          <p className="font-body text-body-md text-light-on-surface-variant">
            Register with your official campus email and university roster credentials.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-light-error-container text-light-on-error-container p-sm rounded text-body-md border border-light-error/30 flex items-center gap-xs">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSignUp} className="flex flex-col gap-md">
          {/* Account Role Selector */}
          <div className="flex flex-col gap-xs">
            <label htmlFor="signup-role" className="font-label text-label-md text-light-on-surface font-medium">
              Account Role / Clearance
            </label>
            <select
              id="signup-role"
              value={role}
              onChange={(e) => handleRoleChange(e.target.value as UserRole)}
              className="w-full rounded border border-light-outline-variant bg-light-surface-container-lowest px-md py-sm font-body text-body-md text-light-on-surface focus:border-light-primary focus:ring-1 focus:ring-light-primary outline-none"
            >
              <option value="student">Student (General Undergrad)</option>
              <option value="organizer">Club Organizer / Officer</option>
              <option value="committee">Club Decision-Maker / Committee Seat</option>
              <option value="coordinator">Lecturer Coordinator</option>
              <option value="authority">Higher University Authority (Dean)</option>
              <option value="admin">Central Administrator</option>
            </select>
          </div>

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
                {isStaff ? 'Staff ID' : 'Student ID'}
              </span>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={isStaff ? 'STAFF/ENG/0042' : 'UG/2024/CS/0142'}
                className="w-full rounded border border-light-outline-variant bg-light-surface-container-lowest px-md py-sm font-mono text-mono-md text-light-on-surface placeholder:text-light-outline focus:border-light-primary focus:ring-1 focus:ring-light-primary outline-none"
              />
            </label>

            <label className="flex flex-col gap-xs">
              <span className="font-label text-label-md text-light-on-surface font-medium">
                {isStaff ? 'Department / Unit' : 'Faculty'}
              </span>
              <input
                type="text"
                required
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                placeholder={isStaff ? 'Engineering' : 'Computing'}
                className="w-full rounded border border-light-outline-variant bg-light-surface-container-lowest px-md py-sm font-body text-body-md text-light-on-surface focus:border-light-primary focus:ring-1 focus:ring-light-primary outline-none"
              />
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

          <label className="flex flex-col gap-xs">
            <span className="font-label text-label-md text-light-on-surface font-medium">
              Password
            </span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded border border-light-outline-variant bg-light-surface-container-lowest px-md py-sm font-body text-body-md text-light-on-surface placeholder:text-light-outline focus:border-light-primary focus:ring-1 focus:ring-light-primary outline-none"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center px-md py-sm min-h-[44px] rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container transition-colors duration-state-change font-label text-label-lg font-semibold cursor-pointer border-0 shadow-sm disabled:opacity-50 mt-sm"
          >
            {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <div className="pt-xs border-t border-light-outline-variant text-center">
          <span className="font-body text-body-md text-light-on-surface-variant">Already registered?</span>
          <Link
            to="/login"
            className="font-label text-label-md text-light-primary hover:underline ml-xs font-semibold"
          >
            Sign in
          </Link>
        </div>
      </section>
    </main>
  );
};

export default SignUp;
