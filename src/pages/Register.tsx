import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { EventItem } from '../types';
import { getEventCoverImage } from '../utils/eventImages';

export const Register: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);

  const [activityTrack, setActivityTrack] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('+94 77 451 8920');
  const [medicalNotes, setMedicalNotes] = useState('None');
  const [agreeRules, setAgreeRules] = useState(true);
  const [agreeSafety, setAgreeSafety] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;
      try {
        const ev = await dataService.getEventById(id);
        setEvent(ev);
        if (ev) {
          setActivityTrack(defaultTracksForCategory(ev.category)[0]);
        }
      } finally {
        setLoading(false);
      }
    };
    loadEvent();
  }, [id]);

  const defaultTracksForCategory = (category: EventItem['category']) => {
    switch (category) {
      case 'Sports':
        return ['Badminton Singles', 'Table Tennis Doubles', 'Chess Rapid', 'General Athletics'];
      case 'Technical':
        return ['Software Build Track', 'AI & Data Track', 'Cybersecurity Challenge', 'General Participant'];
      case 'Cultural':
        return ['Stage Performance', 'Backstage & Production', 'Audience Pass'];
      case 'Community Service':
        return ['Field Volunteer', 'Logistics & Coordination'];
      default:
        return ['General Participant', 'Presenter / Panelist'];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !user) return;
    if (!agreeRules || !agreeSafety) {
      setErrorMsg('Please accept both the University Code of Conduct and Medical Safety consent.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await dataService.registerForEventAtomic({
        event,
        userId: user.id,
        userName: user.name,
        studentId: user.student_id || 'UG/2024/0000',
        userEmail: user.email,
        activity: activityTrack,
      });

      if (!res.success || !res.registration) {
        setErrorMsg(res.error || 'Could not complete registration.');
        return;
      }

      if (res.registration.status === 'payment_pending') {
        navigate(
          `/payments?reg=${encodeURIComponent(res.registration.reg_code)}&event=${encodeURIComponent(
            event.title
          )}&amount=${event.fee}`
        );
      } else {
        navigate('/my-registrations');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <main className="p-xl max-w-[1000px] mx-auto text-center text-light-on-surface-variant">
          Loading registration form...
        </main>
      </AppLayout>
    );
  }

  if (!event) {
    return (
      <AppLayout>
        <main className="p-xl max-w-[900px] mx-auto text-center">
          <p className="font-body text-body-md text-light-on-surface-variant">Event not found.</p>
          <Link to="/events" className="text-light-primary font-label text-label-md">← Return to Events</Link>
        </main>
      </AppLayout>
    );
  }

  const tracks = defaultTracksForCategory(event.category);
  const unavailable = event.status !== 'published' || event.registered >= event.capacity;

  return (
    <AppLayout>
      <main className="p-lg md:p-xl max-w-[1200px] w-full mx-auto flex flex-col gap-xl">
        <header className="flex flex-col gap-xs">
          <Link
            to={`/events/${event.id}`}
            className="inline-flex items-center gap-xs text-light-on-surface-variant hover:text-light-on-surface font-label text-label-md no-underline w-fit"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to {event.title}</span>
          </Link>
          <h1 className="font-headline text-headline-lg text-light-on-surface font-semibold m-0">
            Event Registration (S07)
          </h1>
          <p className="font-body text-body-md text-light-on-surface-variant m-0">
            Atomic seat reservation &amp; participant profile confirmation.
          </p>
        </header>

        {unavailable && (
          <div className="p-md rounded bg-light-error-container text-light-on-error-container font-body text-body-md">
            Registration is currently unavailable for this event ({event.status}, {event.registered}/{event.capacity} seats filled).
          </div>
        )}

        {errorMsg && (
          <div className="p-md rounded bg-light-error-container text-light-on-error-container font-body text-body-md">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
          {/* Left Form (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-lg">
            {/* Section 1: Verified Identity */}
            <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
              <h2 className="font-headline text-title-lg font-semibold text-light-on-surface m-0">
                Verified Student Identity
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md text-body-md">
                <div>
                  <span className="font-label text-label-sm text-light-on-surface-variant block">Full Name</span>
                  <span className="font-semibold">{user?.name}</span>
                </div>
                <div>
                  <span className="font-label text-label-sm text-light-on-surface-variant block">University ID</span>
                  <span className="font-mono font-semibold">{user?.student_id}</span>
                </div>
                <div>
                  <span className="font-label text-label-sm text-light-on-surface-variant block">Institutional Email</span>
                  <span className="font-semibold">{user?.email}</span>
                </div>
                <div>
                  <span className="font-label text-label-sm text-light-on-surface-variant block">Faculty</span>
                  <span className="font-semibold">{user?.faculty}</span>
                </div>
              </div>
            </section>

            {/* Section 2: Track & Emergency Contact */}
            <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
              <h2 className="font-headline text-title-lg font-semibold text-light-on-surface m-0">
                Participation Details
              </h2>

              <label className="flex flex-col gap-xs">
                <span className="font-label text-label-md font-semibold">Selected Track / Activity</span>
                <select
                  value={activityTrack}
                  onChange={(e) => setActivityTrack(e.target.value)}
                  className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest font-body text-body-md"
                >
                  {tracks.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-xs">
                <span className="font-label text-label-md font-semibold">Emergency Contact Number</span>
                <input
                  type="tel"
                  required
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest font-body text-body-md"
                />
              </label>

              <label className="flex flex-col gap-xs">
                <span className="font-label text-label-md font-semibold">Medical / Accessibility Notes</span>
                <textarea
                  rows={2}
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest font-body text-body-md resize-none"
                />
              </label>
            </section>

            {/* Section 3: Rules */}
            <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
              <label className="flex items-start gap-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeRules}
                  onChange={(e) => setAgreeRules(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-light-primary"
                />
                <span className="font-body text-body-md text-light-on-surface">
                  I agree to abide by the University Code of Conduct and organizing committee directives.
                </span>
              </label>
              <label className="flex items-start gap-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeSafety}
                  onChange={(e) => setAgreeSafety(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-light-primary"
                />
                <span className="font-body text-body-md text-light-on-surface">
                  I confirm medical fitness to participate and consent to emergency on-campus first aid if required.
                </span>
              </label>
            </section>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-lg py-sm rounded border border-light-outline-variant bg-light-surface-container-lowest text-light-on-surface font-label text-label-md font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || unavailable}
                className="px-xl py-sm rounded bg-light-primary text-light-on-primary font-label text-label-lg font-bold border-0 cursor-pointer hover:bg-light-primary-container disabled:opacity-50"
              >
                {submitting
                  ? 'Reserving Seat...'
                  : event.manual_approval
                  ? 'Submit for Officer Approval'
                  : event.fee > 0
                  ? `Reserve Hold & Pay · LKR ${event.fee}`
                  : 'Confirm Free Registration'}
              </button>
            </div>
          </div>

          {/* Right Summary Card */}
          <aside className="lg:col-span-5 bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm lg:sticky lg:top-24">
            <h2 className="font-title text-title-md text-light-on-surface font-semibold m-0">
              Registration Summary
            </h2>
            <div className="h-32 relative rounded overflow-hidden bg-slate-900">
              <img
                src={getEventCoverImage(event)}
                alt={event.title}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-md flex flex-col justify-end text-white">
                <span className="font-mono text-mono-sm text-teal-300">{event.code}</span>
                <span className="font-title text-title-md font-bold">{event.title}</span>
              </div>
            </div>
            <div className="flex flex-col gap-xs text-body-md border-b border-light-outline-variant pb-md">
              <div className="flex justify-between">
                <span className="text-light-on-surface-variant">Organizing Club</span>
                <span className="font-semibold">{event.club_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-light-on-surface-variant">Date &amp; Time</span>
                <span className="font-semibold">{event.start_date} · {event.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-light-on-surface-variant">Venue</span>
                <span className="font-semibold">{event.venue}</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-title-md font-bold text-light-primary">
              <span>Total Fee</span>
              <span className="font-mono">{event.fee > 0 ? `LKR ${event.fee}` : 'LKR 0.00 (Free)'}</span>
            </div>
            {event.manual_approval ? (
              <div className="bg-info-container/40 text-on-info-container rounded p-md text-label-sm flex items-start gap-xs">
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">policy</span>
                <span>Requires manual club officer approval prior to ticket confirmation.</span>
              </div>
            ) : event.fee > 0 ? (
              <div className="bg-warning-container text-on-warning-container rounded p-md text-label-sm flex items-start gap-xs">
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">timer</span>
                <span>Your seat reservation is held for {event.hold_minutes || 10} minutes pending payment confirmation.</span>
              </div>
            ) : null}
          </aside>
        </form>
      </main>
    </AppLayout>
  );
};

export default Register;
