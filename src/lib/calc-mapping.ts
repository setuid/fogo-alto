// Conecta o BarbecueRow (persistido) à `calculate(...)` (engine pura).

import { SIDES } from '@/data/catalog';
import { calculate, type CalculationInput, type CalculationOutput } from '@/lib/calculator';
import type { BarbecueRow } from '@/types/database';

// Tipos legados — utilizados apenas para migrar dados antigos para o novo
// formato baseado em peças.
interface LegacyCalcParams {
  cut_ids?: string[];
  side_ids?: string[];
  cut_quantities?: Record<string, number>;
  side_quantities?: Record<string, number>;
  adults_count?: number;
  children_count?: number;
  drinkers_count?: number;
  duration_hours?: number;
  weight_profile?: 'light' | 'normal' | 'heavy';
  drink_preferences?: CalculationInput['drink_preferences'];
}

export function calcInputFromBarbecue(bbq: BarbecueRow): CalculationInput {
  const params = (bbq.calc_params ?? {}) as LegacyCalcParams;

  // Compatibilidade adultos/crianças.
  const adults = params.adults_count ?? bbq.estimated_guests ?? 5;
  const children = params.children_count ?? 0;
  const drinkers = params.drinkers_count ?? Math.floor(adults * 0.7);

  // Compatibilidade cortes: novo formato é `cut_quantities`. Se vier o
  // formato antigo `cut_ids: string[]`, assume 1 peça de cada.
  const cutQuantities: Record<string, number> =
    params.cut_quantities ??
    (params.cut_ids?.reduce<Record<string, number>>((acc, id) => {
      acc[id] = 1;
      return acc;
    }, {}) ?? {});

  // Compatibilidade sides: idem.
  const sideQuantities: Record<string, number> =
    params.side_quantities ??
    (params.side_ids?.reduce<Record<string, number>>((acc, id) => {
      acc[id] = 1;
      return acc;
    }, {}) ??
      (bbq.include_sides
        ? SIDES.reduce<Record<string, number>>((acc, s) => {
            acc[s.id] = 1;
            return acc;
          }, {})
        : {}));

  return {
    adults_count: adults,
    children_count: children,
    drinkers_count: Math.min(drinkers, adults),
    duration_hours: params.duration_hours ?? 4,
    style: bbq.style,
    cut_quantities: cutQuantities,
    side_quantities: sideQuantities,
    weight_profile: params.weight_profile ?? 'normal',
    drink_preferences: params.drink_preferences ?? {
      beer: true,
      wine: false,
      caipirinha: false,
      soft_drinks: true,
    },
  };
}

export function calcForBarbecue(bbq: BarbecueRow): CalculationOutput {
  return calculate(calcInputFromBarbecue(bbq));
}
