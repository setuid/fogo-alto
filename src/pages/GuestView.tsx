import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, Flame, MapPin, Users } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { toast } from '@/components/ui/sonner';

import {
  useAddContribution,
  useRemoveContribution,
  useSharedBarbecue,
  useUpsertRsvp,
} from '@/hooks/useSharedBarbecue';
import { useGuestSession } from '@/hooks/useGuestSession';
import { formatEventDate } from '@/lib/format';
import type { ContributionRow } from '@/types/database';

type RsvpChoice = 'yes' | 'no' | 'maybe';

export function GuestView() {
  const { share_token: shareToken } = useParams<{ share_token: string }>();
  const { t, i18n } = useTranslation(['common', 'guest', 'barbecue']);
  const locale = (i18n.resolvedLanguage ?? 'pt-BR') as 'pt-BR' | 'en';

  const { guestToken, setGuestToken } = useGuestSession(shareToken);
  const { data, isLoading, error } = useSharedBarbecue(shareToken);
  const upsert = useUpsertRsvp();
  const addContrib = useAddContribution();
  const removeContrib = useRemoveContribution();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [drinksAlcohol, setDrinksAlcohol] = useState(true);
  const [rsvp, setRsvp] = useState<RsvpChoice>('yes');

  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState<ContributionRow['category']>('meat');
  const [quantity, setQuantity] = useState('');

  if (!shareToken) {
    return <ErrorShell message="Link inválido." />;
  }

  if (isLoading) {
    return <ErrorShell message={t('common:loading')} />;
  }

  if (error || !data) {
    return <ErrorShell message="Não foi possível carregar este convite." />;
  }

  const onRsvp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Coloca seu nome pra confirmar.');
      return;
    }
    const submit = (gToken: string | undefined) =>
      upsert.mutateAsync({
        share_token: shareToken,
        guest_token: gToken ?? undefined,
        name,
        email: email || undefined,
        rsvp_status: rsvp,
        drinks_alcohol: drinksAlcohol,
      });

    try {
      const res = await submit(guestToken ?? undefined);
      setGuestToken(res.guest_token);
      toast.success(t('guest:saved'));
    } catch (err) {
      const msg = extractErrorMessage(err, t('common:error_generic'));

      // Token armazenado em localStorage está órfão (banco resetou ou
      // convidado foi removido). Tenta de novo como convidado novo.
      if (guestToken && /invalid guest token/i.test(msg)) {
        try {
          setGuestToken(null);
          const res = await submit(undefined);
          setGuestToken(res.guest_token);
          toast.success(t('guest:saved'));
          return;
        } catch (retryErr) {
          toast.error(extractErrorMessage(retryErr, t('common:error_generic')));
          return;
        }
      }
      toast.error(msg);
    }
  };

  const onAddContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestToken) {
      toast.error('Confirme presença antes de oferecer algo.');
      return;
    }
    try {
      await addContrib.mutateAsync({
        share_token: shareToken,
        guest_token: guestToken,
        item_name: itemName,
        category,
        quantity_description: quantity || undefined,
      });
      setItemName('');
      setQuantity('');
      toast.success('Oferta registrada.');
    } catch (err) {
      toast.error(extractErrorMessage(err, t('common:error_generic')));
    }
  };

  const myContributions = data.contributions.filter((c) => {
    // Sem guestId direto, mas o guest_token mapeia para um id que está no payload.
    return data.guests.some((g) => g.id === c.guest_id);
  });

  const yesGuests = data.guests.filter((g) => g.rsvp_status === 'yes');

  return (
    <>
      <header className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-6 sm:py-8">
        <div className="flex items-center gap-3">
          <Flame className="h-8 w-8 text-tomato animate-ember" strokeWidth={2.25} />
          <span className="font-display text-2xl font-semibold">Fogo Alto</span>
        </div>
        <LanguageToggle />
      </header>

      <div className="container mx-auto max-w-2xl px-4 pb-16">
        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-br from-amber-mid/40 to-amber-bottom/30 p-6">
            <Badge className="mb-2 text-stamp">{t(`barbecue:styles.${data.barbecue.style}`)}</Badge>
            <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight">
              {data.barbecue.title}
            </h1>
            {data.barbecue.description && (
              <p className="mt-3 text-sm text-ink/70">{data.barbecue.description}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-sm text-ink/65">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {formatEventDate(data.barbecue.event_date, locale)}
              </span>
              {data.barbecue.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {data.barbecue.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> {yesGuests.length}/{data.barbecue.estimated_guests}
              </span>
            </div>
          </div>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('guest:rsvp.title')}</CardTitle>
            <CardDescription>
              {guestToken ? 'Atualize a sua resposta abaixo.' : 'Preencha pra confirmar.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onRsvp}>
              <div>
                <Label htmlFor="g-name">{t('guest:rsvp.name')}</Label>
                <Input
                  id="g-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="g-email">{t('guest:rsvp.email')}</Label>
                <Input
                  id="g-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {(['yes', 'no', 'maybe'] as const).map((r) => (
                  <Button
                    key={r}
                    type="button"
                    variant={rsvp === r ? 'default' : 'outline'}
                    onClick={() => setRsvp(r)}
                  >
                    {t(`guest:rsvp.${r}`)}
                  </Button>
                ))}
              </div>
              {rsvp === 'yes' && (
                <div className="flex items-center justify-between rounded-xl border border-ink/10 bg-cream-paper p-3">
                  <span>{t('guest:rsvp.drinks_alcohol')}</span>
                  <Switch checked={drinksAlcohol} onCheckedChange={setDrinksAlcohol} />
                </div>
              )}
              <Button type="submit" variant="cta" size="lg" className="w-full" disabled={upsert.isPending}>
                {upsert.isPending ? t('common:loading') : t('common:actions.save')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('guest:contributions.title')}</CardTitle>
            <CardDescription>
              {guestToken
                ? 'Adicione o que você vai trazer.'
                : 'Confirme sua presença pra poder oferecer algo.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onAddContribution}>
              <div>
                <Label htmlFor="c-name">{t('guest:contributions.what')}</Label>
                <Input
                  id="c-name"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Picanha, cerveja, salada de batata…"
                  required
                  disabled={!guestToken}
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label>Categoria</Label>
                  <Select
                    value={category}
                    onValueChange={(v) => setCategory(v as ContributionRow['category'])}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meat">Carne</SelectItem>
                      <SelectItem value="drink_alcoholic">Bebida (com álcool)</SelectItem>
                      <SelectItem value="drink_non_alcoholic">Bebida (sem álcool)</SelectItem>
                      <SelectItem value="wine">Vinho</SelectItem>
                      <SelectItem value="side">Acompanhamento</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="c-qty">{t('guest:contributions.quantity')}</Label>
                  <Input
                    id="c-qty"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="1.5 kg, 6 garrafas…"
                    disabled={!guestToken}
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={!guestToken || addContrib.isPending}
                className="w-full"
              >
                {t('guest:contributions.submit')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {myContributions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('guest:contributions.others')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {myContributions.map((c) => {
                  const guest = data.guests.find((g) => g.id === c.guest_id);
                  const isMine =
                    !!guestToken &&
                    !!guest &&
                    !!data.guests.find((g) => g.id === c.guest_id);
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
                        <p className="text-xs text-olive-deep/70">{guest?.name ?? '—'}</p>
                      </div>
                      {isMine && guestToken && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            void removeContrib.mutateAsync({
                              share_token: shareToken,
                              guest_token: guestToken,
                              contribution_id: c.id,
                            })
                          }
                        >
                          Remover
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

function ErrorShell({ message }: { message: string }) {
  return (
    <div className="container mx-auto max-w-md px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>{message}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

// Extrai uma mensagem legível de qualquer formato de erro (Error,
// PostgrestError, objeto solto). Sem isso o toast caía sempre no
// fallback genérico "Algo deu errado".
function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === 'string' && m.length > 0) return m;
  }
  return fallback;
}
