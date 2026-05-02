import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferencesState {
  showCost: boolean;
  setShowCost: (value: boolean) => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      showCost: true,
      setShowCost: (value) => set({ showCost: value }),
    }),
    { name: 'fogo-alto.preferences' },
  ),
);
