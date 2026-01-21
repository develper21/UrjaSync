import { NextRequest, NextResponse } from 'next/server';
import { getSustainabilityGoals } from '@/lib/sustainability/sustainability-goals';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const goalId = searchParams.get('goalId');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const action = searchParams.get('action');
    
    const sustainabilityGoals = getSustainabilityGoals();
    
    switch (action) {
      case 'analytics':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'Missing userId for analytics' },
            { status: 400 }
          );
        }
        
        const analyticsPeriod = startDate && endDate ? {
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        } : {
          startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          endDate: new Date()
        };
        
        const analytics = await sustainabilityGoals.getGoalAnalytics(userId, analyticsPeriod);
        return NextResponse.json({
          success: true,
          data: analytics
        });
        
      case 'templates':
        const categoryFilter = category as any;
        const templates = sustainabilityGoals.getGoalTemplates(categoryFilter);
        return NextResponse.json({
          success: true,
          data: templates
        });
        
      case 'upcoming_deadlines':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'Missing userId for upcoming deadlines' },
            { status: 400 }
          );
        }
        
        const goals = sustainabilityGoals.getUserGoals(userId);
        const upcomingDeadlines = goals
          .filter(goal => goal.status === 'active' && goal.timeline.endDate > new Date())
          .map(goal => ({
            goalId: goal.id,
            goalName: goal.name,
            deadline: goal.timeline.endDate,
            daysUntil: Math.ceil((goal.timeline.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
            progress: goal.current.percentageComplete,
            onTrack: goal.current.onTrack
          }))
          .sort((a, b) => a.daysUntil - b.daysUntil)
          .slice(0, 5);
        
        return NextResponse.json({
          success: true,
          data: upcomingDeadlines
        });
        
      case 'achievements':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'Missing userId for achievements' },
            { status: 400 }
          );
        }
        
        const achievements = await sustainabilityGoals.getUserAchievements(userId);
        return NextResponse.json({
          success: true,
          data: achievements
        });
        
      default:
        if (goalId) {
          // Get specific goal
          const goal = sustainabilityGoals.getGoal(goalId);
          if (!goal) {
            return NextResponse.json(
              { success: false, error: 'Goal not found' },
              { status: 404 }
            );
          }
          return NextResponse.json({
            success: true,
            data: goal
          });
        }
        
        if (userId) {
          // Get user goals with filters
          const filters = {
            category: category as any,
            status: status as any,
            type: type as any,
            period: startDate && endDate ? {
              startDate: new Date(startDate),
              endDate: new Date(endDate)
            } : undefined
          };
          
          const userGoals = sustainabilityGoals.getUserGoals(userId, filters);
          return NextResponse.json({
            success: true,
            data: userGoals,
            count: userGoals.length
          });
        }
        
        return NextResponse.json(
          { success: false, error: 'Missing goalId or userId' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, goalData, templateId, userId, goalId, milestoneData, rewardId } = body;
    
    const sustainabilityGoals = getSustainabilityGoals();
    
    switch (action) {
      case 'create_goal':
        if (!userId || !goalData) {
          return NextResponse.json(
            { success: false, error: 'Missing userId or goal data' },
            { status: 400 }
          );
        }
        
        const newGoal = await sustainabilityGoals.createGoal(userId, goalData);
        return NextResponse.json({
          success: true,
          data: newGoal,
          message: 'Goal created successfully'
        });
        
      case 'create_from_template':
        if (!userId || !templateId) {
          return NextResponse.json(
            { success: false, error: 'Missing userId or templateId' },
            { status: 400 }
          );
        }
        
        const templateGoal = await sustainabilityGoals.createGoalFromTemplate(userId, templateId, goalData);
        return NextResponse.json({
          success: true,
          data: templateGoal,
          message: 'Goal created from template successfully'
        });
        
      case 'update_goal':
        if (!goalId || !goalData) {
          return NextResponse.json(
            { success: false, error: 'Missing goalId or goal data' },
            { status: 400 }
          );
        }
        
        const updatedGoal = await sustainabilityGoals.updateGoal(goalId, goalData);
        return NextResponse.json({
          success: true,
          data: updatedGoal,
          message: 'Goal updated successfully'
        });
        
      case 'update_progress':
        if (!goalId || !goalData || !goalData.currentValue) {
          return NextResponse.json(
            { success: false, error: 'Missing goalId, goalData, or currentValue' },
            { status: 400 }
          );
        }
        
        const progressUpdatedGoal = await sustainabilityGoals.updateGoalProgress(goalId, goalData.currentValue);
        return NextResponse.json({
          success: true,
          data: progressUpdatedGoal,
          message: 'Goal progress updated successfully'
        });
        
      case 'pause_goal':
        if (!goalId) {
          return NextResponse.json(
            { success: false, error: 'Missing goalId' },
            { status: 400 }
          );
        }
        
        const pausedGoal = await sustainabilityGoals.pauseGoal(goalId);
        return NextResponse.json({
          success: true,
          data: pausedGoal,
          message: 'Goal paused successfully'
        });
        
      case 'resume_goal':
        if (!goalId) {
          return NextResponse.json(
            { success: false, error: 'Missing goalId' },
            { status: 400 }
          );
        }
        
        const resumedGoal = await sustainabilityGoals.resumeGoal(goalId);
        return NextResponse.json({
          success: true,
          data: resumedGoal,
          message: 'Goal resumed successfully'
        });
        
      case 'complete_goal':
        if (!goalId) {
          return NextResponse.json(
            { success: false, error: 'Missing goalId' },
            { status: 400 }
          );
        }
        
        const completedGoal = await sustainabilityGoals.completeGoal(goalId);
        return NextResponse.json({
          success: true,
          data: completedGoal,
          message: 'Goal completed successfully'
        });
        
      case 'cancel_goal':
        if (!goalId) {
          return NextResponse.json(
            { success: false, error: 'Missing goalId' },
            { status: 400 }
          );
        }
        
        const cancelledGoal = await sustainabilityGoals.cancelGoal(goalId);
        return NextResponse.json({
          success: true,
          data: cancelledGoal,
          message: 'Goal cancelled successfully'
        });
        
      case 'add_milestone':
        if (!goalId || !milestoneData) {
          return NextResponse.json(
            { success: false, error: 'Missing goalId or milestone data' },
            { status: 400 }
          );
        }
        
        const milestone = await sustainabilityGoals.addMilestone(goalId, milestoneData);
        return NextResponse.json({
          success: true,
          data: milestone,
          message: 'Milestone added successfully'
        });
        
      case 'unlock_reward':
        if (!goalId || !rewardId) {
          return NextResponse.json(
            { success: false, error: 'Missing goalId or rewardId' },
            { status: 400 }
          );
        }
        
        const reward = await sustainabilityGoals.unlockReward(goalId, rewardId);
        return NextResponse.json({
          success: true,
          data: reward,
          message: 'Reward unlocked successfully'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: create_goal, create_from_template, update_goal, update_progress, pause_goal, resume_goal, complete_goal, cancel_goal, add_milestone, unlock_reward' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error managing goals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to manage goals' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { goalId, updates } = body;
    
    if (!goalId || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing goalId or updates' },
        { status: 400 }
      );
    }
    
    const sustainabilityGoals = getSustainabilityGoals();
    const goalUpdates = await sustainabilityGoals.updateGoal(goalId, updates);
    
    return NextResponse.json({
      success: true,
      data: goalUpdates,
      message: 'Goal updated successfully'
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update goal' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { action, goalId, reason } = await request.json();
    
    const sustainabilityGoals = getSustainabilityGoals();
    
    switch (action) {
      case 'cancel_goal':
        if (!goalId) {
          return NextResponse.json(
            { success: false, error: 'Missing goalId' },
            { status: 400 }
          );
        }
        
        const cancelledGoal = await sustainabilityGoals.cancelGoal(goalId, reason);
        return NextResponse.json({
          success: true,
          data: cancelledGoal,
          message: 'Goal cancelled successfully'
        });
        
      case 'delete_goal':
        if (!goalId) {
          return NextResponse.json(
            { success: false, error: 'Missing goalId' },
            { status: 400 }
          );
        }
        
        const deleted = await sustainabilityGoals.cancelGoal(goalId, reason);
        if (!deleted) {
          return NextResponse.json(
            { success: false, error: 'Goal not found or cannot be deleted' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: 'Goal deleted successfully'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: cancel_goal, delete_goal' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete goal' },
      { status: 500 }
    );
  }
}
