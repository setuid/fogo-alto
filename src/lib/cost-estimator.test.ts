import { describe, it, expect } from 'vitest';
import { calculate, type CalculationInput } from './calculator';
import { estimateCost } from './cost-estimator';

const input: CalculationInput = {
  guests_count: 10,
  drinkers_count: 7,
  duration_hours: 5,
  style: 'tradicional',
  include_sides: true,
  meat_preferences: {
    cut_ids: ['picanha', 'linguica'],
    weight_profile: 'normal',
  },
  drink_preferences: {
    beer: true,
    wine: false,
    caipirinha: false,
    soft_drinks: true,
  },
};

describe('estimateCost', () => {
  it('produces a positive total for a typical input', () => {
    const calc = calculate(input);
    const cost = estimateCost(calc);
    expect(cost.total_brl).toBeGreaterThan(0);
  });

  it('exposes prices_last_updated', () => {
    const cost = estimateCost(calculate(input));
    expect(cost.prices_last_updated).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it('item-specific deduction reduces only that item cost', () => {
    const calc = calculate(input);
    const baseline = estimateCost(calc);
    const picanhaEntry = baseline.entries.find((e) => e.item_id === 'picanha')!;
    const linguicaEntry = baseline.entries.find((e) => e.item_id === 'linguica')!;

    const reduced = estimateCost(calc, [
      { category: 'meat', item_id: 'picanha', grams: picanhaEntry.effective_quantity * 1000 },
    ]);
    const newPicanha = reduced.entries.find((e) => e.item_id === 'picanha')!;
    const newLinguica = reduced.entries.find((e) => e.item_id === 'linguica')!;

    expect(newPicanha.total_brl).toBe(0);
    expect(newLinguica.total_brl).toBeCloseTo(linguicaEntry.total_brl, 2);
    expect(reduced.total_brl).toBeLessThan(baseline.total_brl);
  });

  it('generic meat deduction applies proportionally across cuts', () => {
    const calc = calculate(input);
    const baseline = estimateCost(calc);
    const totalMeatGrams = calc.meta.total_meat_grams;

    const reduced = estimateCost(calc, [{ category: 'meat', grams: totalMeatGrams * 0.5 }]);
    const baselineMeat = baseline.entries
      .filter((e) => e.category === 'meat')
      .reduce((acc, e) => acc + e.total_brl, 0);
    const reducedMeat = reduced.entries
      .filter((e) => e.category === 'meat')
      .reduce((acc, e) => acc + e.total_brl, 0);

    expect(reducedMeat).toBeCloseTo(baselineMeat * 0.5, 1);
  });

  it('quantities never go negative when deduction exceeds need', () => {
    const calc = calculate(input);
    const cost = estimateCost(calc, [
      { category: 'meat', item_id: 'picanha', grams: 999_999_999 },
    ]);
    const picanha = cost.entries.find((e) => e.item_id === 'picanha')!;
    expect(picanha.effective_quantity).toBe(0);
    expect(picanha.total_brl).toBe(0);
  });

  it('flags missing prices without throwing', () => {
    const calc = calculate({
      ...input,
      meat_preferences: { cut_ids: ['picanha'], weight_profile: 'normal' },
    });
    // Inserir um item sintético sem preço.
    calc.meats.push({ cut_id: 'item_inexistente_xyz', total_grams: 1000, per_person_grams: 100 });
    const cost = estimateCost(calc);
    expect(cost.missing_prices).toContain('item_inexistente_xyz');
    const entry = cost.entries.find((e) => e.item_id === 'item_inexistente_xyz')!;
    expect(entry.has_price).toBe(false);
    expect(entry.total_brl).toBe(0);
  });
});
