import api from './api';

export interface DashboardStats {
  currentUsage: number;
  todayCost: number;
  monthlyBill: number;
  activeDevices: number;
  carbonSaved: number;
  costChange: number;
}

export interface UsageTrend {
  _id: string;
  usage: number;
  cost: number;
}

export interface DeviceBreakdownItem {
  name: string;
  type: string;
  usage: number;
  percentage: string;
}

export interface CarbonData {
  month: string;
  emissions: number;
  usage: number;
}

export const analyticsService = {
  // Get dashboard stats
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/analytics/dashboard-stats');
    return response.data.data;
  },

  // Get usage trend
  getUsageTrend: async (days: number = 7): Promise<{ trends: UsageTrend[] }> => {
    const response = await api.get('/analytics/usage-trend', { params: { days } });
    return response.data.data;
  },

  // Get cost analysis
  getCostAnalysis: async (): Promise<{ hourlyCosts: { time: string; cost: number; usage: number }[] }> => {
    const response = await api.get('/analytics/cost-analysis');
    return response.data.data;
  },

  // Get device breakdown
  getDeviceBreakdown: async (): Promise<{ breakdown: DeviceBreakdownItem[]; totalUsage: number }> => {
    const response = await api.get('/analytics/device-breakdown');
    return response.data.data;
  },

  // Get carbon trend
  getCarbonTrend: async (): Promise<{ carbonData: CarbonData[] }> => {
    const response = await api.get('/analytics/carbon-trend');
    return response.data.data;
  },
};
