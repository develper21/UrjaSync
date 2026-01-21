import { NextRequest, NextResponse } from 'next/server';
import { getEventStreamManager } from '@/lib/realtime/event-stream-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const streamId = searchParams.get('streamId');
    
    const eventManager = getEventStreamManager();
    
    switch (action) {
      case 'streams':
        const streams = await eventManager.getStreams();
        return NextResponse.json({
          success: true,
          data: streams
        });
        
      case 'stream':
        if (!streamId) {
          return NextResponse.json(
            { success: false, error: 'Stream ID is required' },
            { status: 400 }
          );
        }
        
        const stream = await eventManager.getStream(streamId);
        if (!stream) {
          return NextResponse.json(
            { success: false, error: 'Stream not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: stream
        });
        
      case 'events':
        if (!streamId) {
          return NextResponse.json(
            { success: false, error: 'Stream ID is required' },
            { status: 400 }
          );
        }
        
        const events = await eventManager.getEvents(streamId, {
          limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
          offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
          startTime: searchParams.get('startTime') ? new Date(searchParams.get('startTime')!) : undefined,
          endTime: searchParams.get('endTime') ? new Date(searchParams.get('endTime')!) : undefined,
          eventType: searchParams.get('eventType') || undefined
        });
        
        return NextResponse.json({
          success: true,
          data: events
        });
        
      case 'stats':
        const stats = await eventManager.getStats();
        return NextResponse.json({
          success: true,
          data: stats
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: streams, stream, events, stats' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching event data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, streamId, eventData, streamData, consumerData, subscriptionData, projectionData } = body;
    
    const eventManager = getEventStreamManager();
    
    switch (action) {
      case 'publish-event':
        if (!streamId || !eventData) {
          return NextResponse.json(
            { success: false, error: 'Stream ID and event data are required' },
            { status: 400 }
          );
        }
        
        const event = await eventManager.publishEvent(streamId, eventData);
        return NextResponse.json({
          success: true,
          data: event,
          message: 'Event published successfully'
        });
        
      case 'create-stream':
        if (!streamData) {
          return NextResponse.json(
            { success: false, error: 'Stream data is required' },
            { status: 400 }
          );
        }
        
        const stream = await eventManager.createStream(streamData);
        return NextResponse.json({
          success: true,
          data: stream,
          message: 'Stream created successfully'
        });
        
      case 'create-consumer':
        if (!consumerData) {
          return NextResponse.json(
            { success: false, error: 'Consumer data is required' },
            { status: 400 }
          );
        }
        
        const consumer = await eventManager.createConsumer(consumerData);
        return NextResponse.json({
          success: true,
          data: consumer,
          message: 'Consumer created successfully'
        });
        
      case 'create-subscription':
        if (!subscriptionData) {
          return NextResponse.json(
            { success: false, error: 'Subscription data is required' },
            { status: 400 }
          );
        }
        
        const subscription = await eventManager.createSubscription(subscriptionData);
        return NextResponse.json({
          success: true,
          data: subscription,
          message: 'Subscription created successfully'
        });
        
      case 'create-projection':
        if (!projectionData) {
          return NextResponse.json(
            { success: false, error: 'Projection data is required' },
            { status: 400 }
          );
        }
        
        const projection = await eventManager.createProjection(projectionData);
        return NextResponse.json({
          success: true,
          data: projection,
          message: 'Projection created successfully'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: publish-event, create-stream, create-consumer, create-subscription, create-projection' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing event request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process event request' },
      { status: 500 }
    );
  }
}
