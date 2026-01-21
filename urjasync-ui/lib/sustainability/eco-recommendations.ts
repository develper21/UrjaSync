import { EcoRecommendation, RecommendationCategory, RecommendationType, RecommendationPriority, RecommendationDetails, RecommendationImpact, RecommendationImplementation, RecommendationStatus, RecommendationResource } from './types';
import { v4 as uuidv4 } from 'uuid';

export class EcoRecommendations {
  private recommendations: Map<string, EcoRecommendation> = new Map();
  private templates: Map<string, RecommendationTemplate> = new Map();
  private resources: Map<string, RecommendationResource> = new Map();

  constructor() {
    this.initializeTemplates();
    this.initializeResources();
  }

  // Recommendation Management
  async generateRecommendations(_userId: string, userProfile: UserProfile, metricsData: MetricsData): Promise<EcoRecommendation[]> {
    try {
      const recommendations: EcoRecommendation[] = [];

      // Generate recommendations based on user profile and metrics
      const energyRecommendations = await this.generateEnergyRecommendations(userProfile, metricsData);
      const waterRecommendations = await this.generateWaterRecommendations(userProfile, metricsData);
      const wasteRecommendations = await this.generateWasteRecommendations(userProfile, metricsData);
      const transportRecommendations = await this.generateTransportRecommendations(userProfile, metricsData);
      const lifestyleRecommendations = await this.generateLifestyleRecommendations(userProfile, metricsData);

      recommendations.push(...energyRecommendations, ...waterRecommendations, ...wasteRecommendations, ...transportRecommendations, ...lifestyleRecommendations);

      // Store recommendations
      recommendations.forEach(rec => {
        this.recommendations.set(rec.id, rec);
      });

      return recommendations.sort((a, b) => this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority));
    } catch (error) {
      throw new Error(`Failed to generate recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createRecommendation(userId: string, recommendationData: Omit<EcoRecommendation, 'id' | 'createdAt' | 'updatedAt' | 'expiresAt'>): Promise<EcoRecommendation> {
    try {
      const { userId: _userId, ...dataWithoutUserId } = recommendationData;
      const recommendation: EcoRecommendation = {
        id: uuidv4(),
        userId,
        ...dataWithoutUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days expiry
      };

      this.recommendations.set(recommendation.id, recommendation);
      return recommendation;
    } catch (error) {
      throw new Error(`Failed to create recommendation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateRecommendation(recommendationId: string, updates: Partial<EcoRecommendation>): Promise<EcoRecommendation> {
    const recommendation = this.recommendations.get(recommendationId);
    if (!recommendation) {
      throw new Error('Recommendation not found');
    }

    const updatedRecommendation = {
      ...recommendation,
      ...updates,
      updatedAt: new Date()
    };

    this.recommendations.set(recommendationId, updatedRecommendation);
    return updatedRecommendation;
  }

  async implementRecommendation(recommendationId: string, stepNumber: number): Promise<EcoRecommendation> {
    const recommendation = this.recommendations.get(recommendationId);
    if (!recommendation) {
      throw new Error('Recommendation not found');
    }

    if (recommendation.status !== 'pending' && recommendation.status !== 'in_progress') {
      throw new Error('Recommendation cannot be implemented');
    }

    // Update implementation step
    const step = recommendation.implementation.steps.find(s => s.step === stepNumber);
    if (step) {
      step.completed = true;
      step.completedAt = new Date();
    }

    // Update status
    const allStepsCompleted = recommendation.implementation.steps.every(s => s.completed);
    if (allStepsCompleted) {
      recommendation.status = 'completed';
    } else {
      recommendation.status = 'in_progress';
    }

    recommendation.updatedAt = new Date();
    this.recommendations.set(recommendationId, recommendation);
    return recommendation;
  }

  async dismissRecommendation(recommendationId: string, _reason?: string): Promise<EcoRecommendation> {
    const recommendation = this.recommendations.get(recommendationId);
    if (!recommendation) {
      throw new Error('Recommendation not found');
    }

    recommendation.status = 'dismissed';
    recommendation.updatedAt = new Date();

    this.recommendations.set(recommendationId, recommendation);
    return recommendation;
  }

  async markRecommendationExpired(recommendationId: string): Promise<EcoRecommendation> {
    const recommendation = this.recommendations.get(recommendationId);
    if (!recommendation) {
      throw new Error('Recommendation not found');
    }

    recommendation.status = 'expired';
    recommendation.updatedAt = new Date();

    this.recommendations.set(recommendationId, recommendation);
    return recommendation;
  }

  // Recommendation Retrieval
  getRecommendation(recommendationId: string): EcoRecommendation | undefined {
    return this.recommendations.get(recommendationId);
  }

  getUserRecommendations(userId: string, filters?: RecommendationFilters): EcoRecommendation[] {
    const userRecommendations = Array.from(this.recommendations.values())
      .filter(rec => rec.userId === userId);

    return this.applyRecommendationFilters(userRecommendations, filters);
  }

  getRecommendationsByCategory(category: RecommendationCategory): EcoRecommendation[] {
    return Array.from(this.recommendations.values())
      .filter(rec => rec.category === category);
  }

  getRecommendationsByStatus(status: RecommendationStatus): EcoRecommendation[] {
    return Array.from(this.recommendations.values())
      .filter(rec => rec.status === status);
  }

  getRecommendationsByPriority(priority: RecommendationPriority): EcoRecommendation[] {
    return Array.from(this.recommendations.values())
      .filter(rec => rec.priority === priority);
  }

  // Template-based Recommendations
  async createRecommendationFromTemplate(userId: string, templateId: string, customizations?: Partial<EcoRecommendation>): Promise<EcoRecommendation> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error('Recommendation template not found');
    }

    const recommendationData: Omit<EcoRecommendation, 'id' | 'createdAt' | 'updatedAt' | 'expiresAt'> = {
      userId,
      category: template.category,
      type: template.type,
      priority: template.priority,
      title: customizations?.title || template.title,
      description: customizations?.description || template.description,
      details: customizations?.details || template.details,
      impact: customizations?.impact || template.impact,
      implementation: customizations?.implementation || template.implementation,
      status: 'pending'
    };

    return this.createRecommendation(userId, recommendationData);
  }

