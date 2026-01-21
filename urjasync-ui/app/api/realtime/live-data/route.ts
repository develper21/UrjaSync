import { NextRequest, NextResponse } from 'next/server';
import { getRealTimeAggregator } from '@/lib/realtime/real-time-aggregator';
import { getLiveDashboardUpdater } from '@/lib/realtime/live-dashboard-updater';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const dashboardId = searchParams.get('dashboardId');
    const widgetId = searchParams.get('widgetId');
    const ruleId = searchParams.get('ruleId');
    
    switch (action) {
      case 'aggregated-data':
        const aggregator = getRealTimeAggregator();
        const aggregatedData = await aggregator.getAggregatedData(ruleId || undefined, {
          start: searchParams.get('startTime') ? new Date(searchParams.get('startTime')!) : new Date(),
          end: searchParams.get('endTime') ? new Date(searchParams.get('endTime')!) : new Date()
        });
        return NextResponse.json({
          success: true,
          data: aggregatedData
        });
        
      case 'aggregation-stats':
        const stats = await getRealTimeAggregator().getStats();
        return NextResponse.json({
          success: true,
          data: stats
        });
        
      case 'aggregation-rules':
        const rules = await getRealTimeAggregator().getRules();
        return NextResponse.json({
          success: true,
          data: rules
        });
        
      case 'aggregation-rule':
        if (!ruleId) {
          return NextResponse.json(
            { success: false, error: 'Rule ID is required' },
            { status: 400 }
          );
        }
        
        const rule = await getRealTimeAggregator().getRule(ruleId);
        if (!rule) {
          return NextResponse.json(
            { success: false, error: 'Rule not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: rule
        });
        
      case 'dashboards':
        const dashboards = await getLiveDashboardUpdater().getDashboards();
        return NextResponse.json({
          success: true,
          data: dashboards
        });
        
      case 'dashboard':
        if (!dashboardId) {
          return NextResponse.json(
            { success: false, error: 'Dashboard ID is required' },
            { status: 400 }
          );
        }
        
        const dashboard = await getLiveDashboardUpdater().getDashboard(dashboardId);
        if (!dashboard) {
          return NextResponse.json(
            { success: false, error: 'Dashboard not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: dashboard
        });
        
      case 'widgets':
        const widgets = await getLiveDashboardUpdater().getWidgets(dashboardId || undefined);
        return NextResponse.json({
          success: true,
          data: widgets
        });
        
      case 'widget':
        if (!widgetId) {
          return NextResponse.json(
            { success: false, error: 'Widget ID is required' },
            { status: 400 }
          );
        }
        
        const widget = await getLiveDashboardUpdater().getWidget(widgetId);
        if (!widget) {
          return NextResponse.json(
            { success: false, error: 'Widget not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: widget
        });
        
      case 'dashboard-stats':
        const dashboardStats = await getLiveDashboardUpdater().getStats(dashboardId || undefined);
        return NextResponse.json({
          success: true,
          data: dashboardStats
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: aggregated-data, aggregation-stats, aggregation-rules, aggregation-rule, dashboards, dashboard, widgets, widget, dashboard-stats' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching live data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch live data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data, ruleData, widgetData, dashboardId, widgetId } = body;
    
    switch (action) {
      case 'process-data':
        if (!data || !data.source) {
          return NextResponse.json(
            { success: false, error: 'Data and source are required' },
            { status: 400 }
          );
        }
        
        await getRealTimeAggregator().processData(data, data.source);
        return NextResponse.json({
          success: true,
          message: 'Data processed successfully'
        });
        
      case 'create-aggregation-rule':
        if (!ruleData) {
          return NextResponse.json(
            { success: false, error: 'Rule data is required' },
            { status: 400 }
          );
        }
        
        const rule = await getRealTimeAggregator().createRule(ruleData);
        return NextResponse.json({
          success: true,
          data: rule,
          message: 'Aggregation rule created successfully'
        });
        
      case 'update-widget':
        if (!widgetId || !data) {
          return NextResponse.json(
            { success: false, error: 'Widget ID and data are required' },
            { status: 400 }
          );
        }
        
        await getLiveDashboardUpdater().updateWidget(widgetId, data);
        return NextResponse.json({
          success: true,
          message: 'Widget updated successfully'
        });
        
      case 'create-widget':
        if (!widgetData) {
          return NextResponse.json(
            { success: false, error: 'Widget data is required' },
            { status: 400 }
          );
        }
        
        const widget = await getLiveDashboardUpdater().createWidget(widgetData);
        return NextResponse.json({
          success: true,
          data: widget,
          message: 'Widget created successfully'
        });
        
      case 'update-widget-config':
        if (!widgetId || !data) {
          return NextResponse.json(
            { success: false, error: 'Widget ID and config data are required' },
            { status: 400 }
          );
        }
        
        const updatedWidget = await getLiveDashboardUpdater().updateWidgetConfig(widgetId, data);
        if (!updatedWidget) {
          return NextResponse.json(
            { success: false, error: 'Widget not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: updatedWidget,
          message: 'Widget config updated successfully'
        });
        
      case 'subscribe-dashboard':
        if (!dashboardId || !widgetId) {
          return NextResponse.json(
            { success: false, error: 'Dashboard ID and widget ID are required' },
            { status: 400 }
          );
        }
        
        // For demo purposes, return a subscription ID
        const subscriptionId = await getLiveDashboardUpdater().subscribeToDashboard(
          dashboardId, 
          widgetId, 
          (update) => console.log('Dashboard update:', update)
        );
        
        return NextResponse.json({
          success: true,
          data: { subscriptionId },
          message: 'Subscribed to dashboard updates successfully'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: process-data, create-aggregation-rule, update-widget, create-widget, update-widget-config, subscribe-dashboard' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing live data request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process live data request' },
      { status: 500 }
    );
  }
}
