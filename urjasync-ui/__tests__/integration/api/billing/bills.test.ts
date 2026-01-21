import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, POST } from '../../../../app/api/billing/bills/route';
import { createMockRequest } from '../../setup';

// Mock dependencies
jest.mock('@/lib/billing/bill-service', () => ({
  getBillService: jest.fn(() => ({
    getBills: jest.fn(),
    getBill: jest.fn(),
    createBill: jest.fn(),
    updateBill: jest.fn(),
    deleteBill: jest.fn(),
    getBillAnalytics: jest.fn(),
    getOverdueBills: jest.fn(),
    getUpcomingBills: jest.fn(),
  })),
}));

jest.mock('@/lib/auth/auth-middleware', () => ({
  authenticateRequest: jest.fn(() => Promise.resolve({ userId: 'user_001' })),
}));

describe('/api/billing/bills', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/billing/bills', () => {
    it('should return all bills for authenticated user', async () => {
      const mockBills = [
        {
          id: 'bill_001',
          userId: 'user_001',
          amount: 2450.50,
          status: 'paid',
          dueDate: '2024-01-15',
          units: 320,
          rate: 7.65,
          provider: 'Electricity Board',
          period: '2024-01',
        },
        {
          id: 'bill_002',
          userId: 'user_001',
          amount: 1890.75,
          status: 'pending',
          dueDate: '2024-02-15',
          units: 247,
          rate: 7.65,
          provider: 'Electricity Board',
          period: '2024-02',
        },
      ];

      const { getBillService } = require('@/lib/billing/bill-service');
      const mockBillService = getBillService();
      mockBillService.getBills.mockResolvedValue(mockBills);

      const request = createMockRequest('/api/billing/bills', 'GET');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockBills);
      expect(data.data).toHaveLength(2);
      expect(mockBillService.getBills).toHaveBeenCalledWith('user_001');
    });

    it('should return bills filtered by status', async () => {
      const mockBills = [
        {
          id: 'bill_002',
          userId: 'user_001',
          amount: 1890.75,
          status: 'pending',
          dueDate: '2024-02-15',
          units: 247,
          rate: 7.65,
          provider: 'Electricity Board',
          period: '2024-02',
        },
      ];

      const { getBillService } = require('@/lib/billing/bill-service');
      const mockBillService = getBillService();
      mockBillService.getBills.mockResolvedValue(mockBills);

      const searchParams = { status: 'pending' };
      const request = createMockRequest('/api/billing/bills?' + new URLSearchParams(searchParams), 'GET');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockBills);
      expect(mockBillService.getBills).toHaveBeenCalledWith('user_001', { status: 'pending' });
    });

    it('should return overdue bills', async () => {
      const mockOverdueBills = [
        {
          id: 'bill_003',
          userId: 'user_001',
          amount: 3200.00,
          status: 'overdue',
          dueDate: '2023-12-15',
          units: 418,
          rate: 7.65,
          provider: 'Electricity Board',
          period: '2023-12',
        },
      ];

      const { getBillService } = require('@/lib/billing/bill-service');
      const mockBillService = getBillService();
      mockBillService.getOverdueBills.mockResolvedValue(mockOverdueBills);

      const searchParams = { overdue: 'true' };
      const request = createMockRequest('/api/billing/bills?' + new URLSearchParams(searchParams), 'GET');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockOverdueBills);
      expect(mockBillService.getOverdueBills).toHaveBeenCalledWith('user_001');
    });

    it('should return upcoming bills', async () => {
      const mockUpcomingBills = [
        {
          id: 'bill_004',
          userId: 'user_001',
          amount: 2100.00,
          status: 'pending',
          dueDate: '2024-03-15',
          units: 274,
          rate: 7.65,
          provider: 'Electricity Board',
          period: '2024-03',
        },
      ];

      const { getBillService } = require('@/lib/billing/bill-service');
      const mockBillService = getBillService();
      mockBillService.getUpcomingBills.mockResolvedValue(mockUpcomingBills);

      const searchParams = { upcoming: 'true' };
      const request = createMockRequest('/api/billing/bills?' + new URLSearchParams(searchParams), 'GET');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockUpcomingBills);
      expect(mockBillService.getUpcomingBills).toHaveBeenCalledWith('user_001');
    });

    it('should handle authentication errors', async () => {
      const { authenticateRequest } = require('@/lib/auth/auth-middleware');
      authenticateRequest.mockRejectedValue(new Error('Unauthorized'));

      const request = createMockRequest('/api/billing/bills', 'GET');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Unauthorized');
    });

    it('should handle service errors gracefully', async () => {
      const { getBillService } = require('@/lib/billing/bill-service');
      const mockBillService = getBillService();
      mockBillService.getBills.mockRejectedValue(new Error('Service unavailable'));

      const request = createMockRequest('/api/billing/bills', 'GET');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Internal server error');
    });
  });

  describe('POST /api/billing/bills', () => {
    it('should create new bill successfully', async () => {
      const mockNewBill = {
        id: 'bill_005',
        userId: 'user_001',
        amount: 2750.00,
        status: 'pending',
        dueDate: '2024-04-15',
        units: 359,
        rate: 7.65,
        provider: 'Electricity Board',
        period: '2024-04',
        createdAt: new Date().toISOString(),
      };

      const { getBillService } = require('@/lib/billing/bill-service');
      const mockBillService = getBillService();
      mockBillService.createBill.mockResolvedValue(mockNewBill);

      const requestBody = {
        amount: 2750.00,
        dueDate: '2024-04-15',
        units: 359,
        rate: 7.65,
        provider: 'Electricity Board',
        period: '2024-04',
      };

      const request = createMockRequest('/api/billing/bills', 'POST', requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockNewBill);
      expect(mockBillService.createBill).toHaveBeenCalledWith('user_001', requestBody);
    });

    it('should return error for negative amount', async () => {
      const requestBody = {
        amount: -100.00,
        dueDate: '2024-04-15',
        units: 359,
        rate: 7.65,
        provider: 'Electricity Board',
        period: '2024-04',
      };

      const request = createMockRequest('/api/billing/bills', 'POST', requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('positive');
    });

    it('should return error for missing required fields', async () => {
      const requestBody = {
        amount: 2750.00,
        // missing other required fields
      };

      const request = createMockRequest('/api/billing/bills', 'POST', requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('required');
    });

    it('should return error for invalid due date format', async () => {
      const requestBody = {
        amount: 2750.00,
        dueDate: 'invalid-date',
        units: 359,
        rate: 7.65,
        provider: 'Electricity Board',
        period: '2024-04',
      };

      const request = createMockRequest('/api/billing/bills', 'POST', requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid date format');
    });

    it('should handle service errors during bill creation', async () => {
      const { getBillService } = require('@/lib/billing/bill-service');
      const mockBillService = getBillService();
      mockBillService.createBill.mockRejectedValue(new Error('Database error'));

      const requestBody = {
        amount: 2750.00,
        dueDate: '2024-04-15',
        units: 359,
        rate: 7.65,
        provider: 'Electricity Board',
        period: '2024-04',
      };

      const request = createMockRequest('/api/billing/bills', 'POST', requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Internal server error');
    });
  });
});
