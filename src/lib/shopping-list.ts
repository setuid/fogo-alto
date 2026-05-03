// Geração de lista de compras consolidada (texto pronto pra WhatsApp).

import { findCutById } from '@/data/catalog';
import type { CalculationOutput } from '@/lib/calculator';
import type { ContributionRow } from '@/types/database';

export function buildShoppingListText(opts: {
  title: string;
  calculation: CalculationOutput;
  contributions: ContributionRow[];
  locale: 'pt-BR' | 'en';
  // Link público (com share_token) pra compartilhar com convidados.
  shareUrl?: string;
}): string {
  const { title, calculation, contributions, locale, shareUrl } = opts;
  const isPt = locale === 'pt-BR';
  const lines: string[] = [];
  lines.push(isPt ? `🔥 Lista de compras — ${title}` : `🔥 Shopping list — ${title}`);
  lines.push('');

  lines.push(isPt ? '— Carnes' : '— Meats');
  for (const meat of calculation.meats) {
    const cut = findCutById(meat.cut_id);
    const name = cut ? (isPt ? cut.name_pt : cut.name_en) : meat.cut_id;
    const pieceLabel = cut ? (isPt ? cut.piece_label_pt : cut.piece_label_en) : 'piece';
    const labelPlural = meat.pieces > 1 ? `${pieceLabel}s` : pieceLabel;
    const kg = (meat.total_grams / 1000).toFixed(2);
    lines.push(`• ${meat.pieces} ${labelPlural} de ${name} — ${kg} kg`);
  }

  lines.push('');
  lines.push(isPt ? '— Bebidas' : '— Drinks');
  for (const drink of calculation.drinks) {
    const detail =
      drink.bottles && drink.bottle_label_pt
        ? `${drink.bottles} ${drink.bottle_label_pt}`
        : drink.unit === 'ml'
          ? `${(drink.total_ml_or_units / 1000).toFixed(1)} L`
          : `${drink.total_ml_or_units}`;
    lines.push(`• ${drink.type} — ${detail}`);
  }

  if (calculation.sides.length > 0) {
    lines.push('');
    lines.push(isPt ? '— Acompanhamentos' : '— Sides');
    for (const side of calculation.sides) {
      const name = isPt ? side.name_pt : side.name_en;
      const kg = (side.total_grams / 1000).toFixed(2);
      lines.push(`• ${side.pieces}× ${name} — ${kg} kg`);
    }
  }

  if (calculation.desserts.length > 0) {
    lines.push('');
    lines.push(isPt ? '— Sobremesas' : '— Desserts');
    for (const dessert of calculation.desserts) {
      const name = isPt ? dessert.name_pt : dessert.name_en;
      const emoji = dessert.emoji ? `${dessert.emoji} ` : '';
      const kg = (dessert.total_grams / 1000).toFixed(2);
      lines.push(`• ${emoji}${dessert.pieces}× ${name} — ${kg} kg`);
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

  if (shareUrl) {
    lines.push('');
    lines.push(isPt ? '— Link mágico (RSVP & contribuições)' : '— Magic link (RSVP & contributions)');
    lines.push(shareUrl);
  }

  return lines.join('\n');
}
