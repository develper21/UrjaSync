export interface Appliance {
  id: number;
  name: string;
  type: 'AC' | 'Washer' | 'Light' | 'Geyser' | string;
  status: 'On' | 'Off' | 'Scheduled';
  consumption: number;
  icon: React.ReactNode;
}

export interface Routine {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
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
}
