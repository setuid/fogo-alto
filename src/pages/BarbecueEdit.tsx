import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Beef } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { AppHeader } from '@/components/shared/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BudgetTracker } from '@/components/shared/BudgetTracker';
import { QuantityStepper } from '@/components/shared/QuantityStepper';
import { FieldError } from '@/components/shared/FieldError';
import { CutIcon } from '@/components/icons/CutIcon';
import { VegetableIcon } from '@/components/icons/VegetableIcon';
import { AnimalDiagram } from '@/components/cuts/AnimalDiagram';
import { toast } from '@/components/ui/sonner';

// Mesmo agrupamento usado no wizard.
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
const EXTRA_IDS = new Set(['queijo_coalho', 'pao_alho', 'abacaxi']);

import { useBarbecue, useUpdateBarbecue } from '@/hooks/useBarbecue';
import {
  suggestCutQuantitiesForStyle,
  suggestedMeatGrams,
  suggestedSidesGrams,
} from '@/lib/calculator';
import { MEAT_CUTS, SIDES } from '@/data/catalog';
import { formatGrams } from '@/lib/utils';
import type { BarbecueStyle, WeightProfile } from '@/types/domain';

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
      .min(0)
      .max(500),
    weight_profile: z.enum(['light', 'normal', 'heavy']),
    drinkers_count: z.coerce
      .number({ invalid_type_error: 'Informe quantos vão beber álcool.' })
      .int()
      .min(0),
    duration_hours: z.coerce
      .number({ invalid_type_error: 'Informe a duração estimada.' })
      .min(1)
      .max(24),
    cut_quantities: quantitiesSchema,
    side_quantities: quantitiesSchema,
    drink_beer: z.boolean(),
    drink_wine: z.boolean(),
    drink_caipirinha: z.boolean(),
    drink_soft: z.boolean(),
    notes: z.string().optional(),
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

