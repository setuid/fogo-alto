import { format } from 'date-fns';
import { enUS, ptBR } from 'date-fns/locale';
import type { Locale } from '@/types/domain';

const LOCALES = { 'pt-BR': ptBR, en: enUS } as const;

export function formatEventDate(iso: string, locale: Locale): string {
  const date = new Date(iso);
  if (locale === 'pt-BR') {
    return format(date, "EEEE, d 'de' MMMM 'às' HH:mm", { locale: LOCALES[locale] });
  }
  return format(date, 'EEEE, MMMM d, h:mm a', { locale: LOCALES[locale] });
}

export function formatShortDate(iso: string, locale: Locale): string {
  const date = new Date(iso);
  return format(date, locale === 'pt-BR' ? "d/MM/yyyy 'às' HH:mm" : 'MMM d, yyyy h:mm a', {
    locale: LOCALES[locale],
  });
}

export function formatVolume(ml: number, locale: Locale): string {
  if (ml >= 1000) {
    const liters = ml / 1000;
    const formatted = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(liters);
    return `${formatted} L`;
  }
  return `${Math.round(ml)} ml`;
}
