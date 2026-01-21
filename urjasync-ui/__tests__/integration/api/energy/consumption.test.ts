import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, POST } from '../../../../app/api/energy/consumption/route';
import { createMockRequest } from '../../setup'; 

// Mock dependencies
jest.mock('@/lib/energy/energy-service', () => ({
  getEnergyService: jest.fn(() => ({
    getEnergyConsumption: jest.fn(),
    getEnergyConsumptionByDevice: jest.fn(),
    getEnergyConsumptionByPeriod: jest.fn(),
    getRealTimeConsumption: jest.fn(),
    getConsumptionAnalytics: jest.fn(),
  })),
}));

jest.mock('@/lib/auth/auth-middleware', () => ({
  authenticateRequest: jest.fn(() => Promise.resolve({ userId: 'user_001' })),
}));

describe('/api/energy/consumption', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/energy/consumption', () => {
    it('should return energy consumption data for authenticated user', async () => {
      const mockConsumptionData = {
        totalConsumption: 1250.5,
        period: 'daily',
        unit: 'kWh',
        breakdown: {
          heating: 450.2,
          cooling: 320.1,
          lighting: 180.3,
          appliances: 300.0,
        },
        timestamp: new Date().toISOString(),
      };

      const { getEnergyService } = require('@/lib/energy/energy-service');
      const mockEnergyService = getEnergyService();
      mockEnergyService.getEnergyConsumption.mockResolvedValue(mockConsumptionData);

      const searchParams = { period: 'daily' };
      const request = createMockRequest('/api/energy/consumption?' + new URLSearchParams(searchParams), 'GET');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockConsumptionData);
      expect(mockEnergyService.getEnergyConsumption).toHaveBeenCalledWith('user_001', 'daily');
    });

    it('should return consumption data for specific device', async () => {
      const mockDeviceConsumption = {
        deviceId: 'device_001',
        consumption: 125.5,
        efficiency: 0.85,
        status: 'active',
        timestamp: new Date().toISOString(),
      };

      const { getEnergyService } = require('@/lib/energy/energy-service');
      const mockEnergyService = getEnergyService();
      mockEnergyService.getEnergyConsumptionByDevice.mockResolvedValue(mockDeviceConsumption);

      const searchParams = { deviceId: 'device_001' };
      const request = createMockRequest('/api/energy/consumption?' + new URLSearchParams(searchParams), 'GET');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockDeviceConsumption);
      expect(mockEnergyService.getEnergyConsumptionByDevice).toHaveBeenCalledWith('user_001', 'device_001');
    });

    it('should return real-time consumption data', async () => {
      const mockRealTimeData = {
        currentConsumption: 2.5,
        peakConsumption: 3.8,
        averageConsumption: 2.1,
        unit: 'kW',
        timestamp: new Date().toISOString(),
      };

      const { getEnergyService } = require('@/lib/energy/energy-service');
      const mockEnergyService = getEnergyService();
      mockEnergyService.getRealTimeConsumption.mockResolvedValue(mockRealTimeData);

      const searchParams = { realTime: 'true' };
      const request = createMockRequest('/api/energy/consumption?' + new URLSearchParams(searchParams), 'GET');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockRealTimeData);
      expect(mockEnergyService.getRealTimeConsumption).toHaveBeenCalledWith('user_001');
    });

    it('should handle authentication errors', async () => {
      const { authenticateRequest } = require('@/lib/auth/auth-middleware');
      authenticateRequest.mockRejectedValue(new Error('Unauthorized'));

      const request = createMockRequest('/api/energy/consumption', 'GET');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Unauthorized');
    });

    it('should handle service errors gracefully', async () => {
      const { getEnergyService } = require('@/lib/energy/energy-service');
      const mockEnergyService = getEnergyService();
      mockEnergyService.getEnergyConsumption.mockRejectedValue(new Error('Service unavailable'));

      const request = createMockRequest('/api/energy/consumption', 'GET');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Internal server error');
    });
  });

  describe('POST /api/energy/consumption', () => {
    it('should record new energy consumption data', async () => {
      const mockRecordedData = {
        id: 'consumption_001',
        userId: 'user_001',
        deviceId: 'device_001',
        consumption: 125.5,
        timestamp: new Date().toISOString(),
      };

      const { getEnergyService } = require('@/lib/energy/energy-service');
      const mockEnergyService = getEnergyService();
      mockEnergyService.recordConsumption.mockResolvedValue(mockRecordedData);

      const requestBody = {
        deviceId: 'device_001',
        consumption: 125.5,
        unit: 'kWh',
        timestamp: new Date().toISOString(),
      };

      const request = createMockRequest('/api/energy/consumption', 'POST', requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockRecordedData);
      expect(mockEnergyService.recordConsumption).toHaveBeenCalledWith('user_001', requestBody);
    });

    it('should return error for invalid consumption data', async () => {
      const requestBody = {
        deviceId: 'device_001',
        // missing consumption value
      };

      const request = createMockRequest('/api/energy/consumption', 'POST', requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('required');
    });

    it('should return error for negative consumption values', async () => {
      const requestBody = {
        deviceId: 'device_001',
        consumption: -10.5,
        unit: 'kWh',
      };

      const request = createMockRequest('/api/energy/consumption', 'POST', requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('positive');
    });
  });
});
