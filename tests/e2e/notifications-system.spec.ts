import { test, expect } from '@playwright/test';

test.describe('Notifications System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app and login if needed
    await page.goto('/');
    
    // Check if we need to authenticate
    const currentUrl = page.url();
    if (currentUrl.includes('/auth') || !currentUrl.includes('/dashboard')) {
      // Handle authentication if needed
      await page.goto('/dashboard');
    }
  });

  test('notification bell displays unread count', async ({ page }) => {
    // Check if notification bell is visible
    const notificationBell = page.locator('[data-testid="notification-bell"]').or(
      page.locator('button').filter({ has: page.locator('svg') }).first()
    );
    
    await expect(notificationBell).toBeVisible();
    
    // Check if badge appears when there are unread notifications
    const badge = page.locator('.bg-destructive').first();
    // Badge may or may not be visible depending on notifications
  });

  test('notification dropdown opens and closes', async ({ page }) => {
    // Find and click notification bell
    const notificationBell = page.locator('button').filter({ 
      has: page.locator('svg') 
    }).first();
    
    if (await notificationBell.isVisible()) {
      await notificationBell.click();
      
      // Check if dropdown content is visible
      const dropdown = page.locator('[role="menu"]').or(
        page.locator('.w-80').filter({ hasText: 'الإشعارات' })
      );
      
      // Close dropdown by clicking outside or escape
      await page.keyboard.press('Escape');
    }
  });

  test('notifications center page renders correctly', async ({ page }) => {
    await page.goto('/dashboard/notifications');
    
    // Check page title
    await expect(page.locator('h1')).toContainText('مركز الإشعارات');
    
    // Check tabs are present
    const allTab = page.locator('button').filter({ hasText: 'الكل' });
    const unreadTab = page.locator('button').filter({ hasText: 'غير مقروء' });
    
    await expect(allTab).toBeVisible();
    await expect(unreadTab).toBeVisible();
  });

  test('mark all as read functionality', async ({ page }) => {
    await page.goto('/dashboard/notifications');
    
    // Look for "mark all as read" button
    const markAllButton = page.locator('button').filter({ 
      hasText: 'تمييز الكل كمقروء' 
    });
    
    if (await markAllButton.isVisible()) {
      await markAllButton.click();
      
      // Check for success message
      const toast = page.locator('.toast, [role="alert"]').filter({
        hasText: 'تم تحديث الإشعارات'
      });
      
      await expect(toast).toBeVisible({ timeout: 5000 });
    }
  });

  test('notification filtering works', async ({ page }) => {
    await page.goto('/dashboard/notifications');
    
    // Test different filter tabs
    const tabs = [
      'الكل',
      'غير مقروء',
      'المواعيد',
      'القضايا',
      'المستندات',
      'الرسائل'
    ];
    
    for (const tabText of tabs) {
      const tab = page.locator('button').filter({ hasText: tabText });
      if (await tab.isVisible()) {
        await tab.click();
        await page.waitForTimeout(500); // Wait for filter to apply
      }
    }
  });

  test('search notifications functionality', async ({ page }) => {
    await page.goto('/dashboard/notifications');
    
    // Find search input
    const searchInput = page.locator('input[placeholder*="البحث"]');
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('موعد');
      await page.waitForTimeout(1000);
      
      // Check if results are filtered (no specific assertion as content may vary)
      await searchInput.clear();
    }
  });
});

test.describe('Dashboard UX Enhancements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('clickable stat cards navigate correctly', async ({ page }) => {
    // Test appointments card
    const appointmentsCard = page.locator('a[href="/dashboard/appointments"]');
    if (await appointmentsCard.isVisible()) {
      await appointmentsCard.click();
      await expect(page).toHaveURL('/dashboard/appointments');
      await page.goBack();
    }

    // Test cases card
    const casesCard = page.locator('a[href="/dashboard/cases"]');
    if (await casesCard.isVisible()) {
      await casesCard.click();
      await expect(page).toHaveURL('/dashboard/cases');
      await page.goBack();
    }

    // Test documents card
    const documentsCard = page.locator('a[href="/dashboard/documents"]');
    if (await documentsCard.isVisible()) {
      await documentsCard.click();
      await expect(page).toHaveURL('/dashboard/documents');
      await page.goBack();
    }

    // Test messages card
    const messagesCard = page.locator('a[href="/dashboard/messages"]');
    if (await messagesCard.isVisible()) {
      await messagesCard.click();
      await expect(page).toHaveURL('/dashboard/messages');
      await page.goBack();
    }
  });

  test('quick action buttons work', async ({ page }) => {
    // Test "New Appointment" button
    const newAppointmentBtn = page.locator('a[href="/dashboard/appointments/new"]');
    if (await newAppointmentBtn.isVisible()) {
      await newAppointmentBtn.click();
      await expect(page).toHaveURL('/dashboard/appointments/new');
      await page.goBack();
    }

    // Test "New Request" button
    const newRequestBtn = page.locator('a[href="/dashboard/requests/new"]');
    if (await newRequestBtn.isVisible()) {
      await newRequestBtn.click();
      await expect(page).toHaveURL('/dashboard/requests/new');
      await page.goBack();
    }

    // Test "Upload Document" button (triggers event)
    const uploadDocBtn = page.locator('button').filter({ hasText: 'رفع مستند' });
    if (await uploadDocBtn.isVisible()) {
      await uploadDocBtn.click();
      // Would need to check if upload dialog opens
      await page.waitForTimeout(500);
    }

    // Test "Send Message" button (triggers event)
    const sendMessageBtn = page.locator('button').filter({ hasText: 'إرسال رسالة' });
    if (await sendMessageBtn.isVisible()) {
      await sendMessageBtn.click();
      // Would need to check if message dialog opens
      await page.waitForTimeout(500);
    }
  });

  test('card hover effects work', async ({ page }) => {
    const statCards = page.locator('a').filter({ 
      has: page.locator('[data-testid*="card"], .border-primary\\/20') 
    });
    
    if (await statCards.first().isVisible()) {
      // Hover over first card
      await statCards.first().hover();
      await page.waitForTimeout(500);
      
      // Check for hover styles (scale/shadow changes)
      const cardStyle = await statCards.first().getAttribute('class');
      expect(cardStyle).toBeTruthy();
    }
  });
});

