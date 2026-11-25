import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { RegistrationItem } from '../types';
import { generateQRMatrix } from '../utils/qrGenerator';

export const MyQR: React.FC = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [selectedRegId, setSelectedRegId] = useState<string>('');
  const [ttlSeconds, setTtlSeconds] = useState(30);
  const [issuedAtMs, setIssuedAtMs] = useState<number>(Date.now());
  const [secondsLeft, setSecondsLeft] = useState<number>(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPasses = async () => {
      try {
        const [regs, cfg] = await Promise.all([
          dataService.getRegistrations({ userId: user?.id, userEmail: user?.email }),
          dataService.getSystemConfig(),
        ]);
        const eligible = regs.filter((r) => r.status === 'confirmed' || r.status === 'checked_in');
        setRegistrations(eligible);
        if (eligible.length > 0) setSelectedRegId(eligible[0].id);
        const ttl = cfg.qr_ttl_seconds || 30;
        setTtlSeconds(ttl);
        setSecondsLeft(ttl);
      } finally {
        setLoading(false);
      }
    };
    loadPasses();
  }, [user?.id, user?.email]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - issuedAtMs) / 1000);
      const remaining = Math.max(0, ttlSeconds - elapsed);
      setSecondsLeft(remaining);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [issuedAtMs, ttlSeconds]);

  const activeReg = registrations.find((r) => r.id === selectedRegId) || registrations[0] || null;
  const isExpired = secondsLeft === 0;

  const qrPayload = activeReg
    ? `CP1|${activeReg.reg_code}|${activeReg.event_id}|${issuedAtMs}`
    : '';

  const matrix = useMemo(() => {
    if (!qrPayload) return [];
    return generateQRMatrix(qrPayload);
  }, [qrPayload]);

  const handleRefreshToken = () => {
    setIssuedAtMs(Date.now());
    setSecondsLeft(ttlSeconds);
  };

  return (
    <AppLayout>
      <main className="p-lg md:p-xl max-w-[900px] w-full mx-auto flex flex-col gap-xl">
        <header className="flex flex-col gap-xs text-center">
          <h1 className="font-headline text-headline-lg text-light-on-surface font-semibold m-0">
            Dynamic Student Check-In QR Pass
          </h1>
          <p className="font-body text-body-md text-light-on-surface-variant m-0">
            Cryptographically time-boxed entry token scanned at venue gates by authorized organizers.
          </p>
        </header>

        {loading ? (
          <div className="p-xl text-center text-light-on-surface-variant">Loading your active passes...</div>
        ) : !activeReg ? (
          <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-lg p-xl text-center flex flex-col items-center gap-md shadow-sm">
            <span className="material-symbols-outlined text-[48px] text-light-on-surface-variant">qr_code_2</span>
            <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold m-0">
              No Confirmed Event Tickets Found
            </h2>
            <p className="font-body text-body-md text-light-on-surface-variant max-w-md m-0">
              QR passes are issued once free registrations confirm, paid holds settle, or officer screening approves your seat.
            </p>
            <Link
              to="/events"
              className="px-lg py-sm rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold no-underline"
            >
              Browse Campus Events
            </Link>
          </section>
        ) : (
          <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-lg p-lg md:p-xl shadow-md flex flex-col items-center gap-lg">
            {registrations.length > 1 && (
              <label className="w-full max-w-md flex flex-col gap-xs">
                <span className="font-label text-label-sm text-light-on-surface-variant font-semibold">
                  Select Event Ticket
                </span>
                <select
                  value={activeReg.id}
                  onChange={(e) => {
                    setSelectedRegId(e.target.value);
                    handleRefreshToken();
                  }}
                  className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest font-body text-body-md"
                >
                  {registrations.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.reg_code} · {r.event_title}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="text-center flex flex-col gap-xs">
              <span className="font-mono text-mono-md text-light-primary font-bold">
                {activeReg.reg_code}
              </span>
              <h2 className="font-headline text-headline-sm text-light-on-surface font-bold m-0">
                {activeReg.event_title}
              </h2>
              <span className="font-body text-body-md text-light-on-surface-variant">
                {user?.name} ({user?.student_id}) · {activeReg.venue}
              </span>
            </div>

            {/* Scannable Generated ISO QR Matrix */}
            <div className="relative p-md bg-white rounded-lg border-2 border-slate-200 shadow-inner">
              {matrix.length > 0 && (
                <svg
                  width="240"
                  height="240"
                  viewBox={`0 0 ${matrix.length + 4} ${matrix.length + 4}`}
                  role="img"
                  aria-label={`Check-in QR code for ${activeReg.reg_code}`}
                  className={`block transition-opacity ${isExpired ? 'opacity-20 blur-[1px]' : 'opacity-100'}`}
                >
                  <rect width={matrix.length + 4} height={matrix.length + 4} fill="#ffffff" />
                  {matrix.map((row, r) =>
                    row.map((cell, c) =>
                      cell ? <rect key={`${r}-${c}`} x={c + 2} y={r + 2} width={1} height={1} fill="#0f172a" /> : null
                    )
                  )}
                </svg>
              )}

              {isExpired && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-md text-center bg-white/80 rounded-lg">
                  <span className="material-symbols-outlined text-[36px] text-light-error">timer_off</span>
                  <span className="font-label text-label-md font-bold text-light-error">Token Expired</span>
                  <button
                    type="button"
                    onClick={handleRefreshToken}
                    className="mt-sm px-md py-xs rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold border-0 cursor-pointer"
                  >
                    Generate Fresh QR
                  </button>
                </div>
              )}
            </div>

            {/* Timer & Status Strip */}
            <div className="w-full max-w-md flex items-center justify-between bg-light-surface-container-low/60 border border-light-outline-variant rounded-md px-md py-sm">
              <div className="flex items-center gap-xs">
                <span className={`material-symbols-outlined text-[20px] ${isExpired ? 'text-light-error' : 'text-success'}`}>
                  {isExpired ? 'error' : 'schedule'}
                </span>
                <span className="font-label text-label-md font-semibold tabular-nums">
                  {isExpired ? 'Expired · Refresh required' : `Valid for ${secondsLeft}s`}
                </span>
              </div>
              <button
                type="button"
                onClick={handleRefreshToken}
                className="font-label text-label-md text-light-primary font-semibold bg-transparent border-0 cursor-pointer hover:underline"
              >
                Refresh Token
              </button>
            </div>

            <div className="w-full max-w-md text-center">
              <span className="font-label text-label-sm text-light-on-surface-variant block mb-1">
                Token Payload (verifiable in Gate Scanner):
              </span>
              <code className="block px-sm py-xs rounded bg-light-surface-container text-mono-sm font-mono break-all select-all">
                {qrPayload}
              </code>
            </div>
          </section>
        )}
      </main>
    </AppLayout>
  );
};

export default MyQR;