  getRecommendationTemplates(category?: RecommendationCategory): RecommendationTemplate[] {
    const templates = Array.from(this.templates.values());
    
    if (category) {
      return templates.filter(template => template.category === category);
    }
    
    return templates;
  }

  // Analytics and Insights
  async getRecommendationAnalytics(userId: string, period?: { startDate: Date; endDate: Date }): Promise<RecommendationAnalytics> {
    const recommendations = this.getUserRecommendations(userId, { period });
    
    const totalRecommendations = recommendations.length;
    const pendingRecommendations = recommendations.filter(rec => rec.status === 'pending').length;
    const inProgressRecommendations = recommendations.filter(rec => rec.status === 'in_progress').length;
    const completedRecommendations = recommendations.filter(rec => rec.status === 'completed').length;
    const dismissedRecommendations = recommendations.filter(rec => rec.status === 'dismissed').length;
    const expiredRecommendations = recommendations.filter(rec => rec.status === 'expired').length;

    const recommendationsByCategory = this.getRecommendationsByCategoryBreakdown(recommendations);
    const recommendationsByPriority = this.getRecommendationsByPriorityBreakdown(recommendations);
    const recommendationsByType = this.getRecommendationsByTypeBreakdown(recommendations);

    const averageImpact = totalRecommendations > 0 
      ? recommendations.reduce((sum, rec) => sum + rec.impact.co2Reduction, 0) / totalRecommendations 
      : 0;

    const implementationRate = totalRecommendations > 0 ? (completedRecommendations / totalRecommendations) * 100 : 0;

    return {
      totalRecommendations,
      pendingRecommendations,
      inProgressRecommendations,
      completedRecommendations,
      dismissedRecommendations,
      expiredRecommendations,
      recommendationsByCategory,
      recommendationsByPriority,
      recommendationsByType,
      averageImpact,
      implementationRate,
      topRecommendations: this.getTopRecommendations(recommendations),
      upcomingDeadlines: this.getUpcomingDeadlines(recommendations)
    };
  }

  // Resource Management
  async addResource(resourceData: Omit<RecommendationResource, 'id'>): Promise<RecommendationResource> {
    const resource: RecommendationResource = {
      ...resourceData
    };

    this.resources.set(uuidv4(), resource);
    return resource;
  }

