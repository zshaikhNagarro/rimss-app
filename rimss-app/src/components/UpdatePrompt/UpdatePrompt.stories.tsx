import type { Meta, StoryObj } from '@storybook/react-vite';
import { UpdatePrompt } from './UpdatePrompt';
import { setMockSwState } from '../../../.storybook/mocks/pwa-register-react';

const meta = { title: 'Components/UpdatePrompt', component: UpdatePrompt } satisfies Meta<
  typeof UpdatePrompt
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Hidden: Story = {
  beforeEach: () => setMockSwState({ offlineReady: false, needRefresh: false }),
};
export const OfflineReady: Story = {
  beforeEach: () => setMockSwState({ offlineReady: true, needRefresh: false }),
};
export const UpdateAvailable: Story = {
  beforeEach: () => setMockSwState({ offlineReady: false, needRefresh: true }),
};
