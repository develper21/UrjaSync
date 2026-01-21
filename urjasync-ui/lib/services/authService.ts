import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { refreshTokens, users } from '@/lib/db/schema';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET!;
  private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

  static generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  static generateRefreshToken(): string {
    const bytes = new Uint8Array(64);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  static async createRefreshToken(userId: string): Promise<string> {
    const token = this.generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

    await db.insert(refreshTokens).values({
      userId,
      token,
      expiresAt,
    });

    return token;
  }

  static async verifyAccessToken(token: string): Promise<JWTPayload> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as JWTPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static async verifyRefreshToken(token: string): Promise<JWTPayload> {
    try {
      // Check if refresh token exists and is valid
      const [refreshToken] = await db
        .select()
        .from(refreshTokens)
        .where(eq(refreshTokens.token, token))
        .limit(1);

      if (!refreshToken) {
        throw new Error('Refresh token not found');
      }

      if (refreshToken.isRevoked || refreshToken.expiresAt < new Date()) {
        throw new Error('Refresh token expired or revoked');
      }

      // Get user details
      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          role: users.role,
        })
        .from(users)
        .where(eq(users.id, refreshToken.userId))
        .limit(1);

      if (!user) {
        throw new Error('User not found');
      }

      return {
        userId: user.id,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async revokeRefreshToken(token: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.token, token));
  }

  static async revokeAllRefreshTokens(userId: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.userId, userId));
  }

  static async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = await this.verifyRefreshToken(refreshToken);
    
    // Revoke old refresh token
    await this.revokeRefreshToken(refreshToken);
    
    // Generate new tokens
    const newAccessToken = this.generateAccessToken(payload);
    const newRefreshToken = await this.createRefreshToken(payload.userId);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}
