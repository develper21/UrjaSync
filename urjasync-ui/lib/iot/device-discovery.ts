import { EventEmitter } from 'events';

export interface DeviceInfo {
  id: string;
  name: string;
  type: 'smart_meter' | 'appliance' | 'sensor' | 'switch' | 'thermostat';
  protocol: 'mqtt' | 'modbus' | 'zigbee' | 'wifi' | 'bluetooth';
  address: string;
  manufacturer?: string;
  model?: string;
  version?: string;
  capabilities: string[];
  location?: {
    room: string;
    coordinates?: { x: number; y: number; z: number };
  };
  metadata: Record<string, any>;
  lastSeen: number;
  online: boolean;
}

export interface DiscoveryConfig {
  scanInterval: number; // milliseconds
  protocols: string[];
  networkRanges: string[];
  timeout: number; // milliseconds
  retryAttempts: number;
  enableAutoRegistration: boolean;
}

export interface ScanResult {
  devices: DeviceInfo[];
  scanDuration: number;
  protocols: string[];
  errors: string[];
}

export class DeviceDiscovery extends EventEmitter {
  private config: DiscoveryConfig;
  private discoveredDevices: Map<string, DeviceInfo> = new Map();
  private scanning = false;
  private scanTimer: NodeJS.Timeout | null = null;
  private protocolAdapters: Map<string, any> = new Map();

  constructor(config: Partial<DiscoveryConfig> = {}) {
    super();
    
    this.config = {
      scanInterval: 30000, // 30 seconds
      protocols: ['mqtt', 'modbus', 'zigbee', 'wifi'],
      networkRanges: ['192.168.1.0/24', '10.0.0.0/24'],
      timeout: 5000, // 5 seconds
      retryAttempts: 3,
      enableAutoRegistration: true,
      ...config
    };

    this.initializeProtocolAdapters();
  }

  private initializeProtocolAdapters(): void {
    // MQTT Adapter
    this.protocolAdapters.set('mqtt', {
      scan: this.scanMQTTDevices.bind(this),
      validate: (device: DeviceInfo) => device.address.startsWith('mqtt://') && device.metadata.topic
    });

    // Modbus Adapter
    this.protocolAdapters.set('modbus', {
      scan: this.scanModbusDevices.bind(this),
      validate: (device: DeviceInfo) => device.address.includes('modbus') || device.address.includes('tcp://')
    });

    // Zigbee Adapter
    this.protocolAdapters.set('zigbee', {
      scan: this.scanZigbeeDevices.bind(this),
      validate: (device: DeviceInfo) => device.address.startsWith('zigbee://') && device.metadata.networkAddress
    });

    // WiFi Adapter
    this.protocolAdapters.set('wifi', {
      scan: this.scanWiFiDevices.bind(this),
      validate: (device: DeviceInfo) => device.address.startsWith('http://') && device.metadata.ipAddress
    });
  }

  // Start automatic device discovery
  start(): void {
    if (this.scanning) {
      console.log('🔍 Device discovery already running');
      return;
    }

    console.log('🔍 Starting device discovery...');
    this.scanning = true;
    
    // Initial scan
    this.performScan();
    
    // Set up periodic scanning
    this.scanTimer = setInterval(() => {
      this.performScan();
    }, this.config.scanInterval);

    this.emit('discoveryStarted');
  }

  // Stop device discovery
  stop(): void {
    if (!this.scanning) {
      return;
    }

    console.log('🛑 Stopping device discovery...');
    this.scanning = false;
    
    if (this.scanTimer) {
      clearInterval(this.scanTimer);
      this.scanTimer = null;
    }

    this.emit('discoveryStopped');
  }

