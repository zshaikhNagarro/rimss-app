import { expect, test } from '@playwright/test';

test.describe('Resilience and loading states', () => {
  test('shows skeletons while the catalog loads', async ({ page }) => {
    await page.route('**/api/products', async (route) => {
      await new Promise((r) => setTimeout(r, 1500));
      await route.continue();
    });
    await page.goto('/');
    await expect(page.getByLabel('Loading products')).toBeVisible();
    await expect(page.locator('.product-card')).toHaveCount(8);
  });

  test('recovers from a failing catalog request via retry', async ({ page }) => {
    await page.route('**/api/products', (route) => route.abort());
    await page.goto('/');
    await expect(page.getByRole('alert')).toContainText('Unable to load products', {
      timeout: 20_000,
    });

    await page.unroute('**/api/products');
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page.locator('.product-card')).toHaveCount(8);
  });

  test('retries transient 5xx responses transparently', async ({ page }) => {
    let calls = 0;
    await page.route('**/api/products', async (route) => {
      calls++;
      if (calls === 1) return route.fulfill({ status: 503, body: 'unavailable' });
      return route.continue();
    });
    await page.goto('/');
    await expect(page.locator('.product-card')).toHaveCount(8);
    expect(calls).toBeGreaterThan(1);
  });

  test('shows a fallback when a product image fails', async ({ page }) => {
    await page.route(/\.(jpg|jpeg|png|webp)(\?.*)?$/, (route) => route.abort());
    await page.route('https://**/*', (route) =>
      route.request().resourceType() === 'image' ? route.abort() : route.continue(),
    );
    await page.goto('/');
    await expect(page.getByText('No image').first()).toBeVisible();
  });
});

test.describe('Responsive layout', () => {
  for (const [name, size] of [
    ['mobile', { width: 375, height: 700 }],
    ['tablet', { width: 768, height: 900 }],
    ['desktop', { width: 1280, height: 800 }],
  ] as const) {
    test(`${name} viewport has no horizontal overflow`, async ({ page }) => {
      await page.setViewportSize(size);
      await page.goto('/');
      await expect(page.locator('.product-card')).toHaveCount(8);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});
