import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { AuthService } from '@/lib/services/authService';
import { EmailService, OTPService } from '@/lib/services/emailService';

// Validation schemas
const verifyEmailSchema = z.object({
  email: z.string().email('Invalid email format'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = verifyEmailSchema.parse(body);

    // Verify OTP
    const isValidOTP = await OTPService.verifyOTP(
      validatedData.email,
      validatedData.otp,
      'registration'
    );

    if (!isValidOTP) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid or expired OTP' } },
        { status: 400 }
      );
    }

    // Update user email verification status
    const [updatedUser] = await db
      .update(users)
      .set({ isEmailVerified: true })
      .where(eq(users.email, validatedData.email))
      .returning();

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: { message: 'User not found' } },
        { status: 404 }
      );
    }

    // Send welcome email
    await EmailService.sendWelcomeEmail(updatedUser.email, updatedUser.firstName);

    // Generate tokens
    const tokenPayload = {
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
    };

    const accessToken = AuthService.generateAccessToken(tokenPayload);
    const refreshToken = await AuthService.createRefreshToken(updatedUser.id);

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          role: updatedUser.role,
          isEmailVerified: updatedUser.isEmailVerified,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: error.errors[0].message } },
        { status: 400 }
      );
    }
    
    console.error('Email verification error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
