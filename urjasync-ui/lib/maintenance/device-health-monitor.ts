export interface DeviceHealthMetrics {
  deviceId: string;
  deviceName: string;
  deviceType: 'AC' | 'Washer' | 'Light' | 'Geyser' | 'Solar Panel' | 'Battery' | 'EV Charger';
  overallHealth: number; // 0-100
  status: 'Healthy' | 'Warning' | 'Critical' | 'Offline';
  lastChecked: Date;
  metrics: {
    efficiency: number; // 0-100
    powerConsumption: number; // kWh
    operatingTemperature: number; // Celsius
    vibration: number; // Hz
    noiseLevel: number; // dB
    runtimeHours: number;
    errorCount: number;
    maintenanceScore: number; // 0-100
  };
  alerts: HealthAlert[];
  trends: HealthTrend[];
}

export interface HealthAlert {
  id: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  type: 'Performance' | 'Efficiency' | 'Safety' | 'Maintenance';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  resolved: boolean;
}

export interface HealthTrend {
  metric: string;
  direction: 'Improving' | 'Degrading' | 'Stable';
  changeRate: number; // percentage change over time
  timeframe: string; // e.g., "Last 7 days", "Last 30 days"
}

export interface HealthThresholds {
  efficiency: { min: number; max: number };
  powerConsumption: { min: number; max: number };
  temperature: { min: number; max: number };
  vibration: { max: number };
  noiseLevel: { max: number };
  errorRate: { max: number };
}

export class DeviceHealthMonitor {
  private devices: Map<string, DeviceHealthMetrics> = new Map();
  private thresholds: Map<string, HealthThresholds> = new Map();

  constructor() {
    this.initializeDefaultThresholds();
  }

  private initializeDefaultThresholds() {
    const defaultThresholds: HealthThresholds = {
      efficiency: { min: 70, max: 100 },
      powerConsumption: { min: 0, max: 1000 },
      temperature: { min: -10, max: 60 },
      vibration: { max: 50 },
      noiseLevel: { max: 80 },
      errorRate: { max: 5 }
    };

    const deviceSpecificThresholds = {
      'AC': {
        ...defaultThresholds,
        temperature: { min: 15, max: 45 },
        noiseLevel: { max: 70 }
      },
      'Washer': {
        ...defaultThresholds,
        vibration: { max: 30 },
        noiseLevel: { max: 75 }
      },
      'Solar Panel': {
        ...defaultThresholds,
        efficiency: { min: 80, max: 100 },
        temperature: { min: -20, max: 85 }
      },
      'Battery': {
        ...defaultThresholds,
        temperature: { min: 0, max: 45 },
        efficiency: { min: 85, max: 100 }
      },
      'EV Charger': {
        ...defaultThresholds,
        temperature: { min: -10, max: 55 },
        efficiency: { min: 90, max: 100 }
      }
    };

    Object.entries(deviceSpecificThresholds).forEach(([deviceType, thresholds]) => {
      this.thresholds.set(deviceType, thresholds);
    });
  }

  async updateDeviceHealth(deviceId: string, metrics: Partial<DeviceHealthMetrics['metrics']>): Promise<DeviceHealthMetrics> {
    const existingDevice = this.devices.get(deviceId);
    const deviceType = existingDevice?.deviceType || 'AC';
    const thresholds = this.thresholds.get(deviceType) || this.thresholds.get('AC')!;

    const updatedMetrics: DeviceHealthMetrics = {
      deviceId,
      deviceName: existingDevice?.deviceName || `Device ${deviceId}`,
      deviceType,
      overallHealth: this.calculateOverallHealth(metrics, thresholds),
      status: this.determineStatus(metrics, thresholds),
      lastChecked: new Date(),
      metrics: {
        efficiency: metrics.efficiency || existingDevice?.metrics.efficiency || 85,
        powerConsumption: metrics.powerConsumption || existingDevice?.metrics.powerConsumption || 0,
        operatingTemperature: metrics.operatingTemperature || existingDevice?.metrics.operatingTemperature || 25,
        vibration: metrics.vibration || existingDevice?.metrics.vibration || 10,
        noiseLevel: metrics.noiseLevel || existingDevice?.metrics.noiseLevel || 40,
        runtimeHours: metrics.runtimeHours || existingDevice?.metrics.runtimeHours || 0,
        errorCount: metrics.errorCount || existingDevice?.metrics.errorCount || 0,
        maintenanceScore: metrics.maintenanceScore || existingDevice?.metrics.maintenanceScore || 80
      },
      alerts: this.generateAlerts(metrics, thresholds, existingDevice?.alerts || []),
      trends: this.calculateTrends(existingDevice, metrics)
    };

    this.devices.set(deviceId, updatedMetrics);
    return updatedMetrics;
  }

