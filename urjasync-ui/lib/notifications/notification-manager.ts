import { getPushNotificationService } from './push-notification-service';
import { getSMSService } from './sms-service';
import { getNotificationPreferences, NotificationPreferences } from './notification-preferences';

export interface UnifiedNotification {
  id: string;
  userId: string;
  type: 'push' | 'sms' | 'email' | 'in_app';
  category: 'device_alert' | 'maintenance' | 'billing' | 'energy_tips' | 'security' | 'system' | 'marketing';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  title: string;
  message: string;
  data?: Record<string, any>;
  templateId?: string;
  templateVariables?: Record<string, any>;
  channels: NotificationChannel[];
  scheduledFor?: Date;
  status: 'pending' | 'processing' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  deliveryResults: DeliveryResult[];
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
}

export interface NotificationChannel {
  type: 'push' | 'sms' | 'email' | 'in_app';
  enabled: boolean;
  sent: boolean;
  delivered: boolean;
  failed: boolean;
  messageId?: string;
  error?: string;
  sentAt?: Date;
  deliveredAt?: Date;
}

export interface DeliveryResult {
  channel: 'push' | 'sms' | 'email' | 'in_app';
  status: 'sent' | 'delivered' | 'failed';
  messageId: string;
  timestamp: Date;
  error?: string;
  metadata?: Record<string, any>;
}

export interface NotificationRule {
  id: string;
  userId: string;
  name: string;
  description: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface RuleCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface RuleAction {
  type: 'send_notification' | 'trigger_webhook' | 'update_user' | 'create_task';
  parameters: Record<string, any>;
  delay?: number; // minutes
}

export interface NotificationBatch {
  id: string;
  name: string;
  notifications: UnifiedNotification[];
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  totalNotifications: number;
  processedNotifications: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationAnalytics {
  totalNotifications: number;
  sentNotifications: number;
  deliveredNotifications: number;
  failedNotifications: number;
  readNotifications: number;
  deliveryRate: number;
  readRate: number;
  averageDeliveryTime: number;
  channelStats: Record<string, {
    sent: number;
    delivered: number;
    failed: number;
    deliveryRate: number;
  }>;
  categoryStats: Record<string, {
    sent: number;
    delivered: number;
    failed: number;
    deliveryRate: number;
  }>;
  priorityStats: Record<string, {
    sent: number;
    delivered: number;
    failed: number;
    deliveryRate: number;
  }>;
  hourlyStats: HourlyNotificationStats[];
  dailyStats: DailyNotificationStats[];
}

export interface HourlyNotificationStats {
  hour: number;
  sent: number;
  delivered: number;
  failed: number;
  deliveryRate: number;
}

export interface DailyNotificationStats {
  date: string;
  sent: number;
  delivered: number;
  failed: number;
  deliveryRate: number;
}

export class NotificationManager {
  private notifications: Map<string, UnifiedNotification> = new Map();
  private rules: Map<string, NotificationRule> = new Map();
  private batches: Map<string, NotificationBatch> = new Map();
  private analytics: NotificationAnalytics;
  private pushService = getPushNotificationService();
  private smsService = getSMSService();
  private preferencesService = getNotificationPreferences();

  constructor() {
    this.analytics = {
      totalNotifications: 0,
      sentNotifications: 0,
      deliveredNotifications: 0,
      failedNotifications: 0,
      readNotifications: 0,
      deliveryRate: 0,
      readRate: 0,
      averageDeliveryTime: 0,
      channelStats: {},
      categoryStats: {},
      priorityStats: {},
      hourlyStats: [],
      dailyStats: []
    };
    this.initializeRules();
  }

