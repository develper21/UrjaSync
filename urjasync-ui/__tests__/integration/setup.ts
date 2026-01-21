import { jest, expect, beforeAll, afterAll } from '@jest/globals';
import { NextRequest } from 'next/server';

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

export const createMockDevice = () => ({
  id: 'device_001',
  name: 'Smart Thermostat',
  type: 'thermostat',
  status: 'online',
  consumption: 125.5,
  efficiency: 0.85,
});

export const createMockUser = () => ({
  id: 'user_001',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
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
