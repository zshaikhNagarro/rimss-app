import type { Preview } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import '../src/index.css';

const preview: Preview = {
  decorators: [
    (Story, context) => (
      <MemoryRouter initialEntries={context.parameters.initialEntries ?? ['/']}>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default preview;
