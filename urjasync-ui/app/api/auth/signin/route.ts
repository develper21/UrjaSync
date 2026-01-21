import { NextRequest, NextResponse } from 'next/server';
import { getAuthService } from '@/lib/security/auth';
import { SecurityMiddleware } from '@/lib/security/middleware';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, deviceInfo } = body;

    // Input validation
    const validation = SecurityMiddleware.validateInput(body, {
      email: { type: 'email', required: true },
      password: { type: 'string', required: true, minLength: 6, maxLength: 128 }
    });

    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const authService = getAuthService();
    const result = await authService.authenticateUser(email, password, deviceInfo || {});

    if (result.requiresMFA) {
      return NextResponse.json({
        success: true,
        requiresMFA: true,
        mfaToken: result.mfaToken,
        message: 'MFA code sent to your registered device'
      });
    }

    if (result.session) {
      const response = NextResponse.json({
        success: true,
        user: {
          id: result.session.userId,
          email,
          name: 'User', // Would come from actual user data
          role: 'user'
        },
        session: {
          token: result.session.token,
          refreshToken: result.session.refreshToken,
          expiresAt: result.session.expiresAt
        }
      });

      // Set secure HTTP-only cookie
      response.cookies.set('auth-token', result.session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 // 1 hour
      });

      return SecurityMiddleware.addSecurityHeaders(response);
    }

    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 401 }
    );

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
