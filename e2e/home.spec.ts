import { test, expect } from '@playwright/test';

test('homepage loads and displays main components', async ({ page }) => {
  await page.goto('/');

  // Verify the title (replace with actual title if different)
  await expect(page).toHaveTitle(/Tranquil/);

  // Check for the presence of the navigation
  await expect(page.locator('nav')).toBeVisible();

  // Basic check for the footer
  await expect(page.locator('footer')).toBeVisible();
});
