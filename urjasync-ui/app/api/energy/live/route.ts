import { NextRequest, NextResponse } from 'next/server';
import { getDeviceManager } from '@/lib/iot/device-manager';

export async function GET(request: NextRequest) {
  try {
    const deviceManager = getDeviceManager();
    const { searchParams } = new URL(request.url);
    
    const deviceId = searchParams.get('deviceId');
    
    if (deviceId) {
      // Get specific device energy data
      const device = deviceManager.getDevice(deviceId);
      if (!device) {
        return NextResponse.json(
          { success: false, error: 'Device not found' },
          { status: 404 }
        );
      }
      
      // For now, return mock data - in production this would come from database
      const energyData = {
        deviceId,
        consumption: Math.random() * 5, // kWh
        power: Math.random() * 2000, // Watts
        voltage: 230 + Math.random() * 10 - 5,
        current: Math.random() * 10,
        frequency: 50 + Math.random() * 0.2 - 0.1,
        timestamp: Date.now(),
        cost: Math.random() * 50
      };
      
      return NextResponse.json({
        success: true,
        data: energyData
      });
    } else {
      // Get aggregated energy data for all devices
      const devices = deviceManager.getOnlineDevices();
      const totalConsumption = devices.reduce((sum, _device) => {
        // Mock consumption data - in production this would be real
        return sum + Math.random() * 2;
      }, 0);
      
      const aggregatedData = {
        totalConsumption,
        totalPower: totalConsumption * 1000, // Convert to watts
        deviceCount: devices.length,
        onlineDevices: devices.length,
        totalDevices: deviceManager.getAllDevices().length,
        estimatedCost: totalConsumption * 5.8, // ₹/kWh
        timestamp: Date.now(),
        peakStatus: getPeakStatus()
      };
      
      return NextResponse.json({
        success: true,
        data: aggregatedData
      });
    }
  } catch (error) {
    console.error('Error fetching energy data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch energy data' },
      { status: 500 }
    );
  }
}

function getPeakStatus(): 'Peak Time' | 'Off-Peak' {
  const hour = new Date().getHours();
  // Peak hours: 6 PM - 10 PM
  if (hour >= 18 && hour < 22) {
    return 'Peak Time';
  }
  return 'Off-Peak';
}
