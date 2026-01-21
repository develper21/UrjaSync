import mqtt from 'mqtt';
import { EventEmitter } from 'events';

export interface MQTTConfig {
  brokerUrl: string;
  clientId: string;
  username?: string;
  password?: string;
  keepalive?: number;
  reconnectPeriod?: number;
  cleanSession?: boolean;
  connectTimeout?: number;
}

export interface DeviceMessage {
  deviceId: string;
  timestamp: number;
  data: Record<string, any>;
  messageType: 'energy_data' | 'device_status' | 'alert' | 'command_response';
}

export interface EnergyData {
  deviceId: string;
  timestamp: number;
  consumption: number; // kWh
  voltage: number;
  current: number;
  power: number; // Watts
  frequency: number;
  powerFactor?: number;
  temperature?: number;
  humidity?: number;
}

export interface DeviceStatus {
  deviceId: string;
  timestamp: number;
  online: boolean;
  status: 'On' | 'Off' | 'Standby' | 'Error';
  metadata?: Record<string, any>;
}

export interface ConnectionStatus {
  connected: boolean;
  lastConnectAttempt: number;
  reconnectAttempts: number;
  brokerStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
  lastError?: string;
}

export class IoTMQTTClient extends EventEmitter {
  private client: mqtt.MqttClient | null = null;
  private config: MQTTConfig;
  private connectionStatus: ConnectionStatus = {
    connected: false,
    lastConnectAttempt: 0,
    reconnectAttempts: 0,
    brokerStatus: 'disconnected',
    lastError: undefined
  };

  constructor(config: MQTTConfig) {
    super();
    this.config = {
      keepalive: 60,
      reconnectPeriod: 5000,
      cleanSession: true,
      connectTimeout: 10000,
      ...config
    };

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (this.client) {
      this.client.on('connect', () => {
        console.log('MQTT client connected');
        this.connectionStatus.connected = true;
        this.connectionStatus.brokerStatus = 'connected';
        this.connectionStatus.reconnectAttempts = 0;
        this.emit('connected');
        this.subscribeToTopics();
      });

      this.client.on('error', (error: any) => {
        console.error('MQTT client error:', error);
        this.connectionStatus.lastError = error.message;
        this.connectionStatus.brokerStatus = 'error';
        this.emit('error', error);
      });

      this.client.on('close', () => {
        console.log('MQTT client disconnected');
        this.connectionStatus.connected = false;
        this.connectionStatus.brokerStatus = 'disconnected';
        this.emit('disconnected');
      });

      this.client.on('reconnect', () => {
        console.log('MQTT client reconnecting...');
        this.connectionStatus.brokerStatus = 'connecting';
        this.connectionStatus.reconnectAttempts++;
        this.emit('reconnecting');
      });

      this.client.on('offline', () => {
        console.log('MQTT client offline');
        this.connectionStatus.connected = false;
        this.connectionStatus.brokerStatus = 'disconnected';
        this.emit('offline');
      });

      this.client.on('message', (topic, message) => {
        this.handleMessage(topic, message);
      });
    }
  }

  async connect(): Promise<void> {
    if (this.client && this.connectionStatus.connected) {
      console.log('MQTT client already connected');
      return;
    }

    try {
      console.log(`Connecting to MQTT broker: ${this.config.brokerUrl}`);
      
      this.client = mqtt.connect(this.config.brokerUrl, {
        clientId: this.config.clientId,
        username: this.config.username,
        password: this.config.password,
        keepalive: this.config.keepalive || 60,
        reconnectPeriod: this.config.reconnectPeriod || 5000,
        clean: this.config.cleanSession || true,
        connectTimeout: this.config.connectTimeout || 10000
      });

      // Wait for connection
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('MQTT connection timeout'));
        }, this.config.connectTimeout);
        
        const checkConnection = () => {
          if (this.connectionStatus.connected) {
            clearTimeout(timeout);
            clearInterval(interval);
            resolve(true);
          }
        };

        const interval = setInterval(checkConnection, 1000);
        
        checkConnection();
      });

    } catch (error) {
      console.error('Failed to connect to MQTT broker:', error);
      this.connectionStatus.lastError = error instanceof Error ? error.message : 'Unknown error';
      this.connectionStatus.brokerStatus = 'error';
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      await this.client.end();
      console.log('MQTT client disconnected');
      this.connectionStatus.connected = false;
      this.connectionStatus.brokerStatus = 'disconnected';
      this.emit('disconnected');
    } catch (error) {
      console.error('Failed to disconnect MQTT client:', error);
    }
  }

  private subscribeToTopics(): void {
    if (!this.client) return;

    const topics = [
      'devices/+/energy_data',
      'devices/+/status',
      'devices/+/alerts',
      'devices/+/response'
    ];

    topics.forEach(topic => {
      this.client?.subscribe(topic, { qos: 1 }, (err: Error | null) => {
        if (err) {
          console.error(`Failed to subscribe to ${topic}:`, err);
        } else {
          console.log(`Subscribed to ${topic}`);
        }
      });
    });
  }

  private handleMessage(topic: string, message: Buffer): void {
    try {
      const topicParts = topic.split('/');
      const deviceId = topicParts[1];
      const messageType = topicParts[2];

      const data = JSON.parse(message.toString());
      const deviceMessage: DeviceMessage = {
        deviceId,
        timestamp: Date.now(),
        data,
        messageType: messageType as DeviceMessage['messageType']
      };

      this.emit('message', deviceMessage);
      
      // Emit specific message types
      switch (messageType) {
        case 'energy_data':
          this.emit('energy_data', data as EnergyData);
          break;
        case 'device_status':
          this.emit('device_status', data as DeviceStatus);
          break;
        case 'alert':
          this.emit('alert', data);
          break;
        case 'command_response':
          this.emit('command_response', data);
          break;
      }
    } catch (error: any) {
      console.error('Failed to parse MQTT message:', error);
    }
  }

  async sendCommand(deviceId: string, command: string, params?: Record<string, any>): Promise<void> {
    if (!this.client || !this.connectionStatus.connected) {
      throw new Error('MQTT client not connected');
    }

    const topic = `devices/${deviceId}/commands`;
    const payload = JSON.stringify({
      command,
      params,
      timestamp: Date.now()
    });

    this.client.publish(topic, payload, { qos: 1 }, (err: any) => {
      if (err) {
        console.error(`Failed to send command to ${deviceId}:`, err);
        throw err;
      }
    });
  }

  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  isConnected(): boolean {
    return this.client?.connected || false;
  }
}

// Singleton instance for the application
let mqttClient: IoTMQTTClient | null = null;

export function getMQTTClient(): IoTMQTTClient {
  if (!mqttClient) {
    const config: MQTTConfig = {
      brokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
      clientId: `urjasync_${Math.random().toString(16).substr(2, 8)}`,
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
      keepalive: 60,
      reconnectPeriod: 5000
    };
    
    mqttClient = new IoTMQTTClient(config);
  }
  
  return mqttClient;
}
