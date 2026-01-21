import { NextRequest, NextResponse } from 'next/server';
import { getEcoRecommendations } from '@/lib/sustainability/eco-recommendations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const recommendationId = searchParams.get('recommendationId');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const action = searchParams.get('action');
    
    const ecoRecommendations = getEcoRecommendations();
    
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
        
        const analytics = await ecoRecommendations.getRecommendationAnalytics(userId, analyticsPeriod);
        return NextResponse.json({
          success: true,
          data: analytics
        });
        
      case 'templates':
        const categoryFilter = category as any;
        const templates = ecoRecommendations.getRecommendationTemplates(categoryFilter);
        return NextResponse.json({
          success: true,
          data: templates
        });
        
      case 'resources':
        const resources = ecoRecommendations.getResources(category || undefined, type as any);
        return NextResponse.json({
          success: true,
          data: resources
        });
        
      case 'upcoming_deadlines':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'Missing userId for upcoming deadlines' },
            { status: 400 }
          );
        }
        
        const recommendations = ecoRecommendations.getUserRecommendations(userId);
        const upcomingDeadlines = recommendations
          .filter(rec => (rec.status === 'pending' || rec.status === 'in_progress') && rec.expiresAt)
          .map(rec => ({
            recommendationId: rec.id,
            title: rec.title,
            deadline: rec.expiresAt,
            daysUntil: Math.ceil((rec.expiresAt!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
            priority: rec.priority,
            potentialImpact: {
              co2Reduction: rec.impact.co2Reduction,
              energySavings: rec.impact.energySavings,
              costSavings: rec.impact.costSavings
            }
          }))
          .sort((a, b) => a.daysUntil - b.daysUntil)
          .slice(0, 5);
        
        return NextResponse.json({
          success: true,
          data: upcomingDeadlines
        });
        
      case 'implementation_progress':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'Missing userId for implementation progress' },
            { status: 400 }
          );
        }
        
        const userRecs = ecoRecommendations.getUserRecommendations(userId);
        const implementationProgress = {
          total: userRecs.length,
          pending: userRecs.filter(rec => rec.status === 'pending').length,
          inProgress: userRecs.filter(rec => rec.status === 'in_progress').length,
          completed: userRecs.filter(rec => rec.status === 'completed').length,
          dismissed: userRecs.filter(rec => rec.status === 'dismissed').length,
          expired: userRecs.filter(rec => rec.status === 'expired').length,
          implementationRate: userRecs.length > 0 ? (userRecs.filter(rec => rec.status === 'completed').length / userRecs.length) * 100 : 0
        };
        
        return NextResponse.json({
          success: true,
          data: implementationProgress
        });
        
      default:
        if (recommendationId) {
          // Get specific recommendation
          const recommendation = ecoRecommendations.getRecommendation(recommendationId);
          if (!recommendation) {
            return NextResponse.json(
              { success: false, error: 'Recommendation not found' },
              { status: 404 }
            );
          }
          return NextResponse.json({
            success: true,
            data: recommendation
          });
        }
        
        if (userId) {
          // Get user recommendations with filters
          const filters = {
            category: category as any,
            status: status as any,
            type: type as any,
            priority: priority as any,
            period: startDate && endDate ? {
              startDate: new Date(startDate),
              endDate: new Date(endDate)
            } : undefined
          };
          
          const userRecommendations = ecoRecommendations.getUserRecommendations(userId, filters);
          return NextResponse.json({
            success: true,
            data: userRecommendations,
            count: userRecommendations.length
          });
        }
        
        return NextResponse.json(
          { success: false, error: 'Missing recommendationId or userId' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, recommendationData, userId, templateId, recommendationId, stepNumber, resourceData } = body;
    
    const ecoRecommendations = getEcoRecommendations();
    
    switch (action) {
      case 'generate_recommendations':
        if (!userId || !body.userProfile || !body.metricsData) {
          return NextResponse.json(
            { success: false, error: 'Missing userId, userProfile, or metricsData' },
            { status: 400 }
          );
        }
        
        const recommendations = await ecoRecommendations.generateRecommendations(
          userId,
          body.userProfile,
          body.metricsData
        );
        
        return NextResponse.json({
          success: true,
          data: recommendations,
          message: 'Recommendations generated successfully'
        });
        
      case 'create_recommendation':
        if (!userId || !recommendationData) {
          return NextResponse.json(
            { success: false, error: 'Missing userId or recommendation data' },
            { status: 400 }
          );
        }
        
        const recommendation = await ecoRecommendations.createRecommendation(userId, recommendationData);
        return NextResponse.json({
          success: true,
          data: recommendation,
          message: 'Recommendation created successfully'
        });
        
      case 'create_from_template':
        if (!userId || !templateId) {
          return NextResponse.json(
            { success: false, error: 'Missing userId or templateId' },
            { status: 400 }
          );
        }
        
        const templateRecommendation = await ecoRecommendations.createRecommendationFromTemplate(userId, templateId, recommendationData);
        return NextResponse.json({
          success: true,
          data: templateRecommendation,
          message: 'Recommendation created from template successfully'
        });
        
      case 'update_recommendation':
        if (!recommendationId || !recommendationData) {
          return NextResponse.json(
            { success: false, error: 'Missing recommendationId or recommendation data' },
            { status: 400 }
          );
        }
        
        const updatedRecommendation = await ecoRecommendations.updateRecommendation(recommendationId, recommendationData);
        return NextResponse.json({
          success: true,
          data: updatedRecommendation,
          message: 'Recommendation updated successfully'
        });
        
      case 'implement_step':
        if (!recommendationId || !stepNumber) {
          return NextResponse.json(
            { success: false, error: 'Missing recommendationId or stepNumber' },
            { status: 400 }
          );
        }
        
        const implementedRecommendation = await ecoRecommendations.implementRecommendation(recommendationId, stepNumber);
        return NextResponse.json({
          success: true,
          data: implementedRecommendation,
          message: 'Recommendation step implemented successfully'
        });
        
      case 'dismiss_recommendation':
        if (!recommendationId) {
          return NextResponse.json(
            { success: false, error: 'Missing recommendationId' },
            { status: 400 }
          );
        }
        
        const dismissedRecommendation = await ecoRecommendations.dismissRecommendation(recommendationId, recommendationData?.reason);
        return NextResponse.json({
          success: true,
          data: dismissedRecommendation,
          message: 'Recommendation dismissed successfully'
        });
        
      case 'mark_expired':
        if (!recommendationId) {
          return NextResponse.json(
            { success: false, error: 'Missing recommendationId' },
            { status: 400 }
          );
        }
        
        const expiredRecommendation = await ecoRecommendations.markRecommendationExpired(recommendationId);
        return NextResponse.json({
          success: true,
          data: expiredRecommendation,
          message: 'Recommendation marked as expired successfully'
        });
        
      case 'add_resource':
        if (!resourceData) {
          return NextResponse.json(
            { success: false, error: 'Missing resource data' },
            { status: 400 }
          );
        }
        
        const resource = await ecoRecommendations.addResource(resourceData);
        return NextResponse.json({
          success: true,
          data: resource,
          message: 'Resource added successfully'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: generate_recommendations, create_recommendation, create_from_template, update_recommendation, implement_step, dismiss_recommendation, mark_expired, add_resource' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error managing recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to manage recommendations' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { recommendationId, updates } = body;
    
    if (!recommendationId || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing recommendationId or updates' },
        { status: 400 }
      );
    }
    
    const ecoRecommendations = getEcoRecommendations();
    const updatedRecommendation = await ecoRecommendations.updateRecommendation(recommendationId, updates);
    
    return NextResponse.json({
      success: true,
      data: updatedRecommendation,
      message: 'Recommendation updated successfully'
    });
  } catch (error) {
    console.error('Error updating recommendation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update recommendation' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { action, recommendationId, reason } = await request.json();
    
    const ecoRecommendations = getEcoRecommendations();
    
    switch (action) {
      case 'dismiss_recommendation':
        if (!recommendationId) {
          return NextResponse.json(
            { success: false, error: 'Missing recommendationId' },
            { status: 400 }
          );
        }
        
        const dismissedRecommendation = await ecoRecommendations.dismissRecommendation(recommendationId, reason);
        return NextResponse.json({
          success: true,
          data: dismissedRecommendation,
          message: 'Recommendation dismissed successfully'
        });
        
      case 'delete_recommendation':
        if (!recommendationId) {
          return NextResponse.json(
            { success: false, error: 'Missing recommendationId' },
            { status: 400 }
          );
        }
        
        const deleted = await (ecoRecommendations as any).dismissRecommendation(recommendationId, reason);
        if (!deleted) {
          return NextResponse.json(
            { success: false, error: 'Recommendation not found or cannot be deleted' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: 'Recommendation deleted successfully'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: dismiss_recommendation, delete_recommendation' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error deleting recommendation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete recommendation' },
      { status: 500 }
    );
  }
}
