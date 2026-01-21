import { NextRequest, NextResponse } from 'next/server';
import { getWebSocketManager } from '@/lib/realtime/websocket-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const connectionId = searchParams.get('connectionId');
    const channelId = searchParams.get('channelId');
    
    const wsManager = getWebSocketManager();
    
    // Get data once to avoid multiple calls
    const [stats, connections, channels] = await Promise.all([
      wsManager.getStats(),
      wsManager.getConnections(),
      wsManager.getChannels()
    ]);
    
    switch (action) {
      case 'stats':
        return NextResponse.json({
          success: true,
          data: stats
        });
        
      case 'connections':
        return NextResponse.json({
          success: true,
          data: connections
        });
        
      case 'connection':
        if (!connectionId) {
          return NextResponse.json(
            { success: false, error: 'Connection ID is required' },
            { status: 400 }
          );
        }
        
        const connection = connections.find(conn => conn.id === connectionId);
        if (!connection) {
          return NextResponse.json(
            { success: false, error: 'Connection not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: connection
        });
        
      case 'channels':
        return NextResponse.json({
          success: true,
          data: channels
        });
        
      case 'channel':
        if (!channelId) {
          return NextResponse.json(
            { success: false, error: 'Channel ID is required' },
            { status: 400 }
          );
        }
        
        const channel = channels.find(ch => ch.id === channelId);
        if (!channel) {
          return NextResponse.json(
            { success: false, error: 'Channel not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: channel
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: stats, connections, connection, channels, channel' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching WebSocket data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch WebSocket data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, channelId, message, userId, priority } = body;
    
    const wsManager = getWebSocketManager();
    
    switch (action) {
      case 'broadcast':
        if (!channelId || !message) {
          return NextResponse.json(
            { success: false, error: 'Channel ID and message are required' },
            { status: 400 }
          );
        }
        
        await wsManager.broadcast(channelId, message, priority);
        return NextResponse.json({
          success: true,
          message: 'Message broadcasted successfully'
        });
        
      case 'send-to-user':
        if (!userId || !message) {
          return NextResponse.json(
            { success: false, error: 'User ID and message are required' },
            { status: 400 }
          );
        }
        
        await wsManager.sendToUser(userId, message, channelId);
        return NextResponse.json({
          success: true,
          message: 'Message sent to user successfully'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: broadcast, send-to-user' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing WebSocket request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process WebSocket request' },
      { status: 500 }
    );
  }
}
