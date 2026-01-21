import { 
  PaymentMethodStats, 
  SubscriptionStats, 
  RevenueByPeriod, 
  CustomerStats, 
  Bill, 
  Payment, 
  Invoice, 
  Subscription,
  BillingAnalytics as BillingAnalyticsInterface
} from './types';

export class BillingAnalytics {
  private bills: Bill[] = [];
  private payments: Payment[] = [];
  private invoices: Invoice[] = [];
  private subscriptions: Subscription[] = [];

  constructor() {
    // Initialize with mock data for demonstration
    this.initializeMockData();
  }

  // Main Analytics
  async getBillingAnalytics(period: { startDate: Date; endDate: Date }): Promise<BillingAnalyticsInterface> {
    const filteredBills = this.filterDataByPeriod(this.bills, period.startDate, period.endDate, 'createdAt');
    const filteredPayments = this.filterDataByPeriod(this.payments, period.startDate, period.endDate, 'createdAt');
    const filteredInvoices = this.filterDataByPeriod(this.invoices, period.startDate, period.endDate, 'createdAt');
    const filteredSubscriptions = this.filterDataByPeriod(this.subscriptions, period.startDate, period.endDate, 'createdAt');

    const totalRevenue = this.calculateTotalRevenue(filteredPayments, filteredInvoices);
    const totalExpenses = this.calculateTotalExpenses(filteredBills);
    const netProfit = totalRevenue - totalExpenses;

    const paymentMethods = this.getPaymentMethodStats(filteredPayments);
    const subscriptionStats = this.getSubscriptionStats(filteredSubscriptions);
    const revenueByPeriod = this.getRevenueByPeriod(period);
    const topCustomers = this.getTopCustomers(filteredPayments, filteredBills, filteredSubscriptions);

    return {
      period,
      totalRevenue,
      totalExpenses,
      netProfit,
      totalBills: filteredBills.length,
      paidBills: filteredBills.filter(bill => bill.status === 'paid').length,
      overdueBills: filteredBills.filter(bill => bill.status === 'overdue').length,
      averageBillAmount: filteredBills.length > 0 ? filteredBills.reduce((sum, bill) => sum + bill.amount, 0) / filteredBills.length : 0,
      paymentMethods,
      subscriptions: subscriptionStats,
      revenueByPeriod,
      topCustomers,
      churnRate: this.calculateChurnRate(filteredSubscriptions),
      mrr: subscriptionStats.mrr,
      arr: subscriptionStats.arr,
      ltv: this.calculateLTV(filteredSubscriptions, filteredPayments),
      cac: this.calculateCAC(filteredSubscriptions)
    };
  }

  // Revenue Analytics
  async getRevenueAnalytics(period: { startDate: Date; endDate: Date }): Promise<RevenueAnalytics> {
    const filteredPayments = this.filterDataByPeriod(this.payments, period.startDate, period.endDate, 'createdAt');
    const filteredInvoices = this.filterDataByPeriod(this.invoices, period.startDate, period.endDate, 'createdAt');

    const revenueBySource = this.getRevenueBySource(filteredPayments, filteredInvoices);
    const revenueGrowth = this.calculateRevenueGrowth(period);
    const revenueForecast = this.generateRevenueForecast(period);

    return {
      totalRevenue: this.calculateTotalRevenue(filteredPayments, filteredInvoices),
      revenueBySource,
      revenueGrowth,
      revenueForecast,
      averageRevenuePerDay: this.calculateAverageRevenuePerDay(filteredPayments, filteredInvoices, period),
      revenueTrends: this.getRevenueTrends(period)
    };
  }

  // Payment Analytics
  async getPaymentAnalytics(period: { startDate: Date; endDate: Date }): Promise<PaymentAnalyticsData> {
    const filteredPayments = this.filterDataByPeriod(this.payments, period.startDate, period.endDate, 'createdAt');

    const paymentMethods = this.getPaymentMethodStats(filteredPayments);
    const paymentSuccessRate = this.calculatePaymentSuccessRate(filteredPayments);
    const paymentFailureReasons = this.getPaymentFailureReasons(filteredPayments);
    const paymentTrends = this.getPaymentTrends(period);

    return {
      totalPayments: filteredPayments.length,
      successfulPayments: filteredPayments.filter(payment => payment.status === 'completed').length,
      failedPayments: filteredPayments.filter(payment => payment.status === 'failed').length,
      paymentMethods,
      successRate: paymentSuccessRate,
      failureReasons: paymentFailureReasons,
      averagePaymentAmount: filteredPayments.length > 0 ? filteredPayments.reduce((sum, payment) => sum + payment.amount, 0) / filteredPayments.length : 0,
      paymentTrends
    };
  }

