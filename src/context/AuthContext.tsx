import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

export type UserRole =
  | 'student'
  | 'organizer'
  | 'committee'
  | 'coordinator'
  | 'authority'
  | 'verification'
  | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  available_roles: UserRole[];
  student_id?: string;
  staff_id?: string;
  faculty?: string;
  department?: string;
  avatar_initials: string;
  club_id?: string;
  club_name?: string;
  email_verified?: boolean;
  is_demo_session?: boolean;
  registered_device_name?: string;
  registered_device_date?: string;
  pref_registration?: boolean;
  pref_reminders?: boolean;
  pref_announcements?: boolean;
}

export const isDemoModeEnabled = import.meta.env.VITE_DEMO_MODE === 'true';

export const defaultAccounts: Record<string, UserProfile> = {
  'nethmi.p@university.edu': {
    id: '11111111-1111-4111-8111-000000000001',
    email: 'nethmi.p@university.edu',
    name: 'Nethmi Perera',
    role: 'student',
    available_roles: ['student'],
    student_id: 'UG/2024/CS/0142',
    faculty: 'Faculty of Computing',
    avatar_initials: 'NP',
    email_verified: true,
    registered_device_name: 'Google Pixel 8 Pro',
    registered_device_date: '12 Jan 2026',
    pref_registration: true,
    pref_reminders: true,
    pref_announcements: true,
  },
  'organizer@university.edu': {
    id: '11111111-1111-4111-8111-000000000002',
    email: 'organizer@university.edu',
    name: 'Nethmi Perera',
    role: 'organizer',
    available_roles: ['organizer', 'student'],
    student_id: 'UG/2024/CS/0142',
    faculty: 'Faculty of Computing',
    club_id: 'club-sports',
    club_name: 'University Sports Council',
    avatar_initials: 'NP',
    email_verified: true,
  },
  'chamod.p@university.edu': {
    id: '11111111-1111-4111-8111-000000000003',
    email: 'chamod.p@university.edu',
    name: 'Chamod Perera',
    role: 'committee',
    available_roles: ['committee', 'student'],
    student_id: 'UG/2023/MG/0088',
    faculty: 'Faculty of Management',
    club_id: 'club-sports',
    club_name: 'University Sports Council',
    avatar_initials: 'CP',
    email_verified: true,
  },
  'kavinda.s@university.edu': {
    id: '11111111-1111-4111-8111-000000000004',
    email: 'kavinda.s@university.edu',
    name: 'Dr. Kavinda Silva',
    role: 'coordinator',
    available_roles: ['coordinator'],
    staff_id: 'STAFF/ENG/0042',
    department: 'Faculty of Engineering',
    avatar_initials: 'KS',
    email_verified: true,
  },
  'maheshika.p@university.edu': {
    id: '11111111-1111-4111-8111-000000000005',
    email: 'maheshika.p@university.edu',
    name: 'Prof. Maheshika Perera',
    role: 'authority',
    available_roles: ['authority'],
    staff_id: 'AUTH/DSA/001',
    department: 'Dean of Student Affairs',
    avatar_initials: 'MP',
    email_verified: true,
  },
  'rohan.v@university.edu': {
    id: '11111111-1111-4111-8111-000000000006',
    email: 'rohan.v@university.edu',
    name: 'Rohan Jayawardena',
    role: 'verification',
    available_roles: ['verification'],
    staff_id: 'STAFF/VER/0011',
    department: 'External Verification Unit',
    avatar_initials: 'RJ',
    email_verified: true,
  },
  'amila.d@university.edu': {
    id: '11111111-1111-4111-8111-000000000007',
    email: 'amila.d@university.edu',
    name: 'Amila Dissanayake',
    role: 'admin',
    available_roles: ['admin'],
    staff_id: 'ADM/SYS/0089',
    department: 'Central Administration',
    avatar_initials: 'AD',
    email_verified: true,
  },
};

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  signInDemoPreset: (email: string) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  signUp: (data: {
    email: string;
    password: string;
    fullName: string;
    studentId: string;
    faculty: string;
  }) => Promise<{ success: boolean; needsVerification?: boolean; error?: string }>;
  signOut: () => Promise<void>;
  switchRole: (newRole: UserRole) => boolean;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resendVerification: (email: string) => Promise<{ success: boolean; error?: string }>;
  refreshVerificationStatus: () => Promise<boolean>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  getRoleHomeRoute: (r?: UserRole) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const getRoleHomeRoute = (r?: UserRole): string => {
  switch (r) {
    case 'organizer':
      return '/organizer';
    case 'committee':
      return '/committee';
    case 'coordinator':
      return '/coordinator';
    case 'authority':
      return '/authority';
    case 'verification':
      return '/verification';
    case 'admin':
      return '/admin';
    case 'student':
    default:
      return '/home';
  }
};

