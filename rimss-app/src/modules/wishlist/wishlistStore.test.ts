import { beforeEach, describe, expect, it } from 'vitest';
import { wishlist } from './wishlistStore';

describe('wishlistStore', () => {
  beforeEach(() => {
    wishlist.getSnapshot().forEach((id) => wishlist.toggle(id));
  });

  it('toggles ids, persists them and notifies subscribers', () => {
    let calls = 0;
    const unsubscribe = wishlist.subscribe(() => calls++);

    wishlist.toggle('p1');
    expect(wishlist.getSnapshot()).toEqual(['p1']);
    expect(JSON.parse(localStorage.getItem('rimss.wishlist.v1') ?? '[]')).toEqual(['p1']);

    wishlist.toggle('p1');
    expect(wishlist.getSnapshot()).toEqual([]);
    expect(calls).toBe(2);
    unsubscribe();
  });

  it('returns a new snapshot reference on change', () => {
    const before = wishlist.getSnapshot();
    wishlist.toggle('p2');
    expect(wishlist.getSnapshot()).not.toBe(before);
  });
});
