import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { test, expect } from '@playwright/test';

test.describe('Complete Dashboard Authentication & Navigation', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('should redirect unauthenticated users to auth page', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to auth page with return URL
    await expect(page).toHaveURL(/\/auth\?redirect=%2Fdashboard/);
    
    // Should show login form
    await expect(page.locator('h1')).toContainText('تسجيل الدخول');
  });

  test('should show unauthorized message for insufficient role', async ({ page }) => {
    // Mock authenticated user with client role
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-user', role: 'client' }
      }));
    });

    await page.goto('/dashboard/admin');
    
    // Should show unauthorized message
    await expect(page.locator('h2')).toContainText('وصول غير مصرح');
    await expect(page.locator('text=ليس لديك الصلاحيات')).toBeVisible();
  });

  test('should allow admin access to all pages including sub-modules', async ({ page }) => {
    // Mock authenticated admin user
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-admin-token',
        user: { id: 'admin-user', role: 'admin' }
      }));
    });

    // Test admin dashboard access
    await page.goto('/dashboard/admin');
    await expect(page.locator('h1')).toContainText('إدارة النظام');
    
    // Test database management access
    await page.goto('/dashboard/admin/database');
    await expect(page.locator('h1')).toContainText('إدارة قاعدة البيانات');
    
    // Test system settings access
    await page.goto('/dashboard/admin/settings');
    await expect(page.locator('h1')).toContainText('إعدادات النظام');
    
    // Test security management access
    await page.goto('/dashboard/admin/security');
    await expect(page.locator('h1')).toContainText('إدارة الأمان');
  });

  test('should navigate between admin modules via buttons', async ({ page }) => {
    // Mock authenticated admin user
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-admin-token',
        user: { id: 'admin-user', role: 'admin' }
      }));
    });

    await page.goto('/dashboard/admin');
    
    // Click on Database Management button
    await page.click('text=فتح إدارة قاعدة البيانات');
    await expect(page).toHaveURL('/dashboard/admin/database');
    await expect(page.locator('h1')).toContainText('إدارة قاعدة البيانات');
    
    // Go back to admin dashboard
    await page.goto('/dashboard/admin');
    
    // Click on System Settings button
    await page.click('text=فتح الإعدادات');
    await expect(page).toHaveURL('/dashboard/admin/settings');
    await expect(page.locator('h1')).toContainText('إعدادات النظام');
    
    // Go back to admin dashboard
    await page.goto('/dashboard/admin');
    
    // Click on Security Management button
    await page.click('text=فتح إدارة الأمان');
    await expect(page).toHaveURL('/dashboard/admin/security');
    await expect(page.locator('h1')).toContainText('إدارة الأمان');
  });
});

