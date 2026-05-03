// Conecta o BarbecueRow (persistido) à `calculate(...)` (engine pura).

import { SIDES } from '@/data/catalog';
import { calculate, type CalculationInput, type CalculationOutput } from '@/lib/calculator';
import type { BarbecueRow } from '@/types/database';

export function calcInputFromBarbecue(bbq: BarbecueRow): CalculationInput {
  const params = bbq.calc_params ?? {};

  // Compatibilidade com churrascos criados antes da divisão adultos/crianças:
  // se faltar adults_count, divide o estimated_guests todo como adultos.
  const adultsFallback = bbq.estimated_guests;
  const adults = (params as { adults_count?: number }).adults_count ?? adultsFallback;
  const children = (params as { children_count?: number }).children_count ?? 0;

  const drinkers =
    (params as { drinkers_count?: number }).drinkers_count ?? Math.floor(adults * 0.7);

  // Se faltar `side_ids`, usa o flag legado `include_sides` para decidir
  // entre todas as sides ou nenhuma.
  const sideIds =
    (params as { side_ids?: string[] }).side_ids ??
    (bbq.include_sides ? SIDES.map((s) => s.id) : []);

  const duration = (params as { duration_hours?: number }).duration_hours ?? 4;
  const weightProfile =
    (params as { weight_profile?: 'light' | 'normal' | 'heavy' }).weight_profile ?? 'normal';
  const cutIds = (params as { cut_ids?: string[] }).cut_ids ?? [];
  const drinkPrefs = (params as { drink_preferences?: CalculationInput['drink_preferences'] })
    .drink_preferences ?? {
    beer: true,
    wine: false,
    caipirinha: false,
    soft_drinks: true,
  };

  return {
    adults_count: adults,
    children_count: children,
    drinkers_count: Math.min(drinkers, adults),
    duration_hours: duration,
    style: bbq.style,
    side_ids: sideIds,
    meat_preferences: { cut_ids: cutIds, weight_profile: weightProfile },
    drink_preferences: drinkPrefs,
  };
}

export function calcForBarbecue(bbq: BarbecueRow): CalculationOutput {
  return calculate(calcInputFromBarbecue(bbq));
}
