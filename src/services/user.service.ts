import api from './api';

export interface UserSettings {
  monthlyBudget: number;
  alertThreshold: number;
  notifications: {
    energyAlerts: boolean;
    costWarnings: boolean;
    deviceOffline: boolean;
    weeklyReports: boolean;
  };
}

export interface UserProfile {
  _id: string;
  email: string;
  fullName: string;
  avatar?: string;
  settings: UserSettings;
  createdAt: string;
  updatedAt: string;
}

export const userService = {
  // Get user settings
  getSettings: async (): Promise<UserSettings> => {
    const response = await api.get('/user/settings');
    return response.data.data.settings;
  },

  // Update user settings
  updateSettings: async (data: Partial<UserSettings>): Promise<UserSettings> => {
    const response = await api.put('/user/settings', data);
    return response.data.data.settings;
  },

  // Update profile
  updateProfile: async (data: { fullName?: string; email?: string }): Promise<UserProfile> => {
    const response = await api.put('/user/profile', data);
    return response.data.data.user;
  },

  // Update notification preferences
  updateNotifications: async (data: Partial<UserSettings['notifications']>): Promise<UserSettings['notifications']> => {
    const response = await api.put('/user/notifications', data);
    return response.data.data.notifications;
  },
};
