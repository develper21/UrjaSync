import { getTariffIntelligence } from './tariff-intelligence';

export interface Budget {
  id: string;
  name: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  amount: number; // ₹
  startDate: Date;
  endDate?: Date;
  categories: BudgetCategory[];
  alerts: BudgetAlert[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocatedAmount: number; // ₹
  spentAmount: number; // ₹
  percentage: number; // % of total budget
  appliances: string[]; // appliance IDs
}

export interface BudgetAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  threshold: number; // percentage
  message: string;
  enabled: boolean;
  triggered: boolean;
  lastTriggered?: number;
}

export interface ExpenseRecord {
  id: string;
  timestamp: number;
  amount: number; // ₹
  category: string;
  description: string;
  applianceId?: string;
  consumption: number; // kWh
  rate: number; // ₹/kWh
  period: 'peak' | 'standard' | 'off_peak';
}

export interface BudgetReport {
  budgetId: string;
  period: string;
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  utilizationRate: number; // %
  dailyAverage: number;
  projectedTotal: number;
  variance: number; // ₹ (+ over budget, - under budget)
  recommendations: string[];
  categoryBreakdown: CategoryReport[];
  trendAnalysis: TrendAnalysis;
}

export interface CategoryReport {
  categoryId: string;
  name: string;
  budgeted: number;
  spent: number;
  remaining: number;
  utilizationRate: number;
  variance: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable';
  rate: number; // % change
  projection: {
    nextPeriod: number;
    monthEnd: number;
    yearEnd: number;
  };
  confidence: number; // 0-1
}

export interface BudgetGoal {
  id: string;
  name: string;
  targetAmount: number; // ₹
  currentAmount: number; // ₹
  deadline: Date;
  monthlyContribution: number; // ₹
  priority: 'high' | 'medium' | 'low';
  isActive: boolean;
  achievements: GoalAchievement[];
}

export interface GoalAchievement {
  date: number;
  amount: number;
  description: string;
}

export class BudgetManager {
  private tariffIntelligence = getTariffIntelligence();
  private budgets: Map<string, Budget> = new Map();
  private expenses: ExpenseRecord[] = [];
  private goals: Map<string, BudgetGoal> = new Map();

  constructor() {
    this.initializeDefaultBudget();
    this.initializeMockExpenses();
    this.initializeGoals();
  }

