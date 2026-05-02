import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CostCard } from '@/components/shared/CostCard';
import { toast } from '@/components/ui/sonner';

import { MEAT_CUTS } from '@/data/catalog';
import { useBarbecues, useCreateBarbecue, useDuplicateBarbecue } from '@/hooks/useBarbecue';
import { suggestCutsForStyle } from '@/lib/calculator';
import { calcInputFromBarbecue } from '@/lib/calc-mapping';
import { calculate } from '@/lib/calculator';
import { estimateCost } from '@/lib/cost-estimator';
import type { BarbecueStyle, WeightProfile } from '@/types/domain';
import type { CalcParams } from '@/types/database';

const STYLES: BarbecueStyle[] = ['tradicional', 'parrilla', 'espeto_corrido', 'americano', 'misto'];
const PROFILES: WeightProfile[] = ['light', 'normal', 'heavy'];

const schema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  event_date: z.string().min(1),
  location: z.string().optional(),
  style: z.enum(['tradicional', 'parrilla', 'espeto_corrido', 'americano', 'misto']),
  estimated_guests: z.coerce.number().int().min(1).max(500),
  weight_profile: z.enum(['light', 'normal', 'heavy']),
  drinkers_count: z.coerce.number().int().min(0),
  duration_hours: z.coerce.number().min(1).max(24),
  include_sides: z.boolean(),
  cut_ids: z.array(z.string()).min(1),
  drink_beer: z.boolean(),
  drink_wine: z.boolean(),
  drink_caipirinha: z.boolean(),
  drink_soft: z.boolean(),
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

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      event_date: '',
      location: '',
      style: defaultStyle,
      estimated_guests: 10,
      weight_profile: 'normal',
      drinkers_count: 7,
      duration_hours: 5,
      include_sides: true,
      cut_ids: suggestCutsForStyle(defaultStyle),
      drink_beer: true,
      drink_wine: false,
      drink_caipirinha: false,
      drink_soft: true,
    },
  });

  const v = form.watch();

  const handleStyleChange = (next: BarbecueStyle) => {
    form.setValue('style', next);
    form.setValue('cut_ids', suggestCutsForStyle(next));
  };

  const toggleCut = (cutId: string) => {
    const current = form.getValues('cut_ids');
    if (current.includes(cutId)) {
      form.setValue(
        'cut_ids',
        current.filter((c) => c !== cutId),
      );
    } else {
      form.setValue('cut_ids', [...current, cutId]);
    }
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

  const onSubmit = form.handleSubmit(async (values) => {
    const calc_params: CalcParams = {
      cut_ids: values.cut_ids,
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
        estimated_guests: values.estimated_guests,
        include_sides: values.include_sides,
        calc_params,
      });
      toast.success('Churrasco criado.');
      navigate(`/barbecue/${created.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('common:error_generic'));
    }
  });

  const next = async () => {
    const fieldsByStep: Array<(keyof FormValues)[]> = [
      [], // step 0 — origem (sem validação)
      ['title', 'event_date'],
      ['style', 'estimated_guests', 'duration_hours', 'drinkers_count', 'weight_profile'],
      ['cut_ids'],
      [],
    ];
    const fields = fieldsByStep[step];
    if (fields.length > 0) {
      const ok = await form.trigger(fields);
      if (!ok) return;
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
              <div className="space-y-4">
                <div>
                  <h3 className="font-display text-xl font-semibold">Como começar?</h3>
                  <p className="text-sm text-ink/60">
                    Comece do zero ou duplique um churrasco anterior para reaproveitar as
                    preferências.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Card
                    className="cursor-pointer p-4 transition-all hover:-translate-y-0.5 hover:shadow-cta"
                    onClick={() => setStep(1)}
                  >
                    <p className="text-stamp text-tomato-deep">Do zero</p>
                    <p className="mt-2 font-display text-lg">Criar um novo</p>
                  </Card>
                  {(existingBbqs?.length ?? 0) > 0 && (
                    <Card className="p-4">
                      <p className="text-stamp text-tomato-deep">Duplicar</p>
                      <p className="mt-1 font-display text-lg">Anteriores</p>
                      <ul className="mt-3 space-y-1">
                        {existingBbqs!.slice(0, 5).map((b) => (
                          <li key={b.id}>
                            <button
                              type="button"
                              className="text-left text-sm text-ink/70 hover:text-tomato"
                              onClick={() => void handleDuplicate(b.id)}
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
            )}

            {step === 1 && (
              <form className="space-y-4">
                <div>
                  <Label htmlFor="title">{t('barbecue:fields.title')}</Label>
                  <Input
                    id="title"
                    placeholder="Aniversário do João"
                    {...form.register('title')}
                  />
                  {form.formState.errors.title && (
                    <p className="mt-1 text-xs text-destructive">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="date">{t('barbecue:fields.event_date')}</Label>
                  <Input id="date" type="datetime-local" {...form.register('event_date')} />
                </div>
                <div>
                  <Label htmlFor="location">{t('barbecue:fields.location')}</Label>
                  <Input
                    id="location"
                    placeholder="Casa do João, rua…"
                    {...form.register('location')}
                  />
                </div>
                <div>
                  <Label htmlFor="description">{t('barbecue:fields.description')}</Label>
                  <Textarea id="description" {...form.register('description')} />
                </div>
              </form>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <Label>{t('barbecue:fields.style')}</Label>
                  <Select value={v.style} onValueChange={(s) => handleStyleChange(s as BarbecueStyle)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STYLES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {t(`barbecue:styles.${s}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="guests">{t('barbecue:fields.estimated_guests')}</Label>
                    <Input
                      id="guests"
                      type="number"
                      min={1}
                      {...form.register('estimated_guests')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="drinkers">Bebedores de álcool</Label>
                    <Input
                      id="drinkers"
                      type="number"
                      min={0}
                      {...form.register('drinkers_count')}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="duration">Duração estimada (horas)</Label>
                  <Input
                    id="duration"
                    type="number"
                    step={0.5}
                    min={1}
                    max={24}
                    {...form.register('duration_hours')}
                  />
                </div>
                <div>
                  <Label>{t('barbecue:weight_profile.label')}</Label>
                  <RadioGroup
                    className="mt-2 grid grid-cols-3 gap-2"
                    value={v.weight_profile}
                    onValueChange={(p) => form.setValue('weight_profile', p as WeightProfile)}
                  >
                    {PROFILES.map((p) => (
                      <Label
                        key={p}
                        className="flex cursor-pointer items-center gap-2 rounded-xl border border-ink/10 bg-cream-paper p-3 has-[:checked]:border-tomato has-[:checked]:bg-tomato/5"
                      >
                        <RadioGroupItem value={p} />
                        <span>{t(`barbecue:weight_profile.${p}`)}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-lg">Cortes</h3>
                  <p className="text-sm text-ink/60">
                    Sugestões a partir do estilo escolhido. Ajuste à vontade.
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {MEAT_CUTS.map((cut) => {
                      const checked = v.cut_ids.includes(cut.id);
                      return (
                        <Label
                          key={cut.id}
                          className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink/10 bg-cream-paper p-3 has-[:checked]:border-tomato has-[:checked]:bg-tomato/5"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleCut(cut.id)}
                          />
                          <span className="flex-1">{cut.name_pt}</span>
                          <span className="text-stamp text-ink/50">
                            {cut.default_grams_per_person}g
                          </span>
                        </Label>
                      );
                    })}
                  </div>
                  {form.formState.errors.cut_ids && (
                    <p className="mt-2 text-xs text-destructive">Escolha pelo menos um corte.</p>
                  )}
                </div>

                <div>
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
                        <Checkbox
                          checked={v[b.key]}
                          onCheckedChange={(c) => form.setValue(b.key, !!c)}
                        />
                        <span>{b.label}</span>
                      </Label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-ink/10 bg-cream-paper p-3">
                  <div>
                    <p className="font-medium">{t('barbecue:fields.include_sides')}</p>
                    <p className="text-xs text-ink/60">Arroz, feijão, farofa, vinagrete…</p>
                  </div>
                  <Switch
                    checked={v.include_sides}
                    onCheckedChange={(c) => form.setValue('include_sides', !!c)}
                  />
                </div>
              </div>
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
          <Button
            variant="ghost"
            onClick={back}
            disabled={step === 0}
            type="button"
          >
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
              {createMutation.isPending
                ? t('common:loading')
                : t('common:actions.finish')}
            </Button>
          )}
        </div>
      </div>
    </>
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
  const fakeRow = {
    id: 'preview',
    host_id: '',
    share_token: '',
    title: values.title,
    description: values.description ?? null,
    event_date: values.event_date || new Date().toISOString(),
    location: values.location ?? null,
    style: values.style,
    estimated_guests: values.estimated_guests,
    status: 'planning' as const,
    include_sides: values.include_sides,
    notes: null,
    calc_params: {
      cut_ids: values.cut_ids,
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
  const cost = estimateCost(calc);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-xl font-semibold">{values.title || 'Sem título'}</h3>
        <p className="text-sm text-ink/60">
          {values.estimated_guests} pessoas · {values.duration_hours}h · {values.style}
        </p>
      </div>

      <CostCard estimate={cost} />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Carnes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          {calc.meats.map((m) => {
            const cut = MEAT_CUTS.find((c) => c.id === m.cut_id);
            return (
              <div key={m.cut_id} className="flex justify-between">
                <span>{cut?.name_pt ?? m.cut_id}</span>
                <span className="text-ink/65">
                  {(m.total_grams / 1000).toFixed(2)} kg ({m.per_person_grams} g/pessoa)
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bebidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          {calc.drinks.map((d) => (
            <div key={d.type} className="flex justify-between">
              <span>{d.type}</span>
              <span className="text-ink/65">
                {d.unit === 'ml' ? `${(d.total_ml_or_units / 1000).toFixed(1)} L` : d.total_ml_or_units}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {calc.sides.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Acompanhamentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {calc.sides.map((s) => (
              <div key={s.id} className="flex justify-between">
                <span>{s.name_pt}</span>
                <span className="text-ink/65">{(s.total_grams / 1000).toFixed(2)} kg</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Button variant="cta" size="xl" className="w-full" onClick={onCreate} disabled={creating}>
        <Sparkles className="h-4 w-4" />
        {creating ? 'Criando…' : 'Criar churrasco'}
      </Button>
    </div>
  );
}
