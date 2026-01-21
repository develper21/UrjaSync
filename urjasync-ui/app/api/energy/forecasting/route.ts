import { NextRequest, NextResponse } from 'next/server';
import { getPredictiveAnalytics } from '@/lib/analytics/predictive-analytics';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const type = searchParams.get('type') as 'consumption' | 'cost' | 'peak' | 'maintenance' || 'consumption';
    const hours = parseInt(searchParams.get('hours') || '24');
    const confidence = searchParams.get('confidence') === 'true';
    
    const predictiveAnalytics = getPredictiveAnalytics();
    
    if (deviceId) {
      // Get forecast for specific device
      switch (type) {
        case 'consumption':
          const consumptionForecast = await predictiveAnalytics.generateForecast(deviceId, hours);
          return NextResponse.json({
            success: true,
            data: {
              deviceId,
              type: 'consumption',
              forecast: consumptionForecast,
              confidence
            }
          });
          
        case 'peak':
          const peakForecast = await predictiveAnalytics.predictPeakHours(deviceId);
          return NextResponse.json({
            success: true,
            data: {
              deviceId,
              type: 'peak',
              forecast: peakForecast,
              confidence
            }
          });
          
        case 'maintenance':
          const maintenanceForecast = predictiveAnalytics.predictMaintenance(deviceId);
          return NextResponse.json({
            success: true,
            data: {
              deviceId,
              type: 'maintenance',
              forecast: maintenanceForecast,
              confidence
            }
          });
          
        default:
          return NextResponse.json(
            { success: false, error: 'Invalid type. Use: consumption, peak, maintenance' },
            { status: 400 }
          );
      }
    }
    
    // Get aggregated forecast for all devices
    const aggregatedForecast = generateAggregatedForecast(type, hours);
    
    return NextResponse.json({
      success: true,
      data: {
        type,
        aggregated: true,
        forecast: aggregatedForecast,
        confidence
      }
    });
  } catch (error) {
    console.error('Error generating forecast:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate forecast' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, deviceId, historicalData, forecastConfig } = body;
    
    const predictiveAnalytics = getPredictiveAnalytics();
    
    switch (action) {
      case 'train_model':
        if (!deviceId || !historicalData) {
          return NextResponse.json(
            { success: false, error: 'Missing deviceId or historicalData' },
            { status: 400 }
          );
        }
        
        const model = await predictiveAnalytics.trainModel(deviceId, historicalData);
        return NextResponse.json({
          success: true,
          data: model,
          message: 'Forecast model trained successfully'
        });
        
      case 'bill_forecast':
        if (!deviceId) {
          return NextResponse.json(
            { success: false, error: 'Missing deviceId' },
            { status: 400 }
          );
        }
        
        const billingPeriod = forecastConfig?.billingPeriod || {
          start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
        };
        
        const tariffRates = forecastConfig?.tariffRates || {
          peak: 8.2,
          standard: 5.8,
          offPeak: 3.5
        };
        
        const billForecast = await predictiveAnalytics.generateBillForecast(deviceId, billingPeriod, tariffRates);
        return NextResponse.json({
          success: true,
          data: billForecast
        });
        
      case 'custom_forecast':
        if (!deviceId || !forecastConfig) {
          return NextResponse.json(
            { success: false, error: 'Missing deviceId or forecastConfig' },
            { status: 400 }
          );
        }
        
        const customForecast = await generateCustomForecast(deviceId, forecastConfig);
        return NextResponse.json({
          success: true,
          data: customForecast
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: train_model, bill_forecast, custom_forecast' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in forecast endpoint:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process forecast request' },
      { status: 500 }
    );
  }
}

function generateAggregatedForecast(type: string, hours: number): any[] {
  const forecast = [];
  const now = Date.now();
  
  for (let i = 0; i < hours; i++) {
    const timestamp = now + (i * 60 * 60 * 1000);
    const hour = new Date(timestamp).getHours();
    
    let value;
    switch (type) {
      case 'consumption':
        value = 2 + Math.random() * 3 + (hour >= 18 && hour < 22 ? 2 : 0);
        break;
      case 'cost':
        value = 10 + Math.random() * 20 + (hour >= 18 && hour < 22 ? 15 : 0);
        break;
      case 'peak':
        value = hour >= 18 && hour < 22 ? 0.8 + Math.random() * 0.2 : 0.1 + Math.random() * 0.3;
        break;
      default:
        value = Math.random() * 5;
    }
    
    forecast.push({
      timestamp,
      value,
      confidence: 0.7 + Math.random() * 0.3,
      upperBound: value * 1.2,
      lowerBound: value * 0.8
    });
  }
  
  return forecast;
}

async function generateCustomForecast(deviceId: string, config: any): Promise<any> {
  const { type, duration, granularity, factors } = config;
  
  // Mock custom forecast generation
  const forecast = {
    deviceId,
    type,
    duration,
    granularity,
    factors: factors || [],
    generatedAt: Date.now(),
    data: [] as Array<{
      timestamp: number;
      predictedValue: number;
      confidence: number;
      factors: {
        weather: number;
        timeOfDay: number;
        dayOfWeek: number;
        seasonal: number;
      };
    }>
  };
  
  const interval = granularity === 'hourly' ? 60 * 60 * 1000 :
                  granularity === 'daily' ? 24 * 60 * 60 * 1000 :
                  60 * 60 * 1000; // default hourly
  
  const now = Date.now();
  const endTime = now + (duration * 24 * 60 * 60 * 1000); // duration in days
  
  for (let timestamp = now; timestamp <= endTime; timestamp += interval) {
    forecast.data.push({
      timestamp,
      predictedValue: Math.random() * 10 + 1,
      confidence: 0.6 + Math.random() * 0.4,
      factors: {
        weather: Math.random(),
        timeOfDay: Math.random(),
        dayOfWeek: Math.random(),
        seasonal: Math.random()
      }
    });
  }
  
  return forecast;
}
