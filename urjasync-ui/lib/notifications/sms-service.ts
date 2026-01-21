export interface SMSMessage {
  id: string;
  userId: string;
  phoneNumber: string;
  countryCode: string;
  message: string;
  senderId?: string;
  type: 'transactional' | 'promotional' | 'alert' | 'verification';
  priority: 'normal' | 'high' | 'urgent';
  scheduledFor?: Date;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  deliveryAttempts: number;
  lastAttempt?: Date;
  errorMessage?: string;
  deliveredAt?: Date;
  readAt?: Date;
  cost: number;
  currency: string;
  provider: string;
  externalId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SMSTemplate {
  id: string;
  name: string;
  content: string;
  variables: TemplateVariable[];
  category: 'alert' | 'verification' | 'marketing' | 'reminder' | 'update';
  type: 'transactional' | 'promotional';
  maxCharacters: number;
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
  maxLength?: number;
}

export interface SMSProvider {
  id: string;
  name: string;
  type: 'twilio' | 'aws-sns' | 'sendgrid' | 'custom';
  config: ProviderConfig;
  capabilities: ProviderCapabilities;
  rates: ProviderRates;
  isActive: boolean;
  priority: number; // Lower number = higher priority
  lastUsed?: Date;
}

export interface ProviderConfig {
  apiKey?: string;
  apiSecret?: string;
  accountSid?: string;
  serviceId?: string;
  region?: string;
  webhookUrl?: string;
  senderIds?: string[];
  customSettings?: Record<string, any>;
}

export interface ProviderCapabilities {
  maxCharacters: number;
  supportsUnicode: boolean;
  supportsMMS: boolean;
  supportsScheduled: boolean;
  supportsDeliveryReports: boolean;
  countries: string[];
  throughput: number; // messages per second
}

export interface ProviderRates {
  domestic: number; // per message
  international: number; // per message
  currency: string;
  billingUnit: 'per_message' | 'per_segment';
  segmentsPerMessage: number;
}

export interface SMSStats {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalCost: number;
  deliveryRate: number;
  averageCost: number;
  averageDeliveryTime: number; // milliseconds
  providerStats: Record<string, {
    sent: number;
    delivered: number;
    failed: number;
    cost: number;
    deliveryRate: number;
  }>;
  typeStats: Record<string, {
    sent: number;
    delivered: number;
    failed: number;
    cost: number;
    deliveryRate: number;
  }>;
  dailyStats: DailySMSStats[];
}

export interface DailySMSStats {
  date: string;
  sent: number;
  delivered: number;
  failed: number;
  cost: number;
  deliveryRate: number;
}

export interface SMSCampaign {
  id: string;
  name: string;
  description: string;
  templateId: string;
  targetAudience: {
    phoneNumbers?: string[];
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
    failed: number;
    cost: number;
  };
  providerId: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface CampaignFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface PhoneNumberValidation {
  phoneNumber: string;
  countryCode: string;
  isValid: boolean;
  type: 'mobile' | 'landline' | 'voip' | 'toll_free';
  carrier?: string;
  region?: string;
  formattedNumber: string;
}

export class SMSService {
  private messages: Map<string, SMSMessage> = new Map();
  private templates: Map<string, SMSTemplate> = new Map();
  private providers: Map<string, SMSProvider> = new Map();
  private campaigns: Map<string, SMSCampaign> = new Map();
  private stats: SMSStats;

  constructor() {
    this.stats = {
      totalSent: 0,
      totalDelivered: 0,
      totalFailed: 0,
      totalCost: 0,
      deliveryRate: 0,
      averageCost: 0,
      averageDeliveryTime: 0,
      providerStats: {},
      typeStats: {},
      dailyStats: []
    };
    this.initializeProviders();
    this.initializeTemplates();
  }

  private initializeProviders() {
    const providers: SMSProvider[] = [
      {
        id: 'PROVIDER001',
        name: 'Twilio',
        type: 'twilio',
        config: {
          accountSid: 'AC_demo_account_sid',
          apiKey: 'demo_api_key',
          serviceId: 'MG_demo_service_id',
          region: 'us-east-1',
          senderIds: ['UrjaSync', '+1234567890']
        },
        capabilities: {
          maxCharacters: 1600,
          supportsUnicode: true,
          supportsMMS: true,
          supportsScheduled: true,
          supportsDeliveryReports: true,
          countries: ['US', 'CA', 'GB', 'AU', 'IN'],
          throughput: 10
        },
        rates: {
          domestic: 0.0079,
          international: 0.0645,
          currency: 'USD',
          billingUnit: 'per_message',
          segmentsPerMessage: 1
        },
        isActive: true,
        priority: 1,
        lastUsed: new Date()
      },
      {
        id: 'PROVIDER002',
        name: 'AWS SNS',
        type: 'aws-sns',
        config: {
          region: 'us-east-1',
          apiKey: 'demo_aws_key',
          apiSecret: 'demo_aws_secret'
        },
        capabilities: {
          maxCharacters: 1600,
          supportsUnicode: true,
          supportsMMS: false,
          supportsScheduled: true,
          supportsDeliveryReports: true,
          countries: ['US', 'CA', 'GB', 'DE', 'FR'],
          throughput: 15
        },
        rates: {
          domestic: 0.00645,
          international: 0.058,
          currency: 'USD',
          billingUnit: 'per_message',
          segmentsPerMessage: 1
        },
        isActive: true,
        priority: 2
      }
    ];

    providers.forEach(provider => {
      this.providers.set(provider.id, provider);
    });
  }

  private initializeTemplates() {
    const templates: SMSTemplate[] = [
      {
        id: 'TEMPLATE001',
        name: 'Device Alert',
        content: '🚨 UrjaSync Alert: Your {{deviceName}} has {{alertType}}. {{message}}. Reply STOP to unsubscribe.',
        variables: [
          { name: 'deviceName', type: 'string', required: true, maxLength: 50 },
          { name: 'alertType', type: 'string', required: true, maxLength: 30 },
          { name: 'message', type: 'string', required: true, maxLength: 100 }
        ],
        category: 'alert',
        type: 'transactional',
        maxCharacters: 160,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'TEMPLATE002',
        name: 'Verification Code',
        content: 'Your UrjaSync verification code is: {{code}}. Valid for {{validityMinutes}} minutes. Do not share this code.',
        variables: [
          { name: 'code', type: 'string', required: true, maxLength: 10 },
          { name: 'validityMinutes', type: 'number', required: true }
        ],
        category: 'verification',
        type: 'transactional',
        maxCharacters: 160,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'TEMPLATE003',
        name: 'Maintenance Reminder',
        content: '🔧 Reminder: Your {{deviceName}} is due for {{maintenanceType}} on {{dueDate}}. Schedule now: {{scheduleUrl}}',
        variables: [
          { name: 'deviceName', type: 'string', required: true, maxLength: 50 },
          { name: 'maintenanceType', type: 'string', required: true, maxLength: 30 },
          { name: 'dueDate', type: 'date', required: true },
          { name: 'scheduleUrl', type: 'string', required: true, maxLength: 100 }
        ],
        category: 'reminder',
        type: 'transactional',
        maxCharacters: 160,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'TEMPLATE004',
        name: 'Energy Bill Alert',
        content: '💡 Your energy bill for {{period}} is ${{amount}}. {{trend}} vs last month. View details: {{billUrl}}',
        variables: [
          { name: 'period', type: 'string', required: true, maxLength: 20 },
          { name: 'amount', type: 'number', required: true },
          { name: 'trend', type: 'string', required: true, maxLength: 20 },
          { name: 'billUrl', type: 'string', required: true, maxLength: 100 }
        ],
        category: 'update',
        type: 'transactional',
        maxCharacters: 160,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  async sendMessage(messageData: Omit<SMSMessage, 'id' | 'status' | 'deliveryAttempts' | 'createdAt' | 'updatedAt' | 'cost' | 'currency' | 'provider'>): Promise<SMSMessage> {
    // Select best provider
    const provider = this.selectBestProvider(messageData.phoneNumber, messageData.type);
    if (!provider) {
      throw new Error('No suitable SMS provider available');
    }

    // Calculate cost
    const cost = this.calculateCost(messageData.phoneNumber, messageData.message, provider);

    const smsMessage: SMSMessage = {
      ...messageData,
      id: `SMS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      deliveryAttempts: 0,
      cost,
      currency: provider.rates.currency,
      provider: provider.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.messages.set(smsMessage.id, smsMessage);
    
    // Simulate sending SMS
    await this.deliverSMS(smsMessage, provider);
    
    return smsMessage;
  }

  async sendFromTemplate(templateId: string, userId: string, phoneNumber: string, variables: Record<string, any>, options?: Partial<SMSMessage>): Promise<SMSMessage | null> {
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
    const content = this.replaceVariables(template.content, variables);

    return this.sendMessage({
      userId,
      phoneNumber,
      countryCode: this.extractCountryCode(phoneNumber),
      message: content,
      type: template.type,
      priority: 'normal',
      metadata: { templateId, variables },
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

  private selectBestProvider(phoneNumber: string, _messageType: string): SMSProvider | null {
    const countryCode = this.extractCountryCode(phoneNumber);
    
    const availableProviders = Array.from(this.providers.values())
      .filter(provider => 
        provider.isActive && 
        provider.capabilities.countries.includes(countryCode)
      )
      .sort((a, b) => a.priority - b.priority);

    return availableProviders[0] || null;
  }

  private extractCountryCode(phoneNumber: string): string {
    // Simple extraction - in real app would use proper phone number parsing
    if (phoneNumber.startsWith('+1')) return 'US';
    if (phoneNumber.startsWith('+44')) return 'GB';
    if (phoneNumber.startsWith('+91')) return 'IN';
    if (phoneNumber.startsWith('+61')) return 'AU';
    return 'US'; // Default
  }

  private calculateCost(phoneNumber: string, message: string, provider: SMSProvider): number {
    const countryCode = this.extractCountryCode(phoneNumber);
    const isDomestic = countryCode === 'US';
    
    let baseCost = isDomestic ? provider.rates.domestic : provider.rates.international;
    
    // Calculate segments (simplified)
    const segments = Math.ceil(message.length / provider.capabilities.maxCharacters);
    
    return baseCost * segments;
  }

  private async deliverSMS(message: SMSMessage, provider: SMSProvider): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Simulate provider-specific delivery
      const deliveryTime = Math.random() * 2000 + 1000; // 1-3 seconds
      
      await new Promise(resolve => setTimeout(resolve, deliveryTime));

      // Update message status
      message.status = 'delivered';
      message.deliveredAt = new Date();
      message.lastAttempt = new Date();
      message.deliveryAttempts++;
      message.externalId = `EXT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Update provider last used
      provider.lastUsed = new Date();
      this.providers.set(provider.id, provider);
      
      // Update stats
      this.updateStats('delivered', message, provider, Date.now() - startTime);

    } catch (error) {
      message.status = 'failed';
      message.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      message.lastAttempt = new Date();
      message.deliveryAttempts++;
      
      this.updateStats('failed', message, provider, Date.now() - startTime);
    }

    this.messages.set(message.id, message);
  }

  private updateStats(status: 'delivered' | 'failed', message: SMSMessage, provider: SMSProvider, deliveryTime?: number): void {
    if (status === 'delivered') {
      this.stats.totalDelivered++;
      this.stats.totalSent++;
      this.stats.totalCost += message.cost;
      
      if (deliveryTime) {
        this.stats.averageDeliveryTime = (this.stats.averageDeliveryTime + deliveryTime) / 2;
      }
    } else if (status === 'failed') {
      this.stats.totalFailed++;
      this.stats.totalSent++;
    }

    // Update provider stats
    if (!this.stats.providerStats[provider.id]) {
      this.stats.providerStats[provider.id] = { sent: 0, delivered: 0, failed: 0, cost: 0, deliveryRate: 0 };
    }
    
    const providerStats = this.stats.providerStats[provider.id];
    providerStats.sent++;
    providerStats.cost += message.cost;
    
    if (status === 'delivered') {
      providerStats.delivered++;
    } else {
      providerStats.failed++;
    }
    
    providerStats.deliveryRate = providerStats.sent > 0 ? (providerStats.delivered / providerStats.sent) * 100 : 0;

    // Update type stats
    if (!this.stats.typeStats[message.type]) {
      this.stats.typeStats[message.type] = { sent: 0, delivered: 0, failed: 0, cost: 0, deliveryRate: 0 };
    }
    
    const typeStats = this.stats.typeStats[message.type];
    typeStats.sent++;
    typeStats.cost += message.cost;
    
    if (status === 'delivered') {
      typeStats.delivered++;
    } else {
      typeStats.failed++;
    }
    
    typeStats.deliveryRate = typeStats.sent > 0 ? (typeStats.delivered / typeStats.sent) * 100 : 0;

    // Calculate overall rates
    this.stats.deliveryRate = this.stats.totalSent > 0 ? (this.stats.totalDelivered / this.stats.totalSent) * 100 : 0;
    this.stats.averageCost = this.stats.totalSent > 0 ? this.stats.totalCost / this.stats.totalSent : 0;

    // Update daily stats
    this.updateDailyStats(status, message);
  }

  private updateDailyStats(status: 'delivered' | 'failed', message: SMSMessage): void {
    const today = new Date().toISOString().split('T')[0];
    let dailyStat = this.stats.dailyStats.find(stat => stat.date === today);
    
    if (!dailyStat) {
      dailyStat = {
        date: today,
        sent: 0,
        delivered: 0,
        failed: 0,
        cost: 0,
        deliveryRate: 0
      };
      this.stats.dailyStats.push(dailyStat);
    }
    
    dailyStat.sent++;
    dailyStat.cost += message.cost;
    
    if (status === 'delivered') {
      dailyStat.delivered++;
    } else {
      dailyStat.failed++;
    }
    
    dailyStat.deliveryRate = dailyStat.sent > 0 ? (dailyStat.delivered / dailyStat.sent) * 100 : 0;
  }

  async validatePhoneNumber(phoneNumber: string): Promise<PhoneNumberValidation> {
    // Simple validation - in real app would use proper phone validation service
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    const isValid = /^\+\d{10,15}$/.test(cleanNumber);
    
    return {
      phoneNumber,
      countryCode: this.extractCountryCode(phoneNumber),
      isValid,
      type: 'mobile',
      carrier: 'Unknown',
      region: 'Unknown',
      formattedNumber: cleanNumber
    };
  }

  async getUserMessages(userId: string, limit?: number, offset?: number): Promise<SMSMessage[]> {
    const messages = Array.from(this.messages.values())
      .filter(message => message.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (offset) {
      messages.splice(0, offset);
    }
    
    if (limit) {
      return messages.slice(0, limit);
    }

    return messages;
  }

  async getMessage(messageId: string): Promise<SMSMessage | null> {
    return this.messages.get(messageId) || null;
  }

  async getStats(): Promise<SMSStats> {
    return { ...this.stats };
  }

  async createCampaign(campaignData: Omit<SMSCampaign, 'id' | 'status' | 'stats' | 'createdAt' | 'updatedAt'>): Promise<SMSCampaign> {
    const campaign: SMSCampaign = {
      ...campaignData,
      id: `CAMPAIGN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'draft',
      stats: {
        totalRecipients: 0,
        sent: 0,
        delivered: 0,
        failed: 0,
        cost: 0
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

    // Send SMS to all recipients
    const template = this.templates.get(campaign.templateId);
    if (!template) return false;

    for (const recipient of recipients) {
      try {
        await this.sendFromTemplate(
          campaign.templateId,
          recipient.userId,
          recipient.phoneNumber,
          campaign.variables
        );
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

  private async calculateCampaignRecipients(campaign: SMSCampaign): Promise<Array<{userId: string, phoneNumber: string}>> {
    // Simple implementation - in real app would use user segmentation
    if (campaign.targetAudience.phoneNumbers) {
      return campaign.targetAudience.phoneNumbers.map(phone => ({
        userId: 'UNKNOWN',
        phoneNumber: phone
      }));
    }

    // For demo, return sample recipients
    return [
      { userId: 'USER001', phoneNumber: '+1234567890' },
      { userId: 'USER002', phoneNumber: '+1987654321' },
      { userId: 'USER003', phoneNumber: '+1555123456' }
    ];
  }

  async getCampaign(campaignId: string): Promise<SMSCampaign | null> {
    return this.campaigns.get(campaignId) || null;
  }

  async getAllCampaigns(): Promise<SMSCampaign[]> {
    return Array.from(this.campaigns.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

let smsServiceInstance: SMSService | null = null;

export function getSMSService(): SMSService {
  if (!smsServiceInstance) {
    smsServiceInstance = new SMSService();
  }
  return smsServiceInstance;
}
