import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { appliances } from '@/lib/db/schema';
import { authenticateRequest } from '@/lib/auth/helpers';

// Validation schemas
const createDeviceSchema = z.object({
  name: z.string().min(1, 'Device name is required').max(255),
  type: z.enum(['AC', 'Washer', 'Light', 'Geyser', 'Refrigerator', 'TV', 'Fan', 'Other']),
  consumption: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid consumption format').optional(),
  schedule: z.object({
    onTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    offTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    days: z.array(z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])),
  }).optional(),
  metadata: z.record(z.any()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = await authenticateRequest(request);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    let devices;
    
    if (status && type) {
      devices = await db
        .select()
        .from(appliances)
        .where(and(eq(appliances.userId, userId), eq(appliances.status, status as any), eq(appliances.type, type as any)));
    } else if (status) {
      devices = await db
        .select()
        .from(appliances)
        .where(and(eq(appliances.userId, userId), eq(appliances.status, status as any)));
    } else if (type) {
      devices = await db
        .select()
        .from(appliances)
        .where(and(eq(appliances.userId, userId), eq(appliances.type, type as any)));
    } else {
      devices = await db
        .select()
        .from(appliances)
        .where(eq(appliances.userId, userId));
    }

    return NextResponse.json({
      success: true,
      data: { devices },
    });
  } catch (error) {
    console.error('Get devices error:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: { message: error.message } },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await authenticateRequest(request);

    const body = await request.json();
    const validatedData = createDeviceSchema.parse(body);

    const [newDevice] = await db
      .insert(appliances)
      .values({
        userId,
        name: validatedData.name,
        type: validatedData.type,
        consumption: validatedData.consumption || '0',
        status: 'Off',
        schedule: validatedData.schedule || {},
        metadata: validatedData.metadata || {},
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Device created successfully',
      data: { device: newDevice },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: error.errors[0].message } },
        { status: 400 }
      );
    }
    
    console.error('Create device error:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: { message: error.message } },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
