export interface FailurePrediction {
  deviceId: string;
  deviceName: string;
  deviceType: 'AC' | 'Washer' | 'Light' | 'Geyser' | 'Solar Panel' | 'Battery' | 'EV Charger';
  predictionDate: Date;
  failureProbability: number; // 0-100
  predictedFailureDate: Date;
  confidenceLevel: number; // 0-100
  riskFactors: RiskFactor[];
  recommendedActions: RecommendedAction[];
  predictionModel: string;
  lastTrainingDate: Date;
}

export interface RiskFactor {
  factor: string;
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  currentValue: number;
  thresholdValue: number;
  trend: 'Improving' | 'Stable' | 'Degrading';
  weight: number; // 0-1
}

export interface RecommendedAction {
  action: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  estimatedCost: number;
  timeToImplement: string; // e.g., "2 hours", "1 day"
  impactOnFailureRisk: number; // percentage reduction
  category: 'Preventive' | 'Corrective' | 'Predictive';
}

export interface HistoricalFailureData {
  deviceId: string;
  failureDate: Date;
  failureType: string;
  rootCause: string;
  symptoms: string[];
  resolutionTime: number; // hours
  cost: number;
  preFailureMetrics: {
    efficiency: number;
    temperature: number;
    vibration: number;
    errorCount: number;
    runtimeHours: number;
  };
}

export interface PredictionModel {
  name: string;
  version: string;
  accuracy: number; // 0-100
  trainingDataSize: number;
  lastUpdated: Date;
  applicableDeviceTypes: string[];
  features: string[];
}

export class FailurePredictionEngine {
  private models: Map<string, PredictionModel> = new Map();
  private historicalData: HistoricalFailureData[] = [];
  private predictions: Map<string, FailurePrediction> = new Map();

  constructor() {
    this.initializeModels();
    this.loadHistoricalData();
  }

  private initializeModels() {
    const models: PredictionModel[] = [
      {
        name: 'Random Forest Classifier',
        version: '2.1.0',
        accuracy: 87.5,
        trainingDataSize: 10000,
        lastUpdated: new Date('2024-01-15'),
        applicableDeviceTypes: ['AC', 'Washer', 'Geyser'],
        features: ['efficiency', 'temperature', 'vibration', 'errorCount', 'runtimeHours', 'age']
      },
      {
        name: 'LSTM Neural Network',
        version: '1.8.3',
        accuracy: 91.2,
        trainingDataSize: 15000,
        lastUpdated: new Date('2024-02-01'),
        applicableDeviceTypes: ['Solar Panel', 'Battery', 'EV Charger'],
        features: ['efficiency', 'temperature', 'powerOutput', 'chargeCycles', 'degradationRate', 'environmentalFactors']
      },
      {
        name: 'Gradient Boosting Machine',
        version: '3.0.1',
        accuracy: 89.8,
        trainingDataSize: 12000,
        lastUpdated: new Date('2024-01-20'),
        applicableDeviceTypes: ['AC', 'Washer', 'Light', 'Geyser'],
        features: ['efficiency', 'temperature', 'vibration', 'noiseLevel', 'errorCount', 'maintenanceHistory']
      }
    ];

    models.forEach(model => {
      this.models.set(model.name, model);
    });
  }

  private loadHistoricalData() {
    // Simulated historical failure data
    this.historicalData = [
      {
        deviceId: 'AC001',
        failureDate: new Date('2023-06-15'),
        failureType: 'Compressor Failure',
        rootCause: 'Overheating due to clogged filters',
        symptoms: ['Reduced cooling efficiency', 'Increased noise', 'Higher power consumption'],
        resolutionTime: 48,
        cost: 350,
        preFailureMetrics: {
          efficiency: 65,
          temperature: 52,
          vibration: 45,
          errorCount: 8,
          runtimeHours: 8760
        }
      },
      {
        deviceId: 'WASH002',
        failureDate: new Date('2023-08-22'),
        failureType: 'Motor Bearing Failure',
        rootCause: 'Wear and tear',
        symptoms: ['Excessive vibration', 'Loud noise during spin cycle'],
        resolutionTime: 24,
        cost: 180,
        preFailureMetrics: {
          efficiency: 70,
          temperature: 38,
          vibration: 65,
          errorCount: 3,
          runtimeHours: 4380
        }
      },
      {
        deviceId: 'SOLAR003',
        failureDate: new Date('2023-10-10'),
        failureType: 'Inverter Failure',
        rootCause: 'Electrical surge',
        symptoms: ['No power output', 'Error indicators'],
        resolutionTime: 72,
        cost: 1200,
        preFailureMetrics: {
          efficiency: 45,
          temperature: 68,
          vibration: 5,
          errorCount: 12,
          runtimeHours: 17520
        }
      }
    ];
  }

