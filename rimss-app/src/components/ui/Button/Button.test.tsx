import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders a primary, medium, non-submitting button by default', () => {
    render(<Button>Go</Button>);
    const btn = screen.getByRole('button', { name: 'Go' });
    expect(btn).toHaveClass('ui-button', 'ui-button--primary');
    expect(btn).not.toHaveClass('ui-button--sm', 'ui-button--lg');
    expect(btn).toHaveAttribute('type', 'button');
  });

  it.each(['primary', 'outline', 'secondary', 'ghost', 'icon'] as const)(
    'applies the %s variant class',
    (variant) => {
      render(<Button variant={variant}>x</Button>);
      expect(screen.getByRole('button')).toHaveClass(`ui-button--${variant}`);
    },
  );

  it('applies size and block modifiers', () => {
    render(
      <Button size="lg" block>
        x
      </Button>,
    );
    expect(screen.getByRole('button')).toHaveClass('ui-button--lg', 'ui-button--block');
  });

  it('reflects the selected state', () => {
    const { rerender } = render(<Button selected>x</Button>);
    expect(screen.getByRole('button')).toHaveClass('selected');
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    rerender(<Button selected={false}>x</Button>);
    expect(screen.getByRole('button')).not.toHaveClass('selected');
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('omits aria-pressed when not a toggle', () => {
    render(<Button>x</Button>);
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-pressed');
  });

  it('merges a custom className', () => {
    render(<Button className="extra">x</Button>);
    expect(screen.getByRole('button')).toHaveClass('ui-button', 'extra');
  });

  it('fires onClick and respects disabled', () => {
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>x</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(
      <Button onClick={onClick} disabled>
        x
      </Button>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
