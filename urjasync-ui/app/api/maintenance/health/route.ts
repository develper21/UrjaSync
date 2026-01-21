import { NextRequest, NextResponse } from 'next/server';
import { getDeviceHealthMonitor } from '../../../../lib/maintenance/device-health-monitor';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const status = searchParams.get('status');
    const action = searchParams.get('action');
    
    const healthMonitor = getDeviceHealthMonitor();
    
    switch (action) {
      case 'summary':
        const summary = await healthMonitor.getHealthSummary();
        return NextResponse.json({
          success: true,
          data: summary
        });
        
      case 'device':
        if (!deviceId) {
          return NextResponse.json(
            { success: false, error: 'Device ID is required for device health' },
            { status: 400 }
          );
        }
        
        const deviceHealth = await healthMonitor.getDeviceHealth(deviceId);
        if (!deviceHealth) {
          return NextResponse.json(
            { success: false, error: 'Device not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: deviceHealth
        });
        
      case 'by-status':
        if (!status) {
          return NextResponse.json(
            { success: false, error: 'Status is required for status filter' },
            { status: 400 }
          );
        }
        
        const devicesByStatus = await healthMonitor.getDevicesByStatus(status as any);
        return NextResponse.json({
          success: true,
          data: devicesByStatus
        });
        
      default:
        // Get all devices if no specific action
        const allDevices = await healthMonitor.getAllDevicesHealth();
        return NextResponse.json({
          success: true,
          data: allDevices
        });
    }
  } catch (error) {
    console.error('Error fetching device health:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch device health data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, deviceId, metrics, alertId } = body;
    
    const healthMonitor = getDeviceHealthMonitor();
    
    if (!deviceId) {
      return NextResponse.json(
        { success: false, error: 'Device ID is required' },
        { status: 400 }
      );
    }
    
    switch (action) {
      case 'update':
        if (!metrics) {
          return NextResponse.json(
            { success: false, error: 'Metrics are required for update' },
            { status: 400 }
          );
        }
        
        const updatedDevice = await healthMonitor.updateDeviceHealth(deviceId, metrics);
        return NextResponse.json({
          success: true,
          data: updatedDevice,
          message: 'Device health updated successfully'
        });
        
      case 'acknowledge-alert':
        if (!alertId) {
          return NextResponse.json(
            { success: false, error: 'Alert ID is required to acknowledge alert' },
            { status: 400 }
          );
        }
        
        const acknowledged = await healthMonitor.acknowledgeAlert(deviceId, alertId);
        if (!acknowledged) {
          return NextResponse.json(
            { success: false, error: 'Failed to acknowledge alert or alert not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: 'Alert acknowledged successfully'
        });
        
      case 'resolve-alert':
        if (!alertId) {
          return NextResponse.json(
            { success: false, error: 'Alert ID is required to resolve alert' },
            { status: 400 }
          );
        }
        
        const resolved = await healthMonitor.resolveAlert(deviceId, alertId);
        if (!resolved) {
          return NextResponse.json(
            { success: false, error: 'Failed to resolve alert or alert not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: 'Alert resolved successfully'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: update, acknowledge-alert, resolve-alert' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating device health:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update device health' },
      { status: 500 }
    );
  }
}