function computeAvailableRoles(baseRole: UserRole, presetRoles?: UserRole[]): UserRole[] {
  if (presetRoles && presetRoles.length > 0) return presetRoles;
  if (baseRole === 'organizer' || baseRole === 'committee') {
    return [baseRole, 'student'];
  }
  return [baseRole];
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const cached = localStorage.getItem('campuspulse_auth_user');
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as UserProfile;
        if (!parsed.available_roles) {
          parsed.available_roles = computeAvailableRoles(parsed.role);
        }
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('campuspulse_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('campuspulse_auth_user');
    }
  }, [user]);

  const hydrateFromSessionUser = async (supaUser: any): Promise<UserProfile> => {
    const email = (supaUser.email || '').toLowerCase();
    const meta = supaUser.user_metadata || {};
    const preset = defaultAccounts[email];

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .or(`id.eq.${supaUser.id},email.eq.${email}`)
        .limit(1)
        .maybeSingle();

      if (profile) {
        const resolvedRole = (profile.role as UserRole) || preset?.role || 'student';
        const fullName = profile.full_name || meta.full_name || preset?.name || email.split('@')[0];
        const initials =
          profile.avatar_initials ||
          fullName
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);

        return {
          id: profile.id || supaUser.id,
          email: profile.email || email,
          name: fullName,
          role: resolvedRole,
          available_roles: computeAvailableRoles(resolvedRole, preset?.available_roles),
          student_id: profile.student_id || meta.student_id || preset?.student_id,
          staff_id: profile.staff_id || preset?.staff_id,
          faculty: profile.faculty || meta.faculty || preset?.faculty,
          department: profile.department || preset?.department,
          avatar_initials: initials || 'ST',
          club_id: profile.club_id || preset?.club_id,
          club_name: profile.club_name || preset?.club_name,
          email_verified: Boolean(supaUser.email_confirmed_at),
          is_demo_session: false,
          registered_device_name: profile.registered_device_name || 'Google Pixel 8 Pro',
          registered_device_date: profile.registered_device_date || '12 Jan 2026',
          pref_registration: profile.pref_registration ?? true,
          pref_reminders: profile.pref_reminders ?? true,
          pref_announcements: profile.pref_announcements ?? true,
        };
      }
    } catch (err) {
      console.warn('Profiles lookup warning:', err);
    }

    if (preset) {
      return {
        ...preset,
        id: supaUser.id,
        email_verified: Boolean(supaUser.email_confirmed_at),
        is_demo_session: false,
      };
    }

    const name = meta.full_name || email.split('@')[0];
    const initials = name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    return {
      id: supaUser.id,
      email,
      name,
      role: 'student',
      available_roles: ['student'],
      student_id: meta.student_id,
      faculty: meta.faculty,
      avatar_initials: initials || 'ST',
      email_verified: Boolean(supaUser.email_confirmed_at),
      is_demo_session: false,
    };
  };

  useEffect(() => {
    try {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const hydrated = await hydrateFromSessionUser(session.user);
          setUser(hydrated);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    } catch (e) {
      console.warn('Supabase auth listener setup:', e);
    }
  }, []);

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; role?: UserRole; error?: string }> => {
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !password) {
        return { success: false, error: 'Campus email and password are required.' };
      }

      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          // Strict security: reject invalid passwords immediately.
          // Only allow local preset match if auth service returned a network error AND demo mode is explicitly on.
          const isNetworkFailure =
            error.message?.toLowerCase().includes('fetch') ||
            error.message?.toLowerCase().includes('network');
          const preset = defaultAccounts[cleanEmail];
          if (isNetworkFailure && isDemoModeEnabled && preset && password === 'password123') {
            setUser({ ...preset, is_demo_session: true });
            return { success: true, role: preset.role };
          }
          return { success: false, error: error.message || 'Invalid campus email or password.' };
        }

        if (data.user) {
          const hydrated = await hydrateFromSessionUser(data.user);
          setUser(hydrated);
          return { success: true, role: hydrated.role };
        }
      }

      // Offline fallback ONLY if Supabase is unconfigured and demo mode is explicitly enabled
      if (!isSupabaseConfigured && isDemoModeEnabled) {
        const preset = defaultAccounts[cleanEmail];
        if (preset && password === 'password123') {
          setUser({ ...preset, is_demo_session: true });
          return { success: true, role: preset.role };
        }
        return { success: false, error: 'Invalid demo credentials.' };
      }

      return { success: false, error: 'Authentication service is unavailable.' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const signInDemoPreset = async (
    presetEmail: string
  ): Promise<{ success: boolean; role?: UserRole; error?: string }> => {
    if (!isDemoModeEnabled) {
      return { success: false, error: 'Quick demo login is disabled in production mode.' };
    }
    setLoading(true);
    try {
      const cleanEmail = presetEmail.trim().toLowerCase();
      const preset = defaultAccounts[cleanEmail];
      if (!preset) {
        return { success: false, error: 'Unknown demo role preset.' };
      }

      // Try real Supabase JWT auth first if configured
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: 'password123',
          });
          if (!error && data.user) {
            const hydrated = await hydrateFromSessionUser(data.user);
            setUser(hydrated);
            return { success: true, role: hydrated.role };
          }
        } catch {
          // Fall back to explicit sandbox session if auth.users isn't seeded yet
        }
      }

      setUser({ ...preset, is_demo_session: true });
      return { success: true, role: preset.role };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (data: {
    email: string;
    password: string;
    fullName: string;
    studentId: string;
    faculty: string;
  }): Promise<{ success: boolean; needsVerification?: boolean; error?: string }> => {
    setLoading(true);
    try {
      const cleanEmail = data.email.trim().toLowerCase();
      const initials = data.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

      // Security rule: public self-signup ALWAYS registers strictly as 'student'
      if (!isSupabaseConfigured) {
        if (!isDemoModeEnabled) {
          return { success: false, error: 'Registration requires an active Supabase connection.' };
        }
        const demoUser: UserProfile = {
          id: `user-${Date.now()}`,
          email: cleanEmail,
          name: data.fullName,
          role: 'student',
          available_roles: ['student'],
          student_id: data.studentId,
          faculty: data.faculty,
          avatar_initials: initials || 'ST',
          email_verified: false,
          is_demo_session: true,
        };
        setUser(demoUser);
        return { success: true, needsVerification: true };
      }

      const { data: supaData, error: supaErr } = await supabase.auth.signUp({
        email: cleanEmail,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            student_id: data.studentId,
            faculty: data.faculty,
          },
        },
      });

      if (supaErr) {
        return { success: false, error: supaErr.message || 'Account creation failed.' };
      }

      const createdId = supaData.user?.id || `user-${Date.now()}`;
      const isVerified = Boolean(supaData.user?.email_confirmed_at);

      if (supaData.session) {
        try {
          await supabase.from('profiles').upsert({
            id: createdId,
            email: cleanEmail,
            full_name: data.fullName,
            role: 'student',
            student_id: data.studentId,
            faculty: data.faculty,
            avatar_initials: initials || 'ST',
          });
        } catch (profErr) {
          console.warn('Profile table upsert notice:', profErr);
        }
      }

      setUser({
        id: createdId,
        email: cleanEmail,
        name: data.fullName,
        role: 'student',
        available_roles: ['student'],
        student_id: data.studentId,
        faculty: data.faculty,
        avatar_initials: initials || 'ST',
        email_verified: isVerified,
        is_demo_session: false,
      });

      return { success: true, needsVerification: !isVerified };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Signup failed' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out notice:', e);
    }
    setUser(null);
    localStorage.removeItem('campuspulse_auth_user');
  };

  const switchRole = (newRole: UserRole): boolean => {
    if (!user) return false;
    // Security rule: users may ONLY switch to roles present in their granted available_roles
    if (!user.available_roles.includes(newRole)) {
      console.warn(`Unauthorized workspace switch attempt from ${user.role} to ${newRole}`);
      return false;
    }
    setUser({ ...user, role: newRole });
    return true;
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Could not send reset email.' };
    }
  };

  const resendVerification = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Could not resend verification email.' };
    }
  };

  const refreshVerificationStatus = async (): Promise<boolean> => {
    try {
      const { data } = await supabase.auth.getUser();
      const verified = Boolean(data?.user?.email_confirmed_at);
      if (user) {
        setUser({ ...user, email_verified: verified });
      }
      return verified;
    } catch {
      return Boolean(user?.email_verified);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;
    // Never allow client-side role modification here
    const { role: _ignoredRole, available_roles: _ignoredAvail, ...safeUpdates } = updates;
    const nextUser = { ...user, ...safeUpdates };
    setUser(nextUser);

    try {
      if (isSupabaseConfigured && !user.is_demo_session) {
        await supabase
          .from('profiles')
          .update({
            full_name: nextUser.name,
            faculty: nextUser.faculty,
            registered_device_name: nextUser.registered_device_name,
            pref_registration: nextUser.pref_registration,
            pref_reminders: nextUser.pref_reminders,
            pref_announcements: nextUser.pref_announcements,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
      }
      return true;
    } catch (e) {
      console.warn('Profile sync notice:', e);
      return true;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'student',
        loading,
        signIn,
        signInDemoPreset,
        signUp,
        signOut,
        switchRole,
        resetPassword,
        resendVerification,
        refreshVerificationStatus,
        updateUserProfile,
        getRoleHomeRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
