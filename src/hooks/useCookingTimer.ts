import { useEffect, useState } from 'react';
import { useTimers } from '@/stores/timerStore';

export interface TimerProgress {
  remaining_ms: number;
  elapsed_ms: number;
  progress_percent: number;
  expired: boolean;
}

export function useTimerProgress(timerId: string): TimerProgress | null {
  const timers = useTimers((s) => s.timers);
  const advanceToRest = useTimers((s) => s.advanceToRest);
  const markDone = useTimers((s) => s.markDone);
  const timer = timers.find((t) => t.id === timerId);
  const [, force] = useState(0);

  useEffect(() => {
    if (!timer || timer.phase === 'done') return;
    const interval = setInterval(() => force((n) => n + 1), 250);
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (!timer) return;
    if (timer.phase === 'done') return;
    const remaining = timer.started_at + timer.duration_ms - Date.now();
    if (remaining <= 0) {
      // Beep + vibração quando o timer expira.
      void playBeep();
      if ('vibrate' in navigator) navigator.vibrate?.([200, 100, 200]);
      if (timer.phase === 'cooking' && timer.rest_ms > 0) {
        advanceToRest(timer.id);
      } else {
        markDone(timer.id);
      }
    }
  });

  if (!timer) return null;

  const elapsed = Date.now() - timer.started_at;
  const remaining = Math.max(0, timer.duration_ms - elapsed);
  const progress = timer.duration_ms > 0 ? Math.min(100, (elapsed / timer.duration_ms) * 100) : 100;

  return {
    remaining_ms: remaining,
    elapsed_ms: elapsed,
    progress_percent: progress,
    expired: remaining <= 0,
  };
}

let audioCtx: AudioContext | null = null;

async function playBeep() {
  try {
    audioCtx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const ctx = audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch {
    // Sem áudio? Tudo bem — vibração ainda atua.
  }
}

export function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
