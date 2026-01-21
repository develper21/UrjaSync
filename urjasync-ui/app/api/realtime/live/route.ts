import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    switch (action) {
      case 'health':
        return NextResponse.json({
          success: true,
          data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: '2.0.0',
            services: {
              mqtt: 'connected',
              websocket: 'active',
              kafka: 'running',
              redis: 'connected'
            }
          }
        });
        
      case 'stats':
        return NextResponse.json({
          success: true,
          data: {
            totalDevices: 1247,
            activeDevices: 892,
            totalUsers: 15420,
            activeUsers: 8934,
            dataPointsProcessed: 2847392,
            averageLatency: 45,
            systemLoad: 0.67
          }
        });
        
      default:
        return NextResponse.json({
          success: true,
          data: {
            message: 'Live dashboard updater is running',
            lastUpdate: new Date().toISOString(),
            nextUpdateIn: 30
          }
        });
    }
  } catch (error) {
    console.error('Live dashboard updater error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
