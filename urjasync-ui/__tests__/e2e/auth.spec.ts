import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should redirect to login page when not authenticated', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/auth\/login/)
    await expect(page.locator('h2')).toContainText('Sign in to your account')
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Try to submit empty form
    await page.click('button[type="submit"]')
    
    // Check for HTML5 validation
    const emailInput = page.locator('input[id="email"]')
    const passwordInput = page.locator('input[id="password"]')
    
    await expect(emailInput).toHaveAttribute('required')
    await expect(passwordInput).toHaveAttribute('required')
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Fill in invalid credentials
    await page.fill('input[id="email"]', 'invalid@example.com')
    await page.fill('input[id="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    // Should show error message
    await expect(page.locator('.bg-red-50')).toBeVisible()
    await expect(page.locator('.text-red-600')).toContainText('Invalid email or password')
  })

  test('should toggle password visibility', async ({ page }) => {
    await page.goto('/auth/login')
    
    const passwordInput = page.locator('input[id="password"]')
    const toggleButton = page.locator('button[type="button"]').filter({ has: page.locator('svg') })
    
    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password')
    
    // Click to show password
    await toggleButton.click()
    await expect(passwordInput).toHaveAttribute('type', 'text')
    
    // Click to hide password again
    await toggleButton.click()
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('should navigate to registration page', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Click on registration link
    await page.click('a[href="/auth/register"]')
    
    await expect(page).toHaveURL(/.*\/auth\/register/)
    await expect(page.locator('h2')).toContainText('Create your account')
  })

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Click on forgot password link
    await page.click('a[href="/auth/forgot-password"]')
    
    await expect(page).toHaveURL(/.*\/auth\/forgot-password/)
  })

  test('should register a new user', async ({ page }) => {
    await page.goto('/auth/register')
    
    // Fill registration form
    const timestamp = Date.now()
    const email = `test${timestamp}@example.com`
    
    await page.fill('input[id="firstName"]', 'John')
    await page.fill('input[id="lastName"]', 'Doe')
    await page.fill('input[id="email"]', email)
    await page.fill('input[id="password"]', 'password123')
    await page.fill('input[id="confirmPassword"]', 'password123')
    await page.fill('input[id="phoneNumber"]', '+1234567890')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should redirect to email verification page
    await expect(page).toHaveURL(/.*\/auth\/verify-email/)
    await expect(page.locator('h2')).toContainText('Verify your email')
  })

  test('should show validation errors for registration form', async ({ page }) => {
    await page.goto('/auth/register')
    
    // Try to submit empty form
    await page.click('button[type="submit"]')
    
    // Check for required fields
    await expect(page.locator('input[id="firstName"]')).toHaveAttribute('required')
    await expect(page.locator('input[id="lastName"]')).toHaveAttribute('required')
    await expect(page.locator('input[id="email"]')).toHaveAttribute('required')
    await expect(page.locator('input[id="password"]')).toHaveAttribute('required')
  })

  test('should show error for password mismatch', async ({ page }) => {
    await page.goto('/auth/register')
    
    // Fill form with mismatched passwords
    await page.fill('input[id="firstName"]', 'John')
    await page.fill('input[id="lastName"]', 'Doe')
    await page.fill('input[id="email"]', 'test@example.com')
    await page.fill('input[id="password"]', 'password123')
    await page.fill('input[id="confirmPassword"]', 'differentpassword')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should show error message
    await expect(page.locator('.text-red-600')).toContainText('Passwords do not match')
  })
})

test.describe('Dashboard Access', () => {
  test('should redirect to dashboard after successful login', async ({ page }) => {
    // Mock successful login response
    await page.route('/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Login successful',
          data: {
            user: {
              id: '1',
              email: 'test@example.com',
              firstName: 'John',
              lastName: 'Doe',
              role: 'user',
              isEmailVerified: true,
              avatar: null,
            },
            tokens: {
              accessToken: 'mock-access-token',
              refreshToken: 'mock-refresh-token',
            },
          },
        }),
      })
    })
    
    await page.goto('/auth/login')
    
    // Fill login form
    await page.fill('input[id="email"]', 'test@example.com')
    await page.fill('input[id="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/)
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should show dashboard elements after login', async ({ page }) => {
    // Mock successful login response
    await page.route('/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Login successful',
          data: {
            user: {
              id: '1',
              email: 'test@example.com',
              firstName: 'John',
              lastName: 'Doe',
              role: 'user',
              isEmailVerified: true,
              avatar: null,
            },
            tokens: {
              accessToken: 'mock-access-token',
              refreshToken: 'mock-refresh-token',
            },
          },
        }),
      })
    })
    
    await page.goto('/auth/login')
    
    // Fill login form
    await page.fill('input[id="email"]', 'test@example.com')
    await page.fill('input[id="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Wait for dashboard to load
    await page.waitForURL(/.*\/dashboard/)
    
    // Check for dashboard elements
    await expect(page.locator('h1')).toContainText('Dashboard')
    await expect(page.locator('[data-testid="stat-cards"]')).toBeVisible()
    await expect(page.locator('[data-testid="energy-chart"]')).toBeVisible()
    await expect(page.locator('[data-testid="appliances-section"]')).toBeVisible()
  })
})
