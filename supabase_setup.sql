-- =====================================================================
-- CAMPUSPULSE - COMPLETE ALIGNED SUPABASE SCHEMA, RLS, RPC & SEED SCRIPT
-- =====================================================================
-- Covers all 12 Core Modules + SRS Governance Entities:
--   - 3-Entity Approval Workflow: proposals -> proposal_revisions -> event_editions
--   - Committee 5-seat sign-offs, Coordinator routing, Higher Authority decisions
--   - External Approval Verification (V01-V03)
--   - Atomic Registration RPC with capacity locking & 10-min seat holds
--   - Payment Verification & Hold Validation RPC
--   - Event Cancellation Impact & Refund Batching RPC
--   - Dynamic QR Attendance Check-in RPC & Scan Logs
--   - Central Admin Registry, Roles, Merchants, QR Devices, Roster, Moderation, Audits
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure profiles table exists regardless of SQL execution order
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
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

-- Drop dependent tables safely for clean reset
DROP TABLE IF EXISTS public.attendance_logs CASCADE;
DROP TABLE IF EXISTS public.refund_requests CASCADE;
DROP TABLE IF EXISTS public.external_verifications CASCADE;
DROP TABLE IF EXISTS public.authority_decisions CASCADE;
DROP TABLE IF EXISTS public.committee_actions CASCADE;
DROP TABLE IF EXISTS public.event_editions CASCADE;
DROP TABLE IF EXISTS public.proposal_revisions CASCADE;
DROP TABLE IF EXISTS public.official_clubs CASCADE;
DROP TABLE IF EXISTS public.role_assignments CASCADE;
DROP TABLE IF EXISTS public.payment_merchants CASCADE;
DROP TABLE IF EXISTS public.qr_devices CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.club_posts CASCADE;
DROP TABLE IF EXISTS public.student_roster CASCADE;
DROP TABLE IF EXISTS public.system_config CASCADE;
DROP TABLE IF EXISTS public.support_requests CASCADE;
DROP TABLE IF EXISTS public.registrations CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.badges CASCADE;
DROP TABLE IF EXISTS public.proposals CASCADE;
DROP TABLE IF EXISTS public.club_members CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.clubs CASCADE;

-- =====================================================================
-- 1. CORE TABLES
-- =====================================================================

CREATE TABLE public.clubs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    member_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Not Joined',
    annual_fee NUMERIC NOT NULL DEFAULT 0,
    lead TEXT NOT NULL,
    committee JSONB DEFAULT '[]'::jsonb,
    announcements JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

