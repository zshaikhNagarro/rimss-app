import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading } from './Heading';

const meta = {
  title: 'UI/Heading',
  component: Heading,
  args: { children: 'Kids Corduroy Dungarees' },
  argTypes: {
    level: { control: 'inline-radio', options: [1, 2, 3, 4] },
    size: { control: 'inline-radio', options: ['xl', 'lg', 'md', 'sm'] },
    align: { control: 'inline-radio', options: ['left', 'center'] },
  },
} satisfies Meta<typeof Heading>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const PageTitle: Story = { args: { level: 1 } };
export const Small: Story = { args: { level: 3, size: 'sm' } };
export const Centered: Story = { args: { align: 'center' } };
export const LongTitle: Story = {
  args: {
    level: 1,
    children: 'An extremely long product name that must wrap cleanly across lines',
  },
  decorators: [(Story) => <div style={{ width: 280 }}>{Story()}</div>],
};
