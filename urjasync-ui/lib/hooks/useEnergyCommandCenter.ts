'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BatteryMode,
  EnergyCommandCenter,
  EnergyCommandCenterMutation,
  EvScheduleUpdate,
} from '@/lib/types';

const API_ENDPOINT = '/api/energy/command-center';

interface UseEnergyCommandCenterOptions {
  refreshMs?: number;
  initialData?: EnergyCommandCenter;
}

export const useEnergyCommandCenter = (options: UseEnergyCommandCenterOptions = {}) => {
  const { refreshMs = 15000, initialData } = options;
  const [data, setData] = useState<EnergyCommandCenter | undefined>(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [mutating, setMutating] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await fetch(API_ENDPOINT, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to fetch energy data');
      }
      const payload = (await response.json()) as EnergyCommandCenter;
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
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => fetchData({ silent: true }), refreshMs);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, refreshMs, initialData]);

  const mutate = useCallback(async (mutation: EnergyCommandCenterMutation) => {
    setMutating(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mutation),
      });
      if (!response.ok) {
        throw new Error('Failed to update energy configuration');
      }
      const payload = (await response.json()) as EnergyCommandCenter;
      setData(payload);
      return payload;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setMutating(false);
    }
  }, []);

  const updateBatteryMode = useCallback(
    (mode: BatteryMode) => mutate({ action: 'batteryMode', mode }),
    [mutate],
  );

  const updateEvSchedule = useCallback(
    (update: EvScheduleUpdate) => mutate({ action: 'evSchedule', update }),
    [mutate],
  );

  const status = useMemo(
    () => ({ loading, mutating, error, lastUpdated: data?.lastUpdated ?? null }),
    [loading, mutating, error, data?.lastUpdated],
  );

  return {
    data,
    setData,
    ...status,
    refresh: () => fetchData(),
    updateBatteryMode,
    updateEvSchedule,
  };
};

export type UseEnergyCommandCenterReturn = ReturnType<typeof useEnergyCommandCenter>;
