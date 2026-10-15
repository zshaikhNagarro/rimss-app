export function getDiscountedPrice(price: number, discountPercent: number): number {
  return price * (1 - discountPercent / 100);
}

export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
