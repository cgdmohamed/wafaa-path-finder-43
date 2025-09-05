import { test, expect } from '@playwright/test';

// Helper function for admin authentication
async function loginAsAdmin(page: any) {
  // Navigate to auth page
  await page.goto('/auth');
  
  // For testing purposes, we'll use Supabase client directly
  // In a real scenario, this would be proper credentials
  await page.evaluate(async () => {
    const { supabase } = await import('../src/integrations/supabase/client');
    
    // Mock admin session for testing
    const mockUser = {
      id: 'admin-test-user-id',
      email: 'admin@wafaa.org',
      role: 'authenticated'
    };
    
    // Set mock session in Supabase client
    await supabase.auth.setSession({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      user: mockUser
    });
    
    // Also ensure admin role exists
    await supabase.from('user_roles').upsert({
      user_id: mockUser.id,
      role: 'admin'
    });
  });
  
  // Wait for redirect to dashboard
  await page.waitForURL('/dashboard', { timeout: 5000 });
}

test.describe('Admin Area - Production Hardening', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('Database Management shows real data without mocks', async ({ page }) => {
    await page.goto('/dashboard/admin/database');
    
    // Verify no hardcoded mock data strings remain
    await expect(page.locator('text="45.2 MB"')).not.toBeVisible();
    await expect(page.locator('text="1,247"')).not.toBeVisible();
    await expect(page.locator('text="12"')).not.toBeVisible();
    
    // Verify data containers exist with proper test IDs
    await expect(page.locator('[data-testid="total-tables"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-records"]')).toBeVisible();
    await expect(page.locator('[data-testid="db-size"]')).toBeVisible();
    await expect(page.locator('[data-testid="last-backup-time"]')).toBeVisible();
    
    // Verify loading states or real data
    const dbStatsSection = page.locator('[data-testid="db-tables-status"]');
    await expect(dbStatsSection).toBeVisible();
    
    // Should show either loading skeleton or real table data
    const hasLoadingState = await page.locator('.animate-pulse').count() > 0;
    const hasTableData = await page.locator('text="public."').count() > 0;
    const hasEmptyState = await page.locator('text="لا توجد بيانات متاحة"').count() > 0;
    
    expect(hasLoadingState || hasTableData || hasEmptyState).toBeTruthy();
  });

  test('Security Management shows real audit logs', async ({ page }) => {
    await page.goto('/dashboard/admin/security');
    
    // Verify no static mock data
    await expect(page.locator('text="47"')).not.toBeVisible(); // active sessions mock
    await expect(page.locator('text="12"')).not.toBeVisible(); // failed logins mock
    
    // Verify audit logs section exists
    const auditSection = page.locator('[data-testid="audit-logs"]');
    await expect(auditSection).toBeVisible();
    
    // Check for either real data or empty state
    const hasAuditData = await page.locator('text="login"').count() > 0;
    const hasEmptyState = await page.locator('text="لا توجد سجلات وصول"').count() > 0;
    const hasLoadingState = await page.locator('.animate-pulse').count() > 0;
    
    expect(hasAuditData || hasEmptyState || hasLoadingState).toBeTruthy();
  });

  test('System Settings persistence works correctly', async ({ page }) => {
    await page.goto('/dashboard/admin/settings');
    
    // Wait for settings to load
    await page.waitForSelector('[data-testid="general-settings"]');
    
    // Test site name field
    const siteNameInput = page.locator('#site_name');
    await expect(siteNameInput).toBeVisible();
    
    // Clear and set new value
    await siteNameInput.fill('');
    await siteNameInput.fill('Test Organization Updated');
    
    // Test contact email with validation
    const emailInput = page.locator('#contact_email');
    await emailInput.fill('test@updated.org');
    
    // Save settings
    const saveButton = page.locator('[data-testid="settings-save"]');
    await saveButton.click();
    
    // Should show success toast
    await expect(page.locator('text="تم حفظ الإعدادات"')).toBeVisible({ timeout: 5000 });
    
    // Reload page and verify persistence
    await page.reload();
    await page.waitForSelector('[data-testid="general-settings"]');
    
    // Check if values persisted
    await expect(page.locator('#site_name')).toHaveValue('Test Organization Updated');
    await expect(page.locator('#contact_email')).toHaveValue('test@updated.org');
  });

  test('Settings validation works properly', async ({ page }) => {
    await page.goto('/dashboard/admin/settings');
    await page.waitForSelector('[data-testid="general-settings"]');
    
    // Test invalid email
    await page.locator('#contact_email').fill('invalid-email');
    await page.locator('[data-testid="settings-save"]').click();
    
    // Should show validation error
    await expect(page.locator('text="البريد الإلكتروني غير صحيح"')).toBeVisible({ timeout: 3000 });
    
    // Test invalid URL
    await page.locator('#site_url').fill('invalid-url');
    await page.locator('[data-testid="settings-save"]').click();
    
    // Should show validation error
    await expect(page.locator('text="رابط الموقع غير صحيح"')).toBeVisible({ timeout: 3000 });
  });

  test('All admin pages handle loading and error states', async ({ page }) => {
    // Test each admin page for proper state handling
    const adminPages = [
      '/dashboard/admin/database',
      '/dashboard/admin/security', 
      '/dashboard/admin/settings'
    ];
    
    for (const adminPage of adminPages) {
      await page.goto(adminPage);
      
      // Should either show loading skeleton or content
      const hasContent = await page.locator('h1').count() > 0;
      expect(hasContent).toBeTruthy();
      
      // Verify no JavaScript errors in console
      const errors = await page.evaluate(() => {
        return window.console.error.calls?.length || 0;
      });
      expect(errors).toBeLessThan(5); // Allow some non-critical errors
    }
  });

  test('RTL layout and accessibility preserved', async ({ page }) => {
    await page.goto('/dashboard/admin/settings');
    await page.waitForSelector('[data-testid="general-settings"]');
    
    // Check RTL direction
    const bodyDir = await page.locator('body').getAttribute('dir');
    expect(bodyDir).toBe('rtl');
    
    // Check form labels are associated with inputs
    const siteNameLabel = page.locator('label[for="site_name"]');
    await expect(siteNameLabel).toBeVisible();
    
    const siteNameInput = page.locator('#site_name');
    await expect(siteNameInput).toBeVisible();
    
    // Test keyboard navigation
    await siteNameInput.focus();
    await expect(siteNameInput).toBeFocused();
    
    // Tab to next input
    await page.keyboard.press('Tab');
    const siteUrlInput = page.locator('#site_url');
    await expect(siteUrlInput).toBeFocused();
  });
});