  async predictFailure(deviceId: string, deviceType: string, currentMetrics: {
    efficiency: number;
    temperature: number;
    vibration?: number;
    noiseLevel?: number;
    errorCount: number;
    runtimeHours: number;
    age: number; // months
    powerOutput?: number;
    chargeCycles?: number;
  }): Promise<FailurePrediction> {
    const model = this.selectBestModel(deviceType);
    const riskFactors = this.calculateRiskFactors(deviceType, currentMetrics);
    const failureProbability = this.calculateFailureProbability(riskFactors, model);
    const predictedFailureDate = this.predictFailureDate(failureProbability, currentMetrics);
    const confidenceLevel = this.calculateConfidenceLevel(model, riskFactors);
    const recommendedActions = this.generateRecommendedActions(riskFactors, deviceType);

    const prediction: FailurePrediction = {
      deviceId,
      deviceName: `Device ${deviceId}`,
      deviceType: deviceType as any,
      predictionDate: new Date(),
      failureProbability,
      predictedFailureDate,
      confidenceLevel,
      riskFactors,
      recommendedActions,
      predictionModel: model.name,
      lastTrainingDate: model.lastUpdated
    };

    this.predictions.set(deviceId, prediction);
    return prediction;
  }

  private selectBestModel(deviceType: string): PredictionModel {
    const applicableModels = Array.from(this.models.values())
      .filter(model => model.applicableDeviceTypes.includes(deviceType));
    
    if (applicableModels.length === 0) {
      return Array.from(this.models.values())[0]; // Fallback to first model
    }
    
    return applicableModels.reduce((best, current) => 
      current.accuracy > best.accuracy ? current : best
    );
  }

  private calculateRiskFactors(deviceType: string, metrics: any): RiskFactor[] {
    const riskFactors: RiskFactor[] = [];

    // Efficiency risk
    if (metrics.efficiency < 80) {
      riskFactors.push({
        factor: 'Low Efficiency',
        impact: metrics.efficiency < 60 ? 'Critical' : metrics.efficiency < 70 ? 'High' : 'Medium',
        currentValue: metrics.efficiency,
        thresholdValue: 80,
        trend: this.determineTrend(metrics.efficiency, 80),
        weight: 0.3
      });
    }

    // Temperature risk
    const maxTemp = this.getMaxTemperatureForDeviceType(deviceType);
    if (metrics.temperature > maxTemp * 0.8) {
      riskFactors.push({
        factor: 'High Temperature',
        impact: metrics.temperature > maxTemp ? 'Critical' : metrics.temperature > maxTemp * 0.9 ? 'High' : 'Medium',
        currentValue: metrics.temperature,
        thresholdValue: maxTemp,
        trend: this.determineTrend(metrics.temperature, maxTemp * 0.8),
        weight: 0.25
      });
    }

    // Vibration risk (if applicable)
    if (metrics.vibration !== undefined) {
      const maxVibration = this.getMaxVibrationForDeviceType(deviceType);
      if (metrics.vibration > maxVibration * 0.7) {
        riskFactors.push({
          factor: 'Excessive Vibration',
          impact: metrics.vibration > maxVibration ? 'Critical' : metrics.vibration > maxVibration * 0.85 ? 'High' : 'Medium',
          currentValue: metrics.vibration,
          thresholdValue: maxVibration,
          trend: this.determineTrend(metrics.vibration, maxVibration * 0.7),
          weight: 0.2
        });
      }
    }

    // Error count risk
    if (metrics.errorCount > 2) {
      riskFactors.push({
        factor: 'High Error Count',
        impact: metrics.errorCount > 10 ? 'Critical' : metrics.errorCount > 5 ? 'High' : 'Medium',
        currentValue: metrics.errorCount,
        thresholdValue: 2,
        trend: this.determineTrend(metrics.errorCount, 2),
        weight: 0.15
      });
    }

    // Age risk
    const expectedLifespan = this.getExpectedLifespan(deviceType);
    if (metrics.age > expectedLifespan * 0.7) {
      riskFactors.push({
        factor: 'Device Age',
        impact: metrics.age > expectedLifespan ? 'Critical' : metrics.age > expectedLifespan * 0.85 ? 'High' : 'Medium',
        currentValue: metrics.age,
        thresholdValue: expectedLifespan,
        trend: 'Degrading', // Age always degrades
        weight: 0.1
      });
    }

    return riskFactors;
  }

