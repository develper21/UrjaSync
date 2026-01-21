import { getUsagePatternAnalyzer, UsagePattern } from './pattern-analysis';

export interface PredictionModel {
  deviceId: string;
  modelType: 'linear_regression' | 'exponential_smoothing' | 'seasonal_decomposition';
  accuracy: number; // 0-1
  lastTrained: number;
  parameters: Record<string, any>;
}

export interface EnergyForecast {
  deviceId: string;
  timestamp: number;
  predictedConsumption: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  confidence: number;
  modelUsed: string;
}

export interface BillForecast {
  period: string; // e.g., "2024-01"
  currentUsage: number;
  projectedUsage: number;
  currentCost: number;
  projectedCost: number;
  dailyAverage: number;
  peakDays: Array<{ date: string; usage: number; cost: number }>;
  confidence: number;
}

export interface PeakHourPrediction {
  date: string;
  peakHour: number;
  predictedPeak: number;
  confidence: number;
  recommendations: string[];
}

export class PredictiveAnalytics {
  private patternAnalyzer = getUsagePatternAnalyzer();
  private models: Map<string, PredictionModel> = new Map();
  private forecasts: Map<string, EnergyForecast[]> = new Map();

  // Train prediction models for a device
  async trainModel(deviceId: string, historicalData: Array<{ timestamp: number; consumption: number }>): Promise<PredictionModel> {
    // Analyze usage patterns first
    this.patternAnalyzer.analyzeUsagePatterns(deviceId, historicalData);
    
    // Try different models and select the best one
    const models = [
      await this.trainLinearRegression(deviceId, historicalData),
      await this.trainExponentialSmoothing(deviceId, historicalData),
      await this.trainSeasonalDecomposition(deviceId, historicalData)
    ];
    
    // Select model with highest accuracy
    const bestModel = models.reduce((best, current) => 
      current.accuracy > best.accuracy ? current : best
    );
    
    this.models.set(deviceId, bestModel);
    return bestModel;
  }

  // Generate energy consumption forecast
  async generateForecast(deviceId: string, hoursAhead: number): Promise<EnergyForecast[]> {
    const model = this.models.get(deviceId);
    if (!model) {
      throw new Error(`No trained model found for device ${deviceId}`);
    }
    
    const forecasts: EnergyForecast[] = [];
    const now = Date.now();
    
    for (let hour = 0; hour < hoursAhead; hour++) {
      const timestamp = now + (hour * 60 * 60 * 1000);
      const prediction = await this.predictConsumption(deviceId, timestamp, model);
      forecasts.push(prediction);
    }
    
    this.forecasts.set(deviceId, forecasts);
    return forecasts;
  }

