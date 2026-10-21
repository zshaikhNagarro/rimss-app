import type { ComponentPropsWithRef, CSSProperties } from 'react';
import '../tokens.scss';
import './Grid.scss';

export interface GridProps extends ComponentPropsWithRef<'div'> {
  /** Minimum column width; columns auto-fill the available space. */
  minColumnWidth?: string;
  gap?: string;
}

/** Responsive auto-fill grid. */
export function Grid({
  minColumnWidth = '200px',
  gap = '1.25rem',
  className,
  style,
  ...rest
}: Readonly<GridProps>) {
  const vars = { '--ui-grid-min': minColumnWidth, '--ui-grid-gap': gap } as CSSProperties;
  return (
    <div
      className={['ui-grid', className].filter(Boolean).join(' ')}
      style={{ ...vars, ...style }}
      {...rest}
    />
  );
}