  private getMaxTemperatureForDeviceType(deviceType: string): number {
    const temperatureLimits: Record<string, number> = {
      'AC': 45,
      'Washer': 40,
      'Geyser': 85,
      'Solar Panel': 85,
      'Battery': 45,
      'EV Charger': 55,
      'Light': 60
    };
    return temperatureLimits[deviceType] || 50;
  }

  private getMaxVibrationForDeviceType(deviceType: string): number {
    const vibrationLimits: Record<string, number> = {
      'AC': 50,
      'Washer': 30,
      'Geyser': 20,
      'Solar Panel': 10,
      'Battery': 15,
      'EV Charger': 25,
      'Light': 5
    };
    return vibrationLimits[deviceType] || 30;
  }

  private getExpectedLifespan(deviceType: string): number {
    const lifespans: Record<string, number> = {
      'AC': 120, // months (10 years)
      'Washer': 108, // 9 years
      'Geyser': 96, // 8 years
      'Solar Panel': 300, // 25 years
      'Battery': 120, // 10 years
      'EV Charger': 144, // 12 years
      'Light': 60 // 5 years
    };
    return lifespans[deviceType] || 120;
  }

  private determineTrend(currentValue: number, threshold: number): 'Improving' | 'Stable' | 'Degrading' {
    if (currentValue < threshold * 0.8) return 'Improving';
    if (currentValue > threshold * 1.2) return 'Degrading';
    return 'Stable';
  }

  private calculateFailureProbability(riskFactors: RiskFactor[], model: PredictionModel): number {
    if (riskFactors.length === 0) return 5; // Base probability

    let weightedRisk = 0;
    riskFactors.forEach(factor => {
      const impactMultiplier = {
        'Low': 0.25,
        'Medium': 0.5,
        'High': 0.75,
        'Critical': 1.0
      }[factor.impact];

      weightedRisk += factor.weight * impactMultiplier;
    });

    // Apply model accuracy as confidence factor
    const confidenceFactor = model.accuracy / 100;
    const baseProbability = weightedRisk * 100;
    
    return Math.min(95, Math.max(5, baseProbability * confidenceFactor));
  }

  private predictFailureDate(failureProbability: number, _metrics: any): Date {
    // Simple heuristic: higher probability = sooner failure
    const daysToFailure = Math.max(1, Math.round((100 - failureProbability) * 3));
    const failureDate = new Date();
    failureDate.setDate(failureDate.getDate() + daysToFailure);
    return failureDate;
  }

  private calculateConfidenceLevel(model: PredictionModel, riskFactors: RiskFactor[]): number {
    let confidence = model.accuracy;
    
    // Adjust confidence based on data quality
    if (riskFactors.length < 2) confidence -= 10;
    if (riskFactors.some(rf => rf.trend === 'Stable')) confidence -= 5;
    
    return Math.max(50, Math.min(95, confidence));
  }

