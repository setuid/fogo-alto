import { useMemo, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ChevronDown, Clock, Flame, Play, Sparkles } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { TimerCard } from '@/components/cooking/TimerCard';
import { CutIcon } from '@/components/icons/CutIcon';
import { VegetableIcon } from '@/components/icons/VegetableIcon';

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

// Mesma divisão do wizard pra organizar a tela.
const APERITIVO_IDS = new Set([
  'linguica',
  'salsichao',
  'asinha_frango',
  'coracao_frango',
  'sobrecoxa_frango',
  'queijo_coalho',
  'pao_alho',
  'abacaxi',
]);
const VEGETABLE_IDS = new Set([
  'cenoura',
  'palmito_pupunha',
  'batata',
  'cebola',
  'tomate',
  'pimentao_vermelho',
  'pimentao_amarelo',
  'pimentao_verde',
  'aspargos',
  'abobrinha',
  'berinjela',
  'cogumelo',
]);

const DEFAULT_DONENESS: Doneness = 'ao_ponto';
const DEFAULT_THICKNESS_CM = 3;

interface PlanItem {
  cut_id: string;
  total_minutes: number;
  rest_minutes: number;
  minutes_per_side: number;
  technique: CookingTechnique;
  // Tempo total = cooking + descanso. Define quem entra primeiro.
  total_with_rest_minutes: number;
  // Atraso (em minutos) em relação ao item mais demorado, pra todos
  // ficarem prontos juntos.
  delay_from_first_minutes: number;
}

function buildPlan(meats: { cut_id: string }[]): PlanItem[] {
  const items: PlanItem[] = [];
  for (const m of meats) {
    const cut = findCutById(m.cut_id);
    if (!cut) continue;
    const technique = (cut.techniques[0] ?? 'parrilla') as CookingTechnique;
    const time = resolveCookingTime(
      m.cut_id,
      technique,
      DEFAULT_DONENESS,
      DEFAULT_THICKNESS_CM,
    );
    if (!time) continue;
    items.push({
      cut_id: m.cut_id,
      total_minutes: time.total_minutes,
      rest_minutes: time.rest_minutes,
      minutes_per_side: time.minutes_per_side,
      technique,
      total_with_rest_minutes: time.total_minutes + time.rest_minutes,
      delay_from_first_minutes: 0,
    });
  }
  if (items.length === 0) return [];
  // O item mais demorado vai primeiro (delay = 0); os outros entram
  // depois pra terminar junto.
  items.sort((a, b) => b.total_with_rest_minutes - a.total_with_rest_minutes);
  const longest = items[0].total_with_rest_minutes;
  for (const item of items) {
    item.delay_from_first_minutes = longest - item.total_with_rest_minutes;
  }
  return items;
}

function formatDelay(minutes: number, isPt: boolean): string {
  if (minutes <= 0) return isPt ? 'Comece agora' : 'Start now';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return isPt ? `Daqui ${m} min` : `In ${m} min`;
  if (m === 0) return isPt ? `Daqui ${h}h` : `In ${h}h`;
  return isPt ? `Daqui ${h}h${String(m).padStart(2, '0')}` : `In ${h}h${String(m).padStart(2, '0')}`;
}

function formatDuration(minutes: number, isPt: boolean): string {
  if (minutes < 60) return isPt ? `${minutes} min` : `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, '0')}`;
}

