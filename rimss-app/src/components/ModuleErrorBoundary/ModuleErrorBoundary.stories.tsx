import type { Meta, StoryObj } from '@storybook/react-vite';
import { ModuleErrorBoundary } from './ModuleErrorBoundary';

const Healthy = () => <p>Module content renders normally.</p>;

const Crashing = (): never => {
  throw new Error('Story-induced crash');
};

const meta = {
  title: 'Components/ModuleErrorBoundary',
  component: ModuleErrorBoundary,
  args: { label: 'Catalog' },
} satisfies Meta<typeof ModuleErrorBoundary>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Healthy_: Story = { args: { children: <Healthy /> } };
export const Crashed: Story = { args: { children: <Crashing /> } };
