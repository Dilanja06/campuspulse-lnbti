import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { currentUser } from '../data/mockData';
import { RegistrationItem } from '../types';
import { dataService } from '../services/dataService';

export const MyQR: React.FC = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(30);
  const [allConfirmed, setAllConfirmed] = useState<RegistrationItem[]>([]);
  const [registration, setRegistration] = useState<RegistrationItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReg() {
      setLoading(true);
      const regs = await dataService.getRegistrations();
      const confirmedList = regs.filter((r) => r.status === 'confirmed');
      setAllConfirmed(confirmedList);

      // Check if user recently paid for a specific event
      let target: RegistrationItem | undefined;
      try {
        const raw = localStorage.getItem('lnbti_recent_payment');
        if (raw) {
          const parsed = JSON.parse(raw);
          target = confirmedList.find(
            (r) =>
              r.reg_code === parsed.reg_code ||
              (parsed.event_title && r.event_title.toLowerCase().includes(parsed.event_title.toLowerCase()))
          );
        }
      } catch (e) {
        console.warn(e);
      }

      if (!target && confirmedList.length > 0) {
        target = confirmedList[0];
      }

      if (target) {
        setRegistration(target);
      }
      setLoading(false);
    }
    loadReg();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 30 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const progressPercent = ((30 - timeLeft) / 30) * 100;

  return (
    <div className="min-h-screen bg-light-surface text-light-on-surface font-body antialiased flex flex-col">
      {/* Top Bar for Focused Task */}
      <header className="h-16 bg-light-surface-container-lowest border-b border-light-outline-variant px-xl flex items-center justify-between sticky top-0 z-20">
        <Link
          to="/my-registrations"
          className="inline-flex items-center gap-xs font-label text-label-md text-light-primary hover:underline no-underline"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span>Back to registrations</span>
        </Link>
        <span className="font-label text-label-md text-light-on-surface-variant font-medium truncate max-w-xs">
          {registration ? registration.event_title : 'Attendance QR'}
        </span>
      </header>

      {/* Centered Pass Card */}
      <main className="flex-1 flex flex-col items-center justify-center p-md md:p-xl">
        {loading ? (
          <p className="font-body text-body-lg text-light-on-surface-variant">
            Loading verified pass from Supabase...
          </p>
        ) : !registration ? (
          <div className="w-full max-w-[440px] bg-light-surface-container-lowest border border-light-outline-variant rounded-lg p-xl flex flex-col items-center gap-md shadow-sm text-center">
            <span className="material-symbols-outlined text-[48px] text-light-outline">qr_code_2</span>
            <h2 className="font-headline text-headline-sm font-bold text-light-on-surface m-0">
              No Confirmed Passes
            </h2>
            <p className="font-body text-body-md text-light-on-surface-variant">
              You do not have any confirmed event registrations at this time. Once an event registration is confirmed or paid, your live entry QR will appear here.
            </p>
            <Link
              to="/events"
              className="px-md py-sm rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold no-underline mt-xs"
            >
              Browse Events to Register
            </Link>
          </div>
        ) : (
          <div className="w-full max-w-[440px] bg-light-surface-container-lowest border border-light-outline-variant rounded-lg p-xl flex flex-col items-center gap-lg shadow-md text-center">
            {/* Multiple Passes Switcher */}
            {allConfirmed.length > 1 && (
              <div className="w-full flex items-center justify-center gap-xs overflow-x-auto pb-xs">
                {allConfirmed.map((pass) => (
                  <button
                    key={pass.id}
                    onClick={() => setRegistration(pass)}
                    className={`px-sm py-1 rounded text-xs font-label cursor-pointer border transition-colors ${
                      registration.id === pass.id
                        ? 'bg-light-primary text-light-on-primary border-light-primary font-bold shadow-sm'
                        : 'bg-light-surface-container-low text-light-on-surface-variant border-light-outline-variant hover:bg-light-surface-container'
                    }`}
                  >
                    {pass.reg_code} · {pass.event_title.split(' ')[0]}
                  </button>
                ))}
              </div>
            )}

            {/* Status Badge */}
            <span className="inline-flex items-center gap-xs px-md py-xs rounded-full bg-success-container text-success font-label text-label-sm font-semibold">
              <span className="material-symbols-outlined text-[16px]">sensors</span>
              Live Attendance Pass
            </span>

            {/* Event Header */}
            <div className="flex flex-col gap-xs">
              <h1 className="font-headline text-headline-sm font-bold text-light-on-surface m-0">
                {registration.event_title}
              </h1>
              <p className="font-body text-body-md text-light-on-surface-variant m-0">
                {registration.date} · {registration.venue}
              </p>
            </div>

            {/* QR Code Container with High-Contrast Scalable SVG */}
            <div className="p-lg rounded-xl bg-white border-2 border-dashed border-light-outline-variant shadow-inner flex flex-col items-center justify-center relative">
              <svg
                className="w-52 h-52 text-light-primary"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Corner 1 */}
                <rect x="5" y="5" width="28" height="28" rx="4" stroke="#022448" strokeWidth="6" />
                <rect x="13" y="13" width="12" height="12" rx="2" fill="#006A61" />

                {/* Corner 2 */}
                <rect x="67" y="5" width="28" height="28" rx="4" stroke="#022448" strokeWidth="6" />
                <rect x="75" y="13" width="12" height="12" rx="2" fill="#006A61" />

                {/* Corner 3 */}
                <rect x="5" y="67" width="28" height="28" rx="4" stroke="#022448" strokeWidth="6" />
                <rect x="13" y="75" width="12" height="12" rx="2" fill="#006A61" />

                {/* Data Matrix Dots */}
                <rect x="40" y="10" width="8" height="8" rx="1" fill="#022448" />
                <rect x="52" y="10" width="8" height="8" rx="1" fill="#006A61" />
                <rect x="40" y="22" width="8" height="8" rx="1" fill="#022448" />
                <rect x="40" y="40" width="20" height="20" rx="3" fill="#022448" />
                <rect x="46" y="46" width="8" height="8" rx="1" fill="#ffffff" />
                <rect x="10" y="40" width="8" height="8" rx="1" fill="#006A61" />
                <rect x="22" y="40" width="8" height="8" rx="1" fill="#022448" />
                <rect x="70" y="40" width="8" height="8" rx="1" fill="#022448" />
                <rect x="82" y="40" width="8" height="8" rx="1" fill="#006A61" />
                <rect x="40" y="70" width="8" height="8" rx="1" fill="#022448" />
                <rect x="52" y="70" width="8" height="8" rx="1" fill="#022448" />
                <rect x="70" y="70" width="8" height="8" rx="1" fill="#006A61" />
                <rect x="82" y="70" width="8" height="8" rx="1" fill="#022448" />
                <rect x="70" y="82" width="8" height="8" rx="1" fill="#022448" />
              </svg>

              {/* Pulsing indicator */}
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                LIVE
              </div>
            </div>

            {/* Dynamic Refresh Indicator */}
            <div className="w-full flex flex-col gap-xs">
              <div className="flex justify-between items-center text-label-sm font-mono text-light-on-surface-variant">
                <span>Token re-signing</span>
                <span className="font-semibold text-light-primary">{timeLeft}s remaining</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-light-surface-container-high overflow-hidden">
                <div
                  className="h-full bg-light-secondary rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Student ID Card Badge */}
            <div className="w-full bg-light-surface-container-low border border-light-outline-variant rounded-md p-md flex items-center justify-between text-left">
              <div className="flex flex-col">
                <span className="font-title text-title-md font-semibold text-light-on-surface">
                  {currentUser.name}
                </span>
                <span className="font-mono text-mono-md text-light-on-surface-variant">
                  {currentUser.student_id}
                </span>
              </div>
              <span className="px-sm py-xs rounded bg-light-surface-container-high font-mono text-label-sm text-light-primary font-bold">
                {registration.reg_code}
              </span>
            </div>

            {/* Security note */}
            <p className="font-body text-xs text-light-outline m-0">
              Pass is cryptographically bound to registered device. Screenshots will be rejected by turnstile scanner.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyQR;
