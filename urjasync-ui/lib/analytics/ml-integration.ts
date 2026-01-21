// Advanced ML Integration for Analytics Engine
export interface MLModelConfig {
  algorithm: 'random_forest' | 'gradient_boosting' | 'neural_network' | 'svm';
  features: string[];
  hyperparameters: Record<string, any>;
  trainingDataSize: number;
  validationSplit: number;
}

export interface PredictionResult {
  prediction: number;
  confidence: number;
  featureImportance: Record<string, number>;
  modelAccuracy: number;
  predictionInterval: {
    lower: number;
    upper: number;
  };
}

export interface AnomalyScore {
  score: number; // 0-1, higher = more anomalous
  features: Record<string, number>;
  explanation: string;
  threshold: number;
}

export class MLIntegration {
  private models: Map<string, MLModelConfig> = new Map();
  private trainedModels: Map<string, any> = new Map(); // In production, this would be actual ML models

  // Advanced feature engineering
  extractFeatures(_deviceId: string, historicalData: Array<{
    timestamp: number;
    consumption: number;
    voltage?: number;
    current?: number;
    power?: number;
    temperature?: number;
    humidity?: number;
  }>): Array<{ features: Record<string, number>; target: number }> {
    const features: Array<{ features: Record<string, number>; target: number }> = [];

    historicalData.forEach((point, index) => {
      const date = new Date(point.timestamp);
      const featureVector: Record<string, number> = {
        // Time-based features
        hour: date.getHours(),
        dayOfWeek: date.getDay(),
        dayOfMonth: date.getDate(),
        month: date.getMonth(),
        isWeekend: date.getDay() === 0 || date.getDay() === 6 ? 1 : 0,
        
        // Consumption features
        consumption: point.consumption,
        
        // Lag features (previous values)
        lag1h: index > 0 ? historicalData[index - 1].consumption : 0,
        lag2h: index > 1 ? historicalData[index - 2].consumption : 0,
        lag24h: index > 23 ? historicalData[index - 24].consumption : 0,
        
        // Rolling statistics
        rollingMean3h: this.calculateRollingMean(historicalData, index, 3),
        rollingMean6h: this.calculateRollingMean(historicalData, index, 6),
        rollingStd3h: this.calculateRollingStd(historicalData, index, 3),
        
        // Trend features
        trend3h: this.calculateTrend(historicalData, index, 3),
        trend6h: this.calculateTrend(historicalData, index, 6),
        
        // Environmental features
        voltage: point.voltage || 230,
        current: point.current || (point.consumption * 1000) / (point.voltage || 230),
        power: point.power || point.consumption * 1000,
        temperature: point.temperature || 25,
        humidity: point.humidity || 50,
        
        // Derived features
        powerFactor: this.calculatePowerFactor(point),
        efficiency: this.calculateEfficiency(point),
        
        // Interaction features
        hourConsumption: date.getHours() * point.consumption,
        temperatureConsumption: (point.temperature || 25) * point.consumption,
      };

      features.push({
        features: featureVector,
        target: point.consumption
      });
    });

    return features;
  }

  // Train advanced ML models
  async trainAdvancedModel(
    deviceId: string, 
    features: Array<{ features: Record<string, number>; target: number }>,
    _config: MLModelConfig
  ): Promise<{ modelId: string; accuracy: number; featureImportance: Record<string, number> }> {
    // In production, this would use actual ML libraries like TensorFlow.js, scikit-learn, etc.
    // For now, we'll simulate the training process
    
    console.log(`🤖 Training ${_config.algorithm} model for device ${deviceId}`);
    
    // Simulate training with feature importance calculation
    const featureImportance = this.calculateFeatureImportance(features, _config.features);
    const accuracy = this.simulateModelAccuracy(_config.algorithm, features.length);
    
    const modelId = `${deviceId}_${_config.algorithm}_${Date.now()}`;
    
    // Store model configuration
    this.models.set(modelId, _config);
    
    // Simulate trained model (in production, this would be the actual trained model)
    this.trainedModels.set(modelId, {
      modelId,
      algorithm: _config.algorithm,
      featureImportance,
      accuracy,
      trainedAt: Date.now()
    });
    
    return {
      modelId,
      accuracy,
      featureImportance
    };
  }