  private initializeDefaultBudget(): void {
    const defaultBudget: Budget = {
      id: 'default_monthly',
      name: 'Monthly Energy Budget',
      period: 'monthly',
      amount: 2500, // ₹2,500 per month
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      categories: [
        {
          id: 'cooling',
          name: 'Air Conditioning',
          allocatedAmount: 1200,
          spentAmount: 0,
          percentage: 48,
          appliances: ['ac_living_room', 'ac_bedroom']
        },
        {
          id: 'appliances',
          name: 'Home Appliances',
          allocatedAmount: 800,
          spentAmount: 0,
          percentage: 32,
          appliances: ['washing_machine', 'refrigerator', 'microwave']
        },
        {
          id: 'lighting',
          name: 'Lighting & Electronics',
          allocatedAmount: 300,
          spentAmount: 0,
          percentage: 12,
          appliances: ['tv', 'computer', 'lights']
        },
        {
          id: 'other',
          name: 'Other',
          allocatedAmount: 200,
          spentAmount: 0,
          percentage: 8,
          appliances: []
        }
      ],
      alerts: [
        {
          id: 'warning_80',
          type: 'warning',
          threshold: 80,
          message: 'Budget usage reached 80%. Monitor your consumption.',
          enabled: true,
          triggered: false
        },
        {
          id: 'critical_95',
          type: 'critical',
          threshold: 95,
          message: 'Budget usage reached 95%. Immediate action required!',
          enabled: true,
          triggered: false
        },
        {
          id: 'daily_100',
          type: 'info',
          threshold: 100,
          message: 'Daily average exceeds budget limit.',
          enabled: true,
          triggered: false
        }
      ],
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.budgets.set(defaultBudget.id, defaultBudget);
  }

  private initializeMockExpenses(): void {
    // Generate mock expenses for the current month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    for (let day = 1; day <= now.getDate(); day++) {
      const date = new Date(currentYear, currentMonth, day);
      
      // Generate 3-5 expenses per day
      const expenseCount = 3 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < expenseCount; i++) {
        const hour = Math.floor(Math.random() * 24);
        const timestamp = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour).getTime();
        
        const tariff = this.tariffIntelligence.getCurrentTariff(timestamp);
        const consumption = 0.5 + Math.random() * 2.5; // 0.5-3 kWh
        const amount = consumption * tariff.currentRate;
        
        const expense: ExpenseRecord = {
          id: `expense_${timestamp}_${i}`,
          timestamp,
          amount,
          category: this.getRandomCategory(),
          description: this.getRandomExpenseDescription(),
          consumption,
          rate: tariff.currentRate,
          period: this.getPeriodFromRate(tariff.currentRate)
        };

        this.expenses.push(expense);
      }
    }

    this.updateCategorySpending();
  }

  private getRandomCategory(): string {
    const categories = ['cooling', 'appliances', 'lighting', 'other'];
    return categories[Math.floor(Math.random() * categories.length)];
  }

  private getRandomExpenseDescription(): string {
    const descriptions = [
      'Air conditioning usage',
      'Refrigerator consumption',
      'Washing machine cycle',
      'Lighting and electronics',
      'Water heater usage',
      'Kitchen appliances',
      'Entertainment devices',
      'Standby power consumption'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  private getPeriodFromRate(rate: number): 'peak' | 'standard' | 'off_peak' {
    if (rate >= 7.0) return 'peak';
    if (rate <= 4.0) return 'off_peak';
    return 'standard';
  }

  private initializeGoals(): void {
    const goals: BudgetGoal[] = [
      {
        id: 'reduce_by_10',
        name: 'Reduce Monthly Cost by 10%',
        targetAmount: 250, // ₹250 savings per month
        currentAmount: 0,
        deadline: new Date(new Date().getFullYear(), new Date().getMonth() + 3, 1),
        monthlyContribution: 83.33,
        priority: 'high',
        isActive: true,
        achievements: []
      },
      {
        id: 'summer_prep',
        name: 'Summer Preparation Fund',
        targetAmount: 1500,
        currentAmount: 300,
        deadline: new Date(new Date().getFullYear(), 2, 31), // March 31
        monthlyContribution: 200,
        priority: 'medium',
        isActive: true,
        achievements: [
          {
            date: Date.now() - (7 * 24 * 60 * 60 * 1000),
            amount: 150,
            description: 'Initial contribution'
          }
        ]
      }
    ];

    goals.forEach(goal => this.goals.set(goal.id, goal));
  }

  // Budget management
  createBudget(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Budget {
    const newBudget: Budget = {
      ...budget,
      id: `budget_${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.budgets.set(newBudget.id, newBudget);
    return newBudget;
  }

  updateBudget(budgetId: string, updates: Partial<Budget>): boolean {
    const budget = this.budgets.get(budgetId);
    if (!budget) return false;

    Object.assign(budget, updates, { updatedAt: Date.now() });
    return true;
  }

  deleteBudget(budgetId: string): boolean {
    return this.budgets.delete(budgetId);
  }

  getBudget(budgetId: string): Budget | null {
    return this.budgets.get(budgetId) || null;
  }

  getAllBudgets(): Budget[] {
    return Array.from(this.budgets.values());
  }

  getActiveBudgets(): Budget[] {
    return Array.from(this.budgets.values()).filter(b => b.isActive);
  }

  // Expense tracking
  addExpense(expense: Omit<ExpenseRecord, 'id'>): ExpenseRecord {
    const newExpense: ExpenseRecord = {
      ...expense,
      id: `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    this.expenses.push(newExpense);
    this.updateCategorySpending();
    this.checkBudgetAlerts();
    return newExpense;
  }

  private updateCategorySpending(): void {
    // Reset spent amounts
    for (const budget of this.budgets.values()) {
      budget.categories.forEach(category => {
        category.spentAmount = 0;
      });
    }

    // Calculate spending for current period
    const now = Date.now();
    const currentBudget = this.getActiveBudgets()[0];
    
    if (!currentBudget) return;

    const periodStart = this.getPeriodStart(currentBudget.period);
    const relevantExpenses = this.expenses.filter(e => e.timestamp >= periodStart && e.timestamp <= now);

    for (const expense of relevantExpenses) {
      const category = currentBudget.categories.find(c => c.id === expense.category);
      if (category) {
        category.spentAmount += expense.amount;
      }
    }
  }

  private getPeriodStart(period: string): number {
    const now = new Date();
    switch (period) {
      case 'daily':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        return weekStart.getTime();
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      case 'yearly':
        return new Date(now.getFullYear(), 0, 1).getTime();
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    }
  }

  // Budget analysis and reporting
  generateBudgetReport(budgetId: string): BudgetReport | null {
    const budget = this.budgets.get(budgetId);
    if (!budget) return null;

    const periodStart = this.getPeriodStart(budget.period);
    const now = Date.now();
    const relevantExpenses = this.expenses.filter(e => e.timestamp >= periodStart && e.timestamp <= now);

    const totalSpent = relevantExpenses.reduce((sum, e) => sum + e.amount, 0);
    const remaining = budget.amount - totalSpent;
    const utilizationRate = (totalSpent / budget.amount) * 100;

    const daysInPeriod = this.getDaysInPeriod(budget.period);
    const daysElapsed = Math.ceil((now - periodStart) / (24 * 60 * 60 * 1000));
    const dailyAverage = totalSpent / daysElapsed;
    const projectedTotal = dailyAverage * daysInPeriod;
    const variance = totalSpent - budget.amount;

    return {
      budgetId,
      period: budget.period,
      totalBudget: budget.amount,
      totalSpent,
      remaining,
      utilizationRate,
      dailyAverage,
      projectedTotal,
      variance,
      recommendations: this.generateRecommendations(budget, utilizationRate),
      categoryBreakdown: this.generateCategoryReports(budget),
      trendAnalysis: this.analyzeTrends(relevantExpenses, budget.period)
    };
  }

  private getDaysInPeriod(period: string): number {
    switch (period) {
      case 'daily': return 1;
      case 'weekly': return 7;
      case 'monthly': return new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      case 'yearly': return 365;
      default: return 30;
    }
  }

  private generateRecommendations(budget: Budget, utilizationRate: number): string[] {
    const recommendations: string[] = [];

    if (utilizationRate > 90) {
      recommendations.push('Critical: Budget nearly exhausted. Reduce consumption immediately.');
      recommendations.push('Consider switching to off-peak hours for heavy appliances.');
    } else if (utilizationRate > 75) {
      recommendations.push('Warning: Budget usage high. Monitor consumption closely.');
      recommendations.push('Delay non-essential energy usage until next period.');
    } else if (utilizationRate < 50) {
      recommendations.push('Good: Budget usage well within limits.');
      recommendations.push('Consider allocating surplus to savings goals.');
    }

    // Category-specific recommendations
    for (const category of budget.categories) {
      const categoryUtilization = (category.spentAmount / category.allocatedAmount) * 100;
      if (categoryUtilization > 90) {
        recommendations.push(`${category.name} category exceeding budget. Review usage patterns.`);
      }
    }

    return recommendations;
  }

  private generateCategoryReports(budget: Budget): CategoryReport[] {
    return budget.categories.map(category => ({
      categoryId: category.id,
      name: category.name,
      budgeted: category.allocatedAmount,
      spent: category.spentAmount,
      remaining: category.allocatedAmount - category.spentAmount,
      utilizationRate: (category.spentAmount / category.allocatedAmount) * 100,
      variance: category.spentAmount - category.allocatedAmount,
      trend: this.calculateCategoryTrend(category.id)
    }));
  }

  private calculateCategoryTrend(categoryId: string): 'increasing' | 'decreasing' | 'stable' {
    const categoryExpenses = this.expenses.filter(e => e.category === categoryId);
    if (categoryExpenses.length < 7) return 'stable';

    const recentExpenses = categoryExpenses.slice(-7);
    const previousExpenses = categoryExpenses.slice(-14, -7);

    if (previousExpenses.length === 0) return 'stable';

    const recentAvg = recentExpenses.reduce((sum, e) => sum + e.amount, 0) / recentExpenses.length;
    const previousAvg = previousExpenses.reduce((sum, e) => sum + e.amount, 0) / previousExpenses.length;

    const change = (recentAvg - previousAvg) / previousAvg;

    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  private analyzeTrends(expenses: ExpenseRecord[], period: string): TrendAnalysis {
    if (expenses.length < 3) {
      return {
        direction: 'stable',
        rate: 0,
        projection: { nextPeriod: 0, monthEnd: 0, yearEnd: 0 },
        confidence: 0
      };
    }

    // Calculate trend using linear regression
    const sortedExpenses = expenses.sort((a, b) => a.timestamp - b.timestamp);
    const n = sortedExpenses.length;
    
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    sortedExpenses.forEach((expense, index) => {
      const x = index;
      const y = expense.amount;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const avgAmount = sumY / n;
    const rate = (slope / avgAmount) * 100;

    let direction: 'increasing' | 'decreasing' | 'stable';
    if (rate > 5) direction = 'increasing';
    else if (rate < -5) direction = 'decreasing';
    else direction = 'stable';

    // Calculate projections
    const dailyAverage = avgAmount;
    const daysInPeriod = this.getDaysInPeriod(period);
    const nextPeriod = dailyAverage * daysInPeriod;
    const monthEnd = dailyAverage * (new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate());
    const yearEnd = dailyAverage * (365 - this.getDayOfYear(new Date()));

    // Calculate confidence based on data consistency
    const variance = sortedExpenses.reduce((sum, e) => sum + Math.pow(e.amount - avgAmount, 2), 0) / n;
    const confidence = Math.max(0, 1 - (variance / (avgAmount * avgAmount)));

    return {
      direction,
      rate,
      projection: { nextPeriod, monthEnd, yearEnd },
      confidence
    };
  }

  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  // Budget alerts
  private checkBudgetAlerts(): void {
    for (const budget of this.budgets.values()) {
      if (!budget.isActive) continue;

      const report = this.generateBudgetReport(budget.id);
      if (!report) continue;

      for (const alert of budget.alerts) {
        if (!alert.enabled) continue;

        if (report.utilizationRate >= alert.threshold && !alert.triggered) {
          this.triggerAlert(budget, alert, report);
        } else if (report.utilizationRate < alert.threshold && alert.triggered) {
          alert.triggered = false;
        }
      }
    }
  }

  private triggerAlert(budget: Budget, alert: BudgetAlert, report: BudgetReport): void {
    alert.triggered = true;
    alert.lastTriggered = Date.now();

    console.log(`🚨 BUDGET ALERT [${alert.type.toUpperCase()}]: ${alert.message}`);
    console.log(`Budget: ${budget.name} | Usage: ${report.utilizationRate.toFixed(1)}% | Spent: ₹${report.totalSpent.toFixed(2)}`);

    // TODO: Implement notification system
  }

  // Goal management
  createGoal(goal: Omit<BudgetGoal, 'id' | 'achievements'>): BudgetGoal {
    const newGoal: BudgetGoal = {
      ...goal,
      id: `goal_${Date.now()}`,
      achievements: []
    };

    this.goals.set(newGoal.id, newGoal);
    return newGoal;
  }

  updateGoal(goalId: string, updates: Partial<BudgetGoal>): boolean {
    const goal = this.goals.get(goalId);
    if (!goal) return false;

    Object.assign(goal, updates);
    return true;
  }

  addGoalAchievement(goalId: string, amount: number, description: string): boolean {
    const goal = this.goals.get(goalId);
    if (!goal) return false;

    goal.currentAmount += amount;
    goal.achievements.push({
      date: Date.now(),
      amount,
      description
    });

    return true;
  }

  getGoal(goalId: string): BudgetGoal | null {
    return this.goals.get(goalId) || null;
  }

  getAllGoals(): BudgetGoal[] {
    return Array.from(this.goals.values());
  }

  getActiveGoals(): BudgetGoal[] {
    return Array.from(this.goals.values()).filter(g => g.isActive);
  }

  // Analytics and insights
  getBudgetInsights(): {
    totalBudgets: number;
    activeBudgets: number;
    totalAllocated: number;
    totalSpent: number;
    averageUtilization: number;
    topSpendingCategories: Array<{ category: string; amount: number; percentage: number }>;
    monthlyTrend: Array<{ month: string; budget: number; spent: number; variance: number }>;
    goalProgress: Array<{ goal: string; progress: number; status: string }>;
  } {
    const budgets = this.getActiveBudgets();
    const totalAllocated = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => {
      const report = this.generateBudgetReport(b.id);
      return sum + (report?.totalSpent || 0);
    }, 0);

    const averageUtilization = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

    // Top spending categories
    const categorySpending: Record<string, number> = {};
    budgets.forEach(budget => {
      budget.categories.forEach(category => {
        categorySpending[category.name] = (categorySpending[category.name] || 0) + category.spentAmount;
      });
    });

    const topSpendingCategories = Object.entries(categorySpending)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalAllocated > 0 ? (amount / totalAllocated) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Monthly trend (last 6 months)
    const monthlyTrend = this.generateMonthlyTrend();

    // Goal progress
    const goalProgress = this.getActiveGoals().map(goal => ({
      goal: goal.name,
      progress: (goal.currentAmount / goal.targetAmount) * 100,
      status: goal.currentAmount >= goal.targetAmount ? 'completed' : 'in_progress'
    }));

    return {
      totalBudgets: budgets.length,
      activeBudgets: budgets.length,
      totalAllocated,
      totalSpent,
      averageUtilization,
      topSpendingCategories,
      monthlyTrend,
      goalProgress
    };
  }

  private generateMonthlyTrend(): Array<{ month: string; budget: number; spent: number; variance: number }> {
    const trend = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      const monthStart = month.getTime();
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0).getTime();
      
      const monthExpenses = this.expenses.filter(e => e.timestamp >= monthStart && e.timestamp < monthEnd);
      const spent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
      
      // Assume monthly budget of ₹2500 for trend analysis
      const budget = 2500;
      const variance = spent - budget;

      trend.push({ month: monthName, budget, spent, variance });
    }

    return trend;
  }

  // Utility methods
  getExpensesByDateRange(startDate: Date, endDate: Date): ExpenseRecord[] {
    const start = startDate.getTime();
    const end = endDate.getTime();
    return this.expenses.filter(e => e.timestamp >= start && e.timestamp <= end);
  }

  getExpensesByCategory(categoryId: string, days: number = 30): ExpenseRecord[] {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    return this.expenses.filter(e => e.category === categoryId && e.timestamp >= cutoff);
  }

  exportBudgetData(budgetId: string): {
    budget: Budget;
    expenses: ExpenseRecord[];
    report: BudgetReport;
  } | null {
    const budget = this.budgets.get(budgetId);
    if (!budget) return null;

    const periodStart = this.getPeriodStart(budget.period);
    const expenses = this.expenses.filter(e => e.timestamp >= periodStart);
    const report = this.generateBudgetReport(budgetId);

    return {
      budget,
      expenses,
      report: report!
    };
  }
}

// Singleton instance
let budgetManager: BudgetManager | null = null;

export function getBudgetManager(): BudgetManager {
  if (!budgetManager) {
    budgetManager = new BudgetManager();
  }
  return budgetManager;
}
