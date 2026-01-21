import { NextRequest, NextResponse } from 'next/server';
import { getDeviceDiscovery } from '../../../../lib/iot/device-discovery';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const protocol = searchParams.get('protocol');
    const duration = parseInt(searchParams.get('duration') || '30');
    
    const deviceDiscovery = getDeviceDiscovery();
    
    switch (action) {
      case 'scan':
        const protocols = protocol ? [protocol] : ['wifi', 'zigbee', 'zwave', 'bluetooth'];
        const scanResults = await deviceDiscovery.scanDevices(protocol || undefined, duration);
        
        return NextResponse.json({
          success: true,
          data: {
            devices: scanResults,
            scannedProtocols: protocols,
            scanDuration: duration
          }
        });
        
      case 'status':
        const status = deviceDiscovery.getDiscoveryStatus();
        return NextResponse.json({
          success: true,
          data: status
        });
        
      case 'protocols':
        const availableProtocols = deviceDiscovery.getAvailableProtocols();
        return NextResponse.json({
          success: true,
          data: availableProtocols
        });
        
      case 'history':
        const history = deviceDiscovery.getDiscoveryHistory();
        return NextResponse.json({
          success: true,
          data: history
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: scan, status, protocols, history' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in device discovery endpoint:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process device discovery request' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, deviceInfo } = body;
    
    const deviceDiscovery = getDeviceDiscovery();
    
    switch (action) {
      case 'connect':
        if (!deviceInfo) {
          return NextResponse.json(
            { success: false, error: 'Missing device information' },
            { status: 400 }
          );
        }
        
        const connectionResult = await deviceDiscovery.connectDevice(deviceInfo.id || deviceInfo.deviceId);
        return NextResponse.json({
          success: true,
          data: connectionResult
        });
        
      case 'pair':
        if (!deviceInfo) {
          return NextResponse.json(
            { success: false, error: 'Missing device information' },
            { status: 400 }
          );
        }
        
        const pairingResult = await deviceDiscovery.pairDevice(deviceInfo.id || deviceInfo.deviceId);
        return NextResponse.json({
          success: true,
          data: pairingResult
        });
        
      case 'start_continuous':
        deviceDiscovery.startContinuousDiscovery();
        return NextResponse.json({
          success: true,
          message: 'Continuous discovery started'
        });
        
      case 'stop_continuous':
        deviceDiscovery.stopContinuousDiscovery();
        return NextResponse.json({
          success: true,
          message: 'Continuous discovery stopped'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: connect, pair, start_continuous, stop_continuous' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error managing device discovery:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to manage device discovery' },
      { status: 500 }
    );
  }
}
