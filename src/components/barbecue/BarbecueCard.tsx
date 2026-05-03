import { Calendar, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatShortDate } from '@/lib/format';
import type { BarbecueRow } from '@/types/database';

export function BarbecueCard({ barbecue }: { barbecue: BarbecueRow }) {
  const { t, i18n } = useTranslation('barbecue');
  const locale = (i18n.resolvedLanguage ?? 'pt-BR') as 'pt-BR' | 'en';

  return (
    <Link to={`/barbecue/${barbecue.id}`}>
      <Card className="group relative overflow-hidden p-5 transition-all hover:-translate-y-0.5 hover:shadow-cta">
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-tomato to-tomato-deep opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <Badge variant="default" className="mb-2 text-stamp">
              {t(`styles.${barbecue.style}`)}
            </Badge>
            <h3 className="font-display text-xl font-semibold leading-tight">{barbecue.title}</h3>
          </div>
          <span className="text-stamp text-tomato-deep">{barbecue.status}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/65">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> {formatShortDate(barbecue.event_date, locale)}
          </span>
          {barbecue.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {barbecue.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {barbecue.estimated_guests}
          </span>
        </div>
      </Card>
    </Link>
  );
}
