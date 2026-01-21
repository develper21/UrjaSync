export interface UsagePattern {
  deviceId: string;
  timeOfDay: number; // 0-23
  dayOfWeek: number; // 0-6 (Sunday = 0)
  season: 'winter' | 'summer' | 'monsoon' | 'spring' | 'autumn';
  averageConsumption: number;
  peakConsumption: number;
  baselineConsumption: number;
  variance: number;
  confidence: number; // 0-1
}

export interface AnomalyDetection {
  deviceId: string;
  timestamp: number;
  expectedConsumption: number;
  actualConsumption: number;
  deviation: number; // percentage
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'spike' | 'drop' | 'unusual_pattern';
  confidence: number;
}

export interface CorrelationResult {
  device1Id: string;
  device2Id: string;
  correlationCoefficient: number; // -1 to 1
  correlationStrength: 'weak' | 'moderate' | 'strong' | 'very_strong';
  lagTime: number; // minutes
  confidence: number;
}

export class UsagePatternAnalyzer {
  private patterns: Map<string, UsagePattern[]> = new Map();
  private anomalies: AnomalyDetection[] = [];
  private correlations: CorrelationResult[] = [];

  // Analyze usage patterns for a device
  analyzeUsagePatterns(deviceId: string, historicalData: Array<{ timestamp: number; consumption: number }>): UsagePattern[] {
    const patterns: UsagePattern[] = [];
    
    // Group data by time of day and day of week
    const timeGroups = this.groupByTime(historicalData);
    
    for (const [timeKey, readings] of timeGroups.entries()) {
      const [hour, dayOfWeek] = timeKey.split('-').map(Number);
      const season = this.getSeason(readings[0].timestamp);
      
      const consumptions = readings.map(r => r.consumption);
      const avgConsumption = this.average(consumptions);
      const peakConsumption = Math.max(...consumptions);
      const baselineConsumption = this.calculateBaseline(consumptions);
      const variance = this.calculateVariance(consumptions);
      const confidence = this.calculateConfidence(consumptions.length, variance);
      
      patterns.push({
        deviceId,
        timeOfDay: hour,
        dayOfWeek,
        season,
        averageConsumption: avgConsumption,
        peakConsumption,
        baselineConsumption,
        variance,
        confidence
      });
    }
    
    this.patterns.set(deviceId, patterns);
    return patterns;
  }

  // Detect anomalies in real-time data
  detectAnomalies(deviceId: string, currentData: { timestamp: number; consumption: number }): AnomalyDetection | null {
    const patterns = this.patterns.get(deviceId) || [];
    if (patterns.length === 0) {
      return null;
    }
    
    const now = new Date(currentData.timestamp);
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    const season = this.getSeason(currentData.timestamp);
    
    // Find matching pattern
    const matchingPattern = patterns.find(p => 
      p.timeOfDay === hour && 
      p.dayOfWeek === dayOfWeek && 
      p.season === season
    );
    
    if (!matchingPattern || matchingPattern.confidence < 0.7) {
      return null;
    }
    
    const expectedConsumption = matchingPattern.averageConsumption;
    const actualConsumption = currentData.consumption;
    const deviation = Math.abs((actualConsumption - expectedConsumption) / expectedConsumption) * 100;
    
    // Only flag significant deviations (>30%)
    if (deviation < 30) {
      return null;
    }
    
    const severity = this.getSeverity(deviation);
    const type = actualConsumption > expectedConsumption ? 'spike' : 'drop';
    const confidence = Math.min(0.95, matchingPattern.confidence * (1 - matchingPattern.variance / expectedConsumption));
    
    const anomaly: AnomalyDetection = {
      deviceId,
      timestamp: currentData.timestamp,
      expectedConsumption,
      actualConsumption,
      deviation,
      severity,
      type,
      confidence
    };
    
    this.anomalies.push(anomaly);
    return anomaly;
  }

  // Find correlations between devices
  analyzeCorrelations(deviceData: Map<string, Array<{ timestamp: number; consumption: number }>>): CorrelationResult[] {
    const correlations: CorrelationResult[] = [];
    const deviceIds = Array.from(deviceData.keys());
    
    for (let i = 0; i < deviceIds.length; i++) {
      for (let j = i + 1; j < deviceIds.length; j++) {
        const device1Id = deviceIds[i];
        const device2Id = deviceIds[j];
        const data1 = deviceData.get(device1Id) || [];
        const data2 = deviceData.get(device2Id) || [];
        
        const correlation = this.calculateCorrelation(data1, data2);
        
        if (correlation.correlationCoefficient > 0.3) { // Only meaningful correlations
          correlations.push(correlation);
        }
      }
    }
    
    this.correlations = correlations;
    return correlations;
  }

