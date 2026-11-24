export type StatusType = 
  | 'published' 
  | 'draft' 
  | 'cancelled' 
  | 'confirmed' 
  | 'pending' 
  | 'payment_pending' 
  | 'rejected' 
  | 'active' 
  | 'expired' 
  | 'success' 
  | 'warning' 
  | 'info' 
  | 'error' 
  | 'neutral';

export interface EventItem {
  id: string;
  code: string;
  title: string;
  club_name: string;
  club_id: string;
  category: 'Technical' | 'Sports' | 'Cultural' | 'Academic' | 'Community Service';
  start_date: string;
  time: string;
  venue: string;
  fee: number;
  capacity: number;
  registered: number;
  eligibility: string;
  status: 'published' | 'cancelled' | 'closed';
  description: string;
  image_url?: string;
  schedule?: Array<{ time: string; title: string; description: string }>;
  manual_approval?: boolean;
  hold_minutes?: number;
  refund_policy?: string;
  cancellation_reason?: string;
  proposal_id?: string;
  revision_number?: number;
}

export interface RegistrationItem {
  id: string;
  reg_code: string;
  event_id: string;
  event_title: string;
  club_name: string;
  date: string;
  time: string;
  venue: string;
  status: 'confirmed' | 'payment_pending' | 'pending' | 'rejected' | 'cancelled' | 'checked_in';
  fee: number;
  rejection_reason?: string;
  created_at: string;
  user_id?: string;
  user_name?: string;
  student_id?: string;
  user_email?: string;
  activity?: string;
  image_url?: string;
  check_in_status?: 'not_checked_in' | 'checked_in';
  checked_in_time?: string;
  hold_expires_at?: string;
}

export interface ClubItem {
  id: string;
  name: string;
  category: 'Technical' | 'Sports' | 'Cultural' | 'Academic' | 'Community Service';
  description: string;
  member_count: number;
  status: 'Active Member' | 'Following' | 'Application Sent' | 'Not Joined';
  annual_fee: number;
  lead: string;
  committee?: Array<{ name: string; role: string }>;
  announcements?: Array<{ title: string; date: string; content: string }>;
}

export interface BadgeItem {
  id: string;
  code: string;
  name: string;
  type: 'Membership' | 'Participation';
  status: 'Issued' | 'Requirements Pending' | 'Revoked';
  club: string;
  description: string;
  icon: string;
  user_id?: string;
  date_issued?: string;
  revoke_reason?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'warning' | 'success' | 'error' | 'info' | 'secondary';
  icon: string;
  user_id?: string;
  link?: string;
}

export interface TransactionItem {
  id: string;
  receipt_no: string;
  event_title: string;
  club_name: string;
  amount: number;
  date: string;
  status: 'Successful' | 'Pending' | 'Failed' | 'Expired' | 'Refund Completed';
  refund_id?: string;
  user_id?: string;
  event_id?: string;
  reg_id?: string;
}

export interface StudentProfile {
  name: string;
  student_id: string;
  email: string;
  faculty: string;
  degree: string;
  academic_year: string;
  avatar_initials: string;
  registered_device: {
    name: string;
    registered_date: string;
    last_active: string;
  };
  roles: string[];
}

export interface ProposalItem {
  id: string;
  code: string;
  title: string;
  club_id: string;
  club_name: string;
  category: string;
  event_date: string;
  time: string;
  venue: string;
  capacity: number;
  fee: number;
  budget: number;
  status:
    | 'Higher Authority'
    | 'Revision Requested'
    | 'Approved'
    | 'Approved & Published'
    | 'Draft'
    | 'Committee Review'
    | 'In Review'
    | 'Pending Review'
    | 'Endorsed'
    | 'Rejected';
  stage: number;
  stage_label?: string;
  comment?: string;
  submitted_at: string;
  hold_duration?: string;
  require_manual_approval?: boolean;
  external_approval?: string;
  image_url?: string;
  description?: string;
  purpose?: string;
  refund_policy?: string;
  document_name?: string;
  document_url?: string;
  current_revision?: number;
  authorities?: string[];
  committee_signoffs?: Array<{ name: string; role: string; date: string; status: string }>;
  coordinator_endorsement?: { name: string; by?: string; date: string; comment?: string };
}

export interface ClubMemberItem {
  id: string;
  student_id: string;
  name: string;
  email: string;
  faculty: string;
  role: string;
  club_id: string;
  status: 'Active' | 'Pending' | 'Declined';
  requested_date?: string;
}

export interface CoordinatorProfile {
  name: string;
  faculty_id: string;
  email: string;
  department: string;
  avatar_initials: string;
  role: string;
}