CREATE TABLE public.proposals (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    club_id TEXT NOT NULL,
    club_name TEXT NOT NULL,
    category TEXT NOT NULL,
    event_date TEXT NOT NULL,
    time TEXT NOT NULL,
    venue TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 50,
    fee NUMERIC NOT NULL DEFAULT 0,
    budget NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Draft',
    stage INTEGER NOT NULL DEFAULT 1,
    stage_label TEXT,
    comment TEXT,
    submitted_at TEXT NOT NULL,
    hold_duration TEXT,
    require_manual_approval BOOLEAN DEFAULT false,
    external_approval TEXT,
    image_url TEXT,
    description TEXT,
    purpose TEXT,
    refund_policy TEXT,
    document_name TEXT,
    document_url TEXT,
    current_revision INTEGER NOT NULL DEFAULT 1,
    authorities TEXT[] DEFAULT '{}',
    committee_signoffs JSONB DEFAULT '[]'::jsonb,
    coordinator_endorsement JSONB,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- 3-Entity Separation: Immutable Revision Snapshots
CREATE TABLE public.proposal_revisions (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    proposal_id TEXT NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
    revision_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    event_date TEXT NOT NULL,
    venue TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    fee NUMERIC NOT NULL DEFAULT 0,
    budget NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL,
    submitted_at TEXT NOT NULL,
    reviewer_comment TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
    UNIQUE (proposal_id, revision_number)
);

CREATE TABLE public.events (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    club_name TEXT NOT NULL,
    club_id TEXT,
    category TEXT NOT NULL,
    start_date TEXT NOT NULL,
    time TEXT NOT NULL,
    venue TEXT NOT NULL,
    fee NUMERIC NOT NULL DEFAULT 0,
    capacity INTEGER NOT NULL DEFAULT 100,
    registered INTEGER NOT NULL DEFAULT 0,
    eligibility TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'published',
    description TEXT NOT NULL,
    image_url TEXT,
    schedule JSONB DEFAULT '[]'::jsonb,
    manual_approval BOOLEAN NOT NULL DEFAULT false,
    hold_minutes INTEGER NOT NULL DEFAULT 10,
    refund_policy TEXT,
    cancellation_reason TEXT,
    proposal_id TEXT,
    revision_number INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- 3-Entity Separation: Published Editions pointing to authorizing revision
CREATE TABLE public.event_editions (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    proposal_id TEXT REFERENCES public.proposals(id) ON DELETE SET NULL,
    revision_number INTEGER NOT NULL DEFAULT 1,
    edition_number INTEGER NOT NULL DEFAULT 1,
    title TEXT NOT NULL,
    published_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

CREATE TABLE public.registrations (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    reg_code TEXT NOT NULL,
    event_id TEXT NOT NULL,
    event_title TEXT NOT NULL,
    club_name TEXT NOT NULL,
    user_id TEXT,
    user_name TEXT,
    student_id TEXT,
    user_email TEXT,
    activity TEXT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    venue TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    fee NUMERIC NOT NULL DEFAULT 0,
    rejection_reason TEXT,
    image_url TEXT,
    check_in_status TEXT DEFAULT 'not_checked_in',
    checked_in_time TEXT,
    hold_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

CREATE TABLE public.badges (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Issued',
    club TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    user_id TEXT,
    date_issued TEXT,
    revoke_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

CREATE TABLE public.notifications (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    type TEXT NOT NULL DEFAULT 'info',
    icon TEXT NOT NULL DEFAULT 'notifications',
    user_id TEXT,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

CREATE TABLE public.payments (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    receipt_no TEXT NOT NULL,
    event_title TEXT NOT NULL,
    club_name TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    refund_id TEXT,
    user_id TEXT,
    event_id TEXT,
    reg_id TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

CREATE TABLE public.club_members (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    student_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    faculty TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Member',
    club_id TEXT NOT NULL,
    user_id TEXT,
    status TEXT NOT NULL DEFAULT 'Active',
    requested_date TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- =====================================================================
-- 2. GOVERNANCE, COMMITTEE, VERIFICATION, REFUNDS & ADMIN TABLES
-- =====================================================================

CREATE TABLE public.committee_actions (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    item_title TEXT NOT NULL,
    club_name TEXT NOT NULL,
    assigned_role TEXT NOT NULL,
    assigned_role_action TEXT NOT NULL,
    signed_count INTEGER NOT NULL DEFAULT 0,
    total_seats INTEGER NOT NULL DEFAULT 5,
    my_status TEXT NOT NULL DEFAULT 'Pending',
    budget NUMERIC DEFAULT 0,
    date TEXT,
    venue TEXT,
    submitted_by TEXT,
    line_items JSONB DEFAULT '[]'::jsonb,
    seats JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

CREATE TABLE public.authority_decisions (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    code TEXT NOT NULL,
    event_title TEXT NOT NULL,
    club_name TEXT NOT NULL,
    date TEXT NOT NULL,
    outcome TEXT NOT NULL,
    remarks TEXT NOT NULL,
    actor_email TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

CREATE TABLE public.external_verifications (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    proposal_id TEXT NOT NULL,
    proposal_code TEXT NOT NULL,
    event_title TEXT NOT NULL,
    club_name TEXT NOT NULL,
    issuer TEXT NOT NULL,
    reference_no TEXT NOT NULL,
    document_name TEXT NOT NULL,
    submitted_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending Verification',
    reviewer_note TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

CREATE TABLE public.refund_requests (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    refund_code TEXT NOT NULL,
    tx_id TEXT NOT NULL,
    receipt_no TEXT NOT NULL,
    event_id TEXT,
    event_title TEXT NOT NULL,
    club_name TEXT NOT NULL,
    user_id TEXT,
    student_name TEXT NOT NULL,
    student_id TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Requested',
    requested_at TEXT NOT NULL,
    resolved_at TEXT,
    officer_note TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

CREATE TABLE public.attendance_logs (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    event_id TEXT NOT NULL,
    event_title TEXT NOT NULL,
    reg_code TEXT NOT NULL,
    student_name TEXT NOT NULL,
    student_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    scanned_at TEXT NOT NULL,
    outcome TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

CREATE TABLE public.official_clubs (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    coordinator TEXT NOT NULL,
    committee_status TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Charter Pending',
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

CREATE TABLE public.role_assignments (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    identifier TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL,
    scope TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

CREATE TABLE public.payment_merchants (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Live',
    settlement TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

CREATE TABLE public.qr_devices (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    device_id TEXT NOT NULL,
    hardware_officer TEXT NOT NULL,
    assigned_event TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Authorized',
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

CREATE TABLE public.audit_logs (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    timestamp TEXT NOT NULL,
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    target TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

CREATE TABLE public.club_posts (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    club_id TEXT NOT NULL,
    club_name TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    audience TEXT NOT NULL DEFAULT 'All Students',
    status TEXT NOT NULL DEFAULT 'Published',
    created_at TEXT NOT NULL,
    moderation_reason TEXT
);

CREATE TABLE public.student_roster (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    student_id TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    faculty TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Verified',
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

CREATE TABLE public.system_config (
    id TEXT PRIMARY KEY DEFAULT 'global',
    payment_hold_minutes INTEGER NOT NULL DEFAULT 10,
    qr_ttl_seconds INTEGER NOT NULL DEFAULT 30,
    refund_window_hours INTEGER NOT NULL DEFAULT 48,
    reward_tokens_per_event INTEGER NOT NULL DEFAULT 10,
    allow_external_registrations BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

CREATE TABLE public.support_requests (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_email TEXT NOT NULL,
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Open',
    created_at TEXT NOT NULL,
    response TEXT
);

-- =====================================================================
-- 3. HELPER FUNCTIONS & ATOMIC POSTGRESQL RPCs
-- =====================================================================

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

-- Atomic Registration RPC: prevents race condition overbooking, duplicate registrations,
-- enforces manual approval gating & 10-minute payment hold window.
CREATE OR REPLACE FUNCTION public.register_student_for_event(
    p_id TEXT,
    p_reg_code TEXT,
    p_event_id TEXT,
    p_user_id TEXT,
    p_user_name TEXT,
    p_student_id TEXT,
    p_user_email TEXT,
    p_activity TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_event public.events%ROWTYPE;
    v_existing INTEGER;
    v_status TEXT;
    v_hold TIMESTAMPTZ;
BEGIN
    SELECT * INTO v_event FROM public.events WHERE id = p_event_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Event not found.');
    END IF;

    IF v_event.status <> 'published' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Event registration is not open (' || v_event.status || ').');
    END IF;

    IF v_event.registered >= v_event.capacity THEN
        RETURN jsonb_build_object('success', false, 'error', 'Event capacity is full.');
    END IF;

    SELECT count(*) INTO v_existing
    FROM public.registrations
    WHERE event_id = p_event_id
      AND (user_id = p_user_id OR lower(COALESCE(user_email, '')) = lower(COALESCE(p_user_email, '')))
      AND status NOT IN ('cancelled', 'rejected');

    IF v_existing > 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'You already have an active registration for this event.');
    END IF;

    IF v_event.manual_approval THEN
        v_status := 'pending';
        v_hold := NULL;
    ELSIF v_event.fee > 0 THEN
        v_status := 'payment_pending';
        v_hold := timezone('utc', now()) + make_interval(mins => COALESCE(v_event.hold_minutes, 10));
    ELSE
        v_status := 'confirmed';
        v_hold := NULL;
    END IF;

    INSERT INTO public.registrations (
        id, reg_code, event_id, event_title, club_name, user_id, user_name, student_id,
        user_email, activity, date, time, venue, status, fee, image_url, check_in_status, hold_expires_at
    ) VALUES (
        p_id, p_reg_code, v_event.id, v_event.title, v_event.club_name, p_user_id, p_user_name, p_student_id,
        p_user_email, p_activity, v_event.start_date, v_event.time, v_event.venue, v_status, v_event.fee,
        v_event.image_url, 'not_checked_in', v_hold
    );

    -- Only reserve seat count immediately if not awaiting officer manual review
    IF NOT v_event.manual_approval THEN
        UPDATE public.events SET registered = registered + 1 WHERE id = v_event.id;
    END IF;

    RETURN jsonb_build_object('success', true, 'status', v_status, 'hold_expires_at', v_hold);
END;
$$;

-- =====================================================================
-- 4. ROW LEVEL SECURITY (SCOPED BY ROLE & OWNERSHIP)
-- =====================================================================

ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read clubs" ON public.clubs FOR SELECT USING (true);
CREATE POLICY "Staff manage clubs" ON public.clubs FOR ALL TO authenticated
    USING (public.has_any_app_role('organizer', 'committee', 'admin'))
    WITH CHECK (public.has_any_app_role('organizer', 'committee', 'admin'));

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Organizer publishes and manages own club events" ON public.events FOR ALL TO authenticated
    USING (public.has_any_app_role('organizer', 'admin'))
    WITH CHECK (public.has_any_app_role('organizer', 'admin'));

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read proposals" ON public.proposals FOR SELECT TO authenticated
    USING (public.has_any_app_role('organizer', 'committee', 'coordinator', 'authority', 'verification', 'admin'));
CREATE POLICY "Governance actors manage proposals" ON public.proposals FOR ALL TO authenticated
    USING (public.has_any_app_role('organizer', 'committee', 'coordinator', 'authority', 'verification'))
    WITH CHECK (public.has_any_app_role('organizer', 'committee', 'coordinator', 'authority', 'verification'));

ALTER TABLE public.proposal_revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read proposal revisions" ON public.proposal_revisions FOR SELECT TO authenticated
    USING (public.has_any_app_role('organizer', 'committee', 'coordinator', 'authority', 'verification', 'admin'));
CREATE POLICY "Officers create immutable revisions" ON public.proposal_revisions FOR INSERT TO authenticated
    WITH CHECK (public.has_any_app_role('organizer', 'committee', 'coordinator', 'authority'));

ALTER TABLE public.event_editions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read event editions" ON public.event_editions FOR SELECT USING (true);
CREATE POLICY "Organizers manage editions" ON public.event_editions FOR ALL TO authenticated
    USING (public.has_any_app_role('organizer'))
    WITH CHECK (public.has_any_app_role('organizer'));

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own registrations or officers see event roster" ON public.registrations FOR SELECT TO authenticated
    USING (
        user_id = public.current_app_user_id()
        OR lower(COALESCE(user_email, '')) = lower(COALESCE(auth.jwt()->>'email', ''))
        OR public.has_any_app_role('organizer', 'committee', 'coordinator', 'admin')
    );
CREATE POLICY "Students create own registrations" ON public.registrations FOR INSERT TO authenticated
    WITH CHECK (
        user_id = public.current_app_user_id()
        OR public.has_any_app_role('organizer', 'admin')
    );
CREATE POLICY "Users cancel own or officers update registrations" ON public.registrations FOR UPDATE TO authenticated
    USING (
        user_id = public.current_app_user_id()
        OR lower(COALESCE(user_email, '')) = lower(COALESCE(auth.jwt()->>'email', ''))
        OR public.has_any_app_role('organizer', 'committee')
    )
    WITH CHECK (
        user_id = public.current_app_user_id()
        OR lower(COALESCE(user_email, '')) = lower(COALESCE(auth.jwt()->>'email', ''))
        OR public.has_any_app_role('organizer', 'committee')
    );

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own payments or finance officers see all" ON public.payments FOR SELECT TO authenticated
    USING (
        user_id = public.current_app_user_id()
        OR public.has_any_app_role('organizer', 'committee', 'admin')
    );
CREATE POLICY "Authenticated users manage own payments" ON public.payments FOR ALL TO authenticated
    USING (
        user_id = public.current_app_user_id()
        OR public.has_any_app_role('organizer', 'committee', 'admin')
    )
    WITH CHECK (
        user_id = public.current_app_user_id()
        OR public.has_any_app_role('organizer', 'committee', 'admin')
    );

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own or broadcast notifications" ON public.notifications FOR SELECT TO authenticated
    USING (user_id IS NULL OR user_id = public.current_app_user_id() OR public.has_any_app_role('admin'));
CREATE POLICY "Authenticated users update own notifications" ON public.notifications FOR ALL TO authenticated
    USING (user_id IS NULL OR user_id = public.current_app_user_id() OR public.has_any_app_role('organizer', 'coordinator', 'authority', 'admin'))
    WITH CHECK (true);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own badges" ON public.badges FOR SELECT TO authenticated
    USING (user_id IS NULL OR user_id = public.current_app_user_id() OR public.has_any_app_role('organizer', 'admin'));
CREATE POLICY "Organizers & Admin manage badges" ON public.badges FOR ALL TO authenticated
    USING (public.has_any_app_role('organizer', 'admin'))
    WITH CHECK (public.has_any_app_role('organizer', 'admin'));

ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read club members" ON public.club_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Students apply or officers manage club members" ON public.club_members FOR ALL TO authenticated
    USING (user_id = public.current_app_user_id() OR public.has_any_app_role('organizer', 'committee', 'admin'))
    WITH CHECK (user_id = public.current_app_user_id() OR public.has_any_app_role('organizer', 'committee', 'admin'));

ALTER TABLE public.committee_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Committee and organizers read actions" ON public.committee_actions FOR SELECT TO authenticated
    USING (public.has_any_app_role('committee', 'organizer', 'coordinator', 'admin'));
CREATE POLICY "Committee updates assigned actions" ON public.committee_actions FOR ALL TO authenticated
    USING (public.has_any_app_role('committee', 'organizer'))
    WITH CHECK (public.has_any_app_role('committee', 'organizer'));

ALTER TABLE public.authority_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Governance reads decision history" ON public.authority_decisions FOR SELECT TO authenticated
    USING (public.has_any_app_role('authority', 'coordinator', 'organizer', 'admin'));
CREATE POLICY "Higher Authority records decisions" ON public.authority_decisions FOR INSERT TO authenticated
    WITH CHECK (public.has_any_app_role('authority'));

ALTER TABLE public.external_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Verification staff and governance read evidence" ON public.external_verifications FOR SELECT TO authenticated
    USING (public.has_any_app_role('verification', 'authority', 'coordinator', 'organizer', 'admin'));
CREATE POLICY "Verification staff updates evidence" ON public.external_verifications FOR ALL TO authenticated
    USING (public.has_any_app_role('verification', 'organizer'))
    WITH CHECK (public.has_any_app_role('verification', 'organizer'));

ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students see own refunds or officers see all" ON public.refund_requests FOR SELECT TO authenticated
    USING (user_id = public.current_app_user_id() OR public.has_any_app_role('organizer', 'committee', 'admin'));
CREATE POLICY "Students request refunds and officers process" ON public.refund_requests FOR ALL TO authenticated
    USING (user_id = public.current_app_user_id() OR public.has_any_app_role('organizer', 'committee', 'admin'))
    WITH CHECK (user_id = public.current_app_user_id() OR public.has_any_app_role('organizer', 'committee', 'admin'));

ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Officers and admin read attendance logs" ON public.attendance_logs FOR ALL TO authenticated
    USING (public.has_any_app_role('organizer', 'committee', 'admin'))
    WITH CHECK (public.has_any_app_role('organizer', 'committee'));

ALTER TABLE public.official_clubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read official clubs" ON public.official_clubs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manages official clubs" ON public.official_clubs FOR ALL TO authenticated
    USING (public.has_any_app_role('admin')) WITH CHECK (public.has_any_app_role('admin'));

ALTER TABLE public.role_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read own or admin reads roles" ON public.role_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manages role assignments" ON public.role_assignments FOR ALL TO authenticated
    USING (public.has_any_app_role('admin')) WITH CHECK (public.has_any_app_role('admin'));

ALTER TABLE public.payment_merchants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin and officers read merchants" ON public.payment_merchants FOR SELECT TO authenticated
    USING (public.has_any_app_role('admin', 'organizer', 'committee'));
CREATE POLICY "Admin manages merchants" ON public.payment_merchants FOR ALL TO authenticated
    USING (public.has_any_app_role('admin')) WITH CHECK (public.has_any_app_role('admin'));

ALTER TABLE public.qr_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin and officers read qr devices" ON public.qr_devices FOR SELECT TO authenticated
    USING (public.has_any_app_role('admin', 'organizer', 'committee'));
CREATE POLICY "Admin manages qr devices" ON public.qr_devices FOR ALL TO authenticated
    USING (public.has_any_app_role('admin')) WITH CHECK (public.has_any_app_role('admin'));

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin reads audit logs" ON public.audit_logs FOR SELECT TO authenticated
    USING (public.has_any_app_role('admin', 'authority', 'coordinator'));
CREATE POLICY "Authenticated actions append audit logs" ON public.audit_logs FOR INSERT TO authenticated
    WITH CHECK (true);

ALTER TABLE public.club_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published club posts" ON public.club_posts FOR SELECT USING (true);
CREATE POLICY "Officers publish or admin moderates posts" ON public.club_posts FOR ALL TO authenticated
    USING (public.has_any_app_role('organizer', 'admin'))
    WITH CHECK (public.has_any_app_role('organizer', 'admin'));

ALTER TABLE public.student_roster ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manages student roster" ON public.student_roster FOR ALL TO authenticated
    USING (public.has_any_app_role('admin')) WITH CHECK (public.has_any_app_role('admin'));

ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated reads system config" ON public.system_config FOR SELECT USING (true);
CREATE POLICY "Admin updates system config" ON public.system_config FOR ALL TO authenticated
    USING (public.has_any_app_role('admin')) WITH CHECK (public.has_any_app_role('admin'));

ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own support requests or admin all" ON public.support_requests FOR ALL TO authenticated
    USING (lower(user_email) = lower(COALESCE(auth.jwt()->>'email', '')) OR public.has_any_app_role('admin'))
    WITH CHECK (lower(user_email) = lower(COALESCE(auth.jwt()->>'email', '')) OR public.has_any_app_role('admin'));

-- Grant schema privileges cleanly
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON public.events, public.clubs, public.event_editions, public.club_posts, public.system_config TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- =====================================================================
-- 5. CONSISTENT SEED DATA
-- =====================================================================

INSERT INTO public.system_config (id, payment_hold_minutes, qr_ttl_seconds, refund_window_hours, reward_tokens_per_event, allow_external_registrations)
VALUES ('global', 10, 30, 48, 10, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.clubs (id, name, category, description, member_count, status, annual_fee, lead, committee, announcements)
VALUES
('club-sports', 'University Sports Council', 'Sports', 'Coordinating inter-faculty athletic meets, university color awards, equipment loaning, and intramural championships.', 148, 'Active Member', 1000, 'Captain A. Senanayake',
 '[{"name":"Ishara De Silva","role":"President"},{"name":"Nethmi Perera","role":"Secretary"},{"name":"Chamod Perera","role":"Treasurer"}]'::jsonb,
 '[{"title":"Indoor Gymnasium Opening Hours Extended","date":"2 days ago","content":"Open until 10:00 PM daily for registered student athletes."}]'::jsonb),
('club-ieee', 'IEEE Student Branch', 'Technical', 'The premier technical student organization empowering undergraduates through workshops, hackathons, robotics, and professional networking.', 215, 'Active Member', 600, 'Dr. Ruwan Wickramasinghe (Branch Counselor)',
 '[{"name":"Ashan Perera","role":"Chairperson"},{"name":"Janani Silva","role":"Vice Chairperson"},{"name":"Thilina Fernando","role":"Secretary"},{"name":"Devin De Alwis","role":"Treasurer"}]'::jsonb,
 '[{"title":"Call for HackUCSC 2026 Volunteers","date":"Yesterday","content":"Volunteers required for registration desk and technical staging."}]'::jsonb),
('club-robotics', 'Robotics Society', 'Technical', 'Advancing autonomous robotics, embedded systems, aerial drones, and national robocup championships.', 94, 'Active Member', 500, 'Tharindu Wickramasinghe (President)', '[]'::jsonb, '[]'::jsonb),
('club-rotaract', 'Rotaract Club of University', 'Community Service', 'Fellowship through service. Organizing blood drives, rural school development, and environmental sustainability campaigns.', 280, 'Application Sent', 500, 'Rtr. Chathura Weerakoon', '[]'::jsonb, '[]'::jsonb),
('club-drama', 'University Drama Society', 'Cultural', 'Fostering performing arts, stage production, screenwriting, and inter-university drama competitions.', 145, 'Following', 400, 'Prof. Malini Fonseka', '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.proposals (id, code, title, club_id, club_name, category, event_date, time, venue, capacity, fee, budget, status, stage, stage_label, comment, submitted_at, external_approval, image_url, description, current_revision, authorities, committee_signoffs, coordinator_endorsement)
VALUES
('prop-1084', 'PROP-1084', 'Annual Athletics Meet 2026', 'club-sports', 'University Sports Council', 'Sports & Athletics', '2026-12-12', '07:30 AM – 05:30 PM', 'University Main Athletics Track', 450, 0, 85000, 'Higher Authority', 3, 'Stage 3: Dean of Student Affairs', 'Endorsed by Dr. Kavinda Silva. Routed to Dean of Student Affairs and External Verification.', '02 Nov 2026', 'Yes — External venue / sponsor clearance', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80', 'Annual inter-faculty track and field championship with medical standby unit, certified track marshals, and digital QR check-in.', 1, ARRAY['Dean of Student Affairs','External-Approval Verification Staff'], '[{"name":"Sports Club Committee (5 of 5)","role":"Committee Verification","date":"01 Nov","status":"Approved"}]'::jsonb, '{"name":"Dr. Kavinda Silva","date":"03 Nov 2026","comment":"Budget and ground reservation clearance verified."}'::jsonb),
('prop-1094', 'PROP-1094', 'Inter-University Robotics Hackathon', 'club-robotics', 'Robotics Society', 'Technical & Engineering', '2026-12-05', '08:00 AM – 08:00 PM', 'Engineering Block B · Innovation Lab', 120, 0, 120000, 'Higher Authority', 3, 'Stage 3: Dean of Student Affairs', 'Hardware lab safety and sponsor MoU vetted.', '08 Nov 2026', 'Yes — External venue / sponsor clearance', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80', '24-hour hardware prototyping challenge open to undergraduates across 4 partner universities.', 1, ARRAY['Dean of Student Affairs','Faculty Dean','External-Approval Verification Staff'], '[{"name":"Kavindu Senaratne","role":"President","date":"08 Nov","status":"Approved"}]'::jsonb, '{"name":"Dr. Kavinda Silva","date":"09 Nov 2026","comment":"Hardware lab safety and sponsor MoU vetted."}'::jsonb),
('prop-1099', 'PROP-1099', 'Cultural Night & Awards Gala', 'club-drama', 'University Drama Society', 'Cultural & Arts', '2026-12-18', '05:00 PM – 10:00 PM', 'University Grand Auditorium', 350, 400, 95000, 'Higher Authority', 3, 'Stage 3: Dean of Student Affairs', 'Auditorium booking confirmed.', '10 Nov 2026', 'No — On-campus internal event', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80', 'Annual cultural talent presentation, acoustic performances, and drama awards.', 1, ARRAY['Dean of Student Affairs'], '[]'::jsonb, '{"name":"Prof. Nalin Wickrama","date":"11 Nov 2026","comment":"Auditorium booking confirmed."}'::jsonb),
('prop-1096', 'PROP-1096', 'Cloud & Embedded Systems Bootcamp', 'club-ieee', 'IEEE Student Branch', 'Technical Workshop', '2026-12-10', '09:00 AM – 04:00 PM', 'Lecture Hall 03', 80, 0, 35000, 'Pending Review', 2, 'Lecturer Coordinator Review', NULL, '09 Nov 2026', 'No — On-campus internal event', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', 'Practical training on edge IoT deployment and AWS IoT Core architecture.', 1, ARRAY['Faculty Dean'], '[{"name":"Ashan Perera","role":"Chairperson","date":"09 Nov","status":"Approved"}]'::jsonb, NULL),
('prop-1091', 'PROP-1091', 'Badminton Coaching Clinic', 'club-sports', 'University Sports Council', 'Workshop & Clinic', '2026-12-22', '09:00 AM – 03:00 PM', 'Main Indoor Hall', 50, 250, 18000, 'Revision Requested', 2, 'Lecturer Coordinator', 'Please attach updated shuttlecock & safety kit quotation from Treasurer.', '05 Nov 2026', 'No — On-campus internal event', 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80', 'Badminton skills clinic and doubles drill session.', 2, '{}', '[]'::jsonb, NULL),
('prop-1062', 'PROP-1062', 'University Indoor Games Day 2026', 'club-sports', 'University Sports Council', 'Sports & Recreation', '2026-12-05', '08:30 AM – 05:00 PM', 'Indoor Sports Gymnasium, Main Campus', 40, 500, 65000, 'Approved & Published', 4, 'Published on Explorer', 'Main Hall booking confirmed.', '20 Oct 2026', 'No — On-campus internal event', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80', 'Annual inter-faculty indoor sports championship.', 1, ARRAY['Dean of Student Affairs'], '[]'::jsonb, '{"name":"Dr. Kavinda Silva","date":"22 Oct 2026"}'::jsonb),
('prop-1098', 'PROP-1098', 'Table Tennis Open Tournament', 'club-sports', 'University Sports Council', 'Sports & Recreation', '2026-12-08', '09:00 AM – 04:00 PM', 'Indoor Gymnasium · Main Hall', 64, 350, 24500, 'Draft', 1, 'Committee Draft', 'Missing venue confirmation document', '08 Nov 2026', 'No — On-campus internal event', 'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=1200&q=80', 'Inter-faculty table tennis knockout tournament.', 1, '{}', '[]'::jsonb, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.proposal_revisions (id, proposal_id, revision_number, title, event_date, venue, capacity, fee, budget, status, submitted_at, reviewer_comment)
VALUES
('rev-1091-1', 'prop-1091', 1, 'Badminton Coaching Clinic', '2026-12-22', 'Main Indoor Hall', 50, 250, 15000, 'Revision Requested', '02 Nov 2026', 'Please attach updated shuttlecock & safety kit quotation from Treasurer.'),
('rev-1091-2', 'prop-1091', 2, 'Badminton Coaching Clinic', '2026-12-22', 'Main Indoor Hall', 50, 250, 18000, 'Revision Requested', '05 Nov 2026', 'Updated quotation pending Treasurer sign-off.'),
('rev-1062-1', 'prop-1062', 1, 'University Indoor Games Day 2026', '2026-12-05', 'Indoor Sports Gymnasium, Main Campus', 40, 500, 65000, 'Approved', '20 Oct 2026', 'Approved by Dean of Student Affairs.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.events (id, code, title, club_name, club_id, category, start_date, time, venue, fee, capacity, registered, eligibility, status, description, image_url, schedule, manual_approval, proposal_id, revision_number)
VALUES
('evt-1', 'EVT-2026-041', 'University Indoor Games Day 2026', 'University Sports Council', 'club-sports', 'Sports', '2026-12-05', '08:30 AM – 05:00 PM', 'Indoor Sports Gymnasium, Main Campus', 500, 40, 28, 'All Registered Undergraduates', 'published', 'Annual inter-faculty indoor sports championship featuring badminton, table tennis, basketball 3v3, and chess tournaments. Trophies and participation certificates awarded.', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
 '[{"time":"08:30 AM","title":"Opening Ceremony & Roll Call","description":"Faculty march-in and registration verification."},{"time":"10:00 AM","title":"Preliminary Rounds","description":"Simultaneous court matches across all indoor sports."},{"time":"03:30 PM","title":"Finals & Awards Ceremony","description":"Championship matches followed by medal distribution."}]'::jsonb,
 true, 'prop-1062', 1),
('evt-2', 'EVT-2026-088', 'HackUCSC 2026: AI & Systems Hackathon', 'IEEE Student Branch', 'club-ieee', 'Technical', '2026-12-12', '09:00 AM – 09:00 PM', 'Computing Complex Lab 03', 0, 100, 86, 'Computing & Engineering Students', 'published', 'A 12-hour intensive hackathon building next-generation AI agents and distributed systems. Mentored by industry leaders with cash prizes for top 3 teams.', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
 '[{"time":"09:00 AM","title":"Keynote & Problem Release","description":"Theme reveal and workspace setup."},{"time":"01:00 PM","title":"Mid-point Check & Mentorship","description":"Architecture review with judges."},{"time":"07:30 PM","title":"Pitch Presentations & Judging","description":"5-minute live demos and evaluation."}]'::jsonb,
 false, NULL, 1),
('evt-3', 'EVT-2026-015', 'Rotaract Leadership Summit & Gala', 'Rotaract Club of University', 'club-rotaract', 'Community Service', '2026-12-18', '04:00 PM – 09:00 PM', 'University Grand Auditorium', 1200, 350, 310, 'Open to All Students & Alumni', 'published', 'An evening of inspiring keynotes on social impact leadership, networking banquet, and musical performances celebrating youth-led community projects.', 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80', '[]'::jsonb, true, NULL, 1),
('evt-4', 'EVT-2026-092', 'Drama Society Annual Theatre Night', 'University Drama Society', 'club-drama', 'Cultural', '2026-12-22', '06:00 PM – 09:00 PM', 'Lionel Wendt Memorial Hall', 400, 250, 250, 'All University Members', 'closed', 'A showcase of three student-written one-act plays touching on university life, identity, and satire.', 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=1200&q=80', '[]'::jsonb, false, NULL, 1),
('evt-5', 'EVT-2026-104', 'Research Methodology & LaTeX Workshop', 'Academic Research Forum', 'club-research', 'Academic', '2027-01-08', '02:00 PM – 05:00 PM', 'Science Faculty Auditorium', 0, 80, 35, 'Final Year & Postgraduate Students', 'published', 'Hands-on practical guide to thesis typesetting in LaTeX, citation management with BibTeX, and submitting to peer-reviewed journals.', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80', '[]'::jsonb, true, NULL, 1),
('evt-6', 'EVT-2026-033', 'Inter-Faculty Debate Series: Round 1', 'Debating Circle', 'club-debating', 'Academic', '2026-11-20', '03:00 PM – 06:00 PM', 'Arts Faculty Board Room', 0, 60, 60, 'Registered Debate Team Members', 'cancelled', 'Parliamentary style debate on tech ethics. Cancelled due to faculty exam scheduling clash.', 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80', '[]'::jsonb, false, NULL, 1),
('evt-7', 'EVT-2026-049', 'Inter-Faculty Futsal Cup', 'University Sports Council', 'club-sports', 'Sports', '2026-11-29', '08:00 AM – 06:00 PM', 'University Sports Complex', 0, 80, 66, 'All Registered Undergraduates', 'published', 'Annual fast-paced inter-faculty futsal competition. Team captain and squad verification active.', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80', '[]'::jsonb, false, NULL, 1),
('evt-8', 'EVT-2026-018', 'Freshers Sports Orientation', 'University Sports Council', 'club-sports', 'Sports', '2026-10-18', '09:00 AM – 03:00 PM', 'Indoor Sports Gymnasium', 0, 120, 112, 'First Year Students', 'closed', 'Orientation to campus athletics facilities, intramural leagues, and gym memberships.', 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=1200&q=80', '[]'::jsonb, false, NULL, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.event_editions (id, event_id, proposal_id, revision_number, edition_number, title)
VALUES
('ed-1', 'evt-1', 'prop-1062', 1, 1, 'University Indoor Games Day 2026')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (id, reg_code, event_id, event_title, club_name, user_id, user_name, student_id, user_email, activity, date, time, venue, status, fee, rejection_reason, image_url, check_in_status, checked_in_time, hold_expires_at)
VALUES
('reg-88514', 'REG-88514', 'evt-1', 'University Indoor Games Day 2026', 'University Sports Council', 'user-student-02', 'Dilshan Fernando', 'UG/2024/CS/0215', 'dilshan.f@university.edu', 'Table Tennis Doubles', '2026-12-05', '08:30 AM', 'Indoor Sports Gymnasium', 'pending', 500, NULL, 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80', 'not_checked_in', NULL, NULL),
('reg-88519', 'REG-88519', 'evt-1', 'University Indoor Games Day 2026', 'University Sports Council', 'user-student-03', 'Sajini Wickramasinghe', 'UG/2025/MG/0044', 'sajini.w@university.edu', 'Carrom Mixed Pairs', '2026-12-05', '08:30 AM', 'Indoor Sports Gymnasium', 'pending', 500, NULL, 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80', 'not_checked_in', NULL, NULL),
('reg-88201', 'REG-88201', 'evt-1', 'University Indoor Games Day 2026', 'University Sports Council', 'user-student-04', 'Kaveen Bandara', 'UG/2023/EN/0890', 'kaveen.b@university.edu', 'Basketball 3v3', '2026-12-05', '08:30 AM', 'Indoor Sports Gymnasium', 'confirmed', 500, NULL, 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80', 'not_checked_in', NULL, NULL),
('reg-88145', 'REG-88145', 'evt-1', 'University Indoor Games Day 2026', 'University Sports Council', '11111111-1111-4111-8111-000000000001', 'Nethmi Perera', 'UG/2024/CS/0142', 'nethmi.p@university.edu', 'Badminton Singles', '2026-12-05', '08:30 AM', 'Indoor Sports Gymnasium', 'payment_pending', 500, NULL, 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80', 'not_checked_in', NULL, timezone('utc', now()) + interval '10 minutes'),
('reg-88099', 'REG-88099', 'evt-1', 'University Indoor Games Day 2026', 'University Sports Council', 'user-student-05', 'Hasitha Senarath', 'UG/2023/CS/0440', 'hasitha.s@university.edu', 'Badminton Singles', '2026-12-05', '08:30 AM', 'Indoor Sports Gymnasium', 'checked_in', 500, NULL, 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80', 'checked_in', '08:42 AM', NULL),
('reg-2', 'REG-2026-4401', 'evt-2', 'HackUCSC 2026: AI & Systems Hackathon', 'IEEE Student Branch', '11111111-1111-4111-8111-000000000001', 'Nethmi Perera', 'UG/2024/CS/0142', 'nethmi.p@university.edu', 'Hackathon General', '2026-12-12', '09:00 AM', 'Computing Complex Lab 03', 'confirmed', 0, NULL, 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80', 'not_checked_in', NULL, NULL),
('reg-3', 'REG-2026-1193', 'evt-3', 'Rotaract Leadership Summit & Gala', 'Rotaract Club of University', '11111111-1111-4111-8111-000000000001', 'Nethmi Perera', 'UG/2024/CS/0142', 'nethmi.p@university.edu', 'Delegate Pass', '2026-12-18', '04:00 PM', 'University Grand Auditorium', 'pending', 1200, NULL, 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80', 'not_checked_in', NULL, NULL),
('reg-4', 'REG-2026-0922', 'evt-5', 'Research Methodology & LaTeX Workshop', 'Academic Research Forum', '11111111-1111-4111-8111-000000000001', 'Nethmi Perera', 'UG/2024/CS/0142', 'nethmi.p@university.edu', 'General', '2027-01-08', '02:00 PM', 'Science Faculty Auditorium', 'rejected', 0, 'Eligibility restricted to Year 4 and Postgraduate candidates.', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80', 'not_checked_in', NULL, NULL),
('reg-5', 'REG-2026-0331', 'evt-6', 'Inter-Faculty Debate Series: Round 1', 'Debating Circle', '11111111-1111-4111-8111-000000000001', 'Nethmi Perera', 'UG/2024/CS/0142', 'nethmi.p@university.edu', 'Debate Delegate', '2026-11-20', '03:00 PM', 'Arts Faculty Board Room', 'cancelled', 0, NULL, 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80', 'not_checked_in', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.badges (id, code, name, type, status, club, description, icon, user_id, date_issued)
VALUES
('bdg-1', 'BDG-MEM-0023', 'IEEE Active Member', 'Membership', 'Issued', 'IEEE Student Branch', 'Verified active membership with attendance in at least 3 technical sessions during Academic Year 2025/2026.', 'verified_user', '11111111-1111-4111-8111-000000000001', 'Oct 14, 2026'),
('bdg-2', 'BDG-MEM-0024', 'Leo Club Service Badge', 'Membership', 'Requirements Pending', 'Leo Club of Colombo', 'Requires completion of 20 community volunteer service hours and advisor sign-off.', 'hourglass_top', '11111111-1111-4111-8111-000000000001', NULL),
('bdg-3', 'BDG-EVT-0089', 'Hackathon Finalist 2025', 'Participation', 'Issued', 'IEEE Student Branch', 'Achieved top 5 finalist position in National Inter-University Algorithmic Challenge.', 'workspace_premium', '11111111-1111-4111-8111-000000000001', 'Nov 02, 2025'),
('bdg-4', 'BDG-EVT-0067', 'Inter-Faculty Athlete', 'Participation', 'Issued', 'University Sports Council', 'Represented Faculty of Computing in the 2025 Inter-Faculty Badminton Championship.', 'military_tech', '11111111-1111-4111-8111-000000000001', 'Aug 19, 2025')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.notifications (id, title, description, timestamp, read, type, icon, user_id, link)
VALUES
('notif-1', 'Payment Hold Expiring Soon', 'Your seat for University Indoor Games Day 2026 will be released in less than 10 minutes if unpaid.', '2 mins ago', false, 'warning', 'timer', '11111111-1111-4111-8111-000000000001', '/payment'),
('notif-2', 'Registration Approved: HackUCSC 2026', 'Your team application has been approved by IEEE Student Branch. QR attendance pass generated.', '1 hour ago', false, 'success', 'check_circle', '11111111-1111-4111-8111-000000000001', '/my-qr'),
('notif-3', 'New Announcement: Extended Gym Hours', 'University Sports Council posted: Indoor Gymnasium open until 10:00 PM this week.', 'Yesterday', true, 'secondary', 'campaign', NULL, '/clubs/club-sports'),
('notif-4', 'Debate Series Cancelled', 'Inter-Faculty Debate Round 1 has been cancelled due to faculty examination conflicts.', '3 days ago', true, 'error', 'event_busy', NULL, '/my-registrations')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.payments (id, receipt_no, event_title, club_name, amount, date, status, refund_id, user_id, event_id, reg_id)
VALUES
('tx-1', 'RCT-2026-9041', 'University Indoor Games Day 2026', 'University Sports Council', 500, 'Nov 24, 2026', 'Pending', NULL, '11111111-1111-4111-8111-000000000001', 'evt-1', 'reg-88145'),
('tx-2', 'RCT-2026-7721', 'IEEE Annual Student Branch Membership 2026', 'IEEE Student Branch', 600, 'Oct 10, 2026', 'Successful', NULL, '11111111-1111-4111-8111-000000000001', NULL, NULL),
('tx-3', 'RCT-2026-3109', 'Robotics Bootcamp Materials Kit', 'Robotics Society', 1500, 'Sep 15, 2026', 'Refund Completed', 'RFD-2026-1182', '11111111-1111-4111-8111-000000000001', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.refund_requests (id, refund_code, tx_id, receipt_no, event_title, club_name, user_id, student_name, student_id, amount, reason, status, requested_at, resolved_at, officer_note)
VALUES
('rfd-1', 'RFD-2026-1182', 'tx-3', 'RCT-2026-3109', 'Robotics Bootcamp Materials Kit', 'Robotics Society', '11111111-1111-4111-8111-000000000001', 'Nethmi Perera', 'UG/2024/CS/0142', 1500, 'Cancelled within 48-hour pre-event refund window.', 'Completed', 'Nov 15, 2026', 'Nov 18, 2026', 'Approved and settled to Visa Debit #90182.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.club_members (id, student_id, name, email, faculty, role, club_id, user_id, status, requested_date)
VALUES
('mem-1', 'UG/2023/CS/0012', 'Ishara De Silva', 'ishara.d@university.edu', 'Faculty of Computing', 'President', 'club-sports', NULL, 'Active', '15 Jan 2024'),
('mem-2', 'UG/2024/CS/0142', 'Nethmi Perera', 'nethmi.p@university.edu', 'Faculty of Computing', 'Secretary (Authorized Organizer)', 'club-sports', '11111111-1111-4111-8111-000000000001', 'Active', '18 Feb 2024'),
('mem-3', 'UG/2023/MG/0199', 'Chamod Perera', 'chamod.p@university.edu', 'Faculty of Management', 'Treasurer', 'club-sports', '11111111-1111-4111-8111-000000000003', 'Active', '10 Feb 2024'),
('mem-req-1', 'UG/2025/CS/0118', 'Ravindu Senanayake', 'ravindu.s@university.edu', 'Faculty of Computing', 'General Member', 'club-sports', NULL, 'Pending', '08 Nov 2026'),
('mem-req-2', 'UG/2025/EN/0302', 'Tharushi Gunawardena', 'tharushi.g@university.edu', 'Faculty of Engineering', 'General Member', 'club-sports', NULL, 'Pending', '07 Nov 2026'),
('mem-req-3', 'UG/2025/SC/0076', 'Malith Gunasekara', 'malith.g@university.edu', 'Faculty of Science', 'General Member', 'club-sports', NULL, 'Pending', '06 Nov 2026'),
('mem-req-4', 'UG/2024/MG/0211', 'Dinuka Peiris', 'dinuka.p@university.edu', 'Faculty of Management', 'General Member', 'club-sports', NULL, 'Pending', '05 Nov 2026')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.committee_actions (id, code, item_title, club_name, assigned_role, assigned_role_action, signed_count, total_seats, my_status, budget, date, venue, submitted_by, line_items, seats)
VALUES
('act-1091', 'PROP-1091', 'Badminton Coaching Clinic', 'Sports Club', 'Treasurer', 'Treasurer Budget Sign-off', 4, 5, 'Pending', 18000, '22 Nov 2026', 'Main Indoor Hall', 'Nethmi Perera (Authorized Organizer)',
 '[{"label":"Feather Shuttlecocks (6 tubes)","amount":12000},{"label":"First-Aid & Safety Kit Refill","amount":6000}]'::jsonb,
 '[{"seat_number":1,"role":"President","name":"Ishara De Silva","status":"Signed","signed_at":"06 Nov 2026"},{"seat_number":2,"role":"Vice President","name":"Dilani Perera","status":"Signed","signed_at":"06 Nov 2026"},{"seat_number":3,"role":"Secretary","name":"Nethmi Perera","status":"Signed","signed_at":"05 Nov 2026"},{"seat_number":4,"role":"Treasurer","name":"Chamod Perera","status":"Pending"},{"seat_number":5,"role":"Asst. Treasurer","name":"Roshan Silva","status":"Signed","signed_at":"07 Nov 2026"}]'::jsonb),
('act-1098', 'PROP-1098', 'Table Tennis Open Tournament', 'Sports Club', 'Committee Decision-Maker', 'Proposal Endorsement Vote', 3, 5, 'Pending', 24500, '08 Dec 2026', 'Indoor Gymnasium · Main Hall', 'Ishara De Silva (President)',
 '[{"label":"Table Tennis Balls & Net Replacements","amount":14500},{"label":"Certificates & Medals","amount":10000}]'::jsonb,
 '[{"seat_number":1,"role":"President","name":"Ishara De Silva","status":"Signed","signed_at":"08 Nov 2026"},{"seat_number":2,"role":"Vice President","name":"Dilani Perera","status":"Signed","signed_at":"08 Nov 2026"},{"seat_number":3,"role":"Secretary","name":"Nethmi Perera","status":"Signed","signed_at":"08 Nov 2026"},{"seat_number":4,"role":"Treasurer","name":"Chamod Perera","status":"Pending"},{"seat_number":5,"role":"Asst. Treasurer","name":"Roshan Silva","status":"Pending"}]'::jsonb),
('act-1084', 'PROP-1084', 'Annual Athletics Meet 2026', 'Sports Club', 'Treasurer', 'Treasurer Budget Sign-off', 5, 5, 'Signed', 85000, '12 Dec 2026', 'University Main Athletics Track', 'Kavinda Silva (Coordinator endorsed)',
 '[{"label":"Track Reservation Fee & Timing Equipment","amount":45000},{"label":"Medical Standby & Hydration Unit","amount":25000},{"label":"Trophies and Participant Bibs","amount":15000}]'::jsonb,
 '[{"seat_number":1,"role":"President","name":"Ishara De Silva","status":"Signed","signed_at":"01 Nov 2026"},{"seat_number":2,"role":"Vice President","name":"Dilani Perera","status":"Signed","signed_at":"01 Nov 2026"},{"seat_number":3,"role":"Secretary","name":"Nethmi Perera","status":"Signed","signed_at":"01 Nov 2026"},{"seat_number":4,"role":"Treasurer","name":"Chamod Perera","status":"Signed","signed_at":"02 Nov 2026"},{"seat_number":5,"role":"Asst. Treasurer","name":"Roshan Silva","status":"Signed","signed_at":"01 Nov 2026"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.authority_decisions (id, code, event_title, club_name, date, outcome, remarks, actor_email)
VALUES
('dec-1', 'PROP-1062', 'University Indoor Games Day', 'Sports Club', '24 Oct 2026', 'Approved', 'Main Hall booking confirmed. Adequate first-aid responder coverage validated.', 'maheshika.p@university.edu'),
('dec-2', 'PROP-1055', 'Applied AI & Data Symposium', 'IEEE Student Branch', '19 Oct 2026', 'Approved', 'Senate Auditorium approved. Security access list approved for external guest speakers.', 'maheshika.p@university.edu'),
('dec-3', 'PROP-1041', 'Off-Campus Photography Expedition', 'Photography Society', '11 Oct 2026', 'Returned', 'Requested transport insurance letter and verified parent consent forms for excursion.', 'maheshika.p@university.edu')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.external_verifications (id, proposal_id, proposal_code, event_title, club_name, issuer, reference_no, document_name, submitted_at, status)
VALUES
('ver-1', 'prop-1084', 'PROP-1084', 'Annual Athletics Meet 2026', 'University Sports Council', 'Sri Lanka Athletics Medical & Stadium Board', 'SLAM-2026-882', 'Stadium_Medical_Clearance_Letter.pdf', '03 Nov 2026', 'Pending Verification'),
('ver-2', 'prop-1094', 'PROP-1094', 'Inter-University Robotics Hackathon', 'Robotics Society', 'LankaTech Hardware Sponsors Pvt Ltd', 'MoU-TECH-409', 'External_Sponsor_Safety_MoU.pdf', '09 Nov 2026', 'Pending Verification')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.official_clubs (id, code, name, coordinator, committee_status, status)
VALUES
('rec-1', 'CLB-01', 'Sports Club', 'Dr. Kavinda Silva', '5/5 Verified', 'Active'),
('rec-2', 'CLB-04', 'IEEE Student Branch', 'Dr. Kavinda Silva', '5/5 Verified', 'Active'),
('rec-3', 'CLB-07', 'Robotics Society', 'Dr. Kavinda Silva', '5/5 Verified', 'Active'),
('rec-4', 'CLB-18', 'Astronomy & Space Club', 'Prof. Nalin Wickrama', '3/5 Pending', 'Charter Pending')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.role_assignments (id, name, identifier, email, role, scope, status)
VALUES
('role-1', 'Dr. Kavinda Silva', 'STAFF/FAC/ENG/0042', 'kavinda.s@university.edu', 'Lecturer Coordinator', 'Sports, IEEE, Robotics', 'Active'),
('role-2', 'Prof. Maheshika Perera', 'AUTH/DSA/001', 'maheshika.p@university.edu', 'Higher University Authority', 'Dean of Student Affairs', 'Active'),
('role-3', 'Rohan Jayawardena', 'STAFF/VER/0011', 'rohan.v@university.edu', 'External Verification Staff', 'External Clearance', 'Active'),
('role-4', 'Nethmi Perera', 'UG/2024/CS/0142', 'organizer@university.edu', 'Authorized Club Organizer', 'Sports Club (CLB-01)', 'Officer Permission')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.payment_merchants (id, name, description, status, settlement)
VALUES
('merch-1', 'PayHere University Gateway', 'Visa, Mastercard, and Campus Wallet · Auto-refund API enabled', 'Live', 'Settlement: Bank of Ceylon · T+1'),
('merch-2', 'LankaQR Campus Account', 'Instant QR bank transfers for event & membership fees', 'Live', 'Settlement: People''s Bank · Instant')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.qr_devices (id, device_id, hardware_officer, assigned_event, status)
VALUES
('dev-1', 'DEV-QR-014', 'Galaxy Tab A9 · Nethmi Perera', 'University Indoor Games Day 2026', 'Authorized'),
('dev-2', 'DEV-QR-011', 'iPhone 14 · Ashan Perera', 'Applied AI & Data Symposium', 'Authorized')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_logs (id, timestamp, actor, action, target)
VALUES
('AUD-9941', '08 Nov 2026 · 14:22', 'Amila Dissanayake', 'Assigned Organizer Permission', 'UG/2024/CS/0142'),
('AUD-9938', '08 Nov 2026 · 11:05', 'Amila Dissanayake', 'Paired QR Scanner Device', 'DEV-QR-014'),
('AUD-9935', '07 Nov 2026 · 16:40', 'Dr. Kavinda Silva', 'Routed Proposal to Dean', 'PROP-1084'),
('AUD-9932', '07 Nov 2026 · 09:15', 'System Gateway', 'Processed Refund Batch (LKR 12,500)', 'MERCH-PH-001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.student_roster (id, student_id, full_name, email, faculty, status)
VALUES
('ros-1', 'UG/2024/CS/0142', 'Nethmi Perera', 'nethmi.p@university.edu', 'Faculty of Computing', 'Verified'),
('ros-2', 'UG/2023/MG/0088', 'Chamod Perera', 'chamod.p@university.edu', 'Faculty of Management', 'Verified'),
('ros-3', 'UG/2024/CS/0215', 'Dilshan Fernando', 'dilshan.f@university.edu', 'Faculty of Computing', 'Verified'),
('ros-4', 'UG/2025/MG/0044', 'Sajini Wickramasinghe', 'sajini.w@university.edu', 'Faculty of Management', 'Pending Review')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.club_posts (id, club_id, club_name, title, content, audience, status, created_at)
VALUES
('post-1', 'club-sports', 'University Sports Council', 'Indoor Gymnasium Extended Hours', 'Open until 10:00 PM daily for registered student athletes during championship prep.', 'All Students', 'Published', '22 Nov 2026'),
('post-2', 'club-ieee', 'IEEE Student Branch', 'Call for HackUCSC 2026 Volunteers', 'Sign up at Lab 03 before Friday 4:00 PM to join the logistics crew.', 'Members Only', 'Published', '23 Nov 2026')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.attendance_logs (id, event_id, event_title, reg_code, student_name, student_id, device_id, scanned_at, outcome, message)
VALUES
('scan-1', 'evt-1', 'University Indoor Games Day 2026', 'REG-88099', 'Hasitha Senarath', 'UG/2023/CS/0440', 'DEV-QR-014', '08:42 AM', 'Verified', 'Student identity confirmed. Attendance check-in recorded.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.support_requests (id, user_email, category, subject, status, created_at, response)
VALUES
('sup-1', 'nethmi.p@university.edu', 'Device Transfer', 'Transfer attendance device binding from Pixel 7 to Pixel 8 Pro', 'Open', '24 Nov 2026', NULL)
ON CONFLICT (id) DO NOTHING;
