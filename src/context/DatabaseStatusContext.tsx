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

export const DatabaseStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<DatabaseStatusMode>('checking');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [reason, setReason] = useState<string>('Initializing Supabase connection check...');
  const [tableResults, setTableResults] = useState<TableCheckResult[]>([
    { tableName: 'events', status: 'pending' },
    { tableName: 'registrations', status: 'pending' },
    { tableName: 'clubs', status: 'pending' },
    { tableName: 'proposals', status: 'pending' },
  ]);

  const checkHealth = useCallback(async () => {
    setStatus('checking');
    const start = performance.now();

    if (!isSupabaseConfigured) {
      setStatus('fallback');
      setLatencyMs(null);
      setLastChecked(new Date());
      setReason('Supabase credentials (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY) are missing or invalid.');
      setTableResults([
        { tableName: 'events', status: 'error', message: 'Missing API keys' },
        { tableName: 'registrations', status: 'error', message: 'Missing API keys' },
        { tableName: 'clubs', status: 'error', message: 'Missing API keys' },
        { tableName: 'proposals', status: 'error', message: 'Missing API keys' },
      ]);
      console.warn('⚠️ [CampusPulse] Supabase not configured: Running on local fallback mock data.');
      return;
    }

    try {
      // 1. Ping the events table
      const { data: eventsData, error: eventsError, count: eventsCount } = await supabase
        .from('events')
        .select('id', { count: 'exact', head: true });

      const elapsed = Math.round(performance.now() - start);
      setLatencyMs(elapsed);
      setLastChecked(new Date());

      if (eventsError) {
        setStatus('fallback');
        setReason(`Supabase returned an error: ${eventsError.message || 'Table does not exist or RLS policy blocked query'}. Check if supabase_setup.sql was run.`);
        setTableResults([
          { tableName: 'events', status: 'error', message: eventsError.message },
          { tableName: 'registrations', status: 'pending' },
          { tableName: 'clubs', status: 'pending' },
          { tableName: 'proposals', status: 'pending' },
        ]);
        console.warn('🟡 [CampusPulse] Supabase live query failed. Falling back to local mock data:', eventsError);
        return;
      }

      // Check remaining tables asynchronously in parallel
      const [regRes, clubsRes, propRes] = await Promise.allSettled([
        supabase.from('registrations').select('id', { count: 'exact', head: true }),
        supabase.from('clubs').select('id', { count: 'exact', head: true }),
        supabase.from('proposals').select('id', { count: 'exact', head: true }),
      ]);

      const results: TableCheckResult[] = [
        { 
          tableName: 'events', 
          status: 'ok', 
          count: eventsCount ?? (eventsData?.length || 0),
          message: 'Table accessible & live' 
        },
        {
          tableName: 'registrations',
          status: regRes.status === 'fulfilled' && !regRes.value.error ? 'ok' : 'error',
          count: regRes.status === 'fulfilled' ? regRes.value.count ?? 0 : undefined,
          message: regRes.status === 'fulfilled' && regRes.value.error ? regRes.value.error.message : 'Table accessible & live',
        },
        {
          tableName: 'clubs',
          status: clubsRes.status === 'fulfilled' && !clubsRes.value.error ? 'ok' : 'error',
          count: clubsRes.status === 'fulfilled' ? clubsRes.value.count ?? 0 : undefined,
          message: clubsRes.status === 'fulfilled' && clubsRes.value.error ? clubsRes.value.error.message : 'Table accessible & live',
        },
        {
          tableName: 'proposals',
          status: propRes.status === 'fulfilled' && !propRes.value.error ? 'ok' : 'error',
          count: propRes.status === 'fulfilled' ? propRes.value.count ?? 0 : undefined,
          message: propRes.status === 'fulfilled' && propRes.value.error ? propRes.value.error.message : 'Table accessible & live',
        },
      ];

      setTableResults(results);
      setStatus('live');
      setReason(`Connected to Supabase PostgreSQL database (${elapsed}ms latency). All queries are live.`);
      console.log(`%c🟢 [CampusPulse] Live Supabase Database Connected (${elapsed}ms)`, 'color: #10B981; font-weight: bold;');
    } catch (err: any) {
      setStatus('fallback');
      setLatencyMs(null);
      setLastChecked(new Date());
      setReason(err?.message || 'Network error connecting to Supabase cloud endpoint.');
      console.warn('🟡 [CampusPulse] Network exception. Using local mock fallback:', err);
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
