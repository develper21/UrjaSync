import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/authService';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie or request body
    const refreshToken = request.cookies.get('refreshToken')?.value || 
                        (await request.json()).refreshToken;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: { message: 'Refresh token required' } },
        { status: 401 }
      );
    }

    // Revoke the refresh token
    await AuthService.revokeRefreshToken(refreshToken);

    // Create response and clear refresh token cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful',
    });

    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Immediately expire
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Logout failed' } },
      { status: 500 }
    );
  }
}
