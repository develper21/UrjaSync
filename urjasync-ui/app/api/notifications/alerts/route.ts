import { NextRequest, NextResponse } from 'next/server';
import { getAlertEngine } from '@/lib/notifications/alert-engine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('alertId');
    const action = searchParams.get('action');
    
    const alertEngine = getAlertEngine();
    
    switch (action) {
      case 'stats':
        const stats = await alertEngine.getStats();
        return NextResponse.json({
          success: true,
          data: stats
        });
        
      case 'alert':
        if (!alertId) {
          return NextResponse.json(
            { success: false, error: 'Alert ID is required' },
            { status: 400 }
          );
        }
        
        const alert = await alertEngine.getAlert(alertId);
        if (!alert) {
          return NextResponse.json(
            { success: false, error: 'Alert not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: alert
        });
        
      case 'alerts':
        const filters = {
          userId: searchParams.get('userId') || undefined,
          deviceId: searchParams.get('deviceId') || undefined,
          severity: searchParams.get('severity') || undefined,
          status: searchParams.get('status') || undefined,
          category: searchParams.get('category') || undefined,
          limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
          offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined
        };
        
        const alerts = await alertEngine.getAlerts(filters);
        return NextResponse.json({
          success: true,
          data: alerts
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: stats, alert, alerts' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching alert data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alert data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, alertId, userId, alertData, ruleData } = body;
    
    const alertEngine = getAlertEngine();
    
    switch (action) {
      case 'create-alert':
        if (!alertData) {
          return NextResponse.json(
            { success: false, error: 'Alert data is required' },
            { status: 400 }
          );
        }
        
        const alert = await alertEngine.createAlert(alertData);
        return NextResponse.json({
          success: true,
          data: alert,
          message: 'Alert created successfully'
        });
        
      case 'acknowledge':
        if (!alertId || !userId) {
          return NextResponse.json(
            { success: false, error: 'Alert ID and user ID are required' },
            { status: 400 }
          );
        }
        
        const acknowledgeSuccess = await alertEngine.acknowledgeAlert(alertId, userId);
        if (!acknowledgeSuccess) {
          return NextResponse.json(
            { success: false, error: 'Failed to acknowledge alert or alert not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: 'Alert acknowledged successfully'
        });
        
      case 'resolve':
        if (!alertId || !userId || !body.resolution) {
          return NextResponse.json(
            { success: false, error: 'Alert ID, user ID, and resolution are required' },
            { status: 400 }
          );
        }
        
        const resolveSuccess = await alertEngine.resolveAlert(alertId, body.resolution, userId);
        if (!resolveSuccess) {
          return NextResponse.json(
            { success: false, error: 'Failed to resolve alert or alert not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: 'Alert resolved successfully'
        });
        
      case 'create-rule':
        if (!ruleData) {
          return NextResponse.json(
            { success: false, error: 'Rule data is required' },
            { status: 400 }
          );
        }
        
        const rule = await alertEngine.createRule(ruleData);
        return NextResponse.json({
          success: true,
          data: rule,
          message: 'Alert rule created successfully'
        });
        
      case 'update-rule':
        const ruleId = body.ruleId;
        if (!ruleId || !ruleData) {
          return NextResponse.json(
            { success: false, error: 'Rule ID and updates are required' },
            { status: 400 }
          );
        }
        
        const updatedRule = await alertEngine.updateRule(ruleId, ruleData);
        if (!updatedRule) {
          return NextResponse.json(
            { success: false, error: 'Rule not found or update failed' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: updatedRule,
          message: 'Alert rule updated successfully'
        });
        
      case 'delete-rule':
        const ruleIdToDelete = body.ruleId;
        if (!ruleIdToDelete) {
          return NextResponse.json(
            { success: false, error: 'Rule ID is required' },
            { status: 400 }
          );
        }
        
        const deleteSuccess = await alertEngine.deleteRule(ruleIdToDelete);
        if (!deleteSuccess) {
          return NextResponse.json(
            { success: false, error: 'Rule not found or delete failed' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: 'Alert rule deleted successfully'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: create-alert, acknowledge, resolve, create-rule, update-rule, delete-rule' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing alert request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process alert request' },
      { status: 500 }
    );
  }
}
