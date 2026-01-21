import { WebSocket, WebSocketServer } from 'ws';

export interface WebSocketConnection {
  id: string;
  ws: WebSocket;
  userId?: string;
  sessionId: string;
  deviceId?: string;
  role: 'user' | 'device' | 'admin' | 'system';
  permissions: string[];
  subscriptions: Set<string>;
  lastActivity: Date;
  connectedAt: Date;
  metadata: ConnectionMetadata;
  isActive: boolean;
  pingInterval?: NodeJS.Timeout;
}

export interface ConnectionMetadata {
  userAgent?: string;
  ip?: string;
  location?: string;
  platform?: string;
  version?: string;
  deviceId?: string;
  authToken?: string;
  additionalData?: Record<string, any>;
}

export interface WebSocketMessage {
  id: string;
  type: MessageType;
  channel: string;
  payload: any;
  timestamp: Date;
  sender?: string;
  recipient?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  ttl?: number; // time to live in seconds
  metadata?: MessageMetadata;
}

export type MessageType = 
  | 'subscribe' 
  | 'unsubscribe' 
  | 'data' 
  | 'event' 
  | 'alert' 
  | 'command' 
  | 'response' 
  | 'heartbeat' 
  | 'error' 
  | 'auth' 
  | 'disconnect';

export interface MessageMetadata {
  correlationId?: string;
  requestId?: string;
  source?: string;
  destination?: string;
  compression?: string;
  encryption?: boolean;
  retryCount?: number;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private' | 'device' | 'admin' | 'system';
  permissions: string[];
  maxSubscribers?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  stats: ChannelStats;
}

export interface ChannelStats {
  totalSubscribers: number;
  activeSubscribers: number;
  messagesSent: number;
  lastMessageAt?: Date;
  averageMessagesPerMinute: number;
  peakConcurrentSubscribers: number;
}

export interface WebSocketConfig {
  port: number;
  host?: string;
  ssl?: boolean;
  certPath?: string;
  keyPath?: string;
  maxConnections?: number;
  heartbeatInterval?: number;
  messageSizeLimit?: number;
  compressionEnabled?: boolean;
  authenticationRequired?: boolean;
  rateLimiting?: RateLimitConfig;
}

export interface RateLimitConfig {
  enabled: boolean;
  maxMessagesPerMinute: number;
  maxConnectionsPerIP: number;
  banDuration: number; // minutes
}

export interface WebSocketStats {
  totalConnections: number;
  activeConnections: number;
  totalMessages: number;
  messagesPerSecond: number;
  averageLatency: number;
  connectionUptime: number; // percentage
  errorRate: number; // percentage
  topChannels: Array<{
    channelId: string;
    subscribers: number;
    messages: number;
  }>;
  hourlyStats: HourlyWebSocketStats[];
}

export interface HourlyWebSocketStats {
  hour: number;
  connections: number;
  messages: number;
  errors: number;
  averageLatency: number;
}

export class WebSocketManager {
  private connections: Map<string, WebSocketConnection> = new Map();
  private channels: Map<string, Channel> = new Map();
  private server?: WebSocketServer;
  private config: WebSocketConfig;
  private stats: WebSocketStats;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(config: WebSocketConfig) {
    this.config = {
      heartbeatInterval: 30000,
      messageSizeLimit: 1024 * 1024, // 1MB
      compressionEnabled: true,
      authenticationRequired: true,
      rateLimiting: {
        enabled: true,
        maxMessagesPerMinute: 100,
        maxConnectionsPerIP: 10,
        banDuration: 60
      },
      ...config
    };

    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      totalMessages: 0,
      messagesPerSecond: 0,
      averageLatency: 0,
      connectionUptime: 100,
      errorRate: 0,
      topChannels: [],
      hourlyStats: []
    };