  // Predict future consumption
  predictConsumption(deviceId: string, horizonHours: number): Array<{ timestamp: number; predictedConsumption: number; confidence: number }> {
    const patterns = this.patterns.get(deviceId) || [];
    if (patterns.length === 0) {
      return [];
    }
    
    const predictions: Array<{ timestamp: number; predictedConsumption: number; confidence: number }> = [];
    const now = Date.now();
    
    for (let hour = 0; hour < horizonHours; hour++) {
      const futureTime = now + (hour * 60 * 60 * 1000);
      const futureDate = new Date(futureTime);
      const hourOfDay = futureDate.getHours();
      const dayOfWeek = futureDate.getDay();
      const season = this.getSeason(futureTime);
      
      // Find matching patterns
      const matchingPatterns = patterns.filter(p => 
        p.timeOfDay === hourOfDay && 
        p.dayOfWeek === dayOfWeek && 
        p.season === season
      );
      
      if (matchingPatterns.length > 0) {
        // Use weighted average based on confidence
        const totalWeight = matchingPatterns.reduce((sum, p) => sum + p.confidence, 0);
        const weightedConsumption = matchingPatterns.reduce((sum, p) => sum + (p.averageConsumption * p.confidence), 0) / totalWeight;
        const avgConfidence = totalWeight / matchingPatterns.length;
        
        predictions.push({
          timestamp: futureTime,
          predictedConsumption: weightedConsumption,
          confidence: avgConfidence
        });
      }
    }
    
    return predictions;
  }

  // Helper methods
  private groupByTime(data: Array<{ timestamp: number; consumption: number }>): Map<string, Array<{ timestamp: number; consumption: number }>> {
    const groups = new Map<string, Array<{ timestamp: number; consumption: number }>>();
    
    data.forEach(reading => {
      const date = new Date(reading.timestamp);
      const hour = date.getHours();
      const dayOfWeek = date.getDay();
      const key = `${hour}-${dayOfWeek}`;
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(reading);
    });
    
    return groups;
  }

  private getSeason(timestamp: number): UsagePattern['season'] {
    const date = new Date(timestamp);
    const month = date.getMonth();
    
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  private average(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateBaseline(values: number[]): number {
    // Use 25th percentile as baseline
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * 0.25);
    return sorted[index];
  }

  private calculateVariance(values: number[]): number {
    const mean = this.average(values);
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return this.average(squaredDiffs);
  }

  private calculateConfidence(sampleSize: number, variance: number): number {
    // Higher confidence with more samples and lower variance
    const sampleConfidence = Math.min(1, sampleSize / 30); // 30 samples = full confidence
    const varianceConfidence = Math.max(0.1, 1 - (variance / 10)); // Normalize variance
    return (sampleConfidence + varianceConfidence) / 2;
  }

  private getSeverity(deviation: number): AnomalyDetection['severity'] {
    if (deviation > 100) return 'critical';
    if (deviation > 70) return 'high';
    if (deviation > 50) return 'medium';
    return 'low';
  }

  private calculateCorrelation(data1: Array<{ timestamp: number; consumption: number }>, data2: Array<{ timestamp: number; consumption: number }>): CorrelationResult {
    // Align data by timestamp (simplified - assumes same time intervals)
    const alignedData1: number[] = [];
    const alignedData2: number[] = [];
    
    // Find common timestamps (within 5 minutes)
    const tolerance = 5 * 60 * 1000; // 5 minutes
    
    data1.forEach(point1 => {
      const matchingPoint = data2.find(point2 => 
        Math.abs(point1.timestamp - point2.timestamp) <= tolerance
      );
      if (matchingPoint) {
        alignedData1.push(point1.consumption);
        alignedData2.push(matchingPoint.consumption);
      }
    });
    
    if (alignedData1.length < 10) {
      return {
        device1Id: '',
        device2Id: '',
        correlationCoefficient: 0,
        correlationStrength: 'weak',
        lagTime: 0,
        confidence: 0
      };
    }
    
    // Calculate Pearson correlation coefficient
    const correlation = this.pearsonCorrelation(alignedData1, alignedData2);
    const strength = this.getCorrelationStrength(Math.abs(correlation));
    
    return {
      device1Id: '',
      device2Id: '',
      correlationCoefficient: correlation,
      correlationStrength: strength,
      lagTime: 0, // TODO: Implement lag detection
      confidence: Math.min(0.95, alignedData1.length / 50)
    };
  }

  private pearsonCorrelation(x: number[], y: number[]): number {
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

  private getCorrelationStrength(correlation: number): CorrelationResult['correlationStrength'] {
    if (correlation >= 0.8) return 'very_strong';
    if (correlation >= 0.6) return 'strong';
    if (correlation >= 0.4) return 'moderate';
    return 'weak';
  }

  // Getters for analysis results
  getPatterns(deviceId?: string): Map<string, UsagePattern[]> | UsagePattern[] {
    if (deviceId) {
      return this.patterns.get(deviceId) || [];
    }
    return this.patterns;
  }

  getAnomalies(deviceId?: string, timeRange?: { start: number; end: number }): AnomalyDetection[] {
    let anomalies = this.anomalies;
    
    if (deviceId) {
      anomalies = anomalies.filter(a => a.deviceId === deviceId);
    }
    
    if (timeRange) {
      anomalies = anomalies.filter(a => 
        a.timestamp >= timeRange.start && a.timestamp <= timeRange.end
      );
    }
    
    return anomalies;
  }

  getCorrelations(): CorrelationResult[] {
    return this.correlations;
  }

  clearAnomalies(): void {
    this.anomalies = [];
  }
}

// Singleton instance
let patternAnalyzer: UsagePatternAnalyzer | null = null;

export function getUsagePatternAnalyzer(): UsagePatternAnalyzer {
  if (!patternAnalyzer) {
    patternAnalyzer = new UsagePatternAnalyzer();
  }
  return patternAnalyzer;
}
