import { NextRequest, NextResponse } from 'next/server';
import { getFailurePredictionEngine } from '../../../../lib/maintenance/failure-prediction';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const threshold = searchParams.get('threshold');
    const action = searchParams.get('action');
    
    const predictionEngine = getFailurePredictionEngine();
    
    switch (action) {
      case 'summary':
        const summary = await predictionEngine.getPredictionSummary();
        return NextResponse.json({
          success: true,
          data: summary
        });
        
      case 'device':
        if (!deviceId) {
          return NextResponse.json(
            { success: false, error: 'Device ID is required for device prediction' },
            { status: 400 }
          );
        }
        
        const devicePrediction = await predictionEngine.getPrediction(deviceId);
        if (!devicePrediction) {
          return NextResponse.json(
            { success: false, error: 'No prediction found for device' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: devicePrediction
        });
        
      case 'high-risk':
        const riskThreshold = threshold ? parseInt(threshold) : 70;
        const highRiskPredictions = await predictionEngine.getHighRiskPredictions(riskThreshold);
        return NextResponse.json({
          success: true,
          data: highRiskPredictions
        });
        
      default:
        // Get all predictions if no specific action
        const allPredictions = await predictionEngine.getAllPredictions();
        return NextResponse.json({
          success: true,
          data: allPredictions
        });
    }
  } catch (error) {
    console.error('Error fetching failure predictions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch failure predictions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, deviceId, deviceType, metrics, modelName, accuracy, trainingDataSize, failureData } = body;
    
    const predictionEngine = getFailurePredictionEngine();
    
    switch (action) {
      case 'predict':
        if (!deviceId || !deviceType || !metrics) {
          return NextResponse.json(
            { success: false, error: 'Device ID, device type, and metrics are required for prediction' },
            { status: 400 }
          );
        }
        
        const prediction = await predictionEngine.predictFailure(deviceId, deviceType, metrics);
        return NextResponse.json({
          success: true,
          data: prediction,
          message: 'Failure prediction generated successfully'
        });
        
      case 'update-model':
        if (!modelName || accuracy === undefined || trainingDataSize === undefined) {
          return NextResponse.json(
            { success: false, error: 'Model name, accuracy, and training data size are required for model update' },
            { status: 400 }
          );
        }
        
        await predictionEngine.updateModel(modelName, accuracy, trainingDataSize);
        return NextResponse.json({
          success: true,
          message: 'Model updated successfully'
        });
        
      case 'add-failure-data':
        if (!failureData) {
          return NextResponse.json(
            { success: false, error: 'Failure data is required' },
            { status: 400 }
          );
        }
        
        await predictionEngine.addHistoricalFailureData(failureData);
        return NextResponse.json({
          success: true,
          message: 'Historical failure data added successfully'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: predict, update-model, add-failure-data' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing failure prediction request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process prediction request' },
      { status: 500 }
    );
  }
}
