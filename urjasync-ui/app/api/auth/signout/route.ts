import { NextRequest, NextResponse } from 'next/server';
import { getAuthService } from '@/lib/security/auth';
import { SecurityMiddleware } from '@/lib/security/middleware';

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie or header
    const token = request.cookies.get('auth-token')?.value || 
                 request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No session found' },
        { status: 401 }
      );
    }

    const authService = getAuthService();
    
    // Find and invalidate session
    const sessions = authService.getUserSessions(''); // This would need optimization
    const session = sessions.find(s => s.token === token);
    
    if (session) {
      await authService.logout(session.id);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Clear auth cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0
    });

    return SecurityMiddleware.addSecurityHeaders(response);

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}
