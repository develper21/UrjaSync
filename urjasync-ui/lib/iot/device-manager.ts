import { getMQTTClient, EnergyData, DeviceStatus } from './mqtt-client';

export interface Device {
  id: string;
  name: string;
  type: 'smart_meter' | 'smart_plug' | 'appliance' | 'sensor';
  location: string;
  online: boolean;
  lastSeen: Date;
  metadata: Record<string, any>;
  capabilities: string[];
}

export interface DeviceAction {
  name: string;
  description: string;
  parameters?: Record<string, { type: string; description: string; required?: boolean }>;
  category: 'control' | 'monitoring' | 'configuration';
}

export interface DeviceRegistration {
  name: string;
  type: Device['type'];
  location: string;
  metadata?: Record<string, any>;
}

export class DeviceManager {
  private devices: Map<string, Device> = new Map();
  private mqttClient = getMQTTClient();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.mqttClient.on('device_status', (status: DeviceStatus) => {
      this.updateDeviceStatus(status.deviceId, status);
    });

    this.mqttClient.on('energy_data', (data: EnergyData) => {
      this.updateDeviceLastSeen(data.deviceId);
    });

    this.mqttClient.on('offline', () => {
      // Mark all devices as offline when MQTT connection is lost
      this.devices.forEach((device, id) => {
        if (device.online) {
          this.updateDeviceStatus(id, {
            deviceId: id,
            timestamp: Date.now(),
            online: false,
            status: 'Off'
          });
        }
      });
    });
  }

  async registerDevice(registration: DeviceRegistration): Promise<Device> {
    const deviceId = this.generateDeviceId();
    
    const device: Device = {
      id: deviceId,
      name: registration.name,
      type: registration.type,
      location: registration.location,
      online: false,
      lastSeen: new Date(),
      metadata: registration.metadata || {},
      capabilities: this.getDefaultCapabilities(registration.type)
    };

    this.devices.set(deviceId, device);
    
    // Send initialization command to device
    try {
      await this.mqttClient.sendCommand(deviceId, 'init', {
        deviceId,
        name: device.name,
        capabilities: device.capabilities
      });
    } catch (error) {
      console.error('Failed to send init command to device:', error);
    }

    return device;
  }

  async removeDevice(deviceId: string): Promise<boolean> {
    const device = this.devices.get(deviceId);
    if (!device) {
      return false;
    }

    // Send deactivation command
    try {
      await this.mqttClient.sendCommand(deviceId, 'deactivate');
    } catch (error) {
      console.error('Failed to send deactivate command:', error);
    }

    this.devices.delete(deviceId);
    return true;
  }

  getDevice(deviceId: string): Device | undefined {
    return this.devices.get(deviceId);
  }

  getAllDevices(): Device[] {
    return Array.from(this.devices.values());
  }

  getDevicesByType(type: Device['type']): Device[] {
    return this.getAllDevices().filter(device => device.type === type);
  }

  getOnlineDevices(): Device[] {
    return this.getAllDevices().filter(device => device.online);
  }

  async controlDevice(deviceId: string, action: string, params?: Record<string, any>): Promise<boolean> {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    if (!device.online) {
      throw new Error(`Device ${deviceId} is offline`);
    }

    try {
      await this.mqttClient.sendCommand(deviceId, action, params);
      return true;
    } catch (error) {
      console.error(`Failed to control device ${deviceId}:`, error);
      throw error;
    }
  }

  getDeviceActions(deviceId: string): DeviceAction[] {
    const device = this.devices.get(deviceId);
    if (!device) {
      return [];
    }

    return this.getActionsForDeviceType(device.type);
  }

  private getActionsForDeviceType(type: Device['type']): DeviceAction[] {
    switch (type) {
      case 'smart_meter':
        return [
          {
            name: 'get_reading',
            description: 'Get current energy reading',
            category: 'monitoring',
            parameters: {
              type: { type: 'string', description: 'Type of reading (current, voltage, power)' }
            }
          },
          {
            name: 'get_consumption',
            description: 'Get energy consumption data',
            category: 'monitoring',
            parameters: {
              period: { type: 'string', description: 'Time period (hour, day, week, month)' }
            }
          },
          {
            name: 'reset_meter',
            description: 'Reset meter readings',
            category: 'configuration'
          }
        ];
      
      case 'smart_plug':
        return [
          {
            name: 'turn_on',
            description: 'Turn on the smart plug',
            category: 'control'
          },
          {
            name: 'turn_off',
            description: 'Turn off the smart plug',
            category: 'control'
          },
          {
            name: 'toggle',
            description: 'Toggle smart plug state',
            category: 'control'
          },
          {
            name: 'set_schedule',
            description: 'Set on/off schedule',
            category: 'configuration',
            parameters: {
              schedule: { type: 'object', description: 'Schedule configuration', required: true }
            }
          },
          {
            name: 'get_status',
            description: 'Get current plug status',
            category: 'monitoring'
          }
        ];
      
      case 'appliance':
        return [
          {
            name: 'turn_on',
            description: 'Turn on the appliance',
            category: 'control'
          },
          {
            name: 'turn_off',
            description: 'Turn off the appliance',
            category: 'control'
          },
          {
            name: 'set_mode',
            description: 'Set appliance mode',
            category: 'control',
            parameters: {
              mode: { type: 'string', description: 'Operating mode', required: true }
            }
          },
          {
            name: 'get_status',
            description: 'Get appliance status and diagnostics',
            category: 'monitoring'
          }
        ];
      
      case 'sensor':
        return [
          {
            name: 'get_reading',
            description: 'Get sensor reading',
            category: 'monitoring',
            parameters: {
              sensor_type: { type: 'string', description: 'Type of sensor data to read' }
            }
          },
          {
            name: 'set_interval',
            description: 'Set reading interval',
            category: 'configuration',
            parameters: {
              interval: { type: 'number', description: 'Reading interval in seconds', required: true }
            }
          },
          {
            name: 'calibrate',
            description: 'Calibrate sensor',
            category: 'configuration'
          }
        ];
      
      default:
        return [
          {
            name: 'get_status',
            description: 'Get device status',
            category: 'monitoring'
          }
        ];
    }
  }

  async getDeviceEnergyData(_deviceId: string, _startTime: Date, _endTime: Date): Promise<EnergyData[]> {
    // This would typically query a database
    // For now, return empty array as placeholder
    return [];
  }

  private updateDeviceStatus(deviceId: string, status: DeviceStatus): void {
    const device = this.devices.get(deviceId);
    if (device) {
      device.online = status.online;
      device.lastSeen = new Date(status.timestamp);
      device.metadata.status = status.status;
      
      if (status.metadata) {
        device.metadata = { ...device.metadata, ...status.metadata };
      }
    }
  }

  private updateDeviceLastSeen(deviceId: string): void {
    const device = this.devices.get(deviceId);
    if (device) {
      device.lastSeen = new Date();
      if (!device.online) {
        device.online = true;
        device.metadata.status = 'On';
      }
    }
  }

  private generateDeviceId(): string {
    return `device_${Date.now()}_${Math.random().toString(16).substr(2, 8)}`;
  }

  private getDefaultCapabilities(type: Device['type']): string[] {
    switch (type) {
      case 'smart_meter':
        return ['energy_monitoring', 'real_time_data', 'historical_data'];
      case 'smart_plug':
        return ['on_off_control', 'energy_monitoring', 'scheduling'];
      case 'appliance':
        return ['on_off_control', 'energy_monitoring', 'status_reporting'];
      case 'sensor':
        return ['environmental_monitoring', 'real_time_data'];
      default:
        return ['basic_control'];
    }
  }

  // Device health monitoring
  getDeviceHealth(deviceId: string): {
    isHealthy: boolean;
    lastSeen: Date;
    issues: string[];
  } {
    const device = this.devices.get(deviceId);
    if (!device) {
      return {
        isHealthy: false,
        lastSeen: new Date(0),
        issues: ['Device not found']
      };
    }

    const issues: string[] = [];
    const now = new Date();
    const timeSinceLastSeen = now.getTime() - device.lastSeen.getTime();
    
    if (!device.online) {
      issues.push('Device is offline');
    }
    
    if (timeSinceLastSeen > 5 * 60 * 1000) { // 5 minutes
      issues.push('Device not reporting data recently');
    }

    return {
      isHealthy: issues.length === 0,
      lastSeen: device.lastSeen,
      issues
    };
  }

  // Bulk operations
  async controlMultipleDevices(deviceIds: string[], action: string, params?: Record<string, any>): Promise<{ success: string[], failed: { deviceId: string, error: string }[] }> {
    const results = {
      success: [] as string[],
      failed: [] as { deviceId: string, error: string }[]
    };

    const promises = deviceIds.map(async (deviceId) => {
      try {
        await this.controlDevice(deviceId, action, params);
        results.success.push(deviceId);
      } catch (error) {
        results.failed.push({
          deviceId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    await Promise.all(promises);
    return results;
  }
}

// Singleton instance
let deviceManager: DeviceManager | null = null;

export function getDeviceManager(): DeviceManager {
  if (!deviceManager) {
    deviceManager = new DeviceManager();
  }
  return deviceManager;
}