  // Generate bill forecast for the current billing period
  async generateBillForecast(deviceId: string, billingPeriod: { start: Date; end: Date }, tariffRates: { peak: number; standard: number; offPeak: number }): Promise<BillForecast> {
    const now = new Date();
    const period = billingPeriod.start.toISOString().slice(0, 7); // YYYY-MM format
    
    // Get historical data for current period
    const currentUsage = await this.getCurrentPeriodUsage(deviceId, billingPeriod.start, now);
    
    // Generate forecast for remaining period
    const remainingHours = Math.floor((billingPeriod.end.getTime() - now.getTime()) / (60 * 60 * 1000));
    const futureForecasts = await this.generateForecast(deviceId, Math.min(remainingHours, 24 * 30)); // Max 30 days
    
    const projectedUsage = currentUsage + futureForecasts.reduce((sum, f) => sum + f.predictedConsumption, 0);
    
    // Calculate costs
    const currentCost = this.calculateCost(currentUsage, tariffRates);
    const projectedCost = this.calculateCost(projectedUsage, tariffRates);
    
    // Identify peak days
    const dailyForecasts = this.groupForecastsByDay(futureForecasts);
    const peakDays = dailyForecasts
      .map(day => ({
        date: day.date,
        usage: day.totalConsumption,
        cost: this.calculateCost(day.totalConsumption, tariffRates)
      }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 5);
    
    return {
      period,
      currentUsage,
      projectedUsage,
      currentCost,
      projectedCost,
      dailyAverage: projectedUsage / Math.ceil((billingPeriod.end.getTime() - billingPeriod.start.getTime()) / (24 * 60 * 60 * 1000)),
      peakDays,
      confidence: this.calculateForecastConfidence(deviceId)
    };
  }

  // Predict peak hours for the next week
  async predictPeakHours(deviceId: string): Promise<PeakHourPrediction[]> {
    const forecasts = await this.generateForecast(deviceId, 24 * 7); // Next 7 days
    const dailyForecasts = this.groupForecastsByDay(forecasts);
    
    const peakPredictions: PeakHourPrediction[] = [];
    
    dailyForecasts.forEach(day => {
      const hourlyData = day.forecasts.map(f => ({
        hour: new Date(f.timestamp).getHours(),
        consumption: f.predictedConsumption,
        confidence: f.confidence
      }));
      
      // Find peak hour
      const peakHour = hourlyData.reduce((max, current) => 
        current.consumption > max.consumption ? current : max
      );
      
      const recommendations = this.generatePeakHourRecommendations(peakHour.hour, hourlyData);
      
      peakPredictions.push({
        date: day.date,
        peakHour: peakHour.hour,
        predictedPeak: peakHour.consumption,
        confidence: peakHour.confidence,
        recommendations
      });
    });
    
    return peakPredictions;
  }

  // Predict maintenance needs based on usage patterns
  predictMaintenance(deviceId: string): {
    maintenanceNeeded: boolean;
    urgency: 'low' | 'medium' | 'high';
    predictedIssue: string;
    recommendedAction: string;
    nextMaintenanceDate: Date;
    confidence: number;
  } {
    const anomalies = this.patternAnalyzer.getAnomalies(deviceId);
    const patterns = this.patternAnalyzer.getPatterns(deviceId) as UsagePattern[];
    
    if (!Array.isArray(patterns) || patterns.length === 0) {
      return {
        maintenanceNeeded: false,
        urgency: 'low',
        predictedIssue: 'No data available',
        recommendedAction: 'Monitor device',
        nextMaintenanceDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        confidence: 0
      };
    }
    
    // Analyze recent anomalies
    const recentAnomalies = anomalies.filter(a => 
      Date.now() - a.timestamp < 7 * 24 * 60 * 60 * 1000 // Last 7 days
    );
    
    const criticalAnomalies = recentAnomalies.filter(a => a.severity === 'critical');
    const highAnomalies = recentAnomalies.filter(a => a.severity === 'high');
    
    // Calculate maintenance urgency
    let maintenanceNeeded = false;
    let urgency: 'low' | 'medium' | 'high' = 'low';
    let predictedIssue = '';
    let recommendedAction = '';
    let confidence = 0;
    
    if (criticalAnomalies.length > 0) {
      maintenanceNeeded = true;
      urgency = 'high';
      predictedIssue = 'Critical performance anomalies detected';
      recommendedAction = 'Immediate inspection required';
      confidence = 0.9;
    } else if (highAnomalies.length > 2) {
      maintenanceNeeded = true;
      urgency = 'medium';
      predictedIssue = 'Multiple high-severity anomalies';
      recommendedAction = 'Schedule maintenance within 2 weeks';
      confidence = 0.7;
    } else if (recentAnomalies.length > 5) {
      maintenanceNeeded = true;
      urgency = 'low';
      predictedIssue = 'Increased anomaly frequency';
      recommendedAction = 'Schedule routine maintenance';
      confidence = 0.6;
    }
    
    // Calculate next maintenance date based on usage patterns
    const avgVariance = patterns.reduce((sum, p) => sum + p.variance, 0) / patterns.length;
    const daysUntilMaintenance = maintenanceNeeded 
      ? urgency === 'high' ? 3 : urgency === 'medium' ? 14 : 30
      : Math.max(30, Math.min(90, 60 - avgVariance * 10));
    
    return {
      maintenanceNeeded,
      urgency,
      predictedIssue,
      recommendedAction,
      nextMaintenanceDate: new Date(Date.now() + daysUntilMaintenance * 24 * 60 * 60 * 1000),
      confidence
    };
  }

  // Private helper methods
  private async trainLinearRegression(deviceId: string, data: Array<{ timestamp: number; consumption: number }>): Promise<PredictionModel> {
    // Simplified linear regression
    const n = data.length;
    const x = data.map((_, i) => i);
    const y = data.map(d => d.consumption);
    
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + (val * y[i]), 0);
    const sumX2 = x.reduce((sum, val) => sum + (val * val), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate accuracy (R-squared)
    const yMean = sumY / n;
    const totalSumSquares = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
    const residualSumSquares = y.reduce((sum, val, i) => {
      const predicted = slope * x[i] + intercept;
      return sum + Math.pow(val - predicted, 2);
    }, 0);
    
    const accuracy = 1 - (residualSumSquares / totalSumSquares);
    
    return {
      deviceId,
      modelType: 'linear_regression',
      accuracy: Math.max(0, accuracy),
      lastTrained: Date.now(),
      parameters: { slope, intercept }
    };
  }

  private async trainExponentialSmoothing(deviceId: string, data: Array<{ timestamp: number; consumption: number }>): Promise<PredictionModel> {
    // Simple exponential smoothing
    const alpha = 0.3; // Smoothing factor
    let smoothed = data[0].consumption;
    let errors: number[] = [];
    
    for (let i = 1; i < data.length; i++) {
      const predicted = smoothed;
      const actual = data[i].consumption;
      smoothed = alpha * actual + (1 - alpha) * smoothed;
      errors.push(Math.abs(actual - predicted));
    }
    
    const meanError = errors.reduce((sum, err) => sum + err, 0) / errors.length;
    const accuracy = Math.max(0, 1 - (meanError / (data.reduce((sum, d) => sum + d.consumption, 0) / data.length)));
    
    return {
      deviceId,
      modelType: 'exponential_smoothing',
      accuracy,
      lastTrained: Date.now(),
      parameters: { alpha, lastValue: smoothed }
    };
  }

  private async trainSeasonalDecomposition(deviceId: string, data: Array<{ timestamp: number; consumption: number }>): Promise<PredictionModel> {
    // Simplified seasonal decomposition
    const hourlyAverages = new Array(24).fill(0);
    const hourlyCounts = new Array(24).fill(0);
    
    data.forEach(point => {
      const hour = new Date(point.timestamp).getHours();
      hourlyAverages[hour] += point.consumption;
      hourlyCounts[hour]++;
    });
    
    const seasonalFactors = hourlyAverages.map((sum, i) => 
      hourlyCounts[i] > 0 ? sum / hourlyCounts[i] : 0
    );
    
    const overallAverage = seasonalFactors.reduce((sum, val) => sum + val, 0) / 24;
    const normalizedSeasonalFactors = seasonalFactors.map(factor => factor / overallAverage);
    
    // Calculate accuracy based on seasonal pattern strength
    const variance = normalizedSeasonalFactors.reduce((sum, factor) => {
      return sum + Math.pow(factor - 1, 2);
    }, 0) / 24;
    
    const accuracy = Math.min(0.9, variance); // Higher variance = stronger seasonal pattern
    
    return {
      deviceId,
      modelType: 'seasonal_decomposition',
      accuracy,
      lastTrained: Date.now(),
      parameters: { seasonalFactors: normalizedSeasonalFactors, baseline: overallAverage }
    };
  }

  private async predictConsumption(deviceId: string, timestamp: number, model: PredictionModel): Promise<EnergyForecast> {
    let predictedConsumption = 0;
    let confidence = model.accuracy;
    
    switch (model.modelType) {
      case 'linear_regression':
        const timeIndex = Math.floor((timestamp - model.lastTrained) / (60 * 60 * 1000));
        predictedConsumption = model.parameters.slope * timeIndex + model.parameters.intercept;
        break;
        
      case 'exponential_smoothing':
        predictedConsumption = model.parameters.lastValue;
        break;
        
      case 'seasonal_decomposition':
        const hour = new Date(timestamp).getHours();
        const seasonalFactor = model.parameters.seasonalFactors && model.parameters.seasonalFactors[hour] || 1;
        predictedConsumption = model.parameters.baseline * seasonalFactor;
        break;
    }
    
    // Calculate confidence interval
    const margin = predictedConsumption * (1 - confidence) * 0.5;
    
    return {
      deviceId,
      timestamp,
      predictedConsumption: Math.max(0, predictedConsumption),
      confidenceInterval: {
        lower: Math.max(0, predictedConsumption - margin),
        upper: predictedConsumption + margin
      },
      confidence,
      modelUsed: model.modelType
    };
  }

  private async getCurrentPeriodUsage(_deviceId: string, startDate: Date, endDate: Date): Promise<number> {
    // TODO: Implement actual data retrieval from database
    // For now, return mock data
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    return days * 2.5; // Mock: 2.5 kWh per day
  }

  private calculateCost(usage: number, tariffRates: { peak: number; standard: number; offPeak: number }): number {
    // Simplified cost calculation
    const peakHours = 4; // 6 PM - 10 PM
    const offPeakHours = 8; // 10 PM - 6 AM
    const standardHours = 12; // 6 AM - 6 PM
    
    const totalHours = peakHours + offPeakHours + standardHours;
    const peakUsage = (usage / totalHours) * peakHours;
    const offPeakUsage = (usage / totalHours) * offPeakHours;
    const standardUsage = (usage / totalHours) * standardHours;
    
    return (peakUsage * tariffRates.peak) + (standardUsage * tariffRates.standard) + (offPeakUsage * tariffRates.offPeak);
  }

  private groupForecastsByDay(forecasts: EnergyForecast[]): Array<{ date: string; forecasts: EnergyForecast[]; totalConsumption: number }> {
    const dailyGroups = new Map<string, EnergyForecast[]>();
    
    forecasts.forEach(forecast => {
      const date = new Date(forecast.timestamp).toISOString().slice(0, 10);
      if (!dailyGroups.has(date)) {
        dailyGroups.set(date, []);
      }
      dailyGroups.get(date)!.push(forecast);
    });
    
    return Array.from(dailyGroups.entries()).map(([date, dayForecasts]) => ({
      date,
      forecasts: dayForecasts,
      totalConsumption: dayForecasts.reduce((sum, f) => sum + f.predictedConsumption, 0)
    }));
  }

  private generatePeakHourRecommendations(peakHour: number, hourlyData: Array<{ hour: number; consumption: number; confidence: number }>): string[] {
    const recommendations: string[] = [];
    
    if (peakHour >= 18 && peakHour <= 22) {
      recommendations.push('Peak hour coincides with high tariff period (6 PM - 10 PM)');
      recommendations.push('Consider shifting heavy appliance usage to before 6 PM or after 10 PM');
      recommendations.push('Pre-cool rooms before peak hours to reduce AC usage during peak time');
    } else if (peakHour >= 6 && peakHour <= 9) {
      recommendations.push('Morning peak detected - consider staggering appliance usage');
      recommendations.push('Delay non-essential tasks until after 9 AM');
    }
    
    const avgConsumption = hourlyData.reduce((sum, h) => sum + h.consumption, 0) / hourlyData.length;
    const peakHourData = hourlyData.find(h => h.hour === peakHour);
    if (peakHourData && peakHourData.consumption > avgConsumption * 2) {
      recommendations.push('Unusually high consumption during peak hour - check for malfunctioning appliances');
    }
    
    return recommendations;
  }

  private calculateForecastConfidence(deviceId: string): number {
    const model = this.models.get(deviceId);
    const patterns = this.patternAnalyzer.getPatterns(deviceId) as UsagePattern[];
    
    if (!model || !Array.isArray(patterns)) return 0;
    
    const avgPatternConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
    return (model.accuracy + avgPatternConfidence) / 2;
  }

  // Public getters
  getModel(deviceId: string): PredictionModel | undefined {
    return this.models.get(deviceId);
  }

  getForecasts(deviceId: string): EnergyForecast[] {
    return this.forecasts.get(deviceId) || [];
  }

  getAllModels(): Map<string, PredictionModel> {
    return this.models;
  }
}

// Singleton instance
let predictiveAnalytics: PredictiveAnalytics | null = null;

export function getPredictiveAnalytics(): PredictiveAnalytics {
  if (!predictiveAnalytics) {
    predictiveAnalytics = new PredictiveAnalytics();
  }
  return predictiveAnalytics;
}
