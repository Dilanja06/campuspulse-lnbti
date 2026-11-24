-- =====================================================================
-- CAMPUSPULSE - CLEAN SUPABASE SETUP SCRIPT (DROP & RECREATE)
-- =====================================================================
-- This script safely drops any old incomplete tables and recreates them
-- with all required columns, Row Level Security, and seed data.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop old tables if they exist to avoid column mismatch errors
DROP TABLE IF EXISTS public.registrations CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.badges CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.clubs CASCADE;

-- 1. EVENTS TABLE
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
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- 2. REGISTRATIONS TABLE
CREATE TABLE public.registrations (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    reg_code TEXT NOT NULL,
    event_id TEXT NOT NULL,
    event_title TEXT NOT NULL,
    club_name TEXT NOT NULL,
    user_id TEXT,
    user_name TEXT,
    user_email TEXT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    venue TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    fee NUMERIC NOT NULL DEFAULT 0,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- 3. CLUBS TABLE
CREATE TABLE public.clubs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    member_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Not Joined',
    annual_fee NUMERIC NOT NULL DEFAULT 0,
    lead TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- 4. BADGES TABLE
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
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- 5. NOTIFICATIONS TABLE
CREATE TABLE public.notifications (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    type TEXT NOT NULL DEFAULT 'info',
    icon TEXT NOT NULL DEFAULT 'notifications',
    user_id TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- 6. PAYMENTS TABLE
CREATE TABLE public.payments (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    receipt_no TEXT NOT NULL,
    event_title TEXT NOT NULL,
    club_name TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Successful',
    refund_id TEXT,
    user_id TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on events" ON public.events FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on registrations" ON public.registrations FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on clubs" ON public.clubs FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on badges" ON public.badges FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);

-- =====================================================================
-- SEED DATA
-- =====================================================================

-- Events Seed
INSERT INTO public.events (id, code, title, club_name, club_id, category, start_date, time, venue, fee, capacity, registered, eligibility, status, description)
VALUES 
('evt-1', 'EVT-2026-041', 'University Indoor Games Day 2026', 'University Sports Council', 'club-sports', 'Sports', '2026-12-05', '08:30 AM – 05:00 PM', 'Indoor Sports Gymnasium, Main Campus', 500, 200, 140, 'All Registered Undergraduates', 'published', 'Annual inter-faculty indoor sports championship featuring badminton, table tennis, basketball 3v3, and chess tournaments. Trophies and participation certificates awarded.'),
('evt-2', 'EVT-2026-088', 'HackUCSC 2026: AI & Systems Hackathon', 'IEEE Student Branch', 'club-ieee', 'Technical', '2026-12-12', '09:00 AM – 09:00 PM', 'Computing Complex Lab 03', 0, 100, 86, 'Computing & Engineering Students', 'published', 'A 12-hour intensive hackathon building next-generation AI agents and distributed systems. Mentored by industry leaders with cash prizes for top 3 teams.'),
('evt-3', 'EVT-2026-015', 'Rotaract Leadership Summit & Gala', 'Rotaract Club of University', 'club-rotaract', 'Community Service', '2026-12-18', '04:00 PM – 09:00 PM', 'University Grand Auditorium', 1200, 350, 310, 'Open to All Students & Alumni', 'published', 'An evening of inspiring keynotes on social impact leadership, networking banquet, and musical performances celebrating youth-led community projects.'),
('evt-4', 'EVT-2026-092', 'Drama Society Annual Theatre Night', 'University Drama Society', 'club-drama', 'Cultural', '2026-12-22', '06:00 PM – 09:00 PM', 'Lionel Wendt Memorial Hall', 400, 250, 250, 'All University Members', 'closed', 'A showcase of three student-written one-act plays touching on university life, identity, and satire. Special guest artist evaluations.'),
('evt-5', 'EVT-2026-104', 'Research Methodology & LaTeX Workshop', 'Academic Research Forum', 'club-research', 'Academic', '2027-01-08', '02:00 PM – 05:00 PM', 'Science Faculty Auditorium', 0, 80, 35, 'Final Year & Postgraduate Students', 'published', 'Hands-on practical guide to thesis typesetting in LaTeX, citation management with BibTeX, and submitting to peer-reviewed journals.'),
('evt-6', 'EVT-2026-033', 'Inter-Faculty Debate Series: Round 1', 'Debating Circle', 'club-debating', 'Academic', '2026-11-20', '03:00 PM – 06:00 PM', 'Arts Faculty Board Room', 0, 60, 60, 'Registered Debate Team Members', 'cancelled', 'Parliamentary style debate on tech ethics. Cancelled due to faculty exam scheduling clash.')
ON CONFLICT (id) DO NOTHING;

-- Registrations Seed
INSERT INTO public.registrations (id, reg_code, event_id, event_title, club_name, date, time, venue, status, fee)
VALUES
('reg-1', 'REG-2026-8812', 'evt-1', 'University Indoor Games Day 2026', 'University Sports Council', 'Dec 05, 2026', '08:30 AM', 'Indoor Sports Gymnasium', 'payment_pending', 500),
('reg-2', 'REG-2026-4401', 'evt-2', 'HackUCSC 2026: AI & Systems Hackathon', 'IEEE Student Branch', 'Dec 12, 2026', '09:00 AM', 'Computing Complex Lab 03', 'confirmed', 0),
('reg-3', 'REG-2026-1193', 'evt-3', 'Rotaract Leadership Summit & Gala', 'Rotaract Club of University', 'Dec 18, 2026', '04:00 PM', 'University Grand Auditorium', 'pending', 1200),
('reg-4', 'REG-2026-0922', 'evt-5', 'Research Methodology & LaTeX Workshop', 'Academic Research Forum', 'Jan 08, 2027', '02:00 PM', 'Science Faculty Auditorium', 'rejected', 0),
('reg-5', 'REG-2026-0331', 'evt-6', 'Inter-Faculty Debate Series: Round 1', 'Debating Circle', 'Nov 20, 2026', '03:00 PM', 'Arts Faculty Board Room', 'cancelled', 0)
ON CONFLICT (id) DO NOTHING;

-- Clubs Seed
INSERT INTO public.clubs (id, name, category, description, member_count, status, annual_fee, lead)
VALUES
('club-ieee', 'IEEE Student Branch', 'Technical', 'The premier technical student organization empowering undergraduates through workshops, hackathons, robotics, and professional networking.', 342, 'Active Member', 600, 'Dr. Ruwan Wickramasinghe (Branch Counselor)'),
('club-sports', 'University Sports Council', 'Sports', 'Coordinating inter-faculty athletic meets, university color awards, equipment loaning, and intramural championships.', 512, 'Active Member', 300, 'Captain A. Senanayake'),
('club-rotaract', 'Rotaract Club of University', 'Community Service', 'Fellowship through service. Organizing blood drives, rural school development, and environmental sustainability campaigns.', 280, 'Application Sent', 500, 'Rtr. Chathura Weerakoon'),
('club-drama', 'University Drama Society', 'Cultural', 'Fostering performing arts, stage production, screenwriting, and inter-university drama competitions.', 145, 'Following', 400, 'Prof. Malini Fonseka')
ON CONFLICT (id) DO NOTHING;

-- Badges Seed
INSERT INTO public.badges (id, code, name, type, status, club, description, icon, date_issued)
VALUES
('bdg-1', 'BDG-MEM-0023', 'IEEE Active Member', 'Membership', 'Issued', 'IEEE Student Branch', 'Verified active membership with attendance in at least 3 technical sessions during Academic Year 2025/2026.', 'verified_user', 'Oct 14, 2026'),
('bdg-2', 'BDG-MEM-0024', 'Leo Club Service Badge', 'Membership', 'Requirements Pending', 'Leo Club of Colombo', 'Requires completion of 20 community volunteer service hours and advisor sign-off.', 'hourglass_top', NULL),
('bdg-3', 'BDG-EVT-0089', 'Hackathon Finalist 2025', 'Participation', 'Issued', 'IEEE Student Branch', 'Achieved top 5 finalist position in National Inter-University Algorithmic Challenge.', 'workspace_premium', 'Nov 02, 2025'),
('bdg-4', 'BDG-EVT-0067', 'Inter-Faculty Athlete', 'Participation', 'Issued', 'University Sports Council', 'Represented Faculty of Computing in the 2025 Inter-Faculty Badminton Championship.', 'military_tech', 'Aug 19, 2025')
ON CONFLICT (id) DO NOTHING;

-- Notifications Seed
INSERT INTO public.notifications (id, title, description, timestamp, read, type, icon)
VALUES
('notif-1', 'Payment Hold Expiring Soon', 'Your seat for University Indoor Games Day 2026 will be released in less than 9 minutes if unpaid.', '2 mins ago', false, 'warning', 'timer'),
('notif-2', 'Registration Approved: HackUCSC 2026', 'Your team application has been approved by IEEE Student Branch. QR attendance pass generated.', '1 hour ago', false, 'success', 'check_circle'),
('notif-3', 'New Announcement: Extended Gym Hours', 'University Sports Council posted: Indoor Gymnasium open until 10:00 PM this week.', 'Yesterday', true, 'secondary', 'campaign'),
('notif-4', 'Debate Series Cancelled', 'Inter-Faculty Debate Round 1 has been cancelled due to faculty examination conflicts.', '3 days ago', true, 'error', 'event_busy')
ON CONFLICT (id) DO NOTHING;

-- Payments Seed
INSERT INTO public.payments (id, receipt_no, event_title, club_name, amount, date, status, refund_id)
VALUES
('tx-1', 'RCT-2026-9041', 'University Indoor Games Day 2026', 'University Sports Council', 500, 'Nov 24, 2026', 'Pending', NULL),
('tx-2', 'RCT-2026-7721', 'IEEE Annual Student Branch Membership 2026', 'IEEE Student Branch', 600, 'Oct 10, 2026', 'Successful', NULL),
('tx-3', 'RCT-2026-3109', 'Robotics Bootcamp Materials Kit', 'IEEE Robotics Chapter', 1500, 'Sep 15, 2026', 'Refund Completed', 'RFD-2026-1182')
ON CONFLICT (id) DO NOTHING;


-- =====================================================================
-- 7. PROPOSALS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.proposals (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    code TEXT NOT NULL,
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
    hold_duration TEXT,
    require_manual_approval BOOLEAN DEFAULT true,
    external_approval TEXT,
    submitted_at TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on proposals" ON public.proposals FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.proposals (id, code, title, club_id, club_name, category, event_date, time, venue, capacity, fee, budget, status, stage, stage_label, comment, submitted_at)
VALUES
('prop-1084', 'PROP-1084', 'Annual Athletics Meet 2026', 'club-sports', 'University Sports Council', 'Sports & Athletics', '2026-12-12', '08:00 AM – 06:00 PM', 'University Track & Ground', 250, 0, 85000, 'Higher Authority', 3, 'Dean of Student Affairs', NULL, '02 Nov 2026'),
('prop-1091', 'PROP-1091', 'Badminton Coaching Clinic', 'club-sports', 'University Sports Council', 'Workshop & Clinic', '2026-12-18', '09:00 AM – 03:00 PM', 'Main Indoor Hall', 50, 250, 32000, 'Revision Requested', 2, 'Lecturer Coordinator', 'Comment from Dr. Kavinda Silva (Lecturer Coordinator): Please attach updated shuttlecock & safety kit quotation.', '05 Nov 2026'),
('prop-1062', 'PROP-1062', 'University Indoor Games Day', 'club-sports', 'University Sports Council', 'Sports & Recreation', '2026-12-05', '08:30 AM – 05:00 PM', 'Main Hall · Indoor Gymnasium', 40, 500, 65000, 'Approved & Published', 4, 'Published on Explorer', NULL, '20 Oct 2026'),
('prop-1098', 'PROP-1098', 'Table Tennis Open Tournament', 'club-sports', 'University Sports Council', 'Sports & Recreation', '2026-12-08', '09:00 AM – 04:00 PM', 'Indoor Gymnasium · Main Hall', 64, 350, 24500, 'Draft', 1, 'Committee Draft', 'Missing venue confirmation document', '08 Nov 2026')
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- 8. CLUB MEMBERS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.club_members (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    student_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    faculty TEXT NOT NULL,
    role TEXT NOT NULL,
    club_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active',
    requested_date TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all on club_members" ON public.club_members FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.club_members (id, student_id, name, email, faculty, role, club_id, status, requested_date)
VALUES
('mem-1', 'UG/2023/CS/0012', 'Ishara De Silva', 'ishara.d@university.edu', 'Faculty of Computing', 'President', 'club-sports', 'Active', '15 Jan 2024'),
('mem-2', 'UG/2024/CS/0142', 'Nethmi Perera', 'nethmi.p@university.edu', 'Faculty of Computing', 'Secretary (Authorized Organizer)', 'club-sports', 'Active', '18 Feb 2024'),
('mem-3', 'UG/2023/MG/0199', 'Chamod Perera', 'chamod.p@university.edu', 'Faculty of Management', 'Treasurer', 'club-sports', 'Active', '10 Feb 2024'),
('mem-req-1', 'UG/2025/CS/0118', 'Ravindu Senanayake', 'ravindu.s@university.edu', 'Faculty of Computing', 'General Member', 'club-sports', 'Pending', '08 Nov 2026'),
('mem-req-2', 'UG/2025/EN/0302', 'Tharushi Gunawardena', 'tharushi.g@university.edu', 'Faculty of Engineering', 'General Member', 'club-sports', 'Pending', '07 Nov 2026'),
('mem-req-3', 'UG/2025/SC/0076', 'Malith Gunasekara', 'malith.g@university.edu', 'Faculty of Science', 'General Member', 'club-sports', 'Pending', '06 Nov 2026'),
('mem-req-4', 'UG/2024/MG/0211', 'Dinuka Peiris', 'dinuka.p@university.edu', 'Faculty of Management', 'General Member', 'club-sports', 'Pending', '05 Nov 2026')
ON CONFLICT (id) DO NOTHING;
