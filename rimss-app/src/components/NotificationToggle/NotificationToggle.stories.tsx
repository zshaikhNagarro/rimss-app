import type { Meta, StoryObj } from '@storybook/react-vite';
import { NotificationToggle } from './NotificationToggle';
import { stubFetch } from '../../../.storybook/mocks/stubFetch';

// Fakes the browser push APIs so the real pushService runs without a service worker.
function fakePushEnvironment({ subscribed }: { subscribed: boolean }) {
  let current: unknown = subscribed ? { endpoint: 'x', unsubscribe: async () => true } : null;
  const registration = {
    pushManager: {
      getSubscription: async () => current,
      subscribe: async () => {
        current = {
          endpoint: 'https://push.example/1',
          unsubscribe: async () => {
            current = null;
            return true;
          },
          toJSON: () => ({ endpoint: 'https://push.example/1' }),
        };
        return current;
      },
    },
  };
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: { ready: Promise.resolve(registration) },
  });
  const originalPermission = Notification.requestPermission;
  Notification.requestPermission = async () => 'granted';
  const restoreFetch = stubFetch(
    { '/push/public-key': { publicKey: 'BPk_-A' }, '/push/': {} },
    200,
  );
  return () => {
    Notification.requestPermission = originalPermission;
    restoreFetch();
  };
}

const meta = {
  title: 'Components/NotificationToggle',
  component: NotificationToggle,
} satisfies Meta<typeof NotificationToggle>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = { beforeEach: () => fakePushEnvironment({ subscribed: false }) };
export const On: Story = { beforeEach: () => fakePushEnvironment({ subscribed: true }) };
