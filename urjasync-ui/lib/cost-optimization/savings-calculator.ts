import { getTariffIntelligence } from './tariff-intelligence';
import { getAutomationEngine, AutomationExecution } from './automation-engine';

export interface EnergyUsageData {
  timestamp: number;
  consumption: number; // kWh
  cost: number; // ₹
  tariffRate: number; // ₹/kWh
  period: 'peak' | 'standard' | 'off_peak';
}

export interface ApplianceUsage {
  applianceId: string;
  name: string;
  powerRating: number; // kW
  dailyUsage: number; // hours per day
  monthlyUsage: number; // kWh per month
  monthlyCost: number; // ₹ per month
  efficiency: number; // percentage
}

export interface SavingsAnalysis {
  totalSavings: number; // ₹
  savingsPercentage: number; // %
  potentialSavings: number; // ₹
  realizedSavings: number; // ₹
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  breakdown: SavingsBreakdown;
}

export interface SavingsBreakdown {
  tariffOptimization: number;
  timeShifting: number;
  efficiencyImprovements: number;
  automationSavings: number;
  behavioralChanges: number;
}

export interface SavingsOpportunity {
  type: 'tariff_switch' | 'time_shifting' | 'efficiency_upgrade' | 'automation_rule' | 'behavior_change';
  description: string;
  potentialSavings: number; // ₹ per month
  implementationCost: number; // ₹ one-time
  paybackPeriod: number; // months
  priority: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
}

export interface ComparativeAnalysis {
  baseline: {
    monthlyConsumption: number;
    monthlyCost: number;
    peakUsagePercentage: number;
  };
  optimized: {
    monthlyConsumption: number;
    monthlyCost: number;
    peakUsagePercentage: number;
  };
  savings: {
    amount: number;
    percentage: number;
    yearlyProjection: number;
  };
}

export class SavingsCalculator {
  private tariffIntelligence = getTariffIntelligence();
  private automationEngine = getAutomationEngine();
  private usageHistory: EnergyUsageData[] = [];
  private applianceUsage: Map<string, ApplianceUsage> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Mock usage history for the last 30 days
    const now = Date.now();
    for (let i = 30; i >= 0; i--) {
      const dayStart = now - (i * 24 * 60 * 60 * 1000);
      
      for (let hour = 0; hour < 24; hour++) {
        const timestamp = dayStart + (hour * 60 * 60 * 1000);
        const tariff = this.tariffIntelligence.getCurrentTariff(timestamp);
        
        // Simulate realistic usage patterns
        let consumption = this.simulateHourlyUsage(hour, tariff.isPeakHour);
        const cost = consumption * tariff.currentRate;
        
        this.usageHistory.push({
          timestamp,
          consumption,
          cost,
          tariffRate: tariff.currentRate,
          period: this.getPeriodFromRate(tariff.currentRate)
        });
      }
    }

    // Mock appliance data
    this.applianceUsage.set('ac_living_room', {
      applianceId: 'ac_living_room',
      name: 'Living Room AC',
      powerRating: 1.5,
      dailyUsage: 8,
      monthlyUsage: 1.5 * 8 * 30,
      monthlyCost: 0,
      efficiency: 85
    });

    this.applianceUsage.set('washing_machine', {
      applianceId: 'washing_machine',
      name: 'Washing Machine',
      powerRating: 0.5,
      dailyUsage: 1,
      monthlyUsage: 0.5 * 1 * 30,
      monthlyCost: 0,
      efficiency: 90
    });

    this.applianceUsage.set('refrigerator', {
      applianceId: 'refrigerator',
      name: 'Refrigerator',
      powerRating: 0.15,
      dailyUsage: 24,
      monthlyUsage: 0.15 * 24 * 30,
      monthlyCost: 0,
      efficiency: 95
    });

