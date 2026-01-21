import { NextRequest, NextResponse } from 'next/server';
import { getDataIngestionService } from '../../../../lib/data/ingestion';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;
    
    if (!type || !data) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: type, data' },
        { status: 400 }
      );
    }
    
    const ingestionService = getDataIngestionService();
    let result;
    
    switch (type) {
      case 'energy':
        result = await ingestionService.ingestEnergyData(data);
        break;
      case 'device_status':
        result = await ingestionService.ingestDeviceStatus(data);
        break;
      default:
        return NextResponse.json(
          { success: false, error: `Invalid data type: ${type}` },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: result.isValid,
      data: result.sanitizedData,
      errors: result.errors,
      warnings: result.warnings
    });
  } catch (error) {
    console.error('Error in data ingestion:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to ingest data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const ingestionService = getDataIngestionService();
    const { searchParams } = new URL(request.url);
    
    const action = searchParams.get('action');
    
    switch (action) {
      case 'stats':
        const stats = ingestionService.getStats();
        return NextResponse.json({
          success: true,
          data: stats
        });
        
      case 'buffer':
        const bufferStatus = ingestionService.getBufferStatus();
        return NextResponse.json({
          success: true,
          data: bufferStatus
        });
        
      case 'flush':
        await ingestionService.flushBuffers();
        return NextResponse.json({
          success: true,
          message: 'Buffers flushed successfully'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: stats, buffer, flush' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in data ingestion endpoint:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
