import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { AuthService } from '@/lib/services/authService';
import { OTPService } from '@/lib/services/emailService';

// Validation schemas
const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters long'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = resetPasswordSchema.parse(body);

    // Verify OTP
    const isValidOTP = await OTPService.verifyOTP(
      validatedData.email,
      validatedData.otp,
      'password_reset'
    );

    if (!isValidOTP) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid or expired OTP' } },
        { status: 400 }
      );
    }

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'User not found' } },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 12);

    // Update password and revoke all refresh tokens
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.email, validatedData.email));

    await AuthService.revokeAllRefreshTokens(user.id);

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. Please login with your new password.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: error.errors[0].message } },
        { status: 400 }
      );
    }
    
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
