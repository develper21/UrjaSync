export interface TariffPeriod {
  id: string;
  name: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  rate: number; // ₹/kWh
  type: 'peak' | 'standard' | 'off_peak';
  days: number[]; // 0-6 (Sunday = 0)
  applicableSeasons?: string[];
}

export interface TariffPlan {
  id: string;
  provider: string;
  name: string;
  periods: TariffPeriod[];
  fixedCharges: number; // ₹/month
  demandCharges: number; // ₹/kW/month
  taxes: number; // percentage
  effectiveFrom: Date;
  effectiveTo?: Date;
}

export interface RealTimeTariff {
  timestamp: number;
  currentRate: number;
  nextRateChange: number;
  nextRate: number;
  isPeakHour: boolean;
  recommendations: string[];
}

export interface TariffComparison {
  currentPlan: TariffPlan;
  alternativePlans: Array<{
    plan: TariffPlan;
    projectedMonthlyCost: number;
    projectedSavings: number;
    savingsPercentage: number;
    recommendation: string;
  }>;
  bestAlternative: {
    plan: TariffPlan;
    savings: number;
    paybackPeriod: number; // months
  };
}

export class TariffIntelligence {
  private currentTariffPlan: TariffPlan | null = null;
  private tariffHistory: RealTimeTariff[] = [];
  private availablePlans: TariffPlan[] = [];

  constructor() {
    this.initializeDefaultTariffPlan();
  }

  private initializeDefaultTariffPlan(): void {
    this.currentTariffPlan = {
      id: 'default_domestic',
      provider: 'Default Utility',
      name: 'Domestic Time-of-Use Tariff',
      periods: [
        {
          id: 'off_peak_1',
          name: 'Off-Peak (Night)',
          startTime: '22:00',
          endTime: '06:00',
          rate: 3.5,
          type: 'off_peak',
          days: [0, 1, 2, 3, 4, 5, 6]
        },
        {
          id: 'standard_1',
          name: 'Standard (Day)',
          startTime: '06:00',
          endTime: '18:00',
          rate: 5.8,
          type: 'standard',
          days: [0, 1, 2, 3, 4, 5, 6]
        },
        {
          id: 'peak_1',
          name: 'Peak (Evening)',
          startTime: '18:00',
          endTime: '22:00',
          rate: 8.2,
          type: 'peak',
          days: [0, 1, 2, 3, 4, 5, 6]
        }
      ],
      fixedCharges: 100,
      demandCharges: 150,
      taxes: 18,
      effectiveFrom: new Date()
    };

    // Add some alternative tariff plans
    this.availablePlans = [
      {
        id: 'fixed_rate',
        provider: 'Alternative Utility',
        name: 'Fixed Rate Plan',
        periods: [
          {
            id: 'fixed_all_day',
            name: 'Fixed Rate',
            startTime: '00:00',
            endTime: '23:59',
            rate: 6.2,
            type: 'standard',
            days: [0, 1, 2, 3, 4, 5, 6]
          }
        ],
        fixedCharges: 80,
        demandCharges: 120,
        taxes: 18,
        effectiveFrom: new Date()
      },
      {
        id: 'smart_tou',
        provider: 'Smart Utility',
        name: 'Smart Time-of-Use',
        periods: [
          {
            id: 'super_off_peak',
            name: 'Super Off-Peak',
            startTime: '00:00',
            endTime: '05:00',
            rate: 2.8,
            type: 'off_peak',
            days: [0, 1, 2, 3, 4, 5, 6]
          },
          {
            id: 'off_peak_2',
            name: 'Off-Peak',
            startTime: '05:00',
            endTime: '17:00',
            rate: 5.2,
            type: 'standard',
            days: [0, 1, 2, 3, 4, 5, 6]
          },
          {
            id: 'peak_2',
            name: 'Peak',
            startTime: '17:00',
            endTime: '22:00',
            rate: 9.5,
            type: 'peak',
            days: [1, 2, 3, 4, 5] // Weekdays only
          },
          {
            id: 'weekend_standard',
            name: 'Weekend Standard',
            startTime: '22:00',
            endTime: '23:59',
            rate: 4.8,
            type: 'standard',
            days: [0, 6] // Weekends
          }
        ],
        fixedCharges: 120,
        demandCharges: 180,
        taxes: 18,
        effectiveFrom: new Date()
      }
    ];
  }