  private initializeRules() {
    const rules: NotificationRule[] = [
      {
        id: 'RULE001',
        userId: 'SYSTEM',
        name: 'Critical Device Alert',
        description: 'Send immediate notifications for critical device alerts',
        conditions: [
          { field: 'category', operator: 'equals', value: 'device_alert' },
          { field: 'priority', operator: 'equals', value: 'urgent', logicalOperator: 'AND' }
        ],
        actions: [
          { type: 'send_notification', parameters: { channels: ['push', 'sms'], immediate: true } }
        ],
        isActive: true,
        priority: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        triggerCount: 0
      },
      {
        id: 'RULE002',
        userId: 'SYSTEM',
        name: 'Maintenance Reminder',
        description: 'Send maintenance reminders 7 days and 1 day before due date',
        conditions: [
          { field: 'category', operator: 'equals', value: 'maintenance' },
          { field: 'priority', operator: 'in', value: ['normal', 'high'], logicalOperator: 'AND' }
        ],
        actions: [
          { type: 'send_notification', parameters: { channels: ['push', 'email'], delay: 0 } },
          { type: 'send_notification', parameters: { channels: ['sms'], delay: 1440 } } // 1 day before
        ],
        isActive: true,
        priority: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        triggerCount: 0
      }
    ];

    rules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });
  }

