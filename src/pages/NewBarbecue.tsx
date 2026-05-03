import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Beef, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { AppHeader } from '@/components/shared/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BudgetTracker } from '@/components/shared/BudgetTracker';
import { QuantityStepper } from '@/components/shared/QuantityStepper';
import { FieldError } from '@/components/shared/FieldError';
import { CutIcon } from '@/components/icons/CutIcon';
import { VegetableIcon } from '@/components/icons/VegetableIcon';
import { AnimalDiagram } from '@/components/cuts/AnimalDiagram';
import { DrinkRow } from '@/components/shared/DrinkRow';
import { toast } from '@/components/ui/sonner';

import { MEAT_CUTS, SIDES } from '@/data/catalog';

// Cuts que são tratados como "vegetais grelháveis" no wizard. Os IDs nesse
// set são renderizados com VegetableIcon e mostrados na seção "Legumes
// & extras", separada visualmente das carnes.
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

// Cuts não-bovinos/suínos/aves que vão pra brasa mas não são propriamente
// carnes nem legumes (queijo, pão de alho, abacaxi).
const EXTRA_IDS = new Set(['queijo_coalho', 'pao_alho', 'abacaxi']);

const MEAT_CUT_LIST = MEAT_CUTS.filter(
  (c) => !VEGETABLE_IDS.has(c.id) && !EXTRA_IDS.has(c.id),
);
const VEGETABLE_LIST = MEAT_CUTS.filter((c) => VEGETABLE_IDS.has(c.id));
const EXTRA_LIST = MEAT_CUTS.filter((c) => EXTRA_IDS.has(c.id));

// Lista [min, min+1, …, max] usada nos selects de pessoas/bebedores.
function countOptions(min: number, max: number): number[] {
  const safeMax = Math.max(min, max);
  return Array.from({ length: safeMax - min + 1 }, (_, i) => min + i);
}
import { useBarbecues, useCreateBarbecue, useDuplicateBarbecue } from '@/hooks/useBarbecue';
import {
  calculate,
  suggestCutQuantitiesForStyle,
  suggestSideQuantities,
  suggestedMeatGrams,
  suggestedSidesGrams,
} from '@/lib/calculator';
import { calcInputFromBarbecue } from '@/lib/calc-mapping';
import { formatGrams } from '@/lib/utils';
import type { BarbecueStyle, WeightProfile } from '@/types/domain';
import type { CalcParams } from '@/types/database';

const STYLES: BarbecueStyle[] = ['tradicional', 'parrilla', 'espeto_corrido', 'americano', 'misto'];
const PROFILES: WeightProfile[] = ['light', 'normal', 'heavy'];

const quantitiesSchema = z.record(z.string(), z.coerce.number().int().min(0).max(99));

const schema = z
  .object({
    title: z.string().min(2, { message: 'O título precisa de pelo menos 2 caracteres.' }),
    description: z.string().optional(),
    event_date: z.string().min(1, { message: 'Escolha a data e a hora do churrasco.' }),
    location: z.string().optional(),
    style: z.enum(['tradicional', 'parrilla', 'espeto_corrido', 'americano', 'misto']),
    adults_count: z.coerce
      .number({ invalid_type_error: 'Informe quantos adultos.' })
      .int()
      .min(1, { message: 'Pelo menos 1 adulto.' })
      .max(500),
    children_count: z.coerce
      .number({ invalid_type_error: 'Número de crianças inválido.' })
      .int()
      .min(0, { message: 'Não pode ser negativo.' })
      .max(500),
    weight_profile: z.enum(['light', 'normal', 'heavy']),
    drinkers_count: z.coerce
      .number({ invalid_type_error: 'Informe quantos vão beber álcool.' })
      .int()
      .min(0),
    duration_hours: z.coerce
      .number({ invalid_type_error: 'Informe a duração estimada.' })
      .min(1, { message: 'No mínimo 1 hora.' })
      .max(24, { message: 'No máximo 24 horas.' }),
    cut_quantities: quantitiesSchema,
    side_quantities: quantitiesSchema,
    drink_beer: z.boolean(),
    drink_wine: z.boolean(),
    drink_caipirinha: z.boolean(),
    drink_soft: z.boolean(),
  })
  .refine((d) => d.drinkers_count <= d.adults_count, {
    message: 'Bebedores não podem ser mais que o número de adultos.',
    path: ['drinkers_count'],
  })
  .refine((d) => Object.values(d.cut_quantities).some((q) => q > 0), {
    message: 'Adicione ao menos uma peça de carne.',
    path: ['cut_quantities'],
  });

