import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ErrorFallback } from './ErrorFallback';

const meta = {
  title: 'Components/ErrorFallback',
  component: ErrorFallback,
  args: { onRetry: fn() },
} satisfies Meta<typeof ErrorFallback>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const CustomMessage: Story = {
  args: { title: 'Unable to load products', message: 'Check your connection and try again.' },
};
export const WithoutRetry: Story = { args: { onRetry: undefined } };
