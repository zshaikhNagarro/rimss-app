import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConsentBanner } from './ConsentBanner';

const meta = { title: 'Components/ConsentBanner', component: ConsentBanner } satisfies Meta<
  typeof ConsentBanner
>;
export default meta;
type Story = StoryObj<typeof meta>;

// Visible only when VITE_GA_MEASUREMENT_ID is set and no choice is stored.
export const Default: Story = {
  beforeEach: () => localStorage.removeItem('rimss.analytics-consent'),
};
