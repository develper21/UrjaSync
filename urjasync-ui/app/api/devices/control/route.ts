import { NextRequest, NextResponse } from 'next/server';
import { getDeviceManager, DeviceAction } from '../../../../lib/iot/device-manager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, action, parameters, batch } = body;
    
    const deviceManager = getDeviceManager();
    
    // Handle batch control
    if (batch && Array.isArray(batch)) {
      const results = [];
      
      for (const command of batch) {
        try {
          await deviceManager.controlDevice(
            command.deviceId,
            command.action,
            command.parameters || {}
          );
          
          results.push({
            deviceId: command.deviceId,
            success: true,
            action: command.action
          });
        } catch (error) {
          results.push({
            deviceId: command.deviceId,
            success: false,
            action: command.action,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      return NextResponse.json({
        success: true,
        data: {
          results,
          totalCommands: batch.length,
          successfulCommands: results.filter(r => r.success).length,
          failedCommands: results.filter(r => !r.success).length
        }
      });
    }
    
    // Handle single device control
    if (!deviceId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: deviceId, action' },
        { status: 400 }
      );
    }
    
    await deviceManager.controlDevice(deviceId, action, parameters || {});
    
    return NextResponse.json({
      success: true,
      message: `Command '${action}' sent to device ${deviceId}`,
      data: {
        deviceId,
        action,
        parameters,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('Error controlling device:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to control device' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const action = searchParams.get('action');
    
    const deviceManager = getDeviceManager();
    
    if (deviceId && action) {
      // Get available actions for a specific device
      const device = deviceManager.getDevice(deviceId);
      if (!device) {
        return NextResponse.json(
          { success: false, error: 'Device not found' },
          { status: 404 }
        );
      }
      
      const availableActions = deviceManager.getDeviceActions(deviceId);
      const actionDetails = availableActions.find((a: DeviceAction) => a.name === action);
      
      if (!actionDetails) {
        return NextResponse.json(
          { success: false, error: 'Action not found for this device' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: actionDetails
      });
    }
    
    if (deviceId) {
      // Get all available actions for a device
      const device = deviceManager.getDevice(deviceId);
      if (!device) {
        return NextResponse.json(
          { success: false, error: 'Device not found' },
          { status: 404 }
        );
      }
      
      const availableActions = deviceManager.getDeviceActions(deviceId);
      return NextResponse.json({
        success: true,
        data: {
          deviceId,
          deviceName: device.name,
          deviceType: device.type,
          actions: availableActions
        }
      });
    }
    
    // Get control status for all devices
    const devices = deviceManager.getAllDevices();
    const deviceStatuses = devices.map(device => ({
      deviceId: device.id,
      name: device.name,
      type: device.type,
      online: device.online,
      lastSeen: device.lastSeen,
      controllable: deviceManager.getDeviceActions(device.id).length > 0
    }));
    
    return NextResponse.json({
      success: true,
      data: deviceStatuses
    });
  } catch (error) {
    console.error('Error getting device control info:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get device control information' },
      { status: 500 }
    );
  }
}
