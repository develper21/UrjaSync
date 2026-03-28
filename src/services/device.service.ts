import api from './api';

export interface Device {
  _id: string;
  name: string;
  room: string;
  type: string;
  powerRating: number;
  icon: string;
  status: boolean;
  intensity: number;
  isSmart: boolean;
  lastUsed?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeviceData {
  name: string;
  room: string;
  type: string;
  powerRating: number;
  icon?: string;
  isSmart?: boolean;
}

export interface UpdateDeviceData {
  name?: string;
  room?: string;
  type?: string;
  powerRating?: number;
  icon?: string;
  isSmart?: boolean;
}

export const deviceService = {
  // Get all devices
  getDevices: async (params?: { room?: string; status?: boolean }): Promise<Device[]> => {
    const response = await api.get('/devices', { params });
    return response.data.data.devices;
  },

  // Get single device
  getDevice: async (id: string): Promise<Device> => {
    const response = await api.get(`/devices/${id}`);
    return response.data.data.device;
  },

  // Create device
  createDevice: async (data: CreateDeviceData): Promise<Device> => {
    const response = await api.post('/devices', data);
    return response.data.data.device;
  },

  // Update device
  updateDevice: async (id: string, data: UpdateDeviceData): Promise<Device> => {
    const response = await api.put(`/devices/${id}`, data);
    return response.data.data.device;
  },

  // Delete device
  deleteDevice: async (id: string): Promise<void> => {
    await api.delete(`/devices/${id}`);
  },

  // Toggle device on/off
  toggleDevice: async (id: string, status: boolean): Promise<Device> => {
    const response = await api.post(`/devices/${id}/toggle`, { status });
    return response.data.data.device;
  },

  // Set device intensity
  setIntensity: async (id: string, intensity: number): Promise<Device> => {
    const response = await api.post(`/devices/${id}/intensity`, { intensity });
    return response.data.data.device;
  },

  // Get all rooms
  getRooms: async (): Promise<string[]> => {
    const response = await api.get('/devices/rooms');
    return response.data.data.rooms;
  },

  // Get device stats
  getDeviceStats: async (id: string, days: number = 7): Promise<any> => {
    const response = await api.get(`/devices/${id}/stats`, { params: { days } });
    return response.data.data.stats;
  },
};
