import type { ComponentPropsWithoutRef, ElementType } from 'react';
import '../tokens.scss';
import './Card.scss';

type CardOwnProps<T extends ElementType> = {
  as?: T;
  variant?: 'outlined' | 'filled' | 'elevated';
  padding?: 'none' | 'sm' | 'md';
  interactive?: boolean;
};

export type CardProps<T extends ElementType = 'div'> = CardOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof CardOwnProps<T>>;

/** Polymorphic surface; use `as={Link}` for clickable cards. */
export function Card<T extends ElementType = 'div'>({
  as,
  variant = 'outlined',
  padding = 'none',
  interactive = false,
  className,
  ...rest
}: CardProps<T>) {
  const Tag: ElementType = as ?? 'div';
  const classes = [
    'ui-card',
    `ui-card--${variant}`,
    padding !== 'none' && `ui-card--pad-${padding}`,
    interactive && 'ui-card--interactive',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return <Tag className={classes} {...rest} />;
}
