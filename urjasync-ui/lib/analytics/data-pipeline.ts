import { EnergyData } from '../iot/mqtt-client';
import { getRedisCache } from '../realtime/redis-cache';
import { getUsagePatternAnalyzer } from './pattern-analysis';
import { getPredictiveAnalytics } from './predictive-analytics';
import { getMLIntegration } from './ml-integration';

export interface DataPipelineConfig {
  batchSize: number;
  batchInterval: number; // milliseconds
  maxRetries: number;
  processingTimeout: number; // milliseconds
  enableMLProcessing: boolean;
  enableRealTimeAnalysis: boolean;
}

export interface ProcessingResult {
  success: boolean;
  processedCount: number;
  errors: string[];
  processingTime: number;
  anomalies: any[];
  predictions: any[];
  recommendations: any[];
}

export interface DataQualityMetrics {
  completeness: number; // 0-1
  accuracy: number; // 0-1
  consistency: number; // 0-1
  timeliness: number; // 0-1
  validity: number; // 0-1
  overallScore: number; // 0-1
}

export class AnalyticsDataPipeline {
  private config: DataPipelineConfig;
  private processingQueue: EnergyData[] = [];
  private isProcessing = false;
  private metrics: {
    totalProcessed: number;
    totalErrors: number;
    averageProcessingTime: number;
    lastProcessingTime: number;
  } = {
    totalProcessed: 0,
    totalErrors: 0,
    averageProcessingTime: 0,
    lastProcessingTime: 0
  };

  constructor(config: Partial<DataPipelineConfig> = {}) {
    this.config = {
      batchSize: 100,
      batchInterval: 5000, // 5 seconds
      maxRetries: 3,
      processingTimeout: 30000, // 30 seconds
      enableMLProcessing: true,
      enableRealTimeAnalysis: true,
      ...config
    };

    this.startPipeline();
  }

  // Add data to processing queue
  async addToQueue(data: EnergyData[]): Promise<void> {
    this.processingQueue.push(...data);
    
    // Trigger processing if queue is full
    if (this.processingQueue.length >= this.config.batchSize) {
      await this.processBatch();
    }
  }

  // Process a batch of data
  private async processBatch(): Promise<ProcessingResult> {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return {
        success: false,
        processedCount: 0,
        errors: ['No data to process or already processing'],
        processingTime: 0,
        anomalies: [],
        predictions: [],
        recommendations: []
      };
    }

    this.isProcessing = true;
    const startTime = Date.now();
    const batch = this.processingQueue.splice(0, this.config.batchSize);
    
