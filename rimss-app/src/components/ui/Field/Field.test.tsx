import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Field, Input, Select } from './Field';

describe('Field', () => {
  it('labels a nested control', () => {
    render(
      <Field>
        Name
        <Input />
      </Field>,
    );
    expect(screen.getByLabelText('Name')).toHaveClass('ui-control');
  });

  it('supports the inline layout', () => {
    render(
      <Field inline data-testid="f">
        <input type="checkbox" />
        Agree
      </Field>,
    );
    expect(screen.getByTestId('f')).toHaveClass('ui-field', 'ui-field--inline');
  });
});

describe('Input', () => {
  it('is compact on request and forwards events', () => {
    const onChange = vi.fn();
    render(<Input compact aria-label="qty" onChange={onChange} />);
    const input = screen.getByLabelText('qty');
    expect(input).toHaveClass('ui-control--compact');
    fireEvent.change(input, { target: { value: '3' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

describe('Select', () => {
  it('renders options and reports changes', () => {
    const onChange = vi.fn();
    render(
      <Select aria-label="sort" defaultValue="asc" onChange={onChange}>
        <option value="asc">Low</option>
        <option value="desc">High</option>
      </Select>,
    );
    const select = screen.getByLabelText('sort');
    expect(select).toHaveClass('ui-control');
    fireEvent.change(select, { target: { value: 'desc' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
