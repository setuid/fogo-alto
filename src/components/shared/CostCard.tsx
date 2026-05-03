import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePreferences } from '@/stores/preferencesStore';
import { formatBRL } from '@/lib/utils';
import type { CostEstimate } from '@/lib/cost-estimator';

export function CostCard({ estimate }: { estimate: CostEstimate }) {
  const { t } = useTranslation('barbecue');
  const showCost = usePreferences((s) => s.showCost);
  const setShowCost = usePreferences((s) => s.setShowCost);

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-tomato to-tomato-deep text-white shadow-cost">
      <Sparkles className="pointer-events-none absolute -right-2 -top-2 h-24 w-24 text-white/15" />
      <div className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-stamp text-white/80">{t('cost.title')}</p>
            <p className="mt-2 font-display text-4xl font-semibold leading-none">
              {showCost ? formatBRL(estimate.total_brl) : '••••••'}
            </p>
            <p className="mt-2 text-xs text-white/75">{t('cost.subtitle')}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowCost(!showCost)}
            className="text-white hover:bg-white/15"
            aria-label={showCost ? t('cost.hide').toString() : t('cost.show').toString()}
          >
            {showCost ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </Button>
        </div>
        <p className="mt-4 text-[11px] uppercase tracking-stamp text-white/65">
          {t('cost.last_updated', {
            date: format(new Date(estimate.prices_last_updated), 'MM/yyyy'),
          })}
        </p>
        {estimate.missing_prices.length > 0 && (
          <p className="mt-2 text-xs text-white/70">
            {t('cost.missing_prices', { items: estimate.missing_prices.join(', ') })}
          </p>
        )}
      </div>
    </Card>
  );
}