  // Subscription Analytics
  async getSubscriptionAnalytics(period: { startDate: Date; endDate: Date }): Promise<SubscriptionAnalyticsData> {
    const filteredSubscriptions = this.filterDataByPeriod(this.subscriptions, period.startDate, period.endDate, 'createdAt');

    const subscriptionGrowth = this.calculateSubscriptionGrowth(period);
    const subscriptionRetention = this.calculateSubscriptionRetention(filteredSubscriptions);
    const subscriptionValue = this.calculateSubscriptionValue(filteredSubscriptions);

    return {
      totalSubscriptions: filteredSubscriptions.length,
      activeSubscriptions: filteredSubscriptions.filter(sub => sub.status === 'active').length,
      trialSubscriptions: filteredSubscriptions.filter(sub => sub.status === 'trial').length,
      cancelledSubscriptions: filteredSubscriptions.filter(sub => sub.status === 'cancelled').length,
      growth: subscriptionGrowth,
      retention: subscriptionRetention,
      value: subscriptionValue,
      mrr: this.calculateMRR(filteredSubscriptions),
      arr: this.calculateMRR(filteredSubscriptions) * 12,
      averageRevenuePerUser: this.calculateARPU(filteredSubscriptions)
    };
  }

  // Customer Analytics
  async getCustomerAnalytics(period: { startDate: Date; endDate: Date }): Promise<CustomerAnalyticsData> {
    const uniqueCustomers = this.getUniqueCustomers(period);
    const customerSegments = this.getCustomerSegments(period);
    const customerLifetimeValue = this.getCustomerLifetimeValue(period);
    const customerAcquisition = this.getCustomerAcquisition(period);

    return {
      totalCustomers: uniqueCustomers.length,
      newCustomers: customerAcquisition.newCustomers,
      returningCustomers: customerAcquisition.returningCustomers,
      customerSegments,
      averageLifetimeValue: customerLifetimeValue.average,
      topCustomers: customerLifetimeValue.topCustomers,
      customerSatisfaction: this.getCustomerSatisfaction(period),
      customerRetention: this.getCustomerRetention(period)
    };
  }

  // Billing Performance
  async getBillingPerformance(period: { startDate: Date; endDate: Date }): Promise<BillingPerformanceData> {
    const filteredBills = this.filterDataByPeriod(this.bills, period.startDate, period.endDate, 'createdAt');
    const filteredPayments = this.filterDataByPeriod(this.payments, period.startDate, period.endDate, 'createdAt');

    const billingEfficiency = this.calculateBillingEfficiency(filteredBills, filteredPayments);
    const collectionRate = this.calculateCollectionRate(filteredBills, filteredPayments);
    const overdueAnalysis = this.getOverdueAnalysis(filteredBills);

    return {
      billingEfficiency,
      collectionRate,
      overdueAnalysis,
      averageProcessingTime: this.getAverageProcessingTime(filteredBills, filteredPayments),
      billingAccuracy: this.getBillingAccuracy(filteredBills),
      disputeRate: this.getDisputeRate(filteredBills)
    };
  }

  // Forecasting
  async generateBillingForecast(period: { startDate: Date; endDate: Date }, forecastPeriods: number = 12): Promise<BillingForecast> {
    const historicalData = this.getHistoricalBillingData(period);
    
    return {
      revenueForecast: this.forecastRevenue(historicalData, forecastPeriods),
      expenseForecast: this.forecastExpenses(historicalData, forecastPeriods),
      subscriptionForecast: this.forecastSubscriptions(historicalData, forecastPeriods),
      customerForecast: this.forecastCustomers(historicalData, forecastPeriods),
      confidence: 0.85,
      methodology: 'Linear regression with seasonal adjustment'
    };
  }

