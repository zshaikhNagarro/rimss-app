import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function expectNoViolations(page: import('@playwright/test').Page) {
  // Mid-animation opacity makes axe compute blended, failing contrast.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== 'running'),
  );
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(
    results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`),
  ).toEqual([]);
}

test.describe('Accessibility', () => {
  test('catalog page has no WCAG A/AA violations', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.product-card')).toHaveCount(8);
    await expectNoViolations(page);
  });

  test('cart drawer is an accessible dialog closed by Escape', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open cart' }).click();
    const dialog = page.getByRole('dialog', { name: 'Shopping Cart' });
    await expect(dialog).toBeVisible();
    await expectNoViolations(page);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  });

  test('filters are reflected in the URL', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.product-card')).toHaveCount(8);
    await page.getByLabel('Category').selectOption('Jackets');
    await expect(page).toHaveURL(/category=Jackets/);
    await page.reload();
    await expect(page.locator('.product-card')).toHaveCount(2);
  });

  test('dark mode has no WCAG A/AA violations and persists', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Account menu/ }).click();
    await page.getByRole('menuitem', { name: 'Switch to dark mode' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('.product-card')).toHaveCount(8);
    await expectNoViolations(page);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('language switch translates the UI', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Language' }).click();
    await page.getByRole('menuitemradio', { name: 'Español' }).click();
    await expect(page.getByRole('button', { name: 'Abrir carrito' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expectNoViolations(page);
  });
});
