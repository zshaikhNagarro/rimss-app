import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Heading } from './Heading';

describe('Heading', () => {
  it('renders an h2 with large size and left alignment by default', () => {
    render(<Heading>Title</Heading>);
    const h = screen.getByRole('heading', { level: 2, name: 'Title' });
    expect(h).toHaveClass('ui-heading--lg', 'ui-heading--left');
  });

  it.each([
    [1, 'xl'],
    [2, 'lg'],
    [3, 'md'],
    [4, 'sm'],
  ] as const)('level %i defaults to %s size', (level, size) => {
    render(<Heading level={level}>T</Heading>);
    expect(screen.getByRole('heading', { level })).toHaveClass(`ui-heading--${size}`);
  });

  it('decouples visual size from semantic level', () => {
    render(
      <Heading level={1} size="sm">
        T
      </Heading>,
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('ui-heading--sm');
  });

  it('supports center alignment and custom className', () => {
    render(
      <Heading align="center" className="extra">
        T
      </Heading>,
    );
    expect(screen.getByRole('heading')).toHaveClass('ui-heading--center', 'extra');
  });

  it('forwards native attributes', () => {
    render(<Heading id="x">T</Heading>);
    expect(screen.getByRole('heading')).toHaveAttribute('id', 'x');
  });
});
