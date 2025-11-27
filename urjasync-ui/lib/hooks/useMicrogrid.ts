'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MicrogridSnapshot } from '@/lib/types';

const API_ENDPOINT = '/api/microgrid';

interface UseMicrogridOptions {
  initialData?: MicrogridSnapshot;
  refreshMs?: number;
}

export const useMicrogrid = (options: UseMicrogridOptions = {}) => {
  const { initialData, refreshMs = 20000 } = options;
  const [data, setData] = useState<MicrogridSnapshot | undefined>(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await fetch(API_ENDPOINT, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Unable to load microgrid data');
      }
      const payload = (await response.json()) as MicrogridSnapshot;
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      if (!opts?.silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchData(initialData ? { silent: true } : undefined);
    intervalRef.current = setInterval(() => fetchData({ silent: true }), refreshMs);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, refreshMs, initialData]);

  const refresh = useCallback(() => fetchData(), [fetchData]);

  const status = useMemo(() => ({ loading, error }), [loading, error]);

  return {
    data,
    setData,
    ...status,
    refresh,
  };
};

export type UseMicrogridReturn = ReturnType<typeof useMicrogrid>;
