import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Table } from './Table';

const renderTable = (props = {}) =>
  render(
    <Table {...props}>
      <thead>
        <tr>
          <th>Name</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Scarf</td>
        </tr>
      </tbody>
    </Table>,
  );

describe('Table', () => {
  it('renders a semantic table with base class', () => {
    renderTable();
    expect(screen.getByRole('table')).toHaveClass('ui-table');
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Scarf' })).toBeInTheDocument();
  });

  it('is plain by default', () => {
    renderTable();
    expect(screen.getByRole('table')).not.toHaveClass('ui-table--striped', 'ui-table--compact');
  });

  it('applies striped, compact and custom classes', () => {
    renderTable({ striped: true, compact: true, className: 'extra' });
    expect(screen.getByRole('table')).toHaveClass(
      'ui-table--striped',
      'ui-table--compact',
      'extra',
    );
  });
});
