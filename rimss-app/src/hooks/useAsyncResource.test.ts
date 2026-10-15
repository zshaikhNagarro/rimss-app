import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAsyncResource } from './useAsyncResource';

describe('useAsyncResource', () => {
  it('loads data', async () => {
    const { result } = renderHook(() => useAsyncResource(() => Promise.resolve(42), []));
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.data).toBe(42);
  });

  it('reports errors and recovers on retry', async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error('x')).mockResolvedValue('ok');
    const { result } = renderHook(() => useAsyncResource(load, []));
    await waitFor(() => expect(result.current.status).toBe('error'));
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.data).toBe('ok');
  });

  it('does not load while disabled', () => {
    const load = vi.fn().mockResolvedValue(1);
    renderHook(() => useAsyncResource(load, [], false));
    expect(load).not.toHaveBeenCalled();
  });

  it('ignores results that resolve after a dependency change', async () => {
    let resolveFirst!: (v: string) => void;
    const load = vi
      .fn()
      .mockImplementationOnce(() => new Promise<string>((r) => (resolveFirst = r)))
      .mockResolvedValue('second');
    const { result, rerender } = renderHook(({ id }) => useAsyncResource(load, [id]), {
      initialProps: { id: 1 },
    });
    rerender({ id: 2 });
    await waitFor(() => expect(result.current.data).toBe('second'));
    await act(async () => resolveFirst('first'));
    expect(result.current.data).toBe('second');
  });
});
