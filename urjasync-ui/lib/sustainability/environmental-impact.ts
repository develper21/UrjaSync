import { ImpactCategory, ImpactFactor, ImpactComparison, ImpactTrend, ImpactRecommendation, EnvironmentalCertification } from './types';
import { v4 as uuidv4 } from 'uuid';

interface ImpactData {
  id: string;
  userId: string;
  period: { startDate: Date; endDate: Date };
  overallScore: number;
  categories: ImpactCategory[];
  comparisons: ImpactComparison[];
  trends: ImpactTrend[];
  recommendations: ImpactRecommendation[];
  certifications: EnvironmentalCertification[];
  createdAt: Date;
  updatedAt: Date;
}

export class EnvironmentalImpact {
  private impacts: Map<string, ImpactData> = new Map();
  private impactFactors: Map<string, ImpactFactorDefinition> = new Map();
  private benchmarks: Map<string, BenchmarkData> = new Map();
  private certifications: Map<string, EnvironmentalCertification> = new Map();

  constructor() {
    this.initializeImpactFactors();
    this.initializeBenchmarks();
  }

  // Impact Assessment
  async assessEnvironmentalImpact(userId: string, period: { startDate: Date; endDate: Date }, metricsData: MetricsData): Promise<ImpactData> {
    try {
      const categories = await this.calculateImpactCategories(metricsData);
      const comparisons = await this.calculateImpactComparisons(userId, categories);
      const trends = await this.calculateImpactTrends(userId, period, categories);
      const recommendations = await this.generateImpactRecommendations(categories);
      const certifications = Array.from(this.certifications.values());

      const overallScore = this.calculateOverallScore(categories);

      const impact: ImpactData = {
        id: uuidv4(),
        userId,
        period,
        overallScore,
        categories,
        comparisons,
        trends,
        recommendations,
        certifications,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.impacts.set(impact.id, impact);
      return impact;
    } catch (error) {
      throw new Error(`Failed to assess environmental impact: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateEnvironmentalImpact(impactId: string, updates: Partial<ImpactData>): Promise<ImpactData> {
    const impact = this.impacts.get(impactId);
    if (!impact) {
      throw new Error('Environmental impact assessment not found');
    }

    const updatedImpact = {
      ...impact,
      ...updates,
      updatedAt: new Date()
    };

    // Recalculate overall score if categories changed
    if (updates.categories) {
      updatedImpact.overallScore = this.calculateOverallScore(updatedImpact.categories);
    }

    this.impacts.set(impactId, updatedImpact);
    return updatedImpact;
  }

  getEnvironmentalImpact(impactId: string): ImpactData | undefined {
    return this.impacts.get(impactId);
  }

  getUserEnvironmentalImpacts(userId: string, filters?: ImpactFilters): ImpactData[] {
    const userImpacts = Array.from(this.impacts.values())
      .filter(impact => impact.userId === userId);

    return this.applyImpactFilters(userImpacts, filters);
  }

  // Impact Categories
  private async calculateImpactCategories(metricsData: MetricsData): Promise<ImpactCategory[]> {
    const categories: ImpactCategory[] = [];

    // Energy Impact
    const energyScore = this.calculateEnergyImpact(metricsData);
    categories.push({
      name: 'Energy Consumption',
      score: energyScore,
      weight: 0.3,
      impact: this.getImpactLevel(energyScore),
      trend: 'stable',
      factors: this.getEnergyFactors(metricsData)
    });

    // Carbon Impact
    const carbonScore = this.calculateCarbonImpact(metricsData);
    categories.push({
      name: 'Carbon Footprint',
      score: carbonScore,
      weight: 0.25,
      impact: this.getImpactLevel(carbonScore),
      trend: 'stable',
      factors: this.getCarbonFactors(metricsData)
    });

    // Water Impact
    const waterScore = this.calculateWaterImpact(metricsData);
    categories.push({
      name: 'Water Usage',
      score: waterScore,
      weight: 0.2,
      impact: this.getImpactLevel(waterScore),
      trend: 'stable',
      factors: this.getWaterFactors(metricsData)
    });

    // Waste Impact
    const wasteScore = this.calculateWasteImpact(metricsData);
    categories.push({
      name: 'Waste Management',
      score: wasteScore,
      weight: 0.15,
      impact: this.getImpactLevel(wasteScore),
      trend: 'stable',
      factors: this.getWasteFactors(metricsData)
    });

    // Transportation Impact
    const transportScore = this.calculateTransportImpact(metricsData);
    categories.push({
      name: 'Transportation',
      score: transportScore,
      weight: 0.1,
      impact: this.getImpactLevel(transportScore),
      trend: 'stable',
      factors: this.getTransportFactors(metricsData)
    });

    return categories;
  }

  private calculateEnergyImpact(metricsData: MetricsData): number {
    const energyMetrics = metricsData.energy;
    let score = 100; // Start with perfect score

    // Deduct points for high consumption
    if (energyMetrics.totalConsumption > 500) {
      score -= 20;
    } else if (energyMetrics.totalConsumption > 300) {
      score -= 10;
    }

    // Add points for efficiency
    if (energyMetrics.efficiency > 80) {
      score += 10;
    } else if (energyMetrics.efficiency > 60) {
      score += 5;
    }

    // Add points for renewable energy
    if (energyMetrics.renewablePercentage > 50) {
      score += 15;
    } else if (energyMetrics.renewablePercentage > 25) {
      score += 10;
    } else if (energyMetrics.renewablePercentage > 10) {
      score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateCarbonImpact(metricsData: MetricsData): number {
    const carbonMetrics = metricsData.carbon;
    let score = 100;

    // Deduct points for high emissions
    if (carbonMetrics.totalEmissions > 1000) {
      score -= 30;
    } else if (carbonMetrics.totalEmissions > 500) {
      score -= 15;
    } else if (carbonMetrics.totalEmissions > 200) {
      score -= 5;
    }

    // Add points for being on track with targets
    if (carbonMetrics.onTrackForTarget) {
      score += 10;
    }

    // Add points for reduction
    if (carbonMetrics.reductionFromBaseline > 20) {
      score += 20;
    } else if (carbonMetrics.reductionFromBaseline > 10) {
      score += 10;
    } else if (carbonMetrics.reductionFromBaseline > 5) {
      score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateWaterImpact(metricsData: MetricsData): number {
    const waterMetrics = metricsData.water;
    let score = 100;

    // Deduct points for high consumption
    if (waterMetrics.totalConsumption > 15000) { // > 15,000 liters per month
      score -= 20;
    } else if (waterMetrics.totalConsumption > 10000) {
      score -= 10;
    } else if (waterMetrics.totalConsumption > 5000) {
      score -= 5;
    }

    // Add points for conservation
    if (waterMetrics.conservationRate > 30) {
      score += 15;
    } else if (waterMetrics.conservationRate > 20) {
      score += 10;
    } else if (waterMetrics.conservationRate > 10) {
      score += 5;
    }

    // Add points for recycling
    if (waterMetrics.recycledWater > 1000) {
      score += 10;
    } else if (waterMetrics.recycledWater > 500) {
      score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateWasteImpact(metricsData: MetricsData): number {
    const wasteMetrics = metricsData.waste;
    let score = 100;

    // Deduct points for high waste generation
    if (wasteMetrics.totalWaste > 100) { // > 100 kg per month
      score -= 20;
    } else if (wasteMetrics.totalWaste > 50) {
      score -= 10;
    } else if (wasteMetrics.totalWaste > 25) {
      score -= 5;
    }

    // Add points for recycling
    if (wasteMetrics.recyclingRate > 75) {
      score += 20;
    } else if (wasteMetrics.recyclingRate > 50) {
      score += 15;
    } else if (wasteMetrics.recyclingRate > 25) {
      score += 10;
    } else if (wasteMetrics.recyclingRate > 10) {
      score += 5;
    }

    // Add points for reduction
    if (wasteMetrics.reductionFromBaseline > 20) {
      score += 10;
    } else if (wasteMetrics.reductionFromBaseline > 10) {
      score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateTransportImpact(metricsData: MetricsData): number {
    const transportMetrics = metricsData.transportation;
    let score = 100;

    // Deduct points for high emissions
    if (transportMetrics.emissions > 200) { // > 200 kg CO2 per month
      score -= 25;
    } else if (transportMetrics.emissions > 100) {
      score -= 15;
    } else if (transportMetrics.emissions > 50) {
      score -= 5;
    }

    // Add points for sustainable transport
    if (transportMetrics.publicTransportPercentage > 50) {
      score += 15;
    } else if (transportMetrics.publicTransportPercentage > 25) {
      score += 10;
    } else if (transportMetrics.publicTransportPercentage > 10) {
      score += 5;
    }

    if (transportMetrics.activeTransportPercentage > 30) {
      score += 10;
    } else if (transportMetrics.activeTransportPercentage > 15) {
      score += 5;
    }

    if (transportMetrics.electricVehiclePercentage > 50) {
      score += 15;
    } else if (transportMetrics.electricVehiclePercentage > 25) {
      score += 10;
    } else if (transportMetrics.electricVehiclePercentage > 10) {
      score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  private getImpactLevel(score: number): 'low' | 'medium' | 'high' {
    if (score >= 80) return 'low';
    if (score >= 60) return 'medium';
    return 'high';
  }

  // Factor Methods
  private getEnergyFactors(metricsData: MetricsData): ImpactFactor[] {
    const factors: ImpactFactor[] = [];

    factors.push({
      name: 'Total Energy Consumption',
      value: metricsData.energy.totalConsumption,
      unit: 'kWh',
      impact: metricsData.energy.totalConsumption > 300 ? 'negative' : 'neutral',
      description: 'Monthly energy consumption'
    });

    factors.push({
      name: 'Energy Efficiency',
      value: metricsData.energy.efficiency,
      unit: '%',
      impact: metricsData.energy.efficiency > 70 ? 'positive' : 'negative',
      description: 'Energy efficiency rating'
    });

    factors.push({
      name: 'Renewable Energy Percentage',
      value: metricsData.energy.renewablePercentage,
      unit: '%',
      impact: metricsData.energy.renewablePercentage > 25 ? 'positive' : 'negative',
      description: 'Percentage of renewable energy used'
    });

    return factors;
  }

  private getCarbonFactors(metricsData: MetricsData): ImpactFactor[] {
    const factors: ImpactFactor[] = [];

    factors.push({
      name: 'Carbon Emissions',
      value: metricsData.carbon.totalEmissions,
      unit: 'kg CO2',
      impact: metricsData.carbon.totalEmissions > 500 ? 'negative' : 'neutral',
      description: 'Monthly carbon emissions'
    });

    factors.push({
      name: 'Carbon Reduction',
      value: metricsData.carbon.reductionFromBaseline,
      unit: '%',
      impact: metricsData.carbon.reductionFromBaseline > 0 ? 'positive' : 'negative',
      description: 'Reduction from baseline emissions'
    });

    return factors;
  }

  private getWaterFactors(metricsData: MetricsData): ImpactFactor[] {
    const factors: ImpactFactor[] = [];

    factors.push({
      name: 'Water Consumption',
      value: metricsData.water.totalConsumption,
      unit: 'liters',
      impact: metricsData.water.totalConsumption > 10000 ? 'negative' : 'neutral',
      description: 'Monthly water consumption'
    });

    factors.push({
      name: 'Water Conservation Rate',
      value: metricsData.water.conservationRate,
      unit: '%',
      impact: metricsData.water.conservationRate > 20 ? 'positive' : 'negative',
      description: 'Percentage of water conserved'
    });

    return factors;
  }

  private getWasteFactors(metricsData: MetricsData): ImpactFactor[] {
    const factors: ImpactFactor[] = [];

    factors.push({
      name: 'Waste Generation',
      value: metricsData.waste.totalWaste,
      unit: 'kg',
      impact: metricsData.waste.totalWaste > 50 ? 'negative' : 'neutral',
      description: 'Monthly waste generation'
    });

    factors.push({
      name: 'Recycling Rate',
      value: metricsData.waste.recyclingRate,
      unit: '%',
      impact: metricsData.waste.recyclingRate > 50 ? 'positive' : 'negative',
      description: 'Percentage of waste recycled'
    });

    return factors;
  }

  private getTransportFactors(metricsData: MetricsData): ImpactFactor[] {
    const factors: ImpactFactor[] = [];

    factors.push({
      name: 'Transport Emissions',
      value: metricsData.transportation.emissions,
      unit: 'kg CO2',
      impact: metricsData.transportation.emissions > 100 ? 'negative' : 'neutral',
      description: 'Monthly transport emissions'
    });

    factors.push({
      name: 'Sustainable Transport',
      value: metricsData.transportation.publicTransportPercentage + metricsData.transportation.activeTransportPercentage,
      unit: '%',
      impact: metricsData.transportation.publicTransportPercentage + metricsData.transportation.activeTransportPercentage > 50 ? 'positive' : 'negative',
      description: 'Percentage of sustainable transport used'
    });

    return factors;
  }

  // Comparisons
  private async calculateImpactComparisons(_userId: string, categories: ImpactCategory[]): Promise<ImpactComparison[]> {
    const comparisons: ImpactComparison[] = [];

    // Regional comparison
    const regionalBenchmark = this.benchmarks.get('regional');
    if (regionalBenchmark) {
      const overallScore = this.calculateOverallScore(categories);
      comparisons.push({
        type: 'regional',
        entity: 'Your Region',
        score: overallScore,
        ranking: Math.floor(Math.random() * 100) + 1, // Mock ranking
        percentile: this.calculatePercentile(overallScore, regionalBenchmark)
      });
    }

    // National comparison
    const nationalBenchmark = this.benchmarks.get('national');
    if (nationalBenchmark) {
      const overallScore = this.calculateOverallScore(categories);
      comparisons.push({
        type: 'national',
        entity: 'National Average',
        score: overallScore,
        ranking: Math.floor(Math.random() * 1000) + 1, // Mock ranking
        percentile: this.calculatePercentile(overallScore, nationalBenchmark)
      });
    }

    // Global comparison
    const globalBenchmark = this.benchmarks.get('global');
    if (globalBenchmark) {
      const overallScore = this.calculateOverallScore(categories);
      comparisons.push({
        type: 'global',
        entity: 'Global Average',
        score: overallScore,
        ranking: Math.floor(Math.random() * 10000) + 1, // Mock ranking
        percentile: this.calculatePercentile(overallScore, globalBenchmark)
      });
    }

    return comparisons;
  }

  // Trends
  private async calculateImpactTrends(_userId: string, period: { startDate: Date; endDate: Date }, categories: ImpactCategory[]): Promise<ImpactTrend[]> {
    const trends: ImpactTrend[] = [];
    
    // Mock trend data - in production would calculate from historical data
    const months = Math.ceil((period.endDate.getTime() - period.startDate.getTime()) / (30 * 24 * 60 * 60 * 1000));
    
    for (let i = 0; i < Math.min(months, 12); i++) {
      const trendDate = new Date(period.startDate.getTime() + (i * 30 * 24 * 60 * 60 * 1000));
      const score = this.calculateOverallScore(categories) + (Math.random() - 0.5) * 10;
      const change = i > 0 ? score - (this.calculateOverallScore(categories) + (Math.random() - 0.5) * 10) : 0;
      
      trends.push({
        period: trendDate.toISOString().split('T')[0],
        score: Math.max(0, Math.min(100, score)),
        change: change,
        significant: Math.abs(change) > 5,
        factors: ['Energy consumption', 'Weather patterns', 'Behavioral changes']
      });
    }

    return trends;
  }

  // Recommendations
  private async generateImpactRecommendations(categories: ImpactCategory[]): Promise<ImpactRecommendation[]> {
    const recommendations: ImpactRecommendation[] = [];

    categories.forEach(category => {
      if (category.score < 60) {
        recommendations.push({
          id: uuidv4(),
          priority: category.impact === 'high' ? 'high' : 'medium',
          category: category.name,
          title: `Improve ${category.name}`,
          description: `Your ${category.name.toLowerCase()} impact is ${category.impact}. Consider taking action to improve this area.`,
          potentialImpact: 100 - category.score,
          effort: 'medium',
          cost: 'medium',
          timeline: '3-6 months',
          implemented: false
        });
      }
    });

    // Add specific recommendations based on factors
    categories.forEach(category => {
      category.factors.forEach(factor => {
        if (factor.impact === 'negative') {
          recommendations.push({
            id: uuidv4(),
            priority: 'medium',
            category: category.name,
            title: `Address ${factor.name}`,
            description: `Your ${factor.name.toLowerCase()} is above recommended levels.`,
            potentialImpact: 15,
            effort: 'low',
            cost: 'low',
            timeline: '1-3 months',
            implemented: false
          });
        }
      });
    });

    return recommendations.slice(0, 10); // Limit to top 10 recommendations
  }

  // Certifications
  async getUserImpacts(userId: string): Promise<ImpactData[]> {
    return Array.from(this.impacts.values())
      .filter(impact => impact.userId === userId);
  }

  async applyForCertification(_userId: string, certificationType: string, _data: CertificationApplication): Promise<EnvironmentalCertification> {
    const certification: EnvironmentalCertification = {
      id: uuidv4(),
      name: certificationType,
      issuer: 'Environmental Standards Authority',
      level: 'bronze',
      score: 75,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      criteria: ['Energy Efficiency', 'Carbon Reduction', 'Waste Management']
    };

    this.certifications.set(certification.id, certification);
    return certification;
  }

  // Utility Methods
  private calculateOverallScore(categories: ImpactCategory[]): number {
    let totalScore = 0;
    let totalWeight = 0;

    categories.forEach(category => {
      totalScore += category.score * category.weight;
      totalWeight += category.weight;
    });

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  private calculatePercentile(score: number, benchmark: BenchmarkData): number {
    // Mock percentile calculation - in production would use actual distribution
    const average = benchmark.averageScore;
    const standardDeviation = benchmark.standardDeviation;
    
    if (standardDeviation === 0) return 50;
    
    const zScore = (score - average) / standardDeviation;
    const percentile = (1 + Math.sign(zScore) * Math.sqrt(1 - Math.exp(-2 * zScore * zScore / Math.PI)) / 2) * 100;
    
    return Math.max(0, Math.min(100, percentile));
  }

  // Initialization Methods
  private initializeImpactFactors(): void {
    // Energy impact factors
    this.impactFactors.set('energy_consumption', {
      name: 'Energy Consumption',
      description: 'Impact of energy consumption on environment',
      unit: 'kWh',
      weight: 0.3
    });

    this.impactFactors.set('carbon_emissions', {
      name: 'Carbon Emissions',
      description: 'CO2 emissions from energy usage',
      unit: 'kg CO2',
      weight: 0.4
    });

    this.impactFactors.set('water_usage', {
      name: 'Water Usage',
      description: 'Water consumption impact',
      unit: 'liters',
      weight: 0.2
    });

    this.impactFactors.set('waste_generation', {
      name: 'Waste Generation',
      description: 'Environmental impact of waste',
      unit: 'kg',
      weight: 0.1
    });
  }

  private initializeBenchmarks(): void {
    // Regional benchmark
    this.benchmarks.set('regional', {
      region: 'default',
      averageScore: 65,
      standardDeviation: 15,
      sampleSize: 1000,
      lastUpdated: new Date()
    });

    // National benchmark
    this.benchmarks.set('national', {
      region: 'national',
      averageScore: 60,
      standardDeviation: 20,
      sampleSize: 10000,
      lastUpdated: new Date()
    });

    // Global benchmark
    this.benchmarks.set('global', {
      region: 'global',
      averageScore: 55,
      standardDeviation: 25,
      sampleSize: 100000,
      lastUpdated: new Date()
    });
  }

  
  // Filter Methods
  private applyImpactFilters(impacts: ImpactData[], filters?: ImpactFilters): ImpactData[] {
    if (!filters) return impacts;

    return impacts.filter(impact => {
      if (filters.period) {
        if (impact.period.startDate < filters.period.startDate || impact.period.endDate > filters.period.endDate) {
          return false;
        }
      }
      if (filters.minScore && impact.overallScore < filters.minScore) return false;
      if (filters.maxScore && impact.overallScore > filters.maxScore) return false;
      return true;
    });
  }
}

// Supporting Types
interface ImpactFactorDefinition {
  name: string;
  description: string;
  unit: string;
  weight: number;
}

interface BenchmarkData {
  region: string;
  averageScore: number;
  standardDeviation: number;
  sampleSize: number;
  lastUpdated: Date;
}

interface MetricsData {
  energy: {
    totalConsumption: number;
    efficiency: number;
    renewablePercentage: number;
    peakUsage: number;
    offPeakUsage: number;
  };
  carbon: {
    totalEmissions: number;
    emissionsPerDay: number;
    reductionFromBaseline: number;
    onTrackForTarget: boolean;
    mainSources: { source: string; percentage: number }[];
  };
  water: {
    totalConsumption: number;
    consumptionPerDay: number;
    recycledWater: number;
    conservationRate: number;
    mainUses: { use: string; percentage: number }[];
  };
  waste: {
    totalWaste: number;
    recycledWaste: number;
    recyclingRate: number;
    reductionFromBaseline: number;
    wasteByType: { type: string; amount: number }[];
  };
  transportation: {
    totalDistance: number;
    publicTransportPercentage: number;
    activeTransportPercentage: number;
    electricVehiclePercentage: number;
    emissions: number;
  };
}

interface ImpactFilters {
  period?: { startDate: Date; endDate: Date };
  minScore?: number;
  maxScore?: number;
}

interface CertificationApplication {
  documentation: string[];
  evidence: any[];
  declarations: string[];
}

// Singleton instance
let environmentalImpactInstance: EnvironmentalImpact | null = null;

export function getEnvironmentalImpact(): EnvironmentalImpact {
  if (!environmentalImpactInstance) {
    environmentalImpactInstance = new EnvironmentalImpact();
  }
  return environmentalImpactInstance;
}
