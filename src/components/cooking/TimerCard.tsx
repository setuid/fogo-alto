import { useTranslation } from 'react-i18next';
import { ChefHat, Flame, RotateCw, Timer, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { findCutById } from '@/data/catalog';
import { formatRemaining, useTimerProgress } from '@/hooks/useCookingTimer';
import { useTimers, type ActiveTimer, type TimerPhase } from '@/stores/timerStore';

const PHASE_LABEL: Record<TimerPhase, { pt: string; en: string; icon: typeof Flame }> = {
  side_a: { pt: 'Lado A', en: 'Side A', icon: Flame },
  side_b: { pt: 'Lado B (vire!)', en: 'Side B (flip!)', icon: RotateCw },
  resting: { pt: 'Descanso', en: 'Resting', icon: Timer },
  done: { pt: 'Pronto', en: 'Done', icon: ChefHat },
};

export function TimerCard({ timer }: { timer: ActiveTimer }) {
  const { i18n } = useTranslation('cooking');
  const isPt = (i18n.resolvedLanguage ?? 'pt-BR') === 'pt-BR';
  const cut = findCutById(timer.cut_id);
  const stop = useTimers((s) => s.stop);
  const progress = useTimerProgress(timer.id);

  const phase = PHASE_LABEL[timer.phase];
  const PhaseIcon = phase.icon;
  const phaseLabel = isPt ? phase.pt : phase.en;

  const sideAMin = Math.round(timer.side_a_ms / 60000);
  const sideBMin = Math.round(timer.side_b_ms / 60000);
  const restMin = Math.round(timer.rest_ms / 60000);

  return (
    <Card className="overflow-hidden p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-stamp text-tomato-deep flex items-center gap-1">
            <PhaseIcon className="h-3 w-3" />
            {phaseLabel}
          </p>
          <h3 className="font-display text-xl">
            {cut ? (isPt ? cut.name_pt : cut.name_en) : timer.cut_id}
          </h3>
          <p className="text-xs text-ink/60">
            {sideAMin} min/lado · {restMin} min descanso · {timer.thickness_cm} cm
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => stop(timer.id)} aria-label="stop">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {timer.phase === 'done' ? (
        <p className="mt-4 text-sm text-olive-deep">
          {isPt ? 'Sirva agora — bom apetite!' : 'Serve now — enjoy!'}
        </p>
      ) : (
        <>
          <div className="mt-4 flex items-center gap-3">
            <Timer className="h-5 w-5 text-tomato" />
            <span className="font-display text-3xl font-semibold tabular-nums">
              {progress ? formatRemaining(progress.remaining_ms) : '—'}
            </span>
            <span className="ml-auto text-xs text-ink/55">
              de {timer.phase === 'side_a' ? sideAMin : timer.phase === 'side_b' ? sideBMin : restMin} min
            </span>
          </div>
          <Progress value={progress?.progress_percent ?? 0} className="mt-3" />
        </>
      )}
    </Card>
  );
}
