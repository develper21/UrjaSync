import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: {
        status: 'connected',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'WebSocket error' },
      { status: 500 }
    );
  }
}
