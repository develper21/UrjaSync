import api from './api';

export interface SustainabilityGoal {
  _id: string;
  type: 'co2_reduction' | 'solar_usage' | 'zero_waste';
  target: number;
  current: number;
  unit: string;
  progress: number;
}

export interface CarbonStats {
  savedThisYear: number;
  treesEquivalent: number;
  waterSaved: number;
}

export interface SustainabilityStats {
  carbonSaved: string;
  treesEquivalent: number;
  waterSaved: number;
  solarPercentage: string;
}

export interface EmissionData {
  month: string;
  year: number;
  emissions: number;
  totalUsage: number;
  solarGeneration: number;
}

export const sustainabilityService = {
  // Get sustainability stats
  getStats: async (): Promise<SustainabilityStats> => {
    const response = await api.get('/sustainability/stats');
    return response.data.data;
  },

  // Get goals
  getGoals: async (): Promise<SustainabilityGoal[]> => {
    const response = await api.get('/sustainability/goals');
    return response.data.data.goals;
  },

  // Update goal progress
  updateGoal: async (goalId: string, current: number): Promise<SustainabilityGoal> => {
    const response = await api.put(`/sustainability/goals/${goalId}`, { current });
    return response.data.data.goal;
  },

  // Get emissions history
  getEmissions: async (months: number = 6): Promise<{ emissions: EmissionData[] }> => {
    const response = await api.get('/sustainability/emissions', { params: { months } });
    return response.data.data;
  },

  // Initialize sustainability data
  initSustainability: async (): Promise<any> => {
    const response = await api.post('/sustainability/init');
    return response.data.data;
  },
};
