export interface PushNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  icon?: string;
  image?: string;
  badge?: number;
  sound?: string;
  vibrate?: boolean;
  actions?: NotificationAction[];
  priority: 'normal' | 'high' | 'max';
  ttl?: number; // Time to live in seconds
  collapseKey?: string;
  category?: string;
  threadId?: string;
  timestamp: Date;
  scheduledFor?: Date;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  deliveryAttempts: number;
  lastAttempt?: Date;
  errorMessage?: string;
  readAt?: Date;
  clickedAt?: Date;
}

export interface NotificationAction {
  id: string;
  title: string;
  icon?: string;
  input?: boolean;
  placeholder?: string;
}

export interface DeviceToken {
  id: string;
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceInfo: DeviceInfo;
  isActive: boolean;
  registeredAt: Date;
  lastUsed: Date;
  expiresAt?: Date;
}

export interface DeviceInfo {
  deviceId: string;
  model: string;
  os: string;
  osVersion: string;
  appVersion: string;
  manufacturer?: string;
  carrier?: string;
}

export interface PushNotificationStats {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalClicked: number;
  totalRead: number;
  deliveryRate: number;
  clickRate: number;
  readRate: number;
  averageDeliveryTime: number; // milliseconds
  platformStats: Record<string, {
    sent: number;
    delivered: number;
    failed: number;
    deliveryRate: number;
  }>;
}

export interface PushTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  variables: TemplateVariable[];
  defaultActions?: NotificationAction[];
  category: string;
  priority: 'normal' | 'high' | 'max';
  ttl?: number;
  sound?: string;
  icon?: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  required: boolean;
  defaultValue?: any;
  description?: string;
}