  getResources(category?: string, type?: string): RecommendationResource[] {
    let resources = Array.from(this.resources.values());

    if (category) {
      resources = resources.filter(resource => resource.description.toLowerCase().includes(category.toLowerCase()));
    }

    if (type) {
      resources = resources.filter(resource => resource.type === type);
    }

    return resources;
  }

  // Private Methods
  private async generateEnergyRecommendations(userProfile: UserProfile, metricsData: MetricsData): Promise<EcoRecommendation[]> {
    const recommendations: EcoRecommendation[] = [];

    // High energy consumption
    if (metricsData.energy.totalConsumption > 500) {
      recommendations.push(await this.createRecommendationFromTemplate(userProfile.id, 'reduce_energy_consumption'));
    }

    // Low renewable energy percentage
    if (metricsData.energy.renewablePercentage < 25) {
      recommendations.push(await this.createRecommendationFromTemplate(userProfile.id, 'increase_renewable_energy'));
    }

    // Low efficiency
    if (metricsData.energy.efficiency < 60) {
      recommendations.push(await this.createRecommendationFromTemplate(userProfile.id, 'improve_energy_efficiency'));
    }

    return recommendations;
  }

  private async generateWaterRecommendations(userProfile: UserProfile, metricsData: MetricsData): Promise<EcoRecommendation[]> {
    const recommendations: EcoRecommendation[] = [];

    // High water consumption
    if (metricsData.water.totalConsumption > 10000) {
      recommendations.push(await this.createRecommendationFromTemplate(userProfile.id, 'reduce_water_consumption'));
    }

    // Low conservation rate
    if (metricsData.water.conservationRate < 20) {
      recommendations.push(await this.createRecommendationFromTemplate(userProfile.id, 'improve_water_conservation'));
    }

    return recommendations;
  }

  private async generateWasteRecommendations(userProfile: UserProfile, metricsData: MetricsData): Promise<EcoRecommendation[]> {
    const recommendations: EcoRecommendation[] = [];

    // Low recycling rate
    if (metricsData.waste.recyclingRate < 50) {
      recommendations.push(await this.createRecommendationFromTemplate(userProfile.id, 'improve_recycling_rate'));
    }

    // High waste generation
    if (metricsData.waste.totalWaste > 50) {
      recommendations.push(await this.createRecommendationFromTemplate(userProfile.id, 'reduce_waste_generation'));
    }

    return recommendations;
  }

  private async generateTransportRecommendations(userProfile: UserProfile, metricsData: MetricsData): Promise<EcoRecommendation[]> {
    const recommendations: EcoRecommendation[] = [];

    // High transport emissions
    if (metricsData.transportation.emissions > 100) {
      recommendations.push(await this.createRecommendationFromTemplate(userProfile.id, 'reduce_transport_emissions'));
    }

    // Low sustainable transport
    if (metricsData.transportation.publicTransportPercentage + metricsData.transportation.activeTransportPercentage < 30) {
      recommendations.push(await this.createRecommendationFromTemplate(userProfile.id, 'increase_sustainable_transport'));
    }

    return recommendations;
  }

  private async generateLifestyleRecommendations(userProfile: UserProfile, _metricsData: MetricsData): Promise<EcoRecommendation[]> {
    const recommendations: EcoRecommendation[] = [];

    // General lifestyle recommendations based on user profile
    if (userProfile.interests?.includes('technology')) {
      recommendations.push(await this.createRecommendationFromTemplate(userProfile.id, 'green_technology_tips'));
    }

    if (userProfile.interests?.includes('food')) {
      recommendations.push(await this.createRecommendationFromTemplate(userProfile.id, 'sustainable_eating'));
    }

    if (userProfile.interests?.includes('shopping')) {
      recommendations.push(await this.createRecommendationFromTemplate(userProfile.id, 'eco_friendly_shopping'));
    }

    return recommendations;
  }