    this.updateApplianceCosts();
  }

  private simulateHourlyUsage(hour: number, isPeakHour: boolean): number {
    // Base usage pattern
    let baseUsage = 0.8; // kWh
    
    // Peak hours typically have higher usage
    if (isPeakHour) {
      baseUsage *= 1.5;
    }
    
    // Time-based adjustments
    if (hour >= 6 && hour <= 9) {
      baseUsage *= 1.3; // Morning routine
    } else if (hour >= 18 && hour <= 22) {
      baseUsage *= 1.4; // Evening activities
    } else if (hour >= 0 && hour <= 5) {
      baseUsage *= 0.3; // Night time
    }
    
    // Add some randomness
    baseUsage *= (0.8 + Math.random() * 0.4);
    
    return Math.max(0.1, baseUsage);
  }

  private getPeriodFromRate(rate: number): 'peak' | 'standard' | 'off_peak' {
    if (rate >= 7.0) return 'peak';
    if (rate <= 4.0) return 'off_peak';
    return 'standard';
  }

  private updateApplianceCosts(): void {
    const currentPlan = this.tariffIntelligence.getCurrentTariffPlan();
    if (!currentPlan) return;

    const averageRate = currentPlan.periods.reduce((sum, period) => sum + period.rate, 0) / currentPlan.periods.length;

    for (const appliance of this.applianceUsage.values()) {
      appliance.monthlyCost = appliance.monthlyUsage * averageRate;
    }
  }

  // Calculate comprehensive savings analysis
  calculateSavingsAnalysis(period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'): SavingsAnalysis {
    const now = Date.now();
    const periodMs = this.getPeriodMilliseconds(period);
    const cutoff = now - periodMs;

    const relevantUsage = this.usageHistory.filter(u => u.timestamp > cutoff);
    
    const totalCost = relevantUsage.reduce((sum, u) => sum + u.cost, 0);

    // Calculate baseline (what they would have paid without optimization)
    const baselineCost = this.calculateBaselineCost(relevantUsage);
    
    // Calculate potential savings
    const potentialSavings = this.calculatePotentialSavings(relevantUsage);
    
    // Calculate realized savings (from automation)
    const realizedSavings = this.calculateRealizedSavings(cutoff);

    const totalSavings = baselineCost - totalCost + realizedSavings;
    const savingsPercentage = baselineCost > 0 ? (totalSavings / baselineCost) * 100 : 0;

    return {
      totalSavings,
      savingsPercentage,
      potentialSavings,
      realizedSavings,
      period,
      breakdown: this.calculateSavingsBreakdown(relevantUsage, totalSavings)
    };
  }

  private getPeriodMilliseconds(period: string): number {
    switch (period) {
      case 'daily': return 24 * 60 * 60 * 1000;
      case 'weekly': return 7 * 24 * 60 * 60 * 1000;
      case 'monthly': return 30 * 24 * 60 * 60 * 1000;
      case 'yearly': return 365 * 24 * 60 * 60 * 1000;
      default: return 30 * 24 * 60 * 60 * 1000;
    }
  }

  private calculateBaselineCost(usage: EnergyUsageData[]): number {
    // Calculate what the cost would have been at a flat rate
    const flatRate = 6.5; // ₹/kWh
    return usage.reduce((sum, u) => sum + (u.consumption * flatRate), 0);
  }

  private calculatePotentialSavings(usage: EnergyUsageData[]): number {
    let potentialSavings = 0;

    // Tariff optimization potential
    const tariffComparison = this.tariffIntelligence.compareTariffPlans(
      usage.reduce((sum, u) => sum + u.consumption, 0) / 30, // Daily average
      this.calculatePeakUsagePercentage(usage)
    );
    
    if (tariffComparison.bestAlternative.savings > 0) {
      potentialSavings += tariffComparison.bestAlternative.savings;
    }

    // Time shifting potential
    const timeShiftingSavings = this.calculateTimeShiftingPotential(usage);
    potentialSavings += timeShiftingSavings;

    // Efficiency improvement potential
    const efficiencySavings = this.calculateEfficiencyPotential(usage);
    potentialSavings += efficiencySavings;

    return potentialSavings;
  }

  private calculateRealizedSavings(cutoff: number): number {
    // Calculate savings from automation rules that have been executed
    const executions = this.automationEngine.getExecutions(undefined, 1000);
    const relevantExecutions = executions.filter(e => e.timestamp > cutoff && e.success);

    let realizedSavings = 0;
    
    for (const execution of relevantExecutions) {
      // Estimate savings based on rule type
      const estimatedSavings = this.estimateRuleSavings(execution);
      realizedSavings += estimatedSavings;
    }

    return realizedSavings;
  }

  private calculateSavingsBreakdown(_usage: EnergyUsageData[], totalSavings: number): SavingsBreakdown {
    return {
      tariffOptimization: totalSavings * 0.3,
      timeShifting: totalSavings * 0.25,
      efficiencyImprovements: totalSavings * 0.2,
      automationSavings: totalSavings * 0.15,
      behavioralChanges: totalSavings * 0.1
    };
  }

  private calculatePeakUsagePercentage(usage: EnergyUsageData[]): number {
    const peakUsage = usage.filter(u => u.period === 'peak').reduce((sum, u) => sum + u.consumption, 0);
    const totalUsage = usage.reduce((sum, u) => sum + u.consumption, 0);
    return totalUsage > 0 ? (peakUsage / totalUsage) * 100 : 0;
  }

  private calculateTimeShiftingPotential(usage: EnergyUsageData[]): number {
    // Calculate potential savings from shifting peak usage to off-peak
    const peakUsage = usage.filter(u => u.period === 'peak');
    const offPeakRate = 3.5; // Typical off-peak rate
    const peakRate = 8.2; // Typical peak rate

    return peakUsage.reduce((savings, u) => {
      return savings + (u.consumption * (peakRate - offPeakRate));
    }, 0) * 0.5; // Assume 50% of peak usage can be shifted
  }

  private calculateEfficiencyPotential(usage: EnergyUsageData[]): number {
    // Calculate potential savings from efficiency improvements
    const totalConsumption = usage.reduce((sum, u) => sum + u.consumption, 0);
    const averageRate = usage.reduce((sum, u) => sum + u.cost, 0) / totalConsumption;
    
    // Assume 10% efficiency improvement potential
    return totalConsumption * averageRate * 0.1;
  }

  private estimateRuleSavings(execution: AutomationExecution): number {
    // Estimate savings based on rule type and actions
    let estimatedSavings = 0;

    for (const action of execution.actionsExecuted) {
      switch (action.type) {
        case 'device_control':
          if (action.parameters.action === 'set_temperature') {
            // AC temperature adjustment saves ~0.5 kWh per hour
            estimatedSavings += 0.5 * 3.5; // Assuming off-peak rate
          }
          break;
        case 'usage_limit':
          estimatedSavings += 2.0 * 5.0; // 2 kWh savings at average rate
          break;
        default:
          estimatedSavings += 0.5; // Minimal savings for other actions
      }
    }

    return estimatedSavings;
  }

  // Get savings opportunities
  getSavingsOpportunities(): SavingsOpportunity[] {
    const opportunities: SavingsOpportunity[] = [];

    // Tariff switching opportunity
    const tariffComparison = this.tariffIntelligence.compareTariffPlans(300, 25);
    if (tariffComparison.bestAlternative.savings > 0) {
      opportunities.push({
        type: 'tariff_switch',
        description: `Switch to ${tariffComparison.bestAlternative.plan.name} for lower rates`,
        potentialSavings: tariffComparison.bestAlternative.savings,
        implementationCost: 500,
        paybackPeriod: tariffComparison.bestAlternative.paybackPeriod,
        priority: tariffComparison.bestAlternative.savings > 100 ? 'high' : 'medium',
        effort: 'medium'
      });
    }

    // Time shifting opportunities
    opportunities.push({
      type: 'time_shifting',
      description: 'Shift washing machine and dishwasher usage to off-peak hours',
      potentialSavings: 150,
      implementationCost: 0,
      paybackPeriod: 0,
      priority: 'high',
      effort: 'low'
    });

    // Efficiency upgrade opportunities
    opportunities.push({
      type: 'efficiency_upgrade',
      description: 'Upgrade to 5-star rated air conditioner',
      potentialSavings: 200,
      implementationCost: 35000,
      paybackPeriod: 175, // ~14.5 years
      priority: 'low',
      effort: 'high'
    });

    // Automation rule opportunities
    opportunities.push({
      type: 'automation_rule',
      description: 'Create automated schedule for geysers and water pumps',
      potentialSavings: 80,
      implementationCost: 0,
      paybackPeriod: 0,
      priority: 'medium',
      effort: 'low'
    });

    // Behavioral change opportunities
    opportunities.push({
      type: 'behavior_change',
      description: 'Reduce standby power consumption by unplugging unused devices',
      potentialSavings: 50,
      implementationCost: 0,
      paybackPeriod: 0,
      priority: 'medium',
      effort: 'medium'
    });

    return opportunities.sort((a, b) => b.potentialSavings - a.potentialSavings);
  }

  // Comparative analysis
  generateComparativeAnalysis(): ComparativeAnalysis {
    const monthlyUsage = this.usageHistory
      .filter(u => u.timestamp > Date.now() - (30 * 24 * 60 * 60 * 1000))
      .reduce((sum, u) => sum + u.consumption, 0);

    const monthlyCost = this.usageHistory
      .filter(u => u.timestamp > Date.now() - (30 * 24 * 60 * 60 * 1000))
      .reduce((sum, u) => sum + u.cost, 0);

    const peakUsagePercentage = this.calculatePeakUsagePercentage(
      this.usageHistory.filter(u => u.timestamp > Date.now() - (30 * 24 * 60 * 60 * 1000))
    );

    // Simulate optimized scenario
    const optimizedPeakUsage = peakUsagePercentage * 0.6; // 40% reduction in peak usage
    const optimizedConsumption = monthlyUsage * 0.9; // 10% overall reduction
    const optimizedCost = this.calculateOptimizedCost(optimizedConsumption, optimizedPeakUsage);

    const savings = monthlyCost - optimizedCost;
    const savingsPercentage = (savings / monthlyCost) * 100;

    return {
      baseline: {
        monthlyConsumption: monthlyUsage,
        monthlyCost,
        peakUsagePercentage
      },
      optimized: {
        monthlyConsumption: optimizedConsumption,
        monthlyCost: optimizedCost,
        peakUsagePercentage: optimizedPeakUsage
      },
      savings: {
        amount: savings,
        percentage: savingsPercentage,
        yearlyProjection: savings * 12
      }
    };
  }

  private calculateOptimizedCost(consumption: number, peakUsagePercentage: number): number {
    const currentPlan = this.tariffIntelligence.getCurrentTariffPlan();
    if (!currentPlan) return consumption * 6.5; // Default rate

    return this.tariffIntelligence['calculateMonthlyCost'](currentPlan, consumption, peakUsagePercentage);
  }

  // Appliance-specific analysis
  getApplianceAnalysis(applianceId: string): ApplianceUsage | null {
    return this.applianceUsage.get(applianceId) || null;
  }

  updateApplianceUsage(applianceId: string, usage: Partial<ApplianceUsage>): void {
    const existing = this.applianceUsage.get(applianceId);
    if (existing) {
      Object.assign(existing, usage);
      this.updateApplianceCosts();
    }
  }

  // Usage history management
  addUsageData(data: EnergyUsageData): void {
    this.usageHistory.push(data);
    
    // Keep only last 90 days
    const cutoff = Date.now() - (90 * 24 * 60 * 60 * 1000);
    this.usageHistory = this.usageHistory.filter(u => u.timestamp > cutoff);
  }

  getUsageHistory(days: number = 30): EnergyUsageData[] {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    return this.usageHistory.filter(u => u.timestamp > cutoff);
  }

  // Advanced calculations
  calculateROI(opportunity: SavingsOpportunity): {
    roi: number; // percentage
    npv: number; // net present value
    irr: number; // internal rate of return
  } {
    const monthlySavings = opportunity.potentialSavings;
    const initialCost = opportunity.implementationCost;
    const years = 5; // 5-year analysis period

    // Simple ROI calculation
    const totalSavings = monthlySavings * 12 * years;
    const roi = ((totalSavings - initialCost) / initialCost) * 100;

    // NPV calculation (assuming 5% discount rate)
    const discountRate = 0.05;
    let npv = -initialCost;
    for (let year = 1; year <= years; year++) {
      npv += (monthlySavings * 12) / Math.pow(1 + discountRate, year);
    }

    // IRR approximation (simplified)
    let irr = 0;
    if (initialCost > 0) {
      irr = (monthlySavings * 12) / initialCost;
    }

    return { roi, npv, irr };
  }
}

// Singleton instance
let savingsCalculator: SavingsCalculator | null = null;

export function getSavingsCalculator(): SavingsCalculator {
  if (!savingsCalculator) {
    savingsCalculator = new SavingsCalculator();
  }
  return savingsCalculator;
}
