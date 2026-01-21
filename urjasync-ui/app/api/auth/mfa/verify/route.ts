import { NextRequest, NextResponse } from 'next/server';
import { getAuthService } from '@/lib/security/auth';
import { SecurityMiddleware } from '@/lib/security/middleware';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, code, mfaToken, deviceInfo } = body;

    // Input validation
    const validation = SecurityMiddleware.validateInput(body, {
      userId: { type: 'string', required: true },
      code: { type: 'string', required: true, minLength: 6, maxLength: 6 },
      mfaToken: { type: 'string', required: true }
    });

    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const authService = getAuthService();
    const session = await authService.verifyMFA(userId, code, mfaToken, deviceInfo || {});

    const response = NextResponse.json({
      success: true,
      user: {
        id: session.userId,
        name: 'User', // Would come from actual user data
        role: 'user'
      },
      session: {
        token: session.token,
        refreshToken: session.refreshToken,
        expiresAt: session.expiresAt
      }
    });

    // Set secure HTTP-only cookie
    response.cookies.set('auth-token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 // 1 hour
    });

    return SecurityMiddleware.addSecurityHeaders(response);

  } catch (error) {
    console.error('MFA verification error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'MFA verification failed' },
      { status: 401 }
    );
  }
}
