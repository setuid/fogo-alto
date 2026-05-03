import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, ChefHat, Edit, Flame, MapPin, Trash2, Users } from 'lucide-react';

import { AppHeader } from '@/components/shared/AppHeader';
import { BudgetTracker } from '@/components/shared/BudgetTracker';
import { DrinkRow } from '@/components/shared/DrinkRow';
import { ShareLinkCard } from '@/components/shared/ShareLinkCard';
import { CutIcon } from '@/components/icons/CutIcon';
import { VegetableIcon } from '@/components/icons/VegetableIcon';
import { Checkbox } from '@/components/ui/checkbox';
import { useShoppingChecks } from '@/stores/shoppingChecksStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RecipeModal } from '@/components/recipes/RecipeModal';
import { toast } from '@/components/ui/sonner';

import { useBarbecue, useDeleteBarbecue, useDuplicateBarbecue } from '@/hooks/useBarbecue';
import { useAddGuestManually, useContributions, useGuests } from '@/hooks/useGuests';
import { calcForBarbecue } from '@/lib/calc-mapping';
import { findCutById } from '@/data/catalog';
import { findRecipeById } from '@/data/recipes';
import { formatEventDate } from '@/lib/format';
import { buildShoppingListText } from '@/lib/shopping-list';
import { formatGrams } from '@/lib/utils';
import type { ContributionRow, GuestRow } from '@/types/database';

