import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { getMQTTClient, EnergyData, DeviceStatus } from '../iot/mqtt-client';
import { getDeviceManager } from '../iot/device-manager';

export interface RealtimeEvent {
  type: 'energy_update' | 'device_status' | 'alert' | 'device_added' | 'device_removed';
  timestamp: number;
  data: any;
  userId?: string;
}

export interface EnergyUpdatePayload {
  deviceId: string;
  consumption: number;
  cost: number;
  timestamp: number;
}

export interface DeviceStatusPayload {
  deviceId: string;
  online: boolean;
  status: string;
  lastSeen: number;
}

export interface AlertPayload {
  id: string;
  type: 'high_usage' | 'device_offline' | 'peak_hour' | 'maintenance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  deviceId?: string;
  timestamp: number;
  acknowledged: boolean;
}

export class RealtimeWebSocketServer {
  private io: SocketIOServer;
  private mqttClient = getMQTTClient();
  private deviceManager = getDeviceManager();
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.WEBSOCKET_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST"]
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventListeners();
    this.setupMQTTListeners();
  }

  private setupEventListeners(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Handle user authentication
      socket.on('authenticate', (data: { userId: string; token: string }) => {
        // TODO: Validate token with auth service
        const { userId } = data;
        
        if (!this.userSockets.has(userId)) {
          this.userSockets.set(userId, new Set());
        }
        this.userSockets.get(userId)!.add(socket.id);
        
        socket.userId = userId;
        socket.emit('authenticated', { success: true });
        
        // Send initial data
        this.sendInitialData(socket, userId);
      });

      // Handle device control requests
      socket.on('control_device', async (data: { deviceId: string; action: string; params?: any }) => {
        try {
          await this.deviceManager.controlDevice(data.deviceId, data.action, data.params);
          socket.emit('device_control_result', { success: true, deviceId: data.deviceId });
        } catch (error) {
          socket.emit('device_control_result', { 
            success: false, 
            deviceId: data.deviceId, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      });

      // Handle subscription to specific device updates
      socket.on('subscribe_device', (deviceId: string) => {
        socket.join(`device_${deviceId}`);
        console.log(`Socket ${socket.id} subscribed to device ${deviceId}`);
      });

      // Handle unsubscription from device updates
      socket.on('unsubscribe_device', (deviceId: string) => {
        socket.leave(`device_${deviceId}`);
        console.log(`Socket ${socket.id} unsubscribed from device ${deviceId}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        
        if (socket.userId) {
          const userSocketSet = this.userSockets.get(socket.userId);
          if (userSocketSet) {
            userSocketSet.delete(socket.id);
            if (userSocketSet.size === 0) {
              this.userSockets.delete(socket.userId);
            }
          }
        }
      });
    });
  }

  private setupMQTTListeners(): void {
    // Listen for energy data updates
    this.mqttClient.on('energy_data', (data: EnergyData) => {
      const payload: EnergyUpdatePayload = {
        deviceId: data.deviceId,
        consumption: data.consumption,
        cost: this.calculateCost(data.consumption),
        timestamp: data.timestamp
      };

      // Broadcast to all subscribed clients
      this.io.to(`device_${data.deviceId}`).emit('energy_update', payload);
      
      // Also broadcast to user's dashboard
      this.broadcastToUserDevices(data.deviceId, 'energy_update', payload);
    });

    // Listen for device status updates
    this.mqttClient.on('device_status', (status: DeviceStatus) => {
      const payload: DeviceStatusPayload = {
        deviceId: status.deviceId,
        online: status.online,
        status: status.status,
        lastSeen: status.timestamp
      };

      this.io.to(`device_${status.deviceId}`).emit('device_status', payload);
      this.broadcastToUserDevices(status.deviceId, 'device_status', payload);

      // Generate alerts for offline devices
      if (!status.online) {
        this.generateAlert({
          id: `offline_${status.deviceId}_${Date.now()}`,
          type: 'device_offline',
          severity: 'medium',
          message: `Device ${status.deviceId} has gone offline`,
          deviceId: status.deviceId,
          timestamp: Date.now(),
          acknowledged: false
        });
      }
    });

    // Listen for MQTT alerts
    this.mqttClient.on('alert', (alertData: any) => {
      this.generateAlert({
        ...alertData,
        timestamp: Date.now(),
        acknowledged: false
      });
    });
  }

  private sendInitialData(socket: Socket, _userId: string): void {
    // Send current device states
    const devices = this.deviceManager.getAllDevices();
    socket.emit('initial_devices', devices);

    // Send recent energy data
    // TODO: Fetch from database
    socket.emit('initial_energy_data', []);

    // Send active alerts
    // TODO: Fetch from database
    socket.emit('initial_alerts', []);
  }

  private calculateCost(consumption: number): number {
    // Simple cost calculation - should use actual tariff rates
    const baseRate = 5.8; // ₹/kWh
    return consumption * baseRate;
  }

  private broadcastToUserDevices(_deviceId: string, event: string, data: any): void {
    // Find which users own this device and broadcast to them
    // TODO: Implement device ownership mapping
    this.io.emit(event, data);
  }

  private generateAlert(alert: AlertPayload): void {
    // Broadcast alert to all connected clients
    this.io.emit('alert', alert);

    // Store alert in database
    // TODO: Implement alert persistence
  }

  // Public methods for external use
  broadcastEvent(event: RealtimeEvent): void {
    if (event.userId) {
      // Send to specific user
      const userSocketSet = this.userSockets.get(event.userId);
      if (userSocketSet) {
        userSocketSet.forEach(socketId => {
          this.io.to(socketId).emit(event.type, event.data);
        });
      }
    } else {
      // Broadcast to all clients
      this.io.emit(event.type, event.data);
    }
  }

  sendUserNotification(userId: string, notification: { title: string; message: string; type: string }): void {
    const userSocketSet = this.userSockets.get(userId);
    if (userSocketSet) {
      userSocketSet.forEach(socketId => {
        this.io.to(socketId).emit('notification', notification);
      });
    }
  }

  getConnectedUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  getUserSocketCount(userId: string): number {
    return this.userSockets.get(userId)?.size || 0;
  }

  // Analytics and monitoring
  getConnectionStats(): {
    totalConnections: number;
    uniqueUsers: number;
    connectionsByUser: Record<string, number>;
  } {
    const connectionsByUser: Record<string, number> = {};
    this.userSockets.forEach((sockets, userId) => {
      connectionsByUser[userId] = sockets.size;
    });

    return {
      totalConnections: this.io.engine.clientsCount,
      uniqueUsers: this.userSockets.size,
      connectionsByUser
    };
  }
}

// Extend socket interface to include custom properties
declare module 'socket.io' {
  interface Socket {
    userId?: string;
  }
}

// Singleton instance
let wsServer: RealtimeWebSocketServer | null = null;

export function getWebSocketServer(httpServer?: HTTPServer): RealtimeWebSocketServer {
  if (!wsServer && httpServer) {
    wsServer = new RealtimeWebSocketServer(httpServer);
  }
  return wsServer!;
}