export function CookingMode() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation(['common', 'barbecue', 'cooking']);
  const isPt = (i18n.resolvedLanguage ?? 'pt-BR') === 'pt-BR';
  const { data: bbq } = useBarbecue(id);
  const timers = useTimers((s) => s.timers);

  const calculation = useMemo(() => (bbq ? calcForBarbecue(bbq) : null), [bbq]);
  const plan = useMemo(() => (calculation ? buildPlan(calculation.meats) : []), [calculation]);

  if (!bbq || !calculation) {
    return <div className="container mx-auto max-w-2xl px-4 py-8">{t('common:loading')}</div>;
  }

  const aperitivos = calculation.meats.filter((m) => APERITIVO_IDS.has(m.cut_id));
  const carnes = calculation.meats.filter(
    (m) => !APERITIVO_IDS.has(m.cut_id) && !VEGETABLE_IDS.has(m.cut_id),
  );
  const legumes = calculation.meats.filter((m) => VEGETABLE_IDS.has(m.cut_id));

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
            <h3 className="mb-3 text-stamp text-tomato-deep">
              {isPt ? 'Timers ativos' : 'Active timers'}
            </h3>
            <div className="grid gap-3">
              {timers.map((tmr) => (
                <TimerCard key={tmr.id} timer={tmr} />
              ))}
            </div>
          </section>
        )}

        {plan.length > 0 && (
          <CollapsibleSection title={isPt ? 'Plano sugerido' : 'Suggested plan'} defaultOpen>
            <PlanCardContent plan={plan} isPt={isPt} />
          </CollapsibleSection>
        )}

        {aperitivos.length > 0 && (
          <CollapsibleSection title={isPt ? 'Aperitivos' : 'Appetizers'} defaultOpen={false}>
            <CategoryItems meats={aperitivos} iconColor="text-ember" useVegetableIcon={false} />
          </CollapsibleSection>
        )}
        {carnes.length > 0 && (
          <CollapsibleSection title={isPt ? 'Carnes' : 'Meats'} defaultOpen={false}>
            <CategoryItems meats={carnes} iconColor="text-tomato" useVegetableIcon={false} />
          </CollapsibleSection>
        )}
        {legumes.length > 0 && (
          <CollapsibleSection title={isPt ? 'Legumes' : 'Vegetables'} defaultOpen={false}>
            <CategoryItems meats={legumes} iconColor="text-olive-deep" useVegetableIcon />
          </CollapsibleSection>
        )}
      </div>
    </div>
  );
}

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mb-3 flex w-full items-center justify-between gap-2 rounded-lg text-left text-stamp text-tomato-deep transition-colors hover:text-tomato"
        aria-expanded={open}
      >
        <span>{title}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
            open ? '' : '-rotate-90'
          }`}
        />
      </button>
      {open && children}
    </section>
  );
}

function PlanCardContent({ plan, isPt }: { plan: PlanItem[]; isPt: boolean }) {
  const start = useTimers((s) => s.start);

  const handleStart = (item: PlanItem) => {
    const id = `${item.cut_id}-${Date.now()}`;
    const sideMs = item.minutes_per_side * 60 * 1000;
    start({
      id,
      cut_id: item.cut_id,
      technique: item.technique,
      doneness: DEFAULT_DONENESS,
      thickness_cm: DEFAULT_THICKNESS_CM,
      side_a_ms: sideMs,
      side_b_ms: sideMs,
      rest_ms: item.rest_minutes * 60 * 1000,
    });
  };

  return (
      <Card className="p-4">
        <div className="mb-3 flex items-start gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-tomato" />
          <p className="text-xs text-ink/65">
            {isPt
              ? 'Os itens mais demorados entram primeiro pra todos ficarem prontos ao mesmo tempo. Comece pelo primeiro e siga a ordem.'
              : 'Longer-cooking items go on first so everything finishes together. Start with the top one and follow the order.'}
          </p>
        </div>

        <ol className="space-y-2">
          {plan.map((item, idx) => {
            const cut = findCutById(item.cut_id);
            if (!cut) return null;
            const isVeg = VEGETABLE_IDS.has(item.cut_id);
            const isAperitivo = APERITIVO_IDS.has(item.cut_id);
            return (
              <li
                key={item.cut_id}
                className="flex items-center gap-3 rounded-xl bg-cream-paper p-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-tomato/15 text-xs font-semibold text-tomato-deep tabular-nums">
                  {idx + 1}
                </span>
                <span className="shrink-0">
                  {isVeg ? (
                    <VegetableIcon vegetableId={item.cut_id} className="h-6 w-6 text-olive-deep" />
                  ) : (
                    <CutIcon
                      cutId={item.cut_id}
                      className={`h-6 w-6 ${isAperitivo ? 'text-ember' : 'text-tomato'}`}
                    />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium leading-tight">
                    {isPt ? cut.name_pt : cut.name_en}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-ink/55">
                    <Clock className="h-3 w-3" />
                    <span>
                      {formatDelay(item.delay_from_first_minutes, isPt)}
                      {' · '}
                      {formatDuration(item.total_with_rest_minutes, isPt)}
                    </span>
                  </p>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  className="shrink-0"
                  onClick={() => handleStart(item)}
                >
                  <Play className="h-3.5 w-3.5" />
                  {isPt ? 'Iniciar' : 'Start'}
                </Button>
              </li>
            );
          })}
        </ol>
      </Card>
  );
}

function CategoryItems({
  meats,
  iconColor,
  useVegetableIcon,
}: {
  meats: { cut_id: string; total_grams: number }[];
  iconColor: string;
  useVegetableIcon: boolean;
}) {
  return (
    <div className="grid gap-3">
      {meats.map((m) => (
        <CookingItem
          key={m.cut_id}
          cutId={m.cut_id}
          totalGrams={m.total_grams}
          iconColor={iconColor}
          useVegetableIcon={useVegetableIcon}
        />
      ))}
    </div>
  );
}

function CookingItem({
  cutId,
  totalGrams,
  iconColor,
  useVegetableIcon,
}: {
  cutId: string;
  totalGrams: number;
  iconColor: string;
  useVegetableIcon: boolean;
}) {
  const { t, i18n } = useTranslation(['cooking']);
  const isPt = (i18n.resolvedLanguage ?? 'pt-BR') === 'pt-BR';
  const cut = findCutById(cutId);
  const start = useTimers((s) => s.start);

  const defaultTechnique = (cut?.techniques[0] ?? 'parrilla') as CookingTechnique;
  const [technique, setTechnique] = useState<CookingTechnique>(defaultTechnique);
  const [doneness, setDoneness] = useState<Doneness>(DEFAULT_DONENESS);
  const [thickness, setThickness] = useState(DEFAULT_THICKNESS_CM);

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
        <div className="flex items-start gap-3">
          <span className="shrink-0">
            {useVegetableIcon ? (
              <VegetableIcon vegetableId={cutId} className={`h-8 w-8 ${iconColor}`} />
            ) : (
              <CutIcon cutId={cutId} className={`h-8 w-8 ${iconColor}`} />
            )}
          </span>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl">{isPt ? cut.name_pt : cut.name_en}</CardTitle>
            <p className="mt-1 text-xs text-ink/60">{(totalGrams / 1000).toFixed(2)} kg</p>
          </div>
          <Badge className="shrink-0 text-stamp">{t(`cooking:techniques.${defaultTechnique}`)}</Badge>
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
