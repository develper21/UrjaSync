export interface NotificationPreferences {
  userId: string;
  channels: ChannelPreferences;
  categories: CategoryPreferences;
  quietHours: QuietHours;
  frequency: FrequencyPreferences;
  privacy: PrivacyPreferences;
  accessibility: AccessibilityPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChannelPreferences {
  push: PushChannelPreferences;
  sms: SMSChannelPreferences;
  email: EmailChannelPreferences;
  inApp: InAppChannelPreferences;
}

export interface PushChannelPreferences {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  badge: boolean;
  led: boolean;
  priority: 'all' | 'high' | 'urgent_only';
  quietHoursOverride: boolean;
  categories: Record<string, CategoryChannelPreferences>;
}

export interface SMSChannelPreferences {
  enabled: boolean;
  international: boolean;
  marketing: boolean;
  dailyLimit: number;
  quietHoursOverride: boolean;
  categories: Record<string, CategoryChannelPreferences>;
}

export interface EmailChannelPreferences {
  enabled: boolean;
  digest: boolean;
  digestFrequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  marketing: boolean;
  quietHoursOverride: boolean;
  categories: Record<string, CategoryChannelPreferences>;
}

export interface InAppChannelPreferences {
  enabled: boolean;
  autoDismiss: boolean;
  maxVisible: number;
  categories: Record<string, CategoryChannelPreferences>;
}

export interface CategoryChannelPreferences {
  enabled: boolean;
  priority: 'all' | 'high' | 'urgent_only';
  sound?: string;
  vibration?: boolean;
}

export interface CategoryPreferences {
  default: DefaultCategoryPreferences;
  device_alert: DeviceAlertPreferences;
  maintenance: MaintenancePreferences;
  billing: BillingPreferences;
  energy_tips: EnergyTipsPreferences;
  security: SecurityPreferences;
  system: SystemPreferences;
  marketing: MarketingPreferences;
}

export interface DefaultCategoryPreferences {
  push: CategoryChannelPreferences;
  sms: CategoryChannelPreferences;
  email: CategoryChannelPreferences;
  inApp: CategoryChannelPreferences;
}

export interface DeviceAlertPreferences extends DefaultCategoryPreferences {
  criticalOnly: boolean;
  offlineAlerts: boolean;
  performanceAlerts: boolean;
  thresholdAlerts: boolean;
}

export interface MaintenancePreferences extends DefaultCategoryPreferences {
  reminders: number; // days before
  confirmation: boolean;
  completion: boolean;
  rescheduling: boolean;
}

export interface BillingPreferences extends DefaultCategoryPreferences {
  newBill: boolean;
  paymentDue: boolean;
  paymentFailed: boolean;
  paymentSuccess: boolean;
  usageAlerts: boolean;
}

export interface EnergyTipsPreferences extends DefaultCategoryPreferences {
  frequency: 'daily' | 'weekly' | 'monthly';
  personalized: boolean;
  savingsAlerts: boolean;
}

export interface SecurityPreferences extends DefaultCategoryPreferences {
  loginAlerts: boolean;
  passwordChange: boolean;
  suspiciousActivity: boolean;
  dataAccess: boolean;
}

export interface SystemPreferences extends DefaultCategoryPreferences {
  updates: boolean;
  maintenanceWindow: boolean;
  outages: boolean;
  featureAnnouncements: boolean;
}

export interface MarketingPreferences extends DefaultCategoryPreferences {
  promotions: boolean;
  newsletters: boolean;
  productUpdates: boolean;
  surveys: boolean;
  events: boolean;
}

export interface QuietHours {
  enabled: boolean;
  timezone: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  days: number[]; // 0-6 (Sunday-Saturday)
  exceptions: QuietHoursException[];
  emergencyOverride: boolean;
}

export interface QuietHoursException {
  date: string;
  reason: string;
  allowAll: boolean;
  allowedCategories?: string[];
}

export interface FrequencyPreferences {
  maxPerHour: number;
  maxPerDay: number;
  cooldownPeriod: number; // minutes between similar notifications
  batchSimilar: boolean;
  batchWindow: number; // minutes
}

export interface PrivacyPreferences {
  analytics: boolean;
  personalization: boolean;
  locationSharing: boolean;
  dataProcessing: boolean;
  thirdPartySharing: boolean;
  retentionPeriod: number; // days
}

export interface AccessibilityPreferences {
  largeText: boolean;
  highContrast: boolean;
  screenReader: boolean;
  soundAlerts: boolean;
  visualAlerts: boolean;
  hapticFeedback: boolean;
  reducedMotion: boolean;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  channels: string[];
  variables: TemplateVariable[];
  defaultContent: Record<string, string>;
  customizable: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'url';
  required: boolean;
  defaultValue?: any;
  description?: string;
  validation?: ValidationRule;
}

export interface ValidationRule {
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
}

export class NotificationPreferencesService {
  private preferences: Map<string, NotificationPreferences> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();

  constructor() {
    this.initializeDefaultPreferences();
    this.initializeTemplates();
  }

  private initializeDefaultPreferences() {
    const defaultPreferences: NotificationPreferences = {
      userId: 'DEFAULT',
      channels: {
        push: {
          enabled: true,
          sound: true,
          vibration: true,
          badge: true,
          led: true,
          priority: 'all',
          quietHoursOverride: false,
          categories: {}
        },
        sms: {
          enabled: true,
          international: false,
          marketing: false,
          dailyLimit: 10,
          quietHoursOverride: false,
          categories: {}
        },
        email: {
          enabled: true,
          digest: false,
          digestFrequency: 'daily',
          marketing: false,
          quietHoursOverride: false,
          categories: {}
        },
        inApp: {
          enabled: true,
          autoDismiss: false,
          maxVisible: 5,
          categories: {}
        }
      },
      categories: {
        default: {
          push: { enabled: true, priority: 'all' },
          sms: { enabled: true, priority: 'high' },
          email: { enabled: true, priority: 'all' },
          inApp: { enabled: true, priority: 'all' }
        },
        device_alert: {
          push: { enabled: true, priority: 'all', sound: 'alert.wav', vibration: true },
          sms: { enabled: true, priority: 'urgent_only' },
          email: { enabled: true, priority: 'high' },
          inApp: { enabled: true, priority: 'all' },
          criticalOnly: false,
          offlineAlerts: true,
          performanceAlerts: true,
          thresholdAlerts: true
        },
        maintenance: {
          push: { enabled: true, priority: 'high' },
          sms: { enabled: true, priority: 'high' },
          email: { enabled: true, priority: 'all' },
          inApp: { enabled: true, priority: 'all' },
          reminders: 7,
          confirmation: true,
          completion: true,
          rescheduling: true
        },
        billing: {
          push: { enabled: true, priority: 'high' },
          sms: { enabled: false, priority: 'urgent_only' },
          email: { enabled: true, priority: 'all' },
          inApp: { enabled: true, priority: 'all' },
          newBill: true,
          paymentDue: true,
          paymentFailed: true,
          paymentSuccess: true,
          usageAlerts: true
        },
        energy_tips: {
          push: { enabled: true, priority: 'all' },
          sms: { enabled: false, priority: 'urgent_only' },
          email: { enabled: true, priority: 'all' },
          inApp: { enabled: true, priority: 'all' },
          frequency: 'weekly',
          personalized: true,
          savingsAlerts: true
        },
        security: {
          push: { enabled: true, priority: 'urgent_only' },
          sms: { enabled: true, priority: 'urgent_only' },
          email: { enabled: true, priority: 'high' },
          inApp: { enabled: true, priority: 'urgent_only' },
          loginAlerts: true,
          passwordChange: true,
          suspiciousActivity: true,
          dataAccess: true
        },
        system: {
          push: { enabled: true, priority: 'all' },
          sms: { enabled: false, priority: 'urgent_only' },
          email: { enabled: true, priority: 'all' },
          inApp: { enabled: true, priority: 'all' },
          updates: true,
          maintenanceWindow: true,
          outages: true,
          featureAnnouncements: true
        },
        marketing: {
          push: { enabled: false, priority: 'high' },
          sms: { enabled: false, priority: 'urgent_only' },
          email: { enabled: false, priority: 'high' },
          inApp: { enabled: false, priority: 'high' },
          promotions: false,
          newsletters: false,
          productUpdates: false,
          surveys: false,
          events: false
        }
      },
      quietHours: {
        enabled: true,
        timezone: 'UTC',
        startTime: '22:00',
        endTime: '08:00',
        days: [1, 2, 3, 4, 5], // Monday-Friday
        exceptions: [],
        emergencyOverride: true
      },
      frequency: {
        maxPerHour: 10,
        maxPerDay: 50,
        cooldownPeriod: 5,
        batchSimilar: true,
        batchWindow: 15
      },
      privacy: {
        analytics: true,
        personalization: true,
        locationSharing: false,
        dataProcessing: true,
        thirdPartySharing: false,
        retentionPeriod: 90
      },
      accessibility: {
        largeText: false,
        highContrast: false,
        screenReader: false,
        soundAlerts: true,
        visualAlerts: true,
        hapticFeedback: true,
        reducedMotion: false
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.preferences.set(defaultPreferences.userId, defaultPreferences);
  }

  private initializeTemplates() {
    const templates: NotificationTemplate[] = [
      {
        id: 'TEMPLATE001',
        name: 'Device Alert',
        description: 'Alert for device issues',
        category: 'device_alert',
        channels: ['push', 'sms', 'email'],
        variables: [
          { name: 'deviceName', type: 'string', required: true, description: 'Name of the device' },
          { name: 'alertType', type: 'string', required: true, description: 'Type of alert' },
          { name: 'message', type: 'string', required: true, description: 'Alert message' }
        ],
        defaultContent: {
          push: '🚨 {{deviceName}}: {{alertType}} - {{message}}',
          sms: 'UrjaSync Alert: {{deviceName}} {{alertType}}: {{message}}',
          email: '<h2>Device Alert</h2><p>{{deviceName}}: {{alertType}}</p><p>{{message}}</p>',
          inApp: '{{deviceName}}: {{alertType}} - {{message}}'
        },
        customizable: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    let preferences = this.preferences.get(userId);
    
    if (!preferences) {
      // Create default preferences for new user
      preferences = this.createDefaultUserPreferences(userId);
      this.preferences.set(userId, preferences);
    }
    
    return preferences;
  }

  private createDefaultUserPreferences(userId: string): NotificationPreferences {
    const defaultPrefs = this.preferences.get('DEFAULT')!;
    return {
      ...defaultPrefs,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async updatePreferences(userId: string, updates: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const currentPreferences = await this.getUserPreferences(userId);
    
    const updatedPreferences: NotificationPreferences = {
      ...currentPreferences,
      ...updates,
      updatedAt: new Date()
    };

    // Deep merge nested objects
    if (updates.channels) {
      updatedPreferences.channels = {
        ...currentPreferences.channels,
        ...updates.channels
      };
    }

    if (updates.categories) {
      updatedPreferences.categories = {
        ...currentPreferences.categories,
        ...updates.categories
      };
    }

    this.preferences.set(userId, updatedPreferences);
    return updatedPreferences;
  }

  async updateChannelPreferences(userId: string, channel: keyof ChannelPreferences, updates: any): Promise<NotificationPreferences> {
    const preferences = await this.getUserPreferences(userId);
    
    preferences.channels[channel] = {
      ...preferences.channels[channel],
      ...updates
    };
    
    preferences.updatedAt = new Date();
    this.preferences.set(userId, preferences);
    return preferences;
  }

  async updateCategoryPreferences(userId: string, category: keyof CategoryPreferences, updates: any): Promise<NotificationPreferences> {
    const preferences = await this.getUserPreferences(userId);
    
    preferences.categories[category] = {
      ...preferences.categories[category],
      ...updates
    };
    
    preferences.updatedAt = new Date();
    this.preferences.set(userId, preferences);
    return preferences;
  }

  async updateQuietHours(userId: string, quietHours: Partial<QuietHours>): Promise<NotificationPreferences> {
    const preferences = await this.getUserPreferences(userId);
    
    preferences.quietHours = {
      ...preferences.quietHours,
      ...quietHours
    };
    
    preferences.updatedAt = new Date();
    this.preferences.set(userId, preferences);
    return preferences;
  }

  async isQuietHours(userId: string): Promise<boolean> {
    const preferences = await this.getUserPreferences(userId);
    
    if (!preferences.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const userTime = this.convertToUserTimezone(now, preferences.quietHours.timezone);
    
    // Check if current time is within quiet hours
    const currentTime = userTime.getHours() * 60 + userTime.getMinutes();
    const startTime = this.parseTime(preferences.quietHours.startTime);
    const endTime = this.parseTime(preferences.quietHours.endTime);
    
    const dayOfWeek = userTime.getDay();
    const isQuietDay = preferences.quietHours.days.includes(dayOfWeek);
    
    if (!isQuietDay) {
      return false;
    }

    // Check for exceptions
    const today = userTime.toISOString().split('T')[0];
    const hasException = preferences.quietHours.exceptions.some(exception => 
      exception.date === today && exception.allowAll
    );

    if (hasException) {
      return false;
    }

    // Handle overnight quiet hours
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  private convertToUserTimezone(date: Date, timezone: string): Date {
    // Simple timezone conversion - in real app would use proper timezone library
    return new Date(date.toLocaleString("en-US", { timeZone: timezone }));
  }

  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  async shouldSendNotification(userId: string, category: string, channel: string, priority: string): Promise<boolean> {
    const preferences = await this.getUserPreferences(userId);
    const isQuiet = await this.isQuietHours(userId);
    
    // Check if channel is enabled
    const channelEnabled = preferences.channels[channel as keyof ChannelPreferences]?.enabled;
    if (!channelEnabled) {
      return false;
    }

    // Check category preferences
    const categoryPrefs = preferences.categories[category as keyof CategoryPreferences] || preferences.categories.default;
    const categoryChannelPrefs = categoryPrefs[channel as keyof DefaultCategoryPreferences];
    
    if (!categoryChannelPrefs?.enabled) {
      return false;
    }

    // Check priority filter
    if (categoryChannelPrefs.priority !== 'all') {
      if (categoryChannelPrefs.priority === 'urgent_only' && priority !== 'urgent') {
        return false;
      }
      if (categoryChannelPrefs.priority === 'high' && !['urgent', 'high'].includes(priority)) {
        return false;
      }
    }

    // Check quiet hours
    if (isQuiet) {
      const channelPrefs = preferences.channels[channel as keyof ChannelPreferences];
      if ((channelPrefs as any)?.quietHoursOverride === false) {
        return false;
      }
      
      // Emergency override
      if (preferences.quietHours.emergencyOverride && priority === 'urgent') {
        return true;
      }
      
      return false;
    }

    return true;
  }

  async getTemplate(templateId: string): Promise<NotificationTemplate | null> {
    return this.templates.get(templateId) || null;
  }

  async getAllTemplates(): Promise<NotificationTemplate[]> {
    return Array.from(this.templates.values());
  }

  async createTemplate(templateData: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotificationTemplate> {
    const template: NotificationTemplate = {
      ...templateData,
      id: `TEMPLATE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.templates.set(template.id, template);
    return template;
  }

  async updateTemplate(templateId: string, updates: Partial<NotificationTemplate>): Promise<NotificationTemplate | null> {
    const template = this.templates.get(templateId);
    if (!template) return null;

    const updatedTemplate = {
      ...template,
      ...updates,
      updatedAt: new Date()
    };

    this.templates.set(templateId, updatedTemplate);
    return updatedTemplate;
  }

  async deleteTemplate(templateId: string): Promise<boolean> {
    return this.templates.delete(templateId);
  }

  async resetToDefaults(userId: string): Promise<NotificationPreferences> {
    const defaultPreferences = this.createDefaultUserPreferences(userId);
    this.preferences.set(userId, defaultPreferences);
    return defaultPreferences;
  }

  async exportPreferences(userId: string): Promise<string> {
    const preferences = await this.getUserPreferences(userId);
    return JSON.stringify(preferences, null, 2);
  }

  async importPreferences(userId: string, preferencesJson: string): Promise<NotificationPreferences> {
    try {
      const importedPrefs = JSON.parse(preferencesJson);
      const validatedPrefs = this.validatePreferences(importedPrefs);
      
      const preferences: NotificationPreferences = {
        ...validatedPrefs,
        userId,
        updatedAt: new Date()
      };

      this.preferences.set(userId, preferences);
      return preferences;
    } catch (error) {
      throw new Error('Invalid preferences format');
    }
  }

  private validatePreferences(preferences: any): NotificationPreferences {
    // Validate and sanitize preferences
    // This would include more thorough validation in production
    return preferences as NotificationPreferences;
  }
}

let notificationPreferencesServiceInstance: NotificationPreferencesService | null = null;

export function getNotificationPreferences(): NotificationPreferencesService {
  if (!notificationPreferencesServiceInstance) {
    notificationPreferencesServiceInstance = new NotificationPreferencesService();
  }
  return notificationPreferencesServiceInstance;
}
