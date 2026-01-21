import { test, expect } from '@playwright/test';

test.describe('API Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for API tests
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'mock_access_token');
      localStorage.setItem('refreshToken', 'mock_refresh_token');
    });
  });

  test('should test authentication API endpoints', async ({ page, request }) => {
    // Test login API
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        email: 'test@example.com',
        password: 'password123'
      }
    });
    
    expect(loginResponse.status()).toBe(200);
    const loginData = await loginResponse.json();
    expect(loginData.success).toBe(true);
    expect(loginData.data.user.email).toBe('test@example.com');
    expect(loginData.data.tokens.accessToken).toBeDefined();

    // Test register API
    const registerResponse = await request.post('/api/auth/register', {
      data: {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User'
      }
    });
    
    expect(registerResponse.status()).toBe(201);
    const registerData = await registerResponse.json();
    expect(registerData.success).toBe(true);
    expect(registerData.data.user.email).toBe('newuser@example.com');
  });

  test('should test energy API endpoints', async ({ page, request }) => {
    // Test energy consumption API
    const consumptionResponse = await request.get('/api/energy/consumption?period=daily');
    
    expect(consumptionResponse.status()).toBe(200);
    const consumptionData = await consumptionResponse.json();
    expect(consumptionData.success).toBe(true);
    expect(consumptionData.data.totalConsumption).toBeDefined();
    expect(consumptionData.data.period).toBe('daily');

    // Test energy forecasting API
    const forecastResponse = await request.get('/api/energy/forecasting?period=weekly');
    
    expect(forecastResponse.status()).toBe(200);
    const forecastData = await forecastResponse.json();
    expect(forecastData.success).toBe(true);
    expect(forecastData.data.forecast).toBeDefined();
  });

  test('should test devices API endpoints', async ({ page, request }) => {
    // Test get devices API
    const devicesResponse = await request.get('/api/devices');
    
    expect(devicesResponse.status()).toBe(200);
    const devicesData = await devicesResponse.json();
    expect(devicesData.success).toBe(true);
    expect(Array.isArray(devicesData.data)).toBe(true);

    // Test add device API
    const addDeviceResponse = await request.post('/api/devices', {
      data: {
        name: 'Test Device',
        type: 'thermostat',
        manufacturer: 'Test Corp',
        model: 'TC-001'
      }
    });
    
    expect(addDeviceResponse.status()).toBe(201);
    const addDeviceData = await addDeviceResponse.json();
    expect(addDeviceData.success).toBe(true);
    expect(addDeviceData.data.name).toBe('Test Device');
  });

  test('should test billing API endpoints', async ({ page, request }) => {
    // Test get bills API
    const billsResponse = await request.get('/api/billing/bills');
    
    expect(billsResponse.status()).toBe(200);
    const billsData = await billsResponse.json();
    expect(billsData.success).toBe(true);
    expect(Array.isArray(billsData.data)).toBe(true);

    // Test create bill API
    const createBillResponse = await request.post('/api/billing/bills', {
      data: {
        amount: 2750.00,
        dueDate: '2024-04-15',
        units: 359,
        rate: 7.65,
        provider: 'Electricity Board',
        period: '2024-04'
      }
    });
    
    expect(createBillResponse.status()).toBe(201);
    const createBillData = await createBillResponse.json();
    expect(createBillData.success).toBe(true);
    expect(createBillData.data.amount).toBe(2750.00);
  });

  test('should test notifications API endpoints', async ({ page, request }) => {
    // Test get alerts API
    const alertsResponse = await request.get('/api/notifications/alerts');
    
    expect(alertsResponse.status()).toBe(200);
    const alertsData = await alertsResponse.json();
    expect(alertsData.success).toBe(true);
    expect(Array.isArray(alertsData.data)).toBe(true);

    // Test create alert API
    const createAlertResponse = await request.post('/api/notifications/alerts', {
      data: {
        deviceId: 'device_003',
        severity: 'medium',
        category: 'maintenance',
        message: 'Device maintenance required'
      }
    });
    
    expect(createAlertResponse.status()).toBe(201);
    const createAlertData = await createAlertResponse.json();
    expect(createAlertData.success).toBe(true);
    expect(createAlertData.data.severity).toBe('medium');
  });

  test('should test analytics API endpoints', async ({ page, request }) => {
    // Test analytics API
    const analyticsResponse = await request.get('/api/analytics/enhanced?period=monthly');
    
    expect(analyticsResponse.status()).toBe(200);
    const analyticsData = await analyticsResponse.json();
    expect(analyticsData.success).toBe(true);
    expect(analyticsData.data.analytics).toBeDefined();

    // Test predictions API
    const predictionsResponse = await request.get('/api/analytics/predictions?type=consumption');
    
    expect(predictionsResponse.status()).toBe(200);
    const predictionsData = await predictionsResponse.json();
    expect(predictionsData.success).toBe(true);
    expect(predictionsData.data.predictions).toBeDefined();
  });

  test('should test maintenance API endpoints', async ({ page, request }) => {
    // Test health API
    const healthResponse = await request.get('/api/maintenance/health');
    
    expect(healthResponse.status()).toBe(200);
    const healthData = await healthResponse.json();
    expect(healthData.success).toBe(true);
    expect(healthData.data.health).toBeDefined();

    // Test schedule API
    const scheduleResponse = await request.get('/api/maintenance/schedule');
    
    expect(scheduleResponse.status()).toBe(200);
    const scheduleData = await scheduleResponse.json();
    expect(scheduleData.success).toBe(true);
    expect(scheduleData.data.schedule).toBeDefined();
  });

  test('should handle API authentication errors', async ({ page, request }) => {
    // Test without authentication
    await page.addInitScript(() => {
      localStorage.clear();
    });

    const response = await request.get('/api/energy/consumption');
    expect(response.status()).toBe(401);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Unauthorized');
  });

  test('should handle API validation errors', async ({ page, request }) => {
    // Test invalid data
    const response = await request.post('/api/devices', {
      data: {
        name: '', // Invalid empty name
        type: 'invalid_type'
      }
    });
    
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('required');
  });

  test('should handle API rate limiting', async ({ page, request }) => {
    // Test rate limiting (mock multiple rapid requests)
    const promises = Array(10).fill(null).map(() => 
      request.post('/api/auth/login', {
        data: {
          email: 'test@example.com',
          password: 'password123'
        }
      })
    );

    const responses = await Promise.all(promises);
    
    // At least one should be rate limited
    const rateLimitedResponses = responses.filter(r => r.status() === 429);
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });
});
