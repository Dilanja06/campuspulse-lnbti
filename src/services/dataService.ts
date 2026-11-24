import { supabase } from '../supabaseClient';
import {
  EventItem,
  RegistrationItem,
  ClubItem,
  BadgeItem,
  NotificationItem,
  TransactionItem,
  ProposalItem,
  ClubMemberItem,
  OfficialClubRecord,
  RoleAssignment,
  PaymentMerchant,
  QRScannerDevice,
  AuditLog,
  DecisionRecord,
  CommitteeMemberProfile,
  CommitteeActionItem,
} from '../types';
import {
  initialEvents,
  initialRegistrations,
  initialClubs,
  initialBadges,
  initialNotifications,
  initialTransactions,
  initialProposals,
  initialClubMembers,
  initialOfficialClubs,
  initialRoleAssignments,
  initialPaymentMerchants,
  initialQRDevices,
  initialAuditLogs,
  initialDecisionHistory,
  sportsClubCommitteeMembers,
  getActiveCommitteeMember,
  setActiveCommitteeMember,
  initialCommitteeActions,
} from '../data/mockData';

export const dataService = {
  // --- EVENTS ---
  async getEvents(): Promise<EventItem[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as EventItem[];
      }

      if (!error && data && data.length === 0) {
        try {
          await supabase.from('events').insert(initialEvents);
        } catch (e) {
          console.warn('Auto-seed events notice:', e);
        }
      }
      return initialEvents;
    } catch {
      return initialEvents;
    }
  },

  async getEventById(id: string): Promise<EventItem | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        return data as EventItem;
      }
      return initialEvents.find((e) => e.id === id) || null;
    } catch {
      return initialEvents.find((e) => e.id === id) || null;
    }
  },

  // --- REGISTRATIONS ---
  async getRegistrations(): Promise<RegistrationItem[]> {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as RegistrationItem[];
      }

      if (!error && data && data.length === 0) {
        try {
          await supabase.from('registrations').insert(initialRegistrations);
        } catch (e) {
          console.warn('Auto-seed registrations notice:', e);
        }
      }
      return initialRegistrations;
    } catch {
      return initialRegistrations;
    }
  },

  async getRegistrationsByEvent(eventId: string): Promise<RegistrationItem[]> {
    const all = await this.getRegistrations();
    return all.filter((r) => r.event_id === eventId);
  },

  async createRegistration(
    registration: Omit<RegistrationItem, 'id' | 'created_at'>
  ): Promise<RegistrationItem> {
    const newReg: RegistrationItem = {
      ...registration,
      id: `reg-${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0],
    };

    try {
      const { data, error } = await supabase
        .from('registrations')
        .insert([newReg])
        .select()
        .single();

      if (!error && data) {
        initialRegistrations.unshift(data as RegistrationItem);
        return data as RegistrationItem;
      }
    } catch (e) {
      console.warn('Supabase createRegistration notice:', e);
    }

    initialRegistrations.unshift(newReg);
    return newReg;
  },

  async cancelRegistration(id: string): Promise<boolean> {
    const target = initialRegistrations.find((r) => r.id === id);
    if (target) {
      target.status = 'cancelled';
    }

    try {
      const { error } = await supabase
        .from('registrations')
        .update({ status: 'cancelled' })
        .eq('id', id);

      return !error;
    } catch (e) {
      console.warn('Supabase cancelRegistration notice:', e);
      return true;
    }
  },

  async approveRegistration(id: string): Promise<boolean> {
    const target = initialRegistrations.find((r) => r.id === id);
    const newStatus = target && target.fee > 0 ? 'payment_pending' : 'confirmed';
    if (target) {
      target.status = newStatus;
    }

    try {
      const { error } = await supabase
        .from('registrations')
        .update({ status: newStatus })
        .eq('id', id);

      return !error;
    } catch (e) {
      console.warn('Supabase approveRegistration notice:', e);
      return true;
    }
  },

  async declineRegistration(id: string, reason?: string): Promise<boolean> {
    const target = initialRegistrations.find((r) => r.id === id);
    if (target) {
      target.status = 'rejected';
      if (reason) target.rejection_reason = reason;
    }

    try {
      const { error } = await supabase
        .from('registrations')
        .update({ status: 'rejected', rejection_reason: reason })
        .eq('id', id);

      return !error;
    } catch (e) {
      console.warn('Supabase declineRegistration notice:', e);
      return true;
    }
  },

  async checkInRegistration(id: string): Promise<boolean> {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const target = initialRegistrations.find((r) => r.id === id);
    if (target) {
      target.status = 'checked_in';
      target.check_in_status = 'checked_in';
      target.checked_in_time = nowTime;
    }

    try {
      await supabase
        .from('registrations')
        .update({ status: 'checked_in', check_in_status: 'checked_in', checked_in_time: nowTime })
        .eq('id', id);
    } catch (e) {
      console.warn('Supabase checkIn notice:', e);
    }
    return true;
  },

  // --- PROPOSALS ---
  async getProposals(): Promise<ProposalItem[]> {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as ProposalItem[];
      }

      if (!error && data && data.length === 0) {
        try {
          await supabase.from('proposals').insert(initialProposals);
        } catch (e) {
          console.warn('Auto-seed proposals notice:', e);
        }
      }
      return initialProposals;
    } catch {
      return initialProposals;
    }
  },

  async getProposalById(idOrCode: string): Promise<ProposalItem | null> {
    const all = await this.getProposals();
    return all.find((p) => p.id === idOrCode || p.code === idOrCode) || null;
  },

  async createProposal(proposal: Omit<ProposalItem, 'id' | 'code' | 'submitted_at'>): Promise<ProposalItem> {
    const nextNum = Math.floor(1000 + Math.random() * 9000);
    const newProposal: ProposalItem = {
      ...proposal,
      id: `prop-${nextNum}`,
      code: `PROP-${nextNum}`,
      submitted_at: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };

    try {
      const { data, error } = await supabase
        .from('proposals')
        .insert([newProposal])
        .select()
        .single();

      if (!error && data) {
        initialProposals.unshift(data as ProposalItem);
        return data as ProposalItem;
      }
    } catch (e) {
      console.warn('Supabase createProposal notice:', e);
    }

    initialProposals.unshift(newProposal);
    return newProposal;
  },

  async endorseProposal(id: string, authorities: string[], comment?: string): Promise<boolean> {
    const target = initialProposals.find((p) => p.id === id || p.code === id);
    if (target) {
      target.status = 'Higher Authority';
      target.stage = 3;
      target.stage_label = 'Stage 3: Dean of Student Affairs';
      target.authorities = authorities;
      if (comment) target.comment = comment;
    }

    try {
      await supabase
        .from('proposals')
        .update({
          status: 'Higher Authority',
          stage: 3,
          stage_label: 'Stage 3: Dean of Student Affairs',
          comment,
        })
        .or(`id.eq.${id},code.eq.${id}`);
    } catch (e) {
      console.warn('Supabase endorseProposal notice:', e);
    }
    return true;
  },

  async requestRevisionProposal(id: string, comment: string): Promise<boolean> {
    const target = initialProposals.find((p) => p.id === id || p.code === id);
    if (target) {
      target.status = 'Revision Requested';
      target.stage = 2;
      target.comment = comment;
    }

    try {
      await supabase
        .from('proposals')
        .update({
          status: 'Revision Requested',
          stage: 2,
          comment,
        })
        .or(`id.eq.${id},code.eq.${id}`);
    } catch (e) {
      console.warn('Supabase requestRevision notice:', e);
    }
    return true;
  },

  async rejectProposal(id: string, comment?: string): Promise<boolean> {
    const target = initialProposals.find((p) => p.id === id || p.code === id);
    if (target) {
      target.status = 'Rejected';
      if (comment) target.comment = comment;
    }

    try {
      await supabase
        .from('proposals')
        .update({
          status: 'Rejected',
          comment,
        })
        .or(`id.eq.${id},code.eq.${id}`);
    } catch (e) {
      console.warn('Supabase rejectProposal notice:', e);
    }
    return true;
  },

  // --- HIGHER UNIVERSITY AUTHORITY OPERATIONS ---
  async getAuthorityDecisionHistory(): Promise<DecisionRecord[]> {
    return initialDecisionHistory;
  },

  async approveAuthorityStage(id: string, remarks: string): Promise<boolean> {
    const target = initialProposals.find((p) => p.id === id || p.code === id);
    if (target) {
      target.status = 'Approved & Published';
      target.stage = 4;
      target.stage_label = 'Published on Explorer';
      target.comment = remarks;

      const newDecision: DecisionRecord = {
        id: `dec-${Date.now()}`,
        code: target.code,
        event_title: target.title,
        club_name: target.club_name,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        outcome: 'Approved',
        remarks,
      };
      initialDecisionHistory.unshift(newDecision);
      this.logAuditEvent(`Executive Stage 3 Approved: ${target.title}`, target.code, 'Prof. Maheshika Perera');
    }
    return true;
  },

  async returnAuthorityStage(id: string, remarks: string): Promise<boolean> {
    const target = initialProposals.find((p) => p.id === id || p.code === id);
    if (target) {
      target.status = 'Revision Requested';
      target.stage = 2;
      target.stage_label = 'Revision Requested by Dean';
      target.comment = remarks;

      const newDecision: DecisionRecord = {
        id: `dec-${Date.now()}`,
        code: target.code,
        event_title: target.title,
        club_name: target.club_name,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        outcome: 'Returned',
        remarks,
      };
      initialDecisionHistory.unshift(newDecision);
      this.logAuditEvent(`Executive Stage 3 Returned for Revision: ${target.title}`, target.code, 'Prof. Maheshika Perera');
    }
    return true;
  },

  async rejectAuthorityStage(id: string, remarks: string): Promise<boolean> {
    const target = initialProposals.find((p) => p.id === id || p.code === id);
    if (target) {
      target.status = 'Rejected';
      target.comment = remarks;

      const newDecision: DecisionRecord = {
        id: `dec-${Date.now()}`,
        code: target.code,
        event_title: target.title,
        club_name: target.club_name,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        outcome: 'Rejected',
        remarks,
      };
      initialDecisionHistory.unshift(newDecision);
      this.logAuditEvent(`Executive Stage 3 Rejected: ${target.title}`, target.code, 'Prof. Maheshika Perera');
    }
    return true;
  },

  // --- CLUBS ---
  async getClubs(): Promise<ClubItem[]> {
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('*');

      if (!error && data && data.length > 0) {
        return data as ClubItem[];
      }

      if (!error && data && data.length === 0) {
        try {
          await supabase.from('clubs').insert(initialClubs);
        } catch (e) {
          console.warn('Auto-seed clubs notice:', e);
        }
      }
      return initialClubs;
    } catch {
      return initialClubs;
    }
  },

  async getClubById(id: string): Promise<ClubItem | null> {
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        return data as ClubItem;
      }
      return initialClubs.find((c) => c.id === id) || null;
    } catch {
      return initialClubs.find((c) => c.id === id) || null;
    }
  },

  // --- CLUB MEMBERS & JOIN REQUESTS ---
  async getClubMembers(clubId: string = 'club-sports'): Promise<ClubMemberItem[]> {
    try {
      const { data, error } = await supabase
        .from('club_members')
        .select('*')
        .eq('club_id', clubId);

      if (!error && data && data.length > 0) {
        return data as ClubMemberItem[];
      }

      if (!error && data && data.length === 0) {
        try {
          await supabase.from('club_members').insert(initialClubMembers);
        } catch (e) {
          console.warn('Auto-seed club members notice:', e);
        }
      }
      return initialClubMembers.filter((m) => m.club_id === clubId);
    } catch {
      return initialClubMembers.filter((m) => m.club_id === clubId);
    }
  },

  async approveClubMember(id: string): Promise<boolean> {
    const target = initialClubMembers.find((m) => m.id === id);
    if (target) target.status = 'Active';

    try {
      await supabase
        .from('club_members')
        .update({ status: 'Active' })
        .eq('id', id);
    } catch (e) {
      console.warn('Supabase approveClubMember notice:', e);
    }
    return true;
  },

  async declineClubMember(id: string): Promise<boolean> {
    const target = initialClubMembers.find((m) => m.id === id);
    if (target) target.status = 'Declined';

    try {
      await supabase
        .from('club_members')
        .update({ status: 'Declined' })
        .eq('id', id);
    } catch (e) {
      console.warn('Supabase declineClubMember notice:', e);
    }
    return true;
  },

  // --- BADGES ---
  async getBadges(): Promise<BadgeItem[]> {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*');

      if (!error && data && data.length > 0) {
        return data as BadgeItem[];
      }

      if (!error && data && data.length === 0) {
        try {
          await supabase.from('badges').insert(initialBadges);
        } catch (e) {
          console.warn('Auto-seed badges notice:', e);
        }
      }
      return initialBadges;
    } catch {
      return initialBadges;
    }
  },

  // --- NOTIFICATIONS ---
  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*');

      if (!error && data && data.length > 0) {
        return data as NotificationItem[];
      }

      if (!error && data && data.length === 0) {
        try {
          await supabase.from('notifications').insert(initialNotifications);
        } catch (e) {
          console.warn('Auto-seed notifications notice:', e);
        }
      }
      return initialNotifications;
    } catch {
      return initialNotifications;
    }
  },

  async markNotificationRead(id: string): Promise<void> {
    const target = initialNotifications.find((n) => n.id === id);
    if (target) target.read = true;

    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
    } catch (e) {
      console.warn('Supabase markNotificationRead notice:', e);
    }
  },

  async markAllNotificationsRead(): Promise<void> {
    initialNotifications.forEach((n) => (n.read = true));

    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false);
    } catch (e) {
      console.warn('Supabase markAllNotificationsRead notice:', e);
    }
  },

  // --- PAYMENTS ---
  async getPayments(): Promise<TransactionItem[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*');

      if (!error && data && data.length > 0) {
        return data as TransactionItem[];
      }

      if (!error && data && data.length === 0) {
        try {
          await supabase.from('payments').insert(initialTransactions);
        } catch (e) {
          console.warn('Auto-seed payments notice:', e);
        }
      }
      return initialTransactions;
    } catch {
      return initialTransactions;
    }
  },

  async updatePaymentStatus(id: string, status: string): Promise<boolean> {
    const target = initialTransactions.find((t) => t.id === id);
    if (target) target.status = status as any;

    try {
      const { error } = await supabase
        .from('payments')
        .update({ status })
        .eq('id', id);

      return !error;
    } catch (e) {
      console.warn('Supabase updatePaymentStatus notice:', e);
      return false;
    }
  },

  // --- CENTRAL ADMIN OPERATIONS ---
  async getOfficialClubs(): Promise<OfficialClubRecord[]> {
    return initialOfficialClubs;
  },

  async activateOfficialClub(id: string): Promise<boolean> {
    const target = initialOfficialClubs.find((c) => c.id === id || c.code === id);
    if (target) {
      target.status = 'Active';
      target.committee_status = '5/5 Verified';
    }
    return true;
  },

  async registerOfficialClub(record: Omit<OfficialClubRecord, 'id'>): Promise<OfficialClubRecord> {
    const newRecord: OfficialClubRecord = {
      ...record,
      id: `rec-${Date.now()}`,
    };
    initialOfficialClubs.push(newRecord);
    return newRecord;
  },

  async getRoleAssignments(): Promise<RoleAssignment[]> {
    return initialRoleAssignments;
  },

  async revokeRole(id: string): Promise<boolean> {
    const idx = initialRoleAssignments.findIndex((r) => r.id === id || r.identifier === id);
    if (idx !== -1) {
      initialRoleAssignments.splice(idx, 1);
    }
    return true;
  },

  async assignRole(assignment: Omit<RoleAssignment, 'id'>): Promise<RoleAssignment> {
    const newRole: RoleAssignment = {
      ...assignment,
      id: `role-${Date.now()}`,
    };
    initialRoleAssignments.push(newRole);
    return newRole;
  },

  async getPaymentMerchants(): Promise<PaymentMerchant[]> {
    return initialPaymentMerchants;
  },

  async getQRDevices(): Promise<QRScannerDevice[]> {
    return initialQRDevices;
  },

  async revokeQRDevice(id: string): Promise<boolean> {
    const target = initialQRDevices.find((d) => d.id === id || d.device_id === id);
    if (target) {
      target.status = 'Revoked';
    }
    return true;
  },

  async pairQRDevice(device: Omit<QRScannerDevice, 'id'>): Promise<QRScannerDevice> {
    const newDev: QRScannerDevice = {
      ...device,
      id: `dev-${Date.now()}`,
    };
    initialQRDevices.push(newDev);
    return newDev;
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    return initialAuditLogs;
  },

  async logAuditEvent(action: string, target: string, actor: string = 'Amila Dissanayake'): Promise<AuditLog> {
    const newLog: AuditLog = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ' ·'),
      actor,
      action,
      target,
    };
    initialAuditLogs.unshift(newLog);
    return newLog;
  },

  // --- CLUB COMMITTEE DECISION-MAKERS (5 SEATS) ---
  async getCommitteeMembers(): Promise<CommitteeMemberProfile[]> {
    return sportsClubCommitteeMembers;
  },

  getCurrentCommitteeMember(): CommitteeMemberProfile {
    return getActiveCommitteeMember();
  },

  switchCommitteeMember(id: string): CommitteeMemberProfile {
    setActiveCommitteeMember(id);
    return getActiveCommitteeMember();
  },

  async getCommitteeActions(): Promise<CommitteeActionItem[]> {
    return initialCommitteeActions;
  },

  async signOffCommitteeAction(actionId: string, note?: string): Promise<boolean> {
    const action = initialCommitteeActions.find(
      (a) => a.id === actionId || a.code === actionId
    );
    const activeMember = getActiveCommitteeMember();

    if (action) {
      const seat = action.seats.find(
        (s) => s.role.toLowerCase() === activeMember.role.toLowerCase() || s.name === activeMember.name
      );
      if (seat && seat.status !== 'Signed') {
        seat.status = 'Signed';
        seat.note = note || 'Verified & Signed by ' + activeMember.role;
        seat.signed_at = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        action.signed_count = action.seats.filter((s) => s.status === 'Signed').length;
      }

      action.my_status = 'Signed';

      // If all 5 signed, transition the proposal
      if (action.signed_count >= action.total_seats) {
        const prop = initialProposals.find((p) => p.code === action.code);
        if (prop) {
          prop.stage = 2;
          prop.stage_label = 'Lecturer Coordinator Review';
          prop.status = 'Pending Review';
        }
      }

      this.logAuditEvent(
        `Committee Sign-off: ${action.item_title} (${action.code})`,
        action.code,
        `${activeMember.name} (${activeMember.role})`
      );
    }
    return true;
  },

  async requestCommitteeActionChanges(actionId: string, note: string): Promise<boolean> {
    const action = initialCommitteeActions.find(
      (a) => a.id === actionId || a.code === actionId
    );
    const activeMember = getActiveCommitteeMember();
    if (action) {
      action.my_status = 'Rejected';
      const prop = initialProposals.find((p) => p.code === action.code);
      if (prop) {
        prop.status = 'Revision Requested';
        prop.comment = note;
      }
      this.logAuditEvent(
        `Committee Revision Requested: ${action.item_title}`,
        action.code,
        `${activeMember.name} (${activeMember.role})`
      );
    }
    return true;
  },
};

export default dataService;
