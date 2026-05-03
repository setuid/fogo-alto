// Geração de lista de compras consolidada (texto pronto pra WhatsApp).
// PDF é feito via `window.print()` sobre um layout dedicado.

import { findCutById } from '@/data/catalog';
import type { CalculationOutput } from '@/lib/calculator';
import type { ContributionRow } from '@/types/database';

export function buildShoppingListText(opts: {
  title: string;
  calculation: CalculationOutput;
  contributions: ContributionRow[];
  locale: 'pt-BR' | 'en';
}): string {
  const { title, calculation, contributions, locale } = opts;
  const isPt = locale === 'pt-BR';
  const lines: string[] = [];
  lines.push(isPt ? `🔥 Lista de compras — ${title}` : `🔥 Shopping list — ${title}`);
  lines.push('');

  lines.push(isPt ? '— Carnes' : '— Meats');
  for (const meat of calculation.meats) {
    const cut = findCutById(meat.cut_id);
    const name = cut ? (isPt ? cut.name_pt : cut.name_en) : meat.cut_id;
    const kg = (meat.total_grams / 1000).toFixed(2);
    lines.push(`• ${name} — ${kg} kg`);
  }

  lines.push('');
  lines.push(isPt ? '— Bebidas' : '— Drinks');
  for (const drink of calculation.drinks) {
    const qty =
      drink.unit === 'ml'
        ? `${(drink.total_ml_or_units / 1000).toFixed(1)} L`
        : `${drink.total_ml_or_units}`;
    lines.push(`• ${drink.type} — ${qty}`);
  }

  if (calculation.sides.length > 0) {
    lines.push('');
    lines.push(isPt ? '— Acompanhamentos' : '— Sides');
    for (const side of calculation.sides) {
      const name = isPt ? side.name_pt : side.name_en;
      lines.push(`• ${name} — ${(side.total_grams / 1000).toFixed(2)} kg`);
    }
  }

  if (contributions.length > 0) {
    lines.push('');
    lines.push(isPt ? '— Convidados trazem' : '— Guests bring');
    for (const c of contributions) {
      const qty = c.quantity_description ? ` (${c.quantity_description})` : '';
      lines.push(`• ${c.item_name}${qty}`);
    }
  }

  return lines.join('\n');
}
