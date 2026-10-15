import type { TableHTMLAttributes } from 'react';
import '../tokens.scss';
import './Table.scss';

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  striped?: boolean;
  compact?: boolean;
}

/** Styled native table; compose with standard thead/tbody/tr/th/td children. */
export function Table({
  striped = false,
  compact = false,
  className,
  ...rest
}: Readonly<TableProps>) {
  const classes = [
    'ui-table',
    striped && 'ui-table--striped',
    compact && 'ui-table--compact',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return <table className={classes} {...rest} />;
}
