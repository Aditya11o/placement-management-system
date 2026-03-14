import { test, expect } from '@playwright/test';

test('has title and login form', async ({ page }) => {
  await page.goto('/');

  // The app redirects to /login if unauthenticated
  await expect(page).toHaveURL(/.*login/);

  // Expect the login form and sign in button to be visible
  await expect(page.locator('form')).toBeVisible();
});
