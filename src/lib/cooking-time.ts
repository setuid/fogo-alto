import { findCutById, type CookingTimeEntry } from '@/data/catalog';
import type { CookingTechnique, Doneness } from '@/types/domain';

const DONENESS_FACTOR: Record<Doneness, number> = {
  mal_passado: 0.6,
  ao_ponto_para_mal: 0.8,
  ao_ponto: 1.0,
  ao_ponto_para_bem: 1.2,
  bem_passado: 1.4,
};

const TECHNIQUE_BASE_FACTOR: Record<CookingTechnique, number> = {
  grelha: 1.0,
  parrilla: 1.05,
  brasa_direta: 0.95,
  brasa_indireta: 1.6,
  forno: 1.5,
  defumador: 3.0,
};

// Tempo base "ao ponto" em min/cm para cada categoria de corte na grelha direta.
const CATEGORY_BASE_MIN_PER_CM: Record<string, number> = {
  bovina: 4,
  suina: 4.5,
  aves: 6,
  embutidos: 4,
  peixes: 3,
  vegetais: 2,
};

const REST_FACTOR_BY_CATEGORY: Record<string, number> = {
  bovina: 0.25,
  suina: 0.2,
  aves: 0.15,
  embutidos: 0.1,
  peixes: 0.1,
  vegetais: 0.05,
};

export interface ResolvedCookingTime {
  total_minutes: number;
  minutes_per_side: number;
  rest_minutes: number;
  source: 'matrix' | 'heuristic';
}

/**
 * Resolve um tempo de cozimento dado corte, técnica, ponto e espessura.
 * Usa a matriz `cooking_times` quando há entrada exata; do contrário cai
 * para uma heurística baseada em categoria/espessura/ponto/técnica.
 */
export function resolveCookingTime(
  cutId: string,
  technique: CookingTechnique,
  doneness: Doneness,
  thicknessCm: number,
): ResolvedCookingTime | null {
  const cut = findCutById(cutId);
  if (!cut) return null;

  const exactKey = `${technique}_${doneness}_${thicknessCm}`;
  const exact: CookingTimeEntry | undefined = cut.cooking_times[exactKey];
  if (exact) {
    return {
      total_minutes: exact.total_minutes,
      minutes_per_side: exact.minutes_per_side,
      rest_minutes: exact.rest_minutes,
      source: 'matrix',
    };
  }

  const baseMinPerCm = CATEGORY_BASE_MIN_PER_CM[cut.category] ?? 4;
  const restFactor = REST_FACTOR_BY_CATEGORY[cut.category] ?? 0.15;

  const totalMinutes =
    baseMinPerCm * thicknessCm * DONENESS_FACTOR[doneness] * TECHNIQUE_BASE_FACTOR[technique];
  const rounded = Math.max(2, Math.round(totalMinutes));

  return {
    total_minutes: rounded,
    minutes_per_side: Math.max(1, Math.round(rounded / 2)),
    rest_minutes: Math.max(1, Math.round(rounded * restFactor)),
    source: 'heuristic',
  };
}
