import { NextRequest, NextResponse } from 'next/server';
import { getMLIntegration } from '@/lib/analytics/ml-integration';
import { getAnalyticsDataPipeline } from '@/lib/analytics/data-pipeline';
// import { getUsagePatternAnalyzer } from '@/lib/analytics/pattern-analysis';
// import { getPredictiveAnalytics } from '@/lib/analytics/predictive-analytics';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const deviceId = searchParams.get('deviceId');
    
    switch (action) {
      case 'ml_models':
        const mlIntegration = getMLIntegration();
        if (deviceId) {
          const models = mlIntegration.getDeviceModels(deviceId);
          return NextResponse.json({
            success: true,
            data: models
          });
        } else {
          const allModels = Array.from(mlIntegration['trainedModels'].entries());
          return NextResponse.json({
            success: true,
            data: allModels
          });
        }
        
      case 'pipeline_status':
        const pipeline = getAnalyticsDataPipeline();
        const status = pipeline.getQueueStatus();
        const metrics = pipeline.getMetrics();
        return NextResponse.json({
          success: true,
          data: {
            status,
            metrics
          }
        });
        
      case 'data_quality':
        // Get recent data quality metrics
        // const patternAnalyzer = getUsagePatternAnalyzer();
        // This would typically come from actual data
        const mockQualityMetrics = {
          completeness: 0.95,
          accuracy: 0.92,
          consistency: 0.88,
          timeliness: 0.96,
          validity: 0.94,
          overallScore: 0.93
        };
        return NextResponse.json({
          success: true,
          data: mockQualityMetrics
        });
        
      case 'feature_importance':
        if (!deviceId) {
          return NextResponse.json(
            { success: false, error: 'Device ID required for feature importance' },
            { status: 400 }
          );
        }
        const mlIntegration2 = getMLIntegration();
        const deviceModels = mlIntegration2.getDeviceModels(deviceId);
        const featureImportance = deviceModels.length > 0 ? deviceModels[0].featureImportance : {};
        return NextResponse.json({
          success: true,
          data: {
            deviceId,
            featureImportance
          }
        });
        
      case 'anomaly_scores':
        if (!deviceId) {
          return NextResponse.json(
            { success: false, error: 'Device ID required for anomaly scores' },
            { status: 400 }
          );
        }
        const mlIntegration3 = getMLIntegration();
        // Mock current features for anomaly detection
        const currentFeatures = {
          consumption: 2.5,
          voltage: 230,
          current: 10.9,
          power: 2500,
          hour: new Date().getHours(),
          dayOfWeek: new Date().getDay(),
          temperature: 25,
          humidity: 50
        };
        // Mock historical features
        const historicalFeatures = Array.from({ length: 100 }, (_, i) => ({
          consumption: 2 + Math.random(),
          voltage: 228 + Math.random() * 4,
          current: 9 + Math.random() * 3,
          power: 2200 + Math.random() * 600,
          hour: i % 24,
          dayOfWeek: i % 7,
          temperature: 24 + Math.random() * 2,
          humidity: 48 + Math.random() * 4
        }));
        
        const anomalyScore = mlIntegration3.detectAnomaliesML(deviceId, currentFeatures, historicalFeatures);
        return NextResponse.json({
          success: true,
          data: anomalyScore
        });
        
      case 'ensemble_prediction':
        if (!deviceId) {
          return NextResponse.json(
            { success: false, error: 'Device ID required for ensemble prediction' },
            { status: 400 }
          );
        }
        const mlIntegration4 = getMLIntegration();
        try {
          const ensemblePrediction = await mlIntegration4.ensemblePredict(deviceId, {
            consumption: 2.5,
            voltage: 230,
            current: 10.9,
            power: 2500,
            hour: new Date().getHours(),
            dayOfWeek: new Date().getDay(),
            temperature: 25,
            humidity: 50
          });
          return NextResponse.json({
            success: true,
            data: ensemblePrediction
          });
        } catch (error) {
          return NextResponse.json(
            { success: false, error: 'No trained models available for ensemble prediction' },
            { status: 404 }
          );
        }
        
      default:
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid action. Use: ml_models, pipeline_status, data_quality, feature_importance, anomaly_scores, ensemble_prediction' 
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Enhanced analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process enhanced analytics request' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, deviceId, data } = body;
    
    switch (action) {
      case 'train_model':
        if (!deviceId || !data) {
          return NextResponse.json(
            { success: false, error: 'Device ID and training data required' },
            { status: 400 }
          );
        }
        
        const mlIntegration = getMLIntegration();
        const features = mlIntegration.extractFeatures(deviceId, data);
        
        if (features.length < 10) {
          return NextResponse.json(
            { success: false, error: 'Insufficient data for training (minimum 10 samples required)' },
            { status: 400 }
          );
        }
        
        const modelConfig = {
          algorithm: 'random_forest' as const,
          features: Object.keys(features[0].features),
          hyperparameters: { n_estimators: 100, max_depth: 10 },
          trainingDataSize: features.length,
          validationSplit: 0.2
        };
        
        const trainingResult = await mlIntegration.trainAdvancedModel(deviceId, features, modelConfig);
        return NextResponse.json({
          success: true,
          data: trainingResult
        });
        
      case 'process_batch':
        const pipeline = getAnalyticsDataPipeline();
        const processingResult = await pipeline.forceProcess();
        return NextResponse.json({
          success: true,
          data: processingResult
        });
        
      case 'predict_ml':
        if (!deviceId || !data) {
          return NextResponse.json(
            { success: false, error: 'Device ID and features required for prediction' },
            { status: 400 }
          );
        }
        
        const mlIntegration2 = getMLIntegration();
        try {
          const prediction = await mlIntegration2.predictWithML(deviceId, data);
          return NextResponse.json({
            success: true,
            data: prediction
          });
        } catch (error) {
          return NextResponse.json(
            { success: false, error: 'No trained model available for prediction' },
            { status: 404 }
          );
        }
        
      case 'update_pipeline_config':
        if (!data) {
          return NextResponse.json(
            { success: false, error: 'Configuration data required' },
            { status: 400 }
          );
        }
        
        const pipeline2 = getAnalyticsDataPipeline();
        pipeline2.updateConfig(data);
        return NextResponse.json({
          success: true,
          message: 'Pipeline configuration updated'
        });
        
      default:
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid action. Use: train_model, process_batch, predict_ml, update_pipeline_config' 
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Enhanced analytics POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process enhanced analytics request' },
      { status: 500 }
    );
  }
}
