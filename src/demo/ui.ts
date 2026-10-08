import { useSyncExternalStore } from 'react';

interface DemoUiState {
  leadOpen: boolean;
  tourActive: boolean;
  tourStep: number;
}

let state: DemoUiState = { leadOpen: false, tourActive: false, tourStep: 0 };
const listeners = new Set<() => void>();
const set = (patch: Partial<DemoUiState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

export const demoUi = {
  get: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => { listeners.delete(l); };
  },
  openLead: () => set({ leadOpen: true, tourActive: false }),
  closeLead: () => set({ leadOpen: false }),
  startTour: () => set({ tourActive: true, tourStep: 0 }),
  stopTour: () => set({ tourActive: false }),
  setStep: (tourStep: number) => set({ tourStep }),
};

export const useDemoUi = () => useSyncExternalStore(demoUi.subscribe, demoUi.get);
