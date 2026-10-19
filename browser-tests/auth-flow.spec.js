import { expect, test } from '@playwright/test';

for (const width of [1366, 375]) {
  test(`register, recover and logout against PostgreSQL at ${width}px`, async ({
    page,
    context,
  }) => {
    const email = `browser-${crypto.randomUUID()}@example.com`;
    const password = 'Practice only password 2026';
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/app/settings');
    await expect(page).toHaveURL(/\/login\?returnTo=/);
    await page.getByRole('link', { name: 'Create an account' }).click();
    await page.getByLabel('Full name').fill('Browser Learner');
    await page.getByLabel('Email address').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByLabel('Confirm password').fill(password);
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Create account', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Your profile' })).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
    if (width === 375) await page.getByRole('button', { name: 'Navigation +' }).click();
    for (const title of [
      'Dashboard',
      'Markets',
      'Terminal',
      'Paper Trading',
      'Orders',
      'Portfolio',
      'Journal',
      'Settings',
    ]) {
      await expect(
        page
          .getByRole('navigation', { name: 'Workspace' })
          .getByRole('link', { name: title, exact: true }),
      ).toBeVisible();
    }
    await page
      .getByRole('navigation', { name: 'Workspace' })
      .getByRole('link', { name: 'Markets', exact: true })
      .click();
    await expect(page.getByRole('heading', { name: 'Markets', exact: true })).toBeVisible();
    if (width === 375) await page.getByRole('button', { name: 'Navigation +' }).click();
    await page
      .getByRole('navigation', { name: 'Workspace' })
      .getByRole('link', { name: 'Settings', exact: true })
      .click();
    await expect(page.getByRole('heading', { name: 'Your profile' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const cookies = await context.cookies();
    const initialRefresh = cookies.find((cookie) => cookie.name === 'trademind_refresh');
    expect(initialRefresh.httpOnly).toBe(true);
    expect(initialRefresh.sameSite).toBe('Lax');
    expect(await page.evaluate(() => document.cookie.includes('trademind_refresh'))).toBe(false);
    expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Your profile' })).toBeVisible();
    const afterReload = (await context.cookies()).find(
      (cookie) => cookie.name === 'trademind_refresh',
    );
    expect(afterReload.value).not.toBe(initialRefresh.value);
    const secondTab = await context.newPage();
    await Promise.all([page.reload(), secondTab.goto('http://localhost:5174/app/settings')]);
    await expect(page.getByRole('heading', { name: 'Your profile' })).toBeVisible();
    await expect(secondTab.getByRole('heading', { name: 'Your profile' })).toBeVisible();
    await secondTab.close();
    await page.getByRole('tab', { name: 'Appearance' }).click();
    await page.getByRole('button', { name: 'Light', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.getByRole('tab', { name: 'Region' }).focus();
    await page.keyboard.press('Home');
    await expect(page.getByRole('tab', { name: 'Profile' })).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: `../.tools/auth-settings-${width}.png`, fullPage: true });
    await page.getByRole('button', { name: 'Sign out', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    expect((await context.cookies()).some((cookie) => cookie.name === 'trademind_refresh')).toBe(
      false,
    );
    await page.goto('/app/dashboard');
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();

    await page.getByLabel('Email address').fill(email);
    await page.getByLabel('Password', { exact: true }).fill('incorrect password');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('Email or password is incorrect.');
    await expect(page.getByLabel('Email address')).toHaveValue(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
    await expect(page.getByText(`You’re signed in as ${email}.`)).toBeVisible();
    await expect(page.getByText('Awaiting account connection')).toHaveCount(0);
    await page.getByRole('button', { name: 'Sign out', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    expect(pageErrors).toEqual([]);
  });
}
