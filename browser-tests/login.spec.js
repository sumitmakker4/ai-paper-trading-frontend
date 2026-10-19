import { expect, test } from '@playwright/test';

for (const width of [1366, 375]) {
  test(`login is the only entry at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page).toHaveURL('http://localhost:5173/login');
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeEnabled();
    await expect(page.getByLabel('Password', { exact: true })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeEnabled();
    await expect(page.getByRole('link', { name: /explore|dashboard/i })).toHaveCount(0);
    await page.screenshot({ path: `test-results/login-${width}-dark.png`, fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.getByRole('button', { name: 'Switch to light theme' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.screenshot({ path: `test-results/login-${width}-light.png`, fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.getByRole('button', { name: 'Switch to dark theme' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // Browser storage cannot grant access to a private route.
    await page.evaluate(() => localStorage.setItem('access_token', 'fake-token'));
    for (const path of [
      '/app',
      '/app/dashboard',
      '/app/markets',
      '/app/terminal/demo',
      '/app/paper',
      '/app/orders',
      '/app/portfolio',
      '/app/journal',
      '/app/settings',
      '/app/unknown',
    ]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login\?returnTo=/);
      await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
      await expect(page.getByRole('navigation', { name: 'Workspace' })).toHaveCount(0);
    }
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  });
}