  private calculateOverallHealth(metrics: Partial<DeviceHealthMetrics['metrics']>, thresholds: HealthThresholds): number {
    let healthScore = 100;
    
    // Efficiency impact (30% weight)
    if (metrics.efficiency !== undefined) {
      const efficiencyScore = Math.max(0, (metrics.efficiency - thresholds.efficiency.min) / 
                                     (thresholds.efficiency.max - thresholds.efficiency.min) * 100);
      healthScore = healthScore * 0.7 + efficiencyScore * 0.3;
    }

    // Temperature impact (20% weight)
    if (metrics.operatingTemperature !== undefined) {
      const tempScore = this.calculateTemperatureScore(metrics.operatingTemperature, thresholds);
      healthScore = healthScore * 0.8 + tempScore * 0.2;
    }

    // Error count impact (25% weight)
    if (metrics.errorCount !== undefined) {
      const errorScore = Math.max(0, 100 - (metrics.errorCount / thresholds.errorRate.max) * 100);
      healthScore = healthScore * 0.75 + errorScore * 0.25;
    }

    // Maintenance score impact (25% weight)
    if (metrics.maintenanceScore !== undefined) {
      healthScore = healthScore * 0.75 + metrics.maintenanceScore * 0.25;
    }

    return Math.round(Math.max(0, Math.min(100, healthScore)));
  }

  private calculateTemperatureScore(temperature: number, thresholds: HealthThresholds): number {
    const optimalRange = (thresholds.temperature.max - thresholds.temperature.min) * 0.7;
    const center = (thresholds.temperature.max + thresholds.temperature.min) / 2;
    
    if (temperature >= center - optimalRange/2 && temperature <= center + optimalRange/2) {
      return 100;
    }
    
    const deviation = Math.abs(temperature - center);
    return Math.max(0, 100 - (deviation / optimalRange) * 100);
  }

  private determineStatus(metrics: Partial<DeviceHealthMetrics['metrics']>, thresholds: HealthThresholds): DeviceHealthMetrics['status'] {
    const overallHealth = this.calculateOverallHealth(metrics, thresholds);
    
    if (overallHealth >= 80) return 'Healthy';
    if (overallHealth >= 60) return 'Warning';
    if (overallHealth >= 30) return 'Critical';
    return 'Offline';
  }

  private generateAlerts(metrics: Partial<DeviceHealthMetrics['metrics']>, thresholds: HealthThresholds, existingAlerts: HealthAlert[]): HealthAlert[] {
    const newAlerts: HealthAlert[] = [];
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (metrics.efficiency !== undefined && metrics.efficiency < thresholds.efficiency.min) {
      newAlerts.push({
        id: alertId + '_efficiency',
        severity: metrics.efficiency < thresholds.efficiency.min * 0.8 ? 'High' : 'Medium',
        type: 'Performance',
        message: `Device efficiency (${metrics.efficiency}%) is below threshold (${thresholds.efficiency.min}%)`,
        timestamp: new Date(),
        acknowledged: false,
        resolved: false
      });
    }

    if (metrics.operatingTemperature !== undefined) {
      if (metrics.operatingTemperature > thresholds.temperature.max) {
        newAlerts.push({
          id: alertId + '_temp_high',
          severity: 'Critical',
          type: 'Safety',
          message: `Device temperature (${metrics.operatingTemperature}°C) exceeds maximum threshold (${thresholds.temperature.max}°C)`,
          timestamp: new Date(),
          acknowledged: false,
          resolved: false
        });
      } else if (metrics.operatingTemperature < thresholds.temperature.min) {
        newAlerts.push({
          id: alertId + '_temp_low',
          severity: 'Medium',
          type: 'Performance',
          message: `Device temperature (${metrics.operatingTemperature}°C) is below minimum threshold (${thresholds.temperature.min}°C)`,
          timestamp: new Date(),
          acknowledged: false,
          resolved: false
        });
      }
    }

    if (metrics.errorCount !== undefined && metrics.errorCount > thresholds.errorRate.max) {
      newAlerts.push({
        id: alertId + '_errors',
        severity: 'High',
        type: 'Maintenance',
        message: `Error count (${metrics.errorCount}) exceeds acceptable threshold (${thresholds.errorRate.max})`,
        timestamp: new Date(),
        acknowledged: false,
        resolved: false
      });
    }

    return [...existingAlerts.filter(alert => !alert.resolved), ...newAlerts];
  }

