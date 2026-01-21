import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, POST } from '../../../../app/api/notifications/alerts/route';
import { createMockRequest } from '../../setup';

// Mock dependencies
jest.mock('@/lib/notifications/alert-service', () => ({
  getAlertService: jest.fn(() => ({
    getAlerts: jest.fn(),
    getAlert: jest.fn(),
    createAlert: jest.fn(),
    updateAlert: jest.fn(),
    deleteAlert: jest.fn(),
    acknowledgeAlert: jest.fn(),
    resolveAlert: jest.fn(),
    getAlertStats: jest.fn(),
  })),
}));

jest.mock('@/lib/auth/auth-middleware', () => ({
  authenticateRequest: jest.fn(() => Promise.resolve({ userId: 'user_001' })),
}));

describe('/api/notifications/alerts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/notifications/alerts', () => {
    it('should return all alerts for authenticated user', async () => {
      const mockAlerts = [
        {
          id: 'alert_001',
          userId: 'user_001',
          deviceId: 'device_001',
          severity: 'high',
          category: 'energy_usage',
          message: 'High energy consumption detected',
          timestamp: new Date().toISOString(),
          status: 'active',
        },
        {
          id: 'alert_002',
          userId: 'user_001',
          deviceId: 'device_002',
          severity: 'medium',
          category: 'device_health',
          message: 'Device efficiency below optimal',
          timestamp: new Date().toISOString(),
          status: 'acknowledged',
        },
      ];

      const { getAlertService } = require('@/lib/notifications/alert-service');
      const mockAlertService = getAlertService();
      mockAlertService.getAlerts.mockResolvedValue(mockAlerts);

      const request = createMockRequest('/api/notifications/alerts', 'GET');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockAlerts);
      expect(data.data).toHaveLength(2);
      expect(mockAlertService.getAlerts).toHaveBeenCalledWith('user_001');
    });

    it('should return alerts filtered by severity', async () => {
      const mockAlerts = [
        {
          id: 'alert_001',
          userId: 'user_001',
          deviceId: 'device_001',
          severity: 'high',
          category: 'energy_usage',
          message: 'High energy consumption detected',
          timestamp: new Date().toISOString(),
          status: 'active',
        },
      ];

      const { getAlertService } = require('@/lib/notifications/alert-service');
      const mockAlertService = getAlertService();
      mockAlertService.getAlerts.mockResolvedValue(mockAlerts);

      const searchParams = { severity: 'high' };
      const request = createMockRequest('/api/notifications/alerts?' + new URLSearchParams(searchParams), 'GET');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockAlerts);
      expect(mockAlertService.getAlerts).toHaveBeenCalledWith('user_001', { severity: 'high' });
    });

    it('should return alerts filtered by status', async () => {
      const mockAlerts = [
        {
          id: 'alert_001',
          userId: 'user_001',
          deviceId: 'device_001',
          severity: 'high',
          category: 'energy_usage',
          message: 'High energy consumption detected',
          timestamp: new Date().toISOString(),
          status: 'active',
        },
      ];

      const { getAlertService } = require('@/lib/notifications/alert-service');
      const mockAlertService = getAlertService();
      mockAlertService.getAlerts.mockResolvedValue(mockAlerts);

      const searchParams = { status: 'active' };
      const request = createMockRequest('/api/notifications/alerts?' + new URLSearchParams(searchParams), 'GET');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockAlerts);
      expect(mockAlertService.getAlerts).toHaveBeenCalledWith('user_001', { status: 'active' });
    });

    it('should return empty array when no alerts found', async () => {
      const { getAlertService } = require('@/lib/notifications/alert-service');
      const mockAlertService = getAlertService();
      mockAlertService.getAlerts.mockResolvedValue([]);

      const request = createMockRequest('/api/notifications/alerts', 'GET');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
      expect(data.data).toHaveLength(0);
    });

    it('should handle authentication errors', async () => {
      const { authenticateRequest } = require('@/lib/auth/auth-middleware');
      authenticateRequest.mockRejectedValue(new Error('Unauthorized'));

      const request = createMockRequest('/api/notifications/alerts', 'GET');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Unauthorized');
    });

    it('should handle service errors gracefully', async () => {
      const { getAlertService } = require('@/lib/notifications/alert-service');
      const mockAlertService = getAlertService();
      mockAlertService.getAlerts.mockRejectedValue(new Error('Service unavailable'));

      const request = createMockRequest('/api/notifications/alerts', 'GET');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Internal server error');
    });
  });

  describe('POST /api/notifications/alerts', () => {
    it('should create new alert successfully', async () => {
      const mockNewAlert = {
        id: 'alert_003',
        userId: 'user_001',
        deviceId: 'device_003',
        severity: 'medium',
        category: 'maintenance',
        message: 'Device maintenance required',
        timestamp: new Date().toISOString(),
        status: 'active',
      };

      const { getAlertService } = require('@/lib/notifications/alert-service');
      const mockAlertService = getAlertService();
      mockAlertService.createAlert.mockResolvedValue(mockNewAlert);

      const requestBody = {
        deviceId: 'device_003',
        severity: 'medium',
        category: 'maintenance',
        message: 'Device maintenance required',
      };

      const request = createMockRequest('/api/notifications/alerts', 'POST', requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockNewAlert);
      expect(mockAlertService.createAlert).toHaveBeenCalledWith('user_001', requestBody);
    });

    it('should return error for invalid severity', async () => {
      const requestBody = {
        deviceId: 'device_003',
        severity: 'invalid',
        category: 'maintenance',
        message: 'Device maintenance required',
      };

      const request = createMockRequest('/api/notifications/alerts', 'POST', requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid severity');
    });

    it('should return error for missing required fields', async () => {
      const requestBody = {
        deviceId: 'device_003',
        // missing severity, category, message
      };

      const request = createMockRequest('/api/notifications/alerts', 'POST', requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('required');
    });

    it('should handle service errors during alert creation', async () => {
      const { getAlertService } = require('@/lib/notifications/alert-service');
      const mockAlertService = getAlertService();
      mockAlertService.createAlert.mockRejectedValue(new Error('Database error'));

      const requestBody = {
        deviceId: 'device_003',
        severity: 'medium',
        category: 'maintenance',
        message: 'Device maintenance required',
      };

      const request = createMockRequest('/api/notifications/alerts', 'POST', requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Internal server error');
    });
  });
});
