// Cost Optimization Module Entry Point
// Export all cost optimization classes and interfaces

export * from './tariff-intelligence';
export * from './automation-engine';
export * from './savings-calculator';
export * from './budget-manager';

// Main cost optimization orchestrator
import { getTariffIntelligence } from './tariff-intelligence';
import { getAutomationEngine } from './automation-engine';
import { getSavingsCalculator } from './savings-calculator';
import { getBudgetManager } from './budget-manager';

export interface CostOptimizationConfig {
  enableAutomation: boolean;
  enableBudgetTracking: boolean;
  enableSavingsAnalysis: boolean;
  automationCheckInterval: number; // minutes
  budgetAlertThreshold: number; // percentage
}

export interface CostOptimizationStatus {
  isRunning: boolean;
  automationEngineActive: boolean;
  budgetTrackingActive: boolean;
  lastAnalysis: number;
  totalSavings: number;
  budgetUtilization: number;
  activeRules: number;
  activeBudgets: number;
}

export class CostOptimizationManager {
  private tariffIntelligence = getTariffIntelligence();
  private automationEngine = getAutomationEngine();
  private savingsCalculator = getSavingsCalculator();
  private budgetManager = getBudgetManager();
  
  private config: CostOptimizationConfig = {
    enableAutomation: true,
    enableBudgetTracking: true,
    enableSavingsAnalysis: true,
    automationCheckInterval: 1,
    budgetAlertThreshold: 80
  };

  private isInitialized = false;

  // Initialize the cost optimization system
  async initialize(config?: Partial<CostOptimizationConfig>): Promise<void> {
    if (this.isInitialized) {
      console.log('🔄 Cost optimization already initialized');
      return;
    }

    if (config) {
      this.config = { ...this.config, ...config };
    }

    console.log('🚀 Initializing Cost Optimization System...');

    try {
      // Initialize tariff intelligence
      console.log('⚡ Initializing tariff intelligence...');
      this.tariffIntelligence.getCurrentTariff();

      // Initialize automation engine if enabled
      if (this.config.enableAutomation) {
        console.log('🤖 Starting automation engine...');
        this.automationEngine.start();
      }

      // Initialize budget tracking if enabled
      if (this.config.enableBudgetTracking) {
        console.log('💰 Initializing budget tracking...');
        const budgets = this.budgetManager.getActiveBudgets();
        console.log(`📊 Active budgets: ${budgets.length}`);
      }

      // Initialize savings analysis if enabled
      if (this.config.enableSavingsAnalysis) {
        console.log('📈 Initializing savings analysis...');
        const savings = this.savingsCalculator.calculateSavingsAnalysis();
        console.log(`💎 Current savings: ₹${savings.totalSavings.toFixed(2)}`);
      }

      this.isInitialized = true;
      console.log('✅ Cost optimization system initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize cost optimization:', error);
      throw error;
    }
  }

  // Get current status
  getStatus(): CostOptimizationStatus {
    const savings = this.savingsCalculator.calculateSavingsAnalysis();
    const activeBudgets = this.budgetManager.getActiveBudgets();
    const budgetUtilization = activeBudgets.length > 0 
      ? activeBudgets.reduce((sum, budget) => {
          const report = this.budgetManager.generateBudgetReport(budget.id);
          return sum + (report?.utilizationRate || 0);
        }, 0) / activeBudgets.length
      : 0;

    return {
      isRunning: this.isInitialized,
      automationEngineActive: this.config.enableAutomation,
      budgetTrackingActive: this.config.enableBudgetTracking,
      lastAnalysis: Date.now(),
      totalSavings: savings.totalSavings,
      budgetUtilization,
      activeRules: this.automationEngine.getEnabledRules().length,
      activeBudgets: activeBudgets.length
    };
  }

  // Get comprehensive dashboard data
  getDashboardData(): {
    currentTariff: any;
    savings: any;
    budget: any;
    automation: any;
    opportunities: any;
  } {
    const currentTariff = this.tariffIntelligence.getCurrentTariff();
    const savings = this.savingsCalculator.calculateSavingsAnalysis();
    const budget = this.budgetManager.getBudgetInsights();
    const automation = this.automationEngine.getStatistics();
    const opportunities = this.savingsCalculator.getSavingsOpportunities();

    return {
      currentTariff,
      savings,
      budget,
      automation,
      opportunities
    };
  }

  // Update configuration
  updateConfig(updates: Partial<CostOptimizationConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...updates };

    // Apply configuration changes
    if (oldConfig.enableAutomation !== this.config.enableAutomation) {
      if (this.config.enableAutomation) {
        this.automationEngine.start();
      } else {
        this.automationEngine.stop();
      }
    }

    console.log('⚙️ Cost optimization configuration updated');
  }

  // Shutdown the system
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Cost Optimization System...');

    try {
      // Stop automation engine
      this.automationEngine.stop();

      // Cleanup resources
      this.automationEngine.destroy();

      this.isInitialized = false;
      console.log('✅ Cost optimization system shutdown complete');

    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      throw error;
    }
  }

  // Quick analysis methods
  async quickSavingsAnalysis(): Promise<any> {
    return this.savingsCalculator.calculateSavingsAnalysis();
  }

  async quickBudgetCheck(): Promise<any> {
    const budgets = this.budgetManager.getActiveBudgets();
    return budgets.map(budget => this.budgetManager.generateBudgetReport(budget.id));
  }

  async quickTariffComparison(): Promise<any> {
    const usage = this.savingsCalculator.getUsageHistory(30);
    const totalUsage = usage.reduce((sum, u) => sum + u.consumption, 0);
    const peakUsage = usage.filter(u => u.period === 'peak').reduce((sum, u) => sum + u.consumption, 0);
    const peakPercentage = totalUsage > 0 ? (peakUsage / totalUsage) * 100 : 0;

    return this.tariffIntelligence.compareTariffPlans(totalUsage, peakPercentage);
  }

  // Export data for reporting
  exportData(): {
    timestamp: number;
    tariff: any;
    savings: any;
    budget: any;
    automation: any;
  } {
    return {
      timestamp: Date.now(),
      tariff: {
        current: this.tariffIntelligence.getCurrentTariffPlan(),
        history: this.tariffIntelligence.getTariffHistory(24)
      },
      savings: {
        analysis: this.savingsCalculator.calculateSavingsAnalysis(),
        opportunities: this.savingsCalculator.getSavingsOpportunities(),
        usage: this.savingsCalculator.getUsageHistory(30)
      },
      budget: {
        budgets: this.budgetManager.getAllBudgets(),
        insights: this.budgetManager.getBudgetInsights(),
        goals: this.budgetManager.getAllGoals()
      },
      automation: {
        rules: this.automationEngine.getAllRules(),
        executions: this.automationEngine.getExecutions(),
        statistics: this.automationEngine.getStatistics()
      }
    };
  }
}

// Singleton instance
let costOptimizationManager: CostOptimizationManager | null = null;

export function getCostOptimizationManager(): CostOptimizationManager {
  if (!costOptimizationManager) {
    costOptimizationManager = new CostOptimizationManager();
  }
  return costOptimizationManager;
}

// Convenience exports for direct usage
export { getTariffIntelligence, getAutomationEngine, getSavingsCalculator, getBudgetManager };
