// Sustainability Tracking Core Types and Interfaces

export interface CarbonFootprint {
  id: string;
  userId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalEmissions: number; // kg CO2
  emissionsBySource: EmissionsBySource;
  emissionsByCategory: EmissionsByCategory;
  baselineComparison: BaselineComparison;
  reductionTargets: ReductionTarget[];
  achievements: CarbonAchievement[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EmissionsBySource {
  electricity: number; // kg CO2
  gas: number; // kg CO2
  water: number; // kg CO2
  transportation: number; // kg CO2
  waste: number; // kg CO2
  other: number; // kg CO2
}

export interface EmissionsByCategory {
  heating: number; // kg CO2
  cooling: number; // kg CO2
  lighting: number; // kg CO2
  appliances: number; // kg CO2
  electronics: number; // kg CO2
  cooking: number; // kg CO2
  entertainment: number; // kg CO2
  other: number; // kg CO2
}

export interface BaselineComparison {
  previousPeriod: number; // kg CO2
  percentageChange: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  regionalAverage: number; // kg CO2
  nationalAverage: number; // kg CO2
}

export interface ReductionTarget {
  id: string;
  name: string;
  description: string;
  targetReduction: number; // percentage
  currentReduction: number; // percentage
  deadline: Date;
  status: 'on_track' | 'behind' | 'achieved' | 'missed';
  category: 'electricity' | 'gas' | 'water' | 'overall';
}

export interface CarbonAchievement {
  id: string;
  type: 'milestone' | 'record' | 'improvement';
  title: string;
  description: string;
  value: number;
  unit: string;
  achievedAt: Date;
  badge?: string;
}

export interface GreenEnergyData {
  id: string;
  userId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalEnergyConsumption: number; // kWh
  greenEnergyConsumption: number; // kWh
  greenEnergyPercentage: number; // percentage
  sources: GreenEnergySource[];
  certificates: RenewableEnergyCertificate[];
  savings: GreenEnergySavings;
  createdAt: Date;
  updatedAt: Date;
}

export interface GreenEnergySource {
  type: 'solar' | 'wind' | 'hydro' | 'biomass' | 'geothermal';
  amount: number; // kWh
  percentage: number; // percentage of total green energy
  co2Offset: number; // kg CO2 offset
  source: 'grid' | 'onsite' | 'ppa' | 'procured';
  certificates?: string[];
}

export interface RenewableEnergyCertificate {
  id: string;
  type: 'REC' | 'I-REC' | 'Guarantee of Origin';
  source: string;
  amount: number; // kWh
  period: {
    startDate: Date;
    endDate: Date;
  };
  certificateId: string;
  verifiedAt: Date;
  expiresAt?: Date;
}

export interface GreenEnergySavings {
  co2Offset: number; // kg CO2
  monetarySavings: number; // currency
  treesEquivalent: number; // number of trees
  carsOffRoad: number; // equivalent cars
}

export interface SustainabilityGoal {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: GoalCategory;
  type: GoalType;
  target: GoalTarget;
  current: GoalProgress;
  timeline: GoalTimeline;
  status: GoalStatus;
  milestones: GoalMilestone[];
  rewards: GoalReward[];
  createdAt: Date;
  updatedAt: Date;
}

export type GoalCategory = 
  | 'carbon_reduction'
  | 'energy_efficiency'
  | 'renewable_energy'
  | 'waste_reduction'
  | 'water_conservation'
  | 'sustainable_transport'
  | 'green_living';

export type GoalType = 
  | 'reduction'
  | 'consumption'
  | 'percentage'
  | 'absolute'
  | 'behavioral'
  | 'infrastructure';

export interface GoalTarget {
  value: number;
  unit: string;
  deadline: Date;
  baselineValue?: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GoalProgress {
  currentValue: number;
  percentageComplete: number;
  lastUpdated: Date;
  trend: 'improving' | 'declining' | 'stable';
  onTrack: boolean;
}

export interface GoalTimeline {
  startDate: Date;
  endDate: Date;
  checkpoints: Date[];
  completedCheckpoints: Date[];
}

export type GoalStatus = 
  | 'active'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface GoalMilestone {
  id: string;
  name: string;
  description: string;
  targetValue: number;
  achieved: boolean;
  achievedAt?: Date;
  reward?: string;
}

export interface GoalReward {
  id: string;
  type: 'badge' | 'points' | 'certificate' | 'discount';
  name: string;
  description: string;
  value: number;
  unit: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface EnvironmentalImpact {
  id: string;
  userId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  overallScore: number; // 0-100
  categories: ImpactCategory[];
  comparisons: ImpactComparison[];
  trends: ImpactTrend[];
  recommendations: ImpactRecommendation[];
  certifications: EnvironmentalCertification[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ImpactCategory {
  name: string;
  score: number; // 0-100
  weight: number; // importance weight
  impact: 'low' | 'medium' | 'high';
  trend: 'improving' | 'declining' | 'stable';
  factors: ImpactFactor[];
}

export interface ImpactFactor {
  name: string;
  value: number;
  unit: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface ImpactComparison {
  type: 'regional' | 'national' | 'global' | 'industry';
  entity: string;
  score: number;
  ranking: number;
  percentile: number;
}

export interface ImpactTrend {
  period: string;
  score: number;
  change: number;
  significant: boolean;
  factors: string[];
}

export interface ImpactRecommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  potentialImpact: number;
  effort: 'low' | 'medium' | 'high';
  cost: 'free' | 'low' | 'medium' | 'high';
  timeline: string;
  implemented: boolean;
  implementedAt?: Date;
}

export interface EnvironmentalCertification {
  id: string;
  name: string;
  issuer: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  score: number;
  validFrom: Date;
  validUntil: Date;
  criteria: string[];
}

export interface EcoRecommendation {
  id: string;
  userId: string;
  category: RecommendationCategory;
  type: RecommendationType;
  priority: RecommendationPriority;
  title: string;
  description: string;
  details: RecommendationDetails;
  impact: RecommendationImpact;
  implementation: RecommendationImplementation;
  status: RecommendationStatus;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export type RecommendationCategory = 
  | 'energy_efficiency'
  | 'renewable_energy'
  | 'waste_reduction'
  | 'water_conservation'
  | 'sustainable_transport'
  | 'green_purchasing'
  | 'behavioral_change';

export type RecommendationType = 
  | 'actionable'
  | 'educational'
  | 'product'
  | 'service'
  | 'habit'
  | 'investment';

export type RecommendationPriority = 
  | 'urgent'
  | 'high'
  | 'medium'
  | 'low';

export interface RecommendationDetails {
  problem: string;
  solution: string;
  benefits: string[];
  requirements: string[];
  alternatives: string[];
  resources: RecommendationResource[];
}

export interface RecommendationResource {
  type: 'guide' | 'video' | 'tool' | 'calculator' | 'provider';
  title: string;
  url: string;
  description: string;
  cost?: string;
}

export interface RecommendationImpact {
  co2Reduction: number; // kg CO2/year
  energySavings: number; // kWh/year
  costSavings: number; // currency/year
  difficulty: 'easy' | 'medium' | 'hard';
  timeframe: 'immediate' | 'short_term' | 'long_term';
}

export interface RecommendationImplementation {
  steps: ImplementationStep[];
  timeline: string;
  cost: {
    estimate: number;
    currency: string;
    breakdown: CostBreakdown[];
  };
  support: SupportOption[];
}

export interface ImplementationStep {
  step: number;
  title: string;
  description: string;
  duration: string;
  requirements: string[];
  completed: boolean;
  completedAt?: Date;
}

export interface CostBreakdown {
  category: string;
  amount: number;
  description: string;
  optional: boolean;
}

export interface SupportOption {
  type: 'professional' | 'diy' | 'community' | 'government';
  name: string;
  description: string;
  contact?: string;
  url?: string;
}

export type RecommendationStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'dismissed'
  | 'expired';

export interface SustainabilityMetrics {
  period: {
    startDate: Date;
    endDate: Date;
  };
  carbonFootprint: CarbonMetrics;
  energyUsage: EnergyMetrics;
  greenEnergy: GreenEnergyMetrics;
  waste: WasteMetrics;
  water: WaterMetrics;
  transportation: TransportationMetrics;
  overallScore: number;
  improvements: SustainabilityImprovement[];
}

export interface CarbonMetrics {
  totalEmissions: number; // kg CO2
  emissionsPerDay: number; // kg CO2/day
  reductionFromBaseline: number; // percentage
  onTrackForTarget: boolean;
  mainSources: { source: string; percentage: number }[];
}

export interface EnergyMetrics {
  totalConsumption: number; // kWh
  consumptionPerDay: number; // kWh/day
  efficiency: number; // percentage
  renewablePercentage: number; // percentage
  peakUsage: number; // kW
  offPeakUsage: number; // kW
}

export interface GreenEnergyMetrics {
  totalGreenEnergy: number; // kWh
  greenEnergyPercentage: number; // percentage
  co2Offset: number; // kg CO2
  certificates: number;
  sources: { type: string; percentage: number }[];
}

export interface WasteMetrics {
  totalWaste: number; // kg
  recycledWaste: number; // kg
  recyclingRate: number; // percentage
  reductionFromBaseline: number; // percentage
  wasteByType: { type: string; amount: number }[];
}

export interface WaterMetrics {
  totalConsumption: number; // liters
  consumptionPerDay: number; // liters/day
  recycledWater: number; // liters
  conservationRate: number; // percentage
  mainUses: { use: string; percentage: number }[];
}

export interface TransportationMetrics {
  totalDistance: number; // km
  publicTransportPercentage: number; // percentage
  activeTransportPercentage: number; // percentage
  electricVehiclePercentage: number; // percentage
  emissions: number; // kg CO2
}

export interface SustainabilityImprovement {
  area: string;
  currentScore: number;
  targetScore: number;
  potentialImprovement: number;
  recommendations: string[];
  timeframe: string;
}

export interface SustainabilityReport {
  id: string;
  userId: string;
  type: 'monthly' | 'quarterly' | 'annual' | 'custom';
  period: {
    startDate: Date;
    endDate: Date;
  };
  metrics: SustainabilityMetrics;
  insights: SustainabilityInsight[];
  achievements: SustainabilityAchievement[];
  recommendations: EcoRecommendation[];
  goals: SustainabilityGoal[];
  generatedAt: Date;
  format: 'pdf' | 'html' | 'json';
}

export interface SustainabilityInsight {
  category: string;
  title: string;
  description: string;
  significance: 'high' | 'medium' | 'low';
  trend: 'positive' | 'negative' | 'neutral';
  data: any;
  recommendations: string[];
}

export interface SustainabilityAchievement {
  id: string;
  title: string;
  description: string;
  category: string;
  achievedAt: Date;
  value: number;
  unit: string;
  badge: string;
  points: number;
}

export interface SustainabilitySettings {
  userId: string;
  units: {
    energy: 'kWh' | 'MWh';
    carbon: 'kg' | 'tons';
    temperature: 'celsius' | 'fahrenheit';
    distance: 'km' | 'miles';
  };
  goals: {
    carbonTarget: number; // percentage reduction
    renewableTarget: number; // percentage
    energyEfficiencyTarget: number; // percentage
  };
  notifications: {
    achievements: boolean;
    goals: boolean;
    recommendations: boolean;
    reports: boolean;
  };
  privacy: {
    shareData: boolean;
    anonymousData: boolean;
    publicProfile: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SustainabilityAlert {
  id: string;
  userId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  data: any;
  actionRequired: boolean;
  actionUrl?: string;
  expiresAt?: Date;
  readAt?: Date;
  createdAt: Date;
}

export type AlertType = 
  | 'goal_milestone'
  | 'target_missed'
  | 'achievement_unlocked'
  | 'recommendation_available'
  | 'report_ready'
  | 'anomaly_detected'
  | 'certification_expiring';

export type AlertSeverity = 
  | 'info'
  | 'warning'
  | 'error'
  | 'success';
