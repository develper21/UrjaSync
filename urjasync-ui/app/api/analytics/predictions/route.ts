import { NextRequest, NextResponse } from 'next/server';
import { getPredictiveAnalytics } from '@/lib/analytics/predictive-analytics';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const type = searchParams.get('type');
    const hours = parseInt(searchParams.get('hours') || '24');
    
    if (!deviceId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: deviceId' },
        { status: 400 }
      );
    }
    
    const predictiveAnalytics = getPredictiveAnalytics();
    
    switch (type) {
      case 'forecast':
        const forecasts = await predictiveAnalytics.generateForecast(deviceId, hours);
        return NextResponse.json({
          success: true,
          data: forecasts
        });
        
      case 'peak_hours':
        const peakPredictions = await predictiveAnalytics.predictPeakHours(deviceId);
        return NextResponse.json({
          success: true,
          data: peakPredictions
        });
        
      case 'maintenance':
        const maintenance = predictiveAnalytics.predictMaintenance(deviceId);
        return NextResponse.json({
          success: true,
          data: maintenance
        });
        
      case 'bill_forecast':
        const billingPeriod = {
          start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
        };
        const tariffRates = {
          peak: 8.2,
          standard: 5.8,
          offPeak: 3.5
        };
        const billForecast = await predictiveAnalytics.generateBillForecast(deviceId, billingPeriod, tariffRates);
        return NextResponse.json({
          success: true,
          data: billForecast
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid type. Use: forecast, peak_hours, maintenance, bill_forecast' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error generating predictions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate predictions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, historicalData } = body;
    
    if (!deviceId || !historicalData) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: deviceId, historicalData' },
        { status: 400 }
      );
    }
    
    const predictiveAnalytics = getPredictiveAnalytics();
    const model = await predictiveAnalytics.trainModel(deviceId, historicalData);
    
    return NextResponse.json({
      success: true,
      data: model
    });
  } catch (error) {
    console.error('Error training model:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to train model' },
      { status: 500 }
    );
  }
}
