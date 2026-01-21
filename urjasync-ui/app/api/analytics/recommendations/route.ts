import { NextRequest, NextResponse } from 'next/server';
import { getRecommendationEngine } from '@/lib/analytics/recommendation-engine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const userId = searchParams.get('userId') || 'default';
    
    const recommendationEngine = getRecommendationEngine();
    const recommendations = await recommendationEngine.generateRecommendations(userId, deviceId || undefined);
    
    return NextResponse.json({
      success: true,
      data: recommendations,
      count: recommendations.length
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recommendationId, action } = body;
    
    if (!recommendationId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: recommendationId, action' },
        { status: 400 }
      );
    }
    
    if (!['accepted', 'dismissed', 'completed'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be: accepted, dismissed, completed' },
        { status: 400 }
      );
    }
    
    const recommendationEngine = getRecommendationEngine();
    await recommendationEngine.trackRecommendationAction(recommendationId, action);
    
    return NextResponse.json({
      success: true,
      message: `Recommendation ${recommendationId} ${action}`
    });
  } catch (error) {
    console.error('Error tracking recommendation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track recommendation' },
      { status: 500 }
    );
  }
}
