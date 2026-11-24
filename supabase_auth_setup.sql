-- =====================================================================
-- CAMPUSPULSE - SECURE AUTH, RBAC & SCOPED RLS SETUP SCRIPT
-- =====================================================================
-- 1. Creates public.profiles & helper RBAC functions
-- 2. Enforces student-only public self-signup in trigger (prevents role spoofing)
-- 3. Blocks client-side role self-escalation via RLS WITH CHECK
-- 4. Idempotently seeds Auth + Profile accounts for all 7 roles (password123)
--    including External Verification Staff (V01-V03)
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. CREATE PUBLIC.PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student'
        CHECK (role IN ('student', 'organizer', 'committee', 'coordinator', 'authority', 'verification', 'admin')),
    student_id TEXT,
    staff_id TEXT,
    faculty TEXT,
    department TEXT,
    club_id TEXT,
    club_name TEXT,
    avatar_initials TEXT,
    registered_device_name TEXT DEFAULT 'Not Linked',
    registered_device_date TEXT,
    pref_registration BOOLEAN DEFAULT true,
    pref_reminders BOOLEAN DEFAULT true,
    pref_announcements BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- Safely add new columns if upgrading an existing profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS club_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS registered_device_name TEXT DEFAULT 'Not Linked';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS registered_device_date TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pref_registration BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pref_reminders BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pref_announcements BOOLEAN DEFAULT true;

-- 2. RBAC HELPER FUNCTIONS (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.current_app_user_id()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(
        (SELECT id FROM public.profiles
         WHERE id = auth.uid()::text
            OR lower(email) = lower(COALESCE(auth.jwt()->>'email', ''))
         LIMIT 1),
        auth.uid()::text
    );
$$;

CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(
        (SELECT role FROM public.profiles
         WHERE id = auth.uid()::text
            OR lower(email) = lower(COALESCE(auth.jwt()->>'email', ''))
         LIMIT 1),
        'anonymous'
    );
$$;

CREATE OR REPLACE FUNCTION public.has_any_app_role(VARIADIC allowed_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.current_app_role() = ANY(allowed_roles);
$$;

-- 3. HARDENED RLS ON PUBLIC.PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users read own or admin reads all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own student profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile without escalating role" ON public.profiles;
DROP POLICY IF EXISTS "Admin manages all profiles" ON public.profiles;

CREATE POLICY "Authenticated users read own or admin reads all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
    id = auth.uid()::text
    OR lower(email) = lower(COALESCE(auth.jwt()->>'email', ''))
    OR public.has_any_app_role('admin', 'coordinator', 'authority', 'organizer', 'verification')
);

CREATE POLICY "Users insert own student profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (
    (
        id = auth.uid()::text
        AND lower(email) = lower(COALESCE(auth.jwt()->>'email', ''))
        AND role = 'student'
    )
    OR public.has_any_app_role('admin')
);

CREATE POLICY "Users update own profile without escalating role"
ON public.profiles FOR UPDATE
TO authenticated
USING (
    id = auth.uid()::text
    OR lower(email) = lower(COALESCE(auth.jwt()->>'email', ''))
    OR public.has_any_app_role('admin')
)
WITH CHECK (
    public.has_any_app_role('admin')
    OR (
        (id = auth.uid()::text OR lower(email) = lower(COALESCE(auth.jwt()->>'email', '')))
        AND role = (
            SELECT p.role FROM public.profiles p
            WHERE p.id = profiles.id
            LIMIT 1
        )
    )
);

-- 4. AUTO PROFILE CREATION TRIGGER ON AUTH.USERS SIGNUP
-- Security: user-supplied raw_user_meta_data CANNOT grant privileged roles.
-- Only raw_app_meta_data (admin/seed controlled) can assign non-student initial roles.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role TEXT;
BEGIN
    v_role := COALESCE(NULLIF(NEW.raw_app_meta_data->>'role', ''), 'student');
    IF v_role NOT IN ('student', 'organizer', 'committee', 'coordinator', 'authority', 'verification', 'admin') THEN
        v_role := 'student';
    END IF;

    INSERT INTO public.profiles (
        id, email, full_name, role, student_id, staff_id, faculty, department, club_id, club_name, avatar_initials
    )
    VALUES (
        NEW.id::text,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        v_role,
        NEW.raw_user_meta_data->>'student_id',
        NEW.raw_app_meta_data->>'staff_id',
        NEW.raw_user_meta_data->>'faculty',
        NEW.raw_app_meta_data->>'department',
        NEW.raw_app_meta_data->>'club_id',
        NEW.raw_app_meta_data->>'club_name',
        UPPER(SUBSTRING(COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), 1, 2))
    )
    ON CONFLICT (email) DO UPDATE SET
        id = EXCLUDED.id,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        student_id = COALESCE(EXCLUDED.student_id, public.profiles.student_id),
        faculty = COALESCE(EXCLUDED.faculty, public.profiles.faculty),
        updated_at = timezone('utc', now());

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. SEED AUTH USERS & ROLE PROFILES (password123 for all test personas)
DO $$
DECLARE
    acct RECORD;
    v_uid UUID;
    v_pw_hash TEXT;
