import { expect, test } from '@playwright/test';

const CARD = '.product-card';

test.describe('Product search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(CARD)).toHaveCount(8);
  });

  test('lists the full catalog with prices and badges', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Heritage Wool Sweater' })).toBeVisible();
    await expect(page.getByText('-15%').first()).toBeVisible();
    await expect(page.getByText('Out of stock')).toBeVisible();
  });

  test('filters by name', async ({ page }) => {
    await page.getByPlaceholder('e.g. sweater').fill('sweater');
    await expect(page.locator(CARD)).toHaveCount(1);
    await expect(page.locator(CARD)).toContainText('Heritage Wool Sweater');
  });

  test('filters by category and clears filters', async ({ page }) => {
    await page.getByLabel('Category').selectOption('Jackets');
    await expect(page.locator(CARD)).toHaveCount(2);

    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect(page.locator(CARD)).toHaveCount(8);
  });

  test('shows only discounted products', async ({ page }) => {
    await page.getByLabel('Discounted products only').check();
    await expect(page.locator(CARD)).toHaveCount(5);
    await expect(page.getByText('Moleskin Field Jacket')).toHaveCount(0);
  });

  test('shows an empty state when nothing matches', async ({ page }) => {
    await page.getByPlaceholder('e.g. sweater').fill('zzzz');
    await expect(page.getByText('No products match the selected filters.')).toBeVisible();
  });

  test('sorts by price high to low', async ({ page }) => {
    await page.getByLabel('Sort by price').selectOption('desc');
    await expect(page.locator(CARD).first()).toContainText('Moleskin Field Jacket');
  });
});