    try {
      // 1. Data Quality Assessment
      const qualityMetrics = this.assessDataQuality(batch);
      console.log(`📊 Data Quality Score: ${(qualityMetrics.overallScore * 100).toFixed(1)}%`);

      // 2. Clean and validate data
      const cleanedData = this.cleanAndValidateData(batch);
      
      // 3. Group data by device
      const dataByDevice = this.groupDataByDevice(cleanedData);
      
      // 4. Process each device's data
      const results = await Promise.all(
        Array.from(dataByDevice.entries()).map(async ([deviceId, deviceData]) => {
          return await this.processDeviceData(deviceId, deviceData);
        })
      );

      // 5. Aggregate results
      const aggregatedResults = this.aggregateResults(results);
      
      // 6. Store results in cache
      await this.storeResults(aggregatedResults);

      // 7. Update metrics
      this.updateMetrics(startTime, batch.length, true);

      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        processedCount: batch.length,
        errors: [],
        processingTime,
        ...aggregatedResults
      };

    } catch (error) {
      console.error('Pipeline processing error:', error);
      this.updateMetrics(startTime, batch.length, false);
      
      return {
        success: false,
        processedCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        processingTime: Date.now() - startTime,
        anomalies: [],
        predictions: [],
        recommendations: []
      };
    } finally {
      this.isProcessing = false;
    }
  }

  // Assess data quality
  private assessDataQuality(data: EnergyData[]): DataQualityMetrics {
    if (data.length === 0) {
      return {
        completeness: 0,
        accuracy: 0,
        consistency: 0,
        timeliness: 0,
        validity: 0,
        overallScore: 0
      };
    }

    const now = Date.now();
    const completeness = this.calculateCompleteness(data);
    const accuracy = this.calculateAccuracy(data);
    const consistency = this.calculateConsistency(data);
    const timeliness = this.calculateTimeliness(data, now);
    const validity = this.calculateValidity(data);

    const overallScore = (completeness + accuracy + consistency + timeliness + validity) / 5;

    return {
      completeness,
      accuracy,
      consistency,
      timeliness,
      validity,
      overallScore
    };
  }

  // Clean and validate data
  private cleanAndValidateData(data: EnergyData[]): EnergyData[] {
    return data.filter(point => {
      // Remove invalid readings
      if (point.consumption < 0 || point.consumption > 1000) return false; // Unrealistic values
      if (point.voltage < 200 || point.voltage > 250) return false; // Voltage range
      if (point.current < 0 || point.current > 100) return false; // Current range
      if (point.frequency < 45 || point.frequency > 55) return false; // Frequency range
      
      // Remove duplicates (same timestamp and device)
      return true;
    }).map(point => ({
      ...point,
      // Normalize values
      consumption: Math.round(point.consumption * 100) / 100,
      voltage: Math.round(point.voltage * 10) / 10,
      current: Math.round(point.current * 100) / 100,
      power: Math.round(point.power * 10) / 10,
      frequency: Math.round(point.frequency * 10) / 10
    }));
  }

  // Group data by device
  private groupDataByDevice(data: EnergyData[]): Map<string, EnergyData[]> {
    const grouped = new Map<string, EnergyData[]>();
    
    data.forEach(point => {
      if (!grouped.has(point.deviceId)) {
        grouped.set(point.deviceId, []);
      }
      grouped.get(point.deviceId)!.push(point);
    });
    
    return grouped;
  }

  // Process data for a specific device
  private async processDeviceData(deviceId: string, data: EnergyData[]): Promise<{
    anomalies: any[];
    predictions: any[];
    recommendations: any[];
  }> {
    const patternAnalyzer = getUsagePatternAnalyzer();
    const predictiveAnalytics = getPredictiveAnalytics();
    const mlIntegration = getMLIntegration();
    
    const anomalies: any[] = [];
    const predictions: any[] = [];
    const recommendations: any[] = [];

    // 1. Pattern Analysis
    const historicalData = data.map(d => ({ timestamp: d.timestamp, consumption: d.consumption }));
    patternAnalyzer.analyzeUsagePatterns(deviceId, historicalData);

    // 2. Anomaly Detection
    data.forEach(point => {
      const anomaly = patternAnalyzer.detectAnomalies(deviceId, point);
      if (anomaly) {
        anomalies.push(anomaly);
      }
    });

    // 3. Predictive Analytics (if enabled)
    if (this.config.enableRealTimeAnalysis) {
      try {
        // Train or update model
        await predictiveAnalytics.trainModel(deviceId, historicalData);
        
        // Generate short-term predictions
        const forecasts = await predictiveAnalytics.generateForecast(deviceId, 24); // Next 24 hours
        predictions.push(...forecasts);
        
        // Peak hour predictions
        const peakPredictions = await predictiveAnalytics.predictPeakHours(deviceId);
        predictions.push(...peakPredictions);
      } catch (error) {
        console.warn(`Predictive analytics failed for device ${deviceId}:`, error);
      }
    }

    // 4. ML Processing (if enabled)
    if (this.config.enableMLProcessing) {
      try {
        // Extract features
        const features = mlIntegration.extractFeatures(deviceId, data);
        
        // Train advanced models if enough data
        if (features.length > 50) {
          const modelConfig = {
            algorithm: 'random_forest' as const,
            features: Object.keys(features[0].features),
            hyperparameters: { n_estimators: 100, max_depth: 10 },
            trainingDataSize: features.length,
            validationSplit: 0.2
          };
          
          await mlIntegration.trainAdvancedModel(deviceId, features, modelConfig);
        }

        // ML-based anomaly detection
        data.forEach(point => {
          const currentFeatures = {
            consumption: point.consumption,
            voltage: point.voltage,
            current: point.current,
            power: point.power,
            hour: new Date(point.timestamp).getHours(),
            dayOfWeek: new Date(point.timestamp).getDay(),
            temperature: 25, // Would come from sensor
            humidity: 50
          };
          
          const historicalFeatures = data.slice(0, -1).map(d => ({
            consumption: d.consumption,
            voltage: d.voltage,
            current: d.current,
            power: d.power,
            hour: new Date(d.timestamp).getHours(),
            dayOfWeek: new Date(d.timestamp).getDay(),
            temperature: 25,
            humidity: 50
          }));
          
          if (historicalFeatures.length > 10) {
            const anomalyScore = mlIntegration.detectAnomaliesML(deviceId, currentFeatures, historicalFeatures);
            if (anomalyScore.score > 0.7) {
              anomalies.push({
                deviceId,
                timestamp: point.timestamp,
                score: anomalyScore.score,
                explanation: anomalyScore.explanation,
                type: 'ml_detected'
              });
            }
          }
        });

        // Ensemble predictions
        if (data.length > 0) {
          const latestFeatures = {
            consumption: data[data.length - 1].consumption,
            voltage: data[data.length - 1].voltage,
            current: data[data.length - 1].current,
            power: data[data.length - 1].power,
            hour: new Date(data[data.length - 1].timestamp).getHours(),
            dayOfWeek: new Date(data[data.length - 1].timestamp).getDay(),
            temperature: 25,
            humidity: 50
          };
          
          try {
            const ensemblePrediction = await mlIntegration.ensemblePredict(deviceId, latestFeatures);
            predictions.push({
              type: 'ensemble',
              deviceId,
              timestamp: Date.now(),
              prediction: ensemblePrediction.prediction,
              confidence: ensemblePrediction.confidence,
              modelContributions: ensemblePrediction.modelContributions
            });
          } catch (error) {
            console.warn(`Ensemble prediction failed for device ${deviceId}:`, error);
          }
        }
      } catch (error) {
        console.warn(`ML processing failed for device ${deviceId}:`, error);
      }
    }

    return {
      anomalies,
      predictions,
      recommendations
    };
  }

  // Aggregate results from multiple devices
  private aggregateResults(results: Array<{
    anomalies: any[];
    predictions: any[];
    recommendations: any[];
  }>): {
    anomalies: any[];
    predictions: any[];
    recommendations: any[];
  } {
    const aggregated = {
      anomalies: [] as any[],
      predictions: [] as any[],
      recommendations: [] as any[]
    };

    results.forEach(result => {
      aggregated.anomalies.push(...result.anomalies);
      aggregated.predictions.push(...result.predictions);
      aggregated.recommendations.push(...result.recommendations);
    });

    return aggregated;
  }

  // Store results in cache
  private async storeResults(results: {
    anomalies: any[];
    predictions: any[];
    recommendations: any[];
  }): Promise<void> {
    const cache = getRedisCache();
    
    try {
      // Cache anomalies
      if (results.anomalies.length > 0) {
        await cache.setJSON('latest_anomalies', results.anomalies, { ttl: 3600 }); // 1 hour
      }
      
      // Cache predictions
      if (results.predictions.length > 0) {
        await cache.setJSON('latest_predictions', results.predictions, { ttl: 1800 }); // 30 minutes
      }
      
      // Cache processing metrics
      await cache.setJSON('pipeline_metrics', this.metrics, { ttl: 300 }); // 5 minutes
      
    } catch (error) {
      console.warn('Failed to store results in cache:', error);
    }
  }

  // Data quality calculation methods
  private calculateCompleteness(data: EnergyData[]): number {
    // Check for missing required fields
    const completeRecords = data.filter(point => 
      point.consumption !== undefined &&
      point.timestamp !== undefined &&
      point.deviceId !== undefined
    ).length;
    
    return completeRecords / data.length;
  }

  private calculateAccuracy(data: EnergyData[]): number {
    // Check for reasonable value ranges
    const accurateRecords = data.filter(point => 
      point.consumption >= 0 && point.consumption <= 100 &&
      point.voltage >= 220 && point.voltage <= 240 &&
      point.frequency >= 48 && point.frequency <= 52
    ).length;
    
    return accurateRecords / data.length;
  }

  private calculateConsistency(data: EnergyData[]): number {
    // Check for consistent time intervals
    if (data.length < 2) return 1;
    
    const intervals = [];
    for (let i = 1; i < data.length; i++) {
      intervals.push(data[i].timestamp - data[i - 1].timestamp);
    }
    
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const consistentIntervals = intervals.filter(interval => 
      Math.abs(interval - avgInterval) < avgInterval * 0.1 // Within 10% of average
    ).length;
    
    return consistentIntervals / intervals.length;
  }

  private calculateTimeliness(data: EnergyData[], currentTime: number): number {
    // Check how recent the data is
    const avgAge = data.reduce((sum, point) => sum + (currentTime - point.timestamp), 0) / data.length;
    const maxAcceptableAge = 5 * 60 * 1000; // 5 minutes
    
    return Math.max(0, 1 - (avgAge / maxAcceptableAge));
  }

  private calculateValidity(data: EnergyData[]): number {
    // Check for valid relationships between values
    const validRecords = data.filter(point => {
      // Power should roughly equal voltage * current
      const calculatedPower = (point.voltage * point.current) / 1000; // kW
      const powerDiff = Math.abs(point.power - calculatedPower) / calculatedPower;
      
      return powerDiff < 0.2; // Within 20% tolerance
    }).length;
    
    return validRecords / data.length;
  }

  // Update pipeline metrics
  private updateMetrics(startTime: number, processedCount: number, success: boolean): void {
    const processingTime = Date.now() - startTime;
    
    this.metrics.totalProcessed += processedCount;
    if (!success) {
      this.metrics.totalErrors++;
    }
    
    // Update average processing time
    this.metrics.averageProcessingTime = 
      (this.metrics.averageProcessingTime + processingTime) / 2;
    
    this.metrics.lastProcessingTime = Date.now();
  }

  // Start the automatic pipeline
  private startPipeline(): void {
    setInterval(async () => {
      if (this.processingQueue.length > 0 && !this.isProcessing) {
        await this.processBatch();
      }
    }, this.config.batchInterval);
  }

  // Public methods
  async forceProcess(): Promise<ProcessingResult> {
    return await this.processBatch();
  }

  getMetrics(): typeof this.metrics {
    return { ...this.metrics };
  }

  getQueueStatus(): {
    queueLength: number;
    isProcessing: boolean;
    config: DataPipelineConfig;
  } {
    return {
      queueLength: this.processingQueue.length,
      isProcessing: this.isProcessing,
      config: { ...this.config }
    };
  }

  updateConfig(newConfig: Partial<DataPipelineConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  clearQueue(): number {
    const cleared = this.processingQueue.length;
    this.processingQueue = [];
    return cleared;
  }
}

// Singleton instance
let dataPipeline: AnalyticsDataPipeline | null = null;

export function getAnalyticsDataPipeline(): AnalyticsDataPipeline {
  if (!dataPipeline) {
    dataPipeline = new AnalyticsDataPipeline({
      batchSize: 50,
      batchInterval: 3000, // 3 seconds
    });
  }
  return dataPipeline;
}
