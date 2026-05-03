import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CookingTechnique, Doneness } from '@/types/domain';

export interface ActiveTimer {
  id: string;
  cut_id: string;
  technique: CookingTechnique;
  doneness: Doneness;
  thickness_cm: number;
  started_at: number; // epoch ms
  duration_ms: number; // tempo total da etapa atual
  phase: 'cooking' | 'resting' | 'done';
  rest_ms: number;
  notes?: string;
}

interface TimerState {
  timers: ActiveTimer[];
  start: (timer: Omit<ActiveTimer, 'started_at' | 'phase'>) => void;
  stop: (id: string) => void;
  advanceToRest: (id: string) => void;
  markDone: (id: string) => void;
}

export const useTimers = create<TimerState>()(
  persist(
    (set) => ({
      timers: [],
      start: (timer) =>
        set((s) => ({
          timers: [
            ...s.timers.filter((t) => t.id !== timer.id),
            { ...timer, started_at: Date.now(), phase: 'cooking' },
          ],
        })),
      stop: (id) => set((s) => ({ timers: s.timers.filter((t) => t.id !== id) })),
      advanceToRest: (id) =>
        set((s) => ({
          timers: s.timers.map((t) =>
            t.id === id
              ? { ...t, phase: 'resting', started_at: Date.now(), duration_ms: t.rest_ms }
              : t,
          ),
        })),
      markDone: (id) =>
        set((s) => ({ timers: s.timers.map((t) => (t.id === id ? { ...t, phase: 'done' } : t)) })),
    }),
    { name: 'fogo-alto.timers' },
  ),
);
