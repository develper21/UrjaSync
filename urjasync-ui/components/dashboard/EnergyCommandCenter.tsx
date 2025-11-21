'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  BatteryMode,
  EnergyAssetIconKey,
  EnergyCommandCenter as EnergyCommandCenterType,
  EvScheduleStatus,
  EvScheduleUpdate,
} from '@/lib/types';
import SunIcon from '@/components/icons/SunIcon';
import BatteryIcon from '@/components/icons/BatteryIcon';
import EvPlugIcon from '@/components/icons/EvPlugIcon';
import ZapIcon from '@/components/icons/ZapIcon';
import { useToastContext } from '@/components/ui/ToastProvider';

interface EnergyCommandCenterProps {
  data?: EnergyCommandCenterType;
  loading?: boolean;
  mutating?: boolean;
  error?: string | null;
  onBatteryModeChange?: (mode: BatteryMode) => Promise<unknown> | void;
  onEvScheduleUpdate?: (update: EvScheduleUpdate) => Promise<unknown> | void;
  onRefresh?: () => void;
}

const assetIconMap: Record<EnergyAssetIconKey, React.ReactElement> = {
  solar: <SunIcon className="w-9 h-9 text-amber-500" />,
  battery: <BatteryIcon className="w-9 h-9 text-emerald-500" />,
  ev: <EvPlugIcon className="w-9 h-9 text-blue-500" />,
  grid: <ZapIcon className="w-9 h-9 text-indigo-500" />,
};

const batteryModes: BatteryMode[] = ['Backup', 'Self-Power', 'Time-Based'];
const evStatuses: EvScheduleStatus[] = ['Scheduled', 'Charging', 'Paused'];

