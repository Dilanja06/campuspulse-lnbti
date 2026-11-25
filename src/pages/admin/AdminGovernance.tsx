import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import {
  StudentRosterEntry,
  ClubPostItem,
  BadgeItem,
  SystemConfigSettings,
  SupportRequestItem,
} from '../../types';
import { dataService } from '../../services/dataService';

export const AdminGovernance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'roster' | 'moderation' | 'badges' | 'config' | 'support'>('roster');
  const [roster, setRoster] = useState<StudentRosterEntry[]>([]);
  const [posts, setPosts] = useState<ClubPostItem[]>([]);
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [config, setConfig] = useState<SystemConfigSettings>({
    payment_hold_minutes: 10,
    qr_ttl_seconds: 30,
    refund_window_hours: 48,
    reward_tokens_per_event: 25,
    allow_external_registrations: false,
  });
  const [tickets, setTickets] = useState<SupportRequestItem[]>([]);
  const [csvText, setCsvText] = useState('UG/2026/ENG/0310,Dinithi Wijesinghe,dinithi.w@university.edu,Faculty of Engineering');
  const [feedback, setFeedback] = useState('');

  const loadAll = async () => {
    const [r, p, b, c, t] = await Promise.all([
      dataService.getStudentRoster(),
      dataService.getClubPosts(true),
      dataService.getBadges(),
      dataService.getSystemConfig(),
      dataService.getSupportRequests(),
    ]);
    setRoster(r);
    setPosts(p);
    setBadges(b);
    setConfig(c);
    setTickets(t);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleImportRoster = async (e: React.FormEvent) => {
    e.preventDefault();
    const lines = csvText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const parsed = lines.map((line) => {
      const [student_id, full_name, email, faculty] = line.split(',').map((s) => s.trim());
      return {
        student_id: student_id || `UG/2026/${Math.floor(100 + Math.random() * 899)}`,
        full_name: full_name || 'Verified Student',
        email: email || 'student@university.edu',
        faculty: faculty || 'Faculty of Computing',
        status: 'Verified' as const,
      };
    });
    const added = await dataService.addRosterEntries(parsed);
    setFeedback(`Imported ${added} student roster entries for institutional eligibility verification.`);
    await loadAll();
  };

  const handleModeratePost = async (post: ClubPostItem) => {
    const nextStatus = post.status === 'Published' ? 'Hidden by Moderator' : 'Published';
    await dataService.moderateClubPost(
      post.id,
      nextStatus,
      nextStatus === 'Hidden by Moderator' ? 'Flagged during Central Admin policy audit' : undefined
    );
    setFeedback(`Updated post "${post.title}" to ${nextStatus}.`);
    await loadAll();
  };

  const handleRevokeBadge = async (badge: BadgeItem) => {
    const reason = window.prompt(`Enter audit reason to revoke ${badge.code} (${badge.name}):`, 'Attendance mismatch identified');
    if (!reason) return;
    await dataService.revokeBadge(badge.id, reason);
    setFeedback(`Credential ${badge.code} revoked.`);
    await loadAll();
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    await dataService.updateSystemConfig(config);
    setFeedback('System policy timeouts and token parameters saved across platform.');
  };

  const handleResolveTicket = async (ticket: SupportRequestItem) => {
    const reply = window.prompt(`Resolution reply for ${ticket.user_email}:`, 'Resolved by Central Admin team.');
    if (!reply) return;
    await dataService.resolveSupportRequest(ticket.id, reply);
    setFeedback(`Support request ${ticket.id} marked Resolved.`);
    await loadAll();
  };

  return (
    <AdminLayout>
      <main className="p-lg md:p-xl max-w-[1400px] w-full mx-auto flex flex-col gap-xl">
        <header className="flex flex-col gap-xs">
          <h1 className="font-headline text-headline-lg text-light-on-surface font-semibold m-0">
            Student Roster, Moderation &amp; System Policies
          </h1>
          <p className="font-body text-body-md text-light-on-surface-variant m-0">
            Manage verified university student roster imports, club content moderation, badge revocation, global timeouts, and support requests.
          </p>
        </header>

        {feedback && (
          <div className="p-md rounded bg-success-container/30 border border-success text-on-success-container font-body text-body-md">
            {feedback}
          </div>
        )}

        {/* Section Tabs */}
        <div className="flex flex-wrap gap-xs border-b border-light-outline-variant pb-sm">
          {[
            { key: 'roster' as const, label: `Student Roster (${roster.length})` },
            { key: 'moderation' as const, label: `Content Moderation (${posts.length})` },
            { key: 'badges' as const, label: `Badge Control (${badges.length})` },
            { key: 'config' as const, label: 'System Config & Timeouts' },
            { key: 'support' as const, label: `Privacy & Support (${tickets.length})` },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`px-md py-xs rounded font-label text-label-md font-semibold border cursor-pointer ${
                activeTab === t.key
                  ? 'bg-light-primary text-light-on-primary border-light-primary'
                  : 'bg-light-surface-container-lowest text-light-on-surface-variant border-light-outline-variant'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* A02 Student Roster */}
        {activeTab === 'roster' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
            <form
              onSubmit={handleImportRoster}
              className="lg:col-span-5 bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm"
            >
              <h2 className="font-headline text-headline-sm font-semibold m-0">Batch Import Student Roster (CSV)</h2>
              <p className="font-label text-label-sm text-light-on-surface-variant m-0">
                Format: <code>student_id,full_name,email,faculty</code> (one per line)
              </p>
              <textarea
                rows={4}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest font-mono text-body-sm resize-none"
              />
              <button
                type="submit"
                className="self-end px-md py-xs rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold border-0 cursor-pointer"
              >
                Import Verified Students
              </button>
            </form>

            <section className="lg:col-span-7 bg-light-surface-container-lowest border border-light-outline-variant rounded-md shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-light-outline-variant bg-light-surface-container-low/50 text-light-on-surface-variant font-label text-label-sm">
                    <th className="px-md py-sm">Student ID</th>
                    <th className="px-md py-sm">Name &amp; Email</th>
                    <th className="px-md py-sm">Faculty</th>
                    <th className="px-md py-sm">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-outline-variant">
                  {roster.map((st) => (
                    <tr key={st.id}>
                      <td className="px-md py-sm font-mono text-mono-sm text-light-primary">{st.student_id}</td>
                      <td className="px-md py-sm">
                        <div className="font-title text-title-sm font-medium">{st.full_name}</div>
                        <div className="font-label text-label-sm text-light-on-surface-variant">{st.email}</div>
                      </td>
                      <td className="px-md py-sm font-body text-body-sm">{st.faculty}</td>
                      <td className="px-md py-sm">
                        <span className="px-sm py-0.5 rounded-full bg-success-container text-on-success-container font-label text-label-sm">
                          {st.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        )}

        {/* A09 Moderation */}
        {activeTab === 'moderation' && (
          <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md shadow-sm divide-y divide-light-outline-variant">
            {posts.map((post) => (
              <div key={post.id} className="p-lg flex flex-col sm:flex-row sm:items-center justify-between gap-md">
                <div>
                  <span className="font-label text-label-sm text-light-primary font-semibold">
                    {post.club_name} · {post.created_at}
                  </span>
                  <h3 className="font-title text-title-md font-bold m-0">{post.title}</h3>
                  <p className="font-body text-body-sm text-light-on-surface-variant m-0 mt-xs">{post.content}</p>
                </div>
                <div className="flex items-center gap-sm shrink-0">
                  <span
                    className={`px-sm py-0.5 rounded-full font-label text-label-sm ${
                      post.status === 'Published'
                        ? 'bg-success-container text-on-success-container'
                        : 'bg-light-error-container text-light-on-error-container'
                    }`}
                  >
                    {post.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleModeratePost(post)}
                    className="px-md py-xs rounded border border-light-outline-variant bg-transparent font-label text-label-sm font-semibold cursor-pointer"
                  >
                    {post.status === 'Published' ? 'Hide Post' : 'Restore Post'}
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* A11 Badge Revocation */}
        {activeTab === 'badges' && (
          <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md shadow-sm divide-y divide-light-outline-variant">
            {badges.map((b) => (
              <div key={b.id} className="p-lg flex flex-col sm:flex-row sm:items-center justify-between gap-md">
                <div>
                  <span className="font-mono text-mono-sm text-light-primary">{b.code} · {b.type}</span>
                  <h3 className="font-title text-title-md font-bold m-0">{b.name}</h3>
                  <span className="font-body text-body-sm text-light-on-surface-variant">{b.club}</span>
                </div>
                <div className="flex items-center gap-sm">
                  <span
                    className={`px-sm py-0.5 rounded-full font-label text-label-sm ${
                      b.status === 'Issued'
                        ? 'bg-success-container text-on-success-container'
                        : b.status === 'Revoked'
                        ? 'bg-light-error-container text-light-on-error-container'
                        : 'bg-warning-container text-on-warning-container'
                    }`}
                  >
                    {b.status}
                  </span>
                  {b.status === 'Issued' && (
                    <button
                      type="button"
                      onClick={() => handleRevokeBadge(b)}
                      className="px-sm py-xs rounded bg-light-error-container text-light-on-error-container font-label text-label-sm border-0 cursor-pointer"
                    >
                      Revoke Badge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* A12 System Config */}
        {activeTab === 'config' && (
          <form
            onSubmit={handleSaveConfig}
            className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg max-w-2xl flex flex-col gap-md shadow-sm"
          >
            <h2 className="font-headline text-headline-sm font-semibold m-0">Global Governance Timeouts &amp; Policy Parameters</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <label className="flex flex-col gap-xs">
                <span className="font-label text-label-md font-semibold">Payment Seat Hold (minutes)</span>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={config.payment_hold_minutes}
                  onChange={(e) => setConfig({ ...config, payment_hold_minutes: Number(e.target.value) })}
                  className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest"
                />
              </label>
              <label className="flex flex-col gap-xs">
                <span className="font-label text-label-md font-semibold">Dynamic QR Pass TTL (seconds)</span>
                <input
                  type="number"
                  min={10}
                  max={300}
                  value={config.qr_ttl_seconds}
                  onChange={(e) => setConfig({ ...config, qr_ttl_seconds: Number(e.target.value) })}
                  className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest"
                />
              </label>
              <label className="flex flex-col gap-xs">
                <span className="font-label text-label-md font-semibold">Standard Refund Cutoff Window (hours)</span>
                <input
                  type="number"
                  min={0}
                  max={168}
                  value={config.refund_window_hours}
                  onChange={(e) => setConfig({ ...config, refund_window_hours: Number(e.target.value) })}
                  className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest"
                />
              </label>
              <label className="flex flex-col gap-xs">
                <span className="font-label text-label-md font-semibold">Reward Tokens Per Event Attendance</span>
                <input
                  type="number"
                  min={0}
                  value={config.reward_tokens_per_event}
                  onChange={(e) => setConfig({ ...config, reward_tokens_per_event: Number(e.target.value) })}
                  className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest"
                />
              </label>
            </div>
            <label className="flex items-center gap-sm cursor-pointer">
              <input
                type="checkbox"
                checked={config.allow_external_registrations}
                onChange={(e) => setConfig({ ...config, allow_external_registrations: e.target.checked })}
                className="w-4 h-4 rounded text-light-primary"
              />
              <span className="font-body text-body-md">Allow non-university guest registrations on designated open events</span>
            </label>
            <button
              type="submit"
              className="self-end px-lg py-sm rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold border-0 cursor-pointer"
            >
              Save System Policy
            </button>
          </form>
        )}

        {/* A13 Support & Privacy Tickets */}
        {activeTab === 'support' && (
          <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md shadow-sm divide-y divide-light-outline-variant">
            {tickets.map((t) => (
              <div key={t.id} className="p-lg flex flex-col sm:flex-row sm:items-center justify-between gap-md">
                <div>
                  <span className="font-label text-label-sm text-light-primary font-bold">
                    {t.category} · {t.user_email} · {t.created_at}
                  </span>
                  <h3 className="font-title text-title-md font-semibold m-0">{t.subject}</h3>
                  {t.response && (
                    <span className="block font-body text-body-sm text-light-on-surface-variant mt-xs">
                      Response: {t.response}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-sm shrink-0">
                  <span
                    className={`px-sm py-0.5 rounded-full font-label text-label-sm ${
                      t.status === 'Resolved'
                        ? 'bg-success-container text-on-success-container'
                        : 'bg-warning-container text-on-warning-container'
                    }`}
                  >
                    {t.status}
                  </span>
                  {t.status === 'Open' && (
                    <button
                      type="button"
                      onClick={() => handleResolveTicket(t)}
                      className="px-md py-xs rounded bg-light-primary text-light-on-primary font-label text-label-sm font-semibold border-0 cursor-pointer"
                    >
                      Resolve Request
                    </button>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </AdminLayout>
  );
};

export default AdminGovernance;
