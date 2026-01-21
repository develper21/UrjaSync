import { NextRequest, NextResponse } from 'next/server';
import { getDeviceManager } from '../../../../lib/iot/device-manager';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    const { deviceId } = await params;
    const deviceManager = getDeviceManager();
    const device = deviceManager.getDevice(deviceId);
    
    if (!device) {
      return NextResponse.json(
        { success: false, error: 'Device not found' },
        { status: 404 }
      );
    }
    
    // Include device health information
    const health = deviceManager.getDeviceHealth(deviceId);
    
    return NextResponse.json({
      success: true,
      data: {
        ...device,
        health
      }
    });
  } catch (error) {
    console.error('Error fetching device:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch device' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    const { deviceId } = await params;
    const body = await request.json();
    const deviceManager = getDeviceManager();
    
    const { action, parameters } = body;
    
    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: action' },
        { status: 400 }
      );
    }
    
    await deviceManager.controlDevice(deviceId, action, parameters);
    
    return NextResponse.json({
      success: true,
      message: `Command '${action}' sent to device ${deviceId}`
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    const { deviceId } = await params;
    const deviceManager = getDeviceManager();
    const success = await deviceManager.removeDevice(deviceId);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Device not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `Device ${deviceId} removed successfully`
    });
  } catch (error) {
    console.error('Error removing device:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove device' },
      { status: 500 }
    );
  }
}