export interface PushCampaign {
  id: string;
  name: string;
  description: string;
  templateId: string;
  targetAudience: {
    userIds?: string[];
    segments?: string[];
    filters?: CampaignFilter[];
  };
  variables: Record<string, any>;
  scheduledFor?: Date;
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused' | 'cancelled';
  stats: {
    totalRecipients: number;
    sent: number;
    delivered: number;
    clicked: number;
    read: number;
    failed: number;
  };
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface CampaignFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export class PushNotificationService {
  private notifications: Map<string, PushNotification> = new Map();
  private deviceTokens: Map<string, DeviceToken> = new Map();
  private templates: Map<string, PushTemplate> = new Map();
  private campaigns: Map<string, PushCampaign> = new Map();
  private stats: PushNotificationStats;

  constructor() {
    this.stats = {
      totalSent: 0,
      totalDelivered: 0,
      totalFailed: 0,
      totalClicked: 0,
      totalRead: 0,
      deliveryRate: 0,
      clickRate: 0,
      readRate: 0,
      averageDeliveryTime: 0,
      platformStats: {}
    };
    this.initializeTemplates();
    this.initializeDeviceTokens();
  }

  private initializeTemplates() {
    const templates: PushTemplate[] = [
      {
        id: 'TEMPLATE001',
        name: 'Device Alert',
        title: '🚨 {{deviceType}} Alert',
        body: 'Your {{deviceName}} has {{alertType}}: {{message}}',
        variables: [
          { name: 'deviceType', type: 'string', required: true },
          { name: 'deviceName', type: 'string', required: true },
          { name: 'alertType', type: 'string', required: true },
          { name: 'message', type: 'string', required: true }
        ],
        defaultActions: [
          { id: 'view', title: 'View Details' },
          { id: 'dismiss', title: 'Dismiss' }
        ],
        category: 'device_alert',
        priority: 'high',
        sound: 'alert',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'TEMPLATE002',
        name: 'Maintenance Reminder',
        title: '🔧 Maintenance Due',
        body: 'Your {{deviceName}} is due for {{maintenanceType}} on {{dueDate}}',
        variables: [
          { name: 'deviceName', type: 'string', required: true },
          { name: 'maintenanceType', type: 'string', required: true },
          { name: 'dueDate', type: 'date', required: true }
        ],
        defaultActions: [
          { id: 'schedule', title: 'Schedule Now' },
          { id: 'remind', title: 'Remind Later' }
        ],
        category: 'maintenance',
        priority: 'normal',
        sound: 'reminder',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'TEMPLATE003',
        name: 'Energy Saving Tip',
        title: '💡 Energy Saving Tip',
        body: '{{tip}} - Save up to {{savings}}% on your energy bill!',
        variables: [
          { name: 'tip', type: 'string', required: true },
          { name: 'savings', type: 'number', required: true }
        ],
        defaultActions: [
          { id: 'learn_more', title: 'Learn More' },
          { id: 'dismiss', title: 'Not Now' }
        ],
        category: 'energy_tips',
        priority: 'normal',
        sound: 'default',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  private initializeDeviceTokens() {
    const sampleTokens: DeviceToken[] = [
      {
        id: 'TOKEN001',
        userId: 'USER001',
        token: 'ios_device_token_12345',
        platform: 'ios',
        deviceInfo: {
          deviceId: 'IPHONE_001',
          model: 'iPhone 14 Pro',
          os: 'iOS',
          osVersion: '17.1',
          appVersion: '2.1.0',
          manufacturer: 'Apple',
          carrier: 'Verizon'
        },
        isActive: true,
        registeredAt: new Date('2024-01-01'),
        lastUsed: new Date(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
      },
      {
        id: 'TOKEN002',
        userId: 'USER001',
        token: 'android_device_token_67890',
        platform: 'android',
        deviceInfo: {
          deviceId: 'ANDROID_001',
          model: 'Samsung Galaxy S23',
          os: 'Android',
          osVersion: '14',
          appVersion: '2.1.0',
          manufacturer: 'Samsung',
          carrier: 'AT&T'
        },
        isActive: true,
        registeredAt: new Date('2024-01-15'),
        lastUsed: new Date(),
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days
      }
    ];

    sampleTokens.forEach(token => {
      this.deviceTokens.set(token.id, token);
    });
  }

  async sendNotification(notification: Omit<PushNotification, 'id' | 'timestamp' | 'status' | 'deliveryAttempts'>): Promise<PushNotification> {
    const pushNotification: PushNotification = {
      ...notification,
      id: `PUSH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      status: 'pending',
      deliveryAttempts: 0
    };

    this.notifications.set(pushNotification.id, pushNotification);
    
    // Simulate sending notification
    await this.deliverNotification(pushNotification);
    
    return pushNotification;
  }

  async sendFromTemplate(templateId: string, userId: string, variables: Record<string, any>, options?: Partial<PushNotification>): Promise<PushNotification | null> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Validate required variables
    for (const variable of template.variables) {
      if (variable.required && !variables[variable.name]) {
        throw new Error(`Required variable ${variable.name} is missing`);
      }
    }

    // Replace template variables
    const title = this.replaceVariables(template.title, variables);
    const body = this.replaceVariables(template.body, variables);

    return this.sendNotification({
      userId,
      title,
      body,
      data: { templateId, variables },
      priority: template.priority,
      ttl: template.ttl,
      sound: template.sound,
      icon: template.icon,
      image: template.image,
      category: template.category,
      actions: template.defaultActions,
      ...options
    });
  }

  private replaceVariables(template: string, variables: Record<string, any>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value));
    }
    return result;
  }

  private async deliverNotification(notification: PushNotification): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Get user's device tokens
      const userTokens = Array.from(this.deviceTokens.values())
        .filter(token => token.userId === notification.userId && token.isActive);

      if (userTokens.length === 0) {
        throw new Error('No active device tokens found for user');
      }

      // Simulate platform-specific delivery
      const deliveryPromises = userTokens.map(token => 
        this.deliverToPlatform(notification, token)
      );

      await Promise.all(deliveryPromises);

      // Update notification status
      notification.status = 'delivered';
      notification.lastAttempt = new Date();
      notification.deliveryAttempts++;
      
      // Update stats
      this.updateStats('delivered', notification, Date.now() - startTime);

    } catch (error) {
      notification.status = 'failed';
      notification.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      notification.lastAttempt = new Date();
      notification.deliveryAttempts++;
      
      this.updateStats('failed', notification, Date.now() - startTime);
    }

    this.notifications.set(notification.id, notification);
  }

  private async deliverToPlatform(_notification: PushNotification, token: DeviceToken): Promise<void> {
    // Simulate platform-specific delivery
    const deliveryTime = Math.random() * 1000 + 500; // 500-1500ms
    
    await new Promise(resolve => setTimeout(resolve, deliveryTime));

    // Update platform stats
    const platform = token.platform;
    if (!this.stats.platformStats[platform]) {
      this.stats.platformStats[platform] = { sent: 0, delivered: 0, failed: 0, deliveryRate: 0 };
    }
    
    this.stats.platformStats[platform].sent++;
    this.stats.platformStats[platform].delivered++;
    
    // Calculate delivery rate
    const total = this.stats.platformStats[platform].sent;
    const delivered = this.stats.platformStats[platform].delivered;
    this.stats.platformStats[platform].deliveryRate = total > 0 ? (delivered / total) * 100 : 0;
  }

  private updateStats(status: 'delivered' | 'failed' | 'clicked' | 'read', _notification: PushNotification, deliveryTime?: number): void {
    if (status === 'delivered') {
      this.stats.totalDelivered++;
      this.stats.totalSent++;
      if (deliveryTime) {
        this.stats.averageDeliveryTime = (this.stats.averageDeliveryTime + deliveryTime) / 2;
      }
    } else if (status === 'failed') {
      this.stats.totalFailed++;
      this.stats.totalSent++;
    } else if (status === 'clicked') {
      this.stats.totalClicked++;
    } else if (status === 'read') {
      this.stats.totalRead++;
    }

    // Calculate rates
    this.stats.deliveryRate = this.stats.totalSent > 0 ? (this.stats.totalDelivered / this.stats.totalSent) * 100 : 0;
    this.stats.clickRate = this.stats.totalDelivered > 0 ? (this.stats.totalClicked / this.stats.totalDelivered) * 100 : 0;
    this.stats.readRate = this.stats.totalDelivered > 0 ? (this.stats.totalRead / this.stats.totalDelivered) * 100 : 0;
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    const notification = this.notifications.get(notificationId);
    if (!notification) return false;

    notification.readAt = new Date();
    this.notifications.set(notificationId, notification);
    this.updateStats('read', notification);
    return true;
  }

  async markAsClicked(notificationId: string): Promise<boolean> {
    const notification = this.notifications.get(notificationId);
    if (!notification) return false;

    notification.clickedAt = new Date();
    this.notifications.set(notificationId, notification);
    this.updateStats('clicked', notification);
    return true;
  }

  async registerDeviceToken(tokenData: Omit<DeviceToken, 'id' | 'registeredAt' | 'lastUsed'>): Promise<DeviceToken> {
    const deviceToken: DeviceToken = {
      ...tokenData,
      id: `TOKEN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      registeredAt: new Date(),
      lastUsed: new Date()
    };

    this.deviceTokens.set(deviceToken.id, deviceToken);
    return deviceToken;
  }

  async unregisterDeviceToken(tokenId: string): Promise<boolean> {
    const token = this.deviceTokens.get(tokenId);
    if (!token) return false;

    token.isActive = false;
    this.deviceTokens.set(tokenId, token);
    return true;
  }

  async getUserNotifications(userId: string, limit?: number, offset?: number): Promise<PushNotification[]> {
    const notifications = Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (offset) {
      notifications.splice(0, offset);
    }
    
    if (limit) {
      return notifications.slice(0, limit);
    }

    return notifications;
  }

  async getNotification(notificationId: string): Promise<PushNotification | null> {
    return this.notifications.get(notificationId) || null;
  }

  async getStats(): Promise<PushNotificationStats> {
    return { ...this.stats };
  }

  async createCampaign(campaignData: Omit<PushCampaign, 'id' | 'status' | 'stats' | 'createdAt' | 'updatedAt'>): Promise<PushCampaign> {
    const campaign: PushCampaign = {
      ...campaignData,
      id: `CAMPAIGN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'draft',
      stats: {
        totalRecipients: 0,
        sent: 0,
        delivered: 0,
        clicked: 0,
        read: 0,
        failed: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.campaigns.set(campaign.id, campaign);
    return campaign;
  }

  async launchCampaign(campaignId: string): Promise<boolean> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return false;

    campaign.status = 'running';
    campaign.updatedAt = new Date();

    // Calculate recipients
    const recipients = await this.calculateCampaignRecipients(campaign);
    campaign.stats.totalRecipients = recipients.length;

    // Send notifications to all recipients
    const template = this.templates.get(campaign.templateId);
    if (!template) return false;

    for (const userId of recipients) {
      try {
        await this.sendFromTemplate(campaign.templateId, userId, campaign.variables);
        campaign.stats.sent++;
      } catch (error) {
        campaign.stats.failed++;
      }
    }

    campaign.status = 'completed';
    campaign.completedAt = new Date();
    campaign.updatedAt = new Date();

    this.campaigns.set(campaignId, campaign);
    return true;
  }

  private async calculateCampaignRecipients(campaign: PushCampaign): Promise<string[]> {
    // Simple implementation - in real app would use user segmentation
    if (campaign.targetAudience.userIds) {
      return campaign.targetAudience.userIds;
    }

    // For demo, return sample user IDs
    return ['USER001', 'USER002', 'USER003'];
  }

  async getCampaign(campaignId: string): Promise<PushCampaign | null> {
    return this.campaigns.get(campaignId) || null;
  }

  async getAllCampaigns(): Promise<PushCampaign[]> {
    return Array.from(this.campaigns.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

let pushNotificationServiceInstance: PushNotificationService | null = null;

export function getPushNotificationService(): PushNotificationService {
  if (!pushNotificationServiceInstance) {
    pushNotificationServiceInstance = new PushNotificationService();
  }
  return pushNotificationServiceInstance;
}
