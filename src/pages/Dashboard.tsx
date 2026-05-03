import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AppHeader } from '@/components/shared/AppHeader';
import { BarbecueCard } from '@/components/barbecue/BarbecueCard';
import { useBarbecues } from '@/hooks/useBarbecue';
import type { BarbecueRow } from '@/types/database';

export function Dashboard() {
  const { t } = useTranslation(['common', 'barbecue']);
  const { data: barbecues, isLoading } = useBarbecues();

  const now = new Date();
  const upcoming = (barbecues ?? []).filter((b) => new Date(b.event_date) >= now);
  const past = (barbecues ?? []).filter((b) => new Date(b.event_date) < now);
  const next: BarbecueRow | undefined = [...upcoming]
    .sort((a, b) => +new Date(a.event_date) - +new Date(b.event_date))[0];

  return (
    <>
      <AppHeader />
      <div className="container mx-auto max-w-4xl px-4 pb-16">
        <section className="mb-10 flex items-end justify-between gap-4">
          <div>
            <Badge variant="default" className="mb-2 text-stamp">
              {t('barbecue:dashboard.title').toString()}
            </Badge>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {next ? t('barbecue:dashboard.next_event') : t('barbecue:dashboard.empty')}
            </h2>
          </div>
          <Button asChild variant="cta" size="lg">
            <Link to="/new">
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              {t('barbecue:dashboard.create_new')}
            </Link>
          </Button>
        </section>

        {isLoading && (
          <Card>
            <CardContent className="p-6 text-sm text-ink/60">{t('common:loading')}</CardContent>
          </Card>
        )}

        {!isLoading && barbecues && barbecues.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('barbecue:dashboard.empty')}</CardTitle>
              <CardDescription>
                <Link to="/new" className="text-tomato underline">
                  {t('barbecue:dashboard.create_new')}
                </Link>
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {next && (
          <section className="mb-10">
            <BarbecueCard barbecue={next} />
          </section>
        )}

        {upcoming.length > 1 && (
          <section className="mb-10">
            <h3 className="mb-3 text-stamp text-ink/60">
              {t('barbecue:dashboard.upcoming')}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {upcoming
                .filter((b) => b.id !== next?.id)
                .map((b) => (
                  <BarbecueCard key={b.id} barbecue={b} />
                ))}
            </div>
          </section>
        )}

        {past.length > 0 && (
          <section>
            <h3 className="mb-3 text-stamp text-ink/60">{t('barbecue:dashboard.past')}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {past.map((b) => (
                <BarbecueCard key={b.id} barbecue={b} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
