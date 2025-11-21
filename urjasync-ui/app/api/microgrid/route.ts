import { NextResponse } from 'next/server';
import { loadMicrogridState, saveMicrogridState } from '@/lib/server/microgridStore';
import { MicrogridSnapshot } from '@/lib/types';

const drift = () => (Math.random() - 0.5) * 4;

export async function GET() {
  const snapshot = await loadMicrogridState();
  const updated = applyDrift(snapshot);
  await saveMicrogridState(updated);
  return NextResponse.json(updated);
}

function applyDrift(snapshot: MicrogridSnapshot): MicrogridSnapshot {
  const communities = snapshot.communities.map((community) => {
    const delta = drift();
    return {
      ...community,
      netFlow: Number((community.netFlow + delta).toFixed(1)),
      totalGeneration: Number((community.totalGeneration + delta * 1.5).toFixed(1)),
      totalConsumption: Number((community.totalConsumption + delta).toFixed(1)),
      members: community.members.map((member) => ({
        ...member,
        surplusKwh: Number((member.surplusKwh + drift() * 0.3).toFixed(1)),
        peakCutPercent: Math.max(0, Math.min(50, Number((member.peakCutPercent + drift()).toFixed(1)))),
      })),
    };
  });

  const leaderboards = Object.fromEntries(
    Object.entries(snapshot.leaderboards).map(([key, entries]) => [
      key,
      entries
        .map((entry) => ({
          ...entry,
          value: Number((entry.value + drift() * (key === 'surplus' ? 0.2 : 1)).toFixed(1)),
          change: Number((drift() * 0.5).toFixed(1)),
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 3),
    ]),
  ) as MicrogridSnapshot['leaderboards'];

  const recentTrades = snapshot.recentTrades.map((trade) => {
    if (trade.status === 'Pending' && Math.random() > 0.7) {
      return { ...trade, status: 'Settled', timestamp: new Date().toISOString() } as typeof trade;
    }
    return trade;
  });

  return {
    ...snapshot,
    communities,
    leaderboards,
    recentTrades,
  };
}
