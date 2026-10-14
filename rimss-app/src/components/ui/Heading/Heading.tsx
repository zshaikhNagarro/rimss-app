import type { HTMLAttributes } from 'react';
import '../tokens.scss';
import './Heading.scss';

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Semantic level, independent of visual size. */
  level?: 1 | 2 | 3 | 4;
  size?: 'xl' | 'lg' | 'md' | 'sm';
  align?: 'left' | 'center';
}

const DEFAULT_SIZE = { 1: 'xl', 2: 'lg', 3: 'md', 4: 'sm' } as const;

export function Heading({
  level = 2,
  size,
  align = 'left',
  className,
  ...rest
}: Readonly<HeadingProps>) {
  const Tag = `h${level}` as const;
  const classes = [
    'ui-heading',
    `ui-heading--${size ?? DEFAULT_SIZE[level]}`,
    `ui-heading--${align}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return <Tag className={classes} {...rest} />;
}
