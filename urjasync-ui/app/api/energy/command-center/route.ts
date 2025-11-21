import { NextResponse } from 'next/server';
import {
  BatteryMode,
  EnergyCommandCenter,
  EnergyCommandCenterMutation,
  EvScheduleStatus,
  EvScheduleUpdate,
} from '@/lib/types';
import { loadEnergyState, saveEnergyState, updateEnergyState } from '@/lib/server/energyStore';

const batteryStatusMap: Record<BatteryMode, string> = {
  Backup: 'Charging for backup',
  'Self-Power': 'Discharging to home',
  'Time-Based': 'Time-of-use automation',
};

const evStatusLabel: Record<EvScheduleStatus, string> = {
  Scheduled: 'Smart Delay',
  Charging: 'Charging now',
  Paused: 'Charging paused',
};

const formatTime = (value?: string) => {
  if (!value) return '—';
  const [hours, minutes] = value.split(':');
  return `${hours}:${minutes}`;
};

export async function GET() {
  const state = await loadEnergyState();
  const refreshed = await maybeDriftTelemetry(state);
  return NextResponse.json(refreshed);
}

export async function POST(request: Request) {
  try {
    const mutation = (await request.json()) as EnergyCommandCenterMutation;
    if (!mutation || !('action' in mutation)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    if (mutation.action === 'batteryMode') {
      await updateEnergyState((state) => applyBatteryMode(state, mutation.mode));
    } else if (mutation.action === 'evSchedule') {
      await updateEnergyState((state) => applyEvSchedule(state, mutation.update));
    } else {
      return NextResponse.json({ error: 'Unsupported mutation' }, { status: 400 });
    }

    const updated = await updateEnergyState((state) => ({
      ...state,
      lastUpdated: new Date().toISOString(),
    }));

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Energy command center mutation failed', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

function applyBatteryMode(state: EnergyCommandCenter, mode: BatteryMode): EnergyCommandCenter {
  const assets = state.assets.map((asset) =>
    asset.id === 'battery_wall'
      ? {
          ...asset,
          status: batteryStatusMap[mode],
          metricLabel: mode === 'Self-Power' ? 'Output' : 'Reserve',
          metricValue: mode === 'Self-Power' ? '2.3 kW' : `${state.overview.storageLevel}%`,
        }
      : asset,
  );

  return {
    ...state,
    assets,
    controls: {
      ...state.controls,
      batteryMode: mode,
    },
  };
}

function applyEvSchedule(state: EnergyCommandCenter, update: EvScheduleUpdate): EnergyCommandCenter {
  const nextCharge = update.nextCharge ?? state.controls.evSchedule.nextCharge;
  const status = update.status ?? state.controls.evSchedule.status;

  const assets = state.assets.map((asset) =>
    asset.id === 'ev_charger'
      ? {
          ...asset,
          status: evStatusLabel[status],
          metricValue: status === 'Charging' ? 'Now' : formatTime(nextCharge),
          detail:
            status === 'Charging'
              ? 'Drawing 7.2 kW · Will finish in 35 mins'
              : `Next slot ${formatTime(nextCharge)} · ${state.controls.evSchedule.recommendedWindow}`,
        }
      : asset,
  );

  return {
    ...state,
    assets,
    controls: {
      ...state.controls,
      evSchedule: {
        ...state.controls.evSchedule,
        nextCharge,
        status,
      },
    },
  };
}

async function maybeDriftTelemetry(state: EnergyCommandCenter): Promise<EnergyCommandCenter> {
  const now = Date.now();
  const lastUpdated = new Date(state.lastUpdated).getTime();
  if (now - lastUpdated < 10_000) {
    return state;
  }

  const drifted = {
    ...state,
    overview: {
      ...state.overview,
      production: Math.max(0, Number((state.overview.production + randomDrift()).toFixed(1))),
      consumption: Math.max(0, Number((state.overview.consumption + randomDrift()).toFixed(1))),
      storageLevel: clamp(state.overview.storageLevel + randomDrift() * 8, 10, 95),
      gridImport: Math.max(0, Number((state.overview.gridImport + randomDrift()).toFixed(1))),
      renewableShare: clamp(state.overview.renewableShare + randomDrift() * 5, 40, 95),
    },
    lastUpdated: new Date().toISOString(),
  } as EnergyCommandCenter;

  await saveEnergyState(drifted);
  return drifted;
}

function randomDrift() {
  return (Math.random() - 0.5) * 0.4;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Number(value.toFixed(1))));
}