  async sendNotification(notificationData: Omit<UnifiedNotification, 'id' | 'status' | 'deliveryResults' | 'createdAt' | 'updatedAt'>): Promise<UnifiedNotification> {
    // Get user preferences
    const preferences = await this.preferencesService.getUserPreferences(notificationData.userId);
    
    // Determine channels based on preferences and category
    const channels = await this.determineChannels(notificationData as UnifiedNotification, preferences);
    
    const notification: UnifiedNotification = {
      ...notificationData,
      id: `NOTIF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      channels: channels.map(channel => ({
        type: channel,
        enabled: true,
        sent: false,
        delivered: false,
        failed: false
      })),
      status: 'pending',
      deliveryResults: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.notifications.set(notification.id, notification);
    
    // Process notification
    await this.processNotification(notification);
    
    return notification;
  }

  async sendFromTemplate(templateId: string, userId: string, variables: Record<string, any>, options?: Partial<UnifiedNotification>): Promise<UnifiedNotification | null> {
    // This would integrate with template service
    // For now, create a basic notification
    return this.sendNotification({
      userId,
      type: 'push',
      category: 'system',
      priority: 'normal',
      title: `Template ${templateId}`,
      message: `Notification from template ${templateId}`,
      data: { templateId, variables },
      templateId,
      templateVariables: variables,
      channels: [{ type: 'push', enabled: true, sent: false, delivered: false, failed: false }],
      ...options
    });
  }

  private async determineChannels(notification: UnifiedNotification, preferences: NotificationPreferences): Promise<Array<'push' | 'sms' | 'email' | 'in_app'>> {
    const channels: Array<'push' | 'sms' | 'email' | 'in_app'> = [];
    
    // Check user preferences for each channel
    const categoryPreferences = preferences.categories[notification.category] || preferences.categories.default;
    
    if (categoryPreferences.push.enabled && preferences.channels.push.enabled) {
      channels.push('push');
    }
    
    if (categoryPreferences.sms.enabled && preferences.channels.sms.enabled) {
      channels.push('sms');
    }
    
    if (categoryPreferences.email.enabled && preferences.channels.email.enabled) {
      channels.push('email');
    }
    
    // Always include in-app notifications
    channels.push('in_app');
    
    return channels;
  }

  private async processNotification(notification: UnifiedNotification): Promise<void> {
    notification.status = 'processing';
    notification.updatedAt = new Date();
    
    const startTime = Date.now();
    const deliveryPromises: Promise<DeliveryResult>[] = [];
    
    // Process each enabled channel
    for (const channel of notification.channels) {
      if (!channel.enabled) continue;
      
      switch (channel.type) {
        case 'push':
          deliveryPromises.push(this.processPushChannel(notification, channel));
          break;
        case 'sms':
          deliveryPromises.push(this.processSMSChannel(notification, channel));
          break;
        case 'email':
          deliveryPromises.push(this.processEmailChannel(notification, channel));
          break;
        case 'in_app':
          deliveryPromises.push(this.processInAppChannel(notification, channel));
          break;
      }
    }
    
    // Wait for all channel deliveries
    const results = await Promise.allSettled(deliveryPromises);
    
    // Process results
    let hasDeliveries = false;
    let hasFailures = false;
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        notification.deliveryResults.push(result.value);
        const channel = notification.channels[index];
        channel.messageId = result.value.messageId;
        channel.sent = true;
        
        if (result.value.status === 'delivered') {
          channel.delivered = true;
          hasDeliveries = true;
        } else if (result.value.status === 'failed') {
          channel.failed = true;
          channel.error = result.value.error;
          hasFailures = true;
        }
      } else {
        const channel = notification.channels[index];
        channel.failed = true;
        channel.error = result.reason instanceof Error ? result.reason.message : 'Unknown error';
        hasFailures = true;
      }
    });
    
    // Update notification status
    notification.sentAt = new Date();
    notification.updatedAt = new Date();
    
    if (hasDeliveries && !hasFailures) {
      notification.status = 'delivered';
      notification.deliveredAt = new Date();
    } else if (hasDeliveries) {
      notification.status = 'delivered'; // Partial delivery
      notification.deliveredAt = new Date();
    } else if (hasFailures) {
      notification.status = 'failed';
    } else {
      notification.status = 'sent';
    }
    
    // Update analytics
    this.updateAnalytics(notification, Date.now() - startTime);
    
    this.notifications.set(notification.id, notification);
    
    // Apply rules
    await this.applyRules(notification);
  }

  private async processPushChannel(notification: UnifiedNotification, _channel: NotificationChannel): Promise<DeliveryResult> {
    try {
      const pushNotification = await this.pushService.sendNotification({
        userId: notification.userId,
        title: notification.title,
        body: notification.message,
        data: notification.data,
        priority: notification.priority as any,
        category: notification.category
      });
      
      return {
        channel: 'push',
        status: pushNotification.status === 'delivered' ? 'delivered' : 'sent',
        messageId: pushNotification.id,
        timestamp: new Date(),
        metadata: { platform: 'push' }
      };
    } catch (error) {
      return {
        channel: 'push',
        status: 'failed',
        messageId: '',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async processSMSChannel(notification: UnifiedNotification, _channel: NotificationChannel): Promise<DeliveryResult> {
    try {
      // Get user phone number (simplified)
      const phoneNumber = '+1234567890'; // Would get from user service
      
      const smsMessage = await this.smsService.sendMessage({
        userId: notification.userId,
        phoneNumber,
        countryCode: 'US',
        message: notification.message,
        type: notification.category === 'billing' ? 'transactional' : 'alert',
        priority: notification.priority === 'urgent' ? 'urgent' : 'normal'
      });
      
      return {
        channel: 'sms',
        status: smsMessage.status === 'delivered' ? 'delivered' : 'sent',
        messageId: smsMessage.id,
        timestamp: new Date(),
        metadata: { provider: smsMessage.provider }
      };
    } catch (error) {
      return {
        channel: 'sms',
        status: 'failed',
        messageId: '',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async processEmailChannel(_notification: UnifiedNotification, _channel: NotificationChannel): Promise<DeliveryResult> {
    // Simulate email delivery
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    return {
      channel: 'email',
      status: 'delivered',
      messageId: `EMAIL_${Date.now()}`,
      timestamp: new Date(),
      metadata: { provider: 'email_service' }
    };
  }

  private async processInAppChannel(_notification: UnifiedNotification, _channel: NotificationChannel): Promise<DeliveryResult> {
    // In-app notifications are always delivered immediately
    return {
      channel: 'in_app',
      status: 'delivered',
      messageId: `INAPP_${Date.now()}`,
      timestamp: new Date(),
      metadata: { type: 'in_app' }
    };
  }

  private async applyRules(notification: UnifiedNotification): Promise<void> {
    const applicableRules = Array.from(this.rules.values())
      .filter(rule => 
        rule.isActive && 
        (rule.userId === 'SYSTEM' || rule.userId === notification.userId)
      )
      .sort((a, b) => a.priority - b.priority);

    for (const rule of applicableRules) {
      if (this.evaluateConditions(rule.conditions, notification)) {
        await this.executeRuleActions(rule, notification);
        
        // Update rule stats
        rule.lastTriggered = new Date();
        rule.triggerCount++;
        this.rules.set(rule.id, rule);
      }
    }
  }

  private evaluateConditions(conditions: RuleCondition[], notification: UnifiedNotification): boolean {
    if (conditions.length === 0) return true;
    
    let result = true;
    let currentOperator: 'AND' | 'OR' = 'AND';
    
    for (const condition of conditions) {
      const conditionResult = this.evaluateCondition(condition, notification);
      
      if (currentOperator === 'AND') {
        result = result && conditionResult;
      } else {
        result = result || conditionResult;
      }
      
      currentOperator = condition.logicalOperator || 'AND';
    }
    
    return result;
  }

  private evaluateCondition(condition: RuleCondition, notification: UnifiedNotification): boolean {
    const fieldValue = this.getFieldValue(notification, condition.field);
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'contains':
        return String(fieldValue).includes(String(condition.value));
      case 'not_contains':
        return !String(fieldValue).includes(String(condition.value));
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
      default:
        return false;
    }
  }

  private getFieldValue(notification: UnifiedNotification, field: string): any {
    switch (field) {
      case 'category':
        return notification.category;
      case 'priority':
        return notification.priority;
      case 'type':
        return notification.type;
      case 'userId':
        return notification.userId;
      default:
        return null;
    }
  }

  private async executeRuleActions(rule: NotificationRule, _notification: UnifiedNotification): Promise<void> {
    for (const action of rule.actions) {
      switch (action.type) {
        case 'send_notification':
          // Would create additional notification based on action parameters
          break;
        case 'trigger_webhook':
          // Would trigger webhook
          break;
        case 'update_user':
          // Would update user preferences or properties
          break;
        case 'create_task':
          // Would create maintenance task or other task
          break;
      }
    }
  }

  private updateAnalytics(notification: UnifiedNotification, deliveryTime: number): void {
    this.analytics.totalNotifications++;
    
    if (notification.status === 'delivered') {
      this.analytics.deliveredNotifications++;
    } else if (notification.status === 'failed') {
      this.analytics.failedNotifications++;
    }
    
    if (notification.sentAt) {
      this.analytics.sentNotifications++;
    }
    
    // Update channel stats
    for (const channel of notification.channels) {
      if (!this.analytics.channelStats[channel.type]) {
        this.analytics.channelStats[channel.type] = { sent: 0, delivered: 0, failed: 0, deliveryRate: 0 };
      }
      
      const channelStats = this.analytics.channelStats[channel.type];
      if (channel.sent) channelStats.sent++;
      if (channel.delivered) channelStats.delivered++;
      if (channel.failed) channelStats.failed++;
      
      channelStats.deliveryRate = channelStats.sent > 0 ? (channelStats.delivered / channelStats.sent) * 100 : 0;
    }
    
    // Update category stats
    if (!this.analytics.categoryStats[notification.category]) {
      this.analytics.categoryStats[notification.category] = { sent: 0, delivered: 0, failed: 0, deliveryRate: 0 };
    }
    
    const categoryStats = this.analytics.categoryStats[notification.category];
    categoryStats.sent++;
    if (notification.status === 'delivered') categoryStats.delivered++;
    if (notification.status === 'failed') categoryStats.failed++;
    
    categoryStats.deliveryRate = categoryStats.sent > 0 ? (categoryStats.delivered / categoryStats.sent) * 100 : 0;
    
    // Update priority stats
    if (!this.analytics.priorityStats[notification.priority]) {
      this.analytics.priorityStats[notification.priority] = { sent: 0, delivered: 0, failed: 0, deliveryRate: 0 };
    }
    
    const priorityStats = this.analytics.priorityStats[notification.priority];
    priorityStats.sent++;
    if (notification.status === 'delivered') priorityStats.delivered++;
    if (notification.status === 'failed') priorityStats.failed++;
    
    priorityStats.deliveryRate = priorityStats.sent > 0 ? (priorityStats.delivered / priorityStats.sent) * 100 : 0;
    
    // Calculate overall rates
    this.analytics.deliveryRate = this.analytics.sentNotifications > 0 
      ? (this.analytics.deliveredNotifications / this.analytics.sentNotifications) * 100 
      : 0;
    
    this.analytics.averageDeliveryTime = (this.analytics.averageDeliveryTime + deliveryTime) / 2;
    
    // Update daily stats
    this.updateDailyStats(notification);
  }

  private updateDailyStats(notification: UnifiedNotification): void {
    const today = new Date().toISOString().split('T')[0];
    let dailyStat = this.analytics.dailyStats.find(stat => stat.date === today);
    
    if (!dailyStat) {
      dailyStat = {
        date: today,
        sent: 0,
        delivered: 0,
        failed: 0,
        deliveryRate: 0
      };
      this.analytics.dailyStats.push(dailyStat);
    }
    
    dailyStat.sent++;
    if (notification.status === 'delivered') dailyStat.delivered++;
    if (notification.status === 'failed') dailyStat.failed++;
    
    dailyStat.deliveryRate = dailyStat.sent > 0 ? (dailyStat.delivered / dailyStat.sent) * 100 : 0;
  }

  async getNotification(notificationId: string): Promise<UnifiedNotification | null> {
    return this.notifications.get(notificationId) || null;
  }

  async getUserNotifications(userId: string, limit?: number, offset?: number): Promise<UnifiedNotification[]> {
    const notifications = Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (offset) {
      notifications.splice(0, offset);
    }
    
    if (limit) {
      return notifications.slice(0, limit);
    }

    return notifications;
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    const notification = this.notifications.get(notificationId);
    if (!notification) return false;

    notification.readAt = new Date();
    notification.updatedAt = new Date();
    this.notifications.set(notificationId, notification);
    
    this.analytics.readNotifications++;
    this.analytics.readRate = this.analytics.deliveredNotifications > 0 
      ? (this.analytics.readNotifications / this.analytics.deliveredNotifications) * 100 
      : 0;
    
    return true;
  }

  async createBatch(batchData: Omit<NotificationBatch, 'id' | 'status' | 'totalNotifications' | 'processedNotifications' | 'successfulDeliveries' | 'failedDeliveries' | 'createdAt' | 'updatedAt'>): Promise<NotificationBatch> {
    const batch: NotificationBatch = {
      ...batchData,
      id: `BATCH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      totalNotifications: batchData.notifications.length,
      processedNotifications: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.batches.set(batch.id, batch);
    return batch;
  }

  async processBatch(batchId: string): Promise<boolean> {
    const batch = this.batches.get(batchId);
    if (!batch) return false;

    batch.status = 'processing';
    batch.startedAt = new Date();
    batch.updatedAt = new Date();

    for (const notification of batch.notifications) {
      try {
        await this.processNotification(notification);
        batch.processedNotifications++;
        
        if (notification.status === 'delivered') {
          batch.successfulDeliveries++;
        } else {
          batch.failedDeliveries++;
        }
      } catch (error) {
        batch.processedNotifications++;
        batch.failedDeliveries++;
      }
    }

    batch.status = 'completed';
    batch.completedAt = new Date();
    batch.updatedAt = new Date();

    this.batches.set(batchId, batch);
    return true;
  }

  async getAnalytics(): Promise<NotificationAnalytics> {
    return { ...this.analytics };
  }

  async createRule(ruleData: Omit<NotificationRule, 'id' | 'createdAt' | 'updatedAt' | 'triggerCount' | 'lastTriggered'>): Promise<NotificationRule> {
    const rule: NotificationRule = {
      ...ruleData,
      id: `RULE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      triggerCount: 0
    };

    this.rules.set(rule.id, rule);
    return rule;
  }

  async updateRule(ruleId: string, updates: Partial<NotificationRule>): Promise<NotificationRule | null> {
    const rule = this.rules.get(ruleId);
    if (!rule) return null;

    const updatedRule = {
      ...rule,
      ...updates,
      updatedAt: new Date()
    };

    this.rules.set(ruleId, updatedRule);
    return updatedRule;
  }

  async deleteRule(ruleId: string): Promise<boolean> {
    return this.rules.delete(ruleId);
  }

  async getRules(userId?: string): Promise<NotificationRule[]> {
    const rules = Array.from(this.rules.values());
    
    if (userId) {
      return rules.filter(rule => rule.userId === userId || rule.userId === 'SYSTEM');
    }
    
    return rules;
  }
}

let notificationManagerInstance: NotificationManager | null = null;

export function getNotificationManager(): NotificationManager {
  if (!notificationManagerInstance) {
    notificationManagerInstance = new NotificationManager();
  }
  return notificationManagerInstance;
}