const EnergyCommandCenter: React.FC<EnergyCommandCenterProps> = ({
  data,
  loading,
  mutating,
  error,
  onBatteryModeChange,
  onEvScheduleUpdate,
  onRefresh,
}) => {
  const [evTime, setEvTime] = useState('22:30');
  const [evStatus, setEvStatus] = useState<EvScheduleStatus>('Scheduled');
  const [savingEv, setSavingEv] = useState(false);
  const { addToast } = useToastContext();

  useEffect(() => {
    if (data) {
      setEvTime(data.controls.evSchedule.nextCharge);
      setEvStatus(data.controls.evSchedule.status);
    }
  }, [data?.controls.evSchedule.nextCharge, data?.controls.evSchedule.status]);

  const netFlow = data ? data.overview.production - data.overview.consumption : 0;
  const netFlowPositive = netFlow >= 0;
  const overviewMetrics = useMemo(
    () => (data
      ? [
          {
            label: 'Generation',
            value: `${data.overview.production.toFixed(1)} kW`,
            helper: 'Solar & hybrid sources',
          },
          {
            label: 'Consumption',
            value: `${data.overview.consumption.toFixed(1)} kW`,
            helper: 'Whole-home load',
          },
          {
            label: 'Storage Reserve',
            value: `${data.overview.storageLevel}%`,
            helper: 'Battery state of charge',
            progress: data.overview.storageLevel,
            progressLabel: 'Ready backup capacity',
          },
          {
            label: 'Grid Import',
            value: `${data.overview.gridImport.toFixed(1)} kW`,
            helper: 'Live draw from utility',
          },
          {
            label: 'Renewable Mix',
            value: `${data.overview.renewableShare}%`,
            helper: 'Share of green energy',
            progress: data.overview.renewableShare,
            progressLabel: 'Target ≥ 70%',
          },
        ]
      : []),
    [data],
  );

  const lastUpdatedLabel = data?.lastUpdated
    ? new Date(data.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '—';

  const handleBatteryMode = async (mode: BatteryMode) => {
    if (!data || !onBatteryModeChange || mode === data.controls.batteryMode) return;
    try {
      await onBatteryModeChange(mode);
      addToast({
        title: 'Battery mode updated',
        description: `Switched to ${mode}.`,
        variant: 'success',
      });
    } catch (err) {
      console.error(err);
      addToast({
        title: 'Battery update failed',
        description: err instanceof Error ? err.message : 'Something went wrong.',
        variant: 'error',
      });
    }
  };

  const handleEvSubmit = async () => {
    if (!onEvScheduleUpdate) return;
    try {
      setSavingEv(true);
      await onEvScheduleUpdate({ nextCharge: evTime, status: evStatus });
      addToast({
        title: 'EV schedule saved',
        description: `${evStatus} · ${evTime}`,
        variant: 'success',
      });
    } catch (err) {
      addToast({
        title: 'Could not update EV schedule',
        description: err instanceof Error ? err.message : 'Try again in a moment.',
        variant: 'error',
      });
      setSavingEv(false);
      return;
    } finally {
      setSavingEv(false);
    }
  };

  if (!data) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
        <p className="text-sm text-gray-500">{loading ? 'Loading energy telemetry…' : 'No energy data available.'}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Unified Energy Command Center</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">Live energy orchestration</h2>
          <p className="text-sm text-gray-500">Cross-source visibility across solar, storage, EV, and grid.</p>
        </div>
        <div className="md:text-right space-y-1">
          <div className="flex items-center justify-end gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Net Flow</p>
              <p className={`text-2xl font-semibold ${netFlowPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {netFlowPositive ? '+' : ''}
                {netFlow.toFixed(1)} kW
              </p>
            </div>
            {mutating && (
              <span className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" aria-hidden />
            )}
          </div>
          <p className="text-sm text-gray-500">
            {netFlowPositive ? 'Surplus available' : 'Deficit · importing from grid'} · Updated {lastUpdatedLabel}
          </p>
          <button
            type="button"
            onClick={onRefresh}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            disabled={loading}
          >
            Refresh now
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600">
          {error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {overviewMetrics.map((metric) => (
          <div key={metric.label} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-xs font-medium text-gray-500">{metric.label}</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{metric.value}</p>
            <p className="text-xs text-gray-500 mt-1">{metric.helper}</p>
            {metric.progress !== undefined && (
              <div className="mt-3">
                <div className="h-2 w-full rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-500"
                    style={{ width: `${metric.progress}%` }}
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">{metric.progressLabel}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Critical assets</h3>
          <p className="text-sm text-gray-500">Live health & automation status</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {data.assets.map((asset) => (
            <div key={asset.id} className="border border-gray-100 rounded-2xl p-5 bg-gradient-to-b from-white to-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gray-100 text-gray-700">{asset.icon ?? assetIconMap[asset.iconKey]}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{asset.name}</p>
                  <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full bg-gray-900/5 text-gray-600">
                    {asset.category}
                  </span>
                </div>
              </div>
              <p className="mt-4 text-xs uppercase tracking-wide text-gray-500">Status</p>
              <p className="text-sm font-medium text-gray-900">{asset.status}</p>

              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <p className="text-xs text-gray-500">{asset.metricLabel}</p>
                  <p className="text-lg font-semibold text-gray-900">{asset.metricValue}</p>
                </div>
                <p className={`text-xs font-semibold ${asset.trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {asset.trend >= 0 ? '+' : ''}
                  {asset.trend}% vs last hr
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-2">{asset.detail}</p>

              {asset.progress !== undefined && (
                <div className="mt-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400"
                      style={{ width: `${asset.progress}%` }}
                    />
                  </div>
                  {asset.progressLabel && <p className="text-[11px] text-gray-500 mt-1">{asset.progressLabel}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">Battery mode</h4>
            <p className="text-xs text-gray-500">{data.controls.batteryMode}</p>
          </div>
          <p className="text-xs text-gray-500 mt-1">Instantly reconfigure battery behavior.</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {batteryModes.map((mode) => {
              const active = data.controls.batteryMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleBatteryMode(mode)}
                  disabled={active || mutating}
                  className={`rounded-xl border px-2 py-2 text-xs font-semibold transition ${
                    active
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 text-gray-600 hover:border-emerald-200'
                  } ${mutating ? 'opacity-70' : ''}`}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">EV schedule override</h4>
            <span className="text-xs text-gray-500">{data.controls.evSchedule.recommendedWindow}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Shift charging to low-tariff windows.</p>
          <div className="mt-4 space-y-3">
            <label className="text-xs font-semibold text-gray-700 block">
              Next charge
              <input
                type="time"
                value={evTime}
                onChange={(event) => setEvTime(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs font-semibold text-gray-700 block">
              Status
              <select
                value={evStatus}
                onChange={(event) => setEvStatus(event.target.value as EvScheduleStatus)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                {evStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={handleEvSubmit}
              disabled={savingEv || mutating}
              className={`w-full rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition ${
                savingEv || mutating ? 'bg-emerald-400/70' : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >
              {savingEv ? 'Saving…' : 'Apply schedule'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 p-5">
          <h4 className="text-sm font-semibold text-gray-900">Telemetry</h4>
          <p className="text-xs text-gray-500 mt-1">Sampling every 15s · API driven</p>
          <ul className="mt-4 space-y-2 text-xs text-gray-600">
            <li>
              <span className="font-semibold text-gray-800">Battery reserve:</span> {data.overview.storageLevel}%
            </li>
            <li>
              <span className="font-semibold text-gray-800">EV status:</span> {data.controls.evSchedule.status}
            </li>
            <li>
              <span className="font-semibold text-gray-800">Grid import:</span> {data.overview.gridImport.toFixed(1)} kW
            </li>
          </ul>
          <p className="mt-4 text-[11px] text-gray-400">
            Powered by UrjaSync orchestration APIs. Hook up live meters to replace simulation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnergyCommandCenter;
