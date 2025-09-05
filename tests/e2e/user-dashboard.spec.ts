import { test, expect } from '@playwright/test';

test.describe('User Dashboard Pages', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/auth');
    
    // Mock successful login
    await page.evaluate(() => {
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-user-id', email: 'test@example.com' }
      }));
    });
    
    await page.goto('/dashboard');
  });

  test('should navigate to appointments page and show empty state', async ({ page }) => {
    await page.click('text=المواعيد');
    await expect(page).toHaveURL('/dashboard/appointments');
    await expect(page.locator('text=لا توجد مواعيد')).toBeVisible();
    await expect(page.locator('text=موعد جديد')).toBeVisible();
  });

  test('should navigate to documents page and show upload functionality', async ({ page }) => {
    await page.click('text=المستندات');
    await expect(page).toHaveURL('/dashboard/documents');
    await expect(page.locator('text=رفع مستند')).toBeVisible();
    
    // Test upload dialog
    await page.click('text=رفع مستند');
    await expect(page.locator('text=رفع مستند جديد')).toBeVisible();
    await expect(page.locator('input[type="file"]')).toBeVisible();
  });

  test('should navigate to messages page and show messaging functionality', async ({ page }) => {
    await page.click('text=الرسائل');
    await expect(page).toHaveURL('/dashboard/messages');
    await expect(page.locator('text=رسالة جديدة')).toBeVisible();
    
    // Test new message dialog
    await page.click('text=رسالة جديدة');
    await expect(page.locator('text=أرسلي رسالة للمحاميات والإدارة')).toBeVisible();
    await expect(page.locator('input[placeholder*="موضوع"]')).toBeVisible();
  });

  test('should navigate to profile page and show form validation', async ({ page }) => {
    await page.click('text=الملف الشخصي');
    await expect(page).toHaveURL('/dashboard/profile');
    
    // Test form validation
    await page.fill('input[placeholder="الاسم الكامل"]', 'ا'); // Too short
    await page.fill('input[placeholder="05xxxxxxxx"]', '123'); // Invalid phone
    await page.click('text=حفظ التغييرات');
    
    // Should show validation errors
    await expect(page.locator('text*="الاسم يجب أن يكون حرفين"')).toBeVisible();
    await expect(page.locator('text*="رقم الهاتف يجب أن يبدأ"')).toBeVisible();
  });

  test('should navigate to requests page and create new request', async ({ page }) => {
    await page.goto('/dashboard/requests');
    await expect(page.locator('text=طلبات الخدمة')).toBeVisible();
    
    // Test new request creation
    await page.click('text=طلب جديد');
    await expect(page).toHaveURL('/dashboard/requests/new');
    await expect(page.locator('text=طلب خدمة جديدة')).toBeVisible();
  });

  test('should show breadcrumbs on all pages', async ({ page }) => {
    const pages = [
      { url: '/dashboard/appointments', breadcrumb: 'المواعيد' },
      { url: '/dashboard/documents', breadcrumb: 'المستندات' },
      { url: '/dashboard/messages', breadcrumb: 'الرسائل' },
      { url: '/dashboard/profile', breadcrumb: 'الملف الشخصي' }
    ];

    for (const { url, breadcrumb } of pages) {
      await page.goto(url);
      await expect(page.locator('nav[aria-label="breadcrumb"]')).toBeVisible();
      await expect(page.locator(`text=${breadcrumb}`)).toBeVisible();
      await expect(page.locator('text=الرئيسية')).toBeVisible();
    }
  });

  test('should display user stats on dashboard home', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for stats cards
    await expect(page.locator('text=المواعيد')).toBeVisible();
    await expect(page.locator('text=القضايا')).toBeVisible();
    await expect(page.locator('text=المستندات')).toBeVisible();
    await expect(page.locator('text=الرسائل')).toBeVisible();
    
    // Check for quick actions
    await expect(page.locator('text=إجراءات سريعة')).toBeVisible();
    await expect(page.locator('text=حجز موعد جديد')).toBeVisible();
    await expect(page.locator('text=طلب خدمة جديدة')).toBeVisible();
  });

  test('should handle mobile navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Mobile menu should be visible
    await expect(page.locator('button')).toBeVisible();
    
    // Test mobile sidebar
    await page.click('button[aria-label*="menu" i], button:has-text("Menu"), button:first');
    await expect(page.locator('text=جمعية وفاء')).toBeVisible();
  });
});