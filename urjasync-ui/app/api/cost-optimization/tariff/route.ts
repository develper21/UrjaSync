import { NextRequest, NextResponse } from 'next/server';
import { getTariffIntelligence } from '../../../../lib/cost-optimization/tariff-intelligence';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const monthlyUsage = parseFloat(searchParams.get('usage') || '300');
    const peakUsagePercentage = parseFloat(searchParams.get('peakUsage') || '30');
    
    const tariffIntelligence = getTariffIntelligence();
    
    switch (type) {
      case 'current':
        const currentTariff = tariffIntelligence.getCurrentTariff();
        return NextResponse.json({
          success: true,
          data: currentTariff
        });
        
      case 'comparison':
        const comparison = tariffIntelligence.compareTariffPlans(monthlyUsage, peakUsagePercentage);
        return NextResponse.json({
          success: true,
          data: comparison
        });
        
      case 'history':
        const hours = parseInt(searchParams.get('hours') || '24');
        const history = tariffIntelligence.getTariffHistory(hours);
        return NextResponse.json({
          success: true,
          data: history
        });
        
      case 'schedule':
        const tasks = JSON.parse(searchParams.get('tasks') || '[]');
        const schedule = tariffIntelligence.getOptimalUsageSchedule(tasks);
        return NextResponse.json({
          success: true,
          data: schedule
        });
        
      default:
        const currentPlan = tariffIntelligence.getCurrentTariffPlan();
        const availablePlans = tariffIntelligence.getAvailablePlans();
        return NextResponse.json({
          success: true,
          data: {
            currentPlan,
            availablePlans
          }
        });
    }
  } catch (error) {
    console.error('Error in tariff endpoint:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process tariff request' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, plan } = body;
    
    const tariffIntelligence = getTariffIntelligence();
    
    switch (action) {
      case 'set_plan':
        if (!plan) {
          return NextResponse.json(
            { success: false, error: 'Missing plan data' },
            { status: 400 }
          );
        }
        tariffIntelligence.setCurrentTariffPlan(plan);
        return NextResponse.json({
          success: true,
          message: 'Tariff plan updated successfully'
        });
        
      case 'add_plan':
        if (!plan) {
          return NextResponse.json(
            { success: false, error: 'Missing plan data' },
            { status: 400 }
          );
        }
        tariffIntelligence.addAvailablePlan(plan);
        return NextResponse.json({
          success: true,
          message: 'Tariff plan added successfully'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating tariff:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update tariff' },
      { status: 500 }
    );
  }
}
