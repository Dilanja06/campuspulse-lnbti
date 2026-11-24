import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { currentUser } from '../data/mockData';
import { dataService } from '../services/dataService';
import { EventItem } from '../types';

export const Register: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [category, setCategory] = useState('Badminton (Singles)');
  const [size, setSize] = useState('Medium (M)');
  const [emergencyPhone, setEmergencyPhone] = useState('+94 77 123 4567');
  const [medicalNotes, setMedicalNotes] = useState('None');
  const [agreeRules, setAgreeRules] = useState(true);
  const [agreeSafety, setAgreeSafety] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadEvent() {
      if (id) {
        const ev = await dataService.getEventById(id);
        if (ev) setEvent(ev);
      }
    }
    loadEvent();
  }, [id]);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center p-xl">
        <p className="font-body text-body-lg text-light-on-surface-variant">Loading event details...</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeRules || !agreeSafety) {
      alert('Please agree to the university competition rules & health guidelines.');
      return;
    }

    setSubmitting(true);

    const newReg = {
      id: `reg-${Date.now()}`,
      reg_code: `REG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      event_id: event.id,
      event_title: event.title,
      club_name: event.club_name,
      date: event.start_date,
      time: event.time,
      venue: event.venue,
      status: event.fee > 0 ? ('payment_pending' as const) : ('confirmed' as const),
      fee: event.fee,
      created_at: new Date().toISOString(),
    };

    // Save directly to Supabase
    await dataService.addRegistration(newReg);
    setSubmitting(false);

    if (event.fee > 0) {
      navigate('/payment');
    } else {
      navigate('/my-registrations');
    }
  };

  return (
    <div className="min-h-screen bg-light-surface text-light-on-surface font-body antialiased flex flex-col">
      {/* Top Bar for Focused Task */}
      <header className="h-16 bg-light-surface-container-lowest border-b border-light-outline-variant px-xl flex items-center justify-between sticky top-0 z-20">
        <Link
          to={`/events/${event.id}`}
          className="inline-flex items-center gap-xs font-label text-label-md text-light-primary hover:underline no-underline"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span>Back to event</span>
        </Link>
        <span className="font-label text-label-md text-light-on-surface-variant font-medium">
          Step 1 of 2 · Registration Form
        </span>
      </header>

      {/* Main Form Content */}
      <main className="flex-1 max-w-[1040px] w-full mx-auto p-md md:p-xl flex flex-col gap-xl">
        <div className="flex flex-col gap-xs">
          <h1 className="font-headline text-headline-md font-bold text-light-on-surface m-0">
            Event Registration Form
          </h1>
          <p className="font-body text-body-md text-light-on-surface-variant m-0">
            Confirm your verified university participant profile and preferences.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
          {/* Left Form (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-xl">
            {/* Section 1: Verified student details */}
            <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-headline text-title-lg font-semibold text-light-on-surface m-0">
                  Verified Student Record
                </h2>
                <span className="inline-flex items-center gap-xs text-label-sm font-label text-light-secondary font-medium">
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  Auto-populated
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <div className="flex flex-col gap-xs">
                  <span className="font-label text-label-sm text-light-on-surface-variant">Full Name</span>
                  <input
                    type="text"
                    disabled
                    value={currentUser.name}
                    className="w-full rounded border border-light-outline-variant bg-light-surface-container-low px-md py-sm font-body text-body-md text-light-on-surface opacity-80 cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col gap-xs">
                  <span className="font-label text-label-sm text-light-on-surface-variant">Student ID</span>
                  <input
                    type="text"
                    disabled
                    value={currentUser.student_id}
                    className="w-full rounded border border-light-outline-variant bg-light-surface-container-low px-md py-sm font-mono text-mono-md text-light-on-surface opacity-80 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-xs">
                <span className="font-label text-label-sm text-light-on-surface-variant">University Email</span>
                <input
                  type="text"
                  disabled
                  value={currentUser.email}
                  className="w-full rounded border border-light-outline-variant bg-light-surface-container-low px-md py-sm font-body text-body-md text-light-on-surface opacity-80 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Section 2: Participant preferences */}
            <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
              <h2 className="font-headline text-title-lg font-semibold text-light-on-surface m-0">
                Participation Preferences
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <label className="flex flex-col gap-xs">
                  <span className="font-label text-label-sm text-light-on-surface font-medium">Event Track / Sport</span>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded border border-light-outline-variant bg-light-surface-container-lowest px-md py-sm font-body text-body-md text-light-on-surface outline-none"
                  >
                    <option value="Badminton (Singles)">Badminton (Singles)</option>
                    <option value="Table Tennis (Doubles)">Table Tennis (Doubles)</option>
                    <option value="Basketball 3v3">Basketball 3v3</option>
                    <option value="Chess Championship">Chess Championship</option>
                  </select>
                </label>

                <label className="flex flex-col gap-xs">
                  <span className="font-label text-label-sm text-light-on-surface font-medium">Kit / Jersey Size</span>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full rounded border border-light-outline-variant bg-light-surface-container-lowest px-md py-sm font-body text-body-md text-light-on-surface outline-none"
                  >
                    <option value="Small (S)">Small (S)</option>
                    <option value="Medium (M)">Medium (M)</option>
                    <option value="Large (L)">Large (L)</option>
                    <option value="Extra Large (XL)">Extra Large (XL)</option>
                  </select>
                </label>
              </div>

              <label className="flex flex-col gap-xs">
                <span className="font-label text-label-sm text-light-on-surface font-medium">Emergency Contact Number</span>
                <input
                  type="tel"
                  required
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full rounded border border-light-outline-variant bg-light-surface-container-lowest px-md py-sm font-body text-body-md text-light-on-surface outline-none"
                />
              </label>

              <label className="flex flex-col gap-xs">
                <span className="font-label text-label-sm text-light-on-surface font-medium">Medical Allergies / Dietary Constraints</span>
                <textarea
                  rows={3}
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  className="w-full rounded border border-light-outline-variant bg-light-surface-container-lowest px-md py-sm font-body text-body-md text-light-on-surface outline-none resize-none"
                />
              </label>
            </div>

            {/* Section 3: Rules and Consent */}
            <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
              <h2 className="font-headline text-title-lg font-semibold text-light-on-surface m-0">
                Rules &amp; Participant Consent
              </h2>

              <label className="flex items-start gap-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeRules}
                  onChange={(e) => setAgreeRules(e.target.checked)}
                  className="mt-1 w-4 h-4 text-light-primary rounded"
                />
                <span className="font-body text-body-md text-light-on-surface">
                  I agree to abide by the University Code of Conduct, sportsmanship guidelines, and organizing committee directives.
                </span>
              </label>

              <label className="flex items-start gap-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeSafety}
                  onChange={(e) => setAgreeSafety(e.target.checked)}
                  className="mt-1 w-4 h-4 text-light-primary rounded"
                />
                <span className="font-body text-body-md text-light-on-surface">
                  I confirm that I am medically fit to participate and consent to emergency first aid on premises if required.
                </span>
              </label>
            </div>

            {/* Form Action Buttons */}
            <div className="flex items-center justify-between pt-md">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-lg py-sm rounded bg-light-surface-container-lowest text-light-on-surface-variant border border-light-outline-variant font-label text-label-lg font-semibold hover:bg-light-surface-container-low cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-xl py-sm rounded bg-light-primary text-light-on-primary font-label text-label-lg font-bold hover:bg-light-primary-container transition-all cursor-pointer border-0 shadow-sm"
              >
                {submitting ? 'Saving to Database...' : event.fee > 0 ? `Continue to Payment · LKR ${event.fee}` : 'Confirm Free Registration'}
              </button>
            </div>
          </div>

          {/* Right Summary Card (5 cols) */}
          <div className="lg:col-span-5 sticky top-24 flex flex-col gap-md">
            <div className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
              <span className="font-headline text-title-md font-semibold text-light-on-surface">
                Registration Summary
              </span>

              <div className="h-28 bg-gradient-to-r from-slate-900 to-indigo-950 rounded p-md flex flex-col justify-end text-white">
                <span className="text-xs font-mono text-teal-300">{event.code}</span>
                <span className="font-headline text-title-md font-bold text-white line-clamp-1">{event.title}</span>
              </div>

              <div className="flex flex-col gap-xs text-body-md text-light-on-surface-variant border-b border-light-outline-variant pb-md">
                <div className="flex justify-between">
                  <span>Organizing Club:</span>
                  <span className="font-semibold text-light-on-surface">{event.club_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-semibold text-light-on-surface">{event.start_date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Venue:</span>
                  <span className="font-semibold text-light-on-surface">{event.venue}</span>
                </div>
              </div>

              {/* Fee breakdown */}
              <div className="flex flex-col gap-xs text-body-md">
                <div className="flex justify-between text-light-on-surface-variant">
                  <span>Registration Fee</span>
                  <span className="font-mono">LKR {event.fee}</span>
                </div>
                <div className="flex justify-between text-light-on-surface-variant">
                  <span>Portal Service Fee</span>
                  <span className="font-mono">LKR 0.00</span>
                </div>
                <div className="flex justify-between text-title-md font-bold text-light-primary border-t border-light-outline-variant pt-sm mt-xs">
                  <span>Total Amount</span>
                  <span className="font-mono">LKR {event.fee}</span>
                </div>
              </div>

              {/* Hold Warning */}
              {event.fee > 0 && (
                <div className="bg-warning-container text-on-warning-container rounded p-md flex items-start gap-xs text-label-sm">
                  <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">timer</span>
                  <span>
                    Your seat reservation will be held for 10 minutes upon form submission to allow payment verification.
                  </span>
                </div>
              )}
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Register;