export function BarbecueDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation(['common', 'barbecue', 'guest']);
  const locale = (i18n.resolvedLanguage ?? 'pt-BR') as 'pt-BR' | 'en';
  const navigate = useNavigate();
  const { data: bbq, isLoading } = useBarbecue(id);
  const { data: guests } = useGuests(id);
  const { data: contributions } = useContributions(id);
  const deleteMutation = useDeleteBarbecue();
  const duplicateMutation = useDuplicateBarbecue();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const calculation = useMemo(() => (bbq ? calcForBarbecue(bbq) : null), [bbq]);

  if (isLoading || !bbq || !calculation) {
    return (
      <>
        <AppHeader />
        <div className="container mx-auto max-w-4xl px-4 py-8">{t('common:loading')}</div>
      </>
    );
  }

  const onDelete = async () => {
    try {
      await deleteMutation.mutateAsync(bbq.id);
      setConfirmDelete(false);
      toast.success('Churrasco excluído.');
      navigate('/');
    } catch (e) {
      // Mantém o dialog aberto se houver erro? Não — fecha pra deixar o
      // toast visível e permitir nova tentativa pelo botão da lista.
      setConfirmDelete(false);
      toast.error(e instanceof Error ? e.message : t('common:error_generic'));
    }
  };

  const onDuplicate = async () => {
    try {
      const created = await duplicateMutation.mutateAsync(bbq.id);
      toast.success('Duplicado.');
      navigate(`/barbecue/${created.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('common:error_generic'));
    }
  };

  const onShoppingListCopy = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#/g/${bbq.share_token}`;
    const text = buildShoppingListText({
      title: bbq.title,
      calculation,
      contributions: contributions ?? [],
      locale,
      shareUrl,
    });
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Lista de compras copiada para o WhatsApp.');
    } catch {
      toast.error(t('common:error_generic'));
    }
  };

  return (
    <>
      <AppHeader />
      <div className="container mx-auto max-w-4xl px-4 pb-16">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge className="mb-2 text-stamp">{t(`barbecue:styles.${bbq.style}`)}</Badge>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {bbq.title}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink/60">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {formatEventDate(bbq.event_date, locale)}
              </span>
              {bbq.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {bbq.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> {bbq.estimated_guests}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to={`/barbecue/${bbq.id}/edit`}>
                <Edit className="h-4 w-4" /> {t('common:actions.edit')}
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => void onDuplicate()}>
              {t('common:actions.duplicate')}
            </Button>
            <Button variant="outline" size="sm" onClick={onShoppingListCopy}>
              Lista de compras
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmDelete(true)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <Tabs defaultValue="overview">
          <TabsList className="w-full overflow-x-auto sm:w-auto">
            <TabsTrigger value="overview">{t('barbecue:tabs.overview')}</TabsTrigger>
            <TabsTrigger value="guests">{t('barbecue:tabs.guests')}</TabsTrigger>
            <TabsTrigger value="list">{t('barbecue:tabs.list')}</TabsTrigger>
            <TabsTrigger value="kitchen">{t('barbecue:tabs.kitchen')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4">
              <ShareLinkCard shareToken={bbq.share_token} />
              {bbq.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t('barbecue:fields.description')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line text-sm text-ink/70">{bbq.description}</p>
                  </CardContent>
                </Card>
              )}
              <Button asChild variant="cta" size="xl" className="w-full">
                <Link to={`/barbecue/${bbq.id}/cook`}>
                  <Flame className="h-5 w-5" strokeWidth={2.5} />
                  {t('barbecue:cta_kitchen')}
                </Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="guests">
            <GuestsTab
              barbecueId={bbq.id}
              guests={guests ?? []}
              contributions={contributions ?? []}
            />
          </TabsContent>

          <TabsContent value="list">
            <ListTab
              barbecueId={bbq.id}
              calculation={calculation}
              contributions={contributions ?? []}
              guests={guests ?? []}
              locale={locale}
            />
          </TabsContent>

          <TabsContent value="kitchen">
            <Card>
              <CardContent className="space-y-4 p-6">
                <ChefHat className="h-10 w-10 text-tomato" />
                <p className="text-sm text-ink/65">
                  Modo cozinha tem layout próprio para celular sujo de gordura — botões grandes,
                  alto contraste e timers paralelos.
                </p>
                <Button asChild variant="cta" size="lg">
                  <Link to={`/barbecue/${bbq.id}/cook`}>
                    <Flame className="h-4 w-4" strokeWidth={2.5} />
                    {t('barbecue:cta_kitchen')}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog
        open={confirmDelete}
        onOpenChange={(o) => {
          // Trava o fechamento por click-fora enquanto o delete está em curso.
          if (deleteMutation.isPending) return;
          setConfirmDelete(o);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir churrasco?</DialogTitle>
            <DialogDescription>
              Essa ação remove o churrasco e todas as RSVPs e contribuições associadas.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(false)}
              disabled={deleteMutation.isPending}
            >
              {t('common:actions.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => void onDelete()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Excluindo…' : t('common:actions.delete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function GuestsTab({
  barbecueId,
  guests,
  contributions,
}: {
  barbecueId: string;
  guests: GuestRow[];
  contributions: ContributionRow[];
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const addGuest = useAddGuestManually(barbecueId);

  const guestById = (id: string) => guests.find((g) => g.id === id);

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await addGuest.mutateAsync({ name, email: email || undefined });
      setName('');
      setEmail('');
      toast.success('Convidado adicionado.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro');
    }
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Adicionar convidado manualmente</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-2 sm:flex-row" onSubmit={onAdd}>
            <Input
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              placeholder="E-mail (opcional)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" disabled={addGuest.isPending}>
              Adicionar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Convidados ({guests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {guests.length === 0 ? (
            <p className="text-sm text-ink/60">Nenhum convidado ainda.</p>
          ) : (
            <ul className="divide-y divide-ink/10">
              {guests.map((g) => (
                <li key={g.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium">{g.name}</p>
                    {g.email && <p className="text-xs text-ink/60">{g.email}</p>}
                  </div>
                  <RsvpBadge status={g.rsvp_status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contribuições</CardTitle>
        </CardHeader>
        <CardContent>
          {contributions.length === 0 ? (
            <p className="text-sm text-ink/60">Ninguém ofereceu trazer nada ainda.</p>
          ) : (
            <ul className="space-y-2">
              {contributions.map((c) => {
                const guest = guestById(c.guest_id);
                return (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded-xl bg-olive/10 p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-olive-deep">{c.item_name}</p>
                      {c.quantity_description && (
                        <p className="text-xs text-olive-deep/80">{c.quantity_description}</p>
                      )}
                    </div>
                    <span className="text-xs text-olive-deep/80">{guest?.name ?? '—'}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RsvpBadge({ status }: { status: GuestRow['rsvp_status'] }) {
  const map: Record<GuestRow['rsvp_status'], { label: string; classes: string }> = {
    yes: { label: 'Confirmado', classes: 'bg-olive/20 text-olive-deep' },
    no: { label: 'Recusou', classes: 'bg-ink/10 text-ink/60' },
    maybe: { label: 'Talvez', classes: 'bg-ember/20 text-tomato-deep' },
    pending: { label: 'Pendente', classes: 'bg-ink/8 text-ink/55' },
  };
  const m = map[status];
  return <span className={`text-stamp rounded-full px-2 py-1 ${m.classes}`}>{m.label}</span>;
}

function ListTab({
  barbecueId,
  calculation,
  contributions,
  guests,
  locale,
}: {
  barbecueId: string;
  calculation: ReturnType<typeof calcForBarbecue>;
  contributions: ContributionRow[];
  guests: GuestRow[];
  locale: 'pt-BR' | 'en';
}) {
  const isPt = locale === 'pt-BR';
  const [openRecipeId, setOpenRecipeId] = useState<string | null>(null);
  const recipe = openRecipeId ? findRecipeById(openRecipeId) : null;
  const checked = useShoppingChecks((s) => s.checked[barbecueId] ?? []);
  const toggle = useShoppingChecks((s) => s.toggle);
  const isChecked = (key: string) => checked.includes(key);

  const guestNameById = (id: string) => guests.find((g) => g.id === id)?.name ?? '—';

  // Mesmos buckets do wizard step 3 — ordem visual consistente.
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

  const aperitivos = calculation.meats.filter((m) => APERITIVO_IDS.has(m.cut_id));
  const carnes = calculation.meats.filter(
    (m) => !APERITIVO_IDS.has(m.cut_id) && !VEGETABLE_IDS.has(m.cut_id),
  );
  const legumes = calculation.meats.filter((m) => VEGETABLE_IDS.has(m.cut_id));

  const renderMeatItem = (m: (typeof calculation.meats)[number]) => {
    const cut = findCutById(m.cut_id);
    const pieceLabel = cut ? (isPt ? cut.piece_label_pt : cut.piece_label_en) : 'peça';
    const labelPlural = m.pieces > 1 ? `${pieceLabel}s` : pieceLabel;
    const isVeg = VEGETABLE_IDS.has(m.cut_id);
    const isAperitivo = APERITIVO_IDS.has(m.cut_id);
    const key = `meat:${m.cut_id}`;
    const done = isChecked(key);
    return (
      <li
        key={m.cut_id}
        className={`flex items-center gap-3 py-3 text-sm transition-opacity ${
          done ? 'opacity-50' : ''
        }`}
      >
        <Checkbox
          checked={done}
          onCheckedChange={() => toggle(barbecueId, key)}
          className="shrink-0"
        />
        <span className="shrink-0">
          {isVeg ? (
            <VegetableIcon vegetableId={m.cut_id} className="h-6 w-6 text-olive-deep" />
          ) : (
            <CutIcon
              cutId={m.cut_id}
              className={`h-6 w-6 ${isAperitivo ? 'text-ember' : 'text-tomato'}`}
            />
          )}
        </span>
        <span className={`flex-1 min-w-0 ${done ? 'line-through' : ''}`}>
          <span className="font-medium">
            {m.pieces}× {cut ? (isPt ? cut.name_pt : cut.name_en) : m.cut_id}
          </span>
          <span className="ml-2 text-xs text-ink/55">{labelPlural}</span>
        </span>
        <span className={`shrink-0 text-ink/65 tabular-nums ${done ? 'line-through' : ''}`}>
          {formatGrams(m.total_grams, locale)}
        </span>
      </li>
    );
  };

  return (
    <div className="grid gap-4">
      <BudgetTracker
        label={isPt ? 'Carnes' : 'Meats'}
        targetGrams={calculation.meta.target_meat_grams}
        selectedGrams={calculation.meta.selected_meat_grams}
      />

      {aperitivos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{isPt ? 'Aperitivos' : 'Appetizers'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-ink/10">{aperitivos.map(renderMeatItem)}</ul>
          </CardContent>
        </Card>
      )}

      {carnes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{isPt ? 'Carnes' : 'Meats'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-ink/10">{carnes.map(renderMeatItem)}</ul>
          </CardContent>
        </Card>
      )}

      {legumes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {isPt ? 'Legumes pra grelhar' : 'Vegetables to grill'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-ink/10">{legumes.map(renderMeatItem)}</ul>
          </CardContent>
        </Card>
      )}

      {calculation.meats.length === 0 && (
        <Card>
          <CardContent className="p-6 text-sm text-ink/55">
            {isPt ? 'Nenhum item selecionado.' : 'Nothing selected.'}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bebidas</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-ink/10">
            {calculation.drinks.map((d) => {
              const key = `drink:${d.type}`;
              const done = isChecked(key);
              return (
                <li
                  key={d.type}
                  className={`flex items-center gap-3 py-3 text-sm transition-opacity ${
                    done ? 'opacity-50' : ''
                  }`}
                >
                  <Checkbox
                    checked={done}
                    onCheckedChange={() => toggle(barbecueId, key)}
                    className="shrink-0"
                  />
                  <div className={`flex-1 ${done ? 'line-through' : ''}`}>
                    <DrinkRow drink={d} />
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      {calculation.sides.length > 0 && (
        <>
          <BudgetTracker
            label={isPt ? 'Acompanhamentos' : 'Sides'}
            targetGrams={calculation.meta.target_sides_grams}
            selectedGrams={calculation.meta.selected_sides_grams}
          />
          <Card>
          <CardHeader>
            <CardTitle className="text-lg">{isPt ? 'Acompanhamentos' : 'Sides'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-ink/10">
              {calculation.sides.map((s) => {
                const recipeAvailable = !!findRecipeById(s.id);
                const key = `side:${s.id}`;
                const done = isChecked(key);
                return (
                  <li
                    key={s.id}
                    className={`flex items-center gap-3 py-3 text-sm transition-opacity ${
                      done ? 'opacity-50' : ''
                    }`}
                  >
                    <Checkbox
                      checked={done}
                      onCheckedChange={() => toggle(barbecueId, key)}
                      className="shrink-0"
                    />
                    <span className={`flex-1 font-medium ${done ? 'line-through' : ''}`}>
                      {s.pieces}× {isPt ? s.name_pt : s.name_en}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className={`text-ink/65 ${done ? 'line-through' : ''}`}>
                        {formatGrams(s.total_grams, locale)}
                      </span>
                      {recipeAvailable && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0"
                          onClick={() => setOpenRecipeId(s.id)}
                        >
                          Ver receita
                        </Button>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
        </>
      )}

      {calculation.desserts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{isPt ? 'Sobremesas' : 'Desserts'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-ink/10">
              {calculation.desserts.map((d) => {
                const recipeAvailable = !!findRecipeById(d.id);
                const key = `dessert:${d.id}`;
                const done = isChecked(key);
                return (
                  <li
                    key={d.id}
                    className={`flex items-center gap-3 py-3 text-sm transition-opacity ${
                      done ? 'opacity-50' : ''
                    }`}
                  >
                    <Checkbox
                      checked={done}
                      onCheckedChange={() => toggle(barbecueId, key)}
                      className="shrink-0"
                    />
                    <span className="shrink-0 text-xl leading-none" aria-hidden>
                      {d.emoji ?? '🍰'}
                    </span>
                    <span className={`flex-1 min-w-0 font-medium ${done ? 'line-through' : ''}`}>
                      {d.pieces}× {isPt ? d.name_pt : d.name_en}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className={`text-ink/65 ${done ? 'line-through' : ''}`}>
                        {formatGrams(d.total_grams, locale)}
                      </span>
                      {recipeAvailable && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0"
                          onClick={() => setOpenRecipeId(d.id)}
                        >
                          Ver receita
                        </Button>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {contributions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Convidados trazem</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {contributions.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-xl bg-olive/10 p-3 text-sm"
                >
                  <div>
                    <Badge variant="guest" className="mb-1 text-stamp">
                      {guestNameById(c.guest_id)} traz
                    </Badge>
                    <p className="font-medium text-olive-deep">{c.item_name}</p>
                    {c.quantity_description && (
                      <p className="text-xs text-olive-deep/80">{c.quantity_description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {recipe && (
        <RecipeModal
          recipe={recipe}
          open={!!openRecipeId}
          onOpenChange={(o) => setOpenRecipeId(o ? openRecipeId : null)}
        />
      )}
    </div>
  );
}

