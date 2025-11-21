import { EnergyCommandCenter } from '@/lib/types';

const now = new Date();
const today = new Date(
  now.getFullYear(),
  now.getMonth(),
  now.getDate(),
  22,
  30,
  0,
  0,
);

const formatTime24 = (date: Date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

export const initialEnergyCommandCenter: EnergyCommandCenter = {
  overview: {
    production: 5.6,
    consumption: 4.2,
    storageLevel: 68,
    gridImport: 1.1,
    renewableShare: 78,
  },
  assets: [
    {
      id: 'solar_array',
      name: 'Rooftop Solar',
      category: 'Solar',
      status: 'Optimal Output',
      metricLabel: 'Output',
      metricValue: '5.6 kW',
      trend: 12,
      detail: 'Clear skies · Tracker 97% efficient',
      iconKey: 'solar',
      progress: 82,
      progressLabel: 'Array efficiency',
    },
    {
      id: 'battery_wall',
      name: 'Storage Battery',
      category: 'Battery',
      status: 'Charging',
      metricLabel: 'Reserve',
      metricValue: '68%',
      trend: 5,
      detail: 'Backup available for 3.4 hrs at current load',
      iconKey: 'battery',
      progress: 68,
      progressLabel: 'Charge level',
    },
    {
      id: 'ev_charger',
      name: 'EV Charger',
      category: 'EV',
      status: 'Smart Delay',
      metricLabel: 'Next Session',
      metricValue: '10:30 PM',
      trend: -18,
      detail: 'Deferred to Off-Peak · Saves ₹42',
      iconKey: 'ev',
      progress: 40,
      progressLabel: 'Battery @ 40%',
    },
    {
      id: 'grid_meter',
      name: 'Grid Meter',
      category: 'Grid',
      status: 'Importing',
      metricLabel: 'Draw',
      metricValue: '1.1 kW',
      trend: -9,
      detail: 'Within sanctioned load · Tariff: Peak',
      iconKey: 'grid',
    },
  ],
  controls: {
    batteryMode: 'Backup',
    evSchedule: {
      nextCharge: formatTime24(today),
      status: 'Scheduled',
      recommendedWindow: '22:00 - 05:00',
    },
  },
  lastUpdated: new Date().toISOString(),
};

export const getFreshEnergyCommandCenter = (): EnergyCommandCenter =>
  JSON.parse(JSON.stringify(initialEnergyCommandCenter)) as EnergyCommandCenter;
