import { jest, beforeAll, afterAll, expect } from '@jest/globals';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/lib/billing/bill-processor', () => ({
  getBillProcessor: jest.fn(() => ({
    getBill: jest.fn(),
    getUserBills: jest.fn(),
    getBillAnalytics: jest.fn(),
    getOverdueBills: jest.fn(),
    getUpcomingBills: jest.fn(),
    getBillsByStatus: jest.fn(),
    processBillUpload: jest.fn(),
    createBillFromAttachment: jest.fn(),
    updateBill: jest.fn(),
    deleteBill: jest.fn(),
    matchBillWithPayment: jest.fn(),
  })),
}));

jest.mock('@/lib/notifications/alert-engine', () => ({
  getAlertEngine: jest.fn(() => ({
    getAlert: jest.fn(),
    getAlerts: jest.fn(),
    getStats: jest.fn(),
    createAlert: jest.fn(),
    acknowledgeAlert: jest.fn(),
    resolveAlert: jest.fn(),
    createRule: jest.fn(),
    updateRule: jest.fn(),
    deleteRule: jest.fn(),
  })),
}));

jest.mock('@/lib/sustainability/carbon-tracker', () => ({
  getCarbonTracker: jest.fn(() => ({
    getCarbonFootprint: jest.fn(),
    getUserCarbonFootprints: jest.fn(),
    getCarbonAnalytics: jest.fn(),
    calculateCarbonFootprint: jest.fn(),
    updateCarbonFootprint: jest.fn(),
    createReductionTarget: jest.fn(),
    updateReductionTarget: jest.fn(),
    getReductionTargets: jest.fn(),
  })),
}));

jest.mock('@/lib/maintenance/device-health-monitor', () => ({
  getDeviceHealthMonitor: jest.fn(() => ({
    getHealthSummary: jest.fn(),
    getDeviceHealth: jest.fn(),
    getAllDevicesHealth: jest.fn(),
    getDevicesByStatus: jest.fn(),
    updateDeviceHealth: jest.fn(),
    acknowledgeAlert: jest.fn(),
    resolveAlert: jest.fn(),
  })),
}));

// Global test setup
beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret';
  process.env.DB_HOST = 'localhost';
  process.env.DB_USER = 'test';
  process.env.DB_PASSWORD = 'test';
  process.env.DB_NAME = 'test_db';
});

afterAll(() => {
  delete process.env.NODE_ENV;
  delete process.env.JWT_SECRET;
  delete process.env.DB_HOST;
  delete process.env.DB_USER;
  delete process.env.DB_PASSWORD;
  delete process.env.DB_NAME;
});

// Test utilities
export const createMockRequest = (url: string, method: string = 'GET', body?: any): NextRequest => {
  const request = new Request(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  }) as NextRequest;
  
  return request;
};

export const createMockSearchParams = (params: Record<string, string>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.set(key, value);
  });
  return searchParams;
};

// Test data factories
export const createMockBill = () => ({
  id: 'bill_001',
  userId: 'user_001',
  amount: 2450.50,
  status: 'paid',
  dueDate: '2024-01-15',
  units: 320,
  rate: 7.65,
  provider: 'Electricity Board',
  period: '2024-01',
});

export const createMockAlert = () => ({
  id: 'alert_001',
  userId: 'user_001',
  deviceId: 'device_001',
  severity: 'high',
  category: 'energy_usage',
  message: 'High energy consumption detected',
  timestamp: new Date().toISOString(),
  status: 'active',
});

export const createMockCarbonFootprint = () => ({
  id: 'footprint_001',
  userId: 'user_001',
  period: {
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
  },
  totalEmissions: 250.5,
  emissionsBySource: {
    electricity: 180.2,
    gas: 45.3,
    water: 25.0,
  },
  emissionsByCategory: {
    heating: 120.5,
    cooling: 80.2,
    lighting: 35.8,
    appliances: 54.0,
  },
});

export const createMockDeviceHealth = () => ({
  deviceId: 'device_001',
  userId: 'user_001',
  status: 'healthy',
  lastCheck: new Date().toISOString(),
  metrics: {
    efficiency: 0.95,
    temperature: 45.2,
    vibration: 0.1,
    powerConsumption: 1200,
  },
  alerts: [],
});

// Test helpers
export const expectSuccessResponse = (response: any, expectedData?: any) => {
  expect(response.success).toBe(true);
  if (expectedData) {
    expect(response.data).toEqual(expectedData);
  }
};

export const expectErrorResponse = (response: any, expectedError?: string) => {
  expect(response.success).toBe(false);
  if (expectedError) {
    expect(response.error).toContain(expectedError);
  }
};

export const expectValidTimestamp = (timestamp: string) => {
  expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  expect(new Date(timestamp)).toBeInstanceOf(Date);
};

export const expectValidId = (id: string) => {
  expect(typeof id).toBe('string');
  expect(id.length).toBeGreaterThan(0);
  expect(id).toMatch(/^[a-zA-Z0-9_-]+$/);
};

// Performance test utilities
export const measureResponseTime = async (fn: () => Promise<any>) => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return {
    result,
    responseTime: end - start,
  };
};

export const expectPerformanceThreshold = (responseTime: number, threshold: number) => {
  expect(responseTime).toBeLessThan(threshold);
};

// Database test utilities
export const setupTestDatabase = async () => {
  // Mock database setup for testing
  console.log('🔧 Setting up test database...');
  // In real implementation, this would create a test database
};

export const cleanupTestDatabase = async () => {
  // Mock database cleanup for testing
  console.log('🧹 Cleaning up test database...');
  // In real implementation, this would clean up test data
};

// Integration test utilities
export const setupIntegrationTest = async () => {
  await setupTestDatabase();
  // Setup other integration dependencies
};

export const cleanupIntegrationTest = async () => {
  await cleanupTestDatabase();
  // Cleanup other integration dependencies
};
