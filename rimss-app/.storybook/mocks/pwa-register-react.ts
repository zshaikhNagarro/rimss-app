import { useState } from 'react';

export interface MockSwState {
  offlineReady: boolean;
  needRefresh: boolean;
}

// Storybook stand-in for the virtual PWA module; stories set the state via setMockSwState.
let state: MockSwState = { offlineReady: false, needRefresh: false };

export const setMockSwState = (next: MockSwState) => {
  state = next;
};

export function useRegisterSW() {
  const [offlineReady, setOfflineReady] = useState(state.offlineReady);
  const [needRefresh, setNeedRefresh] = useState(state.needRefresh);
  return {
    offlineReady: [offlineReady, setOfflineReady] as const,
    needRefresh: [needRefresh, setNeedRefresh] as const,
    updateServiceWorker: async () => {},
  };
}
