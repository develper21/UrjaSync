import '@testing-library/jest-dom';

// Mock Next.js router for API route tests
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock Next.js navigation for API route tests
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock fetch for API route tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    status: 200,
    json: () => Promise.resolve({ success: true }),
  })
);

// Mock localStorage and sessionStorage for API route tests
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock Next.js API routes
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, options) => ({
      status: options?.status || 200,
      json: async () => data,
    })),
  },
}))

// Mock Node.js globals for API routes
global.Request = jest.fn()
global.Response = jest.fn()

// Mock email service with proper error handling
jest.mock('@/lib/services/emailService', () => ({
  EmailService: {
    sendEmail: jest.fn().mockResolvedValue(undefined),
    sendOTP: jest.fn().mockImplementation((email, otp, usage) => {
      // Simulate email sending failure for specific test cases
      if (email === 'fail@example.com') {
        throw new Error('Email service unavailable');
      }
      return Promise.resolve();
    }),
  },
  OTPService: {
    createOTP: jest.fn().mockResolvedValue('123456'),
    verifyOTP: jest.fn().mockResolvedValue(true),
  },
}));

// Mock database with proper error handling
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    insert: jest.fn(() => ({
      values: jest.fn(() => ({
        returning: jest.fn(() => Promise.resolve([{
          id: 'test-id',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          isEmailVerified: false,
        }])),
      })),
    })),
    update: jest.fn(() => ({
      set: jest.fn(() => ({
        where: jest.fn(() => ({
          returning: jest.fn(() => Promise.resolve([{
            id: 'test-id',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            isEmailVerified: false,
          }])),
        })),
      })),
    })),
    delete: jest.fn(() => ({
      where: jest.fn(() => ({
        returning: jest.fn(() => Promise.resolve([{
          id: 'test-id',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          isEmailVerified: false,
        }])),
      })),
    })),
  },
}));

// Polyfill TextEncoder for Node.js environment
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Setup global test timeout
jest.setTimeout(10000);
