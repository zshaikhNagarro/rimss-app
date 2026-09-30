import type { StorybookConfig } from '@storybook/react-vite';
import path from 'node:path';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  framework: '@storybook/react-vite',
  // The PWA plugin breaks the Storybook build, so drop it and alias its virtual module.
  async viteFinal(viteConfig) {
    viteConfig.plugins = (viteConfig.plugins ?? []).flat().filter((p) => {
      const name = (p as { name?: string } | null)?.name ?? '';
      return !name.includes('pwa');
    });
    viteConfig.resolve = {
      ...viteConfig.resolve,
      alias: {
        ...(viteConfig.resolve?.alias as Record<string, string> | undefined),
        'virtual:pwa-register/react': path.resolve(
          import.meta.dirname,
          'mocks/pwa-register-react.ts',
        ),
      },
    };
    return viteConfig;
  },
};

export default config;
