import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { dbHealthBus } from '../context/DatabaseStatusContext';
import { getEventCoverImage } from '../utils/eventImages';
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
  ProposalRevision,
  ExternalVerificationItem,
  RefundRequestItem,
  AttendanceScanLog,
  ClubPostItem,
  StudentRosterEntry,
  SystemConfigSettings,
  SupportRequestItem,
  QRScanOutcome,
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
  initialProposalRevisions,
  initialExternalVerifications,
  initialRefundRequests,
  initialAttendanceLogs,
  initialClubPosts,
  initialStudentRoster,
  initialSystemConfig,
  initialSupportRequests,
} from '../data/mockData';

function recordLiveOrFallback(error: any, context: string): boolean {
  if (error) {
    console.warn(`[CampusPulse DB] ${context}:`, error.message || error);
    // Only mark global fallback if connectivity or missing schema fails on core reads;
    // RLS/permission issues surface honestly instead of claiming everything is healthy.
    if (error.code === 'PGRST204' || error.code === '42P01' || error.code === '42703' || error.message?.includes('fetch')) {
      dbHealthBus.emitFallback(`${context}: ${error.message || 'Database schema/network issue'}`);
    }
    return false;
  }
  dbHealthBus.emitLive();
  return true;
}

const dataListeners = new Set<() => void>();
const locallyReadNotificationIds = new Set<string>();

function normalizeSectionRoute(path: string): string {
  const clean = path.split('?')[0].toLowerCase();
  if (clean.startsWith('/payments')) return clean.replace('/payments', '/payment');
  if (clean.startsWith('/refunds')) return clean.replace('/refunds', '/refund-status');
  if (clean.startsWith('/coordinator/queue')) return clean.replace('/coordinator/queue', '/coordinator/proposals');
  if (clean.startsWith('/profile')) return clean.replace('/profile', '/my-profile');
  return clean;
}

const TRACKED_SECTION_PREFIXES = [
  '/payment',
  '/my-registrations',
  '/my-qr',
  '/refund-status',
  '/my-badges',
  '/my-memberships',
  '/clubs',
  '/organizer/proposals',
  '/organizer/events',
  '/organizer/registrations',
  '/organizer/attendance',
  '/organizer/refunds',
  '/organizer/members',
  '/coordinator/proposals',
  '/coordinator/clubs',
  '/authority/stages',
  '/authority/history',
  '/committee/actions',
  '/verification',
  '/admin/records',
  '/admin/roles',
  '/admin/merchants',
  '/admin/governance',
  '/admin/audits',
];

