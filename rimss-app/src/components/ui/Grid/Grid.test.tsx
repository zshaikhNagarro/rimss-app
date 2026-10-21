import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Grid } from './Grid';

describe('Grid', () => {
  it('renders children with the default column and gap variables', () => {
    render(
      <Grid data-testid="grid">
        <span>a</span>
      </Grid>,
    );
    const grid = screen.getByTestId('grid');
    expect(grid).toHaveClass('ui-grid');
    expect(grid.style.getPropertyValue('--ui-grid-min')).toBe('200px');
    expect(grid.style.getPropertyValue('--ui-grid-gap')).toBe('1.25rem');
    expect(screen.getByText('a')).toBeInTheDocument();
  });

  it('applies custom sizing, className and style', () => {
    render(
      <Grid
        data-testid="grid"
        minColumnWidth="300px"
        gap="2rem"
        className="extra"
        style={{ color: 'red' }}
      />,
    );
    const grid = screen.getByTestId('grid');
    expect(grid).toHaveClass('ui-grid', 'extra');
    expect(grid.style.getPropertyValue('--ui-grid-min')).toBe('300px');
    expect(grid.style.getPropertyValue('--ui-grid-gap')).toBe('2rem');
    expect(grid.style.color).toBe('red');
  });
});
