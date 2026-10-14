import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';

const meta = {
  title: 'UI/Card',
  component: Card,
  args: { padding: 'md', children: 'Card content', style: { width: 280 } },
  argTypes: {
    variant: { control: 'inline-radio', options: ['outlined', 'filled', 'elevated'] },
    padding: { control: 'inline-radio', options: ['none', 'sm', 'md'] },
  },
} satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Outlined: Story = {};
export const Filled: Story = { args: { variant: 'filled' } };
export const Elevated: Story = { args: { variant: 'elevated' } };
export const Interactive: Story = { args: { interactive: true } };
