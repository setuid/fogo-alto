import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatGrams(grams: number, locale: 'pt-BR' | 'en' = 'pt-BR'): string {
  if (grams >= 1000) {
    const kg = grams / 1000;
    const formatted = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(kg);
    return `${formatted} kg`;
  }
  return `${Math.round(grams)} g`;
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}
