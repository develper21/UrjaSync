import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthService } from '@/lib/services/authService';

// Validation schemas
const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = refreshTokenSchema.parse(body);

    const tokens = await AuthService.refreshAccessToken(validatedData.refreshToken);

    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        tokens,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: error.errors[0].message } },
        { status: 400 }
      );
    }
    
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Invalid refresh token' } },
      { status: 401 }
    );
  }
}