  // Utility Methods
  private getPriorityScore(priority: RecommendationPriority): number {
    switch (priority) {
      case 'urgent': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  private getRecommendationsByCategoryBreakdown(recommendations: EcoRecommendation[]): Record<RecommendationCategory, number> {
    return recommendations.reduce((acc, rec) => {
      acc[rec.category] = (acc[rec.category] || 0) + 1;
      return acc;
    }, {} as Record<RecommendationCategory, number>);
  }

  private getRecommendationsByPriorityBreakdown(recommendations: EcoRecommendation[]): Record<RecommendationPriority, number> {
    return recommendations.reduce((acc, rec) => {
      acc[rec.priority] = (acc[rec.priority] || 0) + 1;
      return acc;
    }, {} as Record<RecommendationPriority, number>);
  }

  private getRecommendationsByTypeBreakdown(recommendations: EcoRecommendation[]): Record<RecommendationType, number> {
    return recommendations.reduce((acc, rec) => {
      acc[rec.type] = (acc[rec.type] || 0) + 1;
      return acc;
    }, {} as Record<RecommendationType, number>);
  }

  private getTopRecommendations(recommendations: EcoRecommendation[]): EcoRecommendation[] {
    return recommendations
      .sort((a, b) => (b.impact.co2Reduction - a.impact.co2Reduction))
      .slice(0, 10);
  }

  private getUpcomingDeadlines(recommendations: EcoRecommendation[]): { recommendationId: string; title: string; deadline: Date; daysUntil: number }[] {
    const now = new Date();
    
    return recommendations
      .filter(rec => rec.status === 'pending' || rec.status === 'in_progress')
      .map(rec => ({
        recommendationId: rec.id,
        title: rec.title,
        deadline: rec.expiresAt || new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
        daysUntil: Math.ceil(((rec.expiresAt || new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      }))
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5);
  }

  // Filter Methods
  private applyRecommendationFilters(recommendations: EcoRecommendation[], filters?: RecommendationFilters): EcoRecommendation[] {
    if (!filters) return recommendations;

    return recommendations.filter(rec => {
      if (filters.category && rec.category !== filters.category) return false;
      if (filters.status && rec.status !== filters.status) return false;
      if (filters.type && rec.type !== filters.type) return false;
      if (filters.priority && rec.priority !== filters.priority) return false;
      if (filters.period) {
        if (rec.createdAt < filters.period.startDate || rec.createdAt > filters.period.endDate) {
          return false;
        }
      }
      return true;
    });
  }

  // Initialization Methods
  private initializeTemplates(): void {
    // Energy Efficiency Templates
    this.templates.set('reduce_energy_consumption', {
      id: 'reduce_energy_consumption',
      category: 'energy_efficiency',
      type: 'actionable',
      priority: 'high',
      title: 'Reduce Energy Consumption by 20%',
      description: 'Implement energy-saving measures to reduce your electricity consumption by 20%',
      details: {
        problem: 'High energy consumption contributes to increased carbon emissions and higher electricity bills',
        solution: 'Implement energy efficiency measures such as LED lighting, smart thermostats, and energy-efficient appliances',
        benefits: ['Lower electricity bills', 'Reduced carbon footprint', 'Increased comfort', 'Extended appliance lifespan'],
        requirements: ['Energy audit', 'Budget for upgrades', 'Time for implementation'],
        alternatives: ['Focus on low-cost measures first', 'Consider DIY solutions', 'Look for government rebates'],
        resources: []
      },
      impact: {
        co2Reduction: 120, // kg CO2/year
        energySavings: 600, // kWh/year
        costSavings: 3500, // INR/year
        difficulty: 'medium',
        timeframe: 'short_term'
      },
      implementation: {
        steps: [
          {
            step: 1,
            title: 'Conduct Energy Audit',
            description: 'Assess current energy usage patterns',
            duration: '1 week',
            requirements: ['Energy bills', 'Usage data'],
            completed: false
          },
          {
            step: 2,
            title: 'Install LED Lighting',
            description: 'Replace incandescent bulbs with LED alternatives',
            duration: '1-2 weeks',
            requirements: ['LED bulbs', 'Basic tools'],
            completed: false
          },
          {
            step: 3,
            title: 'Install Smart Thermostat',
            description: 'Install programmable thermostat for optimal temperature control',
            duration: '1 day',
            requirements: ['Smart thermostat', 'WiFi connection'],
            completed: false
          }
        ],
        timeline: '1-2 months',
        cost: {
          estimate: 5000,
          currency: 'INR',
          breakdown: [
            { category: 'LED Bulbs', amount: 2000, description: '10 LED bulbs', optional: false },
            { category: 'Smart Thermostat', amount: 3000, description: 'Programmable thermostat', optional: false }
          ]
        },
        support: [
          { type: 'diy', name: 'Online Guides', description: 'Step-by-step installation guides', url: 'https://example.com/guides' },
          { type: 'professional', name: 'Energy Auditor', description: 'Professional energy audit services', contact: 'energy@example.com' },
          { type: 'government', name: 'Rebate Programs', description: 'Government energy efficiency rebates', url: 'https://rebates.example.com' }
        ]
      }
    });

    // Renewable Energy Templates
    this.templates.set('increase_renewable_energy', {
      id: 'increase_renewable_energy',
      category: 'renewable_energy',
      type: 'actionable',
      priority: 'high',
      title: 'Switch to 50% Renewable Energy',
      description: 'Increase your renewable energy usage to 50% through green tariffs or solar installation',
      details: {
        problem: 'Low renewable energy usage contributes to higher carbon emissions',
        solution: 'Switch to green energy tariff or install solar panels',
        benefits: ['Reduced carbon footprint', 'Supports renewable energy', 'Potential cost savings', 'Energy independence'],
        requirements: ['Research options', 'Budget assessment', 'Provider contact'],
        alternatives: ['Start with green tariff', 'Consider community solar', 'Look for PPA options'],
        resources: []
      },
      impact: {
        co2Reduction: 200, // kg CO2/year
        energySavings: 0,
        costSavings: 1200, // INR/year (potential)
        difficulty: 'medium',
        timeframe: 'short_term'
      },
      implementation: {
        steps: [
          {
            step: 1,
            title: 'Research Green Tariffs',
            description: 'Compare available green energy tariffs in your area',
            duration: '1 week',
            requirements: ['Internet access', 'Current electricity bill'],
            completed: false
          },
          {
            step: 2,
            title: 'Contact Providers',
            description: 'Reach out to green energy providers for quotes',
            duration: '1 week',
            requirements: ['Contact information', 'Usage requirements'],
            completed: false
          },
          {
            step: 3,
            title: 'Switch Provider',
            description: 'Switch to selected green energy tariff',
            duration: '1 day',
            requirements: ['Provider approval', 'Account details'],
            completed: false
          }
        ],
        timeline: '2-3 weeks',
        cost: {
          estimate: 0,
          currency: 'INR',
          breakdown: [
            { category: 'Premium', amount: 600, description: 'Monthly green tariff premium', optional: false }
          ]
        },
        support: [
          { type: 'professional', name: 'Energy Consultant', description: 'Green energy consulting services', contact: 'green@example.com' },
          { type: 'government', name: 'Green Energy Programs', description: 'Government renewable energy programs', url: 'https://green.example.gov' }
        ]
      }
    });

    // Water Conservation Templates
    this.templates.set('improve_water_conservation', {
      id: 'improve_water_conservation',
      category: 'water_conservation',
      type: 'actionable',
      priority: 'medium',
      title: 'Improve Water Conservation by 30%',
      description: 'Implement water-saving measures to reduce water consumption by 30%',
      details: {
        problem: 'High water consumption strains water resources and increases utility costs',
        solution: 'Install water-saving fixtures and adopt water conservation habits',
        benefits: ['Lower water bills', 'Conserved water resources', 'Environmental protection', 'Reduced energy usage'],
        requirements: ['Water audit', 'Fixture budget', 'Time for installation'],
        alternatives: ['Start with behavioral changes', 'Focus on low-cost fixes', 'Look for rebates'],
        resources: []
      },
      impact: {
        co2Reduction: 50, // kg CO2/year (indirect)
        energySavings: 100, // kWh/year (indirect)
        costSavings: 800, // INR/year
        difficulty: 'easy',
        timeframe: 'immediate'
      },
      implementation: {
        steps: [
          {
            step: 1,
            title: 'Install Low-Flow Fixtures',
            description: 'Replace showerheads and faucets with low-flow alternatives',
            duration: '1 weekend',
            requirements: ['Low-flow fixtures', 'Basic tools'],
            completed: false
          },
          {
            step: 2,
            title: 'Fix Leaks',
            description: 'Identify and fix any water leaks in your home',
            duration: '2-3 days',
            requirements: ['Leak detection tools', 'Basic plumbing knowledge'],
            completed: false
          },
          {
            step: 3,
            title: 'Install Water-Saving Habits',
            description: 'Adopt water-saving practices in daily routines',
            duration: 'Ongoing',
            requirements: ['Behavioral commitment'],
            completed: false
          }
        ],
        timeline: '1-2 weeks',
        cost: {
          estimate: 2000,
          currency: 'INR',
          breakdown: [
            { category: 'Low-Flow Fixtures', amount: 1500, description: 'Showerhead and faucet sets', optional: false },
            { category: 'Leak Repairs', amount: 500, description: 'Plumbing repairs', optional: false }
          ]
        },
        support: [
          { type: 'diy', name: 'Water Conservation Guide', description: 'Comprehensive water saving guide', url: 'https://water.example.com/guide' },
          { type: 'professional', name: 'Plumber', description: 'Professional plumbing services', contact: 'plumber@example.com' }
        ]
      }
    });

    // Waste Reduction Templates
    this.templates.set('improve_recycling_rate', {
      id: 'improve_recycling_rate',
      category: 'waste_reduction',
      type: 'actionable',
      priority: 'medium',
      title: 'Achieve 75% Recycling Rate',
      description: 'Implement comprehensive recycling program to achieve 75% waste recycling rate',
      details: {
        problem: 'Low recycling rate contributes to landfill waste and resource depletion',
        solution: 'Set up comprehensive recycling system with proper sorting and disposal',
        benefits: ['Reduced landfill waste', 'Resource conservation', 'Environmental protection', 'Potential cost savings'],
        requirements: ['Recycling bins', 'Sorting knowledge', 'Local recycling information'],
        alternatives: ['Start with basic recycling', 'Focus on common materials', 'Use drop-off centers'],
        resources: []
      },
      impact: {
        co2Reduction: 80, // kg CO2/year
        energySavings: 200, // kWh/year (indirect)
        costSavings: 500, // INR/year
        difficulty: 'easy',
        timeframe: 'immediate'
      },
      implementation: {
        steps: [
          {
            step: 1,
            title: 'Set Up Recycling Bins',
            description: 'Install separate bins for different waste types',
            duration: '1 day',
            requirements: ['Recycling bins', 'Labels'],
            completed: false
          },
          {
            step: 2,
            title: 'Learn Sorting Rules',
            description: 'Understand local recycling requirements and sorting rules',
            duration: '1 week',
            requirements: ['Local recycling guidelines'],
            completed: false
          },
          {
            step: 3,
            title: 'Establish Routine',
            description: 'Create daily recycling habits and routines',
            duration: '2 weeks',
            requirements: ['Commitment', 'Schedule'],
            completed: false
          }
        ],
        timeline: '2-3 weeks',
        cost: {
          estimate: 1000,
          currency: 'INR',
          breakdown: [
            { category: 'Recycling Bins', amount: 1000, description: 'Set of recycling bins', optional: false }
          ]
        },
        support: [
          { type: 'community', name: 'Local Recycling Center', description: 'Local recycling information and drop-off locations', url: 'https://recycle.example.com' },
          { type: 'government', name: 'Waste Management', description: 'Local waste management programs', url: 'https://waste.example.gov' }
        ]
      }
    });

    // Transportation Templates
    this.templates.set('increase_sustainable_transport', {
      id: 'increase_sustainable_transport',
      category: 'sustainable_transport',
      type: 'actionable',
      priority: 'medium',
      title: 'Use Sustainable Transport 50% of Time',
      description: 'Increase sustainable transport usage to 50% of your trips',
      details: {
        problem: 'High reliance on personal vehicles contributes to air pollution and carbon emissions',
        solution: 'Use public transport, cycling, walking, or electric vehicles for half of your trips',
        benefits: ['Reduced carbon emissions', 'Improved air quality', 'Cost savings', 'Health benefits'],
        requirements: ['Transport planning', 'Schedule flexibility', 'Alternative transport options'],
        alternatives: ['Start with 1-2 days per week', 'Focus on commute', 'Combine different modes'],
        resources: []
      },
      impact: {
        co2Reduction: 150, // kg CO2/year
        energySavings: 0,
        costSavings: 2000, // INR/year
        difficulty: 'medium',
        timeframe: 'immediate'
      },
      implementation: {
        steps: [
          {
            step: 1,
            title: 'Research Options',
            description: 'Identify available public transport and cycling routes',
            duration: '1 week',
            requirements: ['Local transport maps', 'Schedule information'],
            completed: false
          },
          {
            step: 2,
            title: 'Plan Routes',
            description: 'Plan sustainable transport routes for regular trips',
            duration: '3-4 days',
            requirements: ['Destination mapping', 'Time planning'],
            completed: false
          },
          {
            step: 3,
            title: 'Implement Schedule',
            description: 'Start using sustainable transport according to plan',
            duration: '2 weeks',
            requirements: ['Schedule adherence', 'Flexibility'],
            completed: false
          }
        ],
        timeline: '3-4 weeks',
        cost: {
          estimate: 0,
          currency: 'INR',
          breakdown: [
            { category: 'Public Transport', amount: -2000, description: 'Cost savings from reduced fuel', optional: false }
          ]
        },
        support: [
          { type: 'community', name: 'Transport Forum', description: 'Sustainable transport community support', url: 'https://transport.example.com' },
          { type: 'diy', name: 'Transit Apps', description: 'Public transport and cycling apps', url: 'https://apps.example.com/transport' }
        ]
      }
    });
  }

  private initializeResources(): void {
    // Energy Resources
    this.resources.set('energy_audit_guide', {
      type: 'guide',
      title: 'Home Energy Audit Guide',
      url: 'https://energy.example.com/audit-guide',
      description: 'Comprehensive guide to conducting home energy audits',
      cost: 'Free'
    });

    this.resources.set('led_comparison', {
      type: 'calculator',
      title: 'LED Bulb Calculator',
      url: 'https://energy.example.com/led-calculator',
      description: 'Calculate savings from switching to LED lighting',
      cost: 'Free'
    });

    // Water Resources
    this.resources.set('water_saving_tips', {
      type: 'guide',
      title: 'Water Saving Tips',
      url: 'https://water.example.com/tips',
      description: '100+ water saving tips for home',
      cost: 'Free'
    });

    // Waste Resources
    this.resources.set('recycling_guide', {
      type: 'guide',
      title: 'Comprehensive Recycling Guide',
      url: 'https://recycle.example.com/guide',
      description: 'Complete guide to recycling at home',
      cost: 'Free'
    });

    // Transport Resources
    this.resources.set('transit_planner', {
      type: 'tool',
      title: 'Transit Route Planner',
      url: 'https://transit.example.com/planner',
      description: 'Plan public transport routes',
      cost: 'Free'
    });

    // General Resources
    this.resources.set('green_home_guide', {
      type: 'guide',
      title: 'Green Home Guide',
      url: 'https://green.example.com/home',
      description: 'Comprehensive guide to green living',
      cost: 'Free'
    });
  }
}

// Supporting Types
interface UserProfile {
  id: string;
  interests: string[];
  location: string;
  householdSize: number;
  homeType: 'apartment' | 'house' | 'townhouse';
  budget: 'low' | 'medium' | 'high';
  timeAvailability: 'limited' | 'moderate' | 'flexible';
}

interface MetricsData {
  energy: {
    totalConsumption: number;
    efficiency: number;
    renewablePercentage: number;
    peakUsage: number;
    offPeakUsage: number;
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

interface RecommendationTemplate {
  id: string;
  category: RecommendationCategory;
  type: RecommendationType;
  priority: RecommendationPriority;
  title: string;
  description: string;
  details: RecommendationDetails;
  impact: RecommendationImpact;
  implementation: RecommendationImplementation;
}

interface RecommendationFilters {
  category?: RecommendationCategory;
  status?: RecommendationStatus;
  type?: RecommendationType;
  priority?: RecommendationPriority;
  period?: { startDate: Date; endDate: Date };
}

interface RecommendationAnalytics {
  totalRecommendations: number;
  pendingRecommendations: number;
  inProgressRecommendations: number;
  completedRecommendations: number;
  dismissedRecommendations: number;
  expiredRecommendations: number;
  recommendationsByCategory: Record<RecommendationCategory, number>;
  recommendationsByPriority: Record<RecommendationPriority, number>;
  recommendationsByType: Record<RecommendationType, number>;
  averageImpact: number;
  implementationRate: number;
  topRecommendations: EcoRecommendation[];
  upcomingDeadlines: { recommendationId: string; title: string; deadline: Date; daysUntil: number }[];
}

// Singleton instance
let ecoRecommendationsInstance: EcoRecommendations | null = null;

export function getEcoRecommendations(): EcoRecommendations {
  if (!ecoRecommendationsInstance) {
    ecoRecommendationsInstance = new EcoRecommendations();
  }
  return ecoRecommendationsInstance;
}
