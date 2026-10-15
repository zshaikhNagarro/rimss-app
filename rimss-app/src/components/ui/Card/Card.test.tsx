import { render, screen } from '@testing-library/react';
import { MemoryRouter, Link } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Card } from './Card';

describe('Card', () => {
  it('renders an outlined div by default', () => {
    render(<Card data-testid="c">Body</Card>);
    const el = screen.getByTestId('c');
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveClass('ui-card', 'ui-card--outlined');
    expect(el).not.toHaveClass('ui-card--interactive');
  });

  it.each(['outlined', 'filled', 'elevated'] as const)('applies the %s variant', (variant) => {
    render(
      <Card variant={variant} data-testid="c">
        x
      </Card>,
    );
    expect(screen.getByTestId('c')).toHaveClass(`ui-card--${variant}`);
  });

  it('applies padding and interactive modifiers', () => {
    render(
      <Card padding="md" interactive data-testid="c">
        x
      </Card>,
    );
    expect(screen.getByTestId('c')).toHaveClass('ui-card--pad-md', 'ui-card--interactive');
  });

  it('renders as another element or component via `as`', () => {
    render(
      <MemoryRouter>
        <Card as={Link} to="/product/1">
          Link card
        </Card>
        <Card as="aside" data-testid="aside">
          x
        </Card>
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Link card' })).toHaveAttribute('href', '/product/1');
    expect(screen.getByTestId('aside').tagName).toBe('ASIDE');
  });

  it('merges a custom className', () => {
    render(
      <Card className="extra" data-testid="c">
        x
      </Card>,
    );
    expect(screen.getByTestId('c')).toHaveClass('ui-card', 'extra');
  });
});
