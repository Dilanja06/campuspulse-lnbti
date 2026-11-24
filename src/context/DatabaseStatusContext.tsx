import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

export type DatabaseStatusMode = 'checking' | 'live' | 'fallback';

export interface TableCheckResult {
  tableName: string;
  status: 'ok' | 'error' | 'pending';
  count?: number;
  message?: string;
}

export interface DatabaseStatusContextType {
  status: DatabaseStatusMode;
  isLive: boolean;
  latencyMs: number | null;
  projectUrl: string;
  lastChecked: Date | null;
  reason: string;
  tableResults: TableCheckResult[];
  checkHealth: () => Promise<void>;
  reportFallback: (reason: string) => void;
  reportLiveSuccess: (tableName?: string) => void;
}

const DatabaseStatusContext = createContext<DatabaseStatusContextType | undefined>(undefined);

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';

// Module-level bus so non-React services (dataService) can honestly report live vs fallback events
type DbListener = (mode: 'live' | 'fallback', reason?: string) => void;
const dbListeners = new Set<DbListener>();

export const dbHealthBus = {
  emitFallback(reason: string) {
    dbListeners.forEach((fn) => fn('fallback', reason));
  },
  emitLive() {
    dbListeners.forEach((fn) => fn('live'));
  },
  subscribe(fn: DbListener) {
    dbListeners.add(fn);
    return () => {
      dbListeners.delete(fn);
    };
  },
};

const MONITORED_TABLES = [
  'events',
  'registrations',
  'clubs',
  'proposals',
  'payments',
  'notifications',
  'badges',
  'profiles',
];

export const DatabaseStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<DatabaseStatusMode>('checking');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [reason, setReason] = useState<string>('Initializing Supabase connection check...');
  const [tableResults, setTableResults] = useState<TableCheckResult[]>(
    MONITORED_TABLES.map((t) => ({ tableName: t, status: 'pending' }))
  );

  const checkHealth = useCallback(async () => {
    setStatus('checking');
    const start = performance.now();

    if (!isSupabaseConfigured) {
      setStatus('fallback');
      setLatencyMs(null);
      setLastChecked(new Date());
      setReason('Supabase credentials (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY) are missing or invalid.');
      setTableResults(
        MONITORED_TABLES.map((t) => ({ tableName: t, status: 'error', message: 'Missing API keys' }))
      );
      return;
    }

    try {
      const checks = await Promise.allSettled(
        MONITORED_TABLES.map((table) =>
          supabase.from(table).select('id', { count: 'exact', head: true })
        )
      );

      const elapsed = Math.round(performance.now() - start);
      setLatencyMs(elapsed);
      setLastChecked(new Date());

      const results: TableCheckResult[] = MONITORED_TABLES.map((tableName, idx) => {
        const res = checks[idx];
        if (res.status === 'fulfilled' && !res.value.error) {
          return {
            tableName,
            status: 'ok',
            count: res.value.count ?? 0,
            message: 'Accessible',
          };
        }
        const msg =
          res.status === 'fulfilled' && res.value.error
            ? res.value.error.message
            : 'Connection or RLS error';
        return { tableName, status: 'error', message: msg };
      });

      setTableResults(results);

      const coreEventsOk = results[0].status === 'ok' && results[2].status === 'ok';
      const failedCount = results.filter((r) => r.status === 'error').length;

      if (!coreEventsOk) {
        setStatus('fallback');
        setReason(
          `Supabase query failed (${results[0].message || 'Schema/RLS error'}). Run supabase_setup.sql and supabase_auth_setup.sql.`
        );
      } else if (failedCount > 0) {
        setStatus('live');
        setReason(
          `Connected (${elapsed}ms). Public tables online; scoped/staff tables (${results
            .filter((r) => r.status === 'error')
            .map((r) => r.tableName)
            .join(', ')}) require authenticated sign-in or schema update.`
        );
      } else {
        setStatus('live');
        setReason(`Connected to Supabase PostgreSQL (${elapsed}ms latency). All ${MONITORED_TABLES.length} tables live.`);
      }
    } catch (err: any) {
      setStatus('fallback');
      setLatencyMs(null);
      setLastChecked(new Date());
      setReason(err?.message || 'Network error connecting to Supabase cloud endpoint.');
    }
  }, []);

  const reportFallback = useCallback((fallbackReason: string) => {
    setStatus('fallback');
    setReason(fallbackReason);
  }, []);

  const reportLiveSuccess = useCallback((_tableName?: string) => {
    setStatus('live');
  }, []);

  useEffect(() => {
    checkHealth();
    return dbHealthBus.subscribe((mode, msg) => {
      if (mode === 'fallback' && msg) {
        setStatus('fallback');
        setReason(msg);
      } else if (mode === 'live') {
        setStatus('live');
      }
    });
  }, [checkHealth]);

  return (
    <DatabaseStatusContext.Provider
      value={{
        status,
        isLive: status === 'live',
        latencyMs,
        projectUrl: SUPABASE_URL || 'Not configured',
        lastChecked,
        reason,
        tableResults,
        checkHealth,
        reportFallback,
        reportLiveSuccess,
      }}
    >
      {children}
    </DatabaseStatusContext.Provider>
  );
};

export const useDatabaseStatus = (): DatabaseStatusContextType => {
  const context = useContext(DatabaseStatusContext);
  if (!context) {
    throw new Error('useDatabaseStatus must be used within a DatabaseStatusProvider');
  }
  return context;
};