  // Get current tariff rate
  getCurrentTariff(timestamp: number = Date.now()): RealTimeTariff {
    if (!this.currentTariffPlan) {
      throw new Error('No tariff plan configured');
    }

    const now = new Date(timestamp);
    const currentPeriod = this.getCurrentTariffPeriod(now);
    const nextPeriod = this.getNextTariffPeriod(now);

    const currentTariff: RealTimeTariff = {
      timestamp,
      currentRate: currentPeriod.rate,
      nextRateChange: this.getNextRateChangeTime(now),
      nextRate: nextPeriod.rate,
      isPeakHour: currentPeriod.type === 'peak',
      recommendations: this.generateTariffRecommendations(currentPeriod, nextPeriod)
    };

    this.tariffHistory.push(currentTariff);
    
    // Keep only last 24 hours of history
    const cutoff = timestamp - (24 * 60 * 60 * 1000);
    this.tariffHistory = this.tariffHistory.filter(t => t.timestamp > cutoff);

    return currentTariff;
  }

  // Get current tariff period
  private getCurrentTariffPeriod(dateTime: Date): TariffPeriod {
    if (!this.currentTariffPlan) {
      throw new Error('No tariff plan configured');
    }

    const dayOfWeek = dateTime.getDay();
    const currentTime = dateTime.getHours() * 60 + dateTime.getMinutes();

    for (const period of this.currentTariffPlan.periods) {
      if (period.days.includes(dayOfWeek)) {
        const [startHour, startMin] = period.startTime.split(':').map(Number);
        const [endHour, endMin] = period.endTime.split(':').map(Number);
        const startTime = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;

        // Handle overnight periods (e.g., 22:00 - 06:00)
        if (startTime > endTime) {
          if (currentTime >= startTime || currentTime < endTime) {
            return period;
          }
        } else {
          if (currentTime >= startTime && currentTime < endTime) {
            return period;
          }
        }
      }
    }

    // Default to standard period if no match found
    return this.currentTariffPlan.periods.find(p => p.type === 'standard') || this.currentTariffPlan.periods[0];
  }

  // Get next tariff period
  private getNextTariffPeriod(dateTime: Date): TariffPeriod {
    const tomorrow = new Date(dateTime.getTime() + 24 * 60 * 60 * 1000);
    
    // Check remaining periods today
    const currentPeriod = this.getCurrentTariffPeriod(dateTime);
    const remainingPeriods = this.currentTariffPlan!.periods
      .filter(p => p.id !== currentPeriod.id)
      .filter(p => p.days.includes(dateTime.getDay()));

    if (remainingPeriods.length > 0) {
      // Find the next period today
      const currentTime = dateTime.getHours() * 60 + dateTime.getMinutes();
      let nextPeriod = remainingPeriods[0];
      let minTimeDiff = Infinity;

      remainingPeriods.forEach(period => {
        const [startHour, startMin] = period.startTime.split(':').map(Number);
        const startTime = startHour * 60 + startMin;
        const timeDiff = (startTime - currentTime + 24 * 60) % (24 * 60);

        if (timeDiff < minTimeDiff) {
          minTimeDiff = timeDiff;
          nextPeriod = period;
        }
      });

      return nextPeriod;
    }

    // Check tomorrow's first period
    return this.getCurrentTariffPeriod(new Date(tomorrow.setHours(0, 0, 0, 0)));
  }

  // Get next rate change time
  private getNextRateChangeTime(dateTime: Date): number {
    const nextPeriod = this.getNextTariffPeriod(dateTime);
    const [startHour, startMin] = nextPeriod.startTime.split(':').map(Number);
    
    let nextChange = new Date(dateTime);
    nextChange.setHours(startHour, startMin, 0, 0);

    // If the next change is in the past, move to tomorrow
    if (nextChange.getTime() <= dateTime.getTime()) {
      nextChange = new Date(nextChange.getTime() + 24 * 60 * 60 * 1000);
    }

    return nextChange.getTime();
  }

