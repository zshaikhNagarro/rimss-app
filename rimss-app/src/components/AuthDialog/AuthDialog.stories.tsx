import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { AuthDialog } from './AuthDialog';

const meta = {
  title: 'Components/AuthDialog',
  component: AuthDialog,
  args: { open: true, onClose: fn(), onSuccess: fn() },
} satisfies Meta<typeof AuthDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
