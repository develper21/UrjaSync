import { getTariffIntelligence, RealTimeTariff } from './tariff-intelligence';
import { getDeviceManager } from '../iot/device-manager';

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number; // 1-10
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  schedule: AutomationSchedule;
  createdAt: number;
  lastTriggered?: number;
  triggerCount: number;
  successCount: number;
  failureCount: number;
}

export interface AutomationCondition {
  type: 'tariff_rate' | 'time' | 'device_status' | 'energy_usage' | 'peak_hour' | 'cost_threshold';
  operator: 'equals' | 'greater_than' | 'less_than' | 'between' | 'not_equals';
  value: any;
  deviceId?: string;
  metadata?: Record<string, any>;
}

export interface AutomationAction {
  type: 'device_control' | 'notification' | 'schedule_task' | 'tariff_switch' | 'usage_limit';
  deviceId?: string;
  parameters: Record<string, any>;
  delay?: number; // seconds
}

export interface AutomationSchedule {
  type: 'always' | 'time_based' | 'event_based' | 'recurring';
  schedule?: string; // Cron expression or time range
  activeHours?: { start: string; end: string };
  activeDays?: number[]; // 0-6 (Sunday = 0)
}

export interface AutomationExecution {
  ruleId: string;
  timestamp: number;
  triggerReason: string;
  conditionsMet: AutomationCondition[];
  actionsExecuted: AutomationAction[];
  success: boolean;
  error?: string;
  duration: number; // milliseconds
}

export class AutomationEngine {
  private tariffIntelligence = getTariffIntelligence();
  private deviceManager = getDeviceManager();
  private rules: Map<string, AutomationRule> = new Map();
  private executions: AutomationExecution[] = [];
  private running = false;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    // Peak hour energy saving rule
    this.addRule({
      id: 'peak_hour_saver',
      name: 'Peak Hour Energy Saver',
      description: 'Automatically reduce consumption during peak tariff hours',
      enabled: true,
      priority: 8,
      conditions: [
        {
          type: 'tariff_rate',
          operator: 'greater_than',
          value: 7.0, // ₹/kWh
          metadata: { period_type: 'peak' }
        }
      ],
      actions: [
        {
          type: 'notification',
          parameters: {
            title: 'Peak Hour Active',
            message: 'Current tariff is high. Consider reducing energy usage.',
            priority: 'high'
          }
        },
        {
          type: 'device_control',
          deviceId: 'ac_living_room',
          parameters: {
            action: 'set_temperature',
            temperature: 25
          }
        }
      ],
      schedule: {
        type: 'event_based'
      },
      createdAt: Date.now(),
      triggerCount: 0,
      successCount: 0,
      failureCount: 0
    });

    // Off-peak optimization rule
    this.addRule({
      id: 'off_peak_optimizer',
      name: 'Off-Peak Optimizer',
      description: 'Schedule heavy appliances for off-peak hours',
      enabled: true,
      priority: 7,
      conditions: [
        {
          type: 'tariff_rate',
          operator: 'less_than',
          value: 4.0, // ₹/kWh
          metadata: { period_type: 'off_peak' }
        }
      ],
      actions: [
        {
          type: 'notification',
          parameters: {
            title: 'Off-Peak Hours',
            message: 'Great time to run heavy appliances!',
            priority: 'medium'
          }
        }
      ],
      schedule: {
        type: 'event_based'
      },
      createdAt: Date.now(),
      triggerCount: 0,
      successCount: 0,
      failureCount: 0
    });

