import React, { useState } from 'react';
import { useDatabaseStatus } from '../context/DatabaseStatusContext';

export const DatabaseStatusBadge: React.FC = () => {
  const { status, isLive, latencyMs, projectUrl, lastChecked, reason, tableResults, checkHealth } = useDatabaseStatus();
  const [isOpen, setIsOpen] = useState(false);
  const [isRetesting, setIsRetesting] = useState(false);

  const handleRetest = async () => {
    setIsRetesting(true);
    await checkHealth();
    setIsRetesting(false);
  };

  // Masked URL for clean display
  const displayHost = projectUrl.replace('https://', '').replace('/', '');

  return (
    <>
      {/* Clickable Pill Badge in Navigation */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title={isLive ? `Connected to live Supabase DB (${latencyMs ? `${latencyMs}ms` : 'online'})` : 'Running on mock data fallback. Click to inspect.'}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border transition-all cursor-pointer shadow-xs ${
          status === 'checking'
            ? 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
            : isLive
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80'
            : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80'
        }`}
      >
        <span className="relative flex h-2 w-2">
          {isLive && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              status === 'checking'
                ? 'bg-slate-400 animate-pulse'
                : isLive
                ? 'bg-emerald-500'
                : 'bg-amber-500'
            }`}
          ></span>
        </span>
        <span className="font-semibold">
          {status === 'checking' ? 'Testing DB...' : isLive ? 'Live DB' : 'Demo Fallback'}
        </span>
        {latencyMs !== null && isLive && (
          <span className="text-[10px] opacity-75 hidden sm:inline">{latencyMs}ms</span>
        )}
      </button>

      {/* Database Inspector Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-light-surface-container-lowest border border-light-outline-variant rounded-lg p-lg flex flex-col gap-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-xs border-b border-light-outline-variant">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-[24px] text-light-primary">
                  database
                </span>
                <div className="flex flex-col">
                  <h3 className="font-headline text-title-md font-bold text-light-on-surface m-0">
                    Database Connection Inspector
                  </h3>
                  <span className="font-body text-xs text-light-on-surface-variant">
                    Real-time Supabase Cloud vs Local Fallback Health
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-light-on-surface-variant hover:bg-light-surface-container hover:text-light-on-surface border-0 bg-transparent cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Current Mode Banner */}
            <div
              className={`p-md rounded-md flex items-start gap-md border ${
                isLive
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
                  : 'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200'
              }`}
            >
              <span className="material-symbols-outlined text-[24px] shrink-0 mt-0.5">
                {isLive ? 'cloud_done' : 'warning'}
              </span>
              <div className="flex flex-col gap-xs flex-1 text-sm">
                <span className="font-bold text-base">
                  {isLive ? '🟢 Live Supabase Database Active' : '🟡 Local In-Memory Fallback Active'}
                </span>
                <p className="m-0 text-xs leading-relaxed opacity-90">
                  {reason}
                </p>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-sm">
              <div className="p-sm bg-light-surface-container-low border border-light-outline-variant rounded flex flex-col">
                <span className="text-[11px] text-light-on-surface-variant uppercase font-semibold">
                  Supabase Project
                </span>
                <span className="font-mono text-xs text-light-on-surface font-bold truncate mt-0.5" title={projectUrl}>
                  {displayHost}
                </span>
              </div>
              <div className="p-sm bg-light-surface-container-low border border-light-outline-variant rounded flex flex-col">
                <span className="text-[11px] text-light-on-surface-variant uppercase font-semibold">
                  Query Latency
                </span>
                <span className="font-mono text-xs text-light-on-surface font-bold mt-0.5">
                  {latencyMs !== null ? `${latencyMs} ms` : 'Offline / Failed'}
                </span>
              </div>
            </div>

            {/* Live Table Health Breakdown */}
            <div className="flex flex-col gap-xs">
              <span className="font-label text-xs font-semibold text-light-on-surface uppercase">
                Table Read Checks
              </span>
              <div className="divide-y divide-light-outline-variant border border-light-outline-variant rounded bg-light-surface-container-lowest overflow-hidden text-xs">
                {tableResults.map((t) => (
                  <div key={t.tableName} className="p-xs px-sm flex items-center justify-between">
                    <div className="flex items-center gap-xs">
                      <span className="font-mono font-medium text-light-on-surface">
                        public.{t.tableName}
                      </span>
                      {t.count !== undefined && (
                        <span className="text-[10px] text-light-on-surface-variant px-1 rounded bg-light-surface-container">
                          {t.count} records
                        </span>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        t.status === 'ok'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : t.status === 'error'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {t.status === 'ok' ? 'check_circle' : t.status === 'error' ? 'error' : 'hourglass_empty'}
                      </span>
                      <span>{t.status === 'ok' ? 'Live' : t.status === 'error' ? 'Error' : 'Pending'}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timestamp & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-sm pt-xs border-t border-light-outline-variant text-xs text-light-on-surface-variant">
              <span>
                Last tested: {lastChecked ? lastChecked.toLocaleTimeString() : 'Never'}
              </span>

              <div className="flex items-center gap-xs">
                <button
                  type="button"
                  onClick={handleRetest}
                  disabled={isRetesting}
                  className="inline-flex items-center gap-xs px-md py-xs rounded bg-light-primary text-light-on-primary font-label text-xs font-semibold hover:bg-light-primary-container transition-all cursor-pointer disabled:opacity-50 border-0"
                >
                  <span className={`material-symbols-outlined text-[16px] ${isRetesting ? 'animate-spin' : ''}`}>
                    refresh
                  </span>
                  <span>{isRetesting ? 'Pinging...' : 'Test Connection'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