  // Generate tariff recommendations
  private generateTariffRecommendations(currentPeriod: TariffPeriod, nextPeriod: TariffPeriod): string[] {
    const recommendations: string[] = [];

    if (currentPeriod.type === 'peak') {
      recommendations.push('Current hour is peak tariff - minimize energy usage');
      recommendations.push('Delay heavy appliance usage until off-peak hours');
    } else if (currentPeriod.type === 'off_peak') {
      recommendations.push('Current hour is off-peak - ideal for heavy appliance usage');
      recommendations.push('Consider running washing machines, dishwashers now');
    }

    if (nextPeriod.type === 'peak' && currentPeriod.type !== 'peak') {
      recommendations.push(`Peak rate (${nextPeriod.rate} ₹/kWh) starts at ${nextPeriod.startTime}`);
      recommendations.push('Complete energy-intensive tasks before peak hours');
    } else if (nextPeriod.type === 'off_peak' && currentPeriod.type !== 'off_peak') {
      recommendations.push(`Off-peak rate (${nextPeriod.rate} ₹/kWh) starts at ${nextPeriod.startTime}`);
      recommendations.push('Schedule heavy appliances for off-peak hours');
    }

    return recommendations;
  }

  // Compare tariff plans
  compareTariffPlans(monthlyUsage: number, peakUsagePercentage: number): TariffComparison {
    if (!this.currentTariffPlan) {
      throw new Error('No current tariff plan configured');
    }

    const currentCost = this.calculateMonthlyCost(this.currentTariffPlan, monthlyUsage, peakUsagePercentage);
    
    const alternativePlans = this.availablePlans.map(plan => {
      const altCost = this.calculateMonthlyCost(plan, monthlyUsage, peakUsagePercentage);
      const savings = currentCost - altCost;
      const savingsPercentage = (savings / currentCost) * 100;

      return {
        plan,
        projectedMonthlyCost: altCost,
        projectedSavings: savings,
        savingsPercentage,
        recommendation: this.generatePlanRecommendation(savings, savingsPercentage, plan)
      };
    }).filter(alt => alt.projectedSavings > 0).sort((a, b) => b.projectedSavings - a.projectedSavings);

    const bestAlternative = alternativePlans[0] || null;

    return {
      currentPlan: this.currentTariffPlan,
      alternativePlans,
      bestAlternative: bestAlternative ? {
        plan: bestAlternative.plan,
        savings: bestAlternative.projectedSavings,
        paybackPeriod: this.calculatePaybackPeriod(bestAlternative.projectedSavings, 500) // Assuming ₹500 switching cost
      } : {
        plan: this.currentTariffPlan,
        savings: 0,
        paybackPeriod: Infinity
      }
    };
  }

  // Calculate monthly cost for a tariff plan
  private calculateMonthlyCost(plan: TariffPlan, monthlyUsage: number, peakUsagePercentage: number): number {
    const peakUsage = monthlyUsage * (peakUsagePercentage / 100);
    const standardUsage = monthlyUsage * 0.6; // Assume 60% standard usage
    const offPeakUsage = monthlyUsage - peakUsage - standardUsage;

    // Find rates for each period type
    const peakRate = plan.periods.find(p => p.type === 'peak')?.rate || plan.periods[0].rate;
    const standardRate = plan.periods.find(p => p.type === 'standard')?.rate || plan.periods[0].rate;
    const offPeakRate = plan.periods.find(p => p.type === 'off_peak')?.rate || plan.periods[0].rate;

    const energyCost = (peakUsage * peakRate) + (standardUsage * standardRate) + (offPeakUsage * offPeakRate);
    const totalCost = energyCost + plan.fixedCharges + plan.demandCharges;
    const withTaxes = totalCost * (1 + plan.taxes / 100);

    return withTaxes;
  }

