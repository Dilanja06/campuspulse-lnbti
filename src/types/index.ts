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
  check_in_status?: 'not_checked_in' | 'checked_in';
  checked_in_time?: string;
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
  status: 'Issued' | 'Requirements Pending';
  club: string;
  description: string;
  icon: string;
  date_issued?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'warning' | 'success' | 'error' | 'info' | 'secondary';
  icon: string;
}

export interface TransactionItem {
  id: string;
  receipt_no: string;
  event_title: string;
  club_name: string;
  amount: number;
  date: string;
  status: 'Successful' | 'Pending' | 'Refund Completed';
  refund_id?: string;
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
  status: 'Higher Authority' | 'Revision Requested' | 'Approved & Published' | 'Draft' | 'Committee Review' | 'In Review' | 'Pending Review' | 'Endorsed' | 'Rejected';
  stage: number;
  stage_label?: string;
  comment?: string;
  submitted_at: string;
  hold_duration?: string;
  require_manual_approval?: boolean;
  external_approval?: string;
  description?: string;
  authorities?: string[];
  committee_signoffs?: Array<{ name: string; role: string; date: string; status: string }>;
  coordinator_endorsement?: { name: string; date: string; comment?: string };
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
