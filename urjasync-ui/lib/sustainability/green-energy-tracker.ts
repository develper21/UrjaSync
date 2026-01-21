import { GreenEnergyData, GreenEnergySource, RenewableEnergyCertificate, GreenEnergySavings } from './types';
import { v4 as uuidv4 } from 'uuid';

export class GreenEnergyTracker {
  private greenEnergyData: Map<string, GreenEnergyData> = new Map();
  private certificates: Map<string, RenewableEnergyCertificate> = new Map();
  private sources: Map<string, EnergySource> = new Map();
  private tariffs: Map<string, GreenTariff> = new Map();

  constructor() {
    this.initializeEnergySources();
    this.initializeTariffs();
  }

  // Green Energy Data Management
  async trackGreenEnergyConsumption(userId: string, period: { startDate: Date; endDate: Date }, energyData: EnergyConsumptionData): Promise<GreenEnergyData> {
    try {
      const totalEnergyConsumption = this.calculateTotalEnergyConsumption(energyData);
      const greenEnergyConsumption = this.calculateGreenEnergyConsumption(energyData);
      const greenEnergyPercentage = totalEnergyConsumption > 0 ? (greenEnergyConsumption / totalEnergyConsumption) * 100 : 0;
      
      const sources = this.calculateGreenEnergySources(energyData);
      const certificates = await this.getValidCertificates(userId, period);
      const savings = this.calculateGreenEnergySavings(greenEnergyConsumption, sources);

      const greenData: GreenEnergyData = {
        id: uuidv4(),
        userId,
        period,
        totalEnergyConsumption,
        greenEnergyConsumption,
        greenEnergyPercentage,
        sources,
        certificates,
        savings,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.greenEnergyData.set(greenData.id, greenData);
      return greenData;
    } catch (error) {
      throw new Error(`Failed to track green energy consumption: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateGreenEnergyData(dataId: string, updates: Partial<GreenEnergyData>): Promise<GreenEnergyData> {
    const data = this.greenEnergyData.get(dataId);
    if (!data) {
      throw new Error('Green energy data not found');
    }

    const updatedData = {
      ...data,
      ...updates,
      updatedAt: new Date()
    };

    // Recalculate percentages if consumption data changed
    if (updates.totalEnergyConsumption !== undefined || updates.greenEnergyConsumption !== undefined) {
      updatedData.greenEnergyPercentage = updatedData.totalEnergyConsumption > 0 
        ? (updatedData.greenEnergyConsumption / updatedData.totalEnergyConsumption) * 100 
        : 0;
    }

    this.greenEnergyData.set(dataId, updatedData);
    return updatedData;
  }

  getGreenEnergyData(dataId: string): GreenEnergyData | undefined {
    return this.greenEnergyData.get(dataId);
  }

  getUserGreenEnergyData(userId: string, filters?: GreenEnergyFilters): GreenEnergyData[] {
    const userData = Array.from(this.greenEnergyData.values())
      .filter(data => data.userId === userId);

    return this.applyGreenEnergyFilters(userData, filters);
  }

  // Certificate Management
  async addRenewableEnergyCertificate(certificateData: Omit<RenewableEnergyCertificate, 'id' | 'verifiedAt'>): Promise<RenewableEnergyCertificate> {
    const certificate: RenewableEnergyCertificate = {
      id: uuidv4(),
      ...certificateData,
      verifiedAt: new Date()
    };

    this.certificates.set(certificate.id, certificate);
    return certificate;
  }

  async verifyCertificate(certificateId: string): Promise<RenewableEnergyCertificate> {
    const certificate = this.certificates.get(certificateId);
    if (!certificate) {
      throw new Error('Certificate not found');
    }

    // Mock verification process - in production would verify with issuing authority
    certificate.verifiedAt = new Date();
    this.certificates.set(certificateId, certificate);
    
    return certificate;
  }

  getCertificates(userId: string, filters?: CertificateFilters): RenewableEnergyCertificate[] {
    const userCertificates = Array.from(this.certificates.values())
      .filter(cert => this.isCertificateOwnedByUser(cert, userId));

    return this.applyCertificateFilters(userCertificates, filters);
  }

  // Green Energy Sources
  async addGreenEnergySource(sourceData: Omit<EnergySource, 'id'>): Promise<EnergySource> {
    const source: EnergySource = {
      id: uuidv4(),
      ...sourceData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.sources.set(source.id, source);
    return source;
  }

  async updateEnergySource(sourceId: string, updates: Partial<EnergySource>): Promise<EnergySource> {
    const source = this.sources.get(sourceId);
    if (!source) {
      throw new Error('Energy source not found');
    }

    const updatedSource = {
      ...source,
      ...updates,
      updatedAt: new Date()
    };

    this.sources.set(sourceId, updatedSource);
    return updatedSource;
  }

  getEnergySources(userId: string, filters?: SourceFilters): EnergySource[] {
    const userSources = Array.from(this.sources.values())
      .filter(source => source.userId === userId);

    return this.applySourceFilters(userSources, filters);
  }

  // Tariff Management
  async addGreenTariff(tariffData: Omit<GreenTariff, 'id'>): Promise<GreenTariff> {
    const tariff: GreenTariff = {
      id: uuidv4(),
      ...tariffData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tariffs.set(tariff.id, tariff);
    return tariff;
  }

  getAvailableTariffs(filters?: TariffFilters): GreenTariff[] {
    const tariffs = Array.from(this.tariffs.values())
      .filter(tariff => tariff.isActive);

    return this.applyTariffFilters(tariffs, filters);
  }

  // Analytics and Insights
  async getGreenEnergyAnalytics(userId: string, period: { startDate: Date; endDate: Date }): Promise<GreenEnergyAnalytics> {
    const data = this.getUserGreenEnergyData(userId, { period });
    
    if (data.length === 0) {
      throw new Error('No green energy data found for the specified period');
    }

    const latestData = data[data.length - 1];
    const totalGreenEnergy = data.reduce((sum, d) => sum + d.greenEnergyConsumption, 0);
    const averageGreenPercentage = data.reduce((sum, d) => sum + d.greenEnergyPercentage, 0) / data.length;

    return {
      totalGreenEnergy,
      averageGreenPercentage,
      greenEnergyTrend: this.calculateGreenEnergyTrend(data),
      sourceBreakdown: this.calculateSourceBreakdown(latestData.sources),
      savings: this.calculateTotalSavings(data),
      certificates: this.getCertificateSummary(userId, period),
      recommendations: await this.generateGreenEnergyRecommendations(latestData),
      potential: await this.calculateGreenEnergyPotential(userId)
    };
  }

  // Green Energy Potential
  async calculateGreenEnergyPotential(userId: string): Promise<GreenEnergyPotential> {
    const userSources = this.getEnergySources(userId);
    const availableTariffs = this.getAvailableTariffs();
    
    // Calculate solar potential
    const solarPotential = this.calculateSolarPotential(userSources);
    
    // Calculate wind potential
    const windPotential = this.calculateWindPotential(userSources);
    
    // Calculate green tariff potential
    const tariffPotential = this.calculateTariffPotential(availableTariffs);

    return {
      solar: solarPotential,
      wind: windPotential,
      tariffs: tariffPotential,
      totalPotential: solarPotential.maxCapacity + windPotential.maxCapacity + tariffPotential.maxGreenPercentage,
      recommendations: this.generatePotentialRecommendations(solarPotential, windPotential, tariffPotential)
    };
  }

  // Utility Methods
  private calculateTotalEnergyConsumption(energyData: EnergyConsumptionData): number {
    let total = 0;

    if (energyData.grid) {
      total += energyData.grid.consumption || 0;
    }

    if (energyData.solar) {
      total += energyData.solar.consumption || 0;
    }

    if (energyData.wind) {
      total += energyData.wind.consumption || 0;
    }

    if (energyData.other) {
      total += energyData.other.consumption || 0;
    }

    return total;
  }

  private calculateGreenEnergyConsumption(energyData: EnergyConsumptionData): number {
    let green = 0;

    if (energyData.solar) {
      green += energyData.solar.consumption || 0;
    }

    if (energyData.wind) {
      green += energyData.wind.consumption || 0;
    }

    if (energyData.other && energyData.other.isGreen) {
      green += energyData.other.consumption || 0;
    }

    // Add green portion from grid if specified
    if (energyData.grid && energyData.grid.greenPercentage) {
      green += (energyData.grid.consumption || 0) * (energyData.grid.greenPercentage / 100);
    }

    return green;
  }

  private calculateGreenEnergySources(energyData: EnergyConsumptionData): GreenEnergySource[] {
    const sources: GreenEnergySource[] = [];

    if (energyData.solar && energyData.solar.consumption > 0) {
      const co2Offset = this.calculateCO2Offset('solar', energyData.solar.consumption);
      sources.push({
        type: 'solar',
        amount: energyData.solar.consumption,
        percentage: 0, // Will be calculated after total is known
        co2Offset,
        source: energyData.solar.source || 'onsite',
        certificates: energyData.solar.certificates || []
      });
    }

    if (energyData.wind && energyData.wind.consumption > 0) {
      const co2Offset = this.calculateCO2Offset('wind', energyData.wind.consumption);
      sources.push({
        type: 'wind',
        amount: energyData.wind.consumption,
        percentage: 0, // Will be calculated after total is known
        co2Offset,
        source: energyData.wind.source || 'onsite',
        certificates: energyData.wind.certificates || []
      });
    }

    // Calculate percentages
    const totalGreen = this.calculateGreenEnergyConsumption(energyData);
    sources.forEach(source => {
      source.percentage = totalGreen > 0 ? (source.amount / totalGreen) * 100 : 0;
    });

    return sources;
  }

  private calculateCO2Offset(sourceType: string, amount: number): number {
    // CO2 offset factors (kg CO2 per kWh)
    const offsetFactors: Record<string, number> = {
      solar: 0.82,
      wind: 0.011,
      hydro: 0.024,
      biomass: 0.2,
      geothermal: 0.038
    };

    return amount * (offsetFactors[sourceType] || 0.5);
  }

  private async getValidCertificates(userId: string, period: { startDate: Date; endDate: Date }): Promise<RenewableEnergyCertificate[]> {
    const certificates = this.getCertificates(userId);
    
    return certificates.filter(cert => 
      cert.period.startDate >= period.startDate && 
      cert.period.endDate <= period.endDate &&
      (!cert.expiresAt || cert.expiresAt > new Date())
    );
  }

  private calculateGreenEnergySavings(greenEnergyConsumption: number, sources: GreenEnergySource[]): GreenEnergySavings {
    const co2Offset = sources.reduce((sum, source) => sum + source.co2Offset, 0);
    
    // Calculate monetary savings (assuming average electricity price)
    const averagePrice = 5.8; // INR per kWh
    const monetarySavings = greenEnergyConsumption * averagePrice * 0.1; // 10% savings estimate

    // Calculate environmental equivalents
    const treesEquivalent = co2Offset / 21; // 1 tree absorbs ~21 kg CO2 per year
    const carsOffRoad = co2Offset / 4600; // Average car emits ~4600 kg CO2 per year

    return {
      co2Offset,
      monetarySavings,
      treesEquivalent,
      carsOffRoad
    };
  }

  private calculateGreenEnergyTrend(data: GreenEnergyData[]): 'increasing' | 'decreasing' | 'stable' {
    if (data.length < 2) return 'stable';

    const recent = data.slice(-3);
    const trend = recent.reduce((sum, d, index) => {
      if (index === 0) return 0;
      return sum + (d.greenEnergyPercentage - recent[index - 1].greenEnergyPercentage);
    }, 0);

    if (trend > 5) return 'increasing';
    if (trend < -5) return 'decreasing';
    return 'stable';
  }

  private calculateSourceBreakdown(sources: GreenEnergySource[]): { type: string; percentage: number; amount: number }[] {
    return sources.map(source => ({
      type: source.type,
      percentage: source.percentage,
      amount: source.amount
    })).sort((a, b) => b.percentage - a.percentage);
  }

  private calculateTotalSavings(data: GreenEnergyData[]): GreenEnergySavings {
    const totalSavings = data.reduce((acc, d) => ({
      co2Offset: acc.co2Offset + d.savings.co2Offset,
      monetarySavings: acc.monetarySavings + d.savings.monetarySavings,
      treesEquivalent: acc.treesEquivalent + d.savings.treesEquivalent,
      carsOffRoad: acc.carsOffRoad + d.savings.carsOffRoad
    }), { co2Offset: 0, monetarySavings: 0, treesEquivalent: 0, carsOffRoad: 0 });

    return totalSavings;
  }

  private getCertificateSummary(userId: string, period: { startDate: Date; endDate: Date }): CertificateSummary {
    const certificates = this.getCertificates(userId, { period });
    
    return {
      totalCertificates: certificates.length,
      totalEnergy: certificates.reduce((sum, cert) => sum + cert.amount, 0),
      byType: this.groupCertificatesByType(certificates),
      expiryAlerts: certificates.filter(cert => cert.expiresAt && cert.expiresAt < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length
    };
  }

  private groupCertificatesByType(certificates: RenewableEnergyCertificate[]): Record<string, number> {
    return certificates.reduce((acc, cert) => {
      acc[cert.type] = (acc[cert.type] || 0) + cert.amount;
      return acc;
    }, {} as Record<string, number>);
  }

  private async generateGreenEnergyRecommendations(data: GreenEnergyData): Promise<string[]> {
    const recommendations: string[] = [];

    if (data.greenEnergyPercentage < 20) {
      recommendations.push('Consider switching to a green energy tariff to increase renewable energy usage');
    }

    if (data.sources.some(s => s.type === 'solar')) {
      recommendations.push('Monitor your solar panel performance to maximize energy generation');
    }

    if (data.certificates.length === 0) {
      recommendations.push('Purchase renewable energy certificates to offset your carbon footprint');
    }

    if (data.greenEnergyPercentage > 50) {
      recommendations.push('Share your green energy achievements to inspire others');
    }

    return recommendations;
  }

  private calculateSolarPotential(sources: EnergySource[]): SolarPotential {
    const roofArea = sources.find(s => s.type === 'solar')?.metadata?.roofArea || 0;
    
    return {
      feasible: roofArea > 0,
      maxCapacity: roofArea * 0.15, // 150W per square foot
      estimatedGeneration: roofArea * 0.15 * 4 * 365, // 4 hours peak sun per day
      installationCost: roofArea * 1500, // INR 1500 per square foot
      paybackPeriod: 6, // years
      co2Offset: roofArea * 0.15 * 4 * 365 * 0.82 // kg CO2 per year
    };
  }

  private calculateWindPotential(sources: EnergySource[]): WindPotential {
    const location = sources.find(s => s.type === 'wind')?.metadata?.location || 'urban';
    
    return {
      feasible: location === 'rural',
      maxCapacity: location === 'rural' ? 10 : 2, // kW
      estimatedGeneration: location === 'rural' ? 20000 : 4000, // kWh per year
      installationCost: location === 'rural' ? 100000 : 50000, // INR
      paybackPeriod: location === 'rural' ? 8 : 12, // years
      co2Offset: location === 'rural' ? 16400 : 3280 // kg CO2 per year
    };
  }

  private calculateTariffPotential(tariffs: GreenTariff[]): TariffPotential {
    const greenTariffs = tariffs.filter(t => t.greenPercentage > 0);
    
    return {
      availableTariffs: greenTariffs.length,
      maxGreenPercentage: Math.max(...greenTariffs.map(t => t.greenPercentage)),
      averagePremium: greenTariffs.reduce((sum, t) => sum + t.premiumPercentage, 0) / greenTariffs.length,
      bestTariff: greenTariffs.reduce((best, current) => 
        current.greenPercentage > best.greenPercentage ? current : best
      , greenTariffs[0])
    };
  }

  private generatePotentialRecommendations(solar: SolarPotential, wind: WindPotential, tariff: TariffPotential): string[] {
    const recommendations: string[] = [];

    if (solar.feasible) {
      recommendations.push(`Install solar panels - potential capacity: ${solar.maxCapacity.toFixed(1)} kW`);
    }

    if (wind.feasible) {
      recommendations.push(`Consider wind energy - potential capacity: ${wind.maxCapacity} kW`);
    }

    if (tariff.availableTariffs > 0) {
      recommendations.push(`Switch to green tariff - up to ${tariff.maxGreenPercentage}% renewable energy`);
    }

    return recommendations;
  }

  private isCertificateOwnedByUser(_certificate: RenewableEnergyCertificate, _userId: string): boolean {
    // Mock implementation - in production would check actual ownership
    return true;
  }

  // Filter Methods
  private applyGreenEnergyFilters(data: GreenEnergyData[], filters?: GreenEnergyFilters): GreenEnergyData[] {
    if (!filters) return data;

    return data.filter(d => {
      if (filters.period) {
        if (d.period.startDate < filters.period.startDate || d.period.endDate > filters.period.endDate) {
          return false;
        }
      }
      if (filters.minGreenPercentage && d.greenEnergyPercentage < filters.minGreenPercentage) return false;
      if (filters.maxGreenPercentage && d.greenEnergyPercentage > filters.maxGreenPercentage) return false;
      return true;
    });
  }

  private applyCertificateFilters(certificates: RenewableEnergyCertificate[], filters?: CertificateFilters): RenewableEnergyCertificate[] {
    if (!filters) return certificates;

    return certificates.filter(cert => {
      if (filters.type && cert.type !== filters.type) return false;
      if (filters.source && cert.source !== filters.source) return false;
      if (filters.period) {
        if (cert.period.startDate < filters.period.startDate || cert.period.endDate > filters.period.endDate) {
          return false;
        }
      }
      return true;
    });
  }

  private applySourceFilters(sources: EnergySource[], filters?: SourceFilters): EnergySource[] {
    if (!filters) return sources;

    return sources.filter(source => {
      if (filters.type && source.type !== filters.type) return false;
      if (filters.status && source.status !== filters.status) return false;
      return true;
    });
  }

  private applyTariffFilters(tariffs: GreenTariff[], filters?: TariffFilters): GreenTariff[] {
    if (!filters) return tariffs;

    return tariffs.filter(tariff => {
      if (filters.provider && tariff.provider !== filters.provider) return false;
      if (filters.minGreenPercentage && tariff.greenPercentage < filters.minGreenPercentage) return false;
      if (filters.maxPremium && tariff.premiumPercentage > filters.maxPremium) return false;
      return true;
    });
  }

  // Initialization Methods
  private initializeEnergySources(): void {
    // Mock initialization - in production would fetch from database
  }

  private initializeTariffs(): void {
    // Mock green tariffs
    this.tariffs.set('green_basic', {
      id: 'green_basic',
      name: 'Green Energy Basic',
      provider: 'State Electricity Board',
      description: '25% renewable energy mix',
      greenPercentage: 25,
      premiumPercentage: 5,
      sources: ['solar', 'wind'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    this.tariffs.set('green_plus', {
      id: 'green_plus',
      name: 'Green Energy Plus',
      provider: 'Private Utility',
      description: '50% renewable energy mix',
      greenPercentage: 50,
      premiumPercentage: 10,
      sources: ['solar', 'wind', 'hydro'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    this.tariffs.set('green_premium', {
      id: 'green_premium',
      name: '100% Green Energy',
      provider: 'Green Energy Provider',
      description: '100% renewable energy',
      greenPercentage: 100,
      premiumPercentage: 15,
      sources: ['solar', 'wind', 'hydro', 'biomass'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
}

// Supporting Types
interface EnergySource {
  id: string;
  userId: string;
  type: 'solar' | 'wind' | 'hydro' | 'biomass' | 'geothermal';
  name: string;
  description: string;
  capacity: number; // kW
  status: 'active' | 'inactive' | 'maintenance';
  location: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface GreenTariff {
  id: string;
  name: string;
  provider: string;
  description: string;
  greenPercentage: number;
  premiumPercentage: number;
  sources: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface EnergyConsumptionData {
  grid?: {
    consumption: number; // kWh
    greenPercentage?: number; // percentage
  };
  solar?: {
    consumption: number; // kWh
    source?: 'onsite' | 'ppa' | 'procured';
    certificates?: string[];
  };
  wind?: {
    consumption: number; // kWh
    source?: 'onsite' | 'ppa' | 'procured';
    certificates?: string[];
  };
  other?: {
    consumption: number; // kWh
    isGreen: boolean;
    source?: string;
  };
}

interface GreenEnergyFilters {
  period?: { startDate: Date; endDate: Date };
  minGreenPercentage?: number;
  maxGreenPercentage?: number;
}

interface CertificateFilters {
  type?: string;
  source?: string;
  period?: { startDate: Date; endDate: Date };
}

interface SourceFilters {
  type?: string;
  status?: string;
}

interface TariffFilters {
  provider?: string;
  minGreenPercentage?: number;
  maxPremium?: number;
}

interface GreenEnergyAnalytics {
  totalGreenEnergy: number;
  averageGreenPercentage: number;
  greenEnergyTrend: 'increasing' | 'decreasing' | 'stable';
  sourceBreakdown: { type: string; percentage: number; amount: number }[];
  savings: GreenEnergySavings;
  certificates: CertificateSummary;
  recommendations: string[];
  potential: GreenEnergyPotential;
}

interface CertificateSummary {
  totalCertificates: number;
  totalEnergy: number;
  byType: Record<string, number>;
  expiryAlerts: number;
}

interface GreenEnergyPotential {
  solar: SolarPotential;
  wind: WindPotential;
  tariffs: TariffPotential;
  totalPotential: number;
  recommendations: string[];
}

interface SolarPotential {
  feasible: boolean;
  maxCapacity: number; // kW
  estimatedGeneration: number; // kWh per year
  installationCost: number; // INR
  paybackPeriod: number; // years
  co2Offset: number; // kg CO2 per year
}

interface WindPotential {
  feasible: boolean;
  maxCapacity: number; // kW
  estimatedGeneration: number; // kWh per year
  installationCost: number; // INR
  paybackPeriod: number; // years
  co2Offset: number; // kg CO2 per year
}

interface TariffPotential {
  availableTariffs: number;
  maxGreenPercentage: number;
  averagePremium: number;
  bestTariff: GreenTariff;
}

// Singleton instance
let greenEnergyTrackerInstance: GreenEnergyTracker | null = null;

export function getGreenEnergyTracker(): GreenEnergyTracker {
  if (!greenEnergyTrackerInstance) {
    greenEnergyTrackerInstance = new GreenEnergyTracker();
  }
  return greenEnergyTrackerInstance;
}