  // Perform comprehensive device scan
  async performScan(): Promise<ScanResult> {
    const startTime = Date.now();
    const allDevices: DeviceInfo[] = [];
    const allErrors: string[] = [];
    const scannedProtocols: string[] = [];

    console.log(`🔍 Scanning for devices on protocols: ${this.config.protocols.join(', ')}`);

    // Scan each enabled protocol
    for (const protocol of this.config.protocols) {
      try {
        const adapter = this.protocolAdapters.get(protocol);
        if (!adapter) {
          allErrors.push(`No adapter available for protocol: ${protocol}`);
          continue;
        }

        console.log(`🔍 Scanning ${protocol} devices...`);
        const devices = await adapter.scan(this.config);
        allDevices.push(...devices);
        scannedProtocols.push(protocol);
        
        console.log(`✅ Found ${devices.length} ${protocol} devices`);
        
      } catch (error) {
        const errorMsg = `Failed to scan ${protocol} devices: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg);
        allErrors.push(errorMsg);
      }
    }

    // Process discovered devices
    const newDevices = this.processDiscoveredDevices(allDevices);
    
    const scanDuration = Date.now() - startTime;
    const result: ScanResult = {
      devices: newDevices,
      scanDuration,
      protocols: scannedProtocols,
      errors: allErrors
    };

    console.log(`🔍 Scan completed: ${newDevices.length} new devices found in ${scanDuration}ms`);
    
    this.emit('scanCompleted', result);
    return result;
  }

  // Process discovered devices
  private processDiscoveredDevices(devices: DeviceInfo[]): DeviceInfo[] {
    const newDevices: DeviceInfo[] = [];
    const now = Date.now();

    devices.forEach(device => {
      const existingDevice = this.discoveredDevices.get(device.id);
      
      if (!existingDevice) {
        // New device discovered
        const processedDevice: DeviceInfo = {
          ...device,
          lastSeen: now,
          online: true
        };

        this.discoveredDevices.set(device.id, processedDevice);
        newDevices.push(processedDevice);
        
        console.log(`🆕 New device discovered: ${device.name} (${device.type})`);
        this.emit('deviceDiscovered', processedDevice);
        
        // Auto-register if enabled
        if (this.config.enableAutoRegistration) {
          this.autoRegisterDevice(processedDevice);
        }
      } else {
        // Update existing device
        existingDevice.lastSeen = now;
        existingDevice.online = true;
        
        // Update device info if newer
        if (device.lastSeen > existingDevice.lastSeen) {
          Object.assign(existingDevice, device);
        }
      }
    });

    // Check for offline devices
    this.checkOfflineDevices();

    return newDevices;
  }

  // Check for devices that haven't been seen recently
  private checkOfflineDevices(): void {
    const now = Date.now();
    const offlineThreshold = 5 * 60 * 1000; // 5 minutes

    this.discoveredDevices.forEach((device, deviceId) => {
      if (now - device.lastSeen > offlineThreshold && device.online) {
        device.online = false;
        console.log(`📴 Device went offline: ${device.name} (${deviceId})`);
        this.emit('deviceOffline', device);
      }
    });
  }

  // Auto-register device
  private async autoRegisterDevice(device: DeviceInfo): Promise<void> {
    try {
      console.log(`📝 Auto-registering device: ${device.name}`);
      
      // This would integrate with the device manager
      // For now, just emit an event
      this.emit('deviceAutoRegistered', device);
      
    } catch (error) {
      console.error(`Failed to auto-register device ${device.id}:`, error);
    }
  }

  // Protocol-specific scan methods

  // MQTT Device Scan
  private async scanMQTTDevices(_config: DiscoveryConfig): Promise<DeviceInfo[]> {
    // const devices: DeviceInfo[] = [];
    
    // Simulate MQTT device discovery
    // In production, this would scan MQTT topics and discover devices
    
    const mqttDevices = [
      {
        id: 'mqtt_smart_meter_001',
        name: 'Smart Meter - Living Room',
        type: 'smart_meter' as const,
        protocol: 'mqtt' as const,
        address: 'mqtt://localhost:1883/energy/meter/living_room',
        manufacturer: 'SmartEnergy',
        model: 'SE-MQTT-100',
        version: '1.0.0',
        capabilities: ['energy_reading', 'power_quality', 'demand_response'],
        location: { room: 'Living Room' },
        metadata: { topic: 'energy/meter/living_room', qos: 1 },
        lastSeen: Date.now(),
        online: true
      },
      {
        id: 'mqtt_ac_001',
        name: 'Air Conditioner - Master Bedroom',
        type: 'appliance' as const,
        protocol: 'mqtt' as const,
        address: 'mqtt://localhost:1883/appliances/ac/master_bedroom',
        manufacturer: 'CoolAir',
        model: 'CA-MQTT-200',
        version: '2.1.0',
        capabilities: ['temperature_control', 'scheduling', 'energy_monitoring'],
        location: { room: 'Master Bedroom' },
        metadata: { topic: 'appliances/ac/master_bedroom', minTemp: 16, maxTemp: 30 },
        lastSeen: Date.now(),
        online: true
      }
    ];

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return mqttDevices;
  }

  // Modbus Device Scan
  private async scanModbusDevices(_config: DiscoveryConfig): Promise<DeviceInfo[]> {
    // const devices: DeviceInfo[] = [];
    
    // Simulate Modbus device discovery
    // In production, this would scan Modbus networks (TCP/RTU)
    
    const modbusDevices = [
      {
        id: 'modbus_meter_001',
        name: 'Industrial Energy Meter',
        type: 'smart_meter' as const,
        protocol: 'modbus' as const,
        address: 'tcp://192.168.1.100:502',
        manufacturer: 'ModbusTech',
        model: 'MT-200',
        version: '3.2.1',
        capabilities: ['energy_reading', 'power_quality', 'logging', 'modbus_registers'],
        location: { room: 'Electrical Room' },
        metadata: { unitId: 1, registers: [40001, 40003, 40005], baudRate: 9600 },
        lastSeen: Date.now(),
        online: true
      }
    ];

    await new Promise(resolve => setTimeout(resolve, 1500));

    return modbusDevices;
  }

  // Zigbee Device Scan
  private async scanZigbeeDevices(_config: DiscoveryConfig): Promise<DeviceInfo[]> {
    // const devices: DeviceInfo[] = [];
    
    // Simulate Zigbee device discovery
    // In production, this would scan Zigbee networks via coordinator
    
    const zigbeeDevices = [
      {
        id: 'zigbee_sensor_001',
        name: 'Temperature Sensor - Kitchen',
        type: 'sensor' as const,
        protocol: 'zigbee' as const,
        address: 'zigbee://0x00158d0001234567',
        manufacturer: 'ZigSense',
        model: 'ZS-TEMP-100',
        version: '1.5.0',
        capabilities: ['temperature', 'humidity', 'battery_level'],
        location: { room: 'Kitchen' },
        metadata: { networkAddress: '0x1234', panId: '0x5678', channel: 11 },
        lastSeen: Date.now(),
        online: true
      },
      {
        id: 'zigbee_switch_001',
        name: 'Smart Switch - Hallway',
        type: 'switch' as const,
        protocol: 'zigbee' as const,
        address: 'zigbee://0x00158d0002345678',
        manufacturer: 'ZigSense',
        model: 'ZS-SWITCH-200',
        version: '2.0.0',
        capabilities: ['on_off', 'dimming', 'energy_monitoring'],
        location: { room: 'Hallway' },
        metadata: { networkAddress: '0x2345', panId: '0x5678', channel: 11 },
        lastSeen: Date.now(),
        online: true
      }
    ];

    await new Promise(resolve => setTimeout(resolve, 2000));

    return zigbeeDevices;
  }

  // WiFi Device Scan
  private async scanWiFiDevices(_config: DiscoveryConfig): Promise<DeviceInfo[]> {
    // const devices: DeviceInfo[] = [];
    
    // Simulate WiFi device discovery
    // In production, this would scan WiFi networks and UPnP devices
    
    const wifiDevices = [
      {
        id: 'wifi_thermostat_001',
        name: 'Smart Thermostat',
        type: 'thermostat' as const,
        protocol: 'wifi' as const,
        address: 'http://192.168.1.50:80',
        manufacturer: 'ThermoSmart',
        model: 'TS-WiFi-300',
        version: '4.1.2',
        capabilities: ['temperature_control', 'scheduling', 'energy_monitoring', 'remote_access'],
        location: { room: 'Living Room' },
        metadata: { ipAddress: '192.168.1.50', port: 80, macAddress: 'AA:BB:CC:DD:EE:FF' },
        lastSeen: Date.now(),
        online: true
      }
    ];

    await new Promise(resolve => setTimeout(resolve, 800));

    return wifiDevices;
  }

  // Public methods

  // Get all discovered devices
  getAllDevices(): DeviceInfo[] {
    return Array.from(this.discoveredDevices.values());
  }

  // Get devices by type
  getDevicesByType(type: DeviceInfo['type']): DeviceInfo[] {
    return this.getAllDevices().filter(device => device.type === type);
  }

  // Get devices by protocol
  getDevicesByProtocol(protocol: DeviceInfo['protocol']): DeviceInfo[] {
    return this.getAllDevices().filter(device => device.protocol === protocol);
  }

  // Get online devices
  getOnlineDevices(): DeviceInfo[] {
    return this.getAllDevices().filter(device => device.online);
  }

  // Get device by ID
  getDevice(deviceId: string): DeviceInfo | undefined {
    return this.discoveredDevices.get(deviceId);
  }

  // Add custom device
  addDevice(device: DeviceInfo): void {
    this.discoveredDevices.set(device.id, {
      ...device,
      lastSeen: Date.now(),
      online: true
    });
    
    console.log(`➕ Custom device added: ${device.name} (${device.id})`);
    this.emit('deviceAdded', device);
  }

  // Remove device
  removeDevice(deviceId: string): boolean {
    const device = this.discoveredDevices.get(deviceId);
    if (device) {
      this.discoveredDevices.delete(deviceId);
      console.log(`➖ Device removed: ${device.name} (${deviceId})`);
      this.emit('deviceRemoved', device);
      return true;
    }
    return false;
  }

  // Update device
  updateDevice(deviceId: string, updates: Partial<DeviceInfo>): boolean {
    const device = this.discoveredDevices.get(deviceId);
    if (device) {
      Object.assign(device, updates);
      this.emit('deviceUpdated', device);
      return true;
    }
    return false;
  }

  // Get discovery status
  getStatus(): {
    scanning: boolean;
    totalDevices: number;
    onlineDevices: number;
    config: DiscoveryConfig;
  } {
    const allDevices = this.getAllDevices();
    const onlineDevices = allDevices.filter(device => device.online);

    return {
      scanning: this.scanning,
      totalDevices: allDevices.length,
      onlineDevices: onlineDevices.length,
      config: { ...this.config }
    };
  }

  // Update configuration
  updateConfig(newConfig: Partial<DiscoveryConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart scanning if interval changed
    if (newConfig.scanInterval && this.scanning) {
      this.stop();
      this.start();
    }
  }

  // Force refresh of specific device
  async refreshDevice(deviceId: string): Promise<boolean> {
    const device = this.getDevice(deviceId);
    if (!device) {
      return false;
    }

    try {
      const adapter = this.protocolAdapters.get(device.protocol);
      if (adapter && adapter.validate) {
        const isValid = await adapter.validate(device);
        if (isValid) {
          device.lastSeen = Date.now();
          device.online = true;
          this.emit('deviceRefreshed', device);
          return true;
        }
      }
    } catch (error) {
      console.error(`Failed to refresh device ${deviceId}:`, error);
    }

    return false;
  }

  // Alias methods for compatibility with route
  async scanDevices(protocol?: string, _duration?: number): Promise<ScanResult> {
    if (protocol) {
      const originalProtocols = this.config.protocols;
      this.config.protocols = [protocol];
      const result = await this.performScan();
      this.config.protocols = originalProtocols;
      return result;
    }
    return await this.performScan();
  }

  getDiscoveryStatus() {
    return this.getStatus();
  }

  getAvailableProtocols(): string[] {
    return Array.from(this.protocolAdapters.keys());
  }

  getDiscoveryHistory(): ScanResult[] {
    // Mock history - in production this would store actual scan results
    return [];
  }

  async connectDevice(deviceId: string): Promise<boolean> {
    const device = this.getDevice(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    try {
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 1000));
      device.online = true;
      device.lastSeen = Date.now();
      this.emit('deviceConnected', device);
      return true;
    } catch (error) {
      console.error(`Failed to connect device ${deviceId}:`, error);
      throw error;
    }
  }

  async pairDevice(deviceId: string, pairingCode?: string): Promise<boolean> {
    const device = this.getDevice(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    try {
      // Simulate pairing process
      await new Promise(resolve => setTimeout(resolve, 2000));
      device.metadata.paired = true;
      device.metadata.pairedAt = Date.now();
      if (pairingCode) {
        device.metadata.pairingCode = pairingCode;
      }
      this.emit('devicePaired', device);
      return true;
    } catch (error) {
      console.error(`Failed to pair device ${deviceId}:`, error);
      throw error;
    }
  }

  startContinuousDiscovery(): void {
    this.start();
  }

  stopContinuousDiscovery(): void {
    this.stop();
  }
}

// Singleton instance
let deviceDiscovery: DeviceDiscovery | null = null;

export function getDeviceDiscovery(): DeviceDiscovery {
  if (!deviceDiscovery) {
    deviceDiscovery = new DeviceDiscovery({
      scanInterval: 30000,
      protocols: ['mqtt', 'modbus', 'zigbee', 'wifi'],
      enableAutoRegistration: true
    });
  }
  return deviceDiscovery;
}