BEGIN
    PERFORM set_config('search_path', 'public, extensions', true);
    v_pw_hash := crypt('password123', gen_salt('bf'));
    FOR acct IN
        SELECT * FROM (VALUES
            ('11111111-1111-4111-8111-000000000001'::uuid, 'nethmi.p@university.edu',  'Nethmi Perera',          'student',      'UG/2024/CS/0142', NULL::text,        'Faculty of Computing',       'Computing',               NULL::text,    NULL::text,    'NP'),
            ('11111111-1111-4111-8111-000000000002'::uuid, 'organizer@university.edu', 'Nethmi Perera',          'organizer',    'UG/2024/CS/0142', NULL::text,        'Faculty of Computing',       'Computing',               'club-sports', 'Sports Club', 'NP'),
            ('11111111-1111-4111-8111-000000000003'::uuid, 'chamod.p@university.edu',  'Chamod Perera',          'committee',    'UG/2023/MG/0088', NULL::text,        'Faculty of Management',      'Management',              'club-sports', 'Sports Club', 'CP'),
            ('11111111-1111-4111-8111-000000000004'::uuid, 'kavinda.s@university.edu', 'Dr. Kavinda Silva',      'coordinator',  NULL::text,        'STAFF/ENG/0042',  'Faculty of Engineering',     'Engineering',             NULL::text,    NULL::text,    'KS'),
            ('11111111-1111-4111-8111-000000000005'::uuid, 'maheshika.p@university.edu','Prof. Maheshika Perera','authority',    NULL::text,        'AUTH/DSA/001',    'University Administration',  'Dean of Student Affairs', NULL::text,    NULL::text,    'MP'),
            ('11111111-1111-4111-8111-000000000006'::uuid, 'rohan.v@university.edu',   'Rohan Jayawardena',      'verification', NULL::text,        'STAFF/VER/0011',  'External Verification Unit', 'External Clearance',      NULL::text,    NULL::text,    'RJ'),
            ('11111111-1111-4111-8111-000000000007'::uuid, 'amila.d@university.edu',   'Amila Dissanayake',      'admin',        NULL::text,        'ADM/SYS/0089',    'Central Administration',     'Central Administration',  NULL::text,    NULL::text,    'AD')
        ) AS t(uid, email, full_name, role, student_id, staff_id, faculty, department, club_id, club_name, avatar_initials)
    LOOP
        SELECT id INTO v_uid FROM auth.users WHERE lower(email) = lower(acct.email) LIMIT 1;

        IF v_uid IS NULL THEN
            v_uid := acct.uid;
            BEGIN
                INSERT INTO auth.users (
                    instance_id, id, aud, role, email, encrypted_password,
                    email_confirmed_at, recovery_sent_at, last_sign_in_at,
                    raw_app_meta_data, raw_user_meta_data,
                    created_at, updated_at,
                    confirmation_token, email_change, email_change_token_new, recovery_token
                )
                VALUES (
                    '00000000-0000-0000-0000-000000000000',
                    v_uid,
                    'authenticated',
                    'authenticated',
                    acct.email,
                    v_pw_hash,
                    now(), now(), now(),
                    jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email'), 'role', acct.role),
                    jsonb_build_object('full_name', acct.full_name, 'student_id', acct.student_id, 'faculty', acct.faculty),
                    now(), now(),
                    '', '', '', ''
                );

                INSERT INTO auth.identities (
                    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
                )
                VALUES (
                    gen_random_uuid(),
                    v_uid,
                    jsonb_build_object('sub', v_uid::text, 'email', acct.email),
                    'email',
                    v_uid::text,
                    now(), now(), now()
                )
                ON CONFLICT DO NOTHING;
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Could not seed auth.users for %: %', acct.email, SQLERRM;
            END;
        END IF;

        INSERT INTO public.profiles (
            id, email, full_name, role, student_id, staff_id, faculty, department, club_id, club_name, avatar_initials
        )
        VALUES (
            v_uid::text, acct.email, acct.full_name, acct.role,
            acct.student_id, acct.staff_id, acct.faculty, acct.department,
            acct.club_id, acct.club_name, acct.avatar_initials
        )
        ON CONFLICT (email) DO UPDATE SET
            id = EXCLUDED.id,
            full_name = EXCLUDED.full_name,
            role = EXCLUDED.role,
            student_id = EXCLUDED.student_id,
            staff_id = EXCLUDED.staff_id,
            faculty = EXCLUDED.faculty,
            department = EXCLUDED.department,
            club_id = EXCLUDED.club_id,
            club_name = EXCLUDED.club_name,
            avatar_initials = EXCLUDED.avatar_initials,
            updated_at = timezone('utc', now());
    END LOOP;
END $$;
