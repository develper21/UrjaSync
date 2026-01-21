import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, POST } from '../../../../app/api/devices/route';
import { createMockRequest } from '../../setup';

// Mock dependencies
jest.mock('@/lib/devices/device-service', () => ({
  getDeviceService: jest.fn(() => ({
    getDevices: jest.fn(),
    getDevice: jest.fn(),
    addDevice: jest.fn(),
    updateDevice: jest.fn(),
    deleteDevice: jest.fn(),
    discoverDevices: jest.fn(),
  })),
}));

jest.mock('@/lib/auth/auth-middleware', () => ({
  authenticateRequest: jest.fn(() => Promise.resolve({ userId: 'user_001' })),
}));

describe('/api/devices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/devices', () => {
    it('should return all devices for authenticated user', async () => {
      const mockDevices = [
        {
          id: 'device_001',
          name: 'Smart Thermostat',
          type: 'thermostat',
          status: 'online',
          consumption: 125.5,
          efficiency: 0.85,
        },
        {
          id: 'device_002',
          name: 'Smart Light',
          type: 'lighting',
          status: 'online',
          consumption: 45.2,
          efficiency: 0.90,
        },
      ];

      const { getDeviceService } = require('@/lib/devices/device-service');
      const mockDeviceService = getDeviceService();
      mockDeviceService.getDevices.mockResolvedValue(mockDevices);

      const request = createMockRequest('/api/devices', 'GET');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockDevices);
      expect(data.data).toHaveLength(2);
      expect(mockDeviceService.getDevices).toHaveBeenCalledWith('user_001');
    });

    it('should return devices filtered by type', async () => {
      const mockDevices = [
        {
          id: 'device_001',
          name: 'Smart Thermostat',
          type: 'thermostat',
          status: 'online',
          consumption: 125.5,
        },
      ];

      const { getDeviceService } = require('@/lib/devices/device-service');
      const mockDeviceService = getDeviceService();
      mockDeviceService.getDevices.mockResolvedValue(mockDevices);

      const searchParams = { type: 'thermostat' };
      const request = createMockRequest('/api/devices?' + new URLSearchParams(searchParams), 'GET');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockDevices);
      expect(mockDeviceService.getDevices).toHaveBeenCalledWith('user_001', { type: 'thermostat' });
    });

    it('should return empty array when no devices found', async () => {
      const { getDeviceService } = require('@/lib/devices/device-service');
      const mockDeviceService = getDeviceService();
      mockDeviceService.getDevices.mockResolvedValue([]);

      const request = createMockRequest('/api/devices', 'GET');
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

      const request = createMockRequest('/api/devices', 'GET');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Unauthorized');
    });

    it('should handle service errors gracefully', async () => {
      const { getDeviceService } = require('@/lib/devices/device-service');
      const mockDeviceService = getDeviceService();
      mockDeviceService.getDevices.mockRejectedValue(new Error('Service unavailable'));

      const request = createMockRequest('/api/devices', 'GET');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Internal server error');
    });
  });

  describe('POST /api/devices', () => {
    it('should add new device successfully', async () => {
      const mockNewDevice = {
        id: 'device_003',
        name: 'Smart Plug',
        type: 'plug',
        status: 'offline',
        userId: 'user_001',
        createdAt: new Date().toISOString(),
      };

      const { getDeviceService } = require('@/lib/devices/device-service');
      const mockDeviceService = getDeviceService();
      mockDeviceService.addDevice.mockResolvedValue(mockNewDevice);

      const requestBody = {
        name: 'Smart Plug',
        type: 'plug',
        manufacturer: 'SmartHome Inc',
        model: 'SH-PLG-001',
      };

      const request = createMockRequest('/api/devices', 'POST', requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockNewDevice);
      expect(mockDeviceService.addDevice).toHaveBeenCalledWith('user_001', requestBody);
    });

    it('should return error for duplicate device name', async () => {
      const { getDeviceService } = require('@/lib/devices/device-service');
      const mockDeviceService = getDeviceService();
      mockDeviceService.addDevice.mockRejectedValue(new Error('Device name already exists'));

      const requestBody = {
        name: 'Smart Thermostat',
        type: 'thermostat',
      };

      const request = createMockRequest('/api/devices', 'POST', requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Device name already exists');
    });

    it('should return error for missing required fields', async () => {
      const requestBody = {
        name: 'Smart Plug',
        // missing type
      };

      const request = createMockRequest('/api/devices', 'POST', requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('required');
    });

    it('should return error for invalid device type', async () => {
      const requestBody = {
        name: 'Invalid Device',
        type: 'invalid_type',
      };

      const request = createMockRequest('/api/devices', 'POST', requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid device type');
    });

    it('should handle service errors during device addition', async () => {
      const { getDeviceService } = require('@/lib/devices/device-service');
      const mockDeviceService = getDeviceService();
      mockDeviceService.addDevice.mockRejectedValue(new Error('Database error'));

      const requestBody = {
        name: 'Smart Plug',
        type: 'plug',
      };

      const request = createMockRequest('/api/devices', 'POST', requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Internal server error');
    });
  });
});
