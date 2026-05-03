import { describe, it, expect } from 'vitest';
import {
  CHILD_PORTION_FACTOR,
  calculate,
  suggestCutsForStyle,
  type CalculationInput,
} from './calculator';

const baseInput = (overrides: Partial<CalculationInput> = {}): CalculationInput => ({
  adults_count: 5,
  children_count: 0,
  drinkers_count: 5,
  duration_hours: 5,
  style: 'tradicional',
  side_ids: ['arroz_branco', 'feijao_tropeiro', 'farofa', 'vinagrete', 'maionese_batata'],
  meat_preferences: {
    cut_ids: ['picanha', 'linguica', 'asinha_frango'],
    weight_profile: 'normal',
  },
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

  it('produces meats summing close to target × effective eaters', () => {
    const out = calculate(baseInput({ adults_count: 5 }));
    const expected = 450 * 5; // normal × 5 adultos, 0 crianças
    expect(out.meta.target_grams_per_person).toBe(450);
    expect(out.meta.effective_eaters_count).toBe(5);
    expect(Math.abs(out.meta.total_meat_grams - expected)).toBeLessThan(5);
  });

  it('children consume CHILD_PORTION_FACTOR of an adult portion', () => {
    const adultsOnly = calculate(
      baseInput({ adults_count: 4, drinkers_count: 4, children_count: 0 }),
    );
    const mixed = calculate(
      baseInput({ adults_count: 4, drinkers_count: 4, children_count: 2 }),
    );
    const expectedRatio = (4 + 2 * CHILD_PORTION_FACTOR) / 4;
    const actualRatio = mixed.meta.total_meat_grams / adultsOnly.meta.total_meat_grams;
    expect(Math.abs(actualRatio - expectedRatio)).toBeLessThan(0.02);
  });

  it('applies parrilla style multiplier and prefers bovine cuts', () => {
    const out = calculate(
      baseInput({
        style: 'parrilla',
        meat_preferences: { cut_ids: ['picanha', 'linguica'], weight_profile: 'normal' },
      }),
    );
    expect(out.meta.target_grams_per_person).toBe(Math.round(450 * 1.1));
    const picanha = out.meats.find((m) => m.cut_id === 'picanha')!;
    const linguica = out.meats.find((m) => m.cut_id === 'linguica')!;
    expect(picanha.total_grams).toBeGreaterThan(linguica.total_grams);
  });

  it('weight_profile heavy yields more meat than light', () => {
    const light = calculate(
      baseInput({ meat_preferences: { cut_ids: ['picanha'], weight_profile: 'light' } }),
    );
    const heavy = calculate(
      baseInput({ meat_preferences: { cut_ids: ['picanha'], weight_profile: 'heavy' } }),
    );
    expect(heavy.meta.total_meat_grams).toBeGreaterThan(light.meta.total_meat_grams);
  });

  it('beer scales with drinkers and duration', () => {
    const out = calculate(baseInput({ adults_count: 4, drinkers_count: 4, duration_hours: 3 }));
    const beer = out.drinks.find((d) => d.type === 'cerveja')!;
    // 500 ml/h × 3h × 4 bebedores = 6000 ml
    expect(beer.total_ml_or_units).toBe(6000);
  });

  it('water and soft drinks scale with full head count, not effective eaters', () => {
    const out = calculate(baseInput({ adults_count: 5, children_count: 5, duration_hours: 4 }));
    const water = out.drinks.find((d) => d.type === 'agua')!;
    // 300 ml/h/pessoa × 4h × 10 cabeças (sem desconto pra crianças)
    expect(water.total_ml_or_units).toBe(300 * 4 * 10);
  });

  it('water is always present even if all drink flags are false', () => {
    const out = calculate(
      baseInput({
        drink_preferences: { beer: false, wine: false, caipirinha: false, soft_drinks: false },
      }),
    );
    expect(out.drinks.some((d) => d.type === 'agua')).toBe(true);
  });

  it('skips sides when side_ids is empty', () => {
    const out = calculate(baseInput({ side_ids: [] }));
    expect(out.sides).toEqual([]);
  });

  it('only includes sides that are explicitly selected', () => {
    const out = calculate(baseInput({ side_ids: ['vinagrete', 'farofa'] }));
    expect(out.sides.map((s) => s.id).sort()).toEqual(['farofa', 'vinagrete']);
  });

  it('sides scale by effective_eaters (kids count as half)', () => {
    const adultsOnly = calculate(
      baseInput({
        adults_count: 4,
        drinkers_count: 4,
        children_count: 0,
        side_ids: ['arroz_branco'],
      }),
    );
    const mixed = calculate(
      baseInput({
        adults_count: 4,
        drinkers_count: 4,
        children_count: 2,
        side_ids: ['arroz_branco'],
      }),
    );
    expect(adultsOnly.sides[0].total_grams).toBe(150 * 4);
    expect(mixed.sides[0].total_grams).toBe(Math.round(150 * (4 + 2 * 0.5)));
  });

  it('returns empty meats when no cuts provided', () => {
    const out = calculate(
      baseInput({ meat_preferences: { cut_ids: [], weight_profile: 'normal' } }),
    );
    expect(out.meats).toEqual([]);
    expect(out.meta.total_meat_grams).toBe(0);
  });

  it('ignores unknown cut ids gracefully', () => {
    const out = calculate(
      baseInput({
        meat_preferences: { cut_ids: ['picanha', 'unknown_cut_xyz'], weight_profile: 'normal' },
      }),
    );
    expect(out.meats).toHaveLength(1);
    expect(out.meats[0].cut_id).toBe('picanha');
  });
});

describe('suggestCutsForStyle', () => {
  it('returns parrilla-leaning argentinian-style cuts', () => {
    const cuts = suggestCutsForStyle('parrilla');
    expect(cuts).toContain('bife_ancho');
    expect(cuts).toContain('asado_de_tira');
    expect(cuts.length).toBeGreaterThanOrEqual(4);
  });

  it('returns variety for espeto_corrido', () => {
    const cuts = suggestCutsForStyle('espeto_corrido');
    expect(cuts.length).toBeGreaterThanOrEqual(6);
  });

  it('returns steakhouse cuts for americano', () => {
    const cuts = suggestCutsForStyle('americano');
    expect(cuts).toContain('ribeye');
    expect(cuts).toContain('ny_strip');
  });
});
