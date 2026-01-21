import { NextRequest, NextResponse } from 'next/server';
import { getDataStreamProcessor } from '@/lib/realtime/data-stream-processor';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const processorId = searchParams.get('processorId');
    const pipelineId = searchParams.get('pipelineId');
    const bufferId = searchParams.get('bufferId');
    
    const streamProcessor = getDataStreamProcessor();
    
    switch (action) {
      case 'processors':
        const processors = await streamProcessor.getProcessors();
        return NextResponse.json({
          success: true,
          data: processors
        });
        
      case 'processor':
        if (!processorId) {
          return NextResponse.json(
            { success: false, error: 'Processor ID is required' },
            { status: 400 }
          );
        }
        
        const processor = await streamProcessor.getProcessor(processorId);
        if (!processor) {
          return NextResponse.json(
            { success: false, error: 'Processor not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: processor
        });
        
      case 'pipelines':
        const pipelines = await streamProcessor.getPipelines();
        return NextResponse.json({
          success: true,
          data: pipelines
        });
        
      case 'pipeline':
        if (!pipelineId) {
          return NextResponse.json(
            { success: false, error: 'Pipeline ID is required' },
            { status: 400 }
          );
        }
        
        const pipeline = await streamProcessor.getPipeline(pipelineId);
        if (!pipeline) {
          return NextResponse.json(
            { success: false, error: 'Pipeline not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: pipeline
        });
        
      case 'buffers':
        const buffers = await streamProcessor.getBuffers();
        return NextResponse.json({
          success: true,
          data: buffers
        });
        
      case 'buffer':
        if (!bufferId) {
          return NextResponse.json(
            { success: false, error: 'Buffer ID is required' },
            { status: 400 }
          );
        }
        
        const buffer = await streamProcessor.getBuffer(bufferId);
        if (!buffer) {
          return NextResponse.json(
            { success: false, error: 'Buffer not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: buffer
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: processors, processor, pipelines, pipeline, buffers, buffer' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching stream data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stream data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data, processorData, pipelineData } = body;
    
    const streamProcessor = getDataStreamProcessor();
    
    switch (action) {
      case 'process-data':
        if (!data) {
          return NextResponse.json(
            { success: false, error: 'Data is required' },
            { status: 400 }
          );
        }
        
        const processedData = await streamProcessor.processStreamData(data);
        return NextResponse.json({
          success: true,
          data: processedData,
          message: 'Data processed successfully'
        });
        
      case 'create-processor':
        if (!processorData) {
          return NextResponse.json(
            { success: false, error: 'Processor data is required' },
            { status: 400 }
          );
        }
        
        const processor = await streamProcessor.createProcessor(processorData);
        return NextResponse.json({
          success: true,
          data: processor,
          message: 'Processor created successfully'
        });
        
      case 'create-pipeline':
        if (!pipelineData) {
          return NextResponse.json(
            { success: false, error: 'Pipeline data is required' },
            { status: 400 }
          );
        }
        
        const pipeline = await streamProcessor.createPipeline(pipelineData);
        return NextResponse.json({
          success: true,
          data: pipeline,
          message: 'Pipeline created successfully'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: process-data, create-processor, create-pipeline' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing stream request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process stream request' },
      { status: 500 }
    );
  }
}