test.describe('User Dashboard Pages', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated client user
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-client-token',
        user: { id: 'client-user', role: 'client' }
      }));
    });
  });

  test('should show user dashboard home with stats and quick actions', async ({ page }) => {
    await page.goto('/dashboard');
    
    await expect(page.locator('h1')).toContainText('مرحباً بك');
    await expect(page.locator('text=إليك نظرة سريعة')).toBeVisible();
    await expect(page.locator('text=إجمالي المواعيد')).toBeVisible();
    await expect(page.locator('text=القضايا النشطة')).toBeVisible();
    await expect(page.locator('text=إجراءات سريعة')).toBeVisible();
  });

  test('should navigate to requests page and show empty state', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click on requests link in sidebar
    await page.click('a[href="/dashboard/requests"]');
    
    await expect(page).toHaveURL('/dashboard/requests');
    await expect(page.locator('h1')).toContainText('طلباتي');
    
    // Should show empty state
    await expect(page.locator('text=لا توجد طلبات')).toBeVisible();
    await expect(page.locator('text=إنشاء طلب جديد')).toBeVisible();
  });

  test('should navigate to new request page and validate form', async ({ page }) => {
    await page.goto('/dashboard/requests');
    
    // Click new request button
    await page.click('text=طلب جديد');
    
    await expect(page).toHaveURL('/dashboard/requests/new');
    await expect(page.locator('h1')).toContainText('طلب جديد');
    
    // Try submitting empty form
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('text=العنوان يجب أن يكون')).toBeVisible();
    await expect(page.locator('text=يرجى اختيار نوع القضية')).toBeVisible();
  });

  test('should navigate to appointments page', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.click('a[href="/dashboard/appointments"]');
    
    await expect(page).toHaveURL('/dashboard/appointments');
    await expect(page.locator('h1')).toContainText('مواعيدي');
    await expect(page.locator('text=لا توجد مواعيد')).toBeVisible();
  });

  test('should navigate to documents page', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.click('a[href="/dashboard/documents"]');
    
    await expect(page).toHaveURL('/dashboard/documents');
    await expect(page.locator('h1')).toContainText('مستنداتي');
    await expect(page.locator('text=رفع مستند جديد')).toBeVisible();
  });

  test('should navigate to messages page', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.click('a[href="/dashboard/messages"]');
    
    await expect(page).toHaveURL('/dashboard/messages');
    await expect(page.locator('h1')).toContainText('رسائلي');
    await expect(page.locator('text=رسالة جديدة')).toBeVisible();
  });

  test('should navigate to profile page', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.click('a[href="/dashboard/profile"]');
    
    await expect(page).toHaveURL('/dashboard/profile');
    await expect(page.locator('h1')).toContainText('الملف الشخصي');
    await expect(page.locator('text=الاسم الكامل')).toBeVisible();
  });
});

test.describe('Mobile Responsive Dashboard', () => {
  test('should work correctly on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Mock authenticated user
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-user', role: 'client' }
      }));
    });

    await page.goto('/dashboard');
    
    // Should show mobile header with menu button
    await expect(page.locator('button:has-text("☰")')).toBeVisible();
    
    // Open mobile menu
    await page.click('button:has-text("☰")');
    
    // Should show navigation menu
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('a[href="/dashboard/requests"]')).toBeVisible();
    
    // Navigate to requests from mobile menu
    await page.click('a[href="/dashboard/requests"]');
    await expect(page).toHaveURL('/dashboard/requests');
  });
});

test.describe('Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated user
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-user', role: 'client' }
      }));
    });
  });

  test('should validate new request form with proper error messages', async ({ page }) => {
    await page.goto('/dashboard/requests/new');
    
    // Try submitting without required fields
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('text=العنوان يجب أن يكون 5 أحرف على الأقل')).toBeVisible();
    await expect(page.locator('text=يرجى اختيار نوع القضية')).toBeVisible();
    
    // Fill title with insufficient length
    await page.fill('input[placeholder*="مثال"]', 'قصير');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=العنوان يجب أن يكون 5 أحرف على الأقل')).toBeVisible();
    
    // Fill valid title
    await page.fill('input[placeholder*="مثال"]', 'استشارة قانونية حول عقد العمل');
    
    // Select case type
    await page.click('[role="combobox"]');
    await page.click('text=قضايا عمالية');
    
    // Try submitting without description
    await page.click('button[type="submit"]');
    await expect(page.locator('text=الوصف يجب أن يكون 20 حرف على الأقل')).toBeVisible();
  });

  test('should validate messages form', async ({ page }) => {
    await page.goto('/dashboard/messages');
    
    // Open new message form
    await page.click('text=رسالة جديدة');
    
    // Try submitting empty form
    await page.click('text=إرسال');
    
    // Should show validation error
    await expect(page.locator('text=يرجى ملء جميع الحقول المطلوبة')).toBeVisible();
  });
});

test.describe('Error Handling', () => {
  test('should handle 404 errors gracefully', async ({ page }) => {
    await page.goto('/non-existent-page');
    
    await expect(page.locator('text=404')).toBeVisible();
    await expect(page.locator('text=Page not found')).toBeVisible();
  });

  test('should handle authentication errors', async ({ page }) => {
    // Mock invalid session
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'invalid-token',
        user: null
      }));
    });

    await page.goto('/dashboard');
    
    // Should redirect to auth page
    await expect(page).toHaveURL(/\/auth/);
  });
});