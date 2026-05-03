import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Flame, Play } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { TimerCard } from '@/components/cooking/TimerCard';

import { useBarbecue } from '@/hooks/useBarbecue';
import { useTimers } from '@/stores/timerStore';
import { calcForBarbecue } from '@/lib/calc-mapping';
import { findCutById } from '@/data/catalog';
import { resolveCookingTime } from '@/lib/cooking-time';
import type { CookingTechnique, Doneness } from '@/types/domain';

const TECHNIQUES: CookingTechnique[] = [
  'parrilla',
  'grelha',
  'brasa_direta',
  'brasa_indireta',
  'forno',
  'defumador',
];

const DONENESSES: Doneness[] = [
  'mal_passado',
  'ao_ponto_para_mal',
  'ao_ponto',
  'ao_ponto_para_bem',
  'bem_passado',
];

export function CookingMode() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation(['common', 'barbecue', 'cooking']);
  const { data: bbq } = useBarbecue(id);
  const timers = useTimers((s) => s.timers);

  const calculation = useMemo(() => (bbq ? calcForBarbecue(bbq) : null), [bbq]);

  if (!bbq || !calculation) {
    return <div className="container mx-auto max-w-2xl px-4 py-8">{t('common:loading')}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-amber-mid">
      <header className="container mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-4 sm:py-6">
        <Button asChild variant="ghost" size="sm">
          <Link to={`/barbecue/${bbq.id}`}>
            <ArrowLeft className="h-4 w-4" /> {t('common:actions.back')}
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-tomato animate-ember" strokeWidth={2.5} />
          <span className="font-display text-lg font-semibold">{t('cooking:title')}</span>
        </div>
      </header>

      <div className="container mx-auto max-w-2xl space-y-6 px-4 pb-16">
        {timers.length > 0 && (
          <section>
            <h3 className="mb-3 text-stamp text-tomato-deep">Timers ativos</h3>
            <div className="grid gap-3">
              {timers.map((tmr) => (
                <TimerCard key={tmr.id} timer={tmr} />
              ))}
            </div>
          </section>
        )}

        <section>
          <h3 className="mb-3 text-stamp text-tomato-deep">Carnes</h3>
          <div className="grid gap-3">
            {calculation.meats.map((m) => (
              <CookingItem key={m.cut_id} cutId={m.cut_id} totalGrams={m.total_grams} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function CookingItem({ cutId, totalGrams }: { cutId: string; totalGrams: number }) {
  const { t, i18n } = useTranslation(['cooking']);
  const isPt = (i18n.resolvedLanguage ?? 'pt-BR') === 'pt-BR';
  const cut = findCutById(cutId);
  const start = useTimers((s) => s.start);

  const defaultTechnique = (cut?.techniques[0] ?? 'parrilla') as CookingTechnique;
  const [technique, setTechnique] = useState<CookingTechnique>(defaultTechnique);
  const [doneness, setDoneness] = useState<Doneness>('ao_ponto');
  const [thickness, setThickness] = useState(3);

  if (!cut) return null;

  const time = resolveCookingTime(cutId, technique, doneness, thickness);

  const handleStart = () => {
    if (!time) return;
    const id = `${cutId}-${Date.now()}`;
    const sideMs = time.minutes_per_side * 60 * 1000;
    start({
      id,
      cut_id: cutId,
      technique,
      doneness,
      thickness_cm: thickness,
      side_a_ms: sideMs,
      side_b_ms: sideMs,
      rest_ms: time.rest_minutes * 60 * 1000,
    });
  };

  return (
    <Card className="p-5">
      <CardHeader className="p-0 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{isPt ? cut.name_pt : cut.name_en}</CardTitle>
            <p className="mt-1 text-xs text-ink/60">
              {(totalGrams / 1000).toFixed(2)} kg
            </p>
          </div>
          <Badge className="text-stamp">{t(`cooking:techniques.${defaultTechnique}`)}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-0">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-stamp text-ink/65">Técnica</label>
            <Select value={technique} onValueChange={(v) => setTechnique(v as CookingTechnique)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TECHNIQUES.map((tech) => (
                  <SelectItem key={tech} value={tech}>
                    {t(`cooking:techniques.${tech}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-stamp text-ink/65">Ponto</label>
            <Select value={doneness} onValueChange={(v) => setDoneness(v as Doneness)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DONENESSES.map((d) => (
                  <SelectItem key={d} value={d}>
                    {t(`cooking:doneness.${d}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-stamp text-ink/65">{t('cooking:thickness_label')}</label>
            <span className="text-sm font-medium">{thickness} cm</span>
          </div>
          <Slider
            value={[thickness]}
            onValueChange={([v]) => setThickness(v)}
            min={1}
            max={10}
            step={1}
            className="mt-2"
          />
        </div>

        {time ? (
          <div className="rounded-xl bg-tomato/5 p-3 text-sm">
            <p className="text-ink/70">
              <strong>{time.total_minutes} min</strong> total ({time.minutes_per_side} min/lado)
              {' · '}
              {time.rest_minutes} min de descanso
            </p>
            {time.source === 'heuristic' && (
              <p className="mt-1 text-xs text-ink/55">Estimativa heurística</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-ink/60">{t('cooking:no_time_data')}</p>
        )}

        {cut.tips_pt.length > 0 && (
          <ul className="list-disc space-y-1 pl-5 text-sm text-ink/70">
            {(isPt ? cut.tips_pt : cut.tips_en).map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        )}

        <Button onClick={handleStart} disabled={!time} variant="cta" size="lg" className="w-full">
          <Play className="h-4 w-4" strokeWidth={2.5} />
          {t('cooking:start_timer')}
        </Button>
      </CardContent>
    </Card>
  );
}
