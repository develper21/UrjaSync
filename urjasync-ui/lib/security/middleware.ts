import { NextRequest, NextResponse } from 'next/server';
import { getAuthService, AuthSession } from './auth';
// import { getEncryptionService } from './encryption';

export interface SecurityContext {
  user?: any;
  session?: AuthSession;
  permissions: string[];
  isAuthenticated: boolean;
}

export interface SecurityMiddlewareOptions {
  requireAuth?: boolean;
  permissions?: string[];
  roles?: string[];
  rateLimit?: {
    requests: number;
    window: number; // minutes
  };
  encryption?: {
    fields: string[];
    direction: 'encrypt' | 'decrypt' | 'both';
  };
}

export class SecurityMiddleware {
  private authService = getAuthService();
  // private encryptionService = getEncryptionService();
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  // Main middleware function
  async handle(request: NextRequest, options: SecurityMiddlewareOptions = {}): Promise<{
    response?: NextResponse;
    context: SecurityContext;
  }> {
    const context: SecurityContext = {
      permissions: [],
      isAuthenticated: false
    };

    try {
      // 1. Rate limiting
      if (options.rateLimit) {
        const rateLimitResult = this.checkRateLimit(request, options.rateLimit);
        if (!rateLimitResult.allowed) {
          return {
            response: NextResponse.json(
              { error: 'Rate limit exceeded' },
              { status: 429, headers: { 'Retry-After': rateLimitResult.retryAfter.toString() } }
            ),
            context
          };
        }
      }

      // 2. Authentication
      if (options.requireAuth) {
        const authResult = await this.authenticate(request);
        if (!authResult.success) {
          return {
            response: NextResponse.json(
              { error: authResult.error },
              { status: authResult.status }
            ),
            context
          };
        }

        context.user = authResult.user;
        context.session = authResult.session;
        context.isAuthenticated = true;
        context.permissions = authResult.user.permissions.map((p: any) => `${p.resource}:${p.action}`);
      }

      // 3. Authorization
      if (options.permissions && context.isAuthenticated) {
        const hasPermission = this.checkPermissions(context, options.permissions);
        if (!hasPermission) {
          return {
            response: NextResponse.json(
              { error: 'Insufficient permissions' },
              { status: 403 }
            ),
            context
          };
        }
      }

      if (options.roles && context.isAuthenticated) {
        const hasRole = this.checkRoles(context, options.roles);
        if (!hasRole) {
          return {
            response: NextResponse.json(
              { error: 'Insufficient role privileges' },
              { status: 403 }
            ),
            context
          };
        }
      }

      // 4. Data encryption/decryption
      if (options.encryption) {
        await this.handleEncryption(request, options.encryption);
      }

      return { context };

    } catch (error) {
      console.error('Security middleware error:', error);
      return {
        response: NextResponse.json(
          { error: 'Internal security error' },
          { status: 500 }
        ),
        context
      };
    }
  }

  // Authentication
  private async authenticate(request: NextRequest): Promise<{
    success: boolean;
    user?: any;
    session?: AuthSession;
    error?: string;
    status: number;
  }> {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return { success: false, error: 'No authorization header', status: 401 };
    }

    const token = authHeader.replace('Bearer ', '');
    
