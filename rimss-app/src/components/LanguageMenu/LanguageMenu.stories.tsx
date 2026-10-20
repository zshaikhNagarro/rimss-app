import type { Meta, StoryObj } from '@storybook/react-vite';
import { LanguageMenu } from './LanguageMenu';

const meta = {
  title: 'Components/LanguageMenu',
  component: LanguageMenu,
} satisfies Meta<typeof LanguageMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
