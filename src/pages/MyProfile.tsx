import React, { useEffect, useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { SupportRequestItem } from '../types';

export const MyProfile: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [faculty, setFaculty] = useState(user?.faculty || 'Faculty of Computing');
  const [prefRegistration, setPrefRegistration] = useState(user?.pref_registration ?? true);
  const [prefReminders, setPrefReminders] = useState(user?.pref_reminders ?? true);
  const [prefAnnouncements, setPrefAnnouncements] = useState(user?.pref_announcements ?? true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // Support / Device Transfer / Privacy Request (S17)
  const [requests, setRequests] = useState<SupportRequestItem[]>([]);
  const [category, setCategory] = useState<SupportRequestItem['category']>('Device Transfer');
  const [subject, setSubject] = useState('');
  const [submittingReq, setSubmittingReq] = useState(false);

  const loadSupportRequests = async () => {
    const all = await dataService.getSupportRequests();
    setRequests(all.filter((r) => !user?.email || r.user_email.toLowerCase() === user.email.toLowerCase()));
  };

  useEffect(() => {
    if (user) {
      setName(user.name);
      setFaculty(user.faculty || 'Faculty of Computing');
      setPrefRegistration(user.pref_registration ?? true);
      setPrefReminders(user.pref_reminders ?? true);
      setPrefAnnouncements(user.pref_announcements ?? true);
    }
    loadSupportRequests();
  }, [user?.id]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg('');
    try {
      await updateUserProfile({
        name: name.trim(),
        faculty,
        pref_registration: prefRegistration,
        pref_reminders: prefReminders,
        pref_announcements: prefAnnouncements,
      });
      setProfileMsg('Profile and notification preferences saved.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !subject.trim()) return;
    setSubmittingReq(true);
    try {
      await dataService.createSupportRequest({
        user_email: user.email,
        category,
        subject: subject.trim(),
      });
      setSubject('');
      await loadSupportRequests();
    } finally {
      setSubmittingReq(false);
    }
  };

  return (
    <AppLayout>
      <main className="p-lg md:p-xl max-w-[1200px] w-full mx-auto flex flex-col gap-xl">
        <header className="flex flex-col gap-xs">
          <h1 className="font-headline text-headline-lg text-light-on-surface font-semibold m-0">
            Student Profile, Device &amp; Privacy Settings (S17)
          </h1>
          <p className="font-body text-body-md text-light-on-surface-variant m-0">
            Manage account details, bound QR device transfers, notification channels, and privacy/support requests.
          </p>
        </header>

        {profileMsg && (
          <div className="p-md rounded bg-success-container/30 border border-success text-on-success-container font-body text-body-md">
            {profileMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
          {/* Identity & Preferences Form */}
          <form
            onSubmit={handleSaveProfile}
            className="lg:col-span-7 bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm"
          >
            <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold m-0">
              Identity &amp; Notification Preferences
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <label className="flex flex-col gap-xs">
                <span className="font-label text-label-md font-semibold">Full Name</span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest font-body text-body-md"
                />
              </label>

              <div className="flex flex-col gap-xs">
                <span className="font-label text-label-md font-semibold">Student / Staff ID</span>
                <input
                  type="text"
                  disabled
                  value={user?.student_id || user?.staff_id || 'N/A'}
                  className="px-md py-sm rounded border border-light-outline-variant bg-light-surface-container-low font-mono text-body-md text-light-on-surface-variant"
                />
              </div>

              <div className="flex flex-col gap-xs">
                <span className="font-label text-label-md font-semibold">University Email</span>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="px-md py-sm rounded border border-light-outline-variant bg-light-surface-container-low font-body text-body-md text-light-on-surface-variant"
                />
              </div>

              <label className="flex flex-col gap-xs">
                <span className="font-label text-label-md font-semibold">Faculty</span>
                <select
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest font-body text-body-md"
                >
                  <option value="Faculty of Computing">Faculty of Computing</option>
                  <option value="Faculty of Engineering">Faculty of Engineering</option>
                  <option value="Faculty of Management">Faculty of Management</option>
                  <option value="Faculty of Applied Sciences">Faculty of Applied Sciences</option>
                </select>
              </label>
            </div>

            <div className="pt-sm border-t border-light-outline-variant flex flex-col gap-sm">
              <span className="font-label text-label-md font-semibold">Notification Channels</span>
              <label className="flex items-center gap-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefRegistration}
                  onChange={(e) => setPrefRegistration(e.target.checked)}
                  className="w-4 h-4 rounded text-light-primary"
                />
                <span className="font-body text-body-md">Registration confirmations &amp; payment hold reminders</span>
              </label>
              <label className="flex items-center gap-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefReminders}
                  onChange={(e) => setPrefReminders(e.target.checked)}
                  className="w-4 h-4 rounded text-light-primary"
                />
                <span className="font-body text-body-md">24-hour event check-in &amp; gate opening alerts</span>
              </label>
              <label className="flex items-center gap-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefAnnouncements}
                  onChange={(e) => setPrefAnnouncements(e.target.checked)}
                  className="w-4 h-4 rounded text-light-primary"
                />
                <span className="font-body text-body-md">Club announcements &amp; badge issuances</span>
              </label>
            </div>

            <div className="flex justify-end pt-sm">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-lg py-sm rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold border-0 cursor-pointer"
              >
                {savingProfile ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </form>

          {/* Bound Device & Support Requests */}
          <div className="lg:col-span-5 flex flex-col gap-lg">
            <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-sm shadow-sm">
              <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold m-0">
                Registered Check-In Device
              </h2>
              <div className="p-md rounded bg-light-surface-container-low/50 border border-light-outline-variant flex items-center gap-md">
                <span className="material-symbols-outlined text-[28px] text-light-primary">smartphone</span>
                <div>
                  <div className="font-title text-title-md font-semibold">
                    {user?.registered_device_name || 'Verified Student Mobile Device'}
                  </div>
                  <div className="font-label text-label-sm text-light-on-surface-variant">
                    Registered {user?.registered_device_date || '12 Jan 2026'} · Verified Hardware Binding
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
              <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold m-0">
                Support, Device Transfer &amp; Privacy Requests
              </h2>
              <form onSubmit={handleSupportSubmit} className="flex flex-col gap-sm">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SupportRequestItem['category'])}
                  className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest font-body text-body-md"
                >
                  <option value="Device Transfer">QR Device Transfer Request</option>
                  <option value="Payment">Payment / Receipt Inquiry</option>
                  <option value="Registration">Registration Eligibility Help</option>
                  <option value="Privacy Request">Privacy &amp; Data Export Request</option>
                </select>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Describe your request concisely..."
                  className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest font-body text-body-md"
                />
                <button
                  type="submit"
                  disabled={submittingReq}
                  className="self-end px-md py-xs rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold border-0 cursor-pointer"
                >
                  {submittingReq ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </form>

              <div className="divide-y divide-light-outline-variant pt-xs">
                {requests.map((req) => (
                  <div key={req.id} className="py-sm flex flex-col gap-0.5">
                    <div className="flex items-center justify-between gap-xs">
                      <span className="font-label text-label-sm font-bold text-light-primary">{req.category}</span>
                      <span
                        className={`px-xs py-0.5 rounded text-[11px] font-medium ${
                          req.status === 'Resolved'
                            ? 'bg-success-container text-on-success-container'
                            : 'bg-warning-container text-on-warning-container'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <span className="font-body text-body-sm text-light-on-surface">{req.subject}</span>
                    {req.response && (
                      <span className="font-label text-label-sm text-light-on-surface-variant italic">
                        Admin reply: {req.response}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </AppLayout>
  );
};

export default MyProfile;
