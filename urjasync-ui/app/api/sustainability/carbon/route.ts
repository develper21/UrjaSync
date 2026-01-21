import { NextRequest, NextResponse } from 'next/server';
import { getCarbonTracker } from '@/lib/sustainability/carbon-tracker';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const footprintId = searchParams.get('footprintId');
    const period = searchParams.get('period');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');
    
    const carbonTracker = getCarbonTracker();
    
    switch (type) {
      case 'analytics':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'Missing userId for analytics' },
            { status: 400 }
          );
        }
        
        const analyticsPeriod = startDate && endDate ? {
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        } : period === 'monthly' ? {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date()
        } : period === 'yearly' ? {
          startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          endDate: new Date()
        } : undefined;
        
        const analytics = await carbonTracker.getCarbonAnalytics(userId, analyticsPeriod || {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date()
        });
        return NextResponse.json({
          success: true,
          data: analytics
        });
        
      case 'trends':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'Missing userId for trends' },
            { status: 400 }
          );
        }
        
        const trendsPeriod = startDate && endDate ? {
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        } : {
          startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          endDate: new Date()
        };
        
        const trends = carbonTracker.getUserCarbonFootprints(userId, { period: trendsPeriod });
        const trendData = trends.map(fp => ({
          period: fp.period.startDate.toISOString().split('T')[0],
          totalEmissions: fp.totalEmissions,
          emissionsBySource: fp.emissionsBySource,
          percentageChange: fp.baselineComparison.percentageChange,
          trend: fp.baselineComparison.trend
        }));
        
        return NextResponse.json({
          success: true,
          data: trendData
        });
        
      case 'sources':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'Missing userId for sources breakdown' },
            { status: 400 }
          );
        }
        
        const sourcesFootprint = carbonTracker.getUserCarbonFootprints(userId, {
          period: startDate && endDate ? {
            startDate: new Date(startDate),
            endDate: new Date(endDate)
          } : {
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date()
          }
        });
        
        if (sourcesFootprint.length === 0) {
          return NextResponse.json({
            success: true,
            data: []
          });
        }
        
        const sourcesBreakdown = sourcesFootprint[sourcesFootprint.length - 1].emissionsBySource;
        return NextResponse.json({
          success: true,
          data: Object.entries(sourcesBreakdown).map(([source, amount]) => ({
            source,
            amount,
            percentage: (amount / sourcesFootprint[sourcesFootprint.length - 1].totalEmissions) * 100
          }))
        });
        
      case 'categories':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'Missing userId for categories breakdown' },
            { status: 400 }
          );
        }
        
        const categoriesFootprint = carbonTracker.getUserCarbonFootprints(userId, {
          period: startDate && endDate ? {
            startDate: new Date(startDate),
            endDate: new Date(endDate)
          } : {
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date()
          }
        });
        
        if (categoriesFootprint.length === 0) {
          return NextResponse.json({
            success: true,
            data: []
          });
        }
        
        const categoriesBreakdown = categoriesFootprint[categoriesFootprint.length - 1].emissionsByCategory;
        return NextResponse.json({
          success: true,
          data: Object.entries(categoriesBreakdown).map(([category, amount]) => ({
            category,
            amount,
            percentage: (amount / categoriesFootprint[categoriesFootprint.length - 1].totalEmissions) * 100
          }))
        });
        
      case 'targets':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'Missing userId for reduction targets' },
            { status: 400 }
          );
        }
        
        const targets = await carbonTracker.getReductionTargets(userId);
        return NextResponse.json({
          success: true,
          data: targets
        });
        
      case 'achievements':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'Missing userId for achievements' },
            { status: 400 }
          );
        }
        
        const userFootprints = carbonTracker.getUserCarbonFootprints(userId);
        const achievements = userFootprints.flatMap(fp => fp.achievements);
        
        return NextResponse.json({
          success: true,
          data: achievements
        });
        
      default:
        if (footprintId) {
          // Get specific carbon footprint
          const footprint = carbonTracker.getCarbonFootprint(footprintId);
          if (!footprint) {
            return NextResponse.json(
              { success: false, error: 'Carbon footprint not found' },
              { status: 404 }
            );
          }
          return NextResponse.json({
            success: true,
            data: footprint
          });
        }
        
        if (userId) {
          // Get user carbon footprints with filters
          const filters = {
            period: startDate && endDate ? {
              startDate: new Date(startDate),
              endDate: new Date(endDate)
            } : period === 'monthly' ? {
              startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              endDate: new Date()
            } : period === 'yearly' ? {
              startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
              endDate: new Date()
            } : undefined
          };
          
          const userFootprints = carbonTracker.getUserCarbonFootprints(userId, filters);
          return NextResponse.json({
            success: true,
            data: userFootprints,
            count: userFootprints.length
          });
        }
        
        return NextResponse.json(
          { success: false, error: 'Missing footprintId or userId' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching carbon data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch carbon data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, footprintData, userId, footprintId, updates, targetData } = body;
    
    const carbonTracker = getCarbonTracker();
    
    switch (action) {
      case 'calculate_footprint':
        if (!userId || !footprintData || !footprintData.period) {
          return NextResponse.json(
            { success: false, error: 'Missing userId, footprintData, or period' },
            { status: 400 }
          );
        }
        
        const footprint = await carbonTracker.calculateCarbonFootprint(
          userId,
          footprintData.period,
          footprintData.consumptionData
        );
        
        return NextResponse.json({
          success: true,
          data: footprint,
          message: 'Carbon footprint calculated successfully'
        });
        
      case 'update_footprint':
        if (!footprintId || !updates) {
          return NextResponse.json(
            { success: false, error: 'Missing footprintId or updates' },
            { status: 400 }
          );
        }
        
        const updatedFootprint = await carbonTracker.updateCarbonFootprint(footprintId, updates);
        return NextResponse.json({
          success: true,
          data: updatedFootprint,
          message: 'Carbon footprint updated successfully'
        });
        
      case 'create_target':
        if (!userId || !targetData) {
          return NextResponse.json(
            { success: false, error: 'Missing userId or targetData' },
            { status: 400 }
          );
        }
        
        const target = await carbonTracker.createReductionTarget(userId, targetData);
        return NextResponse.json({
          success: true,
          data: target,
          message: 'Reduction target created successfully'
        });
        
      case 'update_target':
        if (!targetData || !targetData.id) {
          return NextResponse.json(
            { success: false, error: 'Missing targetData or targetId' },
            { status: 400 }
          );
        }
        
        const updatedTarget = await carbonTracker.updateReductionTarget(targetData.id, targetData);
        return NextResponse.json({
          success: true,
          data: updatedTarget,
          message: 'Reduction target updated successfully'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: calculate_footprint, update_footprint, create_target, update_target' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error managing carbon data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to manage carbon data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { footprintId, updates } = body;
    
    if (!footprintId || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing footprintId or updates' },
        { status: 400 }
      );
    }
    
    const carbonTracker = getCarbonTracker();
    const updatedFootprint = await carbonTracker.updateCarbonFootprint(footprintId, updates);
    
    return NextResponse.json({
      success: true,
      data: updatedFootprint,
      message: 'Carbon footprint updated successfully'
    });
  } catch (error) {
    console.error('Error updating carbon footprint:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update carbon footprint' },
      { status: 500 }
    );
  }
}
