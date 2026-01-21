import { getUsagePatternAnalyzer, AnomalyDetection } from './pattern-analysis';
import { getPredictiveAnalytics, PeakHourPrediction } from './predictive-analytics';

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'energy_saving' | 'cost_optimization' | 'maintenance' | 'usage_pattern' | 'peak_hour';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  potentialSavings: number; // Estimated monthly savings in ₹
  difficulty: 'easy' | 'moderate' | 'hard';
  estimatedTime: string; // Time to implement
  actionItems: string[];
  deviceId?: string;
  validUntil: number;
  confidence: number; // 0-1
  category: 'behavioral' | 'technical' | 'scheduling' | 'maintenance';
}

export interface UserBehaviorProfile {
  userId: string;
  typicalWakeTime: number; // Hour 0-23
  typicalSleepTime: number; // Hour 0-23
  workDays: number[]; // 0-6 (Sunday = 0)
  peakUsageHours: number[];
  preferredTemperature: number;
  applianceUsagePatterns: Record<string, {
    avgDailyUsage: number;
    typicalUsageHours: number[];
    efficiency: number; // 0-1
  }>;
  savingsMotivation: 'low' | 'medium' | 'high';
  comfortPriority: 'low' | 'medium' | 'high';
}

export class RecommendationEngine {
  private patternAnalyzer = getUsagePatternAnalyzer();
  private predictiveAnalytics = getPredictiveAnalytics();
  private userProfile: UserBehaviorProfile | null = null;

  // Generate personalized recommendations based on current data
  async generateRecommendations(_userId: string, deviceId?: string): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    
    // Get current anomalies
    const anomalies = this.patternAnalyzer.getAnomalies(deviceId);
    
    // Get peak hour predictions
    const peakPredictions = deviceId 
      ? await this.predictiveAnalytics.predictPeakHours(deviceId)
      : [];
    
    // Generate recommendations based on different factors
    recommendations.push(...this.generateAnomalyBasedRecommendations(anomalies));
    recommendations.push(...this.generatePeakHourRecommendations(peakPredictions));
    recommendations.push(...this.generateUsagePatternRecommendations(deviceId));
    recommendations.push(...this.generateCostOptimizationRecommendations(deviceId));
    recommendations.push(...this.generateMaintenanceRecommendations(deviceId));
    recommendations.push(...this.generateEfficiencyRecommendations(deviceId));
    
