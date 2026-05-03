// Conecta o BarbecueRow (persistido) à `calculate(...)` (engine pura).

import { calculate, type CalculationInput, type CalculationOutput } from '@/lib/calculator';
import type { BarbecueRow } from '@/types/database';

export function calcInputFromBarbecue(bbq: BarbecueRow): CalculationInput {
  const params = bbq.calc_params ?? {
    cut_ids: [],
    drinkers_count: Math.max(0, Math.floor(bbq.estimated_guests * 0.7)),
    duration_hours: 4,
    weight_profile: 'normal',
    drink_preferences: { beer: true, wine: false, caipirinha: false, soft_drinks: true },
  };
  return {
    guests_count: bbq.estimated_guests,
    drinkers_count: params.drinkers_count,
    duration_hours: params.duration_hours,
    style: bbq.style,
    include_sides: bbq.include_sides,
    meat_preferences: {
      cut_ids: params.cut_ids ?? [],
      weight_profile: params.weight_profile,
    },
    drink_preferences: params.drink_preferences,
  };
}

export function calcForBarbecue(bbq: BarbecueRow): CalculationOutput {
  return calculate(calcInputFromBarbecue(bbq));
}
