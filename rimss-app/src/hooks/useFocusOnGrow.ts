import { useEffect, useRef, type RefObject } from 'react';

/**
 * Keeps keyboard users in place when a list grows ("show more"): call the returned
 * function before loading, and focus moves to the first newly added child.
 */
export function useFocusOnGrow(containerRef: RefObject<HTMLElement | null>, count: number) {
  const from = useRef<number | null>(null);

  useEffect(() => {
    if (from.current === null || count <= from.current) return;
    (containerRef.current?.children[from.current] as HTMLElement | undefined)?.focus();
    from.current = null;
  }, [count, containerRef]);

  return () => {
    from.current = count;
  };
}
