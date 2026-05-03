import { useTranslation } from 'react-i18next';
import { Timer, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { findCutById } from '@/data/catalog';
import { formatRemaining, useTimerProgress } from '@/hooks/useCookingTimer';
import { useTimers, type ActiveTimer } from '@/stores/timerStore';

export function TimerCard({ timer }: { timer: ActiveTimer }) {
  const { t, i18n } = useTranslation('cooking');
  const isPt = (i18n.resolvedLanguage ?? 'pt-BR') === 'pt-BR';
  const cut = findCutById(timer.cut_id);
  const stop = useTimers((s) => s.stop);
  const progress = useTimerProgress(timer.id);

  const phaseLabel = (() => {
    if (timer.phase === 'cooking') return isPt ? 'Cozinhando' : 'Cooking';
    if (timer.phase === 'resting') return t('rest');
    return isPt ? 'Pronto' : 'Done';
  })();

  return (
    <Card className="overflow-hidden p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-stamp text-tomato-deep">{phaseLabel}</p>
          <h3 className="font-display text-xl">{cut ? (isPt ? cut.name_pt : cut.name_en) : timer.cut_id}</h3>
          <p className="text-xs text-ink/60">
            {t(`techniques.${timer.technique}`)} · {t(`doneness.${timer.doneness}`)} · {timer.thickness_cm} cm
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => stop(timer.id)} aria-label="stop">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Timer className="h-5 w-5 text-tomato" />
        <span className="font-display text-3xl font-semibold tabular-nums">
          {progress ? formatRemaining(progress.remaining_ms) : '—'}
        </span>
      </div>
      <Progress value={progress?.progress_percent ?? 0} className="mt-3" />
    </Card>
  );
}
