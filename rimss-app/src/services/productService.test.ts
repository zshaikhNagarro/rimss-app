import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { productService } from './productService';

const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });
const stubFetch = (impl: () => Promise<Response> = () => Promise.resolve(json([]))) => {
  const fn = vi.fn((..._args: [string, RequestInit?]) => impl());
  vi.stubGlobal('fetch', fn);
  return fn;
};

beforeEach(() => productService.clearCache());
afterEach(() => vi.unstubAllGlobals());

describe('productService', () => {
  it('caches repeated identical requests', async () => {
    const fetchMock = stubFetch();
    await productService.search({ q: 'a' });
    await productService.search({ q: 'a' });
    await productService.search({ q: 'b' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('builds a query string from filters', async () => {
    const fetchMock = stubFetch();
    await productService.search({
      q: 'shirt',
      category: 'Tops',
      color: 'Red',
      maxPrice: 50,
      discountedOnly: true,
    });
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain('/products?');
    for (const part of [
      'q=shirt',
      'category=Tops',
      'color=Red',
      'maxPrice=50',
      'discountedOnly=true',
    ]) {
      expect(url).toContain(part);
    }
  });

  it('omits the query string when no filters are given', async () => {
    const fetchMock = stubFetch();
    await productService.search();
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/products$/);
  });

  it('requests a product by id', async () => {
    const fetchMock = stubFetch(() => Promise.resolve(json({ id: 'p1' })));
    await expect(productService.getById('p1')).resolves.toEqual({ id: 'p1' });
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/products\/p1$/);
  });

  it('fetches categories and colors', async () => {
    const fetchMock = stubFetch(() => Promise.resolve(json(['a'])));
    await productService.getCategories();
    await productService.getColors();
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/categories$/);
    expect(String(fetchMock.mock.calls[1][0])).toMatch(/\/colors$/);
  });

  it('propagates 4xx errors', async () => {
    stubFetch(() => Promise.resolve(new Response('', { status: 404 })));
    await expect(productService.getById('nope')).rejects.toThrow('404');
  });
});
