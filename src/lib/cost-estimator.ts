import { PRICES, PRICES_LAST_UPDATED } from '@/data/prices';
import type { CalculationOutput } from '@/lib/calculator';

export interface ContributionDeduction {
  category: 'meat' | 'drink' | 'side' | 'other';
  // Identificador opcional para abater de um item específico (ex.: 'picanha').
  item_id?: string;
  // Quantidades equivalentes para descontar do cálculo.
  grams?: number;
  ml?: number;
  units?: number;
}

export interface CostBreakdownEntry {
  item_id: string;
  category: 'meat' | 'drink' | 'side';
  total_brl: number;
  // Quantidade efetivamente cobrada (após abater contribuições, mínimo 0).
  effective_quantity: number;
  unit: 'kg' | 'L' | 'unit';
  has_price: boolean;
}

export interface CostEstimate {
  total_brl: number;
  prices_last_updated: string;
  entries: CostBreakdownEntry[];
  // Itens sem referência de preço (não foram somados ao total).
  missing_prices: string[];
}

function priceFor(itemId: string) {
  return PRICES[itemId];
}

/**
 * Estima o custo total do churrasco a partir do output da engine de cálculo.
 *
 * Contribuições dos convidados podem ser abatidas via `deductions` — tanto por
 * `item_id` específico quanto por categoria (caso o convidado traga "alguma
 * carne" sem indicar qual). Quantidades nunca ficam negativas.
 */
