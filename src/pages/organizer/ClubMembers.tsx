import React, { useEffect, useState } from 'react';
import { OrganizerLayout } from '../../components/OrganizerLayout';
import { ClubMemberItem, ClubItem, ClubPostItem } from '../../types';
import { dataService } from '../../services/dataService';

export const ClubMembers: React.FC = () => {
  const [members, setMembers] = useState<ClubMemberItem[]>([]);
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [posts, setPosts] = useState<ClubPostItem[]>([]);
  const [selectedClubId, setSelectedClubId] = useState('club-sports');
  const [clubDescription, setClubDescription] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postAudience, setPostAudience] = useState<'All Students' | 'Members Only'>('All Students');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [mList, cList, pList] = await Promise.all([
        dataService.getClubMembers(),
        dataService.getClubs(),
        dataService.getClubPosts(false),
      ]);
      setMembers(mList);
      setClubs(cList);
      setPosts(pList);
      const activeClub = cList.find((c) => c.id === selectedClubId) || cList[0];
      if (activeClub) {
        setSelectedClubId(activeClub.id);
        setClubDescription(activeClub.description);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClubChange = (clubId: string) => {
    setSelectedClubId(clubId);
    const match = clubs.find((c) => c.id === clubId);
    if (match) setClubDescription(match.description);
  };

  const handleApproveMember = async (id: string) => {
    await dataService.approveClubMember(id);
    setFeedback('Member application approved and synced.');
    await loadData();
  };

  const handleDeclineMember = async (id: string) => {
    await dataService.declineClubMember(id);
    setFeedback('Member application declined.');
    await loadData();
  };

  const handleSaveClubProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await dataService.updateClubContent(selectedClubId, clubDescription);
    setFeedback('Club profile description updated.');
    await loadData();
  };

  const handlePublishPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;
    const club = clubs.find((c) => c.id === selectedClubId);
    await dataService.createClubPost({
      club_id: selectedClubId,
      club_name: club?.name || 'University Sports Council',
      title: postTitle.trim(),
      content: postContent.trim(),
      audience: postAudience,
    });
    setPostTitle('');
    setPostContent('');
    setFeedback('Club post published to student portal.');
    await loadData();
  };

  return (
    <OrganizerLayout>
      <main className="p-lg md:p-xl max-w-[1400px] w-full mx-auto flex flex-col gap-xl">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline text-headline-lg text-light-on-surface font-semibold">
              Club Membership &amp; Posts (O12 · O13)
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant">
              Approve membership applications, manage club profile descriptions, and publish announcements.
            </p>
          </div>

          <select
            value={selectedClubId}
            onChange={(e) => handleClubChange(e.target.value)}
            className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest font-label text-label-md"
          >
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </header>

        {feedback && (
          <div className="p-md rounded bg-success-container/30 border border-success text-on-success-container font-body text-body-md">
            {feedback}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
          {/* Member Directory & Applications (7 cols) */}
          <section className="lg:col-span-7 bg-light-surface-container-lowest border border-light-outline-variant rounded-md shadow-sm overflow-hidden">
            <div className="px-lg py-md border-b border-light-outline-variant bg-light-surface-container-low/50">
              <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold m-0">
                Member Roster &amp; Pending Applications ({members.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-light-outline-variant bg-light-surface-container-low/30 text-light-on-surface-variant font-label text-label-sm">
                    <th className="px-md py-sm">Student</th>
                    <th className="px-md py-sm">Faculty &amp; Role</th>
                    <th className="px-md py-sm">Status</th>
                    <th className="px-md py-sm text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-outline-variant">
                  {loading ? (
                    <tr><td colSpan={4} className="p-lg text-center">Loading members...</td></tr>
                  ) : (
                    members.map((m) => (
                      <tr key={m.id}>
                        <td className="px-md py-sm">
                          <div className="font-title text-title-md text-light-on-surface font-medium">{m.name}</div>
                          <div className="font-mono text-mono-sm text-light-on-surface-variant">{m.student_id}</div>
                        </td>
                        <td className="px-md py-sm font-body text-body-sm text-light-on-surface-variant">
                          {m.faculty} · {m.role}
                        </td>
                        <td className="px-md py-sm">
                          <span
                            className={`px-sm py-0.5 rounded-full font-label text-label-sm ${
                              m.status === 'Active'
                                ? 'bg-success-container text-on-success-container'
                                : m.status === 'Pending'
                                ? 'bg-warning-container text-on-warning-container'
                                : 'bg-light-error-container text-light-on-error-container'
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>
                        <td className="px-md py-sm text-right whitespace-nowrap">
                          {m.status === 'Pending' && (
                            <div className="inline-flex gap-xs">
                              <button
                                type="button"
                                onClick={() => handleApproveMember(m.id)}
                                className="px-sm py-xs rounded bg-light-primary text-light-on-primary font-label text-label-sm border-0 cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeclineMember(m.id)}
                                className="px-sm py-xs rounded bg-light-error-container text-light-on-error-container font-label text-label-sm border-0 cursor-pointer"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Club Profile Editor & Publish Post (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-lg">
            <form
              onSubmit={handleSaveClubProfile}
              className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm"
            >
              <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold m-0">
                Update Club Profile Content
              </h2>
              <textarea
                rows={3}
                value={clubDescription}
                onChange={(e) => setClubDescription(e.target.value)}
                className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest font-body text-body-md resize-none"
              />
              <button
                type="submit"
                className="self-end px-md py-xs rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold border-0 cursor-pointer"
              >
                Save Club Profile
              </button>
            </form>

            <form
              onSubmit={handlePublishPost}
              className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm"
            >
              <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold m-0">
                Publish Announcement / Post (O13)
              </h2>
              <input
                type="text"
                required
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="Announcement headline..."
                className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest font-body text-body-md"
              />
              <select
                value={postAudience}
                onChange={(e) => setPostAudience(e.target.value as 'All Students' | 'Members Only')}
                className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest font-body text-body-md"
              >
                <option value="All Students">Visible to All Students</option>
                <option value="Members Only">Club Members Only</option>
              </select>
              <textarea
                rows={3}
                required
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Write post details..."
                className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest font-body text-body-md resize-none"
              />
              <button
                type="submit"
                className="self-end px-md py-xs rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold border-0 cursor-pointer"
              >
                Publish Post ({posts.length} live)
              </button>
            </form>
          </div>
        </div>
      </main>
    </OrganizerLayout>
  );
};

export default ClubMembers;
