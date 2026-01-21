import { test, expect } from '@playwright/test';

test.describe('Main Landing Page', () => {
  test('should load home page successfully', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page).toHaveURL('http://localhost:3000/');
    await expect(page.locator('h1')).toContainText('UrjaSync');
  });

  test('should display main navigation elements', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check for navigation elements
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('text=Features')).toBeVisible();
    await expect(page.locator('text=Pricing')).toBeVisible();
    await expect(page.locator('text=About')).toBeVisible();
    await expect(page.locator('text=Login')).toBeVisible();
    await expect(page.locator('text=Sign Up')).toBeVisible();
  });

  test('should display hero section', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check hero section
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
    await expect(page.locator('text=Smart Home Energy Management')).toBeVisible();
    await expect(page.locator('text=Get Started')).toBeVisible();
  });

  test('should display features section', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Scroll to features
    await page.locator('text=Features').click();
    
    // Check features
    await expect(page.locator('[data-testid="features-section"]')).toBeVisible();
    await expect(page.locator('text=Energy Monitoring')).toBeVisible();
    await expect(page.locator('text=Smart Appliances')).toBeVisible();
    await expect(page.locator('text=Cost Optimization')).toBeVisible();
  });

  test('should navigate to login page from main nav', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=Login');
    await expect(page).toHaveURL('http://localhost:3000/auth/login');
  });

  test('should navigate to register page from main nav', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=Sign Up');
    await expect(page).toHaveURL('http://localhost:3000/auth/register');
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000');
    
    // Check mobile navigation
    await expect(page.locator('[data-testid="mobile-menu-toggle"]')).toBeVisible();
    
    // Open mobile menu
    await page.click('[data-testid="mobile-menu-toggle"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
  });

  test('should handle CTA button clicks', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Click main CTA
    await page.click('text=Get Started');
    await expect(page).toHaveURL('http://localhost:3000/auth/register');
  });

  test('should display footer with links', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check footer
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('text=Privacy Policy')).toBeVisible();
    await expect(page.locator('text=Terms of Service')).toBeVisible();
    await expect(page.locator('text=Contact')).toBeVisible();
  });
});