  // Make predictions using trained models
  async predictWithML(
    _deviceId: string,
    currentFeatures: Record<string, number>,
    modelId?: string
  ): Promise<PredictionResult> {
    // Find the best model for this device
    let targetModelId = modelId;
    if (!targetModelId) {
      const deviceModels = Array.from(this.models.entries())
        .filter(([id]) => id.startsWith(_deviceId))
        .sort(([, a], [, b]) => {
          // Prefer more accurate models
          const modelA = this.trainedModels.get(a.algorithm + '_' + _deviceId);
          const modelB = this.trainedModels.get(b.algorithm + '_' + _deviceId);
          return (modelB?.accuracy || 0) - (modelA?.accuracy || 0);
        });
      
      if (deviceModels.length === 0) {
        throw new Error(`No trained model found for device ${_deviceId}`);
      }
      
      targetModelId = deviceModels[0][0];
    }

    const model = this.trainedModels.get(targetModelId);
    if (!model) {
      throw new Error(`Model ${targetModelId} not found`);
    }

    // Simulate ML prediction
    const prediction = this.simulateMLPrediction(currentFeatures, model);
    
    return prediction;
  }

  // Advanced anomaly detection using ML
  detectAnomaliesML(
    _deviceId: string,
    currentFeatures: Record<string, number>,
    historicalFeatures: Array<Record<string, number>>
  ): AnomalyScore {
    // Calculate anomaly score based on multiple factors
    const anomalyFactors = {
      consumptionDeviation: this.calculateZScore(currentFeatures.consumption, 
        historicalFeatures.map(f => f.consumption)),
      
      voltageAnomaly: Math.abs(currentFeatures.voltage - 230) / 230,
      
      powerFactorAnomaly: Math.abs(currentFeatures.powerFactor - 0.9),
      
      timePatternAnomaly: this.detectTimePatternAnomaly(currentFeatures, historicalFeatures),
      
      environmentalAnomaly: this.detectEnvironmentalAnomaly(currentFeatures, historicalFeatures),
      
      trendAnomaly: this.detectTrendAnomaly(currentFeatures, historicalFeatures)
    };

    // Weighted anomaly score
    const weights = {
      consumptionDeviation: 0.3,
      voltageAnomaly: 0.15,
      powerFactorAnomaly: 0.15,
      timePatternAnomaly: 0.2,
      environmentalAnomaly: 0.1,
      trendAnomaly: 0.1
    };

    const totalScore = Object.entries(anomalyFactors).reduce((sum, [factor, score]) => {
      return sum + (score * weights[factor as keyof typeof weights]);
    }, 0);

    const threshold = 0.7; // Anomaly threshold
    const isAnomalous = totalScore > threshold;

    return {
      score: totalScore,
      features: anomalyFactors,
      explanation: this.generateAnomalyExplanation(anomalyFactors, isAnomalous),
      threshold
    };
  }

  // Ensemble predictions from multiple models
  async ensemblePredict(
    _deviceId: string,
    features: Record<string, number>
  ): Promise<{
    prediction: number;
    confidence: number;
    modelContributions: Array<{ modelId: string; prediction: number; weight: number }>;
  }> {
    const deviceModels = Array.from(this.trainedModels.entries())
      .filter(([id]) => id.includes(_deviceId));

    if (deviceModels.length === 0) {
      throw new Error(`No models found for device ${_deviceId}`);
    }

    const predictions = await Promise.all(
      deviceModels.map(async ([modelId, model]) => {
        const prediction = await this.predictWithML(_deviceId, features, modelId);
        return {
          modelId,
          prediction: prediction.prediction,
          weight: model.accuracy
        };
      })
    );

    // Weighted ensemble
    const totalWeight = predictions.reduce((sum, p) => sum + p.weight, 0);
    const ensemblePrediction = predictions.reduce((sum, p) => 
      sum + (p.prediction * p.weight), 0) / totalWeight;

    const avgConfidence = predictions.reduce((sum, p) => 
      sum + (this.trainedModels.get(p.modelId)?.accuracy || 0), 0) / predictions.length;

    return {
      prediction: ensemblePrediction,
      confidence: avgConfidence,
      modelContributions: predictions
    };
  }