export function estimateCost(
  calculation: CalculationOutput,
  deductions: ContributionDeduction[] = [],
): CostEstimate {
  const meatDeductionByItem = new Map<string, number>();
  let genericMeatDeductionGrams = 0;
  const drinkDeductionByItem = new Map<string, number>();
  let genericDrinkDeductionMl = 0;
  const sideDeductionByItem = new Map<string, number>();
  let genericSideDeductionGrams = 0;

  for (const ded of deductions) {
    if (ded.category === 'meat') {
      const grams = ded.grams ?? 0;
      if (ded.item_id) {
        meatDeductionByItem.set(ded.item_id, (meatDeductionByItem.get(ded.item_id) ?? 0) + grams);
      } else {
        genericMeatDeductionGrams += grams;
      }
    } else if (ded.category === 'drink') {
      const ml = ded.ml ?? 0;
      if (ded.item_id) {
        drinkDeductionByItem.set(ded.item_id, (drinkDeductionByItem.get(ded.item_id) ?? 0) + ml);
      } else {
        genericDrinkDeductionMl += ml;
      }
    } else if (ded.category === 'side') {
      const grams = ded.grams ?? 0;
      if (ded.item_id) {
        sideDeductionByItem.set(ded.item_id, (sideDeductionByItem.get(ded.item_id) ?? 0) + grams);
      } else {
        genericSideDeductionGrams += grams;
      }
    }
  }

  const entries: CostBreakdownEntry[] = [];
  const missingPrices: string[] = [];
  let total = 0;

  // Carnes
  for (const meat of calculation.meats) {
    const itemDeduction = meatDeductionByItem.get(meat.cut_id) ?? 0;
    const totalGrams = Math.max(0, meat.total_grams - itemDeduction);
    const price = priceFor(meat.cut_id);
    if (price?.avg_price_brl_per_kg !== undefined) {
      const cost = (totalGrams / 1000) * price.avg_price_brl_per_kg;
      entries.push({
        item_id: meat.cut_id,
        category: 'meat',
        total_brl: round2(cost),
        effective_quantity: totalGrams / 1000,
        unit: 'kg',
        has_price: true,
      });
      total += cost;
    } else {
      missingPrices.push(meat.cut_id);
      entries.push({
        item_id: meat.cut_id,
        category: 'meat',
        total_brl: 0,
        effective_quantity: totalGrams / 1000,
        unit: 'kg',
        has_price: false,
      });
    }
  }

  // Aplica desconto genérico de carne proporcionalmente sobre o que sobrou.
  if (genericMeatDeductionGrams > 0) {
    applyGenericDeduction(
      entries,
      'meat',
      'kg',
      genericMeatDeductionGrams / 1000,
      (id) => priceFor(id)?.avg_price_brl_per_kg,
    );
    total = sumTotal(entries);
  }

  // Bebidas
  for (const drink of calculation.drinks) {
    const itemDeduction = drinkDeductionByItem.get(drink.type) ?? 0;
    const totalMl = drink.unit === 'ml' ? Math.max(0, drink.total_ml_or_units - itemDeduction) : 0;
    const totalUnits = drink.unit === 'unidade' ? drink.total_ml_or_units : 0;
    const price = priceFor(drink.type);

    if (drink.unit === 'ml' && price?.avg_price_brl_per_liter !== undefined) {
      const cost = (totalMl / 1000) * price.avg_price_brl_per_liter;
      entries.push({
        item_id: drink.type,
        category: 'drink',
        total_brl: round2(cost),
        effective_quantity: totalMl / 1000,
        unit: 'L',
        has_price: true,
      });
      total += cost;
    } else if (drink.unit === 'unidade' && price?.avg_price_brl_per_unit !== undefined) {
      const cost = totalUnits * price.avg_price_brl_per_unit;
      entries.push({
        item_id: drink.type,
        category: 'drink',
        total_brl: round2(cost),
        effective_quantity: totalUnits,
        unit: 'unit',
        has_price: true,
      });
      total += cost;
    } else {
      missingPrices.push(drink.type);
      entries.push({
        item_id: drink.type,
        category: 'drink',
        total_brl: 0,
        effective_quantity: drink.unit === 'ml' ? totalMl / 1000 : totalUnits,
        unit: drink.unit === 'ml' ? 'L' : 'unit',
        has_price: false,
      });
    }
  }

  if (genericDrinkDeductionMl > 0) {
    applyGenericDeduction(
      entries,
      'drink',
      'L',
      genericDrinkDeductionMl / 1000,
      (id) => priceFor(id)?.avg_price_brl_per_liter,
    );
    total = sumTotal(entries);
  }

  // Acompanhamentos
  for (const side of calculation.sides) {
    const itemDeduction = sideDeductionByItem.get(side.id) ?? 0;
    const totalGrams = Math.max(0, side.total_grams - itemDeduction);
    const price = priceFor(side.id);
    if (price?.avg_price_brl_per_kg !== undefined) {
      const cost = (totalGrams / 1000) * price.avg_price_brl_per_kg;
      entries.push({
        item_id: side.id,
        category: 'side',
        total_brl: round2(cost),
        effective_quantity: totalGrams / 1000,
        unit: 'kg',
        has_price: true,
      });
      total += cost;
    } else {
      missingPrices.push(side.id);
      entries.push({
        item_id: side.id,
        category: 'side',
        total_brl: 0,
        effective_quantity: totalGrams / 1000,
        unit: 'kg',
        has_price: false,
      });
    }
  }

  if (genericSideDeductionGrams > 0) {
    applyGenericDeduction(
      entries,
      'side',
      'kg',
      genericSideDeductionGrams / 1000,
      (id) => priceFor(id)?.avg_price_brl_per_kg,
    );
    total = sumTotal(entries);
  }

  return {
    total_brl: round2(total),
    prices_last_updated: PRICES_LAST_UPDATED,
    entries,
    missing_prices: missingPrices,
  };
}

function applyGenericDeduction(
  entries: CostBreakdownEntry[],
  category: 'meat' | 'drink' | 'side',
  unit: 'kg' | 'L',
  amountToDeduct: number,
  priceLookup: (id: string) => number | undefined,
): void {
  let remaining = amountToDeduct;
  const targets = entries.filter(
    (e) => e.category === category && e.unit === unit && e.effective_quantity > 0,
  );
  if (targets.length === 0 || remaining <= 0) return;

  // Distribui proporcionalmente à quantidade efetiva atual.
  const totalAvailable = targets.reduce((acc, t) => acc + t.effective_quantity, 0);
  if (totalAvailable <= 0) return;

  const factor = Math.min(1, remaining / totalAvailable);
  for (const entry of targets) {
    const newQty = entry.effective_quantity * (1 - factor);
    entry.effective_quantity = newQty;
    const price = priceLookup(entry.item_id);
    if (price !== undefined) {
      entry.total_brl = round2(newQty * price);
    }
  }
}

function sumTotal(entries: CostBreakdownEntry[]): number {
  return entries.reduce((acc, e) => acc + (e.has_price ? e.total_brl : 0), 0);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
