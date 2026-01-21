import { CarbonFootprint, EmissionsBySource, EmissionsByCategory, BaselineComparison, ReductionTarget, CarbonAchievement } from './types';
import { v4 as uuidv4 } from 'uuid';

export class CarbonTracker {
  private carbonFootprints: Map<string, CarbonFootprint> = new Map();
  private emissionFactors: Map<string, EmissionFactor> = new Map();
  private baselines: Map<string, BaselineData> = new Map();

  constructor() {
    this.initializeEmissionFactors();
    this.initializeBaselines();
  }

  // Carbon Footprint Management
  async calculateCarbonFootprint(userId: string, period: { startDate: Date; endDate: Date }, consumptionData: ConsumptionData): Promise<CarbonFootprint> {
    try {
      const emissionsBySource = this.calculateEmissionsBySource(consumptionData);
      const emissionsByCategory = this.calculateEmissionsByCategory(consumptionData);
      const baselineComparison = this.calculateBaselineComparison(userId, period, emissionsBySource);
      const reductionTargets = await this.getReductionTargets(userId);
      const achievements = await this.calculateAchievements(userId, emissionsBySource);

      const carbonFootprint: CarbonFootprint = {
        id: uuidv4(),
        userId,
        period,
        totalEmissions: this.calculateTotalEmissions(emissionsBySource),
        emissionsBySource,
        emissionsByCategory,
        baselineComparison,
        reductionTargets,
        achievements,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.carbonFootprints.set(carbonFootprint.id, carbonFootprint);
      return carbonFootprint;
    } catch (error) {
      throw new Error(`Failed to calculate carbon footprint: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateCarbonFootprint(footprintId: string, updates: Partial<CarbonFootprint>): Promise<CarbonFootprint> {
    const footprint = this.carbonFootprints.get(footprintId);
    if (!footprint) {
      throw new Error('Carbon footprint not found');
    }

    const updatedFootprint = {
      ...footprint,
      ...updates,
      updatedAt: new Date()
    };

    // Recalculate totals if emissions data changed
    if (updates.emissionsBySource) {
      updatedFootprint.totalEmissions = this.calculateTotalEmissions(updatedFootprint.emissionsBySource);
    }

    this.carbonFootprints.set(footprintId, updatedFootprint);
    return updatedFootprint;
  }

  getCarbonFootprint(footprintId: string): CarbonFootprint | undefined {
    return this.carbonFootprints.get(footprintId);
  }

  getUserCarbonFootprints(userId: string, filters?: CarbonFootprintFilters): CarbonFootprint[] {
    const userFootprints = Array.from(this.carbonFootprints.values())
      .filter(footprint => footprint.userId === userId);

    return this.applyCarbonFootprintFilters(userFootprints, filters);
  }

  // Emission Calculations
  private calculateEmissionsBySource(consumptionData: ConsumptionData): EmissionsBySource {
    const emissions: EmissionsBySource = {
      electricity: 0,
      gas: 0,
      water: 0,
      transportation: 0,
      waste: 0,
      other: 0
    };

    // Calculate electricity emissions
    if (consumptionData.electricity) {
      emissions.electricity = this.calculateElectricityEmissions(consumptionData.electricity);
    }

    // Calculate gas emissions
    if (consumptionData.gas) {
      emissions.gas = this.calculateGasEmissions(consumptionData.gas);
    }

    // Calculate water emissions
    if (consumptionData.water) {
      emissions.water = this.calculateWaterEmissions(consumptionData.water);
    }

    // Calculate transportation emissions
    if (consumptionData.transportation) {
      emissions.transportation = this.calculateTransportationEmissions(consumptionData.transportation);
    }

    // Calculate waste emissions
    if (consumptionData.waste) {
      emissions.waste = this.calculateWasteEmissions(consumptionData.waste);
    }

    return emissions;
  }

  private calculateEmissionsByCategory(consumptionData: ConsumptionData): EmissionsByCategory {
    const emissions: EmissionsByCategory = {
      heating: 0,
      cooling: 0,
      lighting: 0,
      appliances: 0,
      electronics: 0,
      cooking: 0,
      entertainment: 0,
      other: 0
    };

    // Distribute electricity emissions by category
    if (consumptionData.electricity) {
      const electricityEmissions = this.calculateElectricityEmissions(consumptionData.electricity);
      
      // Mock distribution by category (in production, would use actual usage data)
      const distribution = {
        heating: 0.25,
        cooling: 0.20,
        lighting: 0.15,
        appliances: 0.20,
        electronics: 0.10,
        cooking: 0.05,
        entertainment: 0.03,
        other: 0.02
      };

      Object.entries(distribution).forEach(([category, percentage]) => {
        emissions[category as keyof EmissionsByCategory] = electricityEmissions * percentage;
      });
    }

    return emissions;
  }

  private calculateElectricityEmissions(electricityData: ElectricityConsumption): number {
    const gridFactor = this.emissionFactors.get('electricity_grid');
    if (!gridFactor) return 0;

    let totalEmissions = 0;

    // Standard electricity emissions
    totalEmissions += electricityData.consumption * gridFactor.factor;

    // Adjust for green energy
    if (electricityData.greenEnergy) {
      const greenFactor = this.emissionFactors.get('electricity_green');
      if (greenFactor) {
        const greenEmissions = electricityData.greenEnergy * greenFactor.factor;
        totalEmissions = totalEmissions - (electricityData.greenEnergy * gridFactor.factor) + greenEmissions;
      }
    }

    return totalEmissions;
  }

  private calculateGasEmissions(gasData: GasConsumption): number {
    const gasFactor = this.emissionFactors.get('natural_gas');
    if (!gasFactor) return 0;

    return gasData.consumption * gasFactor.factor;
  }

  private calculateWaterEmissions(waterData: WaterConsumption): number {
    const waterFactor = this.emissionFactors.get('water_supply');
    if (!waterFactor) return 0;

    return waterData.consumption * waterFactor.factor;
  }

  private calculateTransportationEmissions(transportData: TransportationConsumption): number {
    let totalEmissions = 0;

    if (transportData.car) {
      const carFactor = this.emissionFactors.get('car_gasoline');
      if (carFactor) {
        totalEmissions += transportData.car.distance * carFactor.factor;
      }
    }

    if (transportData.publicTransport) {
      const busFactor = this.emissionFactors.get('bus');
      const trainFactor = this.emissionFactors.get('train');
      
      if (busFactor) {
        totalEmissions += (transportData.publicTransport.bus || 0) * busFactor.factor;
      }
      if (trainFactor) {
        totalEmissions += (transportData.publicTransport.train || 0) * trainFactor.factor;
      }
    }

    if (transportData.flights) {
      const flightFactor = this.emissionFactors.get('airplane');
      if (flightFactor) {
        totalEmissions += transportData.flights.distance * flightFactor.factor;
      }
    }

    return totalEmissions;
  }

  private calculateWasteEmissions(wasteData: WasteConsumption): number {
    const wasteFactor = this.emissionFactors.get('waste_landfill');
    if (!wasteFactor) return 0;

    let totalEmissions = wasteData.total * wasteFactor.factor;

    // Reduce emissions for recycling
    if (wasteData.recycled) {
      const recyclingFactor = this.emissionFactors.get('waste_recycling');
      if (recyclingFactor) {
        totalEmissions -= wasteData.recycled * (wasteFactor.factor - recyclingFactor.factor);
      }
    }

    return totalEmissions;
  }

  private calculateTotalEmissions(emissionsBySource: EmissionsBySource): number {
    return Object.values(emissionsBySource).reduce((total, emissions) => total + emissions, 0);
  }

  // Baseline and Comparison
  private calculateBaselineComparison(_userId: string, _period: { startDate: Date; endDate: Date }, currentEmissions: EmissionsBySource): BaselineComparison {
    const baseline = this.baselines.get(_userId);
    const currentTotal = this.calculateTotalEmissions(currentEmissions);
    
    let previousPeriod = 0;
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';

    if (baseline) {
      previousPeriod = baseline.totalEmissions;
      const change = ((currentTotal - previousPeriod) / previousPeriod) * 100;
      
      if (change > 5) {
        trend = 'increasing';
      } else if (change < -5) {
        trend = 'decreasing';
      }
    }

    return {
      previousPeriod,
      percentageChange: previousPeriod > 0 ? ((currentTotal - previousPeriod) / previousPeriod) * 100 : 0,
      trend,
      regionalAverage: this.getRegionalAverage(),
      nationalAverage: this.getNationalAverage()
    };
  }

  // Reduction Targets
  async createReductionTarget(_userId: string, targetData: Omit<ReductionTarget, 'id' | 'status'>): Promise<ReductionTarget> {
    const target: ReductionTarget = {
      id: uuidv4(),
      ...targetData,
      status: 'on_track'
    };

    // Store target (in production, would save to database)
    return target;
  }

  async updateReductionTarget(targetId: string, updates: Partial<ReductionTarget>): Promise<ReductionTarget> {
    // Mock implementation - in production would update in database
    const target: ReductionTarget = {
      id: targetId,
      name: updates.name || 'Updated Target',
      description: updates.description || 'Updated description',
      targetReduction: updates.targetReduction || 20,
      currentReduction: updates.currentReduction || 0,
      deadline: updates.deadline || new Date(),
      status: updates.status || 'on_track',
      category: updates.category || 'overall'
    };

    return target;
  }

  async getReductionTargets(_userId: string): Promise<ReductionTarget[]> {
    // Mock implementation - in production would fetch from database
    return [
      {
        id: uuidv4(),
        name: 'Reduce Electricity Usage',
        description: 'Reduce electricity consumption by 20% through efficiency measures',
        targetReduction: 20,
        currentReduction: 12,
        deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        status: 'on_track',
        category: 'electricity'
      },
      {
        id: uuidv4(),
        name: 'Increase Green Energy',
        description: 'Increase renewable energy usage to 50%',
        targetReduction: 50,
        currentReduction: 35,
        deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: 'on_track',
        category: 'electricity'
      }
    ];
  }

  // Achievements
  async calculateAchievements(_userId: string, emissions: EmissionsBySource): Promise<CarbonAchievement[]> {
    const achievements: CarbonAchievement[] = [];
    const totalEmissions = this.calculateTotalEmissions(emissions);

    // Check for various achievements
    if (totalEmissions < 100) {
      achievements.push({
        id: uuidv4(),
        type: 'milestone',
        title: 'Low Carbon Footprint',
        description: 'Maintained carbon footprint under 100 kg CO2',
        value: totalEmissions,
        unit: 'kg CO2',
        achievedAt: new Date(),
        badge: 'leaf'
      });
    }

    if (emissions.electricity < 50) {
      achievements.push({
        id: uuidv4(),
        type: 'improvement',
        title: 'Electricity Saver',
        description: 'Reduced electricity emissions below 50 kg CO2',
        value: emissions.electricity,
        unit: 'kg CO2',
        achievedAt: new Date(),
        badge: 'lightning'
      });
    }

    return achievements;
  }

  // Analytics and Insights
  async getCarbonAnalytics(userId: string, period: { startDate: Date; endDate: Date }): Promise<CarbonAnalytics> {
    const footprints = this.getUserCarbonFootprints(userId, { period });
    
    if (footprints.length === 0) {
      throw new Error('No carbon footprint data found for the specified period');
    }

    const latestFootprint = footprints[footprints.length - 1];
    const totalEmissions = footprints.reduce((sum, fp) => sum + fp.totalEmissions, 0);
    const averageEmissions = totalEmissions / footprints.length;

    return {
      totalEmissions,
      averageEmissions,
      emissionsTrend: this.calculateEmissionsTrend(footprints),
      mainSources: this.getMainEmissionSources(latestFootprint.emissionsBySource),
      reductionProgress: this.calculateReductionProgress(footprints),
      comparison: {
        regional: this.getRegionalComparison(latestFootprint),
        national: this.getNationalComparison(latestFootprint),
        global: this.getGlobalComparison(latestFootprint)
      },
      recommendations: await this.generateCarbonRecommendations(latestFootprint)
    };
  }

  // Utility Methods
  private initializeEmissionFactors(): void {
    // Electricity emission factors (kg CO2 per kWh)
    this.emissionFactors.set('electricity_grid', { source: 'grid', factor: 0.82, unit: 'kg CO2/kWh', region: 'default' });
    this.emissionFactors.set('electricity_green', { source: 'renewable', factor: 0.05, unit: 'kg CO2/kWh', region: 'default' });
    
    // Gas emission factors
    this.emissionFactors.set('natural_gas', { source: 'natural_gas', factor: 2.3, unit: 'kg CO2/m³', region: 'default' });
    
    // Water emission factors
    this.emissionFactors.set('water_supply', { source: 'municipal', factor: 0.0003, unit: 'kg CO2/liter', region: 'default' });
    
    // Transportation emission factors
    this.emissionFactors.set('car_gasoline', { source: 'gasoline_car', factor: 0.21, unit: 'kg CO2/km', region: 'default' });
    this.emissionFactors.set('bus', { source: 'bus', factor: 0.089, unit: 'kg CO2/km', region: 'default' });
    this.emissionFactors.set('train', { source: 'train', factor: 0.041, unit: 'kg CO2/km', region: 'default' });
    this.emissionFactors.set('airplane', { source: 'airplane', factor: 0.255, unit: 'kg CO2/km', region: 'default' });
    
    // Waste emission factors
    this.emissionFactors.set('waste_landfill', { source: 'landfill', factor: 0.5, unit: 'kg CO2/kg', region: 'default' });
    this.emissionFactors.set('waste_recycling', { source: 'recycling', factor: 0.1, unit: 'kg CO2/kg', region: 'default' });
  }

  private initializeBaselines(): void {
    // Mock baseline data - in production would fetch from database
    this.baselines.set('default', {
      userId: 'default',
      totalEmissions: 500, // kg CO2 per month
      emissionsBySource: {
        electricity: 300,
        gas: 100,
        water: 20,
        transportation: 60,
        waste: 15,
        other: 5
      },
      period: {
        startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      }
    });
  }

  private getRegionalAverage(): number {
    // Mock regional average - in production would fetch from environmental data
    return 450; // kg CO2 per month
  }

  private getNationalAverage(): number {
    // Mock national average - in production would fetch from environmental data
    return 550; // kg CO2 per month
  }

  private calculateEmissionsTrend(footprints: CarbonFootprint[]): 'increasing' | 'decreasing' | 'stable' {
    if (footprints.length < 2) return 'stable';

    const recent = footprints.slice(-3);
    const trend = recent.reduce((sum, fp, index) => {
      if (index === 0) return 0;
      return sum + (fp.totalEmissions - recent[index - 1].totalEmissions);
    }, 0);

    if (trend > 10) return 'increasing';
    if (trend < -10) return 'decreasing';
    return 'stable';
  }

  private getMainEmissionSources(emissions: EmissionsBySource): { source: string; percentage: number }[] {
    const total = this.calculateTotalEmissions(emissions);
    const sources = Object.entries(emissions)
      .filter(([_, value]) => value > 0)
      .map(([source, value]) => ({
        source,
        percentage: (value / total) * 100
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3);

    return sources;
  }

  private calculateReductionProgress(footprints: CarbonFootprint[]): number {
    if (footprints.length < 2) return 0;

    const first = footprints[0];
    const latest = footprints[footprints.length - 1];
    
    return ((first.totalEmissions - latest.totalEmissions) / first.totalEmissions) * 100;
  }

  private getRegionalComparison(footprint: CarbonFootprint): { score: number; percentile: number } {
    // Mock comparison - in production would use actual regional data
    const regionalAverage = this.getRegionalAverage();
    const score = Math.max(0, 100 - ((footprint.totalEmissions / regionalAverage) * 100));
    const percentile = Math.max(0, Math.min(100, 100 - ((footprint.totalEmissions - regionalAverage) / regionalAverage) * 50));
    
    return { score, percentile };
  }

  private getNationalComparison(footprint: CarbonFootprint): { score: number; percentile: number } {
    const nationalAverage = this.getNationalAverage();
    const score = Math.max(0, 100 - ((footprint.totalEmissions / nationalAverage) * 100));
    const percentile = Math.max(0, Math.min(100, 100 - ((footprint.totalEmissions - nationalAverage) / nationalAverage) * 50));
    
    return { score, percentile };
  }

  private getGlobalComparison(footprint: CarbonFootprint): { score: number; percentile: number } {
    const globalAverage = 400; // kg CO2 per month (global average)
    const score = Math.max(0, 100 - ((footprint.totalEmissions / globalAverage) * 100));
    const percentile = Math.max(0, Math.min(100, 100 - ((footprint.totalEmissions - globalAverage) / globalAverage) * 50));
    
    return { score, percentile };
  }

  private async generateCarbonRecommendations(footprint: CarbonFootprint): Promise<string[]> {
    const recommendations: string[] = [];
    const emissions = footprint.emissionsBySource;

    if (emissions.electricity > 200) {
      recommendations.push('Consider switching to LED lighting to reduce electricity emissions');
      recommendations.push('Unplug devices when not in use to eliminate phantom power draw');
    }

    if (emissions.transportation > 100) {
      recommendations.push('Try carpooling or public transport to reduce transportation emissions');
      recommendations.push('Consider combining trips to reduce total travel distance');
    }

    if (emissions.waste > 20) {
      recommendations.push('Increase recycling to reduce waste emissions');
      recommendations.push('Consider composting organic waste to reduce landfill emissions');
    }

    return recommendations;
  }

  private applyCarbonFootprintFilters(footprints: CarbonFootprint[], filters?: CarbonFootprintFilters): CarbonFootprint[] {
    if (!filters) return footprints;

    return footprints.filter(footprint => {
      if (filters.period) {
        if (footprint.period.startDate < filters.period.startDate || footprint.period.endDate > filters.period.endDate) {
          return false;
        }
      }
      if (filters.minEmissions && footprint.totalEmissions < filters.minEmissions) return false;
      if (filters.maxEmissions && footprint.totalEmissions > filters.maxEmissions) return false;
      return true;
    });
  }
}

// Supporting Types
interface EmissionFactor {
  source: string;
  factor: number;
  unit: string;
  region: string;
}

interface BaselineData {
  userId: string;
  totalEmissions: number;
  emissionsBySource: EmissionsBySource;
  period: { startDate: Date; endDate: Date };
}

interface ConsumptionData {
  electricity?: ElectricityConsumption;
  gas?: GasConsumption;
  water?: WaterConsumption;
  transportation?: TransportationConsumption;
  waste?: WasteConsumption;
}

interface ElectricityConsumption {
  consumption: number; // kWh
  greenEnergy?: number; // kWh
  tariff?: string;
}

interface GasConsumption {
  consumption: number; // m³
}

interface WaterConsumption {
  consumption: number; // liters
}

interface TransportationConsumption {
  car?: {
    distance: number; // km
    fuelType?: string;
    efficiency?: number; // km/l
  };
  publicTransport?: {
    bus?: number; // km
    train?: number; // km
    metro?: number; // km
  };
  flights?: {
    distance: number; // km
    type?: 'short' | 'medium' | 'long';
  };
}

interface WasteConsumption {
  total: number; // kg
  recycled?: number; // kg
  composted?: number; // kg
}

interface CarbonFootprintFilters {
  period?: { startDate: Date; endDate: Date };
  minEmissions?: number;
  maxEmissions?: number;
}

interface CarbonAnalytics {
  totalEmissions: number;
  averageEmissions: number;
  emissionsTrend: 'increasing' | 'decreasing' | 'stable';
  mainSources: { source: string; percentage: number }[];
  reductionProgress: number;
  comparison: {
    regional: { score: number; percentile: number };
    national: { score: number; percentile: number };
    global: { score: number; percentile: number };
  };
  recommendations: string[];
}

// Singleton instance
let carbonTrackerInstance: CarbonTracker | null = null;

export function getCarbonTracker(): CarbonTracker {
  if (!carbonTrackerInstance) {
    carbonTrackerInstance = new CarbonTracker();
  }
  return carbonTrackerInstance;
}
