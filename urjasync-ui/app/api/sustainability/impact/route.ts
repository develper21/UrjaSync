import { NextRequest, NextResponse } from 'next/server';
import { getEnvironmentalImpact as getEnvironmentalImpactService } from '@/lib/sustainability/environmental-impact';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const impactId = searchParams.get('impactId');
    const period = searchParams.get('period');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');
    
    const environmentalImpact = getEnvironmentalImpactService();
    
    switch (type) {
      case 'categories':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'Missing userId for categories breakdown' },
            { status: 400 }
          );
        }
        
        const latestImpact = (environmentalImpact as any).getUserEnvironmentalImpacts(userId, {
          period: startDate && endDate ? {
            startDate: new Date(startDate),
            endDate: new Date(endDate)
          } : {
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date()
          }
        });
        
        if (latestImpact.length === 0) {
          return NextResponse.json({
            success: true,
            data: []
          });
        }
        
        const categoriesBreakdown = latestImpact[latestImpact.length - 1].categories.map((category: any) => ({
          name: category.name,
          score: category.score,
          weight: category.weight,
          impact: category.impact,
          trend: category.trend,
          factors: category.factors
        }));
        
        return NextResponse.json({
          success: true,
          data: categoriesBreakdown
        });
        
      case 'comparisons':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'Missing userId for comparisons' },
            { status: 400 }
          );
        }
        
        const latestImpactData = (environmentalImpact as any).getUserEnvironmentalImpacts(userId, {
          period: startDate && endDate ? {
            startDate: new Date(startDate),
            endDate: new Date(endDate)
          } : {
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date()
          }
        });
        
        if (latestImpactData.length === 0) {
          return NextResponse.json({
            success: true,
            data: []
          });
        }
        
        const comparisonsBreakdown = latestImpactData[latestImpactData.length - 1].comparisons.map((comparison: any) => ({
          type: comparison.type,
          entity: comparison.entity,
          score: comparison.score,
          ranking: comparison.ranking,
          percentile: comparison.percentile
        }));
        
        return NextResponse.json({
          success: true,
          data: comparisonsBreakdown
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
        
        const trendsData = (environmentalImpact as any).getUserEnvironmentalImpacts(userId, { period: trendsPeriod });
        const trends = trendsData.flatMap((impact: any) => impact.trends);
        
        return NextResponse.json({
          success: true,
          data: trends
        });
        
      case 'recommendations':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'Missing userId for recommendations' },
            { status: 400 }
          );
        }
        
        const recommendationsImpactData = (environmentalImpact as any).getUserEnvironmentalImpacts(userId, {
          period: startDate && endDate ? {
            startDate: new Date(startDate),
            endDate: new Date(endDate)
          } : {
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date()
          }
        });
        
        if (recommendationsImpactData.length === 0) {
          return NextResponse.json({
            success: true,
            data: []
          });
        }
        
        const recommendations = recommendationsImpactData[recommendationsImpactData.length - 1].recommendations.map((rec: any) => ({
          id: rec.id,
          priority: rec.priority,
          category: rec.category,
          title: rec.title,
          description: rec.description,
          potentialImpact: rec.potentialImpact,
          effort: rec.effort,
          cost: rec.cost,
          timeline: rec.timeline,
          implemented: rec.implemented
        }));
        
        return NextResponse.json({
          success: true,
          data: recommendations
        });
        
      case 'certifications':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'Missing userId for certifications' },
            { status: 400 }
          );
        }
        
        const certifications = await (environmentalImpact as any).getUserCertifications(userId);
        const certificationData = certifications.map((cert: any) => ({
          id: cert.id,
          name: cert.name,
          issuer: cert.issuer,
          level: cert.level,
          score: cert.score,
          validFrom: cert.validFrom,
          validUntil: cert.validUntil,
          criteria: cert.criteria
        }));
        
        return NextResponse.json({
          success: true,
          data: certificationData
        });
        
      case 'score_history':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'Missing userId for score history' },
            { status: 400 }
          );
        }
        
        const scoreHistoryPeriod = startDate && endDate ? {
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        } : {
          startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
          endDate: new Date()
        };
        
        const scoreHistoryImpacts = (environmentalImpact as any).getUserEnvironmentalImpacts(userId, { period: scoreHistoryPeriod });
        const scoreHistory = scoreHistoryImpacts.map((impact: any) => ({
          period: impact.period.startDate.toISOString().split('T')[0],
          overallScore: impact.overallScore,
          categories: impact.categories.map((cat: any) => ({
            name: cat.name,
            score: cat.score
          }))
        }));
        
        return NextResponse.json({
          success: true,
          data: scoreHistory
        });
        
      default:
        if (impactId) {
          // Get specific environmental impact assessment
          const impact = (environmentalImpact as any).getEnvironmentalImpact(impactId);
          if (!impact) {
            return NextResponse.json(
              { success: false, error: 'Environmental impact assessment not found' },
              { status: 404 }
            );
          }
          return NextResponse.json({
            success: true,
            data: impact
          });
        }
        
        if (userId) {
          // Get user environmental impacts with filters
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
          
          const userImpactData = (environmentalImpact as any).getUserEnvironmentalImpacts(userId, filters);
          return NextResponse.json({
            success: true,
            data: userImpactData,
            count: userImpactData.length
          });
        }
        
        return NextResponse.json(
          { success: false, error: 'Missing impactId or userId' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching environmental impact data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch environmental impact data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, impactData, userId, impactId, updates, certificationType, certificationData } = body;
    
    const environmentalImpact = getEnvironmentalImpactService();
    
    switch (action) {
      case 'assess_impact':
        if (!userId || !impactData || !impactData.period || !impactData.metricsData) {
          return NextResponse.json(
            { success: false, error: 'Missing userId, impactData, period, or metricsData' },
            { status: 400 }
          );
        }
        
        const impactAssessment = await (environmentalImpact as any).assessEnvironmentalImpact(
          userId,
          impactData.period,
          impactData.metricsData
        );
        
        return NextResponse.json({
          success: true,
          data: impactAssessment,
          message: 'Environmental impact assessed successfully'
        });
        
      case 'update_impact':
        if (!impactId || !updates) {
          return NextResponse.json(
            { success: false, error: 'Missing impactId or updates' },
            { status: 400 }
          );
        }
        
        const updatedImpact = await (environmentalImpact as any).updateEnvironmentalImpact(impactId, updates);
        return NextResponse.json({
          success: true,
          data: updatedImpact,
          message: 'Environmental impact updated successfully'
        });
        
      case 'apply_certification':
        if (!userId || !certificationType) {
          return NextResponse.json(
            { success: false, error: 'Missing userId or certificationType' },
            { status: 400 }
          );
        }
        
        const certification = await (environmentalImpact as any).applyForCertification(userId, certificationType, certificationData);
        return NextResponse.json({
          success: true,
          data: certification,
          message: 'Certification application submitted successfully'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: assess_impact, update_impact, apply_certification' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error managing environmental impact data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to manage environmental impact data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { impactId, updates } = body;
    
    if (!impactId || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing impactId or updates' },
        { status: 400 }
      );
    }
    
    const environmentalImpact = getEnvironmentalImpactService();
    const updatedImpact = await (environmentalImpact as any).updateEnvironmentalImpact(impactId, updates);
    
    return NextResponse.json({
      success: true,
      data: updatedImpact,
      message: 'Environmental impact updated successfully'
    });
  } catch (error) {
    console.error('Error updating environmental impact:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update environmental impact' },
      { status: 500 }
    );
  }
}