  // Generate plan recommendation
  private generatePlanRecommendation(savings: number, savingsPercentage: number, plan: TariffPlan): string {
    if (savingsPercentage > 20) {
      return `Excellent choice! Save ₹${savings.toFixed(0)}/month (${savingsPercentage.toFixed(1)}%) with ${plan.name}`;
    } else if (savingsPercentage > 10) {
      return `Good option! Save ₹${savings.toFixed(0)}/month (${savingsPercentage.toFixed(1)}%) with ${plan.name}`;
    } else if (savingsPercentage > 5) {
      return `Modest savings of ₹${savings.toFixed(0)}/month (${savingsPercentage.toFixed(1)}%) with ${plan.name}`;
    } else {
      return `Minor savings of ₹${savings.toFixed(0)}/month with ${plan.name}`;
    }
  }

  // Calculate payback period
  private calculatePaybackPeriod(monthlySavings: number, switchingCost: number): number {
    if (monthlySavings <= 0) return Infinity;
    return Math.ceil(switchingCost / monthlySavings);
  }

  // Get optimal usage schedule
  getOptimalUsageSchedule(tasks: Array<{ name: string; duration: number; flexibility: number }>): Array<{
    task: string;
    scheduledTime: string;
    estimatedCost: number;
    savings: number;
  }> {
    const schedule = [];

    for (const task of tasks) {
      const bestTime = this.findBestTimeForTask(task.duration, task.flexibility);
      const worstTime = this.findWorstTimeForTask(task.duration);
      
      const bestCost = this.calculateTaskCost(task.duration, bestTime);
      const worstCost = this.calculateTaskCost(task.duration, worstTime);
      const savings = worstCost - bestCost;

      schedule.push({
        task: task.name,
        scheduledTime: new Date(bestTime).toLocaleTimeString(),
        estimatedCost: bestCost,
        savings
      });
    }

    return schedule.sort((a, b) => b.savings - a.savings);
  }

  // Find best time for task
  private findBestTimeForTask(duration: number, flexibilityHours: number): number {
    const now = Date.now();
    const windowEnd = now + (flexibilityHours * 60 * 60 * 1000);
    
    let bestTime = now;
    let minCost = Infinity;

    for (let time = now; time <= windowEnd; time += 15 * 60 * 1000) { // Check every 15 minutes
      const cost = this.calculateTaskCost(duration, time);
      if (cost < minCost) {
        minCost = cost;
        bestTime = time;
      }
    }

    return bestTime;
  }

  // Find worst time for task
  private findWorstTimeForTask(duration: number): number {
    const now = Date.now();
    const windowEnd = now + (24 * 60 * 60 * 1000); // Next 24 hours
    
    let worstTime = now;
    let maxCost = 0;

    for (let time = now; time <= windowEnd; time += 15 * 60 * 1000) {
      const cost = this.calculateTaskCost(duration, time);
      if (cost > maxCost) {
        maxCost = cost;
        worstTime = time;
      }
    }

    return worstTime;
  }

  // Calculate task cost
  private calculateTaskCost(duration: number, startTime: number): number {
    const endTime = startTime + (duration * 60 * 60 * 1000);
    let totalCost = 0;

    for (let time = startTime; time < endTime; time += 60 * 60 * 1000) { // Hour by hour
      const tariff = this.getCurrentTariff(time);
      totalCost += tariff.currentRate; // Assuming 1 kWh per hour
    }

    return totalCost;
  }

  // Getters and setters
  setCurrentTariffPlan(plan: TariffPlan): void {
    this.currentTariffPlan = plan;
  }

  getCurrentTariffPlan(): TariffPlan | null {
    return this.currentTariffPlan;
  }

  getAvailablePlans(): TariffPlan[] {
    return this.availablePlans;
  }

  addAvailablePlan(plan: TariffPlan): void {
    this.availablePlans.push(plan);
  }

  getTariffHistory(hours: number = 24): RealTimeTariff[] {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    return this.tariffHistory.filter(t => t.timestamp > cutoff);
  }
}

// Singleton instance
let tariffIntelligence: TariffIntelligence | null = null;

export function getTariffIntelligence(): TariffIntelligence {
  if (!tariffIntelligence) {
    tariffIntelligence = new TariffIntelligence();
  }
  return tariffIntelligence;
}