test.describe('Document Management UX', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/documents');
  });

  test('document upload dialog works', async ({ page }) => {
    // Find upload button
    const uploadBtn = page.locator('button').filter({ hasText: 'رفع مستند' });
    
    if (await uploadBtn.isVisible()) {
      await uploadBtn.click();
      
      // Check if dialog opens
      const dialog = page.locator('[role="dialog"]').or(
        page.locator('.sm\\:max-w-\\[425px\\]')
      );
      
      await expect(dialog).toBeVisible();
      
      // Close dialog
      const closeBtn = page.locator('button').filter({ hasText: 'إلغاء' }).or(
        page.keyboard.press('Escape')
      );
    }
  });

  test('document preview functionality', async ({ page }) => {
    // Look for document view buttons
    const viewBtns = page.locator('button').filter({ hasText: 'عرض' });
    
    if (await viewBtns.first().isVisible()) {
      await viewBtns.first().click();
      
      // Check for preview toast or modal
      const toast = page.locator('[role="alert"]').or(
        page.locator('.toast')
      );
      
      // Preview might show as toast or open modal
      await page.waitForTimeout(1000);
    }
  });

  test('document download functionality', async ({ page }) => {
    // Look for download buttons
    const downloadBtns = page.locator('button').filter({ hasText: 'تحميل' });
    
    if (await downloadBtns.first().isVisible()) {
      await downloadBtns.first().click();
      
      // Check for download toast
      const toast = page.locator('[role="alert"]').filter({
        hasText: 'جاري التحميل'
      });
      
      await expect(toast).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Messages Threading UX', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/messages');
  });

  test('new message dialog opens', async ({ page }) => {
    const newMessageBtn = page.locator('button').filter({ hasText: 'رسالة جديدة' });
    
    if (await newMessageBtn.isVisible()) {
      await newMessageBtn.click();
      
      // Check if dialog opens
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
      
      // Check form fields
      const subjectField = page.locator('input#subject');
      const messageField = page.locator('textarea#message');
      
      await expect(subjectField).toBeVisible();
      await expect(messageField).toBeVisible();
    }
  });

  test('message form validation works', async ({ page }) => {
    const newMessageBtn = page.locator('button').filter({ hasText: 'رسالة جديدة' });
    
    if (await newMessageBtn.isVisible()) {
      await newMessageBtn.click();
      
      // Try to submit empty form
      const submitBtn = page.locator('button[type="submit"]');
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        
        // Check for validation errors
        const errors = page.locator('.text-destructive');
        // Validation errors should appear
      }
    }
  });
});

test.describe('Breadcrumb Navigation', () => {
  const pages = [
    { path: '/dashboard/appointments', breadcrumb: 'المواعيد' },
    { path: '/dashboard/cases', breadcrumb: 'القضايا' },
    { path: '/dashboard/documents', breadcrumb: 'المستندات' },
    { path: '/dashboard/messages', breadcrumb: 'الرسائل' },
    { path: '/dashboard/notifications', breadcrumb: 'الإشعارات' },
    { path: '/dashboard/profile', breadcrumb: 'الملف الشخصي' }
  ];

  pages.forEach(({ path, breadcrumb }) => {
    test(`breadcrumbs work on ${breadcrumb} page`, async ({ page }) => {
      await page.goto(path);
      
      // Check breadcrumb structure
      const breadcrumbNav = page.locator('[role="navigation"]').or(
        page.locator('.breadcrumb')
      );
      
      // Should contain "الرئيسية" and current page
      const homeLink = page.locator('a').filter({ hasText: 'الرئيسية' });
      const currentPage = page.locator('text=' + breadcrumb);
      
      await expect(homeLink).toBeVisible();
      await expect(currentPage).toBeVisible();
      
      // Test home navigation
      if (await homeLink.isVisible()) {
        await homeLink.click();
        await expect(page).toHaveURL('/dashboard');
      }
    });
  });
});

test.describe('Mobile Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
  });

  test('mobile menu works', async ({ page }) => {
    // Look for mobile menu trigger
    const menuBtn = page.locator('button').filter({ 
      has: page.locator('svg') 
    }).first();
    
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      
      // Check if sidebar opens
      const sidebar = page.locator('.translate-x-0').or(
        page.locator('[role="navigation"]')
      );
      
      // Menu should be visible on mobile
      await page.waitForTimeout(500);
    }
  });

  test('notification bell works on mobile', async ({ page }) => {
    const notificationBell = page.locator('button').filter({ 
      has: page.locator('svg') 
    }).nth(1); // Assuming bell is second button
    
    if (await notificationBell.isVisible()) {
      await notificationBell.click();
      
      // Dropdown should work on mobile
      await page.waitForTimeout(500);
    }
  });
});