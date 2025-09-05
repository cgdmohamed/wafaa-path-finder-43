import { test, expect } from '@playwright/test';

test.describe('Dashboard Authentication & Routes', () => {
  test('should redirect to auth when not logged in', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/auth\?redirect/);
    await expect(page.url()).toContain('redirect=%2Fdashboard');
  });

  test('should redirect to auth for protected routes when not logged in', async ({ page }) => {
    const protectedRoutes = [
      '/dashboard/appointments',
      '/dashboard/cases', 
      '/dashboard/documents',
      '/dashboard/messages',
      '/dashboard/profile',
      '/dashboard/admin'
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(/.*\/auth\?redirect/);
      await expect(page.url()).toContain(`redirect=${encodeURIComponent(route)}`);
    }
  });

  test('dashboard pages should load for authenticated users', async ({ page }) => {
    // Note: This test requires authentication setup
    // For now, it's a placeholder that demonstrates the structure
    
    // TODO: Implement authentication in test setup
    // await authenticateUser(page);
    
    const dashboardRoutes = [
      { path: '/dashboard', title: 'لوحة التحكم' },
      { path: '/dashboard/appointments', title: 'المواعيد' },
      { path: '/dashboard/cases', title: 'القضايا' },
      { path: '/dashboard/documents', title: 'المستندات' },
      { path: '/dashboard/messages', title: 'الرسائل' },
      { path: '/dashboard/profile', title: 'الملف الشخصي' }
    ];

    for (const route of dashboardRoutes) {
      await page.goto(route.path);
      // Verify page loads without errors
      await expect(page.locator('h1')).toContainText(route.title);
    }
  });

  test('mobile navigation should work', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // TODO: Add authentication
    // await authenticateUser(page);
    
    await page.goto('/dashboard');
    
    // Test mobile menu toggle
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-sidebar"]')).toBeVisible();
    
    // Test menu item navigation
    await page.click('a[href="/dashboard/appointments"]');
    await expect(page).toHaveURL(/.*\/dashboard\/appointments/);
  });
});

test.describe('Header Responsiveness', () => {
  test('logo should be properly sized on different screen sizes', async ({ page }) => {
    await page.goto('/');
    
    // Test on mobile (320px)
    await page.setViewportSize({ width: 320, height: 568 });
    const logoMobile = page.locator('img[alt*="شعار جمعية وفاء"]');
    await expect(logoMobile).toBeVisible();
    
    // Test on tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(logoMobile).toBeVisible();
    
    // Test on desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(logoMobile).toBeVisible();
  });
});

async function authenticateUser(page: any) {
  // TODO: Implement actual authentication flow
  // This would involve:
  // 1. Going to /auth
  // 2. Filling in valid credentials
  // 3. Submitting the form
  // 4. Waiting for redirect to dashboard
  
  await page.goto('/auth');
  // await page.fill('[data-testid="email-input"]', 'test@example.com');
  // await page.fill('[data-testid="password-input"]', 'password123');
  // await page.click('[data-testid="login-button"]');
  // await page.waitForURL('/dashboard');
}