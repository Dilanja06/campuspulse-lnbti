-- =====================================================================
-- CAMPUSPULSE - SUPABASE AUTH & RBAC SETUP SCRIPT
-- =====================================================================
-- This script configures user profiles, role-based access control (RBAC),
-- Row Level Security (RLS), and pre-seeds accounts for all 6 university roles:
-- 1. Student (nethmi.p@university.edu)
-- 2. Sports Club Officer (organizer@university.edu)
-- 3. Club Committee / Treasurer (chamod.p@university.edu)
-- 4. Lecturer Coordinator (kavinda.s@university.edu)
-- 5. University Authority / Dean (maheshika.p@university.edu)
-- 6. Central Administrator (amila.d@university.edu)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CREATE PUBLIC.PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    student_id TEXT,
    staff_id TEXT,
    faculty TEXT,
    department TEXT,
    club_name TEXT,
    avatar_initials TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- 2. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read/write so frontend can query and upsert seamlessly
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Public read profiles" ON public.profiles 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert profiles" ON public.profiles;
CREATE POLICY "Public insert profiles" ON public.profiles 
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update profiles" ON public.profiles;
CREATE POLICY "Public update profiles" ON public.profiles 
    FOR UPDATE USING (true);

-- 3. AUTO PROFILE CREATION TRIGGER ON AUTH.USERS SIGNUP (Optional Supabase helper)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, student_id, staff_id, faculty, department, club_name, avatar_initials)
    VALUES (
        NEW.id::text,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
        NEW.raw_user_meta_data->>'student_id',
        NEW.raw_user_meta_data->>'staff_id',
        NEW.raw_user_meta_data->>'faculty',
        NEW.raw_user_meta_data->>'department',
        NEW.raw_user_meta_data->>'club_name',
        UPPER(SUBSTRING(COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), 1, 2))
    )
    ON CONFLICT (email) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        student_id = EXCLUDED.student_id,
        staff_id = EXCLUDED.staff_id,
        faculty = EXCLUDED.faculty,
        department = EXCLUDED.department,
        club_name = EXCLUDED.club_name,
        updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger firing on every new Supabase signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. SEED EXISTING PRE-CONFIGURED ROLE PROFILES
INSERT INTO public.profiles (id, email, full_name, role, student_id, staff_id, faculty, department, club_name, avatar_initials)
VALUES
('user-student-01', 'nethmi.p@university.edu', 'Nethmi Perera', 'student', 'UG/2024/CS/0142', NULL, 'Faculty of Computing', 'Computing', NULL, 'NP'),
('user-organizer-01', 'organizer@university.edu', 'Nethmi Perera', 'organizer', 'UG/2024/CS/0142', NULL, 'Faculty of Computing', 'Computing', 'Sports Club', 'NP'),
('user-committee-01', 'chamod.p@university.edu', 'Chamod Perera', 'committee', 'UG/2023/MG/0088', NULL, 'Faculty of Management', 'Management', 'Sports Club', 'CP'),
('user-coordinator-01', 'kavinda.s@university.edu', 'Dr. Kavinda Silva', 'coordinator', NULL, 'STAFF/ENG/0042', 'Faculty of Engineering', 'Engineering', NULL, 'KS'),
('user-authority-01', 'maheshika.p@university.edu', 'Prof. Maheshika Perera', 'authority', NULL, 'AUTH/DSA/001', 'University Administration', 'Dean of Student Affairs', NULL, 'MP'),
('user-admin-01', 'amila.d@university.edu', 'Amila Dissanayake', 'admin', NULL, 'ADM/SYS/0089', 'Central Administration', 'Central Administration', NULL, 'AD')
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    student_id = EXCLUDED.student_id,
    staff_id = EXCLUDED.staff_id,
    faculty = EXCLUDED.faculty,
    department = EXCLUDED.department,
    club_name = EXCLUDED.club_name,
    avatar_initials = EXCLUDED.avatar_initials,
    updated_at = timezone('utc', now());
