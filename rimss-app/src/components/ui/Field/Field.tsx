import type { ComponentPropsWithRef, LabelHTMLAttributes, SelectHTMLAttributes } from 'react';
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
}: Readonly<ComponentPropsWithRef<'input'> & { compact?: boolean }>) {
  const classes = ['ui-control', compact && 'ui-control--compact', className]
    .filter(Boolean)
    .join(' ');
  return <input className={classes} {...rest} />;
}

export function Checkbox({
  className,
  ...rest
}: Readonly<Omit<ComponentPropsWithRef<'input'>, 'type'>>) {
  return (
    <input
      type="checkbox"
      className={['ui-checkbox', className].filter(Boolean).join(' ')}
      {...rest}
    />
  );
}

export function Select({ className, ...rest }: Readonly<SelectHTMLAttributes<HTMLSelectElement>>) {
  return <select className={['ui-control', className].filter(Boolean).join(' ')} {...rest} />;
}