export interface AdminProfile {
  name: string;
  staff_id: string;
  email: string;
  role: string;
  avatar_initials: string;
}

export interface AuthorityProfile {
  name: string;
  staff_id: string;
  email: string;
  role: string;
  avatar_initials: string;
}

export interface DecisionRecord {
  id: string;
  code: string;
  event_title: string;
  club_name: string;
  date: string;
  outcome: 'Approved' | 'Returned' | 'Rejected';
  remarks: string;
}

export interface OfficialClubRecord {
  id: string;
  code: string;
  name: string;
  coordinator: string;
  committee_status: string;
  status: 'Active' | 'Charter Pending';
}

export interface RoleAssignment {
  id: string;
  name: string;
  identifier: string;
  role: string;
  scope: string;
  status: 'Active' | 'Officer Permission';
}

export interface PaymentMerchant {
  id: string;
  name: string;
  description: string;
  status: 'Live' | 'Maintenance';
  settlement: string;
}

export interface QRScannerDevice {
  id: string;
  device_id: string;
  hardware_officer: string;
  assigned_event: string;
  status: 'Authorized' | 'Revoked';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
}

export interface CommitteeMemberProfile {
  id: string;
  name: string;
  role: 'President' | 'Vice President' | 'Secretary' | 'Treasurer' | 'Asst. Treasurer';
  student_id: string;
  avatar_initials: string;
  club_name: string;
  club_id: string;
  pending_count: number;
}

export interface CommitteeSignoffSeat {
  seat_number: number;
  role: string;
  name: string;
  status: 'Signed' | 'Pending';
  note?: string;
  signed_at?: string;
}

export interface CommitteeActionItem {
  id: string;
  code: string;
  item_title: string;
  club_name: string;
  assigned_role: string;
  assigned_role_action: string;
  signed_count: number;
  total_seats: number;
  my_status: 'Pending' | 'Signed' | 'Rejected';
  budget?: number;
  date?: string;
  venue?: string;
  submitted_by?: string;
  line_items?: Array<{ label: string; amount: number }>;
  seats: CommitteeSignoffSeat[];
}

export interface ProposalRevision {
  id: string;
  proposal_id: string;
  revision_number: number;
  title: string;
  event_date: string;
  venue: string;
  capacity: number;
  fee: number;
  budget: number;
  status: string;
  submitted_at: string;
  reviewer_comment?: string;
}

export interface ExternalVerificationItem {
  id: string;
  proposal_id: string;
  proposal_code: string;
  event_title: string;
  club_name: string;
  issuer: string;
  reference_no: string;
  document_name: string;
  submitted_at: string;
  status: 'Pending Verification' | 'Verified' | 'Flagged Invalid';
  reviewer_note?: string;
}

export interface RefundRequestItem {
  id: string;
  refund_code: string;
  tx_id: string;
  receipt_no: string;
  event_id?: string;
  event_title: string;
  club_name: string;
  user_id?: string;
  student_name: string;
  student_id: string;
  amount: number;
  reason: string;
  status: 'Requested' | 'Under Review' | 'Approved' | 'Processing' | 'Completed' | 'Rejected';
  requested_at: string;
  resolved_at?: string;
  officer_note?: string;
}

export type QRScanOutcome =
  | 'Verified'
  | 'Expired'
  | 'Already Used'
  | 'Already Checked In'
  | 'Wrong Event'
  | 'Invalid Device'
  | 'Precondition Failed'
  | 'Network Error';

export interface AttendanceScanLog {
  id: string;
  event_id: string;
  event_title: string;
  reg_code: string;
  student_name: string;
  student_id: string;
  device_id: string;
  scanned_at: string;
  outcome: QRScanOutcome;
  message: string;
}

export interface ClubPostItem {
  id: string;
  club_id: string;
  club_name: string;
  title: string;
  content: string;
  audience: 'All Students' | 'Members Only';
  status: 'Published' | 'Hidden by Moderator';
  created_at: string;
  moderation_reason?: string;
}

export interface StudentRosterEntry {
  id: string;
  student_id: string;
  full_name: string;
  email: string;
  faculty: string;
  status: 'Verified' | 'Pending Review' | 'Suspended';
}

export interface SystemConfigSettings {
  payment_hold_minutes: number;
  qr_ttl_seconds: number;
  refund_window_hours: number;
  reward_tokens_per_event: number;
  allow_external_registrations: boolean;
}

export interface SupportRequestItem {
  id: string;
  user_email: string;
  category: 'Payment' | 'Registration' | 'Device Transfer' | 'Privacy Request';
  subject: string;
  status: 'Open' | 'Resolved';
  created_at: string;
  response?: string;
}