  // Helper methods
  private calculateRollingMean(data: Array<{ consumption: number }>, index: number, window: number): number {
    const start = Math.max(0, index - window + 1);
    const end = index + 1;
    const windowData = data.slice(start, end);
    return windowData.reduce((sum, d) => sum + d.consumption, 0) / windowData.length;
  }

  private calculateRollingStd(data: Array<{ consumption: number }>, index: number, window: number): number {
    const start = Math.max(0, index - window + 1);
    const end = index + 1;
    const windowData = data.slice(start, end).map(d => d.consumption);
    const mean = windowData.reduce((sum, d) => sum + d, 0) / windowData.length;
    const variance = windowData.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / windowData.length;
    return Math.sqrt(variance);
  }

  private calculateTrend(data: Array<{ consumption: number }>, index: number, window: number): number {
    if (index < window - 1) return 0;
    
    const windowData = data.slice(index - window + 1, index + 1).map(d => d.consumption);
    const firstHalf = windowData.slice(0, Math.floor(window / 2));
    const secondHalf = windowData.slice(Math.floor(window / 2));
    
    const firstMean = firstHalf.reduce((sum, d) => sum + d, 0) / firstHalf.length;
    const secondMean = secondHalf.reduce((sum, d) => sum + d, 0) / secondHalf.length;
    
    return (secondMean - firstMean) / firstMean;
  }

  private calculatePowerFactor(point: { consumption?: number; power?: number; voltage?: number; current?: number }): number {
    const power = point.power || (point.consumption || 0) * 1000;
    const voltage = point.voltage || 230;
    const current = point.current || (point.power || (point.consumption || 0) * 1000) / voltage;
    const apparentPower = voltage * current;
    return apparentPower > 0 ? power / apparentPower : 0.9;
  }

  private calculateEfficiency(point: { consumption?: number; power?: number }): number {
    // Simplified efficiency calculation
    const power = point.power || (point.consumption || 0) * 1000;
    const expectedPower = (point.consumption || 0) * 1000;
    return expectedPower > 0 ? Math.min(1, power / expectedPower) : 0.8;
  }

