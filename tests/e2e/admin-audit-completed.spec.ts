import { test, expect } from '@playwright/test';

test.describe('Admin Area - Real Data Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    // Add admin login steps here when auth is ready
  });

  test('Database Management shows real data', async ({ page }) => {
    await page.goto('/dashboard/admin/database');
    
    // Verify no mock data strings remain
    await expect(page.locator('text=45.2 MB')).not.toBeVisible();
    await expect(page.locator('text=1,247')).not.toBeVisible();
    
    // Verify real data or empty states
    const totalTables = page.locator('[data-testid="total-tables"]');
    await expect(totalTables).toBeVisible();
    
    // Should show loading skeleton or real data
    await expect(page.locator('.animate-pulse, [data-testid="db-stats"]')).toBeVisible();
  });

  test('Security Management shows real audit logs', async ({ page }) => {
    await page.goto('/dashboard/admin/security');
    
    // Verify no static security data
    await expect(page.locator('text=admin@wafaa.org')).not.toBeVisible();
    await expect(page.locator('text=2.4 MB')).not.toBeVisible();
    
    // Should show real logs or empty state
    const auditSection = page.locator('[data-testid="audit-logs"]');
    await expect(auditSection).toBeVisible();
  });

  test('System Settings persistence works', async ({ page }) => {
    await page.goto('/dashboard/admin/settings');
    
    // Test saving settings
    await page.fill('#site_name', 'Test Organization');
    await page.click('button:has-text("حفظ التغييرات")');
    
    // Should show success toast
    await expect(page.locator('text=تم حفظ الإعدادات')).toBeVisible();
    
    // Reload and verify persistence
    await page.reload();
    await expect(page.locator('#site_name')).toHaveValue('Test Organization');
  });
});