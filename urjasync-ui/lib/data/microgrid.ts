import { MicrogridSnapshot } from '@/lib/types';

const now = new Date();
const iso = () => new Date().toISOString();

export const initialMicrogridSnapshot: MicrogridSnapshot = {
  communities: [
    {
      id: 'mg_sunrise_enclave',
      name: 'Sunrise Enclave',
      households: 24,
      totalGeneration: 612,
      totalConsumption: 540,
      netFlow: 72,
      sharedCapacity: 45,
      description: 'Premium villa cluster pooling 120 kW rooftop solar & 2 community batteries.',
      invitesOpen: true,
      members: [
        {
          id: 'mem_a1',
          household: 'Villa 12 · Mehta Family',
          surplusKwh: 8.4,
          peakCutPercent: 36,
          credits: 124,
          tier: 'Gold',
          badges: ['Solar OG', 'Peak Slayer'],
        },
        {
          id: 'mem_a2',
          household: 'Villa 05 · Banerjees',
          surplusKwh: 6.1,
          peakCutPercent: 28,
          credits: 102,
          tier: 'Silver',
          badges: ['Night Owl'],
        },
        {
          id: 'mem_a3',
          household: 'Villa 08 · Murthys',
          surplusKwh: 4.4,
          peakCutPercent: 22,
          credits: 84,
          tier: 'Silver',
          badges: ['Eco Champ'],
        },
      ],
    },
    {
      id: 'mg_lakeview_society',
      name: 'Lakeview Society',
      households: 60,
      totalGeneration: 820,
      totalConsumption: 910,
      netFlow: -90,
      sharedCapacity: 30,
      description: 'High-rise apartments leveraging peer-to-peer trading and smart EV fleets.',
      invitesOpen: false,
      members: [
        {
          id: 'mem_b1',
          household: 'Tower B · Apt 1803',
          surplusKwh: 3.1,
          peakCutPercent: 18,
          credits: 65,
          tier: 'Bronze',
          badges: ['Night Owl'],
        },
        {
          id: 'mem_b2',
          household: 'Tower C · Apt 2101',
          surplusKwh: 2.2,
          peakCutPercent: 15,
          credits: 48,
          tier: 'Bronze',
          badges: [],
        },
      ],
    },
  ],
  leaderboards: {
    surplus: [
      { memberId: 'mem_a1', household: 'Villa 12 · Mehta Family', value: 8.4, change: 1.2, tier: 'Gold' },
      { memberId: 'mem_a2', household: 'Villa 05 · Banerjees', value: 6.1, change: 0.5, tier: 'Silver' },
      { memberId: 'mem_b1', household: 'Tower B · Apt 1803', value: 3.1, change: -0.2, tier: 'Bronze' },
    ],
    peak_cut: [
      { memberId: 'mem_a1', household: 'Villa 12 · Mehta Family', value: 36, change: 4, tier: 'Gold' },
      { memberId: 'mem_a3', household: 'Villa 08 · Murthys', value: 22, change: 1, tier: 'Silver' },
      { memberId: 'mem_b2', household: 'Tower C · Apt 2101', value: 15, change: -1, tier: 'Bronze' },
    ],
  },
  recentTrades: [
    {
      id: 'trade_001',
      from: 'Villa 12 · Mehta Family',
      to: 'Tower B · Apt 1803',
      amountKwh: 6,
      creditValue: 30,
      pricePerKwh: 5,
      timestamp: iso(),
      status: 'Settled',
    },
    {
      id: 'trade_002',
      from: 'Villa 05 · Banerjees',
      to: 'Tower C · Apt 2101',
      amountKwh: 4,
      creditValue: 18,
      pricePerKwh: 4.5,
      timestamp: iso(),
      status: 'Pending',
    },
  ],
  rewardsPool: {
    totalCredits: 540,
    nextPayout: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  userMembership: {
    memberId: 'mem_a1',
    communityId: 'mg_sunrise_enclave',
    pendingInvites: 1,
  },
};

export const getFreshMicrogridSnapshot = (): MicrogridSnapshot =>
  JSON.parse(JSON.stringify(initialMicrogridSnapshot)) as MicrogridSnapshot;
