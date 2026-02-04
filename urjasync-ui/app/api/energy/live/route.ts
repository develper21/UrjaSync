import { NextRequest, NextResponse } from 'next/server';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { energyUsage, appliances } from '@/lib/db/schema';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { message: 'User ID required' } },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');

    // Get current power usage (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    let liveData;

    if (deviceId) {
      // Get specific device live data
      liveData = await db
        .select({
          id: energyUsage.id,
          usage: energyUsage.usage,
          cost: energyUsage.cost,
          timestamp: energyUsage.timestamp,
          tariffType: energyUsage.tariffType,
          deviceName: appliances.name,
          deviceType: appliances.type,
          deviceStatus: appliances.status,
        })
        .from(energyUsage)
        .leftJoin(appliances, eq(energyUsage.applianceId, appliances.id))
        .where(and(
          eq(energyUsage.userId, userId),
          eq(energyUsage.applianceId, deviceId),
          desc(energyUsage.timestamp)
        ))
        .limit(1);
    } else {
      // Get all devices live data
      liveData = await db
        .select({
          id: energyUsage.id,
          usage: energyUsage.usage,
          cost: energyUsage.cost,
          timestamp: energyUsage.timestamp,
          tariffType: energyUsage.tariffType,
          applianceId: energyUsage.applianceId,
          deviceName: appliances.name,
          deviceType: appliances.type,
          deviceStatus: appliances.status,
        })
        .from(energyUsage)
        .leftJoin(appliances, eq(energyUsage.applianceId, appliances.id))
        .where(and(
          eq(energyUsage.userId, userId),
          desc(energyUsage.timestamp)
        ))
        .limit(10);
    }

    // Get all active devices
    const activeDevices = await db
      .select({
        id: appliances.id,
        name: appliances.name,
        type: appliances.type,
        status: appliances.status,
        consumption: appliances.consumption,
      })
      .from(appliances)
      .where(and(eq(appliances.userId, userId), eq(appliances.status, 'On')));

    // Calculate total current consumption
    const totalConsumption = activeDevices.reduce((sum, device) => 
      sum + parseFloat(device.consumption || '0'), 0
    );

    // Get today's usage summary
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayUsage = await db
      .select({
        usage: energyUsage.usage,
        cost: energyUsage.cost,
      })
      .from(energyUsage)
      .where(and(
        eq(energyUsage.userId, userId),
        desc(energyUsage.timestamp)
      ))
      .limit(100); // Get recent records for today's summary

    const todayTotalUsage = todayUsage.reduce((sum, record) => 
      sum + parseFloat(record.usage || '0'), 0
    );
    const todayTotalCost = todayUsage.reduce((sum, record) => 
      sum + parseFloat(record.cost || '0'), 0
    );

    return NextResponse.json({
      success: true,
      data: {
        liveData: liveData || [],
        activeDevices,
        summary: {
          currentConsumption: totalConsumption.toString(),
          todayUsage: todayTotalUsage.toString(),
          todayCost: todayTotalCost.toString(),
          activeDeviceCount: activeDevices.length,
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Get live energy data error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
