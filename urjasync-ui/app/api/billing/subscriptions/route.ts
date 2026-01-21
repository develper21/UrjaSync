import { NextRequest, NextResponse } from 'next/server';
import { getSubscriptionManager } from '../../../../lib/billing/subscription-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('subscriptionId');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const billingCycle = searchParams.get('billingCycle');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const action = searchParams.get('action');
    
    const subscriptionManager = getSubscriptionManager();
    
    switch (action) {
      case 'analytics':
        const analyticsPeriod = startDate && endDate ? {
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        } : undefined;
        
        const analytics = subscriptionManager.getSubscriptionAnalytics(analyticsPeriod);
        return NextResponse.json({
          success: true,
          data: analytics
        });
        
      case 'status':
        if (!status) {
          return NextResponse.json(
            { success: false, error: 'Missing status parameter' },
            { status: 400 }
          );
        }
        
        const statusSubscriptions = subscriptionManager.getSubscriptionsByStatus(status as any);
        return NextResponse.json({
          success: true,
          data: statusSubscriptions,
          count: statusSubscriptions.length
        });
        
      case 'type':
        if (!type) {
          return NextResponse.json(
            { success: false, error: 'Missing type parameter' },
            { status: 400 }
          );
        }
        
        const typeSubscriptions = subscriptionManager.getSubscriptionsByType(type as any);
        return NextResponse.json({
          success: true,
          data: typeSubscriptions,
          count: typeSubscriptions.length
        });
        
      case 'due_for_renewal':
        const days = parseInt(searchParams.get('days') || '7');
        const dueSubscriptions = subscriptionManager.getSubscriptionsDueForRenewal(days);
        return NextResponse.json({
          success: true,
          data: dueSubscriptions,
          count: dueSubscriptions.length
        });
        
      case 'plans':
        const activeOnly = searchParams.get('activeOnly') === 'true';
        const plans = subscriptionManager.getAllPlans(activeOnly);
        return NextResponse.json({
          success: true,
          data: plans,
          count: plans.length
        });
        
      default:
        if (subscriptionId) {
          // Get specific subscription
          const subscription = subscriptionManager.getSubscription(subscriptionId);
          if (!subscription) {
            return NextResponse.json(
              { success: false, error: 'Subscription not found' },
              { status: 404 }
            );
          }
          return NextResponse.json({
            success: true,
            data: subscription
          });
        }
        
        if (userId) {
          // Get user subscriptions with filters
          const filters = {
            status: status as any,
            type: type as any,
            billingCycle: billingCycle as any,
            period: startDate && endDate ? {
              startDate: new Date(startDate),
              endDate: new Date(endDate)
            } : undefined,
            minAmount: minAmount ? parseFloat(minAmount) : undefined,
            maxAmount: maxAmount ? parseFloat(maxAmount) : undefined
          };
          
          const userSubscriptions = subscriptionManager.getUserSubscriptions(userId, filters);
          return NextResponse.json({
            success: true,
            data: userSubscriptions,
            count: userSubscriptions.length
          });
        }
        
        return NextResponse.json(
          { success: false, error: 'Missing subscriptionId or userId' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, subscriptionData, planData } = body;
    
    const subscriptionManager = getSubscriptionManager();
    
    switch (action) {
      case 'create_subscription':
        if (!subscriptionData.userId || !subscriptionData.planId) {
          return NextResponse.json(
            { success: false, error: 'Missing userId or planId' },
            { status: 400 }
          );
        }
        
        const subscription = await subscriptionManager.createSubscription(
          subscriptionData.userId,
          subscriptionData.planId,
          subscriptionData.paymentMethod,
          subscriptionData.trialDays
        );
        
        return NextResponse.json({
          success: true,
          data: subscription,
          message: 'Subscription created successfully'
        });
        
      case 'create_plan':
        if (!planData || !planData.name || !planData.type || !planData.billingCycle || !planData.amount) {
          return NextResponse.json(
            { success: false, error: 'Missing required plan data' },
            { status: 400 }
          );
        }
        
        const plan = await subscriptionManager.createPlan(planData);
        return NextResponse.json({
          success: true,
          data: plan,
          message: 'Subscription plan created successfully'
        });
        
      case 'cancel_subscription':
        if (!subscriptionData.subscriptionId) {
          return NextResponse.json(
            { success: false, error: 'Missing subscriptionId' },
            { status: 400 }
          );
        }
        
        const cancelledSubscription = await subscriptionManager.cancelSubscription(
          subscriptionData.subscriptionId,
          subscriptionData.reason,
          subscriptionData.effectiveImmediately
        );
        
        return NextResponse.json({
          success: true,
          data: cancelledSubscription,
          message: 'Subscription cancelled successfully'
        });
        
      case 'pause_subscription':
        if (!subscriptionData.subscriptionId) {
          return NextResponse.json(
            { success: false, error: 'Missing subscriptionId' },
            { status: 400 }
          );
        }
        
        const pausedSubscription = await subscriptionManager.pauseSubscription(
          subscriptionData.subscriptionId,
          subscriptionData.reason
        );
        
        return NextResponse.json({
          success: true,
          data: pausedSubscription,
          message: 'Subscription paused successfully'
        });
        
      case 'resume_subscription':
        if (!subscriptionData.subscriptionId) {
          return NextResponse.json(
            { success: false, error: 'Missing subscriptionId' },
            { status: 400 }
          );
        }
        
        const resumedSubscription = await subscriptionManager.resumeSubscription(subscriptionData.subscriptionId);
        return NextResponse.json({
          success: true,
          data: resumedSubscription,
          message: 'Subscription resumed successfully'
        });
        
      case 'change_plan':
        if (!subscriptionData.subscriptionId || !subscriptionData.newPlanId) {
          return NextResponse.json(
            { success: false, error: 'Missing subscriptionId or newPlanId' },
            { status: 400 }
          );
        }
        
        const changedSubscription = await subscriptionManager.changeSubscriptionPlan(
          subscriptionData.subscriptionId,
          subscriptionData.newPlanId,
          subscriptionData.prorate
        );
        
        return NextResponse.json({
          success: true,
          data: changedSubscription,
          message: 'Subscription plan changed successfully'
        });
        
      case 'process_renewal':
        if (!subscriptionData.subscriptionId) {
          return NextResponse.json(
            { success: false, error: 'Missing subscriptionId' },
            { status: 400 }
          );
        }
        
        const renewedSubscription = await subscriptionManager.processSubscriptionRenewal(subscriptionData.subscriptionId);
        return NextResponse.json({
          success: true,
          data: renewedSubscription,
          message: 'Subscription renewal processed successfully'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: create_subscription, create_plan, cancel_subscription, pause_subscription, resume_subscription, change_plan, process_renewal' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error managing subscriptions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to manage subscriptions' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscriptionId, updates } = body;
    
    if (!subscriptionId || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing subscriptionId or updates' },
        { status: 400 }
      );
    }
    
    const subscriptionManager = getSubscriptionManager();
    const updatedSubscription = await subscriptionManager.updateSubscription(subscriptionId, updates);
    
    return NextResponse.json({
      success: true,
      data: updatedSubscription,
      message: 'Subscription updated successfully'
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, subscriptionId, planId } = body;
    
    const subscriptionManager = getSubscriptionManager();
    
    switch (action) {
      case 'cancel_subscription':
        if (!subscriptionId) {
          return NextResponse.json(
            { success: false, error: 'Missing subscriptionId' },
            { status: 400 }
          );
        }
        
        const cancelledSubscription = await subscriptionManager.cancelSubscription(subscriptionId, body.reason);
        return NextResponse.json({
          success: true,
          data: cancelledSubscription,
          message: 'Subscription cancelled successfully'
        });
        
      case 'delete_plan':
        if (!planId) {
          return NextResponse.json(
            { success: false, error: 'Missing planId' },
            { status: 400 }
          );
        }
        
        const deleted = await subscriptionManager.deletePlan(planId);
        if (!deleted) {
          return NextResponse.json(
            { success: false, error: 'Plan not found or cannot be deleted' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: 'Subscription plan deleted successfully'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: cancel_subscription, delete_plan' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error deleting subscription/plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete subscription/plan' },
      { status: 500 }
    );
  }
}
