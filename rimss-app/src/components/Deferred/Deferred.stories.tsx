import { lazy } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Deferred } from './Deferred';

const Loaded = lazy(() => Promise.resolve({ default: () => <p>Lazy content loaded.</p> }));
const Broken = lazy(() => Promise.reject(new Error('Chunk failed to load')));

const meta = {
  title: 'Components/Deferred',
  component: Deferred,
  args: { label: 'Widget', children: null },
} satisfies Meta<typeof Deferred>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Loads: Story = {
  render: (args) => (
    <Deferred {...args}>
      <Loaded />
    </Deferred>
  ),
};

export const ChunkFails: Story = {
  render: (args) => (
    <Deferred {...args}>
      <Broken />
    </Deferred>
  ),
};