    // Cost threshold alert
    this.addRule({
      id: 'cost_threshold_alert',
      name: 'Daily Cost Alert',
      description: 'Alert when daily cost exceeds threshold',
      enabled: true,
      priority: 6,
      conditions: [
        {
          type: 'cost_threshold',
          operator: 'greater_than',
          value: 100, // ₹ per day
          metadata: { period: 'daily' }
        }
      ],
      actions: [
        {
          type: 'notification',
          parameters: {
            title: 'High Daily Cost Alert',
            message: 'Daily energy cost has exceeded ₹100. Consider reducing usage.',
            priority: 'high'
          }
        }
      ],
      schedule: {
        type: 'recurring',
        schedule: '0 */6 * * *' // Every 6 hours
      },
      createdAt: Date.now(),
      triggerCount: 0,
      successCount: 0,
      failureCount: 0
    });
  }

  // Start the automation engine
  start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.checkInterval = setInterval(() => {
      this.checkAndExecuteRules();
    }, 60000); // Check every minute

    console.log('🤖 Automation engine started');
  }

  // Stop the automation engine
  stop(): void {
    this.running = false;
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    console.log('🛑 Automation engine stopped');
  }

  // Check and execute rules
  private async checkAndExecuteRules(): Promise<void> {
    const currentTariff = this.tariffIntelligence.getCurrentTariff();
    const enabledRules = Array.from(this.rules.values()).filter(rule => rule.enabled);

    for (const rule of enabledRules) {
      try {
        if (this.shouldExecuteRule(rule, currentTariff)) {
          await this.executeRule(rule, currentTariff);
        }
      } catch (error) {
        console.error(`Error executing rule ${rule.id}:`, error);
        this.recordExecution(rule, [], [], false, error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }

  // Check if rule should be executed
  private shouldExecuteRule(rule: AutomationRule, currentTariff: RealTimeTariff): boolean {
    // Check schedule
    if (!this.isScheduleActive(rule.schedule)) {
      return false;
    }

    // Check conditions
    return rule.conditions.every(condition => this.evaluateCondition(condition, currentTariff));
  }

  // Check if schedule is active
  private isScheduleActive(schedule: AutomationSchedule): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

    switch (schedule.type) {
      case 'always':
        return true;

      case 'time_based':
        if (schedule.activeHours) {
          const [startHour] = schedule.activeHours.start.split(':').map(Number);
          const [endHour] = schedule.activeHours.end.split(':').map(Number);
          
          if (startHour > endHour) {
            // Overnight schedule (e.g., 22:00 - 06:00)
            return currentHour >= startHour || currentHour < endHour;
          } else {
            return currentHour >= startHour && currentHour < endHour;
          }
        }
        return true;

      case 'recurring':
        if (schedule.activeDays && !schedule.activeDays.includes(currentDay)) {
          return false;
        }
        if (schedule.activeHours) {
          const [startHour] = schedule.activeHours.start.split(':').map(Number);
          const [endHour] = schedule.activeHours.end.split(':').map(Number);
          
          if (startHour > endHour) {
            return currentHour >= startHour || currentHour < endHour;
          } else {
            return currentHour >= startHour && currentHour < endHour;
          }
        }
        return true;

      case 'event_based':
        return true; // Event-based rules are always active

      default:
        return false;
    }
  }

  // Evaluate condition
  private evaluateCondition(condition: AutomationCondition, currentTariff: RealTimeTariff): boolean {
    switch (condition.type) {
      case 'tariff_rate':
        return this.evaluateOperator(currentTariff.currentRate, condition.operator, condition.value);

      case 'peak_hour':
        return this.evaluateOperator(currentTariff.isPeakHour, condition.operator, condition.value);

      case 'time':
        const currentHour = new Date().getHours();
        return this.evaluateOperator(currentHour, condition.operator, condition.value);

      case 'device_status':
        if (condition.deviceId) {
          const device = this.deviceManager.getDevice(condition.deviceId);
          if (device) {
            return this.evaluateOperator(device.online, condition.operator, condition.value);
          }
        }
        return false;

      case 'energy_usage':
        return this.evaluateEnergyUsageCondition(condition);

      case 'cost_threshold':
        return this.evaluateCostThresholdCondition(condition);

      default:
        return false;
    }
  }

  // Evaluate operator
  private evaluateOperator(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'equals':
        return actual === expected;
      case 'not_equals':
        return actual !== expected;
      case 'greater_than':
        return actual > expected;
      case 'less_than':
        return actual < expected;
      case 'between':
        return Array.isArray(expected) && actual >= expected[0] && actual <= expected[1];
      default:
        return false;
    }
  }

  // Execute rule
  private async executeRule(rule: AutomationRule, currentTariff: RealTimeTariff): Promise<void> {
    const startTime = Date.now();
    const conditionsMet = rule.conditions.filter(condition => 
      this.evaluateCondition(condition, currentTariff)
    );

    try {
      const actionsExecuted: AutomationAction[] = [];

      for (const action of rule.actions) {
        if (action.delay && action.delay > 0) {
          setTimeout(() => this.executeAction(action), action.delay * 1000);
        } else {
          await this.executeAction(action);
        }
        actionsExecuted.push(action);
      }

      // Update rule stats
      rule.lastTriggered = startTime;
      rule.triggerCount++;
      rule.successCount++;

      this.recordExecution(rule, conditionsMet, actionsExecuted, true);
      
      console.log(`✅ Rule '${rule.name}' executed successfully`);

    } catch (error) {
      rule.triggerCount++;
      rule.failureCount++;
      throw error;
    }
  }

  // Execute action
  private async executeAction(action: AutomationAction): Promise<void> {
    switch (action.type) {
      case 'device_control':
        if (action.deviceId) {
          await this.deviceManager.controlDevice(
            action.deviceId,
            action.parameters.action,
            action.parameters
          );
        }
        break;

      case 'notification':
        await this.sendNotification(action.parameters);
        break;

      case 'schedule_task':
        await this.scheduleTask(action.parameters);
        break;

      case 'tariff_switch':
        await this.switchTariffPlan(action.parameters);
        break;

      case 'usage_limit':
        await this.setUsageLimit(action.parameters);
        break;

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  // Evaluate energy usage condition
  private evaluateEnergyUsageCondition(condition: AutomationCondition): boolean {
    // Get current energy usage (mock implementation)
    const currentUsage = this.getCurrentEnergyUsage();
    
    if (condition.metadata?.period === 'daily') {
      const dailyUsage = this.getDailyEnergyUsage();
      return this.evaluateOperator(dailyUsage, condition.operator, condition.value);
    } else if (condition.metadata?.period === 'hourly') {
      return this.evaluateOperator(currentUsage, condition.operator, condition.value);
    }
    
    return this.evaluateOperator(currentUsage, condition.operator, condition.value);
  }

  // Evaluate cost threshold condition
  private evaluateCostThresholdCondition(condition: AutomationCondition): boolean {
    const currentCost = this.getCurrentPeriodCost();
    
    if (condition.metadata?.period === 'daily') {
      const dailyCost = this.getDailyEnergyCost();
      return this.evaluateOperator(dailyCost, condition.operator, condition.value);
    }
    
    return this.evaluateOperator(currentCost, condition.operator, condition.value);
  }

  // Get current energy usage
  private getCurrentEnergyUsage(): number {
    // Mock implementation - in real system, would get from energy monitor
    return 1.2 + Math.random() * 0.5; // kWh
  }

  // Get daily energy usage
  private getDailyEnergyUsage(): number {
    // Mock implementation
    const now = new Date();
    
    // Simulate daily usage based on time of day
    const hour = now.getHours();
    let baseUsage = 15; // Base daily usage
    
    if (hour >= 18 && hour <= 22) {
      baseUsage *= 1.3; // Peak evening usage
    } else if (hour >= 6 && hour <= 9) {
      baseUsage *= 1.2; // Morning usage
    }
    
    return baseUsage + (Math.random() * 5);
  }

  // Get current period cost
  private getCurrentPeriodCost(): number {
    const tariff = this.tariffIntelligence.getCurrentTariff();
    const usage = this.getCurrentEnergyUsage();
    return usage * tariff.currentRate;
  }

  // Get daily energy cost
  private getDailyEnergyCost(): number {
    const dailyUsage = this.getDailyEnergyUsage();
    const tariff = this.tariffIntelligence.getCurrentTariff();
    return dailyUsage * tariff.currentRate;
  }

  // Send notification
  private async sendNotification(parameters: any): Promise<void> {
    const { title, message, priority = 'medium', channels = ['console'] } = parameters;
    
    const notification = {
      title,
      message,
      priority,
      timestamp: Date.now(),
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    // Send to different channels
    for (const channel of channels) {
      switch (channel) {
        case 'console':
          console.log(`📢 [${priority.toUpperCase()}] ${title}: ${message}`);
          break;
        case 'push':
          // TODO: Implement push notification
          console.log(`📱 Push notification: ${title}`);
          break;
        case 'email':
          // TODO: Implement email notification
          console.log(`📧 Email notification: ${title}`);
          break;
        case 'sms':
          // TODO: Implement SMS notification
          console.log(`📱 SMS notification: ${title}`);
          break;
      }
    }

    // Store notification for history
    this.storeNotification(notification);
  }

  // Schedule task
  private async scheduleTask(parameters: any): Promise<void> {
    const { task, scheduledTime, deviceId, taskParameters } = parameters;
    
    const scheduledTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      task,
      scheduledTime: scheduledTime || Date.now() + (60 * 60 * 1000), // Default 1 hour
      deviceId,
      parameters: taskParameters || {},
      status: 'scheduled',
      createdAt: Date.now()
    };

    console.log(`📅 Task scheduled: ${task} at ${new Date(scheduledTask.scheduledTime).toLocaleString()}`);
    
    // Store task for execution
    this.storeScheduledTask(scheduledTask);
    
    // Set timeout for task execution
    const delay = scheduledTask.scheduledTime - Date.now();
    if (delay > 0) {
      setTimeout(() => this.executeScheduledTask(scheduledTask.id), delay);
    }
  }

  // Switch tariff plan
  private async switchTariffPlan(parameters: any): Promise<void> {
    const { planId, confirmRequired = true } = parameters;
    
    console.log(`💱 Tariff switch requested: ${planId}`);
    
    if (confirmRequired) {
      // In a real implementation, this would require user confirmation
      console.log('⚠️ User confirmation required for tariff switch');
      return;
    }

    // Get the new plan
    const availablePlans = this.tariffIntelligence.getAvailablePlans();
    const newPlan = availablePlans.find(p => p.id === planId);
    
    if (!newPlan) {
      throw new Error(`Tariff plan ${planId} not found`);
    }

    // Switch the plan
    this.tariffIntelligence.setCurrentTariffPlan(newPlan);
    
    console.log(`✅ Switched to tariff plan: ${newPlan.name}`);
    
    // Send confirmation notification
    await this.sendNotification({
      title: 'Tariff Plan Updated',
      message: `Successfully switched to ${newPlan.name}`,
      priority: 'info'
    });
  }

  // Set usage limit
  private async setUsageLimit(parameters: any): Promise<void> {
    const { limit, period = 'daily', deviceId, action = 'alert' } = parameters;
    
    const usageLimit = {
      id: `limit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      limit,
      period,
      deviceId,
      action,
      createdAt: Date.now(),
      isActive: true
    };

    console.log(`⚡ Usage limit set: ${limit} kWh per ${period}`);
    
    // Store the limit
    this.storeUsageLimit(usageLimit);
    
    // Send confirmation notification
    await this.sendNotification({
      title: 'Usage Limit Set',
      message: `Daily usage limit set to ${limit} kWh`,
      priority: 'info'
    });
  }

  // Execute scheduled task
  private async executeScheduledTask(taskId: string): Promise<void> {
    // TODO: Implement scheduled task execution
    console.log(`⏰ Executing scheduled task: ${taskId}`);
  }

  // Store notification (mock implementation)
  private storeNotification(notification: any): void {
    // In a real implementation, this would store in database
    // For now, just log it
    console.log(`📝 Stored notification: ${notification.id}`);
  }

  // Store scheduled task (mock implementation)
  private storeScheduledTask(task: any): void {
    // In a real implementation, this would store in database
    console.log(`📝 Stored scheduled task: ${task.id}`);
  }

  // Store usage limit (mock implementation)
  private storeUsageLimit(limit: any): void {
    // In a real implementation, this would store in database
    console.log(`📝 Stored usage limit: ${limit.id}`);
  }

  // Record execution
  private recordExecution(
    rule: AutomationRule,
    conditionsMet: AutomationCondition[],
    actionsExecuted: AutomationAction[],
    success: boolean,
    error?: string
  ): void {
    const execution: AutomationExecution = {
      ruleId: rule.id,
      timestamp: Date.now(),
      triggerReason: conditionsMet.map(c => `${c.type} ${c.operator} ${c.value}`).join(', '),
      conditionsMet,
      actionsExecuted,
      success,
      error,
      duration: 0 // TODO: Calculate actual duration
    };

    this.executions.push(execution);

    // Keep only last 1000 executions
    if (this.executions.length > 1000) {
      this.executions = this.executions.slice(-1000);
    }
  }

  // Rule management
  addRule(rule: AutomationRule): void {
    this.rules.set(rule.id, rule);
  }

  removeRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  updateRule(ruleId: string, updates: Partial<AutomationRule>): boolean {
    const rule = this.rules.get(ruleId);
    if (rule) {
      Object.assign(rule, updates);
      return true;
    }
    return false;
  }

  getRule(ruleId: string): AutomationRule | undefined {
    return this.rules.get(ruleId);
  }

  getAllRules(): AutomationRule[] {
    return Array.from(this.rules.values());
  }

  getEnabledRules(): AutomationRule[] {
    return Array.from(this.rules.values()).filter(rule => rule.enabled);
  }

  // Execution history
  getExecutions(ruleId?: string, limit: number = 100): AutomationExecution[] {
    let executions = this.executions;
    
    if (ruleId) {
      executions = executions.filter(e => e.ruleId === ruleId);
    }
    
    return executions.slice(-limit);
  }

  // Statistics
  getStatistics(): {
    totalRules: number;
    enabledRules: number;
    totalExecutions: number;
    successRate: number;
    averageExecutionsPerDay: number;
    topTriggeredRules: Array<{ ruleId: string; ruleName: string; triggerCount: number }>;
  } {
    const rules = Array.from(this.rules.values());
    const totalExecutions = this.executions.length;
    const successfulExecutions = this.executions.filter(e => e.success).length;
    const successRate = totalExecutions > 0 ? successfulExecutions / totalExecutions : 0;

    const topTriggeredRules = rules
      .map(rule => ({
        ruleId: rule.id,
        ruleName: rule.name,
        triggerCount: rule.triggerCount
      }))
      .sort((a, b) => b.triggerCount - a.triggerCount)
      .slice(0, 5);

    // Calculate average executions per day (last 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentExecutions = this.executions.filter(e => e.timestamp > sevenDaysAgo);
    const averageExecutionsPerDay = recentExecutions.length / 7;

    return {
      totalRules: rules.length,
      enabledRules: rules.filter(r => r.enabled).length,
      totalExecutions,
      successRate,
      averageExecutionsPerDay,
      topTriggeredRules
    };
  }

  // Cleanup
  destroy(): void {
    this.stop();
    this.rules.clear();
    this.executions = [];
  }
}

// Singleton instance
let automationEngine: AutomationEngine | null = null;

export function getAutomationEngine(): AutomationEngine {
  if (!automationEngine) {
    automationEngine = new AutomationEngine();
  }
  return automationEngine;
}