    try {
      // Verify JWT token
      const session = this.verifyToken(token);
      if (!session) {
        return { success: false, error: 'Invalid token', status: 401 };
      }

      // Check if session is still active
      if (!session.isActive || session.expiresAt < Date.now()) {
        return { success: false, error: 'Session expired', status: 401 };
      }

      // Get user
      const user = this.authService.getUser(session.userId);
      if (!user || !user.isActive) {
        return { success: false, error: 'User not found or inactive', status: 401 };
      }

      // Update last accessed
      session.lastAccessed = Date.now();

      return { success: true, user, session, status: 200 };

    } catch (error) {
      return { success: false, error: 'Authentication failed', status: 401 };
    }
  }

  private verifyToken(token: string): AuthSession | null {
    try {
      // Find session by token
      const sessions = this.authService.getUserSessions(''); // This would need to be optimized
      return sessions.find(s => s.token === token) || null;
    } catch (error) {
      return null;
    }
  }

  // Authorization
  private checkPermissions(context: SecurityContext, requiredPermissions: string[]): boolean {
    if (!context.user) return false;

    return requiredPermissions.every(permission => {
      const [resource, action] = permission.split(':');
      return this.authService.hasPermission(context.user!.id, resource, action);
    });
  }

  private checkRoles(context: SecurityContext, requiredRoles: string[]): boolean {
    if (!context.user) return false;

    return requiredRoles.some(role => {
      return this.authService.hasRole(context.user!.id, role);
    });
  }

  // Rate limiting
  private checkRateLimit(request: NextRequest, limit: { requests: number; window: number }): {
    allowed: boolean;
    retryAfter: number;
  } {
    const clientId = this.getClientId(request);
    const now = Date.now();
    const windowMs = limit.window * 60 * 1000;

    const clientData = this.rateLimitMap.get(clientId);
    
    if (!clientData || now > clientData.resetTime) {
      // New window or expired window
      this.rateLimitMap.set(clientId, {
        count: 1,
        resetTime: now + windowMs
      });
      return { allowed: true, retryAfter: 0 };
    }

    if (clientData.count >= limit.requests) {
      const retryAfter = Math.ceil((clientData.resetTime - now) / 1000);
      return { allowed: false, retryAfter };
    }

    clientData.count++;
    return { allowed: true, retryAfter: 0 };
  }

  private getClientId(request: NextRequest): string {
    // Use IP address and user agent for client identification
    const ip = request.headers.get('x-forwarded-for') || 
              request.headers.get('x-real-ip') || 
              'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Create hash for consistent client ID
    const crypto = require('crypto');
    return crypto.createHash('sha256')
      .update(`${ip}:${userAgent}`)
      .digest('hex')
      .substring(0, 16);
  }

  // Data encryption/decryption
  private async handleEncryption(_request: NextRequest, _encryption: {
    fields: string[];
    direction: 'encrypt' | 'decrypt' | 'both';
  }): Promise<void> {
    // This would handle request/response encryption
    // Implementation depends on whether it's a GET, POST, etc.
    // For now, this is a placeholder for the concept
  }

  // Security headers
  static addSecurityHeaders(response: NextResponse): NextResponse {
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // CSP header
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'"
    );

    return response;
  }

  // Input validation
  static validateInput(data: any, rules: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'email' | 'url';
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
  }>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const [field, rule] of Object.entries(rules)) {
      const value = data[field];

      // Required validation
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      // Skip validation if field is not provided and not required
      if (value === undefined || value === null) {
        continue;
      }

      // Type validation
      switch (rule.type) {
        case 'string':
          if (typeof value !== 'string') {
            errors.push(`${field} must be a string`);
          } else {
            if (rule.minLength && value.length < rule.minLength) {
              errors.push(`${field} must be at least ${rule.minLength} characters`);
            }
            if (rule.maxLength && value.length > rule.maxLength) {
              errors.push(`${field} must be at most ${rule.maxLength} characters`);
            }
            if (rule.pattern && !rule.pattern.test(value)) {
              errors.push(`${field} format is invalid`);
            }
          }
          break;

        case 'number':
          if (typeof value !== 'number' || isNaN(value)) {
            errors.push(`${field} must be a number`);
          } else {
            if (rule.min !== undefined && value < rule.min) {
              errors.push(`${field} must be at least ${rule.min}`);
            }
            if (rule.max !== undefined && value > rule.max) {
              errors.push(`${field} must be at most ${rule.max}`);
            }
          }
          break;

        case 'boolean':
          if (typeof value !== 'boolean') {
            errors.push(`${field} must be a boolean`);
          }
          break;

        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (typeof value !== 'string' || !emailRegex.test(value)) {
            errors.push(`${field} must be a valid email address`);
          }
          break;

        case 'url':
          try {
            new URL(value);
          } catch {
            errors.push(`${field} must be a valid URL`);
          }
          break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Cleanup old rate limit data
  cleanupRateLimit(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.rateLimitMap.forEach((data, key) => {
      if (now > data.resetTime) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => {
      this.rateLimitMap.delete(key);
    });
  }
}

// Singleton instance
let securityMiddleware: SecurityMiddleware | null = null;

export function getSecurityMiddleware(): SecurityMiddleware {
  if (!securityMiddleware) {
    securityMiddleware = new SecurityMiddleware();
    
    // Set up periodic cleanup
    setInterval(() => {
      securityMiddleware!.cleanupRateLimit();
    }, 60 * 60 * 1000); // Every hour
  }
  return securityMiddleware;
}
