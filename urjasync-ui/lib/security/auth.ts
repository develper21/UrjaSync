import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  mfaEnabled: boolean;
  mfaSecret?: string;
  backupCodes?: string[];
  createdAt: number;
  lastLogin?: number;
  loginAttempts: number;
  lockedUntil?: number;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  preferences: UserPreferences;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  security: {
    sessionTimeout: number; // minutes
    requireMFA: boolean;
    ipWhitelist: string[];
  };
}

export interface AuthSession {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  deviceInfo: {
    userAgent: string;
    ip: string;
    deviceFingerprint: string;
  };
  createdAt: number;
  expiresAt: number;
  lastAccessed: number;
  isActive: boolean;
}

export interface MFACode {
  userId: string;
  code: string;
  expiresAt: number;
  attempts: number;
  type: 'totp' | 'sms' | 'email';
}

export class AuthenticationService {
  private users: Map<string, User> = new Map();
  private sessions: Map<string, AuthSession> = new Map();
  private mfaCodes: Map<string, MFACode> = new Map();
  private failedAttempts: Map<string, number[]> = new Map();
  
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'urjasync-secret-key';
  private readonly JWT_EXPIRES_IN = '1h';
  private readonly REFRESH_TOKEN_EXPIRES_IN = '7d';
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  private readonly MFA_CODE_EXPIRY = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initializeDefaultRoles();
    this.createDefaultAdmin();
  }

  private initializeDefaultRoles(): void {
    // Default roles will be created when needed
  }

  private createDefaultAdmin(): void {
    const adminEmail = 'admin@urjasync.com';
    const adminPassword = 'admin123'; // Should be changed in production
    
    if (!this.getUserByEmail(adminEmail)) {
      this.createUser({
        email: adminEmail,
        password: adminPassword,
        name: 'System Administrator',
        role: this.getAdminRole(),
        permissions: this.getAllPermissions()
      });
    }
  }

  // User management
  async createUser(userData: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    permissions: Permission[];
  }): Promise<User> {
    const existingUser = this.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(userData.password, 12);
    const user: User = {
      id: uuidv4(),
      email: userData.email,
      passwordHash,
      name: userData.name,
      role: userData.role,
      permissions: userData.permissions,
      mfaEnabled: false,
      createdAt: Date.now(),
      loginAttempts: 0,
      isActive: true,
      emailVerified: false,
      phoneVerified: false,
      preferences: this.getDefaultPreferences()
    };

    this.users.set(user.id, user);
    return user;
  }

  async authenticateUser(email: string, password: string, deviceInfo: any): Promise<{
    requiresMFA: boolean;
    session?: AuthSession;
    mfaToken?: string;
  }> {
    const user = this.getUserByEmail(email);
    
    if (!user || !user.isActive) {
      throw new Error('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > Date.now()) {
      throw new Error('Account temporarily locked due to multiple failed attempts');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      await this.handleFailedLogin(email);
      throw new Error('Invalid credentials');
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockedUntil = undefined;

    // Check if MFA is required
    if (user.mfaEnabled) {
      const mfaToken = await this.generateMFACode(user.id);
      return {
        requiresMFA: true,
        mfaToken
      };
    }

    // Create session
    const session = await this.createSession(user, deviceInfo);
    user.lastLogin = Date.now();

    return {
      requiresMFA: false,
      session
    };
  }

  async verifyMFA(userId: string, code: string, mfaToken: string, deviceInfo: any): Promise<AuthSession> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify MFA token
    const storedMFA = this.mfaCodes.get(mfaToken);
    if (!storedMFA || storedMFA.userId !== userId) {
      throw new Error('Invalid MFA token');
    }

    // Check expiry
    if (Date.now() > storedMFA.expiresAt) {
      this.mfaCodes.delete(mfaToken);
      throw new Error('MFA code expired');
    }

    // Verify code
    const isValidCode = await this.verifyMFACode(user, code, storedMFA.type);
    if (!isValidCode) {
      storedMFA.attempts++;
      if (storedMFA.attempts >= 3) {
        this.mfaCodes.delete(mfaToken);
        throw new Error('Too many MFA attempts. Please request a new code.');
      }
      throw new Error('Invalid MFA code');
    }

    // Clean up MFA code
    this.mfaCodes.delete(mfaToken);

    // Create session
    const session = await this.createSession(user, deviceInfo);
    user.lastLogin = Date.now();

    return session;
  }

  async refreshSession(refreshToken: string): Promise<AuthSession> {
    const session = Array.from(this.sessions.values()).find(s => s.refreshToken === refreshToken && s.isActive);
    
    if (!session || session.expiresAt < Date.now()) {
      throw new Error('Invalid or expired refresh token');
    }

    // Update session
    session.lastAccessed = Date.now();
    session.expiresAt = Date.now() + (24 * 60 * 60 * 1000); // Extend by 24 hours

    return session;
  }

  async logout(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
    }
  }

  async logoutAllSessions(userId: string): Promise<void> {
    const userSessions = Array.from(this.sessions.values()).filter(s => s.userId === userId);
    userSessions.forEach(session => {
      session.isActive = false;
    });
  }

  // MFA management
  async enableMFA(userId: string): Promise<{ secret: string; qrCode: string }> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const mfaSecret = this.generateTOTPSecret();
    user.mfaSecret = mfaSecret;
    user.mfaEnabled = true;

    const qrCode = this.generateQRCode(mfaSecret, user.email);

    return { secret: mfaSecret, qrCode };
  }

  async disableMFA(userId: string, password: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    user.mfaEnabled = false;
    user.mfaSecret = undefined;
    user.backupCodes = undefined;
  }

  // Permission management
  hasPermission(userId: string, resource: string, action: string): boolean {
    const user = this.users.get(userId);
    if (!user || !user.isActive) {
      return false;
    }

    return user.permissions.some(permission => 
      permission.resource === resource && permission.action === action
    );
  }

  hasRole(userId: string, roleName: string): boolean {
    const user = this.users.get(userId);
    if (!user || !user.isActive) {
      return false;
    }

    return user.role.name === roleName;
  }

  // Session management
  private async createSession(user: User, deviceInfo: any): Promise<AuthSession> {
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role.name },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      this.JWT_SECRET,
      { expiresIn: this.REFRESH_TOKEN_EXPIRES_IN }
    );

    const session: AuthSession = {
      id: uuidv4(),
      userId: user.id,
      token,
      refreshToken,
      deviceInfo: {
        userAgent: deviceInfo.userAgent || 'Unknown',
        ip: deviceInfo.ip || 'Unknown',
        deviceFingerprint: this.generateDeviceFingerprint(deviceInfo)
      },
      createdAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      lastAccessed: Date.now(),
      isActive: true
    };

    this.sessions.set(session.id, session);
    return session;
  }

  private async generateMFACode(userId: string): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const token = uuidv4();
    
    const mfaCode: MFACode = {
      userId,
      code,
      expiresAt: Date.now() + this.MFA_CODE_EXPIRY,
      attempts: 0,
      type: 'totp'
    };

    this.mfaCodes.set(token, mfaCode);
    return token;
  }

  private async verifyMFACode(user: User, code: string, type: string): Promise<boolean> {
    if (type === 'totp') {
      // For TOTP, verify against time-based code
      return this.verifyTOTP(user.mfaSecret!, code);
    }
    
    // For SMS/Email, verify against stored code
    const storedCode = Array.from(this.mfaCodes.values()).find(mfa => 
      mfa.userId === user.id && Date.now() < mfa.expiresAt
    );
    
    return storedCode?.code === code;
  }

  private verifyTOTP(_secret: string, token: string): boolean {
    // Simplified TOTP verification - in production, use a proper TOTP library
    return token.length === 6 && /^\d+$/.test(token);
  }

  private generateTOTPSecret(): string {
    return crypto.randomBytes(16).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  private generateQRCode(totpSecret: string, email: string): string {
    // In production, generate actual QR code
    return `otpauth://totp/UrjaSync:${email}?secret=${totpSecret}&issuer=UrjaSync`;
  }

  private generateDeviceFingerprint(deviceInfo: any): string {
    const data = `${deviceInfo.userAgent || ''}-${deviceInfo.ip || ''}-${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
  }

  private async handleFailedLogin(email: string): Promise<void> {
    const user = this.getUserByEmail(email);
    if (user) {
      user.loginAttempts++;
      
      if (user.loginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
        user.lockedUntil = Date.now() + this.LOCKOUT_DURATION;
      }
    }

    // Track failed attempts by IP
    const attempts = this.failedAttempts.get(email) || [];
    attempts.push(Date.now());
    this.failedAttempts.set(email, attempts);
  }

  private getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      theme: 'auto',
      language: 'en',
      timezone: 'UTC',
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      security: {
        sessionTimeout: 60,
        requireMFA: false,
        ipWhitelist: []
      }
    };
  }

  private getAdminRole(): UserRole {
    return {
      id: 'admin',
      name: 'Administrator',
      description: 'Full system access',
      permissions: this.getAllPermissions(),
      isSystem: true
    };
  }

  private getAllPermissions(): Permission[] {
    return [
      { id: 'users.read', name: 'Read Users', resource: 'users', action: 'read', description: 'View user information' },
      { id: 'users.write', name: 'Write Users', resource: 'users', action: 'write', description: 'Create and update users' },
      { id: 'users.delete', name: 'Delete Users', resource: 'users', action: 'delete', description: 'Delete users' },
      { id: 'devices.read', name: 'Read Devices', resource: 'devices', action: 'read', description: 'View device information' },
      { id: 'devices.write', name: 'Write Devices', resource: 'devices', action: 'write', description: 'Control devices' },
      { id: 'devices.delete', name: 'Delete Devices', resource: 'devices', action: 'delete', description: 'Delete devices' },
      { id: 'analytics.read', name: 'Read Analytics', resource: 'analytics', action: 'read', description: 'View analytics data' },
      { id: 'system.admin', name: 'System Admin', resource: 'system', action: 'admin', description: 'System administration' }
    ];
  }

  // Getters
  getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  getSession(sessionId: string): AuthSession | undefined {
    return this.sessions.get(sessionId);
  }

  getUserSessions(userId: string): AuthSession[] {
    return Array.from(this.sessions.values()).filter(s => s.userId === userId && s.isActive);
  }

  // Cleanup expired sessions and codes
  cleanup(): void {
    const now = Date.now();
    
    // Clean up expired sessions
    this.sessions.forEach((session, id) => {
      if (session.expiresAt < now || !session.isActive) {
        this.sessions.delete(id);
      }
    });

    // Clean up expired MFA codes
    this.mfaCodes.forEach((code, token) => {
      if (code.expiresAt < now) {
        this.mfaCodes.delete(token);
      }
    });
  }
}

// Singleton instance
let authService: AuthenticationService | null = null;

export function getAuthService(): AuthenticationService {
  if (!authService) {
    authService = new AuthenticationService();
    // Set up periodic cleanup
    setInterval(() => authService!.cleanup(), 60 * 60 * 1000); // Every hour
  }
  return authService;
}