  private calculateFeatureImportance(
    features: Array<{ features: Record<string, number>; target: number }>,
    featureNames: string[]
  ): Record<string, number> {
    const importance: Record<string, number> = {};
    
    featureNames.forEach(feature => {
      // Calculate correlation between feature and target
      const featureValues = features.map(f => f.features[feature]);
      const targetValues = features.map(f => f.target);
      
      const correlation = this.calculateCorrelation(featureValues, targetValues);
      importance[feature] = Math.abs(correlation);
    });

    // Normalize to sum to 1
    const totalImportance = Object.values(importance).reduce((sum, val) => sum + val, 0);
    Object.keys(importance).forEach(key => {
      importance[key] = importance[key] / totalImportance;
    });

    return importance;
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + (val * y[i]), 0);
    const sumX2 = x.reduce((sum, val) => sum + (val * val), 0);
    const sumY2 = y.reduce((sum, val) => sum + (val * val), 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private simulateModelAccuracy(algorithm: string, dataSize: number): number {
    // Simulate different accuracies for different algorithms
    const baseAccuracies = {
      'random_forest': 0.85,
      'gradient_boosting': 0.88,
      'neural_network': 0.82,
      'svm': 0.80
    };
    
    const baseAccuracy = baseAccuracies[algorithm as keyof typeof baseAccuracies] || 0.8;
    const dataBonus = Math.min(0.1, dataSize / 1000); // More data = better accuracy
    
    return Math.min(0.95, baseAccuracy + dataBonus);
  }

  private simulateMLPrediction(features: Record<string, number>, model: any): PredictionResult {
    // Simulate ML prediction based on features and model accuracy
    const basePrediction = features.consumption * (0.9 + Math.random() * 0.2);
    const noise = (Math.random() - 0.5) * basePrediction * (1 - model.accuracy);
    
    const prediction = Math.max(0, basePrediction + noise);
    const confidence = model.accuracy;
    
    const margin = prediction * (1 - confidence) * 0.3;
    
    return {
      prediction,
      confidence,
      featureImportance: model.featureImportance,
      modelAccuracy: model.accuracy,
      predictionInterval: {
        lower: Math.max(0, prediction - margin),
        upper: prediction + margin
      }
    };
  }

  private calculateZScore(value: number, data: number[]): number {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const std = Math.sqrt(data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length);
    return std === 0 ? 0 : (value - mean) / std;
  }

  private detectTimePatternAnomaly(current: Record<string, number>, historical: Array<Record<string, number>>): number {
    const currentHour = current.hour;
    const sameHourData = historical.filter(f => f.hour === currentHour);
    
    if (sameHourData.length < 5) return 0;
    
    const avgConsumption = sameHourData.reduce((sum, f) => sum + f.consumption, 0) / sameHourData.length;
    return Math.abs(current.consumption - avgConsumption) / avgConsumption;
  }

  private detectEnvironmentalAnomaly(_current: Record<string, number>, _historical: Array<Record<string, number>>): number {
    const tempDiff = Math.abs(_current.temperature - 25); // Deviation from room temperature
    const humidityDiff = Math.abs(_current.humidity - 50); // Deviation from optimal humidity
    
    return (tempDiff / 25 + humidityDiff / 50) / 2;
  }

  private detectTrendAnomaly(_current: Record<string, number>, historical: Array<Record<string, number>>): number {
    if (historical.length < 10) return 0;
    
    const recentTrend = this.calculateTrend(
      historical.map(h => ({ consumption: h.consumption })),
      historical.length - 1,
      5
    );
    
    return Math.abs(recentTrend);
  }

  private generateAnomalyExplanation(factors: Record<string, number>, isAnomalous: boolean): string {
    if (!isAnomalous) return 'Normal behavior detected';
    
    const significantFactors = Object.entries(factors)
      .filter(([, score]) => score > 0.5)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
    
    const explanations: Record<string, string> = {
      consumptionDeviation: 'unusual consumption level',
      voltageAnomaly: 'voltage fluctuation',
      powerFactorAnomaly: 'poor power factor',
      timePatternAnomaly: 'unusual time pattern',
      environmentalAnomaly: 'extreme environmental conditions',
      trendAnomaly: 'abnormal consumption trend'
    };
    
    const factorNames = significantFactors.map(([factor]) => explanations[factor as keyof typeof explanations]);
    
    return `Anomaly detected due to: ${factorNames.join(', ')}`;
  }

  // Model management
  getModel(modelId: string): any {
    return this.trainedModels.get(modelId);
  }

  getDeviceModels(deviceId: string): any[] {
    return Array.from(this.trainedModels.entries())
      .filter(([id]) => id.includes(deviceId))
      .map(([id, model]) => ({ id, ...model }));
  }

  deleteModel(modelId: string): boolean {
    return this.trainedModels.delete(modelId) && this.models.delete(modelId);
  }
}

// Singleton instance
let mlIntegration: MLIntegration | null = null;

export function getMLIntegration(): MLIntegration {
  if (!mlIntegration) {
    mlIntegration = new MLIntegration();
  }
  return mlIntegration;
}
