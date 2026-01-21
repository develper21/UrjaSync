import { SustainabilityGoal, GoalCategory, GoalType, GoalTarget, GoalProgress, GoalTimeline, GoalStatus, GoalMilestone, GoalReward } from './types';
import { v4 as uuidv4 } from 'uuid';

export class SustainabilityGoals {
  private goals: Map<string, SustainabilityGoal> = new Map();
  private goalTemplates: Map<string, GoalTemplate> = new Map();
  private achievements: Map<string, GoalAchievement> = new Map();

  constructor() {
    this.initializeGoalTemplates();
  }

  // Goal Management
  async createGoal(_userId: string, goalData: Omit<SustainabilityGoal, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<SustainabilityGoal> {
    try {
      const goal: SustainabilityGoal = {
        id: uuidv4(),
        ...goalData,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Initialize progress
      goal.current = {
        currentValue: goal.target.baselineValue || 0,
        percentageComplete: 0,
        lastUpdated: new Date(),
        trend: 'stable',
        onTrack: true
      };

      // Set up timeline checkpoints
      if (goal.timeline.checkpoints.length === 0) {
        goal.timeline.checkpoints = this.generateCheckpoints(goal.timeline.startDate, goal.timeline.endDate);
      }

      this.goals.set(goal.id, goal);
      return goal;
    } catch (error) {
      throw new Error(`Failed to create sustainability goal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateGoal(goalId: string, updates: Partial<SustainabilityGoal>): Promise<SustainabilityGoal> {
    const goal = this.goals.get(goalId);
    if (!goal) {
      throw new Error('Goal not found');
    }

    const updatedGoal = {
      ...goal,
      ...updates,
      updatedAt: new Date()
    };

    // Recalculate progress if target or current value changed
    if (updates.target || updates.current) {
      updatedGoal.current = this.calculateProgress(updatedGoal);
      updatedGoal.status = this.determineGoalStatus(updatedGoal);
    }

    // Check for milestone achievements
    if (updates.current) {
      await this.checkMilestones(updatedGoal);
    }

    this.goals.set(goalId, updatedGoal);
    return updatedGoal;
  }

  async updateGoalProgress(goalId: string, currentValue: number): Promise<SustainabilityGoal> {
    const goal = this.goals.get(goalId);
    if (!goal) {
      throw new Error('Goal not found');
    }

    goal.current.currentValue = currentValue;
    goal.current = this.calculateProgress(goal);
    goal.current.lastUpdated = new Date();
    goal.updatedAt = new Date();
    goal.status = this.determineGoalStatus(goal);

    // Check for milestone achievements
    await this.checkMilestones(goal);

    // Check for goal completion
    if (goal.current.percentageComplete >= 100 && goal.status !== 'completed') {
      goal.status = 'completed';
      await this.unlockRewards(goal);
      await this.createAchievement(goal);
    }

    this.goals.set(goalId, goal);
    return goal;
  }

  async pauseGoal(goalId: string, _reason?: string): Promise<SustainabilityGoal> {
    const goal = this.goals.get(goalId);
    if (!goal) {
      throw new Error('Goal not found');
    }

    if (goal.status !== 'active') {
      throw new Error('Only active goals can be paused');
    }

    goal.status = 'paused';
    goal.updatedAt = new Date();

    this.goals.set(goalId, goal);
    return goal;
  }

  async resumeGoal(goalId: string): Promise<SustainabilityGoal> {
    const goal = this.goals.get(goalId);
    if (!goal) {
      throw new Error('Goal not found');
    }

    if (goal.status !== 'paused') {
      throw new Error('Only paused goals can be resumed');
    }

    goal.status = 'active';
    goal.updatedAt = new Date();

    this.goals.set(goalId, goal);
    return goal;
  }

  async completeGoal(goalId: string): Promise<SustainabilityGoal> {
    const goal = this.goals.get(goalId);
    if (!goal) {
      throw new Error('Goal not found');
    }

    goal.status = 'completed';
    goal.current.percentageComplete = 100;
    goal.updatedAt = new Date();

    await this.unlockRewards(goal);
    await this.createAchievement(goal);

    this.goals.set(goalId, goal);
    return goal;
  }

  async cancelGoal(goalId: string, _reason?: string): Promise<SustainabilityGoal> {
    const goal = this.goals.get(goalId);
    if (!goal) {
      throw new Error('Goal not found');
    }

    goal.status = 'cancelled';
    goal.updatedAt = new Date();

    this.goals.set(goalId, goal);
    return goal;
  }

  // Goal Retrieval
  getGoal(goalId: string): SustainabilityGoal | undefined {
    return this.goals.get(goalId);
  }

  getUserGoals(userId: string, filters?: GoalFilters): SustainabilityGoal[] {
    const userGoals = Array.from(this.goals.values())
      .filter(goal => goal.userId === userId);

    return this.applyGoalFilters(userGoals, filters);
  }

  getGoalsByCategory(category: GoalCategory): SustainabilityGoal[] {
    return Array.from(this.goals.values())
      .filter(goal => goal.category === category);
  }

  getGoalsByStatus(status: GoalStatus): SustainabilityGoal[] {
    return Array.from(this.goals.values())
      .filter(goal => goal.status === status);
  }

  // Goal Templates
  async createGoalFromTemplate(userId: string, templateId: string, customizations?: Partial<SustainabilityGoal>): Promise<SustainabilityGoal> {
    const template = this.goalTemplates.get(templateId);
    if (!template) {
      throw new Error('Goal template not found');
    }

    const goalData: Omit<SustainabilityGoal, 'id' | 'status' | 'createdAt' | 'updatedAt'> = {
      userId,
      name: customizations?.name || template.name,
      description: customizations?.description || template.description,
      category: template.category,
      type: template.type,
      target: customizations?.target || template.target,
      current: {
        currentValue: 0,
        percentageComplete: 0,
        lastUpdated: new Date(),
        trend: 'stable',
        onTrack: true
      },
      timeline: customizations?.timeline || template.timeline,
      milestones: template.milestones,
      rewards: template.rewards
    };

    return this.createGoal(userId, goalData);
  }

  getGoalTemplates(category?: GoalCategory): GoalTemplate[] {
    const templates = Array.from(this.goalTemplates.values());
    
    if (category) {
      return templates.filter(template => template.category === category);
    }
    
    return templates;
  }

  // Analytics and Insights
  async getGoalAnalytics(userId: string, period?: { startDate: Date; endDate: Date }): Promise<GoalAnalytics> {
    const goals = this.getUserGoals(userId, { period });
    
    const totalGoals = goals.length;
    const activeGoals = goals.filter(goal => goal.status === 'active').length;
    const completedGoals = goals.filter(goal => goal.status === 'completed').length;
    const pausedGoals = goals.filter(goal => goal.status === 'paused').length;
    const cancelledGoals = goals.filter(goal => goal.status === 'cancelled').length;

    const averageProgress = goals.length > 0 
      ? goals.reduce((sum, goal) => sum + goal.current.percentageComplete, 0) / goals.length 
      : 0;

    const goalsByCategory = this.getGoalsByCategoryBreakdown(goals);
    const goalsByStatus = this.getGoalsByStatusBreakdown(goals);
    const upcomingDeadlines = this.getUpcomingDeadlines(goals);
    const achievements = await this.getUserAchievements(userId);

    return {
      totalGoals,
      activeGoals,
      completedGoals,
      pausedGoals,
      cancelledGoals,
      averageProgress,
      completionRate: totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0,
      goalsByCategory,
      goalsByStatus,
      upcomingDeadlines,
      achievements,
      recommendations: await this.generateGoalRecommendations(goals)
    };
  }

  // Milestones and Rewards
  async addMilestone(goalId: string, milestone: Omit<GoalMilestone, 'id' | 'achieved'>): Promise<GoalMilestone> {
    const goal = this.goals.get(goalId);
    if (!goal) {
      throw new Error('Goal not found');
    }

    const newMilestone: GoalMilestone = {
      id: uuidv4(),
      ...milestone,
      achieved: false
    };

    goal.milestones.push(newMilestone);
    goal.updatedAt = new Date();

    this.goals.set(goalId, goal);
    return newMilestone;
  }

  async unlockReward(goalId: string, rewardId: string): Promise<GoalReward> {
    const goal = this.goals.get(goalId);
    if (!goal) {
      throw new Error('Goal not found');
    }

    const reward = goal.rewards.find(r => r.id === rewardId);
    if (!reward) {
      throw new Error('Reward not found');
    }

    reward.unlocked = true;
    reward.unlockedAt = new Date();
    goal.updatedAt = new Date();

    this.goals.set(goalId, goal);
    return reward;
  }

  // Utility Methods
  private calculateProgress(goal: SustainabilityGoal): GoalProgress {
    const currentValue = goal.current.currentValue;
    const targetValue = goal.target.value;
    const baselineValue = goal.target.baselineValue || 0;

    let percentageComplete = 0;
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    let onTrack = true;

    if (goal.type === 'reduction') {
      const reduction = baselineValue - currentValue;
      const targetReduction = baselineValue - targetValue;
      percentageComplete = targetReduction > 0 ? (reduction / targetReduction) * 100 : 0;
    } else {
      percentageComplete = targetValue > 0 ? (currentValue / targetValue) * 100 : 0;
    }

    // Determine trend (simplified - in production would use historical data)
    if (percentageComplete > 50) {
      trend = 'improving';
    } else if (percentageComplete < 25) {
      trend = 'declining';
    }

    // Determine if on track
    const timeElapsed = this.getTimeElapsed(goal.timeline.startDate, goal.timeline.endDate);
    const expectedProgress = timeElapsed * 100;
    onTrack = percentageComplete >= expectedProgress - 10; // 10% tolerance

    return {
      currentValue,
      percentageComplete: Math.min(100, Math.max(0, percentageComplete)),
      lastUpdated: new Date(),
      trend,
      onTrack
    };
  }

  private determineGoalStatus(goal: SustainabilityGoal): GoalStatus {
    if (goal.current.percentageComplete >= 100) {
      return 'completed';
    }

    if (goal.timeline.endDate < new Date()) {
      return 'failed';
    }

    if (goal.status === 'paused') {
      return 'paused';
    }

    return 'active';
  }

  private generateCheckpoints(startDate: Date, endDate: Date): Date[] {
    const checkpoints: Date[] = [];
    const duration = endDate.getTime() - startDate.getTime();
    const checkpointInterval = duration / 4; // 4 checkpoints

    for (let i = 1; i <= 4; i++) {
      checkpoints.push(new Date(startDate.getTime() + (checkpointInterval * i)));
    }

    return checkpoints;
  }

  private getTimeElapsed(startDate: Date, endDate: Date): number {
    const now = new Date();
    const total = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    
    return Math.max(0, Math.min(1, elapsed / total));
  }

  private async checkMilestones(goal: SustainabilityGoal): Promise<void> {
    for (const milestone of goal.milestones) {
      if (!milestone.achieved && goal.current.currentValue >= milestone.targetValue) {
        milestone.achieved = true;
        milestone.achievedAt = new Date();
        
        // Unlock milestone reward if exists
        if (milestone.reward) {
          await this.unlockReward(goal.id, milestone.reward);
        }
      }
    }
  }

  private async unlockRewards(goal: SustainabilityGoal): Promise<void> {
    for (const reward of goal.rewards) {
      if (!reward.unlocked && goal.current.percentageComplete >= 100) {
        reward.unlocked = true;
        reward.unlockedAt = new Date();
      }
    }
  }

  private async createAchievement(goal: SustainabilityGoal): Promise<void> {
    const achievement: GoalAchievement = {
      id: uuidv4(),
      goalId: goal.id,
      type: 'goal_completion',
      title: `Completed: ${goal.name}`,
      description: goal.description,
      value: goal.target.value,
      unit: goal.target.unit,
      achievedAt: new Date(),
      points: this.calculateAchievementPoints(goal)
    };

    this.achievements.set(achievement.id, achievement);
  }

  private calculateAchievementPoints(goal: SustainabilityGoal): number {
    let points = 100; // Base points

    // Add points for difficulty
    switch (goal.target.difficulty) {
      case 'easy':
        points += 50;
        break;
      case 'medium':
        points += 100;
        break;
      case 'hard':
        points += 200;
        break;
    }

    // Add points for early completion
    if (goal.timeline.endDate > new Date()) {
      const daysEarly = Math.ceil((goal.timeline.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      points += Math.min(daysEarly * 2, 100); // 2 points per day early, max 100
    }

    return points;
  }

  private getGoalsByCategoryBreakdown(goals: SustainabilityGoal[]): Record<GoalCategory, number> {
    return goals.reduce((acc, goal) => {
      acc[goal.category] = (acc[goal.category] || 0) + 1;
      return acc;
    }, {} as Record<GoalCategory, number>);
  }

  private getGoalsByStatusBreakdown(goals: SustainabilityGoal[]): Record<GoalStatus, number> {
    return goals.reduce((acc, goal) => {
      acc[goal.status] = (acc[goal.status] || 0) + 1;
      return acc;
    }, {} as Record<GoalStatus, number>);
  }

  private getUpcomingDeadlines(goals: SustainabilityGoal[]): { goalId: string; goalName: string; deadline: Date; daysUntil: number }[] {
    const now = new Date();
    
    return goals
      .filter(goal => goal.status === 'active' && goal.timeline.endDate > now)
      .map(goal => ({
        goalId: goal.id,
        goalName: goal.name,
        deadline: goal.timeline.endDate,
        daysUntil: Math.ceil((goal.timeline.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      }))
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5);
  }

  async getUserAchievements(userId: string): Promise<GoalAchievement[]> {
    // Mock implementation - in production would fetch from database
    return Array.from(this.achievements.values())
      .filter(achievement => this.isAchievementOwnedByUser(achievement, userId))
      .sort((a, b) => b.achievedAt.getTime() - a.achievedAt.getTime());
  }

  private isAchievementOwnedByUser(_achievement: GoalAchievement, _userId: string): boolean {
    // Mock implementation - in production would check actual ownership
    return true;
  }

  private async generateGoalRecommendations(goals: SustainabilityGoal[]): Promise<string[]> {
    const recommendations: string[] = [];

    const activeGoals = goals.filter(goal => goal.status === 'active');
    const behindGoals = activeGoals.filter(goal => !goal.current.onTrack);

    if (behindGoals.length > 0) {
      recommendations.push(`${behindGoals.length} goal(s) are behind schedule - consider adjusting targets or increasing effort`);
    }

    if (activeGoals.length < 3) {
      recommendations.push('Consider setting more goals to accelerate your sustainability journey');
    }

    const completedGoals = goals.filter(goal => goal.status === 'completed');
    if (completedGoals.length > 0) {
      recommendations.push('Great job! Consider setting new challenging goals based on your achievements');
    }

    if (goals.filter(goal => goal.category === 'carbon_reduction').length === 0) {
      recommendations.push('Add a carbon reduction goal to track your environmental impact');
    }

    return recommendations;
  }

  // Filter Methods
  private applyGoalFilters(goals: SustainabilityGoal[], filters?: GoalFilters): SustainabilityGoal[] {
    if (!filters) return goals;

    return goals.filter(goal => {
      if (filters.category && goal.category !== filters.category) return false;
      if (filters.status && goal.status !== filters.status) return false;
      if (filters.type && goal.type !== filters.type) return false;
      if (filters.period) {
        if (goal.timeline.startDate < filters.period.startDate || goal.timeline.endDate > filters.period.endDate) {
          return false;
        }
      }
      return true;
    });
  }

  // Initialization Methods
  private initializeGoalTemplates(): void {
    // Carbon Reduction Goals
    this.goalTemplates.set('reduce_electricity_20', {
      id: 'reduce_electricity_20',
      name: 'Reduce Electricity Usage by 20%',
      description: 'Cut down electricity consumption by 20% through energy efficiency measures',
      category: 'carbon_reduction',
      type: 'reduction',
      target: {
        value: 20,
        unit: '%',
        deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        baselineValue: 0,
        difficulty: 'medium'
      },
      timeline: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        checkpoints: [],
        completedCheckpoints: []
      },
      milestones: [
        {
          id: uuidv4(),
          name: '10% Reduction',
          description: 'Achieve 10% reduction in electricity usage',
          targetValue: 10,
          achieved: false
        },
        {
          id: uuidv4(),
          name: '15% Reduction',
          description: 'Achieve 15% reduction in electricity usage',
          targetValue: 15,
          achieved: false
        }
      ],
      rewards: [
        {
          id: uuidv4(),
          type: 'badge',
          name: 'Energy Saver',
          description: 'Awarded for reducing electricity usage',
          value: 150,
          unit: 'points',
          unlocked: false
        }
      ]
    });

    // Renewable Energy Goals
    this.goalTemplates.set('green_energy_50', {
      id: 'green_energy_50',
      name: '50% Green Energy',
      description: 'Source 50% of your energy from renewable sources',
      category: 'renewable_energy',
      type: 'percentage',
      target: {
        value: 50,
        unit: '%',
        deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        baselineValue: 0,
        difficulty: 'hard'
      },
      timeline: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        checkpoints: [],
        completedCheckpoints: []
      },
      milestones: [
        {
          id: uuidv4(),
          name: '25% Green Energy',
          description: 'Achieve 25% renewable energy usage',
          targetValue: 25,
          achieved: false
        }
      ],
      rewards: [
        {
          id: uuidv4(),
          type: 'badge',
          name: 'Green Champion',
          description: 'Awarded for using renewable energy',
          value: 300,
          unit: 'points',
          unlocked: false
        }
      ]
    });

    // Waste Reduction Goals
    this.goalTemplates.set('zero_waste_kitchen', {
      id: 'zero_waste_kitchen',
      name: 'Zero Waste Kitchen',
      description: 'Eliminate food waste in your kitchen',
      category: 'waste_reduction',
      type: 'absolute',
      target: {
        value: 0,
        unit: 'kg',
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        baselineValue: 5,
        difficulty: 'medium'
      },
      timeline: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        checkpoints: [],
        completedCheckpoints: []
      },
      milestones: [
        {
          id: uuidv4(),
          name: '50% Reduction',
          description: 'Reduce kitchen waste by 50%',
          targetValue: 2.5,
          achieved: false
        }
      ],
      rewards: [
        {
          id: uuidv4(),
          type: 'certificate',
          name: 'Waste Warrior',
          description: 'Certificate for waste reduction achievement',
          value: 200,
          unit: 'points',
          unlocked: false
        }
      ]
    });
  }
}

// Supporting Types
interface GoalTemplate {
  id: string;
  name: string;
  description: string;
  category: GoalCategory;
  type: GoalType;
  target: GoalTarget;
  timeline: GoalTimeline;
  milestones: GoalMilestone[];
  rewards: GoalReward[];
}

interface GoalAchievement {
  id: string;
  goalId: string;
  type: 'goal_completion' | 'milestone' | 'streak';
  title: string;
  description: string;
  value: number;
  unit: string;
  achievedAt: Date;
  points: number;
}

interface GoalFilters {
  category?: GoalCategory;
  status?: GoalStatus;
  type?: GoalType;
  period?: { startDate: Date; endDate: Date };
}

interface GoalAnalytics {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  pausedGoals: number;
  cancelledGoals: number;
  averageProgress: number;
  completionRate: number;
  goalsByCategory: Record<GoalCategory, number>;
  goalsByStatus: Record<GoalStatus, number>;
  upcomingDeadlines: { goalId: string; goalName: string; deadline: Date; daysUntil: number }[];
  achievements: GoalAchievement[];
  recommendations: string[];
}

// Singleton instance
let sustainabilityGoalsInstance: SustainabilityGoals | null = null;

export function getSustainabilityGoals(): SustainabilityGoals {
  if (!sustainabilityGoalsInstance) {
    sustainabilityGoalsInstance = new SustainabilityGoals();
  }
  return sustainabilityGoalsInstance;
}
