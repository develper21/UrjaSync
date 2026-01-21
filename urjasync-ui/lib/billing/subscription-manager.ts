import { Subscription, SubscriptionPlan, SubscriptionStatus, SubscriptionType, BillingCycle, PaymentMethod } from './types';
import { v4 as uuidv4 } from 'uuid';

export class SubscriptionManager {
  private subscriptions: Map<string, Subscription> = new Map();
  private plans: Map<string, SubscriptionPlan> = new Map();
  private paymentSchedules: Map<string, PaymentSchedule> = new Map();

  constructor() {
    this.initializePlans();
  }

  // Subscription Creation
  async createSubscription(userId: string, planId: string, paymentMethod?: PaymentMethod, trialDays?: number): Promise<Subscription> {
    try {
      const plan = this.plans.get(planId);
      if (!plan) {
        throw new Error('Subscription plan not found');
      }

      if (!plan.isActive) {
        throw new Error('Subscription plan is not active');
      }

      const now = new Date();
      const trialEndDate = trialDays ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000) : undefined;
      
      // Calculate billing period
      const billingPeriod = this.calculateBillingPeriod(plan.billingCycle, trialEndDate);
      
      const subscription: Subscription = {
        id: uuidv4(),
        userId,
        planId,
        name: plan.name,
        description: plan.description,
        status: trialEndDate ? 'trial' : 'active',
        type: plan.type,
        billingCycle: plan.billingCycle,
        amount: plan.amount,
        currency: plan.currency,
        features: plan.features.map(feature => ({ ...feature })),
        trialPeriod: trialEndDate ? {
          startDate: now,
          endDate: trialEndDate
        } : undefined,
        currentPeriod: billingPeriod,
        nextBillingDate: billingPeriod.endDate,
        autoRenew: true,
        paymentMethod,
        nextPaymentAt: trialEndDate ? billingPeriod.startDate : new Date(),
        createdAt: now,
        updatedAt: now
      };

      // Store subscription
      this.subscriptions.set(subscription.id, subscription);

      // Create payment schedule
      await this.createPaymentSchedule(subscription);

      return subscription;
    } catch (error) {
      throw new Error(`Failed to create subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Subscription Management
  async updateSubscription(subscriptionId: string, updates: Partial<Subscription>): Promise<Subscription> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.status === 'cancelled') {
      throw new Error('Cannot update cancelled subscription');
    }

    const updatedSubscription = {
      ...subscription,
      ...updates,
      updatedAt: new Date()
    };

    this.subscriptions.set(subscriptionId, updatedSubscription);
    return updatedSubscription;
  }

  async cancelSubscription(subscriptionId: string, _reason?: string, effectiveImmediately: boolean = false): Promise<Subscription> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.status === 'cancelled') {
      throw new Error('Subscription is already cancelled');
    }

    subscription.status = 'cancelled';
    subscription.autoRenew = false;
    subscription.cancelledAt = new Date();
    subscription.updatedAt = new Date();

    if (effectiveImmediately) {
      subscription.currentPeriod.endDate = new Date();
      subscription.nextBillingDate = new Date();
    }

    // Cancel payment schedules
    this.cancelPaymentSchedules(subscriptionId);

    this.subscriptions.set(subscriptionId, subscription);
    return subscription;
  }

  async pauseSubscription(subscriptionId: string, _reason?: string): Promise<Subscription> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.status !== 'active') {
      throw new Error('Only active subscriptions can be paused');
    }

    subscription.status = 'paused';
    subscription.pausedAt = new Date();
    subscription.updatedAt = new Date();

    // Pause payment schedules
    this.pausePaymentSchedules(subscriptionId);

    this.subscriptions.set(subscriptionId, subscription);
    return subscription;
  }

  async resumeSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.status !== 'paused') {
      throw new Error('Only paused subscriptions can be resumed');
    }

    subscription.status = 'active';
    subscription.resumedAt = new Date();
    subscription.updatedAt = new Date();

    // Resume payment schedules
    this.resumePaymentSchedules(subscriptionId);

    this.subscriptions.set(subscriptionId, subscription);
    return subscription;
  }

  async changeSubscriptionPlan(subscriptionId: string, newPlanId: string, prorate: boolean = true): Promise<Subscription> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const newPlan = this.plans.get(newPlanId);
    if (!newPlan) {
      throw new Error('New subscription plan not found');
    }

    if (!newPlan.isActive) {
      throw new Error('New subscription plan is not active');
    }

    const oldPlan = this.plans.get(subscription.planId);
    if (!oldPlan) {
      throw new Error('Current subscription plan not found');
    }

    // Calculate proration if requested
    // let proratedAmount = 0;
    if (prorate) {
      // proratedAmount = this.calculateProration(subscription, oldPlan, newPlan);
    }

    // Update subscription
    subscription.planId = newPlanId;
    subscription.name = newPlan.name;
    subscription.description = newPlan.description;
    subscription.type = newPlan.type;
    subscription.billingCycle = newPlan.billingCycle;
    subscription.amount = newPlan.amount;
    subscription.features = newPlan.features.map(feature => ({ ...feature }));
    subscription.updatedAt = new Date();

    // Recalculate billing period if plan changed
    const newBillingPeriod = this.calculateBillingPeriod(newPlan.billingCycle);
    subscription.currentPeriod = newBillingPeriod;
    subscription.nextBillingDate = newBillingPeriod.endDate;

    // Update payment schedules
    this.updatePaymentSchedules(subscription);

    this.subscriptions.set(subscriptionId, subscription);
    return subscription;
  }

  async processSubscriptionRenewal(subscriptionId: string): Promise<Subscription> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (!subscription.autoRenew) {
      subscription.status = 'expired';
      subscription.updatedAt = new Date();
      this.subscriptions.set(subscriptionId, subscription);
      return subscription;
    }

    // Calculate new billing period
    const newBillingPeriod = this.calculateBillingPeriod(subscription.billingCycle, subscription.currentPeriod.endDate);
    
    subscription.currentPeriod = newBillingPeriod;
    subscription.nextBillingDate = newBillingPeriod.endDate;
    subscription.lastPaymentAt = new Date();
    subscription.nextPaymentAt = newBillingPeriod.startDate;
    subscription.updatedAt = new Date();

    // Update payment schedules
    this.updatePaymentSchedules(subscription);

    this.subscriptions.set(subscriptionId, subscription);
    return subscription;
  }

  // Subscription Retrieval
  getSubscription(subscriptionId: string): Subscription | undefined {
    return this.subscriptions.get(subscriptionId);
  }

  getUserSubscriptions(userId: string, filters?: SubscriptionFilters): Subscription[] {
    const userSubscriptions = Array.from(this.subscriptions.values())
      .filter(subscription => subscription.userId === userId);

    return this.applySubscriptionFilters(userSubscriptions, filters);
  }

  getSubscriptionsByStatus(status: SubscriptionStatus): Subscription[] {
    return Array.from(this.subscriptions.values())
      .filter(subscription => subscription.status === status);
  }

  getSubscriptionsByType(type: SubscriptionType): Subscription[] {
    return Array.from(this.subscriptions.values())
      .filter(subscription => subscription.type === type);
  }

  getSubscriptionsDueForRenewal(daysAhead: number = 7): Subscription[] {
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    
    return Array.from(this.subscriptions.values())
      .filter(subscription => 
        subscription.status === 'active' && 
        subscription.nextBillingDate >= now && 
        subscription.nextBillingDate <= futureDate &&
        subscription.autoRenew
      );
  }

  // Plan Management
  async createPlan(planData: Omit<SubscriptionPlan, 'id'>): Promise<SubscriptionPlan> {
    const plan: SubscriptionPlan = {
      id: uuidv4(),
      ...planData
    };

    this.plans.set(plan.id, plan);
    return plan;
  }

  async updatePlan(planId: string, updates: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const plan = this.plans.get(planId);
    if (!plan) {
      throw new Error('Subscription plan not found');
    }

    const updatedPlan = {
      ...plan,
      ...updates
    };

    this.plans.set(planId, updatedPlan);
    return updatedPlan;
  }

  async deletePlan(planId: string): Promise<boolean> {
    const plan = this.plans.get(planId);
    if (!plan) {
      return false;
    }

    // Check if any active subscriptions use this plan
    const activeSubscriptions = Array.from(this.subscriptions.values())
      .filter(subscription => subscription.planId === planId && subscription.status === 'active');

    if (activeSubscriptions.length > 0) {
      throw new Error('Cannot delete plan with active subscriptions');
    }

    this.plans.delete(planId);
    return true;
  }

  getPlan(planId: string): SubscriptionPlan | undefined {
    return this.plans.get(planId);
  }

  getAllPlans(activeOnly: boolean = false): SubscriptionPlan[] {
    const plans = Array.from(this.plans.values());
    return activeOnly ? plans.filter(plan => plan.isActive) : plans;
  }

  // Subscription Analytics
  getSubscriptionAnalytics(period?: { startDate: Date; endDate: Date }): SubscriptionAnalytics {
    const subscriptions = Array.from(this.subscriptions.values());
    
    const filteredSubscriptions = period 
      ? subscriptions.filter(subscription => subscription.createdAt >= period.startDate && subscription.createdAt <= period.endDate)
      : subscriptions;

    const activeSubscriptions = filteredSubscriptions.filter(subscription => subscription.status === 'active');
    const trialSubscriptions = filteredSubscriptions.filter(subscription => subscription.status === 'trial');
    const cancelledSubscriptions = filteredSubscriptions.filter(subscription => subscription.status === 'cancelled');

    const mrr = this.calculateMRR(activeSubscriptions);
    const arr = mrr * 12;
    const churnRate = this.calculateChurnRate(filteredSubscriptions, period);

    const subscriptionsByType = filteredSubscriptions.reduce((acc, subscription) => {
      acc[subscription.type] = (acc[subscription.type] || 0) + 1;
      return acc;
    }, {} as Record<SubscriptionType, number>);

    const revenueByType = activeSubscriptions.reduce((acc, subscription) => {
      acc[subscription.type] = (acc[subscription.type] || 0) + subscription.amount;
      return acc;
    }, {} as Record<SubscriptionType, number>);

    return {
      totalSubscriptions: filteredSubscriptions.length,
      activeSubscriptions: activeSubscriptions.length,
      trialSubscriptions: trialSubscriptions.length,
      cancelledSubscriptions: cancelledSubscriptions.length,
      mrr,
      arr,
      churnRate,
      averageRevenuePerUser: activeSubscriptions.length > 0 ? mrr / activeSubscriptions.length : 0,
      subscriptionsByType,
      revenueByType
    };
  }

  // Utility Methods
  private initializePlans(): void {
    // Basic Plan
    this.plans.set('basic', {
      id: 'basic',
      name: 'Basic',
      description: 'Essential features for individuals',
      type: 'basic',
      billingCycle: 'monthly',
      amount: 99,
      currency: 'INR',
      features: [
        {
          id: 'basic_energy_monitoring',
          name: 'Energy Monitoring',
          description: 'Basic energy consumption tracking',
          included: true,
          limit: 1
        },
        {
          id: 'basic_reports',
          name: 'Monthly Reports',
          description: 'Basic monthly energy reports',
          included: true,
          limit: 1
        },
        {
          id: 'basic_support',
          name: 'Email Support',
          description: 'Email support during business hours',
          included: true
        }
      ],
      trialDays: 7,
      isActive: true
    });

    // Pro Plan
    this.plans.set('pro', {
      id: 'pro',
      name: 'Pro',
      description: 'Advanced features for power users',
      type: 'pro',
      billingCycle: 'monthly',
      amount: 299,
      currency: 'INR',
      features: [
        {
          id: 'pro_energy_monitoring',
          name: 'Advanced Energy Monitoring',
          description: 'Real-time energy monitoring with analytics',
          included: true,
          limit: 5
        },
        {
          id: 'pro_predictions',
          name: 'AI Predictions',
          description: 'AI-powered energy consumption predictions',
          included: true
        },
        {
          id: 'pro_optimization',
          name: 'Cost Optimization',
          description: 'Automated cost optimization recommendations',
          included: true
        },
        {
          id: 'pro_support',
          name: 'Priority Support',
          description: '24/7 priority support',
          included: true
        }
      ],
      trialDays: 14,
      isActive: true
    });

    // Premium Plan
    this.plans.set('premium', {
      id: 'premium',
      name: 'Premium',
      description: 'Complete solution for businesses',
      type: 'premium',
      billingCycle: 'monthly',
      amount: 999,
      currency: 'INR',
      features: [
        {
          id: 'premium_unlimited_devices',
          name: 'Unlimited Devices',
          description: 'Monitor unlimited devices',
          included: true
        },
        {
          id: 'premium_api_access',
          name: 'API Access',
          description: 'Full API access for integrations',
          included: true
        },
        {
          id: 'premium_custom_reports',
          name: 'Custom Reports',
          description: 'Customizable reports and dashboards',
          included: true
        },
        {
          id: 'premium_dedicated_support',
          name: 'Dedicated Support',
          description: 'Dedicated account manager',
          included: true
        }
      ],
      trialDays: 30,
      setupFee: 500,
      isActive: true
    });
  }

  private calculateBillingPeriod(billingCycle: BillingCycle, startDate?: Date): { startDate: Date; endDate: Date } {
    const start = startDate || new Date();
    const end = new Date(start);

    switch (billingCycle) {
      case 'monthly':
        end.setMonth(end.getMonth() + 1);
        break;
      case 'quarterly':
        end.setMonth(end.getMonth() + 3);
        break;
      case 'semi_annual':
        end.setMonth(end.getMonth() + 6);
        break;
      case 'annual':
        end.setFullYear(end.getFullYear() + 1);
        break;
      default:
        end.setMonth(end.getMonth() + 1);
    }

    return { startDate: start, endDate: end };
  }

  // private calculateProration(subscription: Subscription, oldPlan: SubscriptionPlan, newPlan: SubscriptionPlan): number {
  //   const daysRemaining = Math.ceil((subscription.currentPeriod.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  //   const totalDays = Math.ceil((subscription.currentPeriod.endDate.getTime() - subscription.currentPeriod.startDate.getTime()) / (1000 * 60 * 60 * 24));
  //   
  //   const unusedPortion = (oldPlan.amount * daysRemaining) / totalDays;
  //   const newPortion = (newPlan.amount * daysRemaining) / totalDays;
  //   
  //   return newPortion - unusedPortion;
  // }

  private async createPaymentSchedule(subscription: Subscription): Promise<void> {
    const schedule: PaymentSchedule = {
      id: uuidv4(),
      userId: subscription.userId,
      subscriptionId: subscription.id,
      amount: subscription.amount,
      currency: subscription.currency,
      scheduledDate: subscription.nextPaymentAt || new Date(),
      paymentMethod: subscription.paymentMethod || 'credit_card',
      status: 'scheduled',
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.paymentSchedules.set(schedule.id, schedule);
  }

  private updatePaymentSchedules(subscription: Subscription): void {
    // Remove existing schedules
    const existingSchedules = Array.from(this.paymentSchedules.values())
      .filter(schedule => schedule.subscriptionId === subscription.id);
    
    existingSchedules.forEach(schedule => {
      this.paymentSchedules.delete(schedule.id);
    });

    // Create new schedule
    this.createPaymentSchedule(subscription);
  }

  private cancelPaymentSchedules(subscriptionId: string): void {
    const schedules = Array.from(this.paymentSchedules.values())
      .filter(schedule => schedule.subscriptionId === subscriptionId);
    
    schedules.forEach(schedule => {
      schedule.status = 'cancelled';
      schedule.updatedAt = new Date();
    });
  }

  private pausePaymentSchedules(subscriptionId: string): void {
    const schedules = Array.from(this.paymentSchedules.values())
      .filter(schedule => schedule.subscriptionId === subscriptionId);
    
    schedules.forEach(schedule => {
      schedule.status = 'cancelled';
      schedule.updatedAt = new Date();
    });
  }

  private resumePaymentSchedules(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return;

    // Create new payment schedule
    this.createPaymentSchedule(subscription);
  }

  private calculateMRR(activeSubscriptions: Subscription[]): number {
    return activeSubscriptions.reduce((total, subscription) => {
      const monthlyAmount = this.convertToMonthly(subscription.amount, subscription.billingCycle);
      return total + monthlyAmount;
    }, 0);
  }

  private convertToMonthly(amount: number, billingCycle: BillingCycle): number {
    switch (billingCycle) {
      case 'monthly':
        return amount;
      case 'quarterly':
        return amount / 3;
      case 'semi_annual':
        return amount / 6;
      case 'annual':
        return amount / 12;
      default:
        return amount;
    }
  }

  private calculateChurnRate(subscriptions: Subscription[], period?: { startDate: Date; endDate: Date }): number {
    if (!period) return 0;

    const periodSubscriptions = subscriptions.filter(subscription => 
      subscription.createdAt >= period.startDate && subscription.createdAt <= period.endDate
    );

    const churnedSubscriptions = periodSubscriptions.filter(subscription => 
      subscription.status === 'cancelled' && 
      subscription.cancelledAt && 
      subscription.cancelledAt >= period.startDate && 
      subscription.cancelledAt <= period.endDate
    );

    return periodSubscriptions.length > 0 
      ? (churnedSubscriptions.length / periodSubscriptions.length) * 100 
      : 0;
  }

  private applySubscriptionFilters(subscriptions: Subscription[], filters?: SubscriptionFilters): Subscription[] {
    if (!filters) return subscriptions;

    return subscriptions.filter(subscription => {
      if (filters.status && subscription.status !== filters.status) return false;
      if (filters.type && subscription.type !== filters.type) return false;
      if (filters.billingCycle && subscription.billingCycle !== filters.billingCycle) return false;
      if (filters.minAmount && subscription.amount < filters.minAmount) return false;
      if (filters.maxAmount && subscription.amount > filters.maxAmount) return false;
      if (filters.period) {
        if (subscription.createdAt < filters.period.startDate || subscription.createdAt > filters.period.endDate) return false;
      }
      return true;
    });
  }
}

// Supporting Types
interface PaymentSchedule {
  id: string;
  userId: string;
  subscriptionId?: string;
  billId?: string;
  amount: number;
  currency: string;
  scheduledDate: Date;
  paymentMethod: PaymentMethod;
  status: 'scheduled' | 'processed' | 'failed' | 'cancelled';
  retryCount: number;
  maxRetries: number;
  nextRetryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface SubscriptionFilters {
  status?: SubscriptionStatus;
  type?: SubscriptionType;
  billingCycle?: BillingCycle;
  minAmount?: number;
  maxAmount?: number;
  period?: { startDate: Date; endDate: Date };
}

interface SubscriptionAnalytics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  cancelledSubscriptions: number;
  mrr: number;
  arr: number;
  churnRate: number;
  averageRevenuePerUser: number;
  subscriptionsByType: Record<SubscriptionType, number>;
  revenueByType: Record<SubscriptionType, number>;
}

// Singleton instance
let subscriptionManagerInstance: SubscriptionManager | null = null;

export function getSubscriptionManager(): SubscriptionManager {
  if (!subscriptionManagerInstance) {
    subscriptionManagerInstance = new SubscriptionManager();
  }
  return subscriptionManagerInstance;
}
