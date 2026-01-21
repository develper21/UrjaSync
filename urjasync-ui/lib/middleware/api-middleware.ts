import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase, databaseHealthCheck } from '@/lib/db/connection';

// Performance monitoring middleware
export const withPerformanceMonitoring = async (handler: () => Promise<NextResponse>) => {
  const start = performance.now();
  const response = await handler();
  const end = performance.now();
  
  // Add performance headers
  response.headers.set('X-Response-Time', `${(end - start).toFixed(2)}ms`);
  response.headers.set('X-Server-Timestamp', new Date().toISOString());
  
  return response;
};

// Database connection middleware
export const withDatabaseConnection = async (handler: () => Promise<NextResponse>) => {
  try {
    await initializeDatabase();
    return await handler();
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { success: false, error: 'Database connection failed' },
      { status: 500 }
    );
  }
};

// Rate limiting middleware
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const withRateLimiting = async (
  request: NextRequest,
  handler: () => Promise<NextResponse>,
  limit: number = 100,
  windowMs: number = 900000 // 15 minutes
) => {
  const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const now = Date.now();
  
  const clientData = rateLimitMap.get(clientIP);
  
  if (!clientData || clientData.resetTime < now) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + windowMs });
    return await handler();
  }
  
  if (clientData.count >= limit) {
    return NextResponse.json(
      { success: false, error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
  
  clientData.count++;
  return await handler();
};

// Cache middleware
const cache = new Map<string, { data: any; expiry: number }>();

export const withCache = async (
  request: NextRequest,
  handler: () => Promise<NextResponse>,
  ttlMs: number = 300000 // 5 minutes
) => {
  const cacheKey = request.url;
  const cached = cache.get(cacheKey);
  
  if (cached && cached.expiry > Date.now()) {
    const response = NextResponse.json(cached.data);
    response.headers.set('X-Cache', 'HIT');
    return response;
  }
  
  const response = await handler();
  
  if (response.status === 200) {
    const data = await response.json();
    cache.set(cacheKey, { data, expiry: Date.now() + ttlMs });
    response.headers.set('X-Cache', 'MISS');
  }
  
  return response;
};

// Error handling middleware
export const withErrorHandling = async (handler: () => Promise<NextResponse>) => {
  try {
    return await handler();
  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof Error) {
      // Log detailed error for debugging
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : error.message 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Unknown error occurred' },
      { status: 500 }
    );
  }
};

// Request logging middleware
export const withRequestLogging = async (
  request: NextRequest,
  handler: () => Promise<NextResponse>
) => {
  const start = performance.now();
  const timestamp = new Date().toISOString();
  const method = request.method;
  const url = request.url;
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  console.log(`📥 ${timestamp} ${method} ${url} - ${userAgent}`);
  
  const response = await handler();
  const end = performance.now();
  const responseTime = (end - start).toFixed(2);
  
  console.log(`📤 ${timestamp} ${method} ${url} - ${response.status} - ${responseTime}ms`);
  
  return response;
};

// Security headers middleware
export const withSecurityHeaders = async (handler: () => Promise<NextResponse>) => {
  const response = await handler();
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CORS headers
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  return response;
};

// Combined middleware for API routes
export const apiMiddleware = async (
  request: NextRequest,
  handler: () => Promise<NextResponse>,
  options: {
    enableRateLimit?: boolean;
    enableCache?: boolean;
    rateLimit?: number;
    cacheTTL?: number;
  } = {}
) => {
  const {
    enableRateLimit = true,
    enableCache = false,
    rateLimit = 100,
    cacheTTL = 300000,
  } = options;
  
  let wrappedHandler = handler;
  
  // Apply middleware in order
  wrappedHandler = async () => {
    const response = await wrappedHandler();
    return withErrorHandling(() => Promise.resolve(response));
  };
  wrappedHandler = async () => {
    const response = await wrappedHandler();
    return withRequestLogging(request, () => Promise.resolve(response));
  };
  wrappedHandler = async () => {
    const response = await wrappedHandler();
    return withSecurityHeaders(() => Promise.resolve(response));
  };
  wrappedHandler = async () => withPerformanceMonitoring(wrappedHandler);
  wrappedHandler = async () => withDatabaseConnection(wrappedHandler);
  
  if (enableRateLimit) {
    wrappedHandler = async () => {
      const response = await wrappedHandler();
      return withRateLimiting(request, () => Promise.resolve(response), rateLimit);
    };
  }
  
  if (enableCache && request.method === 'GET') {
    wrappedHandler = async () => {
      const response = await wrappedHandler();
      return withCache(request, () => Promise.resolve(response), cacheTTL);
    };
  }
  
  return await wrappedHandler();
};

// Health check endpoint
export async function GET(request: NextRequest) {
  return apiMiddleware(request, async () => {
    const [dbHealth, systemHealth] = await Promise.all([
      databaseHealthCheck(),
      getSystemHealth(),
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        status: dbHealth.status === 'healthy' && systemHealth.healthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        uptime: process.uptime(),
        database: dbHealth,
        system: systemHealth,
        memory: getMemoryUsage(),
        performance: getPerformanceMetrics(),
      },
    });
  }, { enableCache: true, cacheTTL: 30000 });
}

// System health check
async function getSystemHealth() {
  const memUsage = getMemoryUsage();
  const healthy = memUsage.heapUsed < memUsage.heapTotal * 0.9; // Less than 90% memory usage
  
  return {
    healthy,
    memory: memUsage,
    uptime: process.uptime(),
    platform: process.platform,
    nodeVersion: process.version,
  };
}

// Memory usage
function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    rss: Math.round(usage.rss / 1024 / 1024), // MB
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
    external: Math.round(usage.external / 1024 / 1024), // MB
  };
}

// Performance metrics
function getPerformanceMetrics() {
  const usage = process.cpuUsage();
  return {
    user: usage.user,
    system: usage.system,
    loadAverage: require('os').loadavg(),
  };
}