export const dataService = {
  subscribe(listener: () => void): () => void {
    dataListeners.add(listener);
    return () => {
      dataListeners.delete(listener);
    };
  },

  emitChange(): void {
    dataListeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.warn('dataService listener error:', err);
      }
    });
  },

  // --- STORAGE UPLOAD ---
  async uploadAsset(file: File, folder: 'flyers' | 'documents' = 'flyers'): Promise<{ url: string; name: string }> {
    const cleanName = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.storage
          .from('campuspulse-assets')
          .upload(cleanName, file, { upsert: true });
        if (!error && data) {
          const { data: pub } = supabase.storage.from('campuspulse-assets').getPublicUrl(data.path);
          return { url: pub.publicUrl, name: file.name };
        }
      } catch (e) {
        console.warn('Supabase Storage upload fallback (using local metadata/preview):', e);
      }
    }

    // Fallback for local preview & viewing (support PDFs, Docs, and Images up to 10MB)
    if (file.size <= 10 * 1024 * 1024) {
      try {
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
        if (dataUrl && dataUrl.length > 0) {
          return { url: dataUrl, name: file.name };
        }
      } catch {
        // fallback to object URL below
      }
    }
    if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      try {
        const blobUrl = URL.createObjectURL(file);
        return { url: blobUrl, name: file.name };
      } catch {
        // fallback
      }
    }
    return { url: `local-attachment://${cleanName}`, name: file.name };
  },

  // --- EVENTS ---
  async getEvents(): Promise<EventItem[]> {
    if (!isSupabaseConfigured) {
      return initialEvents.map((ev) => ({ ...ev, image_url: ev.image_url || getEventCoverImage(ev) }));
    }
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });

      if (recordLiveOrFallback(error, 'getEvents') && data && data.length > 0) {
        return (data as EventItem[]).map((ev) => ({
          ...ev,
          image_url: ev.image_url || getEventCoverImage(ev),
        }));
      }
    } catch (e) {
      recordLiveOrFallback(e, 'getEvents exception');
    }
    return initialEvents.map((ev) => ({
      ...ev,
      image_url: ev.image_url || getEventCoverImage(ev),
    }));
  },

  async getEventById(id: string): Promise<EventItem | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (recordLiveOrFallback(error, 'getEventById') && data) {
          const ev = data as EventItem;
          return { ...ev, image_url: ev.image_url || getEventCoverImage(ev) };
        }
      } catch (e) {
        recordLiveOrFallback(e, 'getEventById exception');
      }
    }
    const found = initialEvents.find((e) => e.id === id);
    return found ? { ...found, image_url: found.image_url || getEventCoverImage(found) } : null;
  },

  async createEvent(event: Omit<EventItem, 'id' | 'code'> & { code?: string }): Promise<EventItem> {
    const nextNum = Math.floor(100 + Math.random() * 900);
    const newEvent: EventItem = {
      ...event,
      id: `evt-${Date.now()}`,
      code: event.code || `EVT-2026-${nextNum}`,
      registered: event.registered || 0,
      status: event.status || 'published',
      eligibility: event.eligibility || 'All Registered Undergraduates',
      schedule: event.schedule || [],
      manual_approval: event.manual_approval ?? false,
      hold_minutes: event.hold_minutes ?? 10,
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('events')
          .insert([newEvent])
          .select()
          .maybeSingle();

        if (recordLiveOrFallback(error, 'createEvent') && data) {
          initialEvents.unshift(data as EventItem);
          return data as EventItem;
        }
      } catch (e) {
        recordLiveOrFallback(e, 'createEvent exception');
      }
    }

    initialEvents.unshift(newEvent);
    return newEvent;
  },

  async updateEvent(id: string, updates: Partial<EventItem>): Promise<boolean> {
    const target = initialEvents.find((e) => e.id === id);
    if (target) {
      Object.assign(target, updates);
    }
    if (!isSupabaseConfigured) return true;
    try {
      const { error } = await supabase.from('events').update(updates).eq('id', id);
      return recordLiveOrFallback(error, 'updateEvent');
    } catch (e) {
      recordLiveOrFallback(e, 'updateEvent exception');
      return false;
    }
  },

  async cancelEventWithImpact(
    eventId: string,
    reason: string,
    notifyParticipants: boolean
  ): Promise<{ success: boolean; affectedRegistrations: number; refundsCreated: number; error?: string }> {
    const ev = initialEvents.find((e) => e.id === eventId) || (await this.getEventById(eventId));
    if (!ev) return { success: false, affectedRegistrations: 0, refundsCreated: 0, error: 'Event not found.' };

    ev.status = 'cancelled';
    ev.cancellation_reason = reason;
    await this.updateEvent(eventId, { status: 'cancelled', cancellation_reason: reason });

    const regs = await this.getRegistrationsByEvent(eventId);
    let affected = 0;
    let refundsCreated = 0;

    for (const r of regs) {
      if (r.status !== 'cancelled' && r.status !== 'rejected') {
        affected++;
        await this.updateRegistrationStatus(r.id, 'cancelled');

        if ((r.status === 'confirmed' || r.status === 'checked_in') && r.fee > 0) {
          const rfdCode = `RFD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
          const newRefund: RefundRequestItem = {
            id: `rfd-${Date.now()}-${refundsCreated}`,
            refund_code: rfdCode,
            tx_id: `tx-${r.id}`,
            receipt_no: `RCT-${r.reg_code}`,
            event_id: eventId,
            event_title: ev.title,
            club_name: ev.club_name,
            user_id: r.user_id,
            student_name: r.user_name || 'Student Member',
            student_id: r.student_id || 'UG/2024/0000',
            amount: r.fee,
            reason: `Event cancelled by organizer: ${reason}`,
            status: 'Approved',
            requested_at: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            officer_note: 'Auto-approved full refund due to official event cancellation.',
          };
          initialRefundRequests.unshift(newRefund);
          refundsCreated++;

          if (isSupabaseConfigured) {
            try {
              await supabase.from('refund_requests').insert([newRefund]);
            } catch (err) {
              console.warn('Refund batch insert error:', err);
            }
          }
        }
      }
    }

    if (notifyParticipants) {
      await this.addNotification({
        title: `Event Cancelled: ${ev.title}`,
        description: `${ev.club_name} cancelled this event. Reason: ${reason}. Eligible paid tickets have auto-queued full refunds.`,
        timestamp: 'Just now',
        read: false,
        type: 'error',
        icon: 'event_busy',
        link: '/refund-status',
      });
    }

    await this.logAuditEvent(`Cancelled Event (${affected} affected, ${refundsCreated} refunds): ${ev.title}`, ev.code);
    return { success: true, affectedRegistrations: affected, refundsCreated };
  },

  // --- REGISTRATIONS ---
  async getRegistrations(userFilter?: { userId?: string; userEmail?: string }): Promise<RegistrationItem[]> {
    let list: RegistrationItem[] = initialRegistrations;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('registrations')
          .select('*')
          .order('created_at', { ascending: false });

        if (recordLiveOrFallback(error, 'getRegistrations') && data && data.length > 0) {
          list = data as RegistrationItem[];
        }
      } catch (e) {
        recordLiveOrFallback(e, 'getRegistrations exception');
      }
    }

    if (userFilter && (userFilter.userId || userFilter.userEmail)) {
      const uid = userFilter.userId;
      const email = userFilter.userEmail?.toLowerCase();
      return list.filter(
        (r) =>
          (uid && r.user_id === uid) ||
          (email && r.user_email?.toLowerCase() === email)
      );
    }

    return list;
  },

  async getRegistrationsByEvent(eventId: string): Promise<RegistrationItem[]> {
    const all = await this.getRegistrations();
    return all.filter((r) => r.event_id === eventId);
  },

  async registerForEventAtomic(params: {
    event: EventItem;
    userId: string;
    userName: string;
    studentId: string;
    userEmail: string;
    activity?: string;
  }): Promise<{ success: boolean; registration?: RegistrationItem; error?: string }> {
    const { event, userId, userName, studentId, userEmail, activity } = params;

    if (event.status !== 'published') {
      return { success: false, error: `Registration is unavailable (event status: ${event.status}).` };
    }
    if (event.registered >= event.capacity) {
      return { success: false, error: 'This event has reached maximum seat capacity.' };
    }

    // Duplicate registration check (exclude cancelled / rejected)
    const userRegs = await this.getRegistrations({ userId, userEmail });
    const existing = userRegs.find(
      (r) => r.event_id === event.id && r.status !== 'cancelled' && r.status !== 'rejected'
    );
    if (existing) {
      return { success: false, error: `You already hold an active registration (${existing.reg_code}) for this event.` };
    }

    const newId = `reg-${Date.now()}`;
    const regCode = `REG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const needsApproval = Boolean(event.manual_approval);
    const holdMinutes = event.hold_minutes || initialSystemConfig.payment_hold_minutes || 10;
    const targetStatus: RegistrationItem['status'] = needsApproval
      ? 'pending'
      : event.fee > 0
      ? 'payment_pending'
      : 'confirmed';

    const holdExpiresAt =
      targetStatus === 'payment_pending'
        ? new Date(Date.now() + holdMinutes * 60 * 1000).toISOString()
        : undefined;

    const newReg: RegistrationItem = {
      id: newId,
      reg_code: regCode,
      event_id: event.id,
      event_title: event.title,
      club_name: event.club_name,
      date: event.start_date,
      time: event.time,
      venue: event.venue,
      status: targetStatus,
      fee: event.fee,
      created_at: new Date().toISOString().split('T')[0],
      user_id: userId,
      user_name: userName,
      student_id: studentId,
      user_email: userEmail,
      activity: activity || 'General Participant',
      image_url: event.image_url,
      check_in_status: 'not_checked_in',
      hold_expires_at: holdExpiresAt,
    };

    if (isSupabaseConfigured) {
      try {
        const { data: rpcRes, error: rpcErr } = await supabase.rpc('register_student_for_event', {
          p_id: newId,
          p_reg_code: regCode,
          p_event_id: event.id,
          p_user_id: userId,
          p_user_name: userName,
          p_student_id: studentId,
          p_user_email: userEmail,
          p_activity: activity || 'General Participant',
        });

        if (!rpcErr && rpcRes) {
          if (rpcRes.success === false) {
            return { success: false, error: rpcRes.error || 'Registration failed.' };
          }
          newReg.status = rpcRes.status || targetStatus;
          newReg.hold_expires_at = rpcRes.hold_expires_at || holdExpiresAt;
          initialRegistrations.unshift(newReg);
          const localEv = initialEvents.find((e) => e.id === event.id);
          if (localEv && !needsApproval) localEv.registered += 1;
          dbHealthBus.emitLive();
        } else {
          // Fallback to table insert if RPC not deployed yet
          const { error: insErr } = await supabase.from('registrations').insert([newReg]);
          if (insErr) {
            recordLiveOrFallback(insErr, 'registerForEventAtomic insert');
          } else if (!needsApproval) {
            await supabase
              .from('events')
              .update({ registered: event.registered + 1 })
              .eq('id', event.id);
          }
          initialRegistrations.unshift(newReg);
          const localEv = initialEvents.find((e) => e.id === event.id);
          if (localEv && !needsApproval) localEv.registered += 1;
        }
      } catch (e) {
        recordLiveOrFallback(e, 'registerForEventAtomic exception');
        initialRegistrations.unshift(newReg);
      }
    } else {
      initialRegistrations.unshift(newReg);
      const localEv = initialEvents.find((e) => e.id === event.id);
      if (localEv && !needsApproval) localEv.registered += 1;
    }

    // Only create pending payment if seat is approved/reserved and fee > 0 (SRS Sec. 10)
    if (newReg.status === 'payment_pending' && event.fee > 0) {
      await this.createPayment({
        id: `tx-${Date.now()}`,
        receipt_no: `RCT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        event_title: event.title,
        club_name: event.club_name,
        amount: event.fee,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: 'Pending',
        user_id: userId,
        event_id: event.id,
        reg_id: newReg.id,
      });
      await this.addNotification({
        title: `Payment Hold Active (${holdMinutes} mins)`,
        description: `Complete LKR ${event.fee} payment for ${event.title} within ${holdMinutes} minutes to lock in your seat.`,
        timestamp: 'Just now',
        read: false,
        type: 'warning',
        icon: 'timer',
        user_id: userId,
        link: '/payment',
      });
    } else if (newReg.status === 'pending') {
      await this.addNotification({
        title: `Application Submitted: ${event.title}`,
        description: `Your application (${newReg.reg_code}) is awaiting Club Officer eligibility review. Payment will be requested only after approval.`,
        timestamp: 'Just now',
        read: false,
        type: 'info',
        icon: 'pending',
        user_id: userId,
        link: '/my-registrations',
      });
    } else if (newReg.status === 'confirmed') {
      await this.addNotification({
        title: `Seat Confirmed: ${event.title}`,
        description: `Registration ${newReg.reg_code} confirmed. Your dynamic Attendance QR Pass is ready.`,
        timestamp: 'Just now',
        read: false,
        type: 'success',
        icon: 'check_circle',
        user_id: userId,
        link: '/my-qr',
      });
    }

    return { success: true, registration: newReg };
  },

  async createRegistration(
    registration: Omit<RegistrationItem, 'id' | 'created_at'>
  ): Promise<RegistrationItem> {
    const newReg: RegistrationItem = {
      ...registration,
      id: `reg-${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0],
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('registrations')
          .insert([newReg])
          .select()
          .maybeSingle();

        if (recordLiveOrFallback(error, 'createRegistration') && data) {
          initialRegistrations.unshift(data as RegistrationItem);
          return data as RegistrationItem;
        }
      } catch (e) {
        recordLiveOrFallback(e, 'createRegistration exception');
      }
    }

    initialRegistrations.unshift(newReg);
    return newReg;
  },

  async addRegistration(
    registration: Omit<RegistrationItem, 'id' | 'created_at'>
  ): Promise<RegistrationItem> {
    return this.createRegistration(registration);
  },

  async updateRegistrationStatus(id: string, status: RegistrationItem['status']): Promise<boolean> {
    const target = initialRegistrations.find((r) => r.id === id || r.reg_code === id);
    if (target) target.status = status;

    if (!isSupabaseConfigured) return true;
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ status })
        .or(`id.eq.${id},reg_code.eq.${id}`);
      return recordLiveOrFallback(error, 'updateRegistrationStatus');
    } catch (e) {
      recordLiveOrFallback(e, 'updateRegistrationStatus exception');
      return false;
    }
  },

  async cancelRegistration(id: string): Promise<boolean> {
    const target = initialRegistrations.find((r) => r.id === id);
    const wasConfirmed = target && (target.status === 'confirmed' || target.status === 'payment_pending');
    if (target) target.status = 'cancelled';

    if (target && wasConfirmed) {
      const ev = initialEvents.find((e) => e.id === target.event_id);
      if (ev && ev.registered > 0) ev.registered -= 1;
    }

    if (!isSupabaseConfigured) {
      this.emitChange();
      return true;
    }
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ status: 'cancelled' })
        .eq('id', id);
      const ok = recordLiveOrFallback(error, 'cancelRegistration');
      this.emitChange();
      return ok;
    } catch (e) {
      recordLiveOrFallback(e, 'cancelRegistration exception');
      this.emitChange();
      return false;
    }
  },

  async approveRegistration(id: string): Promise<boolean> {
    const target = initialRegistrations.find((r) => r.id === id);
    const holdMinutes = initialSystemConfig.payment_hold_minutes || 10;
    const newStatus: RegistrationItem['status'] = target && target.fee > 0 ? 'payment_pending' : 'confirmed';
    const holdExpiresAt =
      newStatus === 'payment_pending'
        ? new Date(Date.now() + holdMinutes * 60 * 1000).toISOString()
        : undefined;

    if (target) {
      target.status = newStatus;
      target.hold_expires_at = holdExpiresAt;
      const ev = initialEvents.find((e) => e.id === target.event_id);
      if (ev && ev.registered < ev.capacity) ev.registered += 1;
    }

    if (newStatus === 'payment_pending' && target) {
      await this.createPayment({
        id: `tx-${Date.now()}`,
        receipt_no: `RCT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        event_title: target.event_title,
        club_name: target.club_name,
        amount: target.fee,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: 'Pending',
        user_id: target.user_id,
        event_id: target.event_id,
        reg_id: target.id,
      });
    }

    if (!isSupabaseConfigured) return true;
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ status: newStatus, hold_expires_at: holdExpiresAt || null })
        .eq('id', id);
      const ok = recordLiveOrFallback(error, 'approveRegistration');
      this.emitChange();
      return ok;
    } catch (e) {
      recordLiveOrFallback(e, 'approveRegistration exception');
      this.emitChange();
      return false;
    }
  },

  async declineRegistration(id: string, reason?: string): Promise<boolean> {
    const target = initialRegistrations.find((r) => r.id === id);
    if (target) {
      target.status = 'rejected';
      if (reason) target.rejection_reason = reason;
    }

    if (!isSupabaseConfigured) {
      this.emitChange();
      return true;
    }
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ status: 'rejected', rejection_reason: reason })
        .eq('id', id);
      const ok = recordLiveOrFallback(error, 'declineRegistration');
      this.emitChange();
      return ok;
    } catch (e) {
      recordLiveOrFallback(e, 'declineRegistration exception');
      this.emitChange();
      return false;
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

    if (!isSupabaseConfigured) return true;
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ status: 'checked_in', check_in_status: 'checked_in', checked_in_time: nowTime })
        .eq('id', id);
      return recordLiveOrFallback(error, 'checkInRegistration');
    } catch (e) {
      recordLiveOrFallback(e, 'checkInRegistration exception');
      return false;
    }
  },

  // --- QR SCAN VERIFICATION (M05-M07, NO MANUAL BYPASS) ---
  async verifyAndScanQR(params: {
    qrToken: string;
    eventId: string;
    deviceId: string;
  }): Promise<{ outcome: QRScanOutcome; message: string; log: AttendanceScanLog }> {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const events = await this.getEvents();
    const targetEvent = events.find((e) => e.id === params.eventId) || events[0];
    const devices = await this.getQRDevices();
    const activeDev = devices.find((d) => d.device_id === params.deviceId && d.status === 'Authorized');

    const recordLog = async (
      outcome: QRScanOutcome,
      message: string,
      regCode = 'UNKNOWN',
      studentName = 'Unknown Student',
      studentId = '—'
    ): Promise<{ outcome: QRScanOutcome; message: string; log: AttendanceScanLog }> => {
      const log: AttendanceScanLog = {
        id: `scan-${Date.now()}`,
        event_id: params.eventId,
        event_title: targetEvent?.title || params.eventId,
        reg_code: regCode,
        student_name: studentName,
        student_id: studentId,
        device_id: params.deviceId,
        scanned_at: nowStr,
        outcome,
        message,
      };
      initialAttendanceLogs.unshift(log);
      if (isSupabaseConfigured) {
        try {
          await supabase.from('attendance_logs').insert([log]);
        } catch (err) {
          console.warn('Attendance log insert warning:', err);
        }
      }
      return { outcome, message, log };
    };

    if (!activeDev) {
      return recordLog(
        'Invalid Device',
        `Scanner ${params.deviceId} is not authorized or has been revoked by Central Admin.`
      );
    }

    // Parse payload format: CP1|<reg_code>|<event_id>|<issued_ms> OR raw reg_code
    const parts = params.qrToken.trim().split('|');
    let regCode = params.qrToken.trim();
    let tokenEventId = params.eventId;
    let issuedMs: number | null = null;

    if (parts[0] === 'CP1' && parts.length >= 4) {
      regCode = parts[1];
      tokenEventId = parts[2];
      issuedMs = parseInt(parts[3], 10);
    }

    if (tokenEventId !== params.eventId) {
      return recordLog(
        'Wrong Event',
        `Pass belongs to event ${tokenEventId}, not selected event ${params.eventId}.`,
        regCode
      );
    }

    const ttlMs = (initialSystemConfig.qr_ttl_seconds || 30) * 1000;
    if (issuedMs && !Number.isNaN(issuedMs) && Date.now() - issuedMs > ttlMs) {
      return recordLog(
        'Expired',
        `Dynamic QR token expired (exceeded ${initialSystemConfig.qr_ttl_seconds}s refresh window). Student must refresh pass.`,
        regCode
      );
    }

    const allRegs = await this.getRegistrations();
    const reg = allRegs.find(
      (r) => r.reg_code.toLowerCase() === regCode.toLowerCase() || r.id.toLowerCase() === regCode.toLowerCase()
    );

    if (!reg) {
      return recordLog('Precondition Failed', `No registration record matches token "${regCode}".`, regCode);
    }

    if (reg.event_id !== params.eventId) {
      return recordLog(
        'Wrong Event',
        `Registration ${reg.reg_code} is registered for ${reg.event_title}.`,
        reg.reg_code,
        reg.user_name,
        reg.student_id
      );
    }

    if (reg.status === 'checked_in' || reg.check_in_status === 'checked_in') {
      return recordLog(
        'Already Checked In',
        `${reg.user_name || 'Student'} already checked in at ${reg.checked_in_time || 'earlier'}.`,
        reg.reg_code,
        reg.user_name,
        reg.student_id
      );
    }

    if (reg.status !== 'confirmed') {
      return recordLog(
        'Precondition Failed',
        `Cannot check in: registration status is "${reg.status.replace('_', ' ')}" (confirmed status required).`,
        reg.reg_code,
        reg.user_name,
        reg.student_id
      );
    }

    await this.checkInRegistration(reg.id);
    return recordLog(
      'Verified',
      `Attendance verified and recorded for ${reg.user_name || reg.reg_code}.`,
      reg.reg_code,
      reg.user_name || 'Verified Student',
      reg.student_id || 'UG/2024'
    );
  },

  async getAttendanceLogs(): Promise<AttendanceScanLog[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('attendance_logs')
          .select('*')
          .order('created_at', { ascending: false });
        if (recordLiveOrFallback(error, 'getAttendanceLogs') && data && data.length > 0) {
          return data as AttendanceScanLog[];
        }
      } catch (e) {
        recordLiveOrFallback(e, 'getAttendanceLogs exception');
      }
    }
    return initialAttendanceLogs;
  },

  // --- PROPOSALS & 3-ENTITY REVISIONS/PUBLICATION ---
  async getProposals(): Promise<ProposalItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('proposals')
          .select('*')
          .order('created_at', { ascending: false });

        if (recordLiveOrFallback(error, 'getProposals') && data && data.length > 0) {
          return data as ProposalItem[];
        }
      } catch (e) {
        recordLiveOrFallback(e, 'getProposals exception');
      }
    }
    return initialProposals;
  },

  async getProposalById(idOrCode: string): Promise<ProposalItem | null> {
    const all = await this.getProposals();
    return all.find((p) => p.id === idOrCode || p.code === idOrCode) || null;
  },

  async getProposalRevisions(proposalId: string): Promise<ProposalRevision[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('proposal_revisions')
          .select('*')
          .eq('proposal_id', proposalId)
          .order('revision_number', { ascending: false });
        if (!error && data && data.length > 0) {
          return data as ProposalRevision[];
        }
      } catch {
        // fallback below
      }
    }
    return initialProposalRevisions.filter((r) => r.proposal_id === proposalId);
  },

  async createProposal(
    proposal: Omit<ProposalItem, 'id' | 'code' | 'submitted_at'>
  ): Promise<ProposalItem> {
    const nextNum = Math.floor(1100 + Math.random() * 8900);
    const propId = `prop-${nextNum}`;
    const propCode = `PROP-${nextNum}`;
    const submittedAt = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const newProposal: ProposalItem = {
      ...proposal,
      id: propId,
      code: propCode,
      submitted_at: submittedAt,
      current_revision: 1,
    };

    const initialRev: ProposalRevision = {
      id: `rev-${nextNum}-1`,
      proposal_id: propId,
      revision_number: 1,
      title: newProposal.title,
      event_date: newProposal.event_date,
      venue: newProposal.venue,
      capacity: newProposal.capacity,
      fee: newProposal.fee,
      budget: newProposal.budget,
      status: newProposal.status,
      submitted_at: submittedAt,
      reviewer_comment: newProposal.comment,
    };

    initialProposals.unshift(newProposal);
    initialProposalRevisions.unshift(initialRev);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('proposals')
          .insert([newProposal])
          .select()
          .maybeSingle();
        recordLiveOrFallback(error, 'createProposal');
        await supabase.from('proposal_revisions').insert([initialRev]);
        if (!error && data) return data as ProposalItem;
      } catch (e) {
        recordLiveOrFallback(e, 'createProposal exception');
      }
    }

    // If submitted (not Draft), create Committee 5-seat action item so Committee workspace receives it
    if (newProposal.status !== 'Draft') {
      const actItem: CommitteeActionItem = {
        id: `act-${nextNum}`,
        code: propCode,
        item_title: newProposal.title,
        club_name: newProposal.club_name,
        assigned_role: 'Treasurer',
        assigned_role_action: 'Committee Budget & Charter Sign-off',
        signed_count: 1,
        total_seats: 5,
        my_status: 'Pending',
        budget: newProposal.budget,
        date: newProposal.event_date,
        venue: newProposal.venue,
        submitted_by: 'Club Secretary (Authorized Organizer)',
        line_items: [{ label: 'Event Operating Budget', amount: newProposal.budget }],
        seats: [
          { seat_number: 1, role: 'President', name: 'Ishara De Silva', status: 'Pending' },
          { seat_number: 2, role: 'Vice President', name: 'Dilani Perera', status: 'Pending' },
          { seat_number: 3, role: 'Secretary', name: 'Nethmi Perera', status: 'Signed', signed_at: submittedAt },
          { seat_number: 4, role: 'Treasurer', name: 'Chamod Perera', status: 'Pending' },
          { seat_number: 5, role: 'Asst. Treasurer', name: 'Roshan Silva', status: 'Pending' },
        ],
      };
      initialCommitteeActions.unshift(actItem);
      if (isSupabaseConfigured) {
        try {
          await supabase.from('committee_actions').insert([actItem]);
        } catch (err) {
          console.warn('committee_actions insert notice:', err);
        }
      }
    }

    return newProposal;
  },

  async reviseProposal(
    id: string,
    updates: Partial<ProposalItem>
  ): Promise<{ success: boolean; proposal?: ProposalItem }> {
    const target = initialProposals.find((p) => p.id === id || p.code === id);
    if (!target) return { success: false };

    const nextRevNum = (target.current_revision || 1) + 1;
    const submittedAt = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    Object.assign(target, updates, {
      current_revision: nextRevNum,
      status: 'Pending Review',
      stage: 2,
      stage_label: 'Lecturer Coordinator Review',
      submitted_at: submittedAt,
    });

    const revSnapshot: ProposalRevision = {
      id: `rev-${target.id}-${nextRevNum}`,
      proposal_id: target.id,
      revision_number: nextRevNum,
      title: target.title,
      event_date: target.event_date,
      venue: target.venue,
      capacity: target.capacity,
      fee: target.fee,
      budget: target.budget,
      status: 'Pending Review',
      submitted_at: submittedAt,
      reviewer_comment: updates.comment || 'Revised & resubmitted by officer',
    };
    initialProposalRevisions.unshift(revSnapshot);

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('proposals')
          .update({
            title: target.title,
            event_date: target.event_date,
            venue: target.venue,
            capacity: target.capacity,
            fee: target.fee,
            budget: target.budget,
            description: target.description,
            current_revision: nextRevNum,
            status: 'Pending Review',
            stage: 2,
            stage_label: 'Lecturer Coordinator Review',
            submitted_at: submittedAt,
            comment: target.comment,
          })
          .eq('id', target.id);
        recordLiveOrFallback(error, 'reviseProposal');
        await supabase.from('proposal_revisions').insert([revSnapshot]);
      } catch (e) {
        recordLiveOrFallback(e, 'reviseProposal exception');
      }
    }

    await this.logAuditEvent(`Submitted Revision #${nextRevNum}: ${target.title}`, target.code);
    return { success: true, proposal: target };
  },

  // Publication guardrail: strictly forbids publishing unless approved by Higher Authority!
  async publishApprovedProposal(proposalId: string): Promise<{ success: boolean; event?: EventItem; error?: string }> {
    const prop = await this.getProposalById(proposalId);
    if (!prop) return { success: false, error: 'Proposal not found.' };

    const isApproved = prop.status === 'Approved' || prop.status === 'Approved & Published' || prop.stage >= 4;
    if (!isApproved) {
      return {
        success: false,
        error: `Publication blocked: Proposal ${prop.code} is currently "${prop.status}". Approval by Lecturer Coordinator and Higher University Authority is required before publication.`,
      };
    }

    const catNormalized = prop.category.includes('Sports')
      ? 'Sports'
      : prop.category.includes('Technical')
      ? 'Technical'
      : prop.category.includes('Cultural')
      ? 'Cultural'
      : prop.category.includes('Community')
      ? 'Community Service'
      : 'Academic';

    const created = await this.createEvent({
      title: prop.title,
      club_name: prop.club_name,
      club_id: prop.club_id,
      category: catNormalized,
      start_date: prop.event_date,
      time: prop.time,
      venue: prop.venue,
      fee: prop.fee,
      capacity: prop.capacity,
      registered: 0,
      eligibility: 'All Registered Undergraduates',
      status: 'published',
      description: prop.description || `${prop.title} organized by ${prop.club_name}.`,
      image_url: prop.image_url,
      manual_approval: prop.require_manual_approval ?? false,
      refund_policy: prop.refund_policy,
      proposal_id: prop.id,
      revision_number: prop.current_revision || 1,
    });

    prop.status = 'Approved & Published';
    prop.stage = 4;
    prop.stage_label = 'Published on Explorer';

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('proposals')
          .update({ status: 'Approved & Published', stage: 4, stage_label: 'Published on Explorer' })
          .eq('id', prop.id);
        await supabase.from('event_editions').insert([
          {
            id: `ed-${Date.now()}`,
            event_id: created.id,
            proposal_id: prop.id,
            revision_number: prop.current_revision || 1,
            edition_number: 1,
            title: created.title,
          },
        ]);
      } catch (e) {
        console.warn('publishApprovedProposal DB sync warning:', e);
      }
    }

    await this.logAuditEvent(`Published Approved Event Edition: ${created.title}`, created.code);
    return { success: true, event: created };
  },

  async endorseProposal(id: string, authorities: string[], comment?: string, actorName = 'Dr. Kavinda Silva'): Promise<boolean> {
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const endorsement = { name: actorName, by: actorName, date: today, comment };
    const target = initialProposals.find((p) => p.id === id || p.code === id);
    if (target) {
      target.status = 'Higher Authority';
      target.stage = 3;
      target.stage_label = 'Stage 3: Dean of Student Affairs';
      target.authorities = authorities;
      target.coordinator_endorsement = endorsement;
      if (comment) target.comment = comment;
    }

    // Create external verification queue entry if routed to Verification Staff
    if (target && authorities.some((a) => a.toLowerCase().includes('verification'))) {
      const exists = initialExternalVerifications.some((v) => v.proposal_id === target.id);
      if (!exists) {
        const verItem: ExternalVerificationItem = {
          id: `ver-${Date.now()}`,
          proposal_id: target.id,
          proposal_code: target.code,
          event_title: target.title,
          club_name: target.club_name,
          issuer: 'External Venue / Sponsor Authority',
          reference_no: `EXT-${Math.floor(100 + Math.random() * 900)}`,
          document_name: target.document_name || 'External_Approval_Evidence.pdf',
          submitted_at: today,
          status: 'Pending Verification',
        };
        initialExternalVerifications.unshift(verItem);
        if (isSupabaseConfigured) {
          try {
            await supabase.from('external_verifications').insert([verItem]);
          } catch {}
        }
      }
    }

    await this.logAuditEvent(`Coordinator Endorsed & Routed: ${target?.title || id}`, target?.code || id, actorName);

    if (!isSupabaseConfigured) return true;
    try {
      const { error } = await supabase
        .from('proposals')
        .update({
          status: 'Higher Authority',
          stage: 3,
          stage_label: 'Stage 3: Dean of Student Affairs',
          authorities,
          coordinator_endorsement: endorsement,
          comment,
        })
        .or(`id.eq.${id},code.eq.${id}`);
      return recordLiveOrFallback(error, 'endorseProposal');
    } catch (e) {
      recordLiveOrFallback(e, 'endorseProposal exception');
      return false;
    }
  },

  async requestRevisionProposal(id: string, comment: string): Promise<boolean> {
    const target = initialProposals.find((p) => p.id === id || p.code === id);
    if (target) {
      target.status = 'Revision Requested';
      target.stage = 2;
      target.stage_label = 'Corrections Requested by Coordinator';
      target.comment = comment;
    }

    if (!isSupabaseConfigured) return true;
    try {
      const { error } = await supabase
        .from('proposals')
        .update({
          status: 'Revision Requested',
          stage: 2,
          stage_label: 'Corrections Requested by Coordinator',
          comment,
        })
        .or(`id.eq.${id},code.eq.${id}`);
      return recordLiveOrFallback(error, 'requestRevisionProposal');
    } catch (e) {
      recordLiveOrFallback(e, 'requestRevisionProposal exception');
      return false;
    }
  },

  async rejectProposal(id: string, comment?: string): Promise<boolean> {
    const target = initialProposals.find((p) => p.id === id || p.code === id);
    if (target) {
      target.status = 'Rejected';
      if (comment) target.comment = comment;
    }

    if (!isSupabaseConfigured) return true;
    try {
      const { error } = await supabase
        .from('proposals')
        .update({ status: 'Rejected', comment })
        .or(`id.eq.${id},code.eq.${id}`);
      return recordLiveOrFallback(error, 'rejectProposal');
    } catch (e) {
      recordLiveOrFallback(e, 'rejectProposal exception');
      return false;
    }
  },

  // --- HIGHER UNIVERSITY AUTHORITY OPERATIONS ---
  async getAuthorityDecisionHistory(): Promise<DecisionRecord[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('authority_decisions')
          .select('*')
          .order('created_at', { ascending: false });
        if (recordLiveOrFallback(error, 'getAuthorityDecisionHistory') && data && data.length > 0) {
          return data as DecisionRecord[];
        }
      } catch (e) {
        recordLiveOrFallback(e, 'getAuthorityDecisionHistory exception');
      }
    }
    return initialDecisionHistory;
  },

  async approveAuthorityStage(id: string, remarks: string): Promise<boolean> {
    const target = initialProposals.find((p) => p.id === id || p.code === id) || (await this.getProposalById(id));
    if (!target) return false;

    target.status = 'Approved';
    target.stage = 4;
    target.stage_label = 'Approved · Ready for Officer Publication';
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

    if (isSupabaseConfigured) {
      try {
        const { error: propErr } = await supabase
          .from('proposals')
          .update({
            status: 'Approved',
            stage: 4,
            stage_label: 'Approved · Ready for Officer Publication',
            comment: remarks,
          })
          .eq('id', target.id);
        recordLiveOrFallback(propErr, 'approveAuthorityStage');
        await supabase.from('authority_decisions').insert([newDecision]);
      } catch (e) {
        recordLiveOrFallback(e, 'approveAuthorityStage exception');
      }
    }

    await this.logAuditEvent(`Executive Stage 3 Approved: ${target.title}`, target.code, 'Prof. Maheshika Perera');
    return true;
  },

  async returnAuthorityStage(id: string, remarks: string): Promise<boolean> {
    const target = initialProposals.find((p) => p.id === id || p.code === id) || (await this.getProposalById(id));
    if (!target) return false;

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

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('proposals')
          .update({
            status: 'Revision Requested',
            stage: 2,
            stage_label: 'Revision Requested by Dean',
            comment: remarks,
          })
          .eq('id', target.id);
        recordLiveOrFallback(error, 'returnAuthorityStage');
        await supabase.from('authority_decisions').insert([newDecision]);
      } catch (e) {
        recordLiveOrFallback(e, 'returnAuthorityStage exception');
      }
    }

    await this.logAuditEvent(`Executive Stage 3 Returned: ${target.title}`, target.code, 'Prof. Maheshika Perera');
    return true;
  },

  async rejectAuthorityStage(id: string, remarks: string): Promise<boolean> {
    const target = initialProposals.find((p) => p.id === id || p.code === id) || (await this.getProposalById(id));
    if (!target) return false;

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

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('proposals')
          .update({ status: 'Rejected', comment: remarks })
          .eq('id', target.id);
        recordLiveOrFallback(error, 'rejectAuthorityStage');
        await supabase.from('authority_decisions').insert([newDecision]);
      } catch (e) {
        recordLiveOrFallback(e, 'rejectAuthorityStage exception');
      }
    }

    await this.logAuditEvent(`Executive Stage 3 Rejected: ${target.title}`, target.code, 'Prof. Maheshika Perera');
    return true;
  },

  // --- EXTERNAL VERIFICATION STAFF (V01-V03) ---
  async getExternalVerifications(): Promise<ExternalVerificationItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('external_verifications')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data as ExternalVerificationItem[];
        }
      } catch {}
    }
    return initialExternalVerifications;
  },

  async decideExternalVerification(
    id: string,
    status: 'Verified' | 'Flagged Invalid',
    note: string
  ): Promise<boolean> {
    const item = initialExternalVerifications.find((v) => v.id === id);
    if (item) {
      item.status = status;
      item.reviewer_note = note;
    }
    if (isSupabaseConfigured) {
      try {
        await supabase.from('external_verifications').update({ status, reviewer_note: note }).eq('id', id);
      } catch {}
    }
    await this.logAuditEvent(
      `External Evidence ${status}: ${item?.event_title || id}`,
      item?.proposal_code || id,
      'Rohan Jayawardena'
    );
    return true;
  },

  // --- CLUBS & MEMBERSHIPS ---
  async getClubs(): Promise<ClubItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('clubs').select('*');
        if (recordLiveOrFallback(error, 'getClubs') && data && data.length > 0) {
          return data as ClubItem[];
        }
      } catch (e) {
        recordLiveOrFallback(e, 'getClubs exception');
      }
    }
    return initialClubs;
  },

  async getClubById(id: string): Promise<ClubItem | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('clubs').select('*').eq('id', id).maybeSingle();
        if (recordLiveOrFallback(error, 'getClubById') && data) {
          return data as ClubItem;
        }
      } catch (e) {
        recordLiveOrFallback(e, 'getClubById exception');
      }
    }
    return initialClubs.find((c) => c.id === id) || null;
  },

  async joinClub(club: ClubItem, user: { id: string; name: string; email: string; studentId?: string; faculty?: string }): Promise<boolean> {
    const clubTarget = initialClubs.find((c) => c.id === club.id);
    if (clubTarget) clubTarget.status = 'Application Sent';

    const memberReq: ClubMemberItem = {
      id: `mem-${Date.now()}`,
      student_id: user.studentId || 'UG/2024/NEW',
      name: user.name,
      email: user.email,
      faculty: user.faculty || 'Faculty of Computing',
      role: 'General Member',
      club_id: club.id,
      status: 'Pending',
      requested_date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    initialClubMembers.unshift(memberReq);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('club_members').insert([{ ...memberReq, user_id: user.id }]);
      } catch (e) {
        console.warn('joinClub Supabase error:', e);
      }
    }
    return true;
  },

  async updateClubContent(clubId: string, description: string): Promise<boolean> {
    const club = initialClubs.find((c) => c.id === clubId);
    if (club) club.description = description;
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('clubs').update({ description }).eq('id', clubId);
        return recordLiveOrFallback(error, 'updateClubContent');
      } catch (e) {
        recordLiveOrFallback(e, 'updateClubContent exception');
        return false;
      }
    }
    return true;
  },

  async getClubMembers(clubId: string = 'club-sports'): Promise<ClubMemberItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('club_members')
          .select('*')
          .eq('club_id', clubId);

        if (recordLiveOrFallback(error, 'getClubMembers') && data && data.length > 0) {
          return data as ClubMemberItem[];
        }
      } catch (e) {
        recordLiveOrFallback(e, 'getClubMembers exception');
      }
    }
    return initialClubMembers.filter((m) => m.club_id === clubId);
  },

  async getStudentClubMemberships(email?: string): Promise<ClubMemberItem[]> {
    if (isSupabaseConfigured && email) {
      try {
        const { data, error } = await supabase
          .from('club_members')
          .select('*')
          .ilike('email', email);
        if (!error && data) return data as ClubMemberItem[];
      } catch {}
    }
    if (!email) return initialClubMembers;
    return initialClubMembers.filter((m) => m.email.toLowerCase() === email.toLowerCase());
  },

  async approveClubMember(id: string): Promise<boolean> {
    const target = initialClubMembers.find((m) => m.id === id);
    if (target) target.status = 'Active';

    if (!isSupabaseConfigured) {
      this.emitChange();
      return true;
    }
    try {
      const { error } = await supabase.from('club_members').update({ status: 'Active' }).eq('id', id);
      const ok = recordLiveOrFallback(error, 'approveClubMember');
      this.emitChange();
      return ok;
    } catch (e) {
      recordLiveOrFallback(e, 'approveClubMember exception');
      this.emitChange();
      return false;
    }
  },

  async declineClubMember(id: string): Promise<boolean> {
    const target = initialClubMembers.find((m) => m.id === id);
    if (target) target.status = 'Declined';

    if (!isSupabaseConfigured) {
      this.emitChange();
      return true;
    }
    try {
      const { error } = await supabase.from('club_members').update({ status: 'Declined' }).eq('id', id);
      const ok = recordLiveOrFallback(error, 'declineClubMember');
      this.emitChange();
      return ok;
    } catch (e) {
      recordLiveOrFallback(e, 'declineClubMember exception');
      this.emitChange();
      return false;
    }
  },

  // --- BADGES ---
  async getBadges(userId?: string): Promise<BadgeItem[]> {
    let list = initialBadges;
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('badges').select('*');
        if (recordLiveOrFallback(error, 'getBadges') && data && data.length > 0) {
          list = data as BadgeItem[];
        }
      } catch (e) {
        recordLiveOrFallback(e, 'getBadges exception');
      }
    }
    if (userId) {
      return list.filter((b: any) => !b.user_id || b.user_id === userId);
    }
    return list;
  },

  async revokeBadge(id: string, reason: string): Promise<boolean> {
    const target = initialBadges.find((b) => b.id === id);
    if (target) {
      target.status = 'Revoked';
      target.revoke_reason = reason;
    }
    if (isSupabaseConfigured) {
      try {
        await supabase.from('badges').update({ status: 'Revoked', revoke_reason: reason }).eq('id', id);
      } catch {}
    }
    await this.logAuditEvent(`Revoked Badge (${reason})`, target?.code || id);
    return true;
  },

  // --- NOTIFICATIONS ---
  async getNotifications(userId?: string): Promise<NotificationItem[]> {
    let list = initialNotifications;
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('notifications').select('*');
        if (recordLiveOrFallback(error, 'getNotifications') && data && data.length > 0) {
          list = data as NotificationItem[];
        }
      } catch (e) {
        recordLiveOrFallback(e, 'getNotifications exception');
      }
    }
    const normalized = list.map((n) => ({
      ...n,
      read: n.read || locallyReadNotificationIds.has(n.id),
    }));
    if (userId) {
      return normalized.filter((n) => !n.user_id || n.user_id === userId);
    }
    return normalized;
  },

  async markNotificationRead(id: string): Promise<void> {
    locallyReadNotificationIds.add(id);
    const target = initialNotifications.find((n) => n.id === id);
    if (target) target.read = true;

    if (isSupabaseConfigured) {
      try {
        await supabase.from('notifications').update({ read: true }).eq('id', id);
      } catch (e) {
        console.warn('Supabase markNotificationRead notice:', e);
      }
    }
    this.emitChange();
  },

  async markAllNotificationsRead(userId?: string): Promise<void> {
    const items = await this.getNotifications(userId);
    items.forEach((n) => {
      locallyReadNotificationIds.add(n.id);
    });
    initialNotifications.forEach((n) => {
      if (!userId || !n.user_id || n.user_id === userId) {
        n.read = true;
      }
    });

    if (isSupabaseConfigured) {
      try {
        if (userId) {
          await supabase
            .from('notifications')
            .update({ read: true })
            .eq('read', false)
            .or(`user_id.eq.${userId},user_id.is.null`);
        } else {
          await supabase.from('notifications').update({ read: true }).eq('read', false);
        }
      } catch (e) {
        console.warn('Supabase markAllNotificationsRead notice:', e);
      }
    }
    this.emitChange();
  },

  async markNotificationsReadForRoute(pathname: string, userId?: string): Promise<number> {
    const normPath = normalizeSectionRoute(pathname);
    const matchedPrefix = TRACKED_SECTION_PREFIXES.find((prefix) => normPath.startsWith(prefix));
    if (!matchedPrefix) return 0;

    const current = await this.getNotifications(userId);
    const toMark = current.filter((n) => {
      if (n.read) return false;
      const nLink = n.link ? normalizeSectionRoute(n.link) : '';
      if (nLink && nLink.startsWith(matchedPrefix)) return true;

      // Fallback keyword match for legacy alerts without explicit link
      const text = `${n.title} ${n.description}`.toLowerCase();
      if (matchedPrefix === '/payment' && text.includes('payment')) return true;
      if (matchedPrefix === '/my-registrations' && text.includes('registration')) return true;
      if (matchedPrefix === '/my-qr' && text.includes('qr')) return true;
      if (matchedPrefix === '/my-badges' && text.includes('badge')) return true;
      if (matchedPrefix === '/refund-status' && text.includes('refund')) return true;
      if ((matchedPrefix === '/clubs' || matchedPrefix === '/my-memberships') && text.includes('club')) return true;
      return false;
    });

    if (toMark.length === 0) return 0;

    toMark.forEach((n) => {
      locallyReadNotificationIds.add(n.id);
      const localItem = initialNotifications.find((item) => item.id === n.id);
      if (localItem) localItem.read = true;
    });

    if (isSupabaseConfigured) {
      try {
        const ids = toMark.map((n) => n.id);
        await supabase.from('notifications').update({ read: true }).in('id', ids);
      } catch (e) {
        console.warn('Supabase markNotificationsReadForRoute notice:', e);
      }
    }

    this.emitChange();
    return toMark.length;
  },

  async addNotification(notif: Omit<NotificationItem, 'id'>): Promise<NotificationItem> {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
    };
    initialNotifications.unshift(newNotif);
    if (isSupabaseConfigured) {
      try {
        await supabase.from('notifications').insert([newNotif]);
      } catch (e) {
        console.warn('Supabase addNotification notice:', e);
      }
    }
    this.emitChange();
    return newNotif;
  },

  // --- PAYMENTS & REFUNDS ---
  async getPayments(userId?: string): Promise<TransactionItem[]> {
    let list = initialTransactions;
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('payments').select('*');
        if (recordLiveOrFallback(error, 'getPayments') && data && data.length > 0) {
          list = data as TransactionItem[];
        }
      } catch (e) {
        recordLiveOrFallback(e, 'getPayments exception');
      }
    }
    if (userId) {
      return list.filter((t) => !t.user_id || t.user_id === userId);
    }
    return list;
  },

  async updatePaymentStatus(id: string, status: TransactionItem['status']): Promise<boolean> {
    const target = initialTransactions.find((t) => t.id === id);
    if (target) target.status = status;

    if (!isSupabaseConfigured) return true;
    try {
      const { error } = await supabase.from('payments').update({ status }).eq('id', id);
      return recordLiveOrFallback(error, 'updatePaymentStatus');
    } catch (e) {
      recordLiveOrFallback(e, 'updatePaymentStatus exception');
      return false;
    }
  },

  async createPayment(payment: TransactionItem): Promise<TransactionItem> {
    initialTransactions.unshift(payment);
    if (isSupabaseConfigured) {
      try {
        await supabase.from('payments').insert([payment]);
      } catch (e) {
        console.warn('Supabase createPayment notice:', e);
      }
    }
    return payment;
  },

  async confirmPayment(params: {
    transactionId?: string;
    registrationId?: string;
    eventTitle?: string;
    amount?: number;
    userId?: string;
  }): Promise<{ success: boolean; expired?: boolean; error?: string; transaction?: TransactionItem; registration?: RegistrationItem }> {
    const { transactionId, registrationId, eventTitle, amount, userId } = params;

    let targetTx = initialTransactions.find(
      (t) =>
        (transactionId && t.id === transactionId) ||
        (eventTitle && t.event_title.toLowerCase() === eventTitle.toLowerCase())
    );
    if (!targetTx) {
      targetTx = initialTransactions.find((t) => t.status === 'Pending');
    }

    const title = eventTitle || targetTx?.event_title || 'University Indoor Games Day 2026';
    const amt = amount || targetTx?.amount || 500;

    let targetReg = initialRegistrations.find(
      (r) =>
        (registrationId && (r.id === registrationId || r.reg_code === registrationId)) ||
        (targetTx?.reg_id && r.id === targetTx.reg_id) ||
        (r.event_title.toLowerCase().includes(title.toLowerCase()) &&
          r.status === 'payment_pending' &&
          (!userId || r.user_id === userId))
    );
    if (!targetReg) {
      targetReg = initialRegistrations.find(
        (r) => r.event_title.toLowerCase().includes(title.toLowerCase()) && r.status === 'payment_pending'
      );
    }

    // Validate 10-minute payment seat hold window
    if (targetReg?.hold_expires_at) {
      const expiresMs = new Date(targetReg.hold_expires_at).getTime();
      if (!Number.isNaN(expiresMs) && Date.now() > expiresMs) {
        if (targetTx) targetTx.status = 'Expired';
        targetReg.status = 'cancelled';
        if (isSupabaseConfigured) {
          if (targetTx) await supabase.from('payments').update({ status: 'Expired' }).eq('id', targetTx.id);
          await supabase.from('registrations').update({ status: 'cancelled' }).eq('id', targetReg.id);
        }
        return {
          success: false,
          expired: true,
          error: 'Your 10-minute payment seat hold expired. Please submit a fresh registration if seats remain.',
        };
      }
    }

    if (targetTx) targetTx.status = 'Successful';
    if (targetReg) targetReg.status = 'confirmed';

    const notifIndex = initialNotifications.findIndex(
      (n) => n.id === 'notif-1' || n.title.toLowerCase().includes('payment hold')
    );

    const successNotif: NotificationItem = {
      id: notifIndex !== -1 ? initialNotifications[notifIndex].id : `notif-paid-${Date.now()}`,
      title: `Payment Confirmed: ${title}`,
      description: `Payment of LKR ${amt.toFixed(2)} received and verified. Attendance QR pass generated.`,
      timestamp: 'Just now',
      read: false,
      type: 'success',
      icon: 'verified',
      user_id: userId,
      link: '/my-qr',
    };

    if (notifIndex !== -1) {
      initialNotifications[notifIndex] = successNotif;
    } else {
      initialNotifications.unshift(successNotif);
    }
    locallyReadNotificationIds.delete(successNotif.id);

    try {
      localStorage.setItem(
        'lnbti_recent_payment',
        JSON.stringify({
          event_title: title,
          amount: amt,
          reg_code: targetReg?.reg_code || 'REG-88145',
          event_id: targetReg?.event_id || 'evt-1',
          timestamp: Date.now(),
        })
      );
    } catch {}

    if (isSupabaseConfigured) {
      try {
        if (targetTx) {
          await supabase.from('payments').update({ status: 'Successful' }).eq('id', targetTx.id);
        }
        if (targetReg) {
          await supabase.from('registrations').update({ status: 'confirmed' }).eq('id', targetReg.id);
        }
        if (notifIndex !== -1) {
          await supabase
            .from('notifications')
            .update({
              title: successNotif.title,
              description: successNotif.description,
              type: 'success',
              icon: 'verified',
              read: false,
              link: successNotif.link,
            })
            .eq('id', successNotif.id);
        } else {
          await supabase.from('notifications').insert([successNotif]);
        }
      } catch (e) {
        console.warn('Supabase confirmPayment sync error:', e);
      }
    }

    this.emitChange();
    return { success: true, transaction: targetTx, registration: targetReg };
  },

  async getRefundRequests(userId?: string): Promise<RefundRequestItem[]> {
    let list = initialRefundRequests;
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('refund_requests')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) list = data as RefundRequestItem[];
      } catch {}
    }
    if (userId) {
      return list.filter((r) => !r.user_id || r.user_id === userId);
    }
    return list;
  },

  async requestRefund(params: {
    tx: TransactionItem;
    reason: string;
    studentName: string;
    studentId: string;
    userId?: string;
  }): Promise<RefundRequestItem> {
    const refundCode = `RFD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const req: RefundRequestItem = {
      id: `rfd-${Date.now()}`,
      refund_code: refundCode,
      tx_id: params.tx.id,
      receipt_no: params.tx.receipt_no,
      event_id: params.tx.event_id,
      event_title: params.tx.event_title,
      club_name: params.tx.club_name,
      user_id: params.userId,
      student_name: params.studentName,
      student_id: params.studentId,
      amount: params.tx.amount,
      reason: params.reason,
      status: 'Requested',
      requested_at: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    initialRefundRequests.unshift(req);
    params.tx.refund_id = refundCode;

    if (isSupabaseConfigured) {
      try {
        await supabase.from('refund_requests').insert([req]);
        await supabase.from('payments').update({ refund_id: refundCode }).eq('id', params.tx.id);
      } catch {}
    }
    return req;
  },

  async processRefundDecision(
    id: string,
    status: 'Approved' | 'Completed' | 'Rejected',
    note: string
  ): Promise<boolean> {
    const r = initialRefundRequests.find((item) => item.id === id);
    if (r) {
      r.status = status;
      r.officer_note = note;
      if (status === 'Completed') {
        r.resolved_at = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const tx = initialTransactions.find((t) => t.id === r.tx_id);
        if (tx) tx.status = 'Refund Completed';
      }
    }
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('refund_requests')
          .update({ status, officer_note: note, resolved_at: r?.resolved_at || null })
          .eq('id', id);
        if (status === 'Completed' && r?.tx_id) {
          await supabase.from('payments').update({ status: 'Refund Completed' }).eq('id', r.tx_id);
        }
      } catch {}
    }
    await this.logAuditEvent(`Refund Decision (${status}): ${r?.refund_code || id}`, r?.receipt_no || id);
    return true;
  },

  // --- CLUB POSTS & MODERATION ---
  async getClubPosts(includeHidden = false): Promise<ClubPostItem[]> {
    let list = initialClubPosts;
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('club_posts').select('*');
        if (!error && data && data.length > 0) list = data as ClubPostItem[];
      } catch {}
    }
    return includeHidden ? list : list.filter((p) => p.status === 'Published');
  },

  async createClubPost(post: Omit<ClubPostItem, 'id' | 'created_at' | 'status'>): Promise<ClubPostItem> {
    const created: ClubPostItem = {
      ...post,
      id: `post-${Date.now()}`,
      status: 'Published',
      created_at: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    initialClubPosts.unshift(created);
    if (isSupabaseConfigured) {
      try {
        await supabase.from('club_posts').insert([created]);
      } catch {}
    }
    return created;
  },

  async moderateClubPost(id: string, status: 'Published' | 'Hidden by Moderator', reason?: string): Promise<boolean> {
    const p = initialClubPosts.find((item) => item.id === id);
    if (p) {
      p.status = status;
      p.moderation_reason = reason;
    }
    if (isSupabaseConfigured) {
      try {
        await supabase.from('club_posts').update({ status, moderation_reason: reason }).eq('id', id);
      } catch {}
    }
    await this.logAuditEvent(`Content Moderation (${status}): ${p?.title || id}`, id);
    return true;
  },

  // --- CENTRAL ADMIN OPERATIONS (PERSISTED TO SUPABASE) ---
  async getOfficialClubs(): Promise<OfficialClubRecord[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('official_clubs').select('*');
        if (!error && data && data.length > 0) return data as OfficialClubRecord[];
      } catch {}
    }
    return initialOfficialClubs;
  },

  async activateOfficialClub(id: string): Promise<boolean> {
    const target = initialOfficialClubs.find((c) => c.id === id || c.code === id);
    if (target) {
      target.status = 'Active';
      target.committee_status = '5/5 Verified';
    }
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('official_clubs')
          .update({ status: 'Active', committee_status: '5/5 Verified' })
          .eq('id', id);
      } catch {}
    }
    return true;
  },

  async updateOfficialClub(id: string, updates: Partial<OfficialClubRecord>): Promise<boolean> {
    const target = initialOfficialClubs.find((c) => c.id === id);
    if (target) Object.assign(target, updates);
    if (isSupabaseConfigured) {
      try {
        await supabase.from('official_clubs').update(updates).eq('id', id);
      } catch {}
    }
    return true;
  },

  async registerOfficialClub(record: Omit<OfficialClubRecord, 'id'>): Promise<OfficialClubRecord> {
    const newRecord: OfficialClubRecord = {
      ...record,
      id: `rec-${Date.now()}`,
    };
    initialOfficialClubs.push(newRecord);
    if (isSupabaseConfigured) {
      try {
        await supabase.from('official_clubs').insert([newRecord]);
      } catch {}
    }
    return newRecord;
  },

  async getRoleAssignments(): Promise<RoleAssignment[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('role_assignments').select('*');
        if (!error && data && data.length > 0) return data as RoleAssignment[];
      } catch {}
    }
    return initialRoleAssignments;
  },

  async revokeRole(id: string): Promise<boolean> {
    const idx = initialRoleAssignments.findIndex((r) => r.id === id || r.identifier === id);
    if (idx !== -1) initialRoleAssignments.splice(idx, 1);
    if (isSupabaseConfigured) {
      try {
        await supabase.from('role_assignments').delete().eq('id', id);
      } catch {}
    }
    return true;
  },

  async assignRole(assignment: Omit<RoleAssignment, 'id'>): Promise<RoleAssignment> {
    const newRole: RoleAssignment = {
      ...assignment,
      id: `role-${Date.now()}`,
    };
    initialRoleAssignments.push(newRole);
    if (isSupabaseConfigured) {
      try {
        await supabase.from('role_assignments').insert([newRole]);
      } catch {}
    }
    return newRole;
  },

  async updateRoleAssignment(id: string, updates: Partial<RoleAssignment>): Promise<boolean> {
    const target = initialRoleAssignments.find((r) => r.id === id);
    if (target) Object.assign(target, updates);
    if (isSupabaseConfigured) {
      try {
        await supabase.from('role_assignments').update(updates).eq('id', id);
      } catch {}
    }
    return true;
  },

  async getPaymentMerchants(): Promise<PaymentMerchant[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('payment_merchants').select('*');
        if (!error && data && data.length > 0) return data as PaymentMerchant[];
      } catch {}
    }
    return initialPaymentMerchants;
  },

  async createPaymentMerchant(merchant: Omit<PaymentMerchant, 'id'>): Promise<PaymentMerchant> {
    const created: PaymentMerchant = { ...merchant, id: `merch-${Date.now()}` };
    initialPaymentMerchants.push(created);
    if (isSupabaseConfigured) {
      try {
        await supabase.from('payment_merchants').insert([created]);
      } catch {}
    }
    return created;
  },

  async toggleMerchantStatus(id: string): Promise<boolean> {
    const target = initialPaymentMerchants.find((m) => m.id === id);
    if (target) {
      target.status = target.status === 'Live' ? 'Maintenance' : 'Live';
      if (isSupabaseConfigured) {
        try {
          await supabase.from('payment_merchants').update({ status: target.status }).eq('id', id);
        } catch {}
      }
    }
    return true;
  },

  async getQRDevices(): Promise<QRScannerDevice[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('qr_devices').select('*');
        if (!error && data && data.length > 0) return data as QRScannerDevice[];
      } catch {}
    }
    return initialQRDevices;
  },

  async revokeQRDevice(id: string): Promise<boolean> {
    const target = initialQRDevices.find((d) => d.id === id || d.device_id === id);
    if (target) target.status = 'Revoked';
    if (isSupabaseConfigured) {
      try {
        await supabase.from('qr_devices').update({ status: 'Revoked' }).eq('id', id);
      } catch {}
    }
    return true;
  },

  async pairQRDevice(device: Omit<QRScannerDevice, 'id'>): Promise<QRScannerDevice> {
    const newDev: QRScannerDevice = { ...device, id: `dev-${Date.now()}` };
    initialQRDevices.push(newDev);
    if (isSupabaseConfigured) {
      try {
        await supabase.from('qr_devices').insert([newDev]);
      } catch {}
    }
    return newDev;
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as AuditLog[];
      } catch {}
    }
    return initialAuditLogs;
  },

  async logAuditEvent(action: string, target: string, actor: string = 'Amila Dissanayake'): Promise<AuditLog> {
    const newLog: AuditLog = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date()
        .toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
        .replace(',', ' ·'),
      actor,
      action,
      target,
    };
    initialAuditLogs.unshift(newLog);
    if (isSupabaseConfigured) {
      try {
        await supabase.from('audit_logs').insert([newLog]);
      } catch {}
    }
    this.emitChange();
    return newLog;
  },

  // --- ADMIN ROSTER, SYSTEM CONFIG, SUPPORT ---
  async getStudentRoster(): Promise<StudentRosterEntry[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('student_roster').select('*');
        if (!error && data && data.length > 0) return data as StudentRosterEntry[];
      } catch {}
    }
    return initialStudentRoster;
  },

  async addRosterEntries(entries: Array<Omit<StudentRosterEntry, 'id'>>): Promise<number> {
    const newRows = entries.map((e, i) => ({ ...e, id: `ros-${Date.now()}-${i}` }));
    initialStudentRoster.unshift(...newRows);
    if (isSupabaseConfigured) {
      try {
        await supabase.from('student_roster').upsert(newRows, { onConflict: 'student_id' });
      } catch {}
    }
    await this.logAuditEvent(`Imported ${newRows.length} Student Roster Records`, 'ROSTER-CSV');
    return newRows.length;
  },

  async getSystemConfig(): Promise<SystemConfigSettings> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('system_config')
          .select('*')
          .eq('id', 'global')
          .maybeSingle();
        if (!error && data) return data as SystemConfigSettings;
      } catch {}
    }
    return initialSystemConfig;
  },

  async updateSystemConfig(cfg: SystemConfigSettings): Promise<boolean> {
    Object.assign(initialSystemConfig, cfg);
    if (isSupabaseConfigured) {
      try {
        await supabase.from('system_config').upsert({ id: 'global', ...cfg });
      } catch {}
    }
    await this.logAuditEvent(
      `Updated Global System Config (Hold=${cfg.payment_hold_minutes}m, QR=${cfg.qr_ttl_seconds}s)`,
      'SYS-CONFIG'
    );
    return true;
  },

  async getSupportRequests(): Promise<SupportRequestItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('support_requests').select('*');
        if (!error && data && data.length > 0) return data as SupportRequestItem[];
      } catch {}
    }
    return initialSupportRequests;
  },

  async createSupportRequest(req: Omit<SupportRequestItem, 'id' | 'created_at' | 'status'>): Promise<SupportRequestItem> {
    const created: SupportRequestItem = {
      ...req,
      id: `sup-${Date.now()}`,
      status: 'Open',
      created_at: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    initialSupportRequests.unshift(created);
    if (isSupabaseConfigured) {
      try {
        await supabase.from('support_requests').insert([created]);
      } catch {}
    }
    return created;
  },

  async resolveSupportRequest(id: string, response: string): Promise<boolean> {
    const target = initialSupportRequests.find((s) => s.id === id);
    if (target) {
      target.status = 'Resolved';
      target.response = response;
    }
    if (isSupabaseConfigured) {
      try {
        await supabase.from('support_requests').update({ status: 'Resolved', response }).eq('id', id);
      } catch {}
    }
    await this.logAuditEvent(`Resolved Support / Privacy Request`, id);
    return true;
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
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('committee_actions').select('*');
        if (!error && data && data.length > 0) return data as CommitteeActionItem[];
      } catch {}
    }
    return initialCommitteeActions;
  },

  async signOffCommitteeAction(actionId: string, note?: string): Promise<boolean> {
    const actions = await this.getCommitteeActions();
    const action = actions.find((a) => a.id === actionId || a.code === actionId);
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

      if (isSupabaseConfigured) {
        try {
          await supabase
            .from('committee_actions')
            .update({
              seats: action.seats,
              signed_count: action.signed_count,
              my_status: action.my_status,
            })
            .eq('id', action.id);
        } catch {}
      }

      if (action.signed_count >= action.total_seats) {
        const prop = initialProposals.find((p) => p.code === action.code);
        if (prop) {
          prop.stage = 2;
          prop.stage_label = 'Lecturer Coordinator Review';
          prop.status = 'Pending Review';
        }
        if (isSupabaseConfigured) {
          try {
            await supabase
              .from('proposals')
              .update({ stage: 2, stage_label: 'Lecturer Coordinator Review', status: 'Pending Review' })
              .eq('code', action.code);
          } catch {}
        }
      }

      await this.logAuditEvent(
        `Committee Sign-off: ${action.item_title} (${action.code})`,
        action.code,
        `${activeMember.name} (${activeMember.role})`
      );
    }
    return true;
  },

  async requestCommitteeActionChanges(actionId: string, note: string): Promise<boolean> {
    const actions = await this.getCommitteeActions();
    const action = actions.find((a) => a.id === actionId || a.code === actionId);
    const activeMember = getActiveCommitteeMember();

    if (action) {
      action.my_status = 'Rejected';
      const prop = initialProposals.find((p) => p.code === action.code);
      if (prop) {
        prop.status = 'Revision Requested';
        prop.comment = note;
      }
      if (isSupabaseConfigured) {
        try {
          await supabase.from('committee_actions').update({ my_status: 'Rejected' }).eq('id', action.id);
          await supabase
            .from('proposals')
            .update({ status: 'Revision Requested', comment: note })
            .eq('code', action.code);
        } catch {}
      }
      await this.logAuditEvent(
        `Committee Revision Requested: ${action.item_title}`,
        action.code,
        `${activeMember.name} (${activeMember.role})`
      );
    }
    return true;
  },
};

export default dataService;
