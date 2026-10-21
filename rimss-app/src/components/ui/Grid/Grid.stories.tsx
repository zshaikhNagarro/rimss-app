import type { Meta, StoryObj } from '@storybook/react-vite';
import { Grid } from './Grid';

const Tile = ({ n }: { n: number }) => (
  <div style={{ padding: '2rem', background: 'var(--ui-surface, #eee)', textAlign: 'center' }}>
    {n}
  </div>
);

const meta = {
  title: 'UI/Grid',
  component: Grid,
  args: {
    children: Array.from({ length: 6 }, (_, i) => <Tile key={i} n={i + 1} />),
  },
} satisfies Meta<typeof Grid>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WideColumns: Story = { args: { minColumnWidth: '320px', gap: '2rem' } };
export const Compact: Story = { args: { minColumnWidth: '120px', gap: '0.5rem' } };
