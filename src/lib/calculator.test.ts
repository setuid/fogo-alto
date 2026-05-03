import { describe, it, expect } from 'vitest';
import { calculate, suggestCutsForStyle, type CalculationInput } from './calculator';

const baseInput = (overrides: Partial<CalculationInput> = {}): CalculationInput => ({
  guests_count: 10,
  drinkers_count: 7,
  duration_hours: 5,
  style: 'tradicional',
  include_sides: true,
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
  it('rejects non-positive guests_count', () => {
    expect(() => calculate(baseInput({ guests_count: 0 }))).toThrow();
  });

  it('rejects drinkers_count above guests_count', () => {
    expect(() => calculate(baseInput({ drinkers_count: 999 }))).toThrow();
  });

  it('rejects non-positive duration_hours', () => {
    expect(() => calculate(baseInput({ duration_hours: 0 }))).toThrow();
  });

  it('produces meats summing close to target grams per person × guests', () => {
    const out = calculate(baseInput());
    const expected = 450 * 10; // normal × 10 convidados
    expect(out.meta.target_grams_per_person).toBe(450);
    // Tolerância pequena por arredondamento na distribuição.
    expect(Math.abs(out.meta.total_meat_grams - expected)).toBeLessThan(5);
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

  it('weight_profile heavy yields more meat per person than light', () => {
    const light = calculate(
      baseInput({ meat_preferences: { cut_ids: ['picanha'], weight_profile: 'light' } }),
    );
    const heavy = calculate(
      baseInput({ meat_preferences: { cut_ids: ['picanha'], weight_profile: 'heavy' } }),
    );
    expect(heavy.meta.total_meat_grams).toBeGreaterThan(light.meta.total_meat_grams);
  });

  it('beer scales with drinkers and duration', () => {
    const out = calculate(baseInput({ drinkers_count: 4, duration_hours: 3 }));
    const beer = out.drinks.find((d) => d.type === 'cerveja')!;
    // 500 ml/h × 3h × 4 bebedores = 6000 ml
    expect(beer.total_ml_or_units).toBe(6000);
  });

  it('water is always present even if all drink flags are false', () => {
    const out = calculate(
      baseInput({
        drink_preferences: { beer: false, wine: false, caipirinha: false, soft_drinks: false },
      }),
    );
    expect(out.drinks.some((d) => d.type === 'agua')).toBe(true);
  });

  it('skips sides when include_sides is false', () => {
    const out = calculate(baseInput({ include_sides: false }));
    expect(out.sides).toEqual([]);
  });

  it('includes sides scaled by guest count when enabled', () => {
    const out = calculate(baseInput({ guests_count: 8 }));
    const arroz = out.sides.find((s) => s.id === 'arroz_branco')!;
    expect(arroz.total_grams).toBe(150 * 8);
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
