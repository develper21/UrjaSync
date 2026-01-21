import { NextRequest, NextResponse } from 'next/server';
import { getBillingAnalytics as getBillingAnalyticsService } from '../../../../lib/billing/billing-analytics';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');
    const forecastPeriods = parseInt(searchParams.get('forecastPeriods') || '12');
    
    const billingAnalytics = getBillingAnalyticsService();
    
    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Missing startDate or endDate' },
        { status: 400 }
      );
    }
    
    const period = {
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    };
    
    switch (type) {
      case 'billing':
        const billingAnalyticsData = await billingAnalytics.getBillingAnalytics(period);
        return NextResponse.json({
          success: true,
          data: billingAnalyticsData
        });
        
      case 'revenue':
        const revenueAnalytics = await billingAnalytics.getRevenueAnalytics(period);
        return NextResponse.json({
          success: true,
          data: revenueAnalytics
        });
        
      case 'payments':
        const paymentAnalytics = await billingAnalytics.getPaymentAnalytics(period);
        return NextResponse.json({
          success: true,
          data: paymentAnalytics
        });
        
      case 'subscriptions':
        const subscriptionAnalytics = await billingAnalytics.getSubscriptionAnalytics(period);
        return NextResponse.json({
          success: true,
          data: subscriptionAnalytics
        });
        
      case 'customers':
        const customerAnalytics = await billingAnalytics.getCustomerAnalytics(period);
        return NextResponse.json({
          success: true,
          data: customerAnalytics
        });
        
      case 'performance':
        const performanceAnalytics = await billingAnalytics.getBillingPerformance(period);
        return NextResponse.json({
          success: true,
          data: performanceAnalytics
        });
        
      case 'forecast':
        const forecast = await billingAnalytics.generateBillingForecast(period, forecastPeriods);
        return NextResponse.json({
          success: true,
          data: forecast
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid type. Use: billing, revenue, payments, subscriptions, customers, performance, forecast' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching billing analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch billing analytics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, startDate, endDate, forecastPeriods } = body;
    
    const billingAnalytics = getBillingAnalyticsService();
    
    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Missing startDate or endDate' },
        { status: 400 }
      );
    }
    
    const period = {
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    };
    
    switch (action) {
      case 'generate_comprehensive_report':
        const comprehensiveReport = {
          billing: await billingAnalytics.getBillingAnalytics(period),
          revenue: await billingAnalytics.getRevenueAnalytics(period),
          payments: await billingAnalytics.getPaymentAnalytics(period),
          subscriptions: await billingAnalytics.getSubscriptionAnalytics(period),
          customers: await billingAnalytics.getCustomerAnalytics(period),
          performance: await billingAnalytics.getBillingPerformance(period),
          generatedAt: new Date(),
          period
        };
        
        return NextResponse.json({
          success: true,
          data: comprehensiveReport,
          message: 'Comprehensive billing report generated successfully'
        });
        
      case 'generate_forecast':
        const periods = forecastPeriods || 12;
        const billingForecast = await billingAnalytics.generateBillingForecast(period, periods);
        
        return NextResponse.json({
          success: true,
          data: billingForecast,
          message: 'Billing forecast generated successfully'
        });
        
      case 'export_analytics':
        const exportType = body.exportType || 'json';
        const analyticsData = {
          billing: await billingAnalytics.getBillingAnalytics(period),
          revenue: await billingAnalytics.getRevenueAnalytics(period),
          payments: await billingAnalytics.getPaymentAnalytics(period),
          subscriptions: await billingAnalytics.getSubscriptionAnalytics(period),
          customers: await billingAnalytics.getCustomerAnalytics(period),
          performance: await billingAnalytics.getBillingPerformance(period),
          exportedAt: new Date(),
          exportType,
          period
        };
        
        return NextResponse.json({
          success: true,
          data: analyticsData,
          message: `Analytics exported as ${exportType}`
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: generate_comprehensive_report, generate_forecast, export_analytics' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error generating billing analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate billing analytics' },
      { status: 500 }
    );
  }
}