  private generateRecommendedActions(riskFactors: RiskFactor[], deviceType: string): RecommendedAction[] {
    const actions: RecommendedAction[] = [];

    riskFactors.forEach(factor => {
      switch (factor.factor) {
        case 'Low Efficiency':
          actions.push({
            action: 'Clean and service device components',
            priority: factor.impact === 'Critical' ? 'Urgent' : 'High',
            estimatedCost: this.getEstimatedCost('cleaning', deviceType),
            timeToImplement: '2-4 hours',
            impactOnFailureRisk: 25,
            category: 'Preventive'
          });
          break;

        case 'High Temperature':
          actions.push({
            action: 'Check and clean ventilation systems',
            priority: factor.impact === 'Critical' ? 'Urgent' : 'High',
            estimatedCost: this.getEstimatedCost('ventilation', deviceType),
            timeToImplement: '1-2 hours',
            impactOnFailureRisk: 30,
            category: 'Preventive'
          });
          break;

        case 'Excessive Vibration':
          actions.push({
            action: 'Inspect and tighten mechanical components',
            priority: factor.impact === 'Critical' ? 'Urgent' : 'High',
            estimatedCost: this.getEstimatedCost('mechanical', deviceType),
            timeToImplement: '3-6 hours',
            impactOnFailureRisk: 35,
            category: 'Corrective'
          });
          break;

        case 'High Error Count':
          actions.push({
            action: 'Diagnostic check and software update',
            priority: 'Medium',
            estimatedCost: this.getEstimatedCost('diagnostic', deviceType),
            timeToImplement: '1-3 hours',
            impactOnFailureRisk: 20,
            category: 'Predictive'
          });
          break;

        case 'Device Age':
          actions.push({
            action: 'Consider device replacement or major overhaul',
            priority: factor.impact === 'Critical' ? 'High' : 'Medium',
            estimatedCost: this.getEstimatedCost('replacement', deviceType),
            timeToImplement: '1-3 days',
            impactOnFailureRisk: 60,
            category: 'Preventive'
          });
          break;
      }
    });

    // Sort by priority and impact
    return actions.sort((a, b) => {
      const priorityOrder = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority] || b.impactOnFailureRisk - a.impactOnFailureRisk;
    });
  }

  private getEstimatedCost(actionType: string, deviceType: string): number {
    const baseCosts: Record<string, Record<string, number>> = {
      'cleaning': {
        'AC': 80,
        'Washer': 60,
        'Geyser': 70,
        'Solar Panel': 150,
        'Battery': 100,
        'EV Charger': 90,
        'Light': 30
      },
      'ventilation': {
        'AC': 120,
        'Washer': 80,
        'Geyser': 100,
        'Solar Panel': 200,
        'Battery': 150,
        'EV Charger': 110,
        'Light': 50
      },
      'mechanical': {
        'AC': 200,
        'Washer': 180,
        'Geyser': 150,
        'Solar Panel': 100,
        'Battery': 120,
        'EV Charger': 160,
        'Light': 40
      },
      'diagnostic': {
        'AC': 100,
        'Washer': 80,
        'Geyser': 90,
        'Solar Panel': 120,
        'Battery': 110,
        'EV Charger': 95,
        'Light': 50
      },
      'replacement': {
        'AC': 2000,
        'Washer': 800,
        'Geyser': 600,
        'Solar Panel': 5000,
        'Battery': 3000,
        'EV Charger': 1500,
        'Light': 100
      }
    };

    return baseCosts[actionType]?.[deviceType] || 100;
  }

  async getPrediction(deviceId: string): Promise<FailurePrediction | null> {
    return this.predictions.get(deviceId) || null;
  }

  async getAllPredictions(): Promise<FailurePrediction[]> {
    return Array.from(this.predictions.values());
  }

  async getHighRiskPredictions(threshold: number = 70): Promise<FailurePrediction[]> {
    return Array.from(this.predictions.values())
      .filter(prediction => prediction.failureProbability >= threshold);
  }

  async updateModel(modelName: string, accuracy: number, trainingDataSize: number): Promise<void> {
    const model = this.models.get(modelName);
    if (model) {
      model.accuracy = accuracy;
      model.trainingDataSize = trainingDataSize;
      model.lastUpdated = new Date();
      this.models.set(modelName, model);
    }
  }

  async addHistoricalFailureData(data: HistoricalFailureData): Promise<void> {
    this.historicalData.push(data);
  }

  async getPredictionSummary(): Promise<{
    totalPredictions: number;
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
    averageConfidence: number;
    mostCommonRiskFactors: string[];
  }> {
    const predictions = Array.from(this.predictions.values());
    const highRisk = predictions.filter(p => p.failureProbability >= 70).length;
    const mediumRisk = predictions.filter(p => p.failureProbability >= 40 && p.failureProbability < 70).length;
    const lowRisk = predictions.filter(p => p.failureProbability < 40).length;
    
    const averageConfidence = predictions.length > 0 
      ? predictions.reduce((sum, p) => sum + p.confidenceLevel, 0) / predictions.length 
      : 0;

    const allRiskFactors = predictions.flatMap(p => p.riskFactors.map(rf => rf.factor));
    const riskFactorCounts = allRiskFactors.reduce((counts, factor) => {
      counts[factor] = (counts[factor] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    const mostCommonRiskFactors = Object.entries(riskFactorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([factor]) => factor);

    return {
      totalPredictions: predictions.length,
      highRisk,
      mediumRisk,
      lowRisk,
      averageConfidence: Math.round(averageConfidence),
      mostCommonRiskFactors
    };
  }
}

let failurePredictionInstance: FailurePredictionEngine | null = null;

export function getFailurePredictionEngine(): FailurePredictionEngine {
  if (!failurePredictionInstance) {
    failurePredictionInstance = new FailurePredictionEngine();
  }
  return failurePredictionInstance;
}
