import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { EmailService, OTPService } from '@/lib/services/emailService';

// Validation schemas
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = forgotPasswordSchema.parse(body);

    // Check if user exists
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    if (!user) {
      // Don't reveal that user doesn't exist for security
      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, a password reset code has been sent.',
      });
    }

    try {
      // Generate and send OTP
      const otp = await OTPService.createOTP(validatedData.email, 'password_reset');
      await EmailService.sendOTP(validatedData.email, otp, 'password_reset');
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue with response even if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset code sent to your email',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: error.errors[0].message } },
        { status: 400 }
      );
    }
    
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: { message: 'Method not allowed' } },
    { status: 405 }
  );
}
