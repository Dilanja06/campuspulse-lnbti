import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export type UserRole = 
  | 'student' 
  | 'organizer' 
  | 'committee' 
  | 'coordinator' 
  | 'authority' 
  | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  student_id?: string;
  staff_id?: string;
  faculty?: string;
  department?: string;
  avatar_initials: string;
  club_name?: string;
}

export const defaultAccounts: Record<string, UserProfile> = {
  'nethmi.p@university.edu': {
    id: 'user-student-01',
    email: 'nethmi.p@university.edu',
    name: 'Nethmi Perera',
    role: 'student',
    student_id: 'UG/2024/CS/0142',
    faculty: 'Computing',
    avatar_initials: 'NP',
  },
  'organizer@university.edu': {
    id: 'user-organizer-01',
    email: 'organizer@university.edu',
    name: 'Nethmi Perera',
    role: 'organizer',
    student_id: 'UG/2024/CS/0142',
    faculty: 'Computing',
    club_name: 'Sports Club',
    avatar_initials: 'NP',
  },
  'chamod.p@university.edu': {
    id: 'user-committee-01',
    email: 'chamod.p@university.edu',
    name: 'Chamod Perera',
    role: 'committee',
    student_id: 'UG/2023/MG/0088',
    faculty: 'Management',
    club_name: 'Sports Club',
    avatar_initials: 'CP',
  },
  'kavinda.s@university.edu': {
    id: 'user-coordinator-01',
    email: 'kavinda.s@university.edu',
    name: 'Dr. Kavinda Silva',
    role: 'coordinator',
    staff_id: 'STAFF/ENG/0042',
    department: 'Faculty of Engineering',
    avatar_initials: 'KS',
  },
  'maheshika.p@university.edu': {
    id: 'user-authority-01',
    email: 'maheshika.p@university.edu',
    name: 'Prof. Maheshika Perera',
    role: 'authority',
    staff_id: 'AUTH/DSA/001',
    department: 'Dean of Student Affairs',
    avatar_initials: 'MP',
  },
  'amila.d@university.edu': {
    id: 'user-admin-01',
    email: 'amila.d@university.edu',
    name: 'Amila Dissanayake',
    role: 'admin',
    staff_id: 'ADM/SYS/0089',
    department: 'Central Administration',
    avatar_initials: 'AD',
  },
};

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  loading: boolean;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  signUp: (data: {
    email: string;
    password?: string;
    fullName: string;
    role: UserRole;
    studentId?: string;
    staffId?: string;
    faculty?: string;
    department?: string;
    clubName?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  switchRole: (newRole: UserRole) => void;
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
    case 'admin':
      return '/admin';
    case 'student':
    default:
      return '/home';
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    // Restore cached user from localStorage if present
    const cached = localStorage.getItem('campuspulse_auth_user');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return defaultAccounts['nethmi.p@university.edu'];
      }
    }
    return defaultAccounts['nethmi.p@university.edu'];
  });
  const [loading, setLoading] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('campuspulse_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('campuspulse_auth_user');
    }
  }, [user]);

  // Listen to Supabase auth changes
  useEffect(() => {
    try {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            const email = session.user.email || '';
            // Try fetching profile from Supabase profiles table
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (profile) {
                setUser({
                  id: profile.id,
                  email: profile.email,
                  name: profile.full_name || profile.name || email.split('@')[0],
                  role: (profile.role as UserRole) || 'student',
                  student_id: profile.student_id,
                  staff_id: profile.staff_id,
                  faculty: profile.faculty,
                  department: profile.department,
                  avatar_initials: profile.avatar_initials || (profile.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'CP'),
                  club_name: profile.club_name,
                });
                return;
              }
            } catch (err) {
              console.warn('Profiles query error, checking metadata/presets:', err);
            }

            // Fallback to user_metadata or default presets
            const meta = session.user.user_metadata || {};
            const matched = defaultAccounts[email];
            if (matched) {
              setUser(matched);
            } else {
              const name = meta.full_name || email.split('@')[0];
              const initials = name
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .substring(0, 2);

              setUser({
                id: session.user.id,
                email,
                name,
                role: (meta.role as UserRole) || 'student',
                student_id: meta.student_id,
                staff_id: meta.staff_id,
                faculty: meta.faculty,
                department: meta.department,
                avatar_initials: initials || 'ST',
              });
            }
          }
        }
      );

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    } catch (e) {
      console.warn('Supabase auth listener setup:', e);
    }
  }, []);

  const signIn = async (
    email: string,
    password?: string
  ): Promise<{ success: boolean; role?: UserRole; error?: string }> => {
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();

      // 1. Check if user is signing in via preset account
      const preset = defaultAccounts[cleanEmail];

      // 2. Attempt real Supabase signInWithPassword if password provided
      if (password) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

          if (!error && data.user) {
            // Fetch profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            const role = (profile?.role as UserRole) || (data.user.user_metadata?.role as UserRole) || preset?.role || 'student';
            const name = profile?.full_name || data.user.user_metadata?.full_name || preset?.name || cleanEmail.split('@')[0];
            const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);

            const authedUser: UserProfile = {
              id: data.user.id,
              email: cleanEmail,
              name,
              role,
              student_id: profile?.student_id || data.user.user_metadata?.student_id || preset?.student_id,
              staff_id: profile?.staff_id || data.user.user_metadata?.staff_id || preset?.staff_id,
              faculty: profile?.faculty || data.user.user_metadata?.faculty || preset?.faculty,
              department: profile?.department || data.user.user_metadata?.department || preset?.department,
              avatar_initials: initials,
              club_name: profile?.club_name || preset?.club_name,
            };

            setUser(authedUser);
            return { success: true, role };
          }
        } catch (authErr: any) {
          console.warn('Supabase sign-in note (falling back to preset session):', authErr?.message);
        }
      }

      // If preset match exists, sign in immediately with role profile
      if (preset) {
        setUser(preset);
        return { success: true, role: preset.role };
      }

      // If generic demo user
      const name = cleanEmail.split('@')[0];
      const fallbackUser: UserProfile = {
        id: `user-${Date.now()}`,
        email: cleanEmail,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        role: 'student',
        avatar_initials: name.substring(0, 2).toUpperCase(),
      };
      setUser(fallbackUser);
      return { success: true, role: 'student' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (data: {
    email: string;
    password?: string;
    fullName: string;
    role: UserRole;
    studentId?: string;
    staffId?: string;
    faculty?: string;
    department?: string;
    clubName?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const cleanEmail = data.email.trim().toLowerCase();
      const initials = data.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

      let createdId = `user-${Date.now()}`;

      // 1. Supabase Auth signup
      if (data.password) {
        try {
          const { data: supaData, error: supaErr } = await supabase.auth.signUp({
            email: cleanEmail,
            password: data.password,
            options: {
              data: {
                full_name: data.fullName,
                role: data.role,
                student_id: data.studentId,
                staff_id: data.staffId,
                faculty: data.faculty,
                department: data.department,
                club_name: data.clubName,
              },
            },
          });

          if (!supaErr && supaData.user) {
            createdId = supaData.user.id;
          }
        } catch (e) {
          console.warn('Supabase signup notice:', e);
        }
      }

      // 2. Insert into public.profiles in Supabase
      try {
        await supabase.from('profiles').upsert({
          id: createdId,
          email: cleanEmail,
          full_name: data.fullName,
          role: data.role,
          student_id: data.studentId || null,
          staff_id: data.staffId || null,
          faculty: data.faculty || null,
          department: data.department || null,
          club_name: data.clubName || null,
          avatar_initials: initials,
        });
      } catch (profErr) {
        console.warn('Profile table insert notice:', profErr);
      }

      const newUser: UserProfile = {
        id: createdId,
        email: cleanEmail,
        name: data.fullName,
        role: data.role,
        student_id: data.studentId,
        staff_id: data.staffId,
        faculty: data.faculty,
        department: data.department,
        avatar_initials: initials,
        club_name: data.clubName,
      };

      setUser(newUser);
      return { success: true };
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

  const switchRole = (newRole: UserRole) => {
    // Find matching default preset for this role
    const matchingEmail = Object.keys(defaultAccounts).find(
      (em) => defaultAccounts[em].role === newRole
    );
    if (matchingEmail && defaultAccounts[matchingEmail]) {
      setUser(defaultAccounts[matchingEmail]);
    } else if (user) {
      setUser({ ...user, role: newRole });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'student',
        loading,
        signIn,
        signUp,
        signOut,
        switchRole,
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
