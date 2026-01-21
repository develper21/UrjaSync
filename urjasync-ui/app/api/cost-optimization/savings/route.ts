import { NextRequest, NextResponse } from 'next/server';
import { getSavingsCalculator } from '../../../../lib/cost-optimization/savings-calculator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const period = searchParams.get('period') as 'daily' | 'weekly' | 'monthly' | 'yearly' || 'monthly';
    const applianceId = searchParams.get('applianceId');
    
    const savingsCalculator = getSavingsCalculator();
    
    switch (type) {
      case 'analysis':
        const analysis = savingsCalculator.calculateSavingsAnalysis(period);
        return NextResponse.json({
          success: true,
          data: analysis
        });
        
      case 'opportunities':
        const opportunities = savingsCalculator.getSavingsOpportunities();
        return NextResponse.json({
          success: true,
          data: opportunities
        });
        
      case 'comparative':
        const comparative = savingsCalculator.generateComparativeAnalysis();
        return NextResponse.json({
          success: true,
          data: comparative
        });
        
      case 'appliance':
        if (!applianceId) {
          return NextResponse.json(
            { success: false, error: 'Missing applianceId' },
            { status: 400 }
          );
        }
        const appliance = savingsCalculator.getApplianceAnalysis(applianceId);
        if (!appliance) {
          return NextResponse.json(
            { success: false, error: 'Appliance not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({
          success: true,
          data: appliance
        });
        
      case 'usage_history':
        const days = parseInt(searchParams.get('days') || '30');
        const usageHistory = savingsCalculator.getUsageHistory(days);
        return NextResponse.json({
          success: true,
          data: usageHistory
        });
        
      case 'roi':
        const opportunityType = searchParams.get('opportunityType');
        const allOpportunities = savingsCalculator.getSavingsOpportunities();
        const opportunity = allOpportunities.find(o => o.type === opportunityType);
        
        if (!opportunity) {
          return NextResponse.json(
            { success: false, error: 'Opportunity type not found' },
            { status: 404 }
          );
        }
        
        const roi = savingsCalculator.calculateROI(opportunity);
        return NextResponse.json({
          success: true,
          data: roi
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid type. Use: analysis, opportunities, comparative, appliance, usage_history, roi' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in savings endpoint:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process savings request' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, applianceId, usage } = body;
    
    const savingsCalculator = getSavingsCalculator();
    
    switch (action) {
      case 'update_appliance':
        if (!applianceId || !usage) {
          return NextResponse.json(
            { success: false, error: 'Missing applianceId or usage data' },
            { status: 400 }
          );
        }
        
        savingsCalculator.updateApplianceUsage(applianceId, usage);
        return NextResponse.json({
          success: true,
          message: 'Appliance usage updated successfully'
        });
        
      case 'add_usage_data':
        if (!usage) {
          return NextResponse.json(
            { success: false, error: 'Missing usage data' },
            { status: 400 }
          );
        }
        
        savingsCalculator.addUsageData(usage);
        return NextResponse.json({
          success: true,
          message: 'Usage data added successfully'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: update_appliance, add_usage_data' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating savings data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update savings data' },
      { status: 500 }
    );
  }
}
