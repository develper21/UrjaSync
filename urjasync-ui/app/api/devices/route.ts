import { NextRequest, NextResponse } from 'next/server';
import { getDeviceManager } from '../../../lib/iot/device-manager';

export async function GET(request: NextRequest) {
  try {
    const deviceManager = getDeviceManager();
    const { searchParams } = new URL(request.url);
    
    const type = searchParams.get('type') as any;
    const online = searchParams.get('online');
    
    let devices = deviceManager.getAllDevices();
    
    // Filter by type if specified
    if (type) {
      devices = devices.filter(device => device.type === type);
    }
    
    // Filter by online status if specified
    if (online !== null) {
      const isOnline = online === 'true';
      devices = devices.filter(device => device.online === isOnline);
    }
    
    return NextResponse.json({
      success: true,
      data: devices,
      count: devices.length
    });
  } catch (error) {
    console.error('Error fetching devices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch devices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const deviceManager = getDeviceManager();
    
    // Validate required fields
    const { name, type, location } = body;
    if (!name || !type || !location) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, type, location' },
        { status: 400 }
      );
    }
    
    // Validate device type
    const validTypes = ['smart_meter', 'smart_plug', 'appliance', 'sensor'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Invalid device type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }
    
    const device = await deviceManager.registerDevice({
      name,
      type,
      location,
      metadata: body.metadata || {}
    });
    
    return NextResponse.json({
      success: true,
      data: device
    }, { status: 201 });
  } catch (error) {
    console.error('Error registering device:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to register device' },
      { status: 500 }
    );
  }
}
