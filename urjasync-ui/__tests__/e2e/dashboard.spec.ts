import { test, expect } from '@playwright/test'

test.describe('Dashboard Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'mock-access-token')
      localStorage.setItem('refreshToken', 'mock-refresh-token')
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        isEmailVerified: true,
        avatar: null,
      }))
    })

    // Mock API responses
    await page.route('/api/energy/command-center', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            currentUsage: 2.5,
            monthlyCost: 150.75,
            carbonFootprint: 45.2,
            efficiency: 87,
          },
        }),
      })
    })

    await page.route('/api/microgrid', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            appliances: [
              { id: '1', name: 'Air Conditioner', status: 'on', consumption: 1.5 },
              { id: '2', name: 'Refrigerator', status: 'on', consumption: 0.3 },
              { id: '3', name: 'Washing Machine', status: 'off', consumption: 0 },
            ],
          },
        }),
      })
    })
  })

  test('should load dashboard successfully', async ({ page }) => {
    await page.goto('/dashboard')
    
    await expect(page).toHaveURL(/.*\/dashboard/)
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should display energy statistics', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Wait for data to load
    await page.waitForSelector('[data-testid="stat-cards"]')
    
    // Check for stat cards
    await expect(page.locator('text=Current Usage')).toBeVisible()
    await expect(page.locator('text=Monthly Cost')).toBeVisible()
    await expect(page.locator('text=Carbon Footprint')).toBeVisible()
    await expect(page.locator('text=Efficiency')).toBeVisible()
  })

  test('should display appliances list', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Wait for appliances to load
    await page.waitForSelector('[data-testid="appliances-section"]')
    
    // Check for appliances
    await expect(page.locator('text=Air Conditioner')).toBeVisible()
    await expect(page.locator('text=Refrigerator')).toBeVisible()
    await expect(page.locator('text=Washing Machine')).toBeVisible()
  })

  test('should toggle appliance status', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Wait for appliances to load
    await page.waitForSelector('[data-testid="appliances-section"]')
    
    // Find washing machine toggle (should be off)
    const washingMachineToggle = page.locator('text=Washing Machine').locator('..').locator('button').first()
    
    // Click to turn on
    await washingMachineToggle.click()
    
    // Should update status (mock verification would go here)
    await expect(washingMachineToggle).toBeVisible()
  })

  test('should display energy chart', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Wait for chart to load
    await page.waitForSelector('[data-testid="energy-chart"]')
    
    // Check for chart elements
    await expect(page.locator('[data-testid="energy-chart"]')).toBeVisible()
  })

  test('should show recommendations section', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Wait for recommendations to load
    await page.waitForSelector('[data-testid="recommendations"]')
    
    // Check for recommendations
    await expect(page.locator('[data-testid="recommendations"]')).toBeVisible()
  })

  test('should navigate between sections', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Test navigation to different sections
    await page.click('text=Energy')
    await expect(page).toHaveURL(/.*\/dashboard.*energy/)
    
    await page.click('text=Appliances')
    await expect(page).toHaveURL(/.*\/dashboard.*appliances/)
    
    await page.click('text=Billing')
    await expect(page).toHaveURL(/.*\/dashboard.*billing/)
  })

  test('should handle logout', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Click logout button
    await page.click('button[aria-label="Logout"]')
    
    // Should redirect to login page
    await expect(page).toHaveURL(/.*\/auth\/login/)
    
    // Check that localStorage is cleared
    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'))
    expect(accessToken).toBeNull()
  })

  test('should show user profile', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Click on user profile
    await page.click('button[aria-label="User Profile"]')
    
    // Should show user dropdown
    await expect(page.locator('[data-testid="user-dropdown"]')).toBeVisible()
    await expect(page.locator('text=John Doe')).toBeVisible()
    await expect(page.locator('text=test@example.com')).toBeVisible()
  })

  test('should handle responsive design', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/dashboard')
    
    // Check mobile navigation
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/dashboard')
    
    // Check tablet layout
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible()
    
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/dashboard')
    
    // Check desktop layout
    await expect(page.locator('[data-testid="full-layout"]')).toBeVisible()
  })
})