  private calculateTrends(existingDevice: DeviceHealthMetrics | undefined, newMetrics: Partial<DeviceHealthMetrics['metrics']>): HealthTrend[] {
    const trends: HealthTrend[] = [];
    
    if (!existingDevice) return trends;

    // Calculate efficiency trend
    if (newMetrics.efficiency !== undefined && existingDevice.metrics.efficiency !== undefined) {
      const change = newMetrics.efficiency - existingDevice.metrics.efficiency;
      trends.push({
        metric: 'Efficiency',
        direction: change > 2 ? 'Improving' : change < -2 ? 'Degrading' : 'Stable',
        changeRate: Math.abs(change),
        timeframe: 'Last check'
      });
    }

    // Calculate power consumption trend
    if (newMetrics.powerConsumption !== undefined && existingDevice.metrics.powerConsumption !== undefined) {
      const change = ((newMetrics.powerConsumption - existingDevice.metrics.powerConsumption) / existingDevice.metrics.powerConsumption) * 100;
      trends.push({
        metric: 'Power Consumption',
        direction: change < -5 ? 'Improving' : change > 5 ? 'Degrading' : 'Stable',
        changeRate: Math.abs(change),
        timeframe: 'Last check'
      });
    }

    return trends;
  }

  async getDeviceHealth(deviceId: string): Promise<DeviceHealthMetrics | null> {
    return this.devices.get(deviceId) || null;
  }

  async getAllDevicesHealth(): Promise<DeviceHealthMetrics[]> {
    return Array.from(this.devices.values());
  }

  async getDevicesByStatus(status: DeviceHealthMetrics['status']): Promise<DeviceHealthMetrics[]> {
    return Array.from(this.devices.values()).filter(device => device.status === status);
  }

  async acknowledgeAlert(deviceId: string, alertId: string): Promise<boolean> {
    const device = this.devices.get(deviceId);
    if (!device) return false;

    const alert = device.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      this.devices.set(deviceId, device);
      return true;
    }
    return false;
  }

  async resolveAlert(deviceId: string, alertId: string): Promise<boolean> {
    const device = this.devices.get(deviceId);
    if (!device) return false;

    const alert = device.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      this.devices.set(deviceId, device);
      return true;
    }
    return false;
  }

  async getHealthSummary(): Promise<{
    totalDevices: number;
    healthy: number;
    warning: number;
    critical: number;
    offline: number;
    totalAlerts: number;
    criticalAlerts: number;
  }> {
    const devices = Array.from(this.devices.values());
    const alerts = devices.flatMap(d => d.alerts);

    return {
      totalDevices: devices.length,
      healthy: devices.filter(d => d.status === 'Healthy').length,
      warning: devices.filter(d => d.status === 'Warning').length,
      critical: devices.filter(d => d.status === 'Critical').length,
      offline: devices.filter(d => d.status === 'Offline').length,
      totalAlerts: alerts.length,
      criticalAlerts: alerts.filter(a => a.severity === 'Critical').length
    };
  }
}

let healthMonitorInstance: DeviceHealthMonitor | null = null;

export function getDeviceHealthMonitor(): DeviceHealthMonitor {
  if (!healthMonitorInstance) {
    healthMonitorInstance = new DeviceHealthMonitor();
  }
  return healthMonitorInstance;
}