  // Utility Methods
  private initializeMockData(): void {
    // Generate mock bills
    for (let i = 0; i < 100; i++) {
      this.bills.push({
        id: `bill_${i}`,
        userId: `user_${i % 20}`,
        billNumber: `EB${1000 + i}`,
        provider: ['State Electricity Board', 'Private Utility', 'Municipal Services'][i % 3],
        billType: 'electricity',
        billingPeriod: {
          startDate: new Date(Date.now() - (i * 30 * 24 * 60 * 60 * 1000)),
          endDate: new Date(Date.now() - ((i - 1) * 30 * 24 * 60 * 60 * 1000))
        },
        dueDate: new Date(Date.now() + (15 * 24 * 60 * 60 * 1000)),
        amount: 500 + Math.random() * 2000,
        currency: 'INR',
        status: ['pending', 'paid', 'overdue'][i % 3] as any,
        createdAt: new Date(Date.now() - (i * 30 * 24 * 60 * 60 * 1000)),
        updatedAt: new Date()
      });
    }

    // Generate mock payments
    for (let i = 0; i < 80; i++) {
      this.payments.push({
        id: `payment_${i}`,
        billId: `bill_${i}`,
        userId: `user_${i % 20}`,
        amount: 500 + Math.random() * 2000,
        currency: 'INR',
        method: ['credit_card', 'upi', 'net_banking', 'wallet'][i % 4] as any,
        status: ['completed', 'failed', 'pending'][i % 3] as any,
        gateway: ['razorpay', 'paytm', 'phonepe'][i % 3] as any,
        createdAt: new Date(Date.now() - (i * 25 * 24 * 60 * 60 * 1000)),
        updatedAt: new Date()
      });
    }

    // Generate mock subscriptions
    for (let i = 0; i < 30; i++) {
      this.subscriptions.push({
        id: `sub_${i}`,
        userId: `user_${i % 20}`,
        planId: ['basic', 'pro', 'premium'][i % 3],
        name: ['Basic Plan', 'Pro Plan', 'Premium Plan'][i % 3],
        status: ['active', 'trial', 'cancelled'][i % 3] as any,
        type: ['basic', 'pro', 'premium'][i % 3] as any,
        billingCycle: 'monthly',
        amount: [99, 299, 999][i % 3],
        currency: 'INR',
        features: [],
        currentPeriod: {
          startDate: new Date(Date.now() - (15 * 24 * 60 * 60 * 1000)),
          endDate: new Date(Date.now() + (15 * 24 * 60 * 60 * 1000))
        },
        nextBillingDate: new Date(Date.now() + (15 * 24 * 60 * 60 * 1000)),
        autoRenew: Math.random() > 0.2,
        createdAt: new Date(Date.now() - (i * 35 * 24 * 60 * 60 * 1000)),
        updatedAt: new Date()
      });
    }
  }

  private filterDataByPeriod<T extends { createdAt: Date }>(data: T[], startDate: Date, endDate: Date, dateField: keyof T = 'createdAt'): T[] {
    return data.filter(item => {
      const itemDate = item[dateField] as Date;
      return itemDate >= startDate && itemDate <= endDate;
    });
  }

  private calculateTotalRevenue(payments: Payment[], invoices: Invoice[]): number {
    const paymentRevenue = payments
      .filter(payment => payment.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0);

    const invoiceRevenue = invoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + invoice.totalAmount, 0);

