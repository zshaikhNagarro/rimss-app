import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useFocusOnGrow } from './useFocusOnGrow';

function setup() {
  const container = document.createElement('div');
  const add = () => {
    const a = document.createElement('a');
    a.href = '#';
    container.appendChild(a);
  };
  document.body.appendChild(container);
  add();
  add();
  return { container, add };
}

describe('useFocusOnGrow', () => {
  it('focuses the first new child after the list grows', () => {
    const { container, add } = setup();
    const { result, rerender } = renderHook(({ n }) => useFocusOnGrow({ current: container }, n), {
      initialProps: { n: 2 },
    });
    act(() => result.current());
    add();
    rerender({ n: 3 });
    expect(document.activeElement).toBe(container.children[2]);
  });

  it('does not steal focus when the list grows without being marked', () => {
    const { container, add } = setup();
    const { rerender } = renderHook(({ n }) => useFocusOnGrow({ current: container }, n), {
      initialProps: { n: 2 },
    });
    add();
    rerender({ n: 3 });
    expect(document.activeElement).not.toBe(container.children[2]);
  });
});
