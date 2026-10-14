import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Chatbot } from './Chatbot';

const meta = {
  title: 'Components/Chatbot',
  component: Chatbot,
  parameters: { layout: 'fullscreen' },
  beforeEach: () => localStorage.removeItem('rimss.chat.v1'),
} satisfies Meta<typeof Chatbot>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

export const Open: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await body.findByRole('button', { name: 'Open chat' }));
    await expect(await body.findByRole('dialog')).toBeInTheDocument();
  },
};

export const ProductRecommendation: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await body.findByRole('button', { name: 'Open chat' }));
    await userEvent.click(await body.findByRole('button', { name: 'Best jackets' }));
    await expect(await body.findByText('Moleskin Field Jacket')).toBeInTheDocument();
  },
};

export const ContactSupport: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await body.findByRole('button', { name: 'Open chat' }));
    await userEvent.click(await body.findByRole('button', { name: 'Contact support' }));
    await expect(await body.findByText(/customer care/)).toBeInTheDocument();
  },
};
