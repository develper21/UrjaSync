import { NextRequest, NextResponse } from 'next/server';
import { getGreenEnergyTracker } from '../../../../lib/sustainability/green-energy-tracker';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const dataId = searchParams.get('dataId');
    const period = searchParams.get('period');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');
    
    const greenEnergyTracker = getGreenEnergyTracker();
    
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
        
        const analytics = await greenEnergyTracker.getGreenEnergyAnalytics(userId, analyticsPeriod || {
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
        
        const data = greenEnergyTracker.getUserGreenEnergyData(userId, { period: trendsPeriod });
        const trendData = data.map(d => ({
          period: d.period.startDate.toISOString().split('T')[0],
          totalEnergyConsumption: d.totalEnergyConsumption,
          greenEnergyConsumption: d.greenEnergyConsumption,
          greenEnergyPercentage: d.greenEnergyPercentage,
          co2Offset: d.savings.co2Offset,
          monetarySavings: d.savings.monetarySavings
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
        
        const sourcesData = greenEnergyTracker.getUserGreenEnergyData(userId, {
          period: startDate && endDate ? {
            startDate: new Date(startDate),
            endDate: new Date(endDate)
          } : {
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date()
          }
        });
        
        if (sourcesData.length === 0) {
          return NextResponse.json({
            success: true,
            data: []
          });
        }
        
        const sourcesBreakdown = sourcesData[sourcesData.length - 1].sources;
        return NextResponse.json({
          success: true,
          data: sourcesBreakdown.map((source: any) => ({
            type: source.type,
            amount: source.amount,
            percentage: source.percentage,
            co2Offset: source.co2Offset,
            source: source.source
          }))
        });
        
      case 'certificates':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'Missing userId for certificates' },
            { status: 400 }
          );
        }
        
        const certificates = greenEnergyTracker.getCertificates(userId);
        const certificateData = certificates.map(cert => ({
          id: cert.id,
          type: cert.type,
          source: cert.source,
          amount: cert.amount,
          period: cert.period,
          certificateId: cert.certificateId,
          verifiedAt: cert.verifiedAt,
          expiresAt: cert.expiresAt
        }));
        
        return NextResponse.json({
          success: true,
          data: certificateData
        });
        
      case 'savings':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'Missing userId for savings data' },
            { status: 400 }
          );
        }
        
        const savingsData = greenEnergyTracker.getUserGreenEnergyData(userId, {
          period: startDate && endDate ? {
            startDate: new Date(startDate),
            endDate: new Date(endDate)
          } : {
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date()
          }
        });
        
        if (savingsData.length === 0) {
          return NextResponse.json({
            success: true,
            data: {
              totalSavings: { co2Offset: 0, monetarySavings: 0, treesEquivalent: 0, carsOffRoad: 0 }
            }
          });
        }
        
        const totalSavings = savingsData.reduce((acc: any, d: any) => ({
          co2Offset: acc.co2Offset + d.savings.co2Offset,
          monetarySavings: acc.monetarySavings + d.savings.monetarySavings,
          treesEquivalent: acc.treesEquivalent + d.savings.treesEquivalent,
          carsOffRoad: acc.carsOffRoad + d.savings.carsOffRoad
        }), { co2Offset: 0, monetarySavings: 0, treesEquivalent: 0, carsOffRoad: 0 });
        
        return NextResponse.json({
          success: true,
          data: totalSavings
        });
        
      case 'potential':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'Missing userId for potential analysis' },
            { status: 400 }
          );
        }
        
        const potential = await greenEnergyTracker.calculateGreenEnergyPotential(userId);
        return NextResponse.json({
          success: true,
          data: potential
        });
        
      default:
        if (dataId) {
          // Get specific green energy data
          const data = greenEnergyTracker.getGreenEnergyData(dataId);
          if (!data) {
            return NextResponse.json(
              { success: false, error: 'Green energy data not found' },
              { status: 404 }
            );
          }
          return NextResponse.json({
            success: true,
            data
          });
        }
        
        if (userId) {
          // Get user green energy data with filters
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
          
          const userData = greenEnergyTracker.getUserGreenEnergyData(userId, filters);
          return NextResponse.json({
            success: true,
            data: userData,
            count: userData.length
          });
        }
        
        return NextResponse.json(
          { success: false, error: 'Missing dataId or userId' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching green energy data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch green energy data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, energyData, userId, dataId, updates, certificateData, sourceData } = body;
    
    const greenEnergyTracker = getGreenEnergyTracker();
    
    switch (action) {
      case 'track_consumption':
        if (!userId || !energyData || !energyData.period) {
          return NextResponse.json(
            { success: false, error: 'Missing userId, energyData, or period' },
            { status: 400 }
          );
        }
        
        const data = await greenEnergyTracker.trackGreenEnergyConsumption(
          userId,
          energyData.period,
          energyData
        );
        
        return NextResponse.json({
          success: true,
          data,
          message: 'Green energy consumption tracked successfully'
        });
        
      case 'update_data':
        if (!dataId || !updates) {
          return NextResponse.json(
            { success: false, error: 'Missing dataId or updates' },
            { status: 400 }
          );
        }
        
        const updatedData = await greenEnergyTracker.updateGreenEnergyData(dataId, updates);
        return NextResponse.json({
          success: true,
          data: updatedData,
          message: 'Green energy data updated successfully'
        });
        
      case 'add_certificate':
        if (!certificateData) {
          return NextResponse.json(
            { success: false, error: 'Missing certificate data' },
            { status: 400 }
          );
        }
        
        const certificate = await greenEnergyTracker.addRenewableEnergyCertificate(certificateData);
        return NextResponse.json({
          success: true,
          data: certificate,
          message: 'Renewable energy certificate added successfully'
        });
        
      case 'verify_certificate':
        if (!certificateData || !certificateData.certificateId) {
          return NextResponse.json(
            { success: false, error: 'Missing certificateId or verification data' },
            { status: 400 }
          );
        }
        
        const verifiedCertificate = await greenEnergyTracker.verifyCertificate(certificateData.certificateId);
        return NextResponse.json({
          success: true,
          data: verifiedCertificate,
          message: 'Certificate verified successfully'
        });
        
      case 'add_source':
        if (!sourceData) {
          return NextResponse.json(
            { success: false, error: 'Missing source data' },
            { status: 400 }
          );
        }
        
        const source = await greenEnergyTracker.addGreenEnergySource(sourceData);
        return NextResponse.json({
          success: true,
          data: source,
          message: 'Green energy source added successfully'
        });
        
      case 'update_source':
        if (!sourceData || !sourceData.id) {
          return NextResponse.json(
            { success: false, error: 'Missing source data or sourceId' },
            { status: 400 }
          );
        }
        
        const updatedSource = await greenEnergyTracker.updateEnergySource(sourceData.id, sourceData);
        return NextResponse.json({
          success: true,
          data: updatedSource,
          message: 'Green energy source updated successfully'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: track_consumption, update_data, add_certificate, verify_certificate, add_source, update_source' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error managing green energy data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to manage green energy data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { dataId, updates } = body;
    
    if (!dataId || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing dataId or updates' },
        { status: 400 }
      );
    }
    
    const greenEnergyTracker = getGreenEnergyTracker();
    const updatedData = await greenEnergyTracker.updateGreenEnergyData(dataId, updates);
    
    return NextResponse.json({
      success: true,
      data: updatedData,
      message: 'Green energy data updated successfully'
    });
  } catch (error) {
    console.error('Error updating green energy data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update green energy data' },
      { status: 500 }
    );
  }
}