    // Sort by priority and potential savings
    return recommendations
      .sort((a, b) => {
        const priorityWeight = this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority);
        const savingsWeight = b.potentialSavings - a.potentialSavings;
        return priorityWeight * 100 + savingsWeight;
      })
      .slice(0, 10); // Return top 10 recommendations
  }

  // Generate recommendations based on detected anomalies
  private generateAnomalyBasedRecommendations(anomalies: AnomalyDetection[]): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // Group anomalies by device and type
    const anomalyGroups = new Map<string, AnomalyDetection[]>();
    anomalies.forEach(anomaly => {
      if (!anomalyGroups.has(anomaly.deviceId)) {
        anomalyGroups.set(anomaly.deviceId, []);
      }
      anomalyGroups.get(anomaly.deviceId)!.push(anomaly);
    });
    
    anomalyGroups.forEach((deviceAnomalies, deviceId) => {
      const criticalAnomalies = deviceAnomalies.filter(a => a.severity === 'critical');
      // const highAnomalies = deviceAnomalies.filter(a => a.severity === 'high');
      const spikeAnomalies = deviceAnomalies.filter(a => a.type === 'spike');
      const dropAnomalies = deviceAnomalies.filter(a => a.type === 'drop');
      
      // Critical anomaly recommendations
      if (criticalAnomalies.length > 0) {
        recommendations.push({
          id: `critical_anomaly_${deviceId}_${Date.now()}`,
          title: `Critical Performance Issue Detected`,
          description: `Device ${deviceId} has ${criticalAnomalies.length} critical anomalies requiring immediate attention.`,
          type: 'maintenance',
          priority: 'urgent',
          potentialSavings: 500,
          difficulty: 'hard',
          estimatedTime: '2-4 hours',
          actionItems: [
            'Immediately inspect device for malfunction',
            'Check for loose connections or damaged components',
            'Consider professional service if issue persists',
            'Monitor device closely for next 24 hours'
          ],
          deviceId,
          validUntil: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
          confidence: 0.9,
          category: 'maintenance'
        });
      }
      
      // High consumption spike recommendations
      if (spikeAnomalies.length > 2) {
        recommendations.push({
          id: `spike_pattern_${deviceId}_${Date.now()}`,
          title: `Unusual Consumption Spikes Detected`,
          description: `Device ${deviceId} is showing ${spikeAnomalies.length} consumption spikes, indicating potential inefficiency.`,
          type: 'energy_saving',
          priority: 'high',
          potentialSavings: 200,
          difficulty: 'moderate',
          estimatedTime: '30 minutes',
          actionItems: [
            'Check device settings and operating parameters',
            'Clean or maintain device components',
            'Verify device is not overworking',
            'Consider replacing if device is old'
          ],
          deviceId,
          validUntil: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
          confidence: 0.8,
          category: 'technical'
        });
      }
      
      // Unusual drops (potential malfunction)
      if (dropAnomalies.length > 1) {
        recommendations.push({
          id: `drop_pattern_${deviceId}_${Date.now()}`,
          title: `Device Performance Inconsistency`,
          description: `Device ${deviceId} is showing unusual performance drops that may indicate malfunction.`,
          type: 'maintenance',
          priority: 'medium',
          potentialSavings: 100,
          difficulty: 'easy',
          estimatedTime: '15 minutes',
          actionItems: [
            'Verify device is functioning properly',
            'Check power supply and connections',
            'Review device error logs if available',
            'Schedule maintenance if needed'
          ],
          deviceId,
          validUntil: Date.now() + (3 * 24 * 60 * 60 * 1000), // 3 days
          confidence: 0.7,
          category: 'maintenance'
        });
      }
    });
    
    return recommendations;
  }

  // Generate recommendations based on peak hour predictions
  private generatePeakHourRecommendations(peakPredictions: PeakHourPrediction[]): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    peakPredictions.forEach(prediction => {
      if (prediction.peakHour >= 18 && prediction.peakHour <= 22) {
        // Peak during high tariff period
        recommendations.push({
          id: `peak_tariff_${prediction.date}_${Date.now()}`,
          title: `Avoid Peak Hour Usage on ${prediction.date}`,
          description: `Peak consumption predicted at ${prediction.peakHour}:00 during high tariff period (6 PM - 10 PM).`,
          type: 'cost_optimization',
          priority: 'high',
          potentialSavings: 150,
          difficulty: 'easy',
          estimatedTime: '5 minutes setup',
          actionItems: [
            'Schedule heavy appliance usage before 6 PM',
            'Use delay timers on washing machines and dishwashers',
            'Pre-cool rooms before peak hours',
            'Consider using energy-intensive appliances during off-peak hours'
          ],
          validUntil: new Date(prediction.date).getTime() + (24 * 60 * 60 * 1000),
          confidence: prediction.confidence,
          category: 'scheduling'
        });
      }
      
      // Add prediction-specific recommendations
      prediction.recommendations.forEach(rec => {
        recommendations.push({
          id: `prediction_${prediction.date}_${Date.now()}_${Math.random()}`,
          title: `Peak Hour Optimization`,
          description: rec,
          type: 'peak_hour',
          priority: 'medium',
          potentialSavings: 75,
          difficulty: 'easy',
          estimatedTime: '10 minutes',
          actionItems: [rec],
          validUntil: new Date(prediction.date).getTime() + (24 * 60 * 60 * 1000),
          confidence: prediction.confidence * 0.8,
          category: 'behavioral'
        });
      });
    });
    
    return recommendations;
  }

  // Generate recommendations based on usage patterns
  private generateUsagePatternRecommendations(deviceId?: string): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    if (!deviceId) {
      // General usage pattern recommendations
      recommendations.push({
        id: `general_pattern_${Date.now()}`,
        title: `Optimize Daily Energy Routine`,
        description: `Establish a consistent energy usage pattern to improve efficiency and reduce costs.`,
        type: 'usage_pattern',
        priority: 'medium',
        potentialSavings: 100,
        difficulty: 'easy',
        estimatedTime: '15 minutes daily',
        actionItems: [
          'Set fixed times for heavy appliance usage',
          'Create morning and evening energy routines',
          'Use smart plugs to automate device schedules',
          'Monitor usage patterns weekly'
        ],
        validUntil: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
        confidence: 0.6,
        category: 'behavioral'
      });
    }
    
    return recommendations;
  }

  // Generate cost optimization recommendations
  private generateCostOptimizationRecommendations(deviceId?: string): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    recommendations.push({
      id: `cost_opt_${deviceId || 'all'}_${Date.now()}`,
      title: `Optimize Energy Costs`,
      description: `Reduce your electricity bill by optimizing usage patterns and taking advantage of lower tariff periods.`,
      type: 'cost_optimization',
      priority: 'high',
      potentialSavings: 300,
      difficulty: 'moderate',
      estimatedTime: '1 hour setup',
      actionItems: [
        'Shift 30% of usage to off-peak hours (10 PM - 6 AM)',
        'Use smart scheduling for appliances',
        'Monitor real-time tariff rates',
        'Consider time-of-use tariff plans'
      ],
      deviceId,
      validUntil: Date.now() + (14 * 24 * 60 * 60 * 1000), // 14 days
      confidence: 0.8,
      category: 'scheduling'
    });
    
    return recommendations;
  }

  // Generate maintenance recommendations
  private generateMaintenanceRecommendations(deviceId?: string): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    if (deviceId) {
      const maintenance = this.predictiveAnalytics.predictMaintenance(deviceId);
      
      if (maintenance.maintenanceNeeded) {
        recommendations.push({
          id: `maintenance_${deviceId}_${Date.now()}`,
          title: `Scheduled Maintenance Required`,
          description: maintenance.predictedIssue,
          type: 'maintenance',
          priority: maintenance.urgency === 'high' ? 'urgent' : maintenance.urgency === 'medium' ? 'high' : 'medium',
          potentialSavings: maintenance.urgency === 'high' ? 400 : 200,
          difficulty: 'moderate',
          estimatedTime: '1-2 hours',
          actionItems: [maintenance.recommendedAction],
          deviceId,
          validUntil: maintenance.nextMaintenanceDate.getTime(),
          confidence: maintenance.confidence,
          category: 'maintenance'
        });
      }
    } else {
      // General maintenance recommendation
      recommendations.push({
        id: `general_maintenance_${Date.now()}`,
        title: `Regular Device Maintenance`,
        description: `Schedule regular maintenance to ensure optimal efficiency and prevent breakdowns.`,
        type: 'maintenance',
        priority: 'medium',
        potentialSavings: 150,
        difficulty: 'moderate',
        estimatedTime: '2 hours monthly',
        actionItems: [
          'Clean appliance filters and vents',
          'Check electrical connections',
          'Inspect for wear and tear',
          'Schedule professional servicing annually'
        ],
        validUntil: Date.now() + (30 * 24 * 60 * 60 * 1000),
        confidence: 0.7,
        category: 'maintenance'
      });
    }
    
    return recommendations;
  }

  // Generate efficiency recommendations
  private generateEfficiencyRecommendations(deviceId?: string): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    recommendations.push({
      id: `efficiency_${deviceId || 'all'}_${Date.now()}`,
      title: `Improve Energy Efficiency`,
      description: `Simple changes to improve device efficiency and reduce energy consumption.`,
      type: 'energy_saving',
      priority: 'medium',
      potentialSavings: 250,
      difficulty: 'easy',
      estimatedTime: '30 minutes',
      actionItems: [
        'Set optimal temperature settings (23-25°C for AC)',
        'Use energy-saving modes on appliances',
        'Regular cleaning and maintenance',
        'Upgrade to energy-efficient appliances when replacing'
      ],
      deviceId,
      validUntil: Date.now() + (21 * 24 * 60 * 60 * 1000), // 21 days
      confidence: 0.75,
      category: 'technical'
    });
    
    return recommendations;
  }

  // Helper methods
  private getPriorityWeight(priority: Recommendation['priority']): number {
    switch (priority) {
      case 'urgent': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  // User profile management
  setUserProfile(profile: UserBehaviorProfile): void {
    this.userProfile = profile;
  }

  getUserProfile(): UserBehaviorProfile | null {
    return this.userProfile;
  }

  // Recommendation tracking
  async trackRecommendationAction(recommendationId: string, action: 'accepted' | 'dismissed' | 'completed'): Promise<void> {
    // TODO: Implement recommendation tracking in database
    console.log(`Recommendation ${recommendationId} ${action}`);
  }

  // Get recommendation effectiveness metrics
  getRecommendationMetrics(): {
    totalGenerated: number;
    acceptanceRate: number;
    completionRate: number;
    averageSavings: number;
  } {
    // TODO: Implement actual metrics calculation
    return {
      totalGenerated: 0,
      acceptanceRate: 0.65,
      completionRate: 0.45,
      averageSavings: 185
    };
  }
}

// Singleton instance
let recommendationEngine: RecommendationEngine | null = null;

export function getRecommendationEngine(): RecommendationEngine {
  if (!recommendationEngine) {
    recommendationEngine = new RecommendationEngine();
  }
  return recommendationEngine;
}
