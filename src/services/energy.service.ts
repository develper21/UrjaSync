import api from './api';

export interface EnergyReading {
  _id: string;
  userId: string;
  deviceId?: string;
  timestamp: string;
  usage: number;
  cost: number;
  rate: number;
  solarGeneration: number;
}

export interface HourlyData {
  time: string;
  usage: number;
  cost: number;
}

export interface WeeklyData {
  day: string;
  date: string;
  usage: number;
  cost: number;
  solar: number;
}

export interface MonthlyData {
  month: string;
  usage: number;
  cost: number;
  solar: number;
}

export interface RealtimeData {
  currentUsage: number;
  currentCost: number;
  rate: number;
  activeDevices: number;
  totalPower: number;
  timestamp: string;
}

export const energyService = {
  // Get real-time usage
  getRealtime: async (): Promise<RealtimeData> => {
    const response = await api.get('/energy/realtime');
    return response.data.data;
  },

  // Get today's hourly usage
  getToday: async (): Promise<{ hourlyData: HourlyData[] }> => {
    const response = await api.get('/energy/today');
    return response.data.data;
  },

  // Get weekly usage
  getWeekly: async (): Promise<{ weeklyData: WeeklyData[] }> => {
    const response = await api.get('/energy/weekly');
    return response.data.data;
  },

  // Get monthly usage
  getMonthly: async (): Promise<{ monthlyData: MonthlyData[] }> => {
    const response = await api.get('/energy/monthly');
    return response.data.data;
  },

  // Get custom range data
  getRange: async (from: string, to: string, deviceId?: string): Promise<EnergyReading[]> => {
    const response = await api.get('/energy/range', {
      params: { from, to, deviceId },
    });
    return response.data.data.readings;
  },

  // Add reading (for simulation/testing)
  addReading: async (data: {
    deviceId?: string;
    usage: number;
    cost: number;
    rate: number;
    solarGeneration?: number;
  }): Promise<EnergyReading> => {
    const response = await api.post('/energy/reading', data);
    return response.data.data.reading;
  },
};
