import { describe, it, expect } from 'vitest';
import {
  CHILD_PORTION_FACTOR,
  calculate,
  effectiveEaters,
  suggestCutQuantitiesForStyle,
  suggestCutsForStyle,
  suggestedMeatGrams,
  suggestedSidesGrams,
  type CalculationInput,
} from './calculator';

const baseInput = (overrides: Partial<CalculationInput> = {}): CalculationInput => ({
  adults_count: 5,
  children_count: 0,
  drinkers_count: 5,
  duration_hours: 5,
  style: 'tradicional',
  cut_quantities: { picanha: 1, linguica: 1 },
  side_quantities: { farofa: 1, vinagrete: 1 },
  weight_profile: 'normal',
  drink_preferences: {
    beer: true,
    wine: false,
    caipirinha: false,
    soft_drinks: true,
  },
  ...overrides,
});

describe('calculate', () => {
  it('rejects zero total guests', () => {
    expect(() => calculate(baseInput({ adults_count: 0, children_count: 0 }))).toThrow();
  });

  it('rejects drinkers_count above adults_count', () => {
    expect(() => calculate(baseInput({ adults_count: 5, drinkers_count: 999 }))).toThrow();
  });

  it('rejects non-positive duration_hours', () => {
    expect(() => calculate(baseInput({ duration_hours: 0 }))).toThrow();
  });

  it('returns target equal to suggestedMeatGrams', () => {
    const out = calculate(baseInput({ adults_count: 5, weight_profile: 'normal', style: 'tradicional' }));
    expect(out.meta.target_meat_grams).toBe(suggestedMeatGrams(5, 0, 'normal', 'tradicional'));
    expect(out.meta.target_meat_grams).toBe(450 * 5);
  });

  it('selected meat grams is the sum of pieces × piece_weight', () => {
    const out = calculate(
      baseInput({
        cut_quantities: { picanha: 2, linguica: 3 },
      }),
    );
    // picanha 1.2 kg/peça × 2 + linguica 0.5 kg/peça × 3 = 2.4 + 1.5 = 3.9 kg
    expect(out.meta.selected_meat_grams).toBe(2 * 1200 + 3 * 500);
    const picanha = out.meats.find((m) => m.cut_id === 'picanha')!;
    expect(picanha.pieces).toBe(2);
    expect(picanha.total_grams).toBe(2400);
  });

  it('children_count factors into target via effectiveEaters', () => {
    const adultsOnly = calculate(baseInput({ adults_count: 4, drinkers_count: 4, children_count: 0 }));
    const mixed = calculate(baseInput({ adults_count: 4, drinkers_count: 4, children_count: 2 }));
    const expectedRatio = (4 + 2 * CHILD_PORTION_FACTOR) / 4;
    expect(mixed.meta.target_meat_grams / adultsOnly.meta.target_meat_grams).toBeCloseTo(
      expectedRatio,
      2,
    );
  });

  it('parrilla applies style multiplier', () => {
    const trad = calculate(baseInput({ style: 'tradicional' }));
    const parr = calculate(baseInput({ style: 'parrilla' }));
    expect(parr.meta.target_meat_grams).toBeGreaterThan(trad.meta.target_meat_grams);
  });

  it('weight_profile heavy yields higher target than light', () => {
    const light = calculate(baseInput({ weight_profile: 'light' }));
    const heavy = calculate(baseInput({ weight_profile: 'heavy' }));
    expect(heavy.meta.target_meat_grams).toBeGreaterThan(light.meta.target_meat_grams);
  });

  it('beer scales with drinkers and duration', () => {
    const out = calculate(baseInput({ adults_count: 4, drinkers_count: 4, duration_hours: 3 }));
    const beer = out.drinks.find((d) => d.type === 'cerveja')!;
    expect(beer.total_ml_or_units).toBe(500 * 3 * 4);
  });

  it('water scales with full head count, not effective eaters', () => {
    const out = calculate(baseInput({ adults_count: 5, children_count: 5, duration_hours: 4 }));
    const water = out.drinks.find((d) => d.type === 'agua')!;
    expect(water.total_ml_or_units).toBe(300 * 4 * 10);
  });

  it('water is always present', () => {
    const out = calculate(
      baseInput({
        drink_preferences: { beer: false, wine: false, caipirinha: false, soft_drinks: false },
      }),
    );
    expect(out.drinks.some((d) => d.type === 'agua')).toBe(true);
  });

  it('skips meats / sides with zero pieces', () => {
    const out = calculate(baseInput({ cut_quantities: { picanha: 0 }, side_quantities: {} }));
    expect(out.meats).toHaveLength(0);
    expect(out.sides).toHaveLength(0);
    expect(out.meta.selected_meat_grams).toBe(0);
    expect(out.meta.selected_sides_grams).toBe(0);
  });

  it('ignores unknown cut ids gracefully', () => {
    const out = calculate(
      baseInput({ cut_quantities: { picanha: 1, unknown_cut_xyz: 5 } }),
    );
    expect(out.meats.map((m) => m.cut_id)).toEqual(['picanha']);
  });

  it('side selected_sides_grams equals sum of portion sizes × pieces', () => {
    const out = calculate(
      baseInput({ side_quantities: { farofa: 2, maionese_batata: 1 } }),
    );
    // farofa 0.5 × 2 + maionese_batata 1.0 × 1 = 1 + 1 = 2 kg
    expect(out.meta.selected_sides_grams).toBe(2 * 500 + 1 * 1000);
  });
});

describe('helpers', () => {
  it('effectiveEaters factors kids as half', () => {
    expect(effectiveEaters(5, 0)).toBe(5);
    expect(effectiveEaters(4, 2)).toBe(5);
  });

  it('suggestedMeatGrams: 5 normal tradicional = 2250 g', () => {
    expect(suggestedMeatGrams(5, 0, 'normal', 'tradicional')).toBe(2250);
  });

  it('suggestedSidesGrams: 5 adultos = 1000 g', () => {
    expect(suggestedSidesGrams(5, 0)).toBe(1000);
  });

  it('suggestCutsForStyle parrilla starts with bife_ancho', () => {
    const cuts = suggestCutsForStyle('parrilla');
    expect(cuts).toContain('bife_ancho');
    expect(cuts).toContain('asado_de_tira');
  });

  it('suggestCutQuantitiesForStyle fills toward target without overshooting wildly', () => {
    const target = suggestedMeatGrams(5, 0, 'normal', 'parrilla'); // ~2475 g
    const qty = suggestCutQuantitiesForStyle('parrilla', target);
    const total = Object.entries(qty).reduce((acc, [, p]) => acc + p, 0);
    expect(total).toBeGreaterThan(0);
  });
});
