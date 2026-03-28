import api from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: {
      _id: string;
      email: string;
      fullName: string;
      avatar?: string;
      settings: {
        monthlyBudget: number;
        alertThreshold: number;
        notifications: {
          energyAlerts: boolean;
          costWarnings: boolean;
          deviceOffline: boolean;
          weeklyReports: boolean;
        };
      };
      createdAt: string;
      updatedAt: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

export const authService = {
  // Register new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    if (response.data.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
    }
    return response.data;
  },

  // Login user
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    if (response.data.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
    }
    return response.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');
    await api.post('/auth/logout', { refreshToken });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  // Get current user
  getMe: async (): Promise<AuthResponse['data']['user']> => {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('accessToken');
  },

  // Get stored tokens
  getTokens: () => ({
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  }),
};
