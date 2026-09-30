import { expect, test } from '@playwright/test';

test.describe('Product showcase and cart', () => {
  test('opens a product from search and adds it to the cart', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Heritage Wool Sweater/ }).click();

    await expect(page).toHaveURL(/\/product\/p001$/);
    await expect(page.getByRole('heading', { name: 'Heritage Wool Sweater' })).toBeVisible();
    await expect(page.getByText('In stock')).toBeVisible();
    await expect(page.getByText('$109.65')).toBeVisible();

    await page.getByRole('button', { name: 'Add to Cart' }).click();
    await expect(page.getByText('Added to cart!')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open cart' })).toContainText('Cart (1)');
  });

  test('disables add-to-cart for out-of-stock products', async ({ page }) => {
    await page.goto('/product/p005');
    await expect(page.getByText('Out of stock').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add to Cart' })).toBeDisabled();
  });

  test('shows the error fallback for an unknown product and can retry', async ({ page }) => {
    await page.goto('/product/does-not-exist');
    await expect(page.getByRole('alert')).toContainText("Couldn't load this product");
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  });

  test('cart drawer supports quantity changes, totals and removal', async ({ page }) => {
    await page.goto('/product/p001');
    await page.getByRole('button', { name: 'Add to Cart' }).click();
    await page.getByRole('button', { name: 'Open cart' }).click();

    await expect(page.getByText('Shopping Cart')).toBeVisible();
    await expect(page.getByText('Total: $109.65')).toBeVisible();

    await page.getByRole('spinbutton').fill('2');
    await expect(page.getByText('Total: $219.30')).toBeVisible();

    await page.getByRole('button', { name: 'Remove' }).click();
    await expect(page.getByText('Your cart is empty.')).toBeVisible();
    await expect(page.getByRole('button', { name: /Proceed to Payment/ })).toBeDisabled();
  });

  test('closes the cart drawer', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open cart' }).click();
    await expect(page.getByText('Shopping Cart')).toBeVisible();
    await page.getByRole('button', { name: 'Close cart' }).click();
    await expect(page.getByText('Shopping Cart')).toHaveCount(0);
  });
});
