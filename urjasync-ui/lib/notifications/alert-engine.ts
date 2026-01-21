export interface Alert {
  id: string;
  source: string; // System or component that generated the alert
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  userId?: string;
  deviceId?: string;
  data?: Record<string, any>;
  metadata?: AlertMetadata;
  status: 'active' | 'acknowledged' | 'resolved' | 'suppressed' | 'expired';
  priority: number; // 1-100, higher = more important
  tags: string[];
  category: string;
  subcategory?: string;
  createdAt: Date;
  updatedAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  expiresAt?: Date;
  lastOccurrence?: Date;
  occurrenceCount: number;
  escalationLevel: number;
  autoResolveTimeout?: number; // minutes
  suppressionRules?: string[];
}

export interface AlertType {
  id: string;
  name: string;
  description: string;
  category: string;
  defaultSeverity: 'low' | 'medium' | 'high' | 'critical';
  defaultPriority: number;
  autoResolve: boolean;
  autoResolveTimeout?: number; // minutes
  escalationRules: EscalationRule[];
  notificationRules: NotificationRule[];
  suppressionRules: SuppressionRule[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertMetadata {
  sourceSystem: string;
  sourceComponent: string;
  environment: 'development' | 'staging' | 'production';
  region?: string;
  version?: string;
  correlationId?: string;
  traceId?: string;
  additionalData?: Record<string, any>;
}

export interface EscalationRule {
  id: string;
  condition: EscalationCondition;
  action: EscalationAction;
  delay: number; // minutes
  isActive: boolean;
}

export interface EscalationCondition {
  field: 'severity' | 'priority' | 'occurrence_count' | 'duration' | 'custom';
  operator: 'equals' | 'greater_than' | 'less_than' | 'not_resolved_for';
  value: any;
}

export interface EscalationAction {
  type: 'increase_severity' | 'notify_manager' | 'create_ticket' | 'send_email' | 'send_sms' | 'webhook';
  parameters: Record<string, any>;
}

export interface NotificationRule {
  id: string;
  condition: NotificationCondition;
  channels: Array<'push' | 'sms' | 'email' | 'webhook'>;
  template?: string;
  delay: number; // minutes
  isActive: boolean;
}

export interface NotificationCondition {
  field: 'severity' | 'priority' | 'category' | 'time_of_day' | 'user_preference';
  operator: 'equals' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface SuppressionRule {
  id: string;
  name: string;
  description: string;
  condition: SuppressionCondition;
  duration: number; // minutes
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SuppressionCondition {
  field: 'source' | 'type' | 'category' | 'title' | 'user_id' | 'device_id' | 'custom';
  operator: 'equals' | 'contains' | 'matches_regex' | 'in';
  value: any;
}

export interface AlertCorrelation {
  id: string;
  name: string;
  description: string;
  conditions: CorrelationCondition[];
  timeWindow: number; // minutes
  minAlerts: number;
  action: CorrelationAction;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CorrelationCondition {
  field: 'source' | 'type' | 'category' | 'severity' | 'user_id' | 'device_id';
  operator: 'equals' | 'in' | 'not_in';
  value: any;
}

export interface CorrelationAction {
  type: 'group' | 'suppress' | 'escalate' | 'create_parent_alert';
  parameters: Record<string, any>;
}

export interface AlertStats {
  totalAlerts: number;
  activeAlerts: number;
  acknowledgedAlerts: number;
  resolvedAlerts: number;
  suppressedAlerts: number;
  expiredAlerts: number;
  averageResolutionTime: number; // minutes
  averageAcknowledgmentTime: number; // minutes
  alertsBySeverity: Record<string, number>;
  alertsByCategory: Record<string, number>;
  alertsBySource: Record<string, number>;
  hourlyStats: HourlyAlertStats[];
  dailyStats: DailyAlertStats[];
  topAlertTypes: AlertTypeStats[];
}

export interface HourlyAlertStats {
  hour: number;
  total: number;
  bySeverity: Record<string, number>;
}

export interface DailyAlertStats {
  date: string;
  total: number;
  resolved: number;
  acknowledged: number;
  averageResolutionTime: number;
}

export interface AlertTypeStats {
  typeId: string;
  typeName: string;
  count: number;
  averageResolutionTime: number;
  lastOccurrence: Date;
}

export class AlertEngine {
  private alerts: Map<string, Alert> = new Map();
  private alertTypes: Map<string, AlertType> = new Map();
  private correlations: Map<string, AlertCorrelation> = new Map();
  private suppressionRules: Map<string, SuppressionRule> = new Map();
  private stats: AlertStats;
  private processingQueue: Alert[] = [];
  private isProcessing = false;

  constructor() {
    this.stats = {
      totalAlerts: 0,
      activeAlerts: 0,
      acknowledgedAlerts: 0,
      resolvedAlerts: 0,
      suppressedAlerts: 0,
      expiredAlerts: 0,
      averageResolutionTime: 0,
      averageAcknowledgmentTime: 0,
      alertsBySeverity: {},
      alertsByCategory: {},
      alertsBySource: {},
      hourlyStats: [],
      dailyStats: [],
      topAlertTypes: []
    };
    this.initializeAlertTypes();
    this.initializeSuppressionRules();
    this.initializeCorrelations();
    this.startProcessing();
  }

  private initializeAlertTypes() {
    const alertTypes: AlertType[] = [
      {
        id: 'DEVICE_OFFLINE',
        name: 'Device Offline',
        description: 'Device has gone offline and is not responding',
        category: 'device',
        defaultSeverity: 'high',
        defaultPriority: 80,
        autoResolve: false,
        escalationRules: [
          {
            id: 'ESC001',
            condition: { field: 'duration', operator: 'not_resolved_for', value: 30 },
            action: { type: 'increase_severity', parameters: { severity: 'critical' } },
            delay: 30,
            isActive: true
          }
        ],
        notificationRules: [
          {
            id: 'NOTIF001',
            condition: { field: 'severity', operator: 'equals', value: 'high' },
            channels: ['push', 'sms'],
            delay: 0,
            isActive: true
          }
        ],
        suppressionRules: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'HIGH_ENERGY_USAGE',
        name: 'High Energy Usage',
        description: 'Energy consumption is above normal threshold',
        category: 'energy',
        defaultSeverity: 'medium',
        defaultPriority: 60,
        autoResolve: true,
        autoResolveTimeout: 60,
        escalationRules: [
          {
            id: 'ESC002',
            condition: { field: 'occurrence_count', operator: 'greater_than', value: 3 },
            action: { type: 'increase_severity', parameters: { severity: 'high' } },
            delay: 15,
            isActive: true
          }
        ],
        notificationRules: [
          {
            id: 'NOTIF002',
            condition: { field: 'severity', operator: 'greater_than', value: 'medium' },
            channels: ['push', 'email'],
            delay: 5,
            isActive: true
          }
        ],
        suppressionRules: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'MAINTENANCE_DUE',
        name: 'Maintenance Due',
        description: 'Scheduled maintenance is due',
        category: 'maintenance',
        defaultSeverity: 'medium',
        defaultPriority: 50,
        autoResolve: false,
        escalationRules: [
          {
            id: 'ESC003',
            condition: { field: 'duration', operator: 'not_resolved_for', value: 1440 }, // 24 hours
            action: { type: 'notify_manager', parameters: {} },
            delay: 1440,
            isActive: true
          }
        ],
        notificationRules: [
          {
            id: 'NOTIF003',
            condition: { field: 'severity', operator: 'equals', value: 'medium' },
            channels: ['push', 'email'],
            delay: 0,
            isActive: true
          }
        ],
        suppressionRules: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'SECURITY_BREACH',
        name: 'Security Breach',
        description: 'Potential security breach detected',
        category: 'security',
        defaultSeverity: 'critical',
        defaultPriority: 100,
        autoResolve: false,
        escalationRules: [
          {
            id: 'ESC004',
            condition: { field: 'duration', operator: 'not_resolved_for', value: 5 },
            action: { type: 'notify_manager', parameters: { urgent: true } },
            delay: 5,
            isActive: true
          }
        ],
        notificationRules: [
          {
            id: 'NOTIF004',
            condition: { field: 'severity', operator: 'equals', value: 'critical' },
            channels: ['push', 'sms', 'email'],
            delay: 0,
            isActive: true
          }
        ],
        suppressionRules: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    alertTypes.forEach(type => {
      this.alertTypes.set(type.id, type);
    });
  }

  private initializeSuppressionRules() {
    const rules: SuppressionRule[] = [
      {
        id: 'SUPP001',
        name: 'Maintenance Window Suppression',
        description: 'Suppress non-critical alerts during maintenance windows',
        condition: { field: 'category', operator: 'in', value: ['device', 'energy'] },
        duration: 240, // 4 hours
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    rules.forEach(rule => {
      this.suppressionRules.set(rule.id, rule);
    });
  }

  private initializeCorrelations() {
    const correlations: AlertCorrelation[] = [
      {
        id: 'CORR001',
        name: 'Multiple Device Failures',
        description: 'Group multiple device failure alerts',
        conditions: [
          { field: 'category', operator: 'equals', value: 'device' },
          { field: 'severity', operator: 'in', value: ['high', 'critical'] }
        ],
        timeWindow: 60, // 1 hour
        minAlerts: 3,
        action: { type: 'group', parameters: { createParent: true } },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    correlations.forEach(correlation => {
      this.correlations.set(correlation.id, correlation);
    });
  }

  private startProcessing(): void {
    setInterval(() => {
      this.processQueue();
      this.checkExpirations();
      this.checkEscalations();
      this.checkCorrelations();
    }, 5000); // Process every 5 seconds
  }

  async createAlert(alertData: Omit<Alert, 'id' | 'status' | 'priority' | 'tags' | 'createdAt' | 'updatedAt' | 'occurrenceCount' | 'escalationLevel'>): Promise<Alert> {
    const alertType = this.alertTypes.get(alertData.type);
    const priority = alertType?.defaultPriority || 50;
    
    const alert: Alert = {
      ...alertData,
      id: `ALERT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'active',
      priority,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      occurrenceCount: 1,
      escalationLevel: 0,
      autoResolveTimeout: alertType?.autoResolveTimeout,
      lastOccurrence: new Date()
    };

    // Check for suppression
    if (this.isSuppressed(alert)) {
      alert.status = 'suppressed';
      this.stats.suppressedAlerts++;
    }

    this.alerts.set(alert.id, alert);
    this.processingQueue.push(alert);
    
    this.updateStats(alert);
    
    return alert;
  }

  private isSuppressed(alert: Alert): boolean {
    for (const rule of Array.from(this.suppressionRules.values())) {
      if (rule.isActive && this.evaluateSuppressionCondition(rule.condition, alert)) {
        return true;
      }
    }
    return false;
  }

  private evaluateSuppressionCondition(condition: SuppressionCondition, alert: Alert): boolean {
    switch (condition.field) {
      case 'source':
        return this.evaluateOperator(alert.source, condition.operator, condition.value);
      case 'type':
        return this.evaluateOperator(alert.type, condition.operator, condition.value);
      case 'category':
        return this.evaluateOperator(alert.category, condition.operator, condition.value);
      case 'title':
        return this.evaluateOperator(alert.title, condition.operator, condition.value);
      default:
        return false;
    }
  }

  private evaluateOperator(fieldValue: any, operator: string, conditionValue: any): boolean {
    switch (operator) {
      case 'equals':
        return fieldValue === conditionValue;
      case 'contains':
        return String(fieldValue).includes(String(conditionValue));
      case 'matches_regex':
        return new RegExp(conditionValue).test(String(fieldValue));
      case 'in':
        return Array.isArray(conditionValue) && conditionValue.includes(fieldValue);
      default:
        return false;
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) return;

    this.isProcessing = true;
    const alertsToProcess = [...this.processingQueue];
    this.processingQueue = [];

    for (const alert of alertsToProcess) {
      await this.processAlert(alert);
    }

    this.isProcessing = false;
  }

  private async processAlert(alert: Alert): Promise<void> {
    if (alert.status === 'suppressed') return;

    // Check for existing similar alerts
    const existingAlert = this.findSimilarAlert(alert);
    if (existingAlert) {
      existingAlert.occurrenceCount++;
      existingAlert.lastOccurrence = new Date();
      existingAlert.updatedAt = new Date();
      this.alerts.set(existingAlert.id, existingAlert);
      return;
    }

    // Send notifications based on alert type rules
    const alertType = this.alertTypes.get(alert.type);
    if (alertType) {
      for (const notificationRule of alertType.notificationRules) {
        if (notificationRule.isActive && this.evaluateNotificationCondition(notificationRule.condition, alert)) {
          // Schedule notification with delay
          setTimeout(() => {
            this.sendNotification(alert, notificationRule);
          }, notificationRule.delay * 60 * 1000);
        }
      }
    }
  }

  private findSimilarAlert(alert: Alert): Alert | null {
    const similarAlerts = Array.from(this.alerts.values()).filter(existing => 
      existing.type === alert.type &&
      existing.userId === alert.userId &&
      existing.deviceId === alert.deviceId &&
      existing.status === 'active' &&
      existing.createdAt.getTime() > Date.now() - 30 * 60 * 1000 // Within last 30 minutes
    );

    return similarAlerts.length > 0 ? similarAlerts[0] : null;
  }

  private evaluateNotificationCondition(condition: NotificationCondition, alert: Alert): boolean {
    switch (condition.field) {
      case 'severity':
        return this.evaluateOperator(alert.severity, condition.operator, condition.value);
      case 'priority':
        return this.evaluateOperator(alert.priority, condition.operator, condition.value);
      case 'category':
        return this.evaluateOperator(alert.category, condition.operator, condition.value);
      default:
        return true;
    }
  }

  private async sendNotification(alert: Alert, notificationRule: NotificationRule): Promise<void> {
    // This would integrate with the notification manager
    console.log(`Sending ${notificationRule.channels.join(', ')} notification for alert ${alert.id}`);
  }

  private async checkExpirations(): Promise<void> {
    const now = new Date();
    
    for (const alert of Array.from(this.alerts.values())) {
      if (alert.status !== 'active') continue;

      // Check auto-resolve timeout
      if (alert.autoResolveTimeout && alert.createdAt.getTime() + alert.autoResolveTimeout * 60 * 1000 < now.getTime()) {
        await this.resolveAlert(alert.id, 'auto_resolved', 'system');
      }

      // Check explicit expiration
      if (alert.expiresAt && alert.expiresAt < now) {
        alert.status = 'expired';
        alert.updatedAt = now;
        this.stats.expiredAlerts++;
        this.alerts.set(alert.id, alert);
      }
    }
  }

  private async checkEscalations(): Promise<void> {
    const now = new Date();
    
    for (const alert of Array.from(this.alerts.values())) {
      if (alert.status !== 'active') continue;

      const alertType = this.alertTypes.get(alert.type);
      if (!alertType) continue;

      for (const escalationRule of alertType.escalationRules) {
        if (!escalationRule.isActive) continue;

        const timeSinceCreation = (now.getTime() - alert.createdAt.getTime()) / (60 * 1000); // minutes
        if (timeSinceCreation >= escalationRule.delay) {
          if (this.evaluateEscalationCondition(escalationRule.condition, alert)) {
            await this.executeEscalation(alert, escalationRule.action);
          }
        }
      }
    }
  }

  private evaluateEscalationCondition(condition: EscalationCondition, alert: Alert): boolean {
    switch (condition.field) {
      case 'severity':
        return this.evaluateOperator(alert.severity, condition.operator, condition.value);
      case 'priority':
        return this.evaluateOperator(alert.priority, condition.operator, condition.value);
      case 'occurrence_count':
        return this.evaluateOperator(alert.occurrenceCount, condition.operator, condition.value);
      case 'duration':
        const duration = (Date.now() - alert.createdAt.getTime()) / (60 * 1000);
        return this.evaluateOperator(duration, condition.operator, condition.value);
      default:
        return false;
    }
  }

  private async executeEscalation(alert: Alert, escalationRule: EscalationAction): Promise<void> {
    switch (escalationRule.type) {
      case 'increase_severity':
        alert.severity = escalationRule.parameters.severity;
        alert.escalationLevel++;
        alert.updatedAt = new Date();
        this.alerts.set(alert.id, alert);
        break;
      case 'notify_manager':
        console.log(`Notifying manager for escalated alert ${alert.id}`);
        break;
      case 'create_ticket':
        console.log(`Creating ticket for escalated alert ${alert.id}`);
        break;
      case 'send_email':
        console.log(`Sending email escalation for alert ${alert.id}`);
        break;
      case 'send_sms':
        console.log(`Sending SMS escalation for alert ${alert.id}`);
        break;
      case 'webhook':
        console.log(`Triggering webhook for escalated alert ${alert.id}`);
        break;
    }
  }

  private async checkCorrelations(): Promise<void> {
    const now = new Date();
    
    for (const correlation of Array.from(this.correlations.values())) {
      if (!correlation.isActive) continue;

      // Get alerts within time window
      const recentAlerts = Array.from(this.alerts.values()).filter(alert =>
        alert.createdAt.getTime() >= now.getTime() - correlation.timeWindow * 60 * 1000 &&
        this.evaluateCorrelationConditions(correlation.conditions, alert)
      );

      if (recentAlerts.length >= correlation.minAlerts) {
        await this.executeCorrelation(correlation, recentAlerts);
      }
    }
  }

  private evaluateCorrelationConditions(conditions: CorrelationCondition[], alert: Alert): boolean {
    return conditions.every(condition => {
      switch (condition.field) {
        case 'source':
          return this.evaluateOperator(alert.source, condition.operator, condition.value);
        case 'type':
          return this.evaluateOperator(alert.type, condition.operator, condition.value);
        case 'category':
          return this.evaluateOperator(alert.category, condition.operator, condition.value);
        case 'severity':
          return this.evaluateOperator(alert.severity, condition.operator, condition.value);
        default:
          return true;
      }
    });
  }

  private async executeCorrelation(correlation: AlertCorrelation, alerts: Alert[]): Promise<void> {
    switch (correlation.action.type) {
      case 'group':
        console.log(`Grouping ${alerts.length} alerts for correlation ${correlation.id}`);
        break;
      case 'suppress':
        alerts.forEach(alert => {
          alert.status = 'suppressed';
          alert.updatedAt = new Date();
          this.alerts.set(alert.id, alert);
        });
        break;
      case 'escalate':
        alerts.forEach(alert => {
          alert.escalationLevel++;
          alert.updatedAt = new Date();
          this.alerts.set(alert.id, alert);
        });
        break;
      case 'create_parent_alert':
        console.log(`Creating parent alert for correlation ${correlation.id}`);
        break;
    }
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<boolean> {
    const alert = this.alerts.get(alertId);
    if (!alert || alert.status !== 'active') return false;

    alert.status = 'acknowledged';
    alert.acknowledgedAt = new Date();
    alert.acknowledgedBy = userId;
    alert.updatedAt = new Date();

    this.stats.acknowledgedAlerts++;
    this.alerts.set(alertId, alert);
    return true;
  }

  async resolveAlert(alertId: string, _resolution: string, resolvedBy: string): Promise<boolean> {
    const alert = this.alerts.get(alertId);
    if (!alert || (alert.status !== 'active' && alert.status !== 'acknowledged')) return false;

    alert.status = 'resolved';
    alert.resolvedAt = new Date();
    alert.resolvedBy = resolvedBy;
    alert.updatedAt = new Date();

    this.stats.resolvedAlerts++;
    this.updateResolutionTime(alert);
    this.alerts.set(alertId, alert);
    return true;
  }

  private updateResolutionTime(alert: Alert): void {
    const resolutionTime = (alert.resolvedAt!.getTime() - alert.createdAt.getTime()) / (60 * 1000);
    this.stats.averageResolutionTime = (this.stats.averageResolutionTime + resolutionTime) / 2;
  }

  private updateStats(alert: Alert): void {
    this.stats.totalAlerts++;
    this.stats.activeAlerts++;

    // Update severity stats
    if (!this.stats.alertsBySeverity[alert.severity]) {
      this.stats.alertsBySeverity[alert.severity] = 0;
    }
    this.stats.alertsBySeverity[alert.severity]++;

    // Update category stats
    if (!this.stats.alertsByCategory[alert.category]) {
      this.stats.alertsByCategory[alert.category] = 0;
    }
    this.stats.alertsByCategory[alert.category]++;

    // Update source stats
    if (!this.stats.alertsBySource[alert.source]) {
      this.stats.alertsBySource[alert.source] = 0;
    }
    this.stats.alertsBySource[alert.source]++;

    this.updateDailyStats(alert);
  }

  private updateDailyStats(_alert: Alert): void {
    const today = new Date().toISOString().split('T')[0];
    let dailyStat = this.stats.dailyStats.find(stat => stat.date === today);
    
    if (!dailyStat) {
      dailyStat = {
        date: today,
        total: 0,
        resolved: 0,
        acknowledged: 0,
        averageResolutionTime: 0
      };
      this.stats.dailyStats.push(dailyStat);
    }
    
    dailyStat.total++;
  }

  async getAlert(alertId: string): Promise<Alert | null> {
    return this.alerts.get(alertId) || null;
  }

  async getAlerts(filters?: {
    userId?: string;
    deviceId?: string;
    severity?: string;
    status?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<Alert[]> {
    let alerts = Array.from(this.alerts.values());

    if (filters) {
      if (filters.userId) {
        alerts = alerts.filter(alert => alert.userId === filters.userId);
      }
      if (filters.deviceId) {
        alerts = alerts.filter(alert => alert.deviceId === filters.deviceId);
      }
      if (filters.severity) {
        alerts = alerts.filter(alert => alert.severity === filters.severity);
      }
      if (filters.status) {
        alerts = alerts.filter(alert => alert.status === filters.status);
      }
      if (filters.category) {
        alerts = alerts.filter(alert => alert.category === filters.category);
      }
    }

    alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (filters?.offset) {
      alerts.splice(0, filters.offset);
    }
    
    if (filters?.limit) {
      return alerts.slice(0, filters.limit);
    }

    return alerts;
  }

  async getStats(): Promise<AlertStats> {
    // Recalculate current counts
    this.stats.activeAlerts = Array.from(this.alerts.values()).filter(a => a.status === 'active').length;
    this.stats.acknowledgedAlerts = Array.from(this.alerts.values()).filter(a => a.status === 'acknowledged').length;
    this.stats.resolvedAlerts = Array.from(this.alerts.values()).filter(a => a.status === 'resolved').length;
    this.stats.suppressedAlerts = Array.from(this.alerts.values()).filter(a => a.status === 'suppressed').length;
    this.stats.expiredAlerts = Array.from(this.alerts.values()).filter(a => a.status === 'expired').length;

    return { ...this.stats };
  }

  // Rule management methods
  async createRule(ruleData: any): Promise<any> {
    const rule = {
      id: `rule_${Date.now()}_${Math.random().toString(16).substr(2, 8)}`,
      ...ruleData,
      createdAt: new Date(),
      updatedAt: new Date(),
      active: true
    };

    // In a real implementation, this would store the rule
    console.log(`Created alert rule: ${rule.id}`);
    return rule;
  }

  async updateRule(ruleId: string, updates: any): Promise<any> {
    const rule = {
      id: ruleId,
      ...updates,
      updatedAt: new Date()
    };

    // In a real implementation, this would update the stored rule
    console.log(`Updated alert rule: ${ruleId}`);
    return rule;
  }

  async deleteRule(ruleId: string): Promise<boolean> {
    // In a real implementation, this would delete the stored rule
    console.log(`Deleted alert rule: ${ruleId}`);
    return true;
  }
}

let alertEngineInstance: AlertEngine | null = null;

export function getAlertEngine(): AlertEngine {
  if (!alertEngineInstance) {
    alertEngineInstance = new AlertEngine();
  }
  return alertEngineInstance;
}