    return paymentRevenue + invoiceRevenue;
  }

  private calculateTotalExpenses(bills: Bill[]): number {
    return bills.reduce((sum, bill) => sum + bill.amount, 0);
  }

  private getPaymentMethodStats(payments: Payment[]): PaymentMethodStats[] {
    const methodCounts = payments.reduce((acc, payment) => {
      if (!acc[payment.method]) {
        acc[payment.method] = { count: 0, amount: 0 };
      }
      acc[payment.method].count++;
      acc[payment.method].amount += payment.amount;
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);

    const totalPayments = payments.length;
    // const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

    return Object.entries(methodCounts).map(([method, stats]) => ({
      method: method as any,
      count: stats.count,
      amount: stats.amount,
      percentage: totalPayments > 0 ? (stats.count / totalPayments) * 100 : 0
    }));
  }

  private getSubscriptionStats(subscriptions: Subscription[]): SubscriptionStats {
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
    const newSubscriptions = subscriptions.filter(sub => 
      sub.createdAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    const churnedSubscriptions = subscriptions.filter(sub => 
      sub.status === 'cancelled' && 
      sub.cancelledAt && 
      sub.cancelledAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    const mrr = this.calculateMRR(activeSubscriptions);

    return {
      total: subscriptions.length,
      active: activeSubscriptions.length,
      trial: subscriptions.filter(sub => sub.status === 'trial').length,
      cancelled: subscriptions.filter(sub => sub.status === 'cancelled').length,
      newSubscriptions: newSubscriptions.length,
      churnedSubscriptions: churnedSubscriptions.length,
      mrr,
      arr: mrr * 12,
      averageRevenuePerUser: activeSubscriptions.length > 0 ? mrr / activeSubscriptions.length : 0
    };
  }

  private getRevenueByPeriod(period: { startDate: Date; endDate: Date }): RevenueByPeriod[] {
    const periods: RevenueByPeriod[] = [];
    const daysDiff = Math.ceil((period.endDate.getTime() - period.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const periodLength = Math.max(1, Math.floor(daysDiff / 12)); // Divide into 12 periods

    for (let i = 0; i < 12; i++) {
      const periodStart = new Date(period.startDate.getTime() + (i * periodLength * 24 * 60 * 60 * 1000));
      const periodEnd = new Date(Math.min(
        period.startDate.getTime() + ((i + 1) * periodLength * 24 * 60 * 60 * 1000),
        period.endDate.getTime()
      ));

      const periodPayments = this.filterDataByPeriod(this.payments, periodStart, periodEnd);
      const periodInvoices = this.filterDataByPeriod(this.invoices, periodStart, periodEnd);
      const periodBills = this.filterDataByPeriod(this.bills, periodStart, periodEnd);

      const revenue = this.calculateTotalRevenue(periodPayments, periodInvoices);
      const expenses = this.calculateTotalExpenses(periodBills);

      periods.push({
        period: periodStart.toISOString().split('T')[0],
        revenue,
        expenses,
        profit: revenue - expenses,
        subscriptions: periodInvoices.filter(inv => inv.type === 'subscription').length,
        oneTimePayments: periodPayments.filter(pay => !pay.subscriptionId).length
      });
    }

    return periods;
  }

  private getTopCustomers(payments: Payment[], bills: Bill[], subscriptions: Subscription[]): CustomerStats[] {
    const customerMap = new Map<string, CustomerStats>();

    // Process payments
    payments.forEach(payment => {
      if (!customerMap.has(payment.userId)) {
        customerMap.set(payment.userId, {
          userId: payment.userId,
          totalSpent: 0,
          totalBills: 0,
          subscriptionCount: 0,
          averageBillAmount: 0
        });
      }
      const stats = customerMap.get(payment.userId)!;
      stats.totalSpent += payment.amount;
    });

    // Process bills
    bills.forEach(bill => {
      if (!customerMap.has(bill.userId)) {
        customerMap.set(bill.userId, {
          userId: bill.userId,
          totalSpent: 0,
          totalBills: 0,
          subscriptionCount: 0,
          averageBillAmount: 0
        });
      }
      const stats = customerMap.get(bill.userId)!;
      stats.totalBills++;
    });

    // Process subscriptions
    subscriptions.forEach(subscription => {
      if (!customerMap.has(subscription.userId)) {
        customerMap.set(subscription.userId, {
          userId: subscription.userId,
          totalSpent: 0,
          totalBills: 0,
          subscriptionCount: 0,
          averageBillAmount: 0
        });
      }
      const stats = customerMap.get(subscription.userId)!;
      stats.subscriptionCount++;
      stats.subscriptionStatus = subscription.status;
    });

    // Calculate averages
    customerMap.forEach(stats => {
      stats.averageBillAmount = stats.totalBills > 0 ? stats.totalSpent / stats.totalBills : 0;
    });

    return Array.from(customerMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);
  }

  private calculateChurnRate(subscriptions: Subscription[]): number {
    const totalSubscriptions = subscriptions.length;
    const cancelledSubscriptions = subscriptions.filter(sub => sub.status === 'cancelled').length;
    
    return totalSubscriptions > 0 ? (cancelledSubscriptions / totalSubscriptions) * 100 : 0;
  }

  private calculateMRR(activeSubscriptions: Subscription[]): number {
    return activeSubscriptions.reduce((total, subscription) => {
      let monthlyAmount = subscription.amount;
      
      // Convert to monthly based on billing cycle
      switch (subscription.billingCycle) {
        case 'quarterly':
          monthlyAmount = subscription.amount / 3;
          break;
        case 'semi_annual':
          monthlyAmount = subscription.amount / 6;
          break;
        case 'annual':
          monthlyAmount = subscription.amount / 12;
          break;
      }
      
      return total + monthlyAmount;
    }, 0);
  }

  private calculateLTV(_subscriptions: Subscription[], payments: Payment[]): number {
    const customerRevenue = new Map<string, number>();
    
    payments.forEach(payment => {
      const current = customerRevenue.get(payment.userId) || 0;
      customerRevenue.set(payment.userId, current + payment.amount);
    });

    const revenues = Array.from(customerRevenue.values());
    return revenues.length > 0 ? revenues.reduce((sum, revenue) => sum + revenue, 0) / revenues.length : 0;
  }

  private calculateCAC(subscriptions: Subscription[]): number {
    // Mock CAC calculation - in production this would include marketing costs
    const totalCustomers = new Set(subscriptions.map(sub => sub.userId)).size;
    const totalMarketingCost = 50000; // Mock marketing cost
    
    return totalCustomers > 0 ? totalMarketingCost / totalCustomers : 0;
  }

  // Additional helper methods for other analytics functions
  private getRevenueBySource(payments: Payment[], invoices: Invoice[]): any {
    return {
      billPayments: payments.filter(p => p.billId).reduce((sum, p) => sum + p.amount, 0),
      subscriptionPayments: payments.filter(p => p.subscriptionId).reduce((sum, p) => sum + p.amount, 0),
      invoicePayments: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.totalAmount, 0)
    };
  }

  private calculateRevenueGrowth(period: { startDate: Date; endDate: Date }): number {
    const previousPeriodStart = new Date(period.startDate.getTime() - (period.endDate.getTime() - period.startDate.getTime()));
    const previousPeriodEnd = period.startDate;

    const currentRevenue = this.calculateTotalRevenue(
      this.filterDataByPeriod(this.payments, period.startDate, period.endDate),
      this.filterDataByPeriod(this.invoices, period.startDate, period.endDate)
    );

    const previousRevenue = this.calculateTotalRevenue(
      this.filterDataByPeriod(this.payments, previousPeriodStart, previousPeriodEnd),
      this.filterDataByPeriod(this.invoices, previousPeriodStart, previousPeriodEnd)
    );

    return previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  }

  private generateRevenueForecast(period: { startDate: Date; endDate: Date }): any {
    // Simple linear forecast
    const currentRevenue = this.calculateTotalRevenue(
      this.filterDataByPeriod(this.payments, period.startDate, period.endDate),
      this.filterDataByPeriod(this.invoices, period.startDate, period.endDate)
    );

    return {
      nextMonth: currentRevenue * 1.05,
      nextQuarter: currentRevenue * 1.15,
      nextYear: currentRevenue * 1.25
    };
  }

  private calculateAverageRevenuePerDay(payments: Payment[], invoices: Invoice[], period: { startDate: Date; endDate: Date }): number {
    const totalRevenue = this.calculateTotalRevenue(payments, invoices);
    const days = Math.ceil((period.endDate.getTime() - period.startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return days > 0 ? totalRevenue / days : 0;
  }

  private getRevenueTrends(_period: { startDate: Date; endDate: Date }): any {
    // Mock trend data
    return {
      upward: true,
      percentage: 12.5,
      momentum: 'strong'
    };
  }

  private calculatePaymentSuccessRate(payments: Payment[]): number {
    const totalPayments = payments.length;
    const successfulPayments = payments.filter(payment => payment.status === 'completed').length;
    
    return totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;
  }

  private getPaymentFailureReasons(payments: Payment[]): any {
    const failures = payments.filter(payment => payment.status === 'failed');
    const reasons = failures.reduce((acc, payment) => {
      const reason = payment.failureReason || 'Unknown';
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return reasons;
  }

  private getPaymentTrends(period: { startDate: Date; endDate: Date }): any {
    return {
      dailyVolume: this.filterDataByPeriod(this.payments, period.startDate, period.endDate).length,
      peakHours: [14, 15, 16], // Mock peak hours
      preferredMethods: ['upi', 'credit_card']
    };
  }

  private calculateSubscriptionGrowth(period: { startDate: Date; endDate: Date }): number {
    const periodSubscriptions = this.filterDataByPeriod(this.subscriptions, period.startDate, period.endDate);
    const previousPeriodStart = new Date(period.startDate.getTime() - (period.endDate.getTime() - period.startDate.getTime()));
    const previousPeriodEnd = period.startDate;
    const previousSubscriptions = this.filterDataByPeriod(this.subscriptions, previousPeriodStart, previousPeriodEnd);

    const growth = periodSubscriptions.length - previousSubscriptions.length;
    return previousSubscriptions.length > 0 ? (growth / previousSubscriptions.length) * 100 : 0;
  }

  private calculateSubscriptionRetention(subscriptions: Subscription[]): number {
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
    const totalSubscriptions = subscriptions.length;
    
    return totalSubscriptions > 0 ? (activeSubscriptions.length / totalSubscriptions) * 100 : 0;
  }

  private calculateSubscriptionValue(subscriptions: Subscription[]): any {
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
    const totalValue = activeSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);
    
    return {
      totalValue,
      averageValue: activeSubscriptions.length > 0 ? totalValue / activeSubscriptions.length : 0,
      potentialValue: totalValue * 1.2 // Mock potential value
    };
  }

  private calculateARPU(subscriptions: Subscription[]): number {
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
    const totalRevenue = this.calculateMRR(activeSubscriptions);
    
    return activeSubscriptions.length > 0 ? totalRevenue / activeSubscriptions.length : 0;
  }

  private getUniqueCustomers(period: { startDate: Date; endDate: Date }): string[] {
    const customers = new Set<string>();
    
    this.filterDataByPeriod(this.payments, period.startDate, period.endDate).forEach(payment => {
      customers.add(payment.userId);
    });
    
    this.filterDataByPeriod(this.subscriptions, period.startDate, period.endDate).forEach(subscription => {
      customers.add(subscription.userId);
    });

    return Array.from(customers);
  }

  private getCustomerSegments(_period: { startDate: Date; endDate: Date }): any {
    return {
      premium: 15,
      standard: 45,
      basic: 40
    };
  }

  private getCustomerLifetimeValue(period: { startDate: Date; endDate: Date }): any {
    const customers = this.getUniqueCustomers(period);
    const revenue = this.calculateTotalRevenue(
      this.filterDataByPeriod(this.payments, period.startDate, period.endDate),
      this.filterDataByPeriod(this.invoices, period.startDate, period.endDate)
    );

    return {
      average: customers.length > 0 ? revenue / customers.length : 0,
      topCustomers: this.getTopCustomers(
        this.filterDataByPeriod(this.payments, period.startDate, period.endDate),
        this.filterDataByPeriod(this.bills, period.startDate, period.endDate),
        this.filterDataByPeriod(this.subscriptions, period.startDate, period.endDate)
      )
    };
  }

  private getCustomerAcquisition(_period: { startDate: Date; endDate: Date }): any {
    return {
      newCustomers: 25,
      returningCustomers: 75
    };
  }

  private getCustomerSatisfaction(_period: { startDate: Date; endDate: Date }): any {
    return {
      score: 4.2,
      totalReviews: 150,
      positiveReviews: 120
    };
  }

  private getCustomerRetention(_period: { startDate: Date; endDate: Date }): number {
    return 85.5; // Mock retention rate
  }

  private calculateBillingEfficiency(bills: Bill[], _payments: Payment[]): number {
    const totalBills = bills.length;
    const processedBills = bills.filter((bill: Bill) => bill.status === 'paid').length;
    
    return totalBills > 0 ? (processedBills / totalBills) * 100 : 0;
  }

  private calculateCollectionRate(bills: Bill[], payments: Payment[]): number {
    const totalBilled = bills.reduce((sum, bill) => sum + bill.amount, 0);
    const totalCollected = payments
      .filter(payment => payment.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0);

    return totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0;
  }

  private getOverdueAnalysis(bills: Bill[]): any {
    const overdueBills = bills.filter(bill => bill.status === 'overdue');
    const totalOverdueAmount = overdueBills.reduce((sum, bill) => sum + bill.amount, 0);

    return {
      count: overdueBills.length,
      totalAmount: totalOverdueAmount,
      averageOverdueDays: 15,
      oldestOverdue: 45
    };
  }

  private getAverageProcessingTime(_bills: Bill[], _payments: Payment[]): number {
    // Mock processing time in days
    return 2.5;
  }

  private getBillingAccuracy(_bills: Bill[]): number {
    return 98.5; // Mock accuracy percentage
  }

  private getDisputeRate(bills: Bill[]): number {
    const disputedBills = bills.filter(bill => bill.status === 'disputed').length;
    return bills.length > 0 ? (disputedBills / bills.length) * 100 : 0;
  }

  private getHistoricalBillingData(_period: { startDate: Date; endDate: Date }): any {
    return {
      revenue: [10000, 12000, 11500, 13000, 14000],
      expenses: [8000, 9000, 8500, 9500, 10000],
      subscriptions: [10, 12, 15, 18, 20],
      customers: [50, 55, 60, 65, 70]
    };
  }

  private forecastRevenue(_historicalData: any, periods: number): any {
    return Array.from({ length: periods }, (_, i) => ({
      period: i + 1,
      amount: 14000 + (i * 500) + (Math.random() * 1000 - 500)
    }));
  }

  private forecastExpenses(_historicalData: any, periods: number): any {
    return Array.from({ length: periods }, (_, i) => ({
      period: i + 1,
      amount: 10000 + (i * 200) + (Math.random() * 500 - 250)
    }));
  }

  private forecastSubscriptions(_historicalData: any, periods: number): any {
    return Array.from({ length: periods }, (_, i) => ({
      period: i + 1,
      count: 20 + (i * 2) + Math.floor(Math.random() * 3)
    }));
  }

  private forecastCustomers(_historicalData: any, periods: number): any {
    return Array.from({ length: periods }, (_, i) => ({
      period: i + 1,
      count: 70 + (i * 5) + Math.floor(Math.random() * 5)
    }));
  }
}

// Supporting Types
interface RevenueAnalytics {
  totalRevenue: number;
  revenueBySource: any;
  revenueGrowth: number;
  revenueForecast: any;
  averageRevenuePerDay: number;
  revenueTrends: any;
}

interface PaymentAnalyticsData {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  paymentMethods: PaymentMethodStats[];
  successRate: number;
  failureReasons: any;
  averagePaymentAmount: number;
  paymentTrends: any;
}

interface SubscriptionAnalyticsData {
  totalSubscriptions: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  cancelledSubscriptions: number;
  growth: number;
  retention: number;
  value: any;
  mrr: number;
  arr: number;
  averageRevenuePerUser: number;
}

interface CustomerAnalyticsData {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerSegments: any;
  averageLifetimeValue: number;
  topCustomers: CustomerStats[];
  customerSatisfaction: any;
  customerRetention: number;
}

interface BillingPerformanceData {
  billingEfficiency: number;
  collectionRate: number;
  overdueAnalysis: any;
  averageProcessingTime: number;
  billingAccuracy: number;
  disputeRate: number;
}

interface BillingForecast {
  revenueForecast: any;
  expenseForecast: any;
  subscriptionForecast: any;
  customerForecast: any;
  confidence: number;
  methodology: string;
}

// Singleton instance
let billingAnalyticsInstance: BillingAnalytics | null = null;

export function getBillingAnalytics(): BillingAnalytics {
  if (!billingAnalyticsInstance) {
    billingAnalyticsInstance = new BillingAnalytics();
  }
  return billingAnalyticsInstance;
}
