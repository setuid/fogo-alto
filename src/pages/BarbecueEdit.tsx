import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { AppHeader } from '@/components/shared/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FieldError } from '@/components/shared/FieldError';
import { toast } from '@/components/ui/sonner';

import { useBarbecue, useUpdateBarbecue } from '@/hooks/useBarbecue';
import { suggestCutsForStyle } from '@/lib/calculator';
import { MEAT_CUTS } from '@/data/catalog';
import type { BarbecueStyle, WeightProfile } from '@/types/domain';

const STYLES: BarbecueStyle[] = ['tradicional', 'parrilla', 'espeto_corrido', 'americano', 'misto'];
const PROFILES: WeightProfile[] = ['light', 'normal', 'heavy'];

const schema = z.object({
  title: z.string().min(2, { message: 'O título precisa de pelo menos 2 caracteres.' }),
  description: z.string().optional(),
  event_date: z.string().min(1, { message: 'Escolha a data e a hora do churrasco.' }),
  location: z.string().optional(),
  style: z.enum(['tradicional', 'parrilla', 'espeto_corrido', 'americano', 'misto']),
  estimated_guests: z.coerce
    .number({ invalid_type_error: 'Informe quantos convidados.' })
    .int()
    .min(1, { message: 'Pelo menos 1 convidado.' })
    .max(500),
  weight_profile: z.enum(['light', 'normal', 'heavy']),
  drinkers_count: z.coerce
    .number({ invalid_type_error: 'Informe quantos vão beber álcool.' })
    .int()
    .min(0, { message: 'Não pode ser negativo.' }),
  duration_hours: z.coerce
    .number({ invalid_type_error: 'Informe a duração estimada.' })
    .min(1, { message: 'No mínimo 1 hora.' })
    .max(24, { message: 'No máximo 24 horas.' }),
  include_sides: z.boolean(),
  cut_ids: z.array(z.string()).min(1, { message: 'Escolha pelo menos um corte.' }),
  drink_beer: z.boolean(),
  drink_wine: z.boolean(),
  drink_caipirinha: z.boolean(),
  drink_soft: z.boolean(),
  notes: z.string().optional(),
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
    form.reset({
      title: bbq.title,
      description: bbq.description ?? '',
      event_date: toLocalDateTime(bbq.event_date),
      location: bbq.location ?? '',
      style: bbq.style,
      estimated_guests: bbq.estimated_guests,
      weight_profile: bbq.calc_params.weight_profile,
      drinkers_count: bbq.calc_params.drinkers_count,
      duration_hours: bbq.calc_params.duration_hours,
      include_sides: bbq.include_sides,
      cut_ids: bbq.calc_params.cut_ids,
      drink_beer: bbq.calc_params.drink_preferences.beer,
      drink_wine: bbq.calc_params.drink_preferences.wine,
      drink_caipirinha: bbq.calc_params.drink_preferences.caipirinha,
      drink_soft: bbq.calc_params.drink_preferences.soft_drinks,
      notes: bbq.notes ?? '',
    });
  }, [bbq, form]);

  const v = form.watch();

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
          estimated_guests: values.estimated_guests,
          include_sides: values.include_sides,
          notes: values.notes ?? null,
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

  const toggleCut = (cutId: string) => {
    const current = form.getValues('cut_ids');
    form.setValue(
      'cut_ids',
      current.includes(cutId) ? current.filter((c) => c !== cutId) : [...current, cutId],
    );
  };

  const onStyleChange = (s: BarbecueStyle) => {
    form.setValue('style', s);
    form.setValue('cut_ids', suggestCutsForStyle(s));
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
                  <FieldError message={form.formState.errors.estimated_guests?.message} />
                </div>
                <div>
                  <Label htmlFor="drinkers">Bebedores</Label>
                  <Input
                    id="drinkers"
                    type="number"
                    min={0}
                    {...form.register('drinkers_count')}
                  />
                  <FieldError message={form.formState.errors.drinkers_count?.message} />
                </div>
              </div>
              <div>
                <Label htmlFor="duration">Duração (h)</Label>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cortes & bebidas</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {MEAT_CUTS.map((cut) => {
                    const checked = v.cut_ids?.includes(cut.id) ?? false;
                    return (
                      <Label
                        key={cut.id}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink/10 bg-cream-paper p-3 has-[:checked]:border-tomato has-[:checked]:bg-tomato/5"
                      >
                        <Checkbox checked={checked} onCheckedChange={() => toggleCut(cut.id)} />
                        <span className="flex-1">{cut.name_pt}</span>
                      </Label>
                    );
                  })}
                </div>
                <FieldError message={form.formState.errors.cut_ids?.message} className="mt-2" />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
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

              <div className="flex items-center justify-between rounded-xl border border-ink/10 bg-cream-paper p-3">
                <span>{t('barbecue:fields.include_sides')}</span>
                <Switch
                  checked={v.include_sides}
                  onCheckedChange={(c) => form.setValue('include_sides', !!c)}
                />
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
      </div>
    </>
  );
}

function toLocalDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
