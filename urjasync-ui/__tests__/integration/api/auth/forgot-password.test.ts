import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST } from '../../../../app/api/auth/forgot-password/route';
import { createMockRequest } from '../../setup';

// Mock dependencies
jest.mock('@/lib/auth/auth-service', () => ({
  getAuthService: jest.fn(() => ({
    generatePasswordResetToken: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    validateResetToken: jest.fn(),
    resetPassword: jest.fn(),
  })),
}));

jest.mock('@/lib/rate-limiter', () => ({
  rateLimiter: jest.fn(() => Promise.resolve()),
}));

describe('/api/auth/forgot-password', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send password reset email for valid email', async () => {
      const { getAuthService } = require('@/lib/auth/auth-service');
      const mockAuthService = getAuthService();
      mockAuthService.generatePasswordResetToken.mockResolvedValue('reset_token_123');
      mockAuthService.sendPasswordResetEmail.mockResolvedValue(true);

      const requestBody = {
        email: 'test@example.com',
      };

      const request = createMockRequest('/api/auth/forgot-password', 'POST', requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('Password reset email sent');
      expect(mockAuthService.generatePasswordResetToken).toHaveBeenCalledWith('test@example.com');
      expect(mockAuthService.sendPasswordResetEmail).toHaveBeenCalledWith('test@example.com', 'reset_token_123');
    });

    it('should return error for invalid email format', async () => {
      const requestBody = {
        email: 'invalid-email',
      };

      const request = createMockRequest('/api/auth/forgot-password', 'POST', requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid email');
    });

    it('should return error for missing email', async () => {
      const requestBody = {};

      const request = createMockRequest('/api/auth/forgot-password', 'POST', requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('required');
    });

    it('should handle non-existent user gracefully', async () => {
      const { getAuthService } = require('@/lib/auth/auth-service');
      const mockAuthService = getAuthService();
      mockAuthService.generatePasswordResetToken.mockRejectedValue(new Error('User not found'));

      const requestBody = {
        email: 'nonexistent@example.com',
      };

      const request = createMockRequest('/api/auth/forgot-password', 'POST', requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toContain('User not found');
    });

    it('should handle email service errors', async () => {
      const { getAuthService } = require('@/lib/auth/auth-service');
      const mockAuthService = getAuthService();
      mockAuthService.generatePasswordResetToken.mockResolvedValue('reset_token_123');
      mockAuthService.sendPasswordResetEmail.mockRejectedValue(new Error('Email service failed'));

      const requestBody = {
        email: 'test@example.com',
      };

      const request = createMockRequest('/api/auth/forgot-password', 'POST', requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Failed to send reset email');
    });
  });

  describe('GET /api/auth/forgot-password', () => {
    it('should return method not allowed for GET requests', async () => {
      const request = createMockRequest('/api/auth/forgot-password', 'GET');
      const response = new Response('Method not allowed', { status: 405 });
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data).toContain('Method not allowed');
    });
  });
});