export function BarbecueEdit() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation(['common', 'barbecue']);
  const navigate = useNavigate();
  const { data: bbq } = useBarbecue(id);
  const update = useUpdateBarbecue(id ?? '');

  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!bbq) return;
    const params = bbq.calc_params as {
      cut_quantities?: Record<string, number>;
      side_quantities?: Record<string, number>;
      cut_ids?: string[];
      side_ids?: string[];
    } & Partial<FormValues>;

    const adults = params?.adults_count ?? bbq.estimated_guests ?? 5;
    const children = params?.children_count ?? 0;

    // Migra formato antigo (cut_ids → cut_quantities) ao popular o form.
    const cutQuantities =
      params?.cut_quantities ??
      params?.cut_ids?.reduce<Record<string, number>>((acc, c) => {
        acc[c] = 1;
        return acc;
      }, {}) ??
      {};
    const sideQuantities =
      params?.side_quantities ??
      params?.side_ids?.reduce<Record<string, number>>((acc, s) => {
        acc[s] = 1;
        return acc;
      }, {}) ??
      (bbq.include_sides
        ? SIDES.reduce<Record<string, number>>((acc, s) => {
            acc[s.id] = 1;
            return acc;
          }, {})
        : {});

    form.reset({
      title: bbq.title,
      description: bbq.description ?? '',
      event_date: toLocalDateTime(bbq.event_date),
      location: bbq.location ?? '',
      style: bbq.style,
      adults_count: adults,
      children_count: children,
      weight_profile: params?.weight_profile ?? 'normal',
      drinkers_count: params?.drinkers_count ?? adults,
      duration_hours: params?.duration_hours ?? 4,
      cut_quantities: cutQuantities,
      side_quantities: sideQuantities,
      drink_beer: params?.drink_beer ?? true,
      drink_wine: params?.drink_wine ?? false,
      drink_caipirinha: params?.drink_caipirinha ?? false,
      drink_soft: params?.drink_soft ?? true,
      notes: bbq.notes ?? '',
    });
  }, [bbq, form]);

  const v = form.watch();
  const [animalOpen, setAnimalOpen] = useState(false);

  const incrementCut = (cutId: string) => {
    const current = form.getValues('cut_quantities');
    const next = { ...current, [cutId]: (current[cutId] ?? 0) + 1 };
    form.setValue('cut_quantities', next, { shouldValidate: true });
  };

  const meatTarget = useMemo(
    () =>
      v.adults_count
        ? suggestedMeatGrams(v.adults_count, v.children_count ?? 0, v.weight_profile, v.style)
        : 0,
    [v.adults_count, v.children_count, v.weight_profile, v.style],
  );
  const sidesTarget = useMemo(
    () => (v.adults_count ? suggestedSidesGrams(v.adults_count, v.children_count ?? 0) : 0),
    [v.adults_count, v.children_count],
  );

  const meatSelected = MEAT_CUTS.reduce((acc, c) => {
    const n = v.cut_quantities?.[c.id] ?? 0;
    return acc + n * c.typical_piece_kg * 1000;
  }, 0);
  const sidesSelected = SIDES.reduce((acc, s) => {
    const n = v.side_quantities?.[s.id] ?? 0;
    return acc + n * s.typical_portion_kg * 1000;
  }, 0);

  if (!bbq) {
    return (
      <>
        <AppHeader />
        <div className="container mx-auto max-w-3xl px-4 py-8">{t('common:loading')}</div>
      </>
    );
  }

  const onSubmit = form.handleSubmit(
    async (values) => {
      try {
        await update.mutateAsync({
          title: values.title,
          description: values.description ?? null,
          event_date: new Date(values.event_date).toISOString(),
          location: values.location ?? null,
          style: values.style,
          estimated_guests: values.adults_count + values.children_count,
          include_sides: Object.values(values.side_quantities).some((q) => q > 0),
          notes: values.notes ?? null,
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
        });
        toast.success('Salvo.');
        navigate(`/barbecue/${bbq.id}`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : t('common:error_generic'));
      }
    },
    (errors) => {
      const first = Object.values(errors)[0]?.message;
      toast.error(
        typeof first === 'string'
          ? first
          : 'Confira os campos destacados — ainda falta preencher alguma coisa.',
      );
    },
  );

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

  const onStyleChange = (s: BarbecueStyle) => {
    form.setValue('style', s);
    const target = suggestedMeatGrams(
      v.adults_count,
      v.children_count ?? 0,
      v.weight_profile,
      s,
    );
    form.setValue('cut_quantities', suggestCutQuantitiesForStyle(s, target));
  };

  const onAdultsChange = (next: number) => {
    const oldAdults = form.getValues('adults_count');
    const oldDrinkers = form.getValues('drinkers_count');
    form.setValue('adults_count', next);
    if (oldDrinkers === oldAdults || oldDrinkers > next) {
      form.setValue('drinkers_count', next);
    }
  };

  return (
    <>
      <AppHeader />
      <div className="container mx-auto max-w-3xl px-4 pb-16">
        <h1 className="mb-8 font-display text-3xl font-semibold">Editar churrasco</h1>
        <form className="space-y-6" onSubmit={onSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Básico</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <Label htmlFor="title">{t('barbecue:fields.title')}</Label>
                <Input id="title" {...form.register('title')} />
                <FieldError message={form.formState.errors.title?.message} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="date">{t('barbecue:fields.event_date')}</Label>
                  <Input id="date" type="datetime-local" {...form.register('event_date')} />
                  <FieldError message={form.formState.errors.event_date?.message} />
                </div>
                <div>
                  <Label htmlFor="location">{t('barbecue:fields.location')}</Label>
                  <Input id="location" {...form.register('location')} />
                </div>
              </div>
              <div>
                <Label htmlFor="description">{t('barbecue:fields.description')}</Label>
                <Textarea id="description" {...form.register('description')} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estilo e tamanho</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <Label>{t('barbecue:fields.style')}</Label>
                <Select value={v.style} onValueChange={(s) => onStyleChange(s as BarbecueStyle)}>
                  <SelectTrigger className="mt-1 h-auto py-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STYLES.map((s) => (
                      <SelectItem key={s} value={s}>
                        <div className="flex flex-col">
                          <span className="font-medium">{t(`barbecue:styles.${s}`)}</span>
                          <span className="text-xs text-ink/60">
                            {t(`barbecue:style_descriptions.${s}`)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-ink/60">
                  {t(`barbecue:style_descriptions.${v.style}`)}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="adults">{t('barbecue:fields.adults_count')}</Label>
                  <Input
                    id="adults"
                    type="number"
                    min={1}
                    value={v.adults_count ?? ''}
                    onChange={(e) => onAdultsChange(Math.max(1, Number(e.target.value) || 1))}
                  />
                  <FieldError message={form.formState.errors.adults_count?.message} />
                </div>
                <div>
                  <Label htmlFor="children">{t('barbecue:fields.children_count')}</Label>
                  <Input
                    id="children"
                    type="number"
                    min={0}
                    {...form.register('children_count')}
                  />
                  <p className="mt-1 text-xs text-ink/55">
                    {t('barbecue:fields_hints.children_count')}
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="drinkers">{t('barbecue:fields.drinkers_count')}</Label>
                <Input
                  id="drinkers"
                  type="number"
                  min={0}
                  max={v.adults_count}
                  {...form.register('drinkers_count')}
                />
                <p className="mt-1 text-xs text-ink/55">
                  {t('barbecue:fields_hints.drinkers_count')}
                </p>
                <FieldError message={form.formState.errors.drinkers_count?.message} />
              </div>

              <div>
                <Label htmlFor="duration">{t('barbecue:fields.duration_hours')}</Label>
                <Input
                  id="duration"
                  type="number"
                  step={0.5}
                  min={1}
                  {...form.register('duration_hours')}
                />
                <FieldError message={form.formState.errors.duration_hours?.message} />
              </div>

              <div>
                <Label>{t('barbecue:weight_profile.label')}</Label>
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
                        <span className="font-medium">{t(`barbecue:weight_profile.${p}`)}</span>
                        <span className="text-xs text-ink/55">
                          {t(`barbecue:weight_profile_descriptions.${p}`)}
                        </span>
                      </div>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cortes & acompanhamentos</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <BudgetTracker
                  label="Carnes & extras"
                  targetGrams={meatTarget}
                  selectedGrams={meatSelected}
                  className="mb-3"
                />
                <div className="mb-3 flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAnimalOpen(true)}
                  >
                    <Beef className="h-4 w-4" /> Ver no animal
                  </Button>
                </div>
                <div className="space-y-2">
                  {MEAT_CUTS.map((cut) => {
                    const n = v.cut_quantities?.[cut.id] ?? 0;
                    const subtotal = n * cut.typical_piece_kg * 1000;
                    const isVeg = VEGETABLE_IDS.has(cut.id);
                    const isExtra = EXTRA_IDS.has(cut.id);
                    return (
                      <div
                        key={cut.id}
                        className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                          n > 0
                            ? 'border-tomato bg-tomato/5'
                            : 'border-ink/10 bg-cream-paper hover:border-ink/20'
                        }`}
                      >
                        <span className="shrink-0">
                          {isVeg ? (
                            <VegetableIcon vegetableId={cut.id} className="h-7 w-7 text-olive-deep" />
                          ) : (
                            <CutIcon
                              cutId={cut.id}
                              className={`h-7 w-7 ${isExtra ? 'text-ember' : 'text-tomato'}`}
                            />
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">{cut.name_pt}</p>
                          <p className="truncate text-xs text-ink/55">
                            1 {cut.piece_label_pt} ≈ {cut.typical_piece_kg.toFixed(1)} kg
                          </p>
                        </div>
                        <span className="text-xs text-ink/55 tabular-nums w-16 text-right">
                          {n > 0 ? formatGrams(subtotal) : '—'}
                        </span>
                        <QuantityStepper value={n} onChange={(next) => setCutQty(cut.id, next)} />
                      </div>
                    );
                  })}
                </div>
                <FieldError
                  message={form.formState.errors.cut_quantities?.message?.toString()}
                  className="mt-2"
                />
              </div>

              <div>
                <BudgetTracker
                  label={t('barbecue:fields.sides')}
                  targetGrams={sidesTarget}
                  selectedGrams={sidesSelected}
                  className="mb-3"
                />
                <div className="space-y-2">
                  {SIDES.map((side) => {
                    const n = v.side_quantities?.[side.id] ?? 0;
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
              </div>

              <div>
                <h4 className="text-stamp text-tomato-deep">Bebidas</h4>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
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
                      <Checkbox
                        checked={v[b.key]}
                        onCheckedChange={(c) => form.setValue(b.key, !!c)}
                      />
                      <span>{b.label}</span>
                    </Label>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="notes">{t('barbecue:fields.notes')}</Label>
                <Textarea id="notes" {...form.register('notes')} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => navigate(`/barbecue/${bbq.id}`)}>
              {t('common:actions.cancel')}
            </Button>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? t('common:loading') : t('common:actions.save')}
            </Button>
          </div>
        </form>

        <AnimalDiagram
          open={animalOpen}
          onOpenChange={setAnimalOpen}
          cutQuantities={v.cut_quantities ?? {}}
          onAddCut={incrementCut}
        />
      </div>
    </>
  );
}

function toLocalDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
