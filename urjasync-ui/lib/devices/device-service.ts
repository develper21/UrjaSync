interface Device {
  id: string;
  userId: string;
  name: string;
  type: string;
  brand: string;
  model: string;
  status: 'online' | 'offline' | 'maintenance';
  location?: string;
  lastSeen: string;
  powerConsumption: number;
  efficiency: number;
}

interface DeviceServiceInterface {
  getDevices(userId: string): Promise<Device[]>;
  getDevice(deviceId: string): Promise<Device | null>;
  addDevice(deviceData: Partial<Device>): Promise<Device>;
  updateDevice(deviceId: string, deviceData: Partial<Device>): Promise<Device>;
  deleteDevice(deviceId: string): Promise<boolean>;
  getDeviceStatus(deviceId: string): Promise<string>;
  getDevicePowerConsumption(deviceId: string, period?: { start: string; end: string }): Promise<number>;
}

export const getDeviceService = (): DeviceServiceInterface => ({
  getDevices: async (_userId: string): Promise<Device[]> => {
    // Mock implementation
    return [];
  },

  getDevice: async (_deviceId: string): Promise<Device | null> => {
    // Mock implementation
    return null;
  },

  addDevice: async (deviceData: Partial<Device>): Promise<Device> => {
    // Mock implementation
    const device: Device = {
      id: 'device_' + Date.now(),
      userId: deviceData.userId || '',
      name: deviceData.name || '',
      type: deviceData.type || '',
      brand: deviceData.brand || '',
      model: deviceData.model || '',
      status: deviceData.status || 'offline',
      location: deviceData.location,
      lastSeen: new Date().toISOString(),
      powerConsumption: deviceData.powerConsumption || 0,
      efficiency: deviceData.efficiency || 0,
    };
    return device;
  },

  updateDevice: async (deviceId: string, deviceData: Partial<Device>): Promise<Device> => {
    // Mock implementation
    const device: Device = {
      id: deviceId,
      userId: deviceData.userId || '',
      name: deviceData.name || '',
      type: deviceData.type || '',
      brand: deviceData.brand || '',
      model: deviceData.model || '',
      status: deviceData.status || 'offline',
      location: deviceData.location,
      lastSeen: new Date().toISOString(),
      powerConsumption: deviceData.powerConsumption || 0,
      efficiency: deviceData.efficiency || 0,
    };
    return device;
  },

  deleteDevice: async (_deviceId: string): Promise<boolean> => {
    // Mock implementation
    return true;
  },

  getDeviceStatus: async (_deviceId: string): Promise<string> => {
    // Mock implementation
    return 'offline';
  },

  getDevicePowerConsumption: async (_deviceId: string, _period?: { start: string; end: string }): Promise<number> => {
    // Mock implementation
    return 0;
  },
});