type FormValues = z.infer<typeof schema>;

const STEP_COUNT = 5;

export function NewBarbecue() {
  const { t } = useTranslation(['common', 'barbecue']);
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const { data: existingBbqs } = useBarbecues();
  const duplicateMutation = useDuplicateBarbecue();
  const createMutation = useCreateBarbecue();

  const defaultStyle: BarbecueStyle = 'tradicional';
  const initialMeatTarget = suggestedMeatGrams(5, 0, 'normal', defaultStyle);
  const initialSidesTarget = suggestedSidesGrams(5, 0);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      event_date: '',
      location: '',
      style: defaultStyle,
      adults_count: 5,
      children_count: 0,
      weight_profile: 'normal',
      drinkers_count: 5,
      duration_hours: 5,
      cut_quantities: suggestCutQuantitiesForStyle(defaultStyle, initialMeatTarget),
      side_quantities: suggestSideQuantities(initialSidesTarget),
      drink_beer: true,
      drink_wine: false,
      drink_caipirinha: false,
      drink_soft: true,
    },
  });

  const v = form.watch();

  // Quando o estilo muda, reotimiza as quantidades sugeridas pra alvo novo.
  const handleStyleChange = (next: BarbecueStyle) => {
    form.setValue('style', next);
    const target = suggestedMeatGrams(v.adults_count, v.children_count, v.weight_profile, next);
    form.setValue('cut_quantities', suggestCutQuantitiesForStyle(next, target));
  };

  const handleAdultsChange = (next: number) => {
    const oldAdults = form.getValues('adults_count');
    const oldDrinkers = form.getValues('drinkers_count');
    form.setValue('adults_count', next);
    if (oldDrinkers === oldAdults || oldDrinkers > next) {
      form.setValue('drinkers_count', next);
    }
  };

  const setCutQty = (cutId: string, n: number) => {
    const current = { ...form.getValues('cut_quantities') };
    if (n <= 0) delete current[cutId];
    else current[cutId] = n;
    form.setValue('cut_quantities', current, { shouldValidate: true });
  };

  const setSideQty = (sideId: string, n: number) => {
    const current = { ...form.getValues('side_quantities') };
    if (n <= 0) delete current[sideId];
    else current[sideId] = n;
    form.setValue('side_quantities', current);
  };

  const handleDuplicate = async (sourceId: string) => {
    try {
      const created = await duplicateMutation.mutateAsync(sourceId);
      toast.success('Churrasco duplicado.');
      navigate(`/barbecue/${created.id}/edit`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('common:error_generic'));
    }
  };

  const onSubmit = form.handleSubmit(
    async (values) => {
      const calc_params: CalcParams = {
        cut_quantities: values.cut_quantities,
        side_quantities: values.side_quantities,
        adults_count: values.adults_count,
        children_count: values.children_count,
        drinkers_count: values.drinkers_count,
        duration_hours: values.duration_hours,
        weight_profile: values.weight_profile,
        drink_preferences: {
          beer: values.drink_beer,
          wine: values.drink_wine,
          caipirinha: values.drink_caipirinha,
          soft_drinks: values.drink_soft,
        },
      };
      try {
        const created = await createMutation.mutateAsync({
          title: values.title,
          description: values.description,
          event_date: new Date(values.event_date).toISOString(),
          location: values.location,
          style: values.style,
          estimated_guests: values.adults_count + values.children_count,
          include_sides: Object.values(values.side_quantities).some((q) => q > 0),
          calc_params,
        });
        toast.success('Churrasco criado.');
        navigate(`/barbecue/${created.id}`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : t('common:error_generic'));
      }
    },
    (errors) => {
      const first = Object.values(errors)[0]?.message;
      toast.error(
        typeof first === 'string'
          ? first
          : 'Confira os passos anteriores — ainda falta preencher alguma coisa.',
      );
    },
  );

  const next = async () => {
    const fieldsByStep: Array<(keyof FormValues)[]> = [
      [],
      ['title', 'event_date'],
      ['style', 'adults_count', 'children_count', 'duration_hours', 'drinkers_count', 'weight_profile'],
      ['cut_quantities'],
      [],
    ];
    const fields = fieldsByStep[step];
    if (fields.length > 0) {
      const ok = await form.trigger(fields);
      if (!ok) {
        toast.error('Preencha os campos obrigatórios pra avançar.');
        return;
      }
    }
    setStep((s) => Math.min(s + 1, STEP_COUNT - 1));
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <>
      <AppHeader />
      <div className="container mx-auto max-w-2xl px-4 pb-16">
        <Badge variant="default" className="mb-2 text-stamp">
          {t('barbecue:dashboard.create_new')}
        </Badge>
        <h2 className="mb-2 font-display text-3xl font-semibold">
          {step === 0 ? 'Bora começar' : v.title || 'Novo churrasco'}
        </h2>
        <Progress value={((step + 1) / STEP_COUNT) * 100} className="mb-8" />

        <Card>
          <CardContent className="p-6">
            {step === 0 && (
              <Step0Origin
                onFresh={() => setStep(1)}
                existing={existingBbqs ?? []}
                onDuplicate={(id) => void handleDuplicate(id)}
              />
            )}

            {step === 1 && <Step1Basic form={form} onSubmitStep={() => void next()} />}

            {step === 2 && (
              <Step2Style
                form={form}
                onStyleChange={handleStyleChange}
                onAdultsChange={handleAdultsChange}
              />
            )}

            {step === 3 && (
              <Step3Picks
                values={v}
                setCutQty={setCutQty}
                setSideQty={setSideQty}
                onDrinkChange={(key, c) => form.setValue(key, c)}
                cutError={form.formState.errors.cut_quantities?.message?.toString()}
              />
            )}

            {step === 4 && (
              <ReviewStep
                values={v}
                onCreate={() => void onSubmit()}
                creating={createMutation.isPending}
              />
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-between">
          <Button variant="ghost" onClick={back} disabled={step === 0} type="button">
            <ChevronLeft className="h-4 w-4" /> {t('common:actions.back')}
          </Button>
          {step < STEP_COUNT - 1 ? (
            <Button onClick={() => void next()} type="button">
              {t('common:actions.next')}
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="cta"
              size="lg"
              onClick={() => void onSubmit()}
              disabled={createMutation.isPending}
            >
              <Sparkles className="h-4 w-4" />
              {createMutation.isPending ? t('common:loading') : t('common:actions.finish')}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Steps
// ─────────────────────────────────────────────────────────────────────

function Step0Origin({
  onFresh,
  existing,
  onDuplicate,
}: {
  onFresh: () => void;
  existing: { id: string; title: string }[];
  onDuplicate: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-xl font-semibold">Como começar?</h3>
        <p className="text-sm text-ink/60">
          Comece do zero ou duplique um churrasco anterior para reaproveitar as preferências.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Card
          className="cursor-pointer p-4 transition-all hover:-translate-y-0.5 hover:shadow-cta"
          onClick={onFresh}
        >
          <p className="text-stamp text-tomato-deep">Do zero</p>
          <p className="mt-2 font-display text-lg">Criar um novo</p>
        </Card>
        {existing.length > 0 && (
          <Card className="p-4">
            <p className="text-stamp text-tomato-deep">Duplicar</p>
            <p className="mt-1 font-display text-lg">Anteriores</p>
            <ul className="mt-3 space-y-1">
              {existing.slice(0, 5).map((b) => (
                <li key={b.id}>
                  <button
                    type="button"
                    className="text-left text-sm text-ink/70 hover:text-tomato"
                    onClick={() => onDuplicate(b.id)}
                  >
                    {b.title}
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}

function Step1Basic({
  form,
  onSubmitStep,
}: {
  form: ReturnType<typeof useForm<FormValues>>;
  onSubmitStep: () => void;
}) {
  const { t } = useTranslation('barbecue');
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmitStep();
      }}
    >
      <div>
        <Label htmlFor="title">{t('fields.title')}</Label>
        <Input id="title" placeholder="Aniversário do João" {...form.register('title')} />
        <FieldError message={form.formState.errors.title?.message} />
      </div>
      <div>
        <Label htmlFor="date">{t('fields.event_date')}</Label>
        <Input id="date" type="datetime-local" {...form.register('event_date')} />
        <FieldError message={form.formState.errors.event_date?.message} />
      </div>
      <div>
        <Label htmlFor="location">{t('fields.location')}</Label>
        <Input
          id="location"
          placeholder="Casa do João, rua…"
          {...form.register('location')}
        />
      </div>
      <div>
        <Label htmlFor="description">{t('fields.description')}</Label>
        <Textarea id="description" {...form.register('description')} />
      </div>
      <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
    </form>
  );
}

function Step2Style({
  form,
  onStyleChange,
  onAdultsChange,
}: {
  form: ReturnType<typeof useForm<FormValues>>;
  onStyleChange: (s: BarbecueStyle) => void;
  onAdultsChange: (n: number) => void;
}) {
  const { t } = useTranslation('barbecue');
  const v = form.watch();
  return (
    <div className="space-y-6">
      <div>
        <Label>{t('fields.style')}</Label>
        <Select value={v.style} onValueChange={(s) => onStyleChange(s as BarbecueStyle)}>
          <SelectTrigger className="mt-1 h-auto py-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STYLES.map((s) => (
              <SelectItem key={s} value={s}>
                <div className="flex flex-col">
                  <span className="font-medium">{t(`styles.${s}`)}</span>
                  <span className="text-xs text-ink/60">{t(`style_descriptions.${s}`)}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="mt-1 text-xs text-ink/60">{t(`style_descriptions.${v.style}`)}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="adults">{t('fields.adults_count')}</Label>
          <Select
            value={String(v.adults_count ?? 5)}
            onValueChange={(value) => onAdultsChange(Number(value))}
          >
            <SelectTrigger id="adults" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countOptions(1, 15).map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={form.formState.errors.adults_count?.message} />
        </div>
        <div>
          <Label htmlFor="children">{t('fields.children_count')}</Label>
          <Select
            value={String(v.children_count ?? 0)}
            onValueChange={(value) => form.setValue('children_count', Number(value))}
          >
            <SelectTrigger id="children" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countOptions(0, 15).map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-ink/55">{t('fields_hints.children_count')}</p>
        </div>
      </div>

      <div>
        <Label htmlFor="drinkers">{t('fields.drinkers_count')}</Label>
        <Select
          value={String(v.drinkers_count ?? 0)}
          onValueChange={(value) => form.setValue('drinkers_count', Number(value))}
        >
          <SelectTrigger id="drinkers" className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {countOptions(0, v.adults_count ?? 15).map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="mt-1 text-xs text-ink/55">{t('fields_hints.drinkers_count')}</p>
        <FieldError message={form.formState.errors.drinkers_count?.message} />
      </div>

      <div>
        <Label htmlFor="duration">{t('fields.duration_hours')}</Label>
        <Input
          id="duration"
          type="number"
          step={0.5}
          min={1}
          max={24}
          {...form.register('duration_hours')}
        />
        <FieldError message={form.formState.errors.duration_hours?.message} />
      </div>

      <div>
        <Label>{t('weight_profile.label')}</Label>
        <RadioGroup
          className="mt-2 grid gap-2 sm:grid-cols-3"
          value={v.weight_profile}
          onValueChange={(p) => form.setValue('weight_profile', p as WeightProfile)}
        >
          {PROFILES.map((p) => (
            <Label
              key={p}
              className="flex cursor-pointer items-start gap-2 rounded-xl border border-ink/10 bg-cream-paper p-3 has-[:checked]:border-tomato has-[:checked]:bg-tomato/5"
            >
              <RadioGroupItem value={p} className="mt-0.5" />
              <div className="flex flex-col">
                <span className="font-medium">{t(`weight_profile.${p}`)}</span>
                <span className="text-xs text-ink/55">
                  {t(`weight_profile_descriptions.${p}`)}
                </span>
              </div>
            </Label>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}

function Step3Picks({
  values,
  setCutQty,
  setSideQty,
  onDrinkChange,
  cutError,
}: {
  values: FormValues;
  setCutQty: (id: string, n: number) => void;
  setSideQty: (id: string, n: number) => void;
  onDrinkChange: (
    key: 'drink_beer' | 'drink_wine' | 'drink_caipirinha' | 'drink_soft',
    next: boolean,
  ) => void;
  cutError?: string;
}) {
  const [animalOpen, setAnimalOpen] = useState(false);

  const meatTarget = useMemo(
    () =>
      suggestedMeatGrams(
        values.adults_count,
        values.children_count,
        values.weight_profile,
        values.style,
      ),
    [values.adults_count, values.children_count, values.weight_profile, values.style],
  );
  const sidesTarget = useMemo(
    () => suggestedSidesGrams(values.adults_count, values.children_count),
    [values.adults_count, values.children_count],
  );

  const meatSelected = MEAT_CUTS.reduce((acc, c) => {
    const n = values.cut_quantities[c.id] ?? 0;
    return acc + n * c.typical_piece_kg * 1000;
  }, 0);
  const sidesSelected = SIDES.reduce((acc, s) => {
    const n = values.side_quantities[s.id] ?? 0;
    return acc + n * s.typical_portion_kg * 1000;
  }, 0);

  const incrementCut = (cutId: string) => {
    setCutQty(cutId, (values.cut_quantities[cutId] ?? 0) + 1);
  };

  return (
    <div className="space-y-6">
      <section>
        <BudgetTracker
          label="Carnes & extras"
          targetGrams={meatTarget}
          selectedGrams={meatSelected}
          className="mb-3"
        />

        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-xs text-ink/55">
            Use os botões pra adicionar peças. Cada peça é o tamanho típico do açougue.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAnimalOpen(true)}
          >
            <Beef className="h-4 w-4" /> Ver no animal
          </Button>
        </div>

        <h4 className="mb-2 text-stamp text-tomato-deep">Carnes</h4>
        <div className="space-y-2">
          {MEAT_CUT_LIST.map((cut) => (
            <CutRow
              key={cut.id}
              cut={cut}
              quantity={values.cut_quantities[cut.id] ?? 0}
              onChange={(n) => setCutQty(cut.id, n)}
              icon={<CutIcon cutId={cut.id} className="h-7 w-7 text-tomato" />}
            />
          ))}
        </div>

        {EXTRA_LIST.length > 0 && (
          <>
            <h4 className="mt-4 mb-2 text-stamp text-tomato-deep">Extras na brasa</h4>
            <div className="space-y-2">
              {EXTRA_LIST.map((cut) => (
                <CutRow
                  key={cut.id}
                  cut={cut}
                  quantity={values.cut_quantities[cut.id] ?? 0}
                  onChange={(n) => setCutQty(cut.id, n)}
                  icon={<CutIcon cutId={cut.id} className="h-7 w-7 text-ember" />}
                />
              ))}
            </div>
          </>
        )}

        {VEGETABLE_LIST.length > 0 && (
          <>
            <h4 className="mt-4 mb-2 text-stamp text-tomato-deep">Legumes pra grelhar</h4>
            <div className="space-y-2">
              {VEGETABLE_LIST.map((cut) => (
                <CutRow
                  key={cut.id}
                  cut={cut}
                  quantity={values.cut_quantities[cut.id] ?? 0}
                  onChange={(n) => setCutQty(cut.id, n)}
                  icon={<VegetableIcon vegetableId={cut.id} className="h-7 w-7 text-olive-deep" />}
                />
              ))}
            </div>
          </>
        )}

        {cutError && <FieldError message={cutError} className="mt-3" />}
      </section>

      <section>
        <BudgetTracker
          label="Acompanhamentos"
          targetGrams={sidesTarget}
          selectedGrams={sidesSelected}
          className="mb-3"
        />
        <div className="space-y-2">
          {SIDES.map((side) => {
            const n = values.side_quantities[side.id] ?? 0;
            const subtotal = n * side.typical_portion_kg * 1000;
            return (
              <div
                key={side.id}
                className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                  n > 0
                    ? 'border-tomato bg-tomato/5'
                    : 'border-ink/10 bg-cream-paper hover:border-ink/20'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{side.name_pt}</p>
                  <p className="truncate text-xs text-ink/55">
                    1 {side.portion_label_pt} ≈ {side.typical_portion_kg.toFixed(1)} kg
                  </p>
                </div>
                <span className="text-xs text-ink/55 tabular-nums w-16 text-right">
                  {n > 0 ? formatGrams(subtotal) : '—'}
                </span>
                <QuantityStepper value={n} onChange={(next) => setSideQty(side.id, next)} />
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="font-display text-lg">Bebidas</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {[
            { key: 'drink_beer' as const, label: 'Cerveja' },
            { key: 'drink_wine' as const, label: 'Vinho' },
            { key: 'drink_caipirinha' as const, label: 'Caipirinha' },
            { key: 'drink_soft' as const, label: 'Refrigerante / suco' },
          ].map((b) => (
            <Label
              key={b.key}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink/10 bg-cream-paper p-3 has-[:checked]:border-tomato has-[:checked]:bg-tomato/5"
            >
              <Checkbox checked={values[b.key]} onCheckedChange={(c) => onDrinkChange(b.key, !!c)} />
              <span>{b.label}</span>
            </Label>
          ))}
        </div>
      </section>

      <AnimalDiagram
        open={animalOpen}
        onOpenChange={setAnimalOpen}
        cutQuantities={values.cut_quantities}
        onAddCut={incrementCut}
      />
    </div>
  );
}

function CutRow({
  cut,
  quantity,
  onChange,
  icon,
}: {
  cut: (typeof MEAT_CUTS)[number];
  quantity: number;
  onChange: (n: number) => void;
  icon: React.ReactNode;
}) {
  const subtotal = quantity * cut.typical_piece_kg * 1000;
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
        quantity > 0
          ? 'border-tomato bg-tomato/5'
          : 'border-ink/10 bg-cream-paper hover:border-ink/20'
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="truncate font-medium">{cut.name_pt}</p>
        <p className="truncate text-xs text-ink/55">
          1 {cut.piece_label_pt} ≈ {cut.typical_piece_kg.toFixed(1)} kg
        </p>
      </div>
      <span className="text-xs text-ink/55 tabular-nums w-16 text-right">
        {quantity > 0 ? formatGrams(subtotal) : '—'}
      </span>
      <QuantityStepper value={quantity} onChange={onChange} />
    </div>
  );
}

function ReviewStep({
  values,
  onCreate,
  creating,
}: {
  values: FormValues;
  onCreate: () => void;
  creating: boolean;
}) {
  // Reusa o calculator pra exibir o que ficaria de bebidas/sides em peças.
  const fakeRow = {
    id: 'preview',
    host_id: '',
    share_token: '',
    title: values.title,
    description: values.description ?? null,
    event_date: values.event_date || new Date().toISOString(),
    location: values.location ?? null,
    style: values.style,
    estimated_guests: values.adults_count + values.children_count,
    status: 'planning' as const,
    include_sides: Object.values(values.side_quantities).some((q) => q > 0),
    notes: null,
    calc_params: {
      cut_quantities: values.cut_quantities,
      side_quantities: values.side_quantities,
      adults_count: values.adults_count,
      children_count: values.children_count,
      drinkers_count: values.drinkers_count,
      duration_hours: values.duration_hours,
      weight_profile: values.weight_profile,
      drink_preferences: {
        beer: values.drink_beer,
        wine: values.drink_wine,
        caipirinha: values.drink_caipirinha,
        soft_drinks: values.drink_soft,
      },
    },
    created_at: '',
    updated_at: '',
  };
  const calc = calculate(calcInputFromBarbecue(fakeRow));

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-xl font-semibold">{values.title || 'Sem título'}</h3>
        <p className="text-sm text-ink/60">
          {values.adults_count} adulto(s)
          {values.children_count > 0 && ` + ${values.children_count} criança(s)`} · {values.duration_hours}h ·{' '}
          {values.style}
        </p>
      </div>

      <BudgetTracker
        label="Carnes"
        targetGrams={calc.meta.target_meat_grams}
        selectedGrams={calc.meta.selected_meat_grams}
      />
      <Card>
        <CardContent className="p-4 space-y-1 text-sm">
          {calc.meats.map((m) => {
            const cut = MEAT_CUTS.find((c) => c.id === m.cut_id);
            return (
              <div key={m.cut_id} className="flex justify-between">
                <span>
                  {m.pieces}× {cut?.name_pt ?? m.cut_id}
                </span>
                <span className="text-ink/65">{formatGrams(m.total_grams)}</span>
              </div>
            );
          })}
          {calc.meats.length === 0 && (
            <p className="text-ink/55">Nenhum corte selecionado.</p>
          )}
        </CardContent>
      </Card>

      <BudgetTracker
        label="Acompanhamentos"
        targetGrams={calc.meta.target_sides_grams}
        selectedGrams={calc.meta.selected_sides_grams}
      />
      {calc.sides.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-1 text-sm">
            {calc.sides.map((s) => (
              <div key={s.id} className="flex justify-between">
                <span>
                  {s.pieces}× {s.name_pt}
                </span>
                <span className="text-ink/65">{formatGrams(s.total_grams)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bebidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {calc.drinks.map((d) => (
            <DrinkRow key={d.type} drink={d} />
          ))}
        </CardContent>
      </Card>

      <Button variant="cta" size="xl" className="w-full" onClick={onCreate} disabled={creating}>
        <Sparkles className="h-4 w-4" />
        {creating ? 'Criando…' : 'Criar churrasco'}
      </Button>
    </div>
  );
}