    this.initializeChannels();
  }

  private initializeChannels() {
    const defaultChannels: Channel[] = [
      {
        id: 'ENERGY_DATA',
        name: 'Energy Consumption Data',
        description: 'Real-time energy consumption and production data',
        type: 'public',
        permissions: ['read:energy', 'device:connect'],
        maxSubscribers: 1000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          totalSubscribers: 0,
          activeSubscribers: 0,
          messagesSent: 0,
          averageMessagesPerMinute: 0,
          peakConcurrentSubscribers: 0
        }
      },
      {
        id: 'DEVICE_STATUS',
        name: 'Device Status Updates',
        description: 'Device online/offline status and health information',
        type: 'device',
        permissions: ['device:connect', 'admin:monitor'],
        maxSubscribers: 500,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          totalSubscribers: 0,
          activeSubscribers: 0,
          messagesSent: 0,
          averageMessagesPerMinute: 0,
          peakConcurrentSubscribers: 0
        }
      },
      {
        id: 'ALERTS',
        name: 'System Alerts',
        description: 'Real-time system and device alerts',
        type: 'public',
        permissions: ['read:alerts'],
        maxSubscribers: 2000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          totalSubscribers: 0,
          activeSubscribers: 0,
          messagesSent: 0,
          averageMessagesPerMinute: 0,
          peakConcurrentSubscribers: 0
        }
      },
      {
        id: 'ADMIN_PANEL',
        name: 'Admin Panel',
        description: 'Administrative controls and monitoring',
        type: 'admin',
        permissions: ['admin:access'],
        maxSubscribers: 50,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          totalSubscribers: 0,
          activeSubscribers: 0,
          messagesSent: 0,
          averageMessagesPerMinute: 0,
          peakConcurrentSubscribers: 0
        }
      }
    ];

    defaultChannels.forEach(channel => {
      this.channels.set(channel.id, channel);
    });
  }

  async start(): Promise<void> {
    try {
      this.server = new WebSocketServer({
        port: this.config.port,
        host: this.config.host,
        maxPayload: this.config.messageSizeLimit
      });

      this.server.on('connection', this.handleConnection.bind(this));
      this.server.on('error', (error) => {
        console.error('WebSocket server error:', error);
        this.emit('server_error', { error });
      });

      // Start heartbeat monitoring
      this.startHeartbeatMonitoring();
      
      // Start stats collection
      this.startStatsCollection();

      console.log(`WebSocket server started on port ${this.config.port}`);
      this.emit('server_started', { port: this.config.port });
    } catch (error) {
      console.error('Failed to start WebSocket server:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.server) {
      // Close all connections
      for (const connection of this.connections.values()) {
        this.closeConnection(connection.id, 'Server shutting down');
      }

      this.server.close();
      console.log('WebSocket server stopped');
      this.emit('server_stopped', {});
    }
  }

  private handleConnection(ws: WebSocket, request: any): void {
    const connectionId = `CONN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sessionId = `SESS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const connection: WebSocketConnection = {
      id: connectionId,
      ws,
      sessionId,
      role: 'user',
      permissions: [],
      subscriptions: new Set(),
      lastActivity: new Date(),
      connectedAt: new Date(),
      metadata: {
        ip: request.socket?.remoteAddress,
        userAgent: request.headers['user-agent']
      },
      isActive: true
    };

    this.connections.set(connectionId, connection);
    this.stats.totalConnections++;
    this.stats.activeConnections++;

    // Setup WebSocket event handlers
    ws.on('message', (data) => this.handleMessage(connectionId, data));
    ws.on('close', () => this.handleDisconnection(connectionId));
    ws.on('error', (error) => this.handleConnectionError(connectionId, error));
    ws.on('pong', () => this.handlePong(connectionId));

    // Send welcome message
    this.sendMessage(connectionId, {
      type: 'auth',
      channel: 'system',
      payload: {
        message: 'Connected to UrjaSync WebSocket server',
        sessionId,
        timestamp: new Date()
      },
      timestamp: new Date(),
      priority: 'normal'
    });

    this.emit('connection_established', { connectionId, sessionId });
  }

  private async handleMessage(connectionId: string, data: any): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    connection.lastActivity = new Date();

    try {
      const message: WebSocketMessage = JSON.parse(data.toString());
      message.timestamp = new Date();
      message.id = message.id || `MSG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Rate limiting check
      if (this.config.rateLimiting?.enabled && !this.checkRateLimit(connection)) {
        this.sendError(connectionId, 'Rate limit exceeded');
        return;
      }

      // Handle different message types
      switch (message.type) {
        case 'subscribe':
          await this.handleSubscribe(connectionId, message);
          break;
        case 'unsubscribe':
          await this.handleUnsubscribe(connectionId, message);
          break;
        case 'data':
        case 'event':
        case 'alert':
          await this.handleBroadcast(connectionId, message);
          break;
        case 'command':
          await this.handleCommand(connectionId, message);
          break;
        case 'heartbeat':
          this.handleHeartbeat(connectionId);
          break;
        case 'auth':
          await this.handleAuthentication(connectionId, message);
          break;
        default:
          this.sendError(connectionId, `Unknown message type: ${message.type}`);
      }

      this.stats.totalMessages++;
      this.emit('message_received', { connectionId, message });
    } catch (error) {
      console.error('Error handling message:', error);
      this.sendError(connectionId, 'Invalid message format');
      this.stats.errorRate++;
    }
  }

  private async handleSubscribe(connectionId: string, message: WebSocketMessage): Promise<void> {
    const connection = this.connections.get(connectionId);
    const channelId = message.payload.channel;

    if (!connection || !channelId) return;

    const channel = this.channels.get(channelId);
    if (!channel) {
      this.sendError(connectionId, `Channel ${channelId} not found`);
      return;
    }

    // Check permissions
    if (!this.hasPermission(connection, channel.permissions)) {
      this.sendError(connectionId, `Insufficient permissions for channel ${channelId}`);
      return;
    }

    // Check channel capacity
    if (channel.maxSubscribers && channel.stats.activeSubscribers >= channel.maxSubscribers) {
      this.sendError(connectionId, `Channel ${channelId} is full`);
      return;
    }

    // Add subscription
    connection.subscriptions.add(channelId);
    channel.stats.activeSubscribers++;
    channel.stats.totalSubscribers++;

    this.sendResponse(connectionId, message.id, 'subscribe', {
      channel: channelId,
      subscribed: true,
      timestamp: new Date()
    });

    this.emit('subscription_added', { connectionId, channelId });
  }

  private async handleUnsubscribe(connectionId: string, message: WebSocketMessage): Promise<void> {
    const connection = this.connections.get(connectionId);
    const channelId = message.payload.channel;

    if (!connection || !channelId) return;

    if (connection.subscriptions.has(channelId)) {
      connection.subscriptions.delete(channelId);
      
      const channel = this.channels.get(channelId);
      if (channel) {
        channel.stats.activeSubscribers--;
      }

      this.sendResponse(connectionId, message.id, 'unsubscribe', {
        channel: channelId,
        unsubscribed: true,
        timestamp: new Date()
      });

      this.emit('subscription_removed', { connectionId, channelId });
    }
  }

  private async handleBroadcast(connectionId: string, message: WebSocketMessage): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const channel = this.channels.get(message.channel);
    if (!channel) {
      this.sendError(connectionId, `Channel ${message.channel} not found`);
      return;
    }

    // Check permissions
    if (!this.hasPermission(connection, channel.permissions)) {
      this.sendError(connectionId, `Insufficient permissions to broadcast to ${message.channel}`);
      return;
    }

    // Broadcast to all subscribers
    this.broadcastToChannel(message.channel, message, connectionId);
    channel.stats.messagesSent++;
    channel.stats.lastMessageAt = new Date();

    this.emit('message_broadcast', { connectionId, message, channel: message.channel });
  }

  private async handleCommand(connectionId: string, message: WebSocketMessage): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Handle different commands
    switch (message.payload.command) {
      case 'get_stats':
        this.sendResponse(connectionId, message.id, 'command', {
          stats: this.getConnectionStats(connectionId),
          timestamp: new Date()
        });
        break;
      case 'get_channels':
        this.sendResponse(connectionId, message.id, 'command', {
          channels: Array.from(this.channels.values()).map(ch => ({
            id: ch.id,
            name: ch.name,
            type: ch.type,
            subscribers: ch.stats.activeSubscribers
          })),
          timestamp: new Date()
        });
        break;
      case 'ping':
        this.sendResponse(connectionId, message.id, 'command', {
          pong: true,
          timestamp: new Date()
        });
        break;
      default:
        this.sendError(connectionId, `Unknown command: ${message.payload.command}`);
    }
  }

  private handleHeartbeat(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.lastActivity = new Date();
      this.sendResponse(connectionId, '', 'heartbeat', {
        timestamp: new Date()
      });
    }
  }

  private async handleAuthentication(connectionId: string, message: WebSocketMessage): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Simulate authentication
    const { token, userId, role } = message.payload;
    
    if (token && userId) {
      connection.userId = userId;
      connection.role = role || 'user';
      connection.permissions = this.getPermissionsForRole(connection.role);
      connection.metadata.authToken = token;

      this.sendResponse(connectionId, message.id, 'auth', {
        authenticated: true,
        userId,
        role: connection.role,
        permissions: connection.permissions,
        timestamp: new Date()
      });

      this.emit('user_authenticated', { connectionId, userId, role });
    } else {
      this.sendError(connectionId, 'Authentication failed');
    }
  }

  private handleDisconnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Clear subscriptions
    for (const channelId of connection.subscriptions) {
      const channel = this.channels.get(channelId);
      if (channel) {
        channel.stats.activeSubscribers--;
      }
    }

    // Clear heartbeat interval
    if (connection.pingInterval) {
      clearInterval(connection.pingInterval);
    }

    connection.isActive = false;
    this.connections.delete(connectionId);
    this.stats.activeConnections--;

    this.emit('connection_closed', { connectionId, userId: connection.userId });
  }

  private handleConnectionError(connectionId: string, error: Error): void {
    console.error(`Connection error for ${connectionId}:`, error);
    this.stats.errorRate++;
    this.emit('connection_error', { connectionId, error });
  }

  private handlePong(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.lastActivity = new Date();
    }
  }

  private broadcastToChannel(channelId: string, message: WebSocketMessage, excludeConnectionId?: string): void {
    const channel = this.channels.get(channelId);
    if (!channel) return;

    const messageStr = JSON.stringify(message);

    for (const connection of this.connections.values()) {
      if (connection.subscriptions.has(channelId) && 
          connection.isActive && 
          connection.id !== excludeConnectionId) {
        
        try {
          connection.ws.send(messageStr);
        } catch (error) {
          console.error(`Failed to send message to connection ${connection.id}:`, error);
        }
      }
    }
  }

  private sendMessage(connectionId: string, message: Partial<WebSocketMessage>): void {
    const connection = this.connections.get(connectionId);
    if (!connection || !connection.isActive) return;

    const fullMessage: WebSocketMessage = {
      id: `MSG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'response',
      channel: 'system',
      payload: message.payload || message,
      timestamp: new Date(),
      priority: 'normal',
      ...message
    };

    try {
      connection.ws.send(JSON.stringify(fullMessage));
    } catch (error) {
      console.error(`Failed to send message to connection ${connectionId}:`, error);
    }
  }

  private sendResponse(connectionId: string, requestId: string, type: MessageType, payload: any): void {
    this.sendMessage(connectionId, {
      type,
      channel: 'system',
      payload,
      metadata: { requestId, correlationId: requestId }
    });
  }

  private sendError(connectionId: string, error: string): void {
    this.sendMessage(connectionId, {
      type: 'error',
      channel: 'system',
      payload: { error, timestamp: new Date() },
      priority: 'high'
    });
  }

  private hasPermission(connection: WebSocketConnection, requiredPermissions: string[]): boolean {
    return requiredPermissions.every(permission => 
      connection.permissions.includes(permission) || 
      connection.role === 'admin'
    );
  }

  private getPermissionsForRole(role: string): string[] {
    const rolePermissions: Record<string, string[]> = {
      'user': ['read:energy', 'read:alerts'],
      'device': ['device:connect', 'read:alerts'],
      'admin': ['admin:access', 'read:energy', 'read:alerts', 'device:connect', 'admin:monitor'],
      'system': ['*']
    };

    return rolePermissions[role] || [];
  }

  private checkRateLimit(connection: WebSocketConnection): boolean {
    // Simple rate limiting - in production, use proper rate limiting
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    if (!connection.metadata.additionalData) {
      connection.metadata.additionalData = {};
    }
    
    const messages = connection.metadata.additionalData.recentMessages || [];
    const recentMessages = messages.filter((timestamp: number) => timestamp > oneMinuteAgo);
    
    if (recentMessages.length >= this.config.rateLimiting!.maxMessagesPerMinute) {
      return false;
    }
    
    recentMessages.push(now);
    connection.metadata.additionalData.recentMessages = recentMessages;
    
    return true;
  }

  private startHeartbeatMonitoring(): void {
    setInterval(() => {
      const now = Date.now();
      const heartbeatTimeout = this.config.heartbeatInterval! * 2;

      for (const connection of this.connections.values()) {
        if (now - connection.lastActivity.getTime() > heartbeatTimeout) {
          this.closeConnection(connection.id, 'Heartbeat timeout');
        } else {
          // Send ping
          try {
            connection.ws.ping();
          } catch (error) {
            this.closeConnection(connection.id, 'Ping failed');
          }
        }
      }
    }, this.config.heartbeatInterval);
  }

  private startStatsCollection(): void {
    setInterval(() => {
      this.updateStats();
    }, 60000); // Update stats every minute
  }

  private updateStats(): void {
    const now = new Date();
    const currentHour = now.getHours();

    // Calculate messages per second
    this.stats.messagesPerSecond = this.stats.totalMessages / (Date.now() - this.stats.totalConnections * 1000);

    // Update top channels
    this.stats.topChannels = Array.from(this.channels.values())
      .map(channel => ({
        channelId: channel.id,
        subscribers: channel.stats.activeSubscribers,
        messages: channel.stats.messagesSent
      }))
      .sort((a, b) => b.messages - a.messages)
      .slice(0, 10);

    // Update hourly stats
    let hourlyStat = this.stats.hourlyStats.find(stat => stat.hour === currentHour);
    if (!hourlyStat) {
      hourlyStat = {
        hour: currentHour,
        connections: 0,
        messages: 0,
        errors: 0,
        averageLatency: 0
      };
      this.stats.hourlyStats.push(hourlyStat);
    }

    hourlyStat.connections = this.stats.activeConnections;
    hourlyStat.messages = this.stats.totalMessages;
  }

  private closeConnection(connectionId: string, reason: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      try {
        connection.ws.close(1000, reason);
      } catch (error) {
        // Connection might already be closed
      }
      this.handleDisconnection(connectionId);
    }
  }

  private getConnectionStats(connectionId: string): any {
    const connection = this.connections.get(connectionId);
    if (!connection) return null;

    return {
      id: connection.id,
      userId: connection.userId,
      role: connection.role,
      connectedAt: connection.connectedAt,
      lastActivity: connection.lastActivity,
      subscriptions: Array.from(connection.subscriptions),
      isActive: connection.isActive
    };
  }

  // Public API methods
  async broadcast(channelId: string, message: any, priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'): Promise<void> {
    const channel = this.channels.get(channelId);
    if (!channel) {
      throw new Error(`Channel ${channelId} not found`);
    }

    const wsMessage: WebSocketMessage = {
      id: `MSG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'data',
      channel: channelId,
      payload: message,
      timestamp: new Date(),
      priority
    };

    this.broadcastToChannel(channelId, wsMessage);
    channel.stats.messagesSent++;
    channel.stats.lastMessageAt = new Date();
  }

  async sendToUser(userId: string, message: any, channelId?: string): Promise<void> {
    const targetConnections = Array.from(this.connections.values())
      .filter(conn => conn.userId === userId && conn.isActive);

    for (const connection of targetConnections) {
      this.sendMessage(connection.id, {
        type: 'data',
        channel: channelId || 'private',
        payload: message,
        timestamp: new Date()
      });
    }
  }

  async getStats(): Promise<WebSocketStats> {
    return { ...this.stats };
  }

  async getConnections(): Promise<WebSocketConnection[]> {
    return Array.from(this.connections.values());
  }

  async getChannels(): Promise<Channel[]> {
    return Array.from(this.channels.values());
  }

  // Event system
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }
}

let webSocketManagerInstance: WebSocketManager | null = null;

export function getWebSocketManager(config?: WebSocketConfig): WebSocketManager {
  if (!webSocketManagerInstance) {
    const defaultConfig: WebSocketConfig = {
      port: 8080,
      heartbeatInterval: 30000,
      messageSizeLimit: 1024 * 1024,
      compressionEnabled: true,
      authenticationRequired: true,
      rateLimiting: {
        enabled: true,
        maxMessagesPerMinute: 100,
        maxConnectionsPerIP: 10,
        banDuration: 60
      }
    };
    
    webSocketManagerInstance = new WebSocketManager(config || defaultConfig);
  }
  return webSocketManagerInstance;
}
