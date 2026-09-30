import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function expectNoViolations(page: import('@playwright/test').Page) {
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
});
