export interface Appliance {
  id: number;
  name: string;
  type: 'AC' | 'Washer' | 'Light' | 'Geyser' | string;
  status: 'On' | 'Off' | 'Scheduled';
  consumption: number;
  icon: React.ReactNode;
}

export interface MicrogridMember {
  id: string;
  household: string;
  avatar?: string;
  surplusKwh: number;
  peakCutPercent: number;
  credits: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  badges: string[];
}

export interface MicrogridCommunity {
  id: string;
  name: string;
  households: number;
  totalGeneration: number;
  totalConsumption: number;
  netFlow: number;
  sharedCapacity: number;
  description: string;
  members: MicrogridMember[];
  invitesOpen: boolean;
}

export interface EnergyCreditTrade {
  id: string;
  from: string;
  to: string;
  amountKwh: number;
  creditValue: number;
  pricePerKwh: number;
  timestamp: string;
  status: 'Pending' | 'Settled';
}

export interface LeaderboardEntry {
  memberId: string;
  household: string;
  value: number;
  change: number;
  tier: MicrogridMember['tier'];
}

export interface MicrogridSnapshot {
  communities: MicrogridCommunity[];
  leaderboards: Record<LeaderboardCategory, LeaderboardEntry[]>;
  recentTrades: EnergyCreditTrade[];
  rewardsPool: {
    totalCredits: number;
    nextPayout: string;
  };
  userMembership: {
    memberId: string;
    communityId: string;
    pendingInvites: number;
  };
}

export interface Routine {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
  isActive?: boolean;
  lastRun?: string;
}

export interface Bill {
  id: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  period: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  cta: string;
}

export interface TariffPeriod {
  id: number;
  period: string;
  rate: number;
  type: 'Off-Peak' | 'Standard' | 'Peak';
  icon: React.ReactNode;
}

export type EnergyAssetCategory = 'Solar' | 'EV' | 'Battery' | 'Grid';
export type EnergyAssetIconKey = 'solar' | 'ev' | 'battery' | 'grid';
export type BatteryMode = 'Backup' | 'Self-Power' | 'Time-Based';
export type EvScheduleStatus = 'Scheduled' | 'Charging' | 'Paused';

export type LeaderboardCategory = 'surplus' | 'peak_cut';

export interface EnergyAsset {
  id: string;
  name: string;
  category: EnergyAssetCategory;
  status: string;
  metricLabel: string;
  metricValue: string;
  trend: number;
  detail: string;
  iconKey: EnergyAssetIconKey;
  icon?: React.ReactNode;
  progress?: number;
  progressLabel?: string;
}

export interface EnergyControls {
  batteryMode: BatteryMode;
  evSchedule: {
    nextCharge: string; // HH:mm (24h)
    status: EvScheduleStatus;
    recommendedWindow: string;
  };
}

export interface EvScheduleUpdate {
  nextCharge?: string;
  status?: EvScheduleStatus;
}

export type EnergyCommandCenterMutation =
  | { action: 'batteryMode'; mode: BatteryMode }
  | { action: 'evSchedule'; update: EvScheduleUpdate };

export interface EnergyCommandCenter {
  overview: {
    production: number;
    consumption: number;
    storageLevel: number;
    gridImport: number;
    renewableShare: number;
  };
  assets: EnergyAsset[];
  controls: EnergyControls;
  lastUpdated: string;
}

export interface MockData {
  liveUsage: number;
  peakStatus: 'Peak Time' | 'Off-Peak';
  estimatedBill: number;
  totalSavings: number;
  appliances: Appliance[];
  usageHistory: { name: string; usage: number }[];
  toDTariff: TariffPeriod[];
  recommendations: Recommendation[];
  routines: Routine[];
  bills: Bill[];
  energyCommandCenter: EnergyCommandCenter;
  microgrid: MicrogridSnapshot;
}
