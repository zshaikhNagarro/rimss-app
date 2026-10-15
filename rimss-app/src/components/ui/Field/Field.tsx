import type { InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes } from 'react';
import '../tokens.scss';
import './Field.scss';

/** Label wrapper; nest the control inside so it is associated implicitly. */
export function Field({
  inline = false,
  className,
  ...rest
}: Readonly<LabelHTMLAttributes<HTMLLabelElement> & { inline?: boolean }>) {
  const classes = ['ui-field', inline && 'ui-field--inline', className].filter(Boolean).join(' ');
  return <label className={classes} {...rest} />;
}

export function Input({
  compact = false,
  className,
  ...rest
}: Readonly<InputHTMLAttributes<HTMLInputElement> & { compact?: boolean }>) {
  const classes = ['ui-control', compact && 'ui-control--compact', className]
    .filter(Boolean)
    .join(' ');
  return <input className={classes} {...rest} />;
}

export function Select({ className, ...rest }: Readonly<SelectHTMLAttributes<HTMLSelectElement>>) {
  return <select className={['ui-control', className].filter(Boolean).join(' ')} {...rest} />;
}
