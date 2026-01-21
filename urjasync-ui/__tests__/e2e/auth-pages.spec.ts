import { test, expect } from '@playwright/test';

test.describe('Authentication Pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should navigate to login page', async ({ page }) => {
    await page.click('text=Login');
    await expect(page).toHaveURL('http://localhost:3000/auth/login');
    await expect(page.locator('h1')).toContainText('Sign In');
  });

  test('should display login form elements', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/login');
    
    // Check form elements
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('text=Forgot Password?')).toBeVisible();
    await expect(page.locator('text=Don\'t have an account?')).toBeVisible();
  });

  test('should show validation errors for empty login form', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/login');
    
    // Submit empty form
    await page.click('button[type="submit"]');
    
    // Check for validation errors
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/login');
    
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Invalid email format')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/login');
    await page.click('text=Sign Up');
    await expect(page).toHaveURL('http://localhost:3000/auth/register');
    await expect(page.locator('h1')).toContainText('Create Account');
  });

  test('should display register form elements', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/register');
    
    // Check form elements
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('text=Already have an account?')).toBeVisible();
  });

  test('should show validation errors for empty register form', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/register');
    
    // Submit empty form
    await page.click('button[type="submit"]');
    
    // Check for validation errors
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
    await expect(page.locator('text=First name is required')).toBeVisible();
    await expect(page.locator('text=Last name is required')).toBeVisible();
  });

  test('should show error for password mismatch', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/register');
    
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'different123');
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/login');
    await page.click('text=Forgot Password?');
    await expect(page).toHaveURL('http://localhost:3000/auth/forgot-password');
    await expect(page.locator('h1')).toContainText('Reset Password');
  });

  test('should display forgot password form elements', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/forgot-password');
    
    // Check form elements
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('text=Back to Login')).toBeVisible();
  });

  test('should show validation error for empty email in forgot password', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/forgot-password');
    
    // Submit empty form
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Email is required')).toBeVisible();
  });

  test('should navigate to reset password page with token', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/reset-password?token=reset_token_123');
    await expect(page.locator('h1')).toContainText('Set New Password');
    
    // Check form elements
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should navigate to verify email page', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/verify-email?token=verify_token_123');
    await expect(page.locator('h1')).toContainText('Verify Email');
  });
});
