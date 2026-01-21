import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isEmailVerified: boolean;
  password?: string;
  avatar?: string | null;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthServiceInterface {
  createUser(userData: any): Promise<User>;
  generateTokens(userId: string): Promise<Tokens>;
  sendVerificationEmail(email: string): Promise<boolean>;
  generatePasswordResetToken(email: string): Promise<string>;
  sendPasswordResetEmail(email: string): Promise<boolean>;
  validatePasswordResetToken(token: string): Promise<boolean>;
  resetPassword(token: string, newPassword: string): Promise<boolean>;
}

export const getAuthService = (): AuthServiceInterface => ({
  createUser: async (userData: any): Promise<User> => {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const [newUser] = await db.insert(users).values({
      ...userData,
      password: hashedPassword,
    }).returning();

    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.firstName && newUser.lastName ? `${newUser.firstName} ${newUser.lastName}` : undefined,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role || 'user',
      isEmailVerified: newUser.isEmailVerified || false,
      avatar: newUser.avatar,
    };
  },

  generateTokens: async (userId: string): Promise<Tokens> => {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  },

  sendVerificationEmail: async (email: string): Promise<boolean> => {
    // Mock email sending - in real implementation, use nodemailer
    console.log(`Verification email sent to ${email}`);
    return true;
  },

  generatePasswordResetToken: async (email: string): Promise<string> => {
    const token = jwt.sign(
      { email, type: 'password-reset' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1h' }
    );
    return token;
  },

  sendPasswordResetEmail: async (email: string): Promise<boolean> => {
    // Mock email sending - in real implementation, use nodemailer
    console.log(`Password reset email sent to ${email}`);
    return true;
  },

  validatePasswordResetToken: async (token: string): Promise<boolean> => {
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      return true;
    } catch {
      return false;
    }
  },

  resetPassword: async (token: string, newPassword: string): Promise<boolean> => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.email, decoded.email));
      
      return true;
    } catch {
      return false;
    }
  },
});

export class AuthServiceMethods {
  static generateAccessToken(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '15m' }
    );
  }

  static async createRefreshToken(userId: string): Promise<string> {
    return jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
      { expiresIn: '7d' }
    );
  }
}
