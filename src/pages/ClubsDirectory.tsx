import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { ClubItem } from '../types';

export const ClubsDirectory: React.FC = () => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  const loadClubs = async () => {
    try {
      const list = await dataService.getClubs();
      setClubs(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClubs();
  }, []);

  const handleJoin = async (club: ClubItem) => {
    if (!user) return;
    setJoiningId(club.id);
    try {
      await dataService.joinClub(club, {
        id: user.id,
        name: user.name,
        email: user.email,
        studentId: user.student_id || 'UG/2024/0000',
        faculty: user.faculty,
      });
      setFeedback(`Application sent to ${club.name}. Club officer review is pending.`);
      await loadClubs();
    } finally {
      setJoiningId(null);
    }
  };

  const categories = ['All', 'Technical', 'Sports', 'Cultural', 'Academic', 'Community Service'];
  const filtered = clubs.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = category === 'All' || c.category === category;
    return matchSearch && matchCat;
  });

  return (
    <AppLayout>
      <main className="p-lg md:p-xl max-w-[1400px] w-full mx-auto flex flex-col gap-xl">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline text-headline-lg text-light-on-surface font-semibold m-0">
              Clubs &amp; Societies Directory (S14)
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant m-0">
              Explore officially chartered student societies, executive committees, and membership opportunities.
            </p>
          </div>
          <Link
            to="/my-memberships"
            className="px-md py-sm rounded bg-light-surface-container-lowest border border-light-outline-variant text-light-on-surface font-label text-label-md font-semibold no-underline w-fit"
          >
            My Memberships →
          </Link>
        </header>

        {feedback && (
          <div className="p-md rounded bg-success-container/30 border border-success text-on-success-container font-body text-body-md">
            {feedback}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-md items-stretch md:items-center justify-between">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search societies by name or focus..."
            className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest md:w-80 font-body text-body-md"
          />
          <div className="flex flex-wrap gap-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-md py-xs rounded-full font-label text-label-md border cursor-pointer ${
                  category === cat
                    ? 'bg-light-primary text-light-on-primary border-light-primary'
                    : 'bg-light-surface-container-lowest text-light-on-surface-variant border-light-outline-variant'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-xl text-center text-light-on-surface-variant">Loading clubs...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {filtered.map((club) => (
              <article
                key={club.id}
                className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col justify-between gap-md shadow-sm"
              >
                <div className="flex flex-col gap-xs">
                  <div className="flex items-center justify-between gap-sm">
                    <span className="font-label text-label-sm text-light-primary font-semibold uppercase">
                      {club.category}
                    </span>
                    <span
                      className={`px-sm py-0.5 rounded-full font-label text-label-sm ${
                        club.status === 'Active Member'
                          ? 'bg-success-container text-on-success-container'
                          : club.status === 'Application Sent'
                          ? 'bg-warning-container text-on-warning-container'
                          : club.status === 'Following'
                          ? 'bg-info-container text-on-info-container'
                          : 'bg-light-surface-container-low text-light-on-surface-variant'
                      }`}
                    >
                      {club.status}
                    </span>
                  </div>

                  <h2 className="font-title text-title-lg text-light-on-surface font-bold m-0">
                    {club.name}
                  </h2>
                  <p className="font-body text-body-md text-light-on-surface-variant m-0 line-clamp-3">
                    {club.description}
                  </p>
                  <div className="text-label-sm text-light-on-surface-variant pt-xs">
                    Lead: <strong>{club.lead}</strong> · {club.member_count} members · Fee:{' '}
                    {club.annual_fee > 0 ? `LKR ${club.annual_fee}/yr` : 'Free'}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-md border-t border-light-outline-variant gap-sm">
                  <Link
                    to={`/clubs/${club.id}`}
                    className="font-label text-label-md text-light-primary font-semibold no-underline hover:underline"
                  >
                    View Club Profile
                  </Link>

                  {club.status === 'Not Joined' || club.status === 'Following' ? (
                    <button
                      type="button"
                      disabled={joiningId === club.id}
                      onClick={() => handleJoin(club)}
                      className="px-md py-xs rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold border-0 cursor-pointer"
                    >
                      {joiningId === club.id ? 'Applying...' : 'Apply to Join'}
                    </button>
                  ) : (
                    <span className="font-label text-label-sm text-light-on-surface-variant font-medium">
                      {club.status}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </AppLayout>
  );
};

export default ClubsDirectory;
