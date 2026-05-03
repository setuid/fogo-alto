import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CookingTechnique, Doneness } from '@/types/domain';

export type TimerPhase = 'side_a' | 'side_b' | 'resting' | 'done';

export interface ActiveTimer {
  id: string;
  cut_id: string;
  technique: CookingTechnique;
  doneness: Doneness;
  thickness_cm: number;
  // Início da FASE atual (não do timer todo). Recalculado a cada advance.
  started_at: number;
  // Duração da fase atual em ms.
  duration_ms: number;
  // Durações pré-calculadas pra cada lado e descanso, usadas no advance.
  side_a_ms: number;
  side_b_ms: number;
  rest_ms: number;
  phase: TimerPhase;
  notes?: string;
}

interface TimerState {
  timers: ActiveTimer[];
  start: (
    timer: Omit<ActiveTimer, 'started_at' | 'phase' | 'duration_ms'>,
  ) => void;
  stop: (id: string) => void;
  advance: (id: string) => void;
}

function nextPhase(current: TimerPhase): TimerPhase {
  if (current === 'side_a') return 'side_b';
  if (current === 'side_b') return 'resting';
  return 'done';
}

function durationForPhase(t: Omit<ActiveTimer, 'duration_ms'>, phase: TimerPhase): number {
  if (phase === 'side_a') return t.side_a_ms;
  if (phase === 'side_b') return t.side_b_ms;
  if (phase === 'resting') return t.rest_ms;
  return 0;
}

export const useTimers = create<TimerState>()(
  persist(
    (set) => ({
      timers: [],
      start: (timer) =>
        set((s) => {
          const next: ActiveTimer = {
            ...timer,
            started_at: Date.now(),
            phase: 'side_a',
            duration_ms: timer.side_a_ms,
          };
          return { timers: [...s.timers.filter((t) => t.id !== timer.id), next] };
        }),
      stop: (id) => set((s) => ({ timers: s.timers.filter((t) => t.id !== id) })),
      advance: (id) =>
        set((s) => ({
          timers: s.timers.map((t) => {
            if (t.id !== id) return t;
            const np = nextPhase(t.phase);
            // Pula fase de descanso se rest_ms = 0.
            const phase = np === 'resting' && t.rest_ms <= 0 ? 'done' : np;
            return {
              ...t,
              phase,
              started_at: Date.now(),
              duration_ms: durationForPhase(t, phase),
            };
          }),
        })),
    }),
    {
      name: 'fogo-alto.timers',
      // Bump quando a forma do ActiveTimer muda — limpa timers antigos.
      version: 2,
    },
  ),
);
