import { NextRequest, NextResponse } from 'next/server';
import { getDeviceManager } from '@/lib/iot/device-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const period = searchParams.get('period') as 'hourly' | 'daily' | 'weekly' | 'monthly' || 'daily';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');
    
    const deviceManager = getDeviceManager();
    
    if (deviceId) {
      // Get consumption data for specific device
      const device = deviceManager.getDevice(deviceId);
      if (!device) {
        return NextResponse.json(
          { success: false, error: 'Device not found' },
          { status: 404 }
        );
      }
      
      const consumptionData = generateDeviceConsumptionData(deviceId, period, limit);
      
      return NextResponse.json({
        success: true,
        data: {
          deviceId,
          deviceName: device.name,
          deviceType: device.type,
          period,
          consumption: consumptionData
        }
      });
    }
    
    if (startDate && endDate) {
      // Get consumption data for date range
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const rangeData = generateDateRangeConsumptionData(start, end, period);
      
      return NextResponse.json({
        success: true,
        data: {
          startDate,
          endDate,
          period,
          consumption: rangeData
        }
      });
    }
    
    // Get aggregated consumption data
    const devices = deviceManager.getAllDevices();
    const aggregatedData = generateAggregatedConsumptionData(period, limit);
    
    return NextResponse.json({
      success: true,
      data: {
        period,
        deviceCount: devices.length,
        consumption: aggregatedData
      }
    });
  } catch (error) {
    console.error('Error fetching consumption data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch consumption data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, deviceId: _deviceId, consumptionData } = body;
    
    
    switch (action) {
      case 'record_consumption':
        if (!_deviceId || !consumptionData) {
          return NextResponse.json(
            { success: false, error: 'Missing deviceId or consumptionData' },
            { status: 400 }
          );
        }
        
        // Mock consumption recording - in production would save to database
        console.log(`Recording consumption for device: ${_deviceId}`, consumptionData);
        
        return NextResponse.json({
          success: true,
          message: 'Consumption data recorded successfully'
        });
        
      case 'batch_record':
        if (!Array.isArray(consumptionData)) {
          return NextResponse.json(
            { success: false, error: 'consumptionData must be an array for batch recording' },
            { status: 400 }
          );
        }
        
        for (const _data of consumptionData) {
          // Mock batch recording - in production would save to database
        console.log(`Batch recording ${consumptionData.length} consumption records`);
        }
        
        return NextResponse.json({
          success: true,
          message: `${consumptionData.length} consumption records added successfully`
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: record_consumption, batch_record' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error recording consumption data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record consumption data' },
      { status: 500 }
    );
  }
}

function generateDeviceConsumptionData(_deviceId: string, period: string, limit: number): any[] {
  const data = [];
  const now = Date.now();
  
  for (let i = 0; i < limit; i++) {
    let timestamp;
    
    switch (period) {
      case 'hourly':
        timestamp = now - (i * 60 * 60 * 1000);
        break;
      case 'daily':
        timestamp = now - (i * 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        timestamp = now - (i * 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        timestamp = now - (i * 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        timestamp = now - (i * 24 * 60 * 60 * 1000);
    }
    
    data.push({
      timestamp,
      consumption: Math.random() * 5 + 0.5,
      cost: Math.random() * 30 + 5,
      tariffRate: 3.5 + Math.random() * 5,
      period: getTariffPeriod(new Date(timestamp))
    });
  }
  
  return data.reverse();
}

function generateDateRangeConsumptionData(startDate: Date, endDate: Date, period: string): any[] {
  const data = [];
  const start = startDate.getTime();
  const end = endDate.getTime();
  const interval = period === 'hourly' ? 60 * 60 * 1000 : 
                   period === 'daily' ? 24 * 60 * 60 * 1000 :
                   period === 'weekly' ? 7 * 24 * 60 * 60 * 1000 :
                   30 * 24 * 60 * 60 * 1000;
  
  for (let timestamp = start; timestamp <= end; timestamp += interval) {
    data.push({
      timestamp,
      consumption: Math.random() * 10 + 1,
      cost: Math.random() * 60 + 10,
      tariffRate: 3.5 + Math.random() * 5,
      period: getTariffPeriod(new Date(timestamp))
    });
  }
  
  return data;
}

function generateAggregatedConsumptionData(period: string, limit: number): any[] {
  const data = [];
  const now = Date.now();
  
  for (let i = 0; i < limit; i++) {
    let timestamp;
    
    switch (period) {
      case 'hourly':
        timestamp = now - (i * 60 * 60 * 1000);
        break;
      case 'daily':
        timestamp = now - (i * 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        timestamp = now - (i * 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        timestamp = now - (i * 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        timestamp = now - (i * 24 * 60 * 60 * 1000);
    }
    
    data.push({
      timestamp,
      totalConsumption: Math.random() * 15 + 2,
      totalCost: Math.random() * 100 + 20,
      deviceCount: Math.floor(Math.random() * 5) + 1,
      averageTariffRate: 3.5 + Math.random() * 5,
      peakConsumption: Math.random() * 8 + 1,
      offPeakConsumption: Math.random() * 7 + 1
    });
  }
  
  return data.reverse();
}

function getTariffPeriod(date: Date): 'peak' | 'standard' | 'off_peak' {
  const hour = date.getHours();
  if (hour >= 18 && hour < 22) return 'peak';
  if (hour >= 22 || hour < 6) return 'off_peak';
  return 'standard';
}
