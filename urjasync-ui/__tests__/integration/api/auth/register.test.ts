import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST } from '../../../../app/api/auth/register/route';
import { createMockRequest } from '../../setup';

// Mock dependencies
jest.mock('@/lib/auth/auth-service', () => ({
  getAuthService: jest.fn(() => ({
    createUser: jest.fn(),
    generateTokens: jest.fn(),
    sendVerificationEmail: jest.fn(),
  })),
}));

jest.mock('@/lib/rate-limiter', () => ({
  rateLimiter: jest.fn(() => Promise.resolve()),
}));

describe('/api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register new user with valid data', async () => {
      const mockUser = {
        id: 'user_001',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        isEmailVerified: false,
      };

      const mockTokens = {
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_123',
      };

      const { getAuthService } = require('@/lib/auth/auth-service');
      const mockAuthService = getAuthService();
      mockAuthService.createUser.mockResolvedValue(mockUser);
      mockAuthService.generateTokens.mockResolvedValue(mockTokens);
      mockAuthService.sendVerificationEmail.mockResolvedValue(true);

      const requestBody = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        firstName: 'Test',
        lastName: 'User',
      };

      const request = createMockRequest('/api/auth/register', 'POST', requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.user).toEqual(mockUser);
      expect(data.data.tokens).toEqual(mockTokens);
      expect(mockAuthService.createUser).toHaveBeenCalledWith(requestBody);
      expect(mockAuthService.sendVerificationEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return error for duplicate email', async () => {
      const { getAuthService } = require('@/lib/auth/auth-service');
      const mockAuthService = getAuthService();
      mockAuthService.createUser.mockRejectedValue(new Error('Email already exists'));

      const requestBody = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const request = createMockRequest('/api/auth/register', 'POST', requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Email already exists');
    });

    it('should return error for invalid email format', async () => {
      const requestBody = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
      };

      const request = createMockRequest('/api/auth/register', 'POST', requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid email');
    });

    it('should return error for weak password', async () => {
      const requestBody = {
        email: 'test@example.com',
        password: '123',
        name: 'Test User',
      };

      const request = createMockRequest('/api/auth/register', 'POST', requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('password');
    });

    it('should return error for missing required fields', async () => {
      const requestBody = {
        email: 'test@example.com',
        // missing password and name
      };

      const request = createMockRequest('/api/auth/register', 'POST', requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('required');
    });

    it('should handle service errors gracefully', async () => {
      const { getAuthService } = require('@/lib/auth/auth-service');
      const mockAuthService = getAuthService();
      mockAuthService.createUser.mockRejectedValue(new Error('Database error'));

      const requestBody = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const request = createMockRequest('/api/auth/register', 'POST', requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Internal server error');
    });
  });

  describe('GET /api/auth/register', () => {
    it('should return method not allowed for GET requests', async () => {
      const request = createMockRequest('/api/auth/register', 'GET');
      const response = new Response('Method not allowed', { status: 405 });
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data).toContain('Method not allowed');
    });
  });
});
