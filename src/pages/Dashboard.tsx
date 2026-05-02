import { useTranslation } from 'react-i18next';
import { Flame, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LanguageToggle } from '@/components/shared/LanguageToggle';

export function Dashboard() {
  const { t } = useTranslation(['common', 'barbecue']);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <header className="mb-10 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Flame
            className="h-9 w-9 text-tomato animate-ember"
            strokeWidth={2.25}
            aria-hidden
          />
          <div>
            <h1 className="font-display text-3xl font-semibold leading-none sm:text-4xl">
              {t('common:app_name')}
            </h1>
            <p className="mt-1 text-sm text-ink/60">{t('common:tagline')}</p>
          </div>
        </div>
        <LanguageToggle />
      </header>

      <section className="mb-8 flex items-center justify-between">
        <div>
          <Badge variant="default" className="mb-2 text-stamp">
            {t('barbecue:dashboard.title').toString()}
          </Badge>
          <h2 className="font-display text-2xl font-semibold">
            {t('barbecue:dashboard.next_event')}
          </h2>
        </div>
        <Button variant="cta" size="lg">
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          {t('barbecue:dashboard.create_new')}
        </Button>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{t('barbecue:dashboard.empty')}</CardTitle>
          <CardDescription>
            {/* Placeholder até integração com Supabase. */}
            {t('common:empty_state')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-ink/60">
            {t('common:loading')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
