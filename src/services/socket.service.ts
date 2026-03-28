import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from './api.config';
import { authService } from './auth.service';

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    const { accessToken } = authService.getTokens();
    
    this.socket = io(SOCKET_URL, {
      auth: {
        token: accessToken,
      },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Subscribe to real-time energy updates
  subscribeEnergy(): void {
    this.socket?.emit('energy:subscribe');
  }

  unsubscribeEnergy(): void {
    this.socket?.emit('energy:unsubscribe');
  }

  // Control device via socket
  controlDevice(deviceId: string, action: 'toggle' | 'intensity', value: boolean | number): void {
    this.socket?.emit('device:control', {
      deviceId,
      action,
      value,
    });
  }

  // Listen for energy updates
  onEnergyUpdate(callback: (data: { usage: number; cost: number; timestamp: string }) => void): void {
    this.socket?.on('energy:update', callback);
  }

  // Listen for device status updates
  onDeviceStatus(callback: (data: { deviceId: string; status: boolean; intensity: number }) => void): void {
    this.socket?.on('device:status', callback);
  }

  // Listen for alerts
  onAlert(callback: (data: { type: string; message: string }) => void): void {
    this.socket?.on('alert', callback);
  }

  // Remove listeners
  offEnergyUpdate(): void {
    this.socket?.off('energy:update');
  }

  offDeviceStatus(): void {
    this.socket?.off('device:status');
  }

  offAlert(): void {
    this.socket?.off('alert');
  }
}

export const socketService = new SocketService();
