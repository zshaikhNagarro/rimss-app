import { useEffect, type RefObject } from 'react';
import { useEscapeKey } from './useEscapeKey';

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

/** Modal behaviour: Escape closes, Tab stays inside, focus returns to the opener. */
export function useModalFocus(
  open: boolean,
  onClose: () => void,
  dialogRef: RefObject<HTMLElement | null>,
  { focusDialog = false }: { focusDialog?: boolean } = {},
) {
  useEscapeKey(onClose, open);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    if (focusDialog) dialogRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      const dialog = dialogRef.current;
      if (e.key !== 'Tab' || !dialog) return;
      const nodes = dialog.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === dialog)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [open, dialogRef, focusDialog]);
}
