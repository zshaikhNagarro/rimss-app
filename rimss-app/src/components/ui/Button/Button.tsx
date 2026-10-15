import type { ButtonHTMLAttributes } from 'react';
import '../tokens.scss';
import './Button.scss';

export type ButtonVariant = 'primary' | 'outline' | 'secondary' | 'ghost' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  /** Marks a toggle-style button as active (adds `selected` and aria-pressed). */
  selected?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  selected,
  className,
  type = 'button',
  ...rest
}: Readonly<ButtonProps>) {
  const classes = [
    'ui-button',
    `ui-button--${variant}`,
    size !== 'md' && `ui-button--${size}`,
    block && 'ui-button--block',
    selected && 'selected',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <button type={type} className={classes} aria-pressed={selected} {...rest} />;
}
