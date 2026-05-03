import { DRINK_CATALOG, SIDES, findCutById } from '@/data/catalog';
import type { BarbecueStyle, WeightProfile } from '@/types/domain';

export interface CalculationInput {
  adults_count: number;
  children_count: number;
  drinkers_count: number;
  duration_hours: number;
  style: BarbecueStyle;
  // IDs dos acompanhamentos selecionados. Lista vazia = sem acompanhamentos.
  side_ids: string[];
  meat_preferences: {
    cut_ids: string[];
    weight_profile: WeightProfile;
  };
  drink_preferences: {
    beer: boolean;
    wine: boolean;
    caipirinha: boolean;
    soft_drinks: boolean;
  };
}

export interface MeatCalculation {
  cut_id: string;
  total_grams: number;
  per_person_grams: number; // por "comedor efetivo" (adulto = 1, criança = 0.5)
}

export interface DrinkCalculation {
  type: string;
  total_ml_or_units: number;
  unit: 'ml' | 'unidade';
}

export interface SideCalculation {
  id: string;
  name_pt: string;
  name_en: string;
  total_grams: number;
}

export interface CalculationOutput {
  meats: MeatCalculation[];
  drinks: DrinkCalculation[];
  sides: SideCalculation[];
  meta: {
    total_meat_grams: number;
    target_grams_per_person: number;
    effective_eaters_count: number;
    total_head_count: number;
  };
}

const TOTAL_GRAMS_PER_PERSON: Record<WeightProfile, number> = {
  light: 350,
  normal: 450,
  heavy: 600,
};

// Multiplicadores aplicados ao total de carne por pessoa, conforme o estilo.
const STYLE_MULTIPLIERS: Record<BarbecueStyle, number> = {
  tradicional: 1.0,
  parrilla: 1.1,
  espeto_corrido: 1.15,
  americano: 0.95,
  misto: 1.0,
};

// Crianças consomem ~metade da porção de adultos, tanto carne quanto
// acompanhamentos. Ajustável aqui se a regra mudar.
export const CHILD_PORTION_FACTOR = 0.5;

// Distribuição de peso entre os cortes selecionados, ponderada pelo
// `default_grams_per_person` de cada corte e ajustada pelo estilo.
function distributeMeats(
  cutIds: string[],
  totalGramsPerPerson: number,
  effectiveEaters: number,
  style: BarbecueStyle,
): MeatCalculation[] {
  const cuts = cutIds.map(findCutById).filter((cut): cut is NonNullable<typeof cut> => Boolean(cut));
  if (cuts.length === 0) return [];

  // Estilos com poucos cortes nobres: priorizar bovinos.
  const stylePreference = (cutId: string): number => {
    const cut = findCutById(cutId);
    if (!cut) return 1;
    if (style === 'parrilla') {
      return cut.category === 'bovina' ? 1.4 : 0.7;
    }
    if (style === 'espeto_corrido') {
      // Mais variedade, distribuição mais equilibrada.
      return 1.0;
    }
    return 1.0;
  };

  const weights = cuts.map((cut) => cut.default_grams_per_person * stylePreference(cut.id));
  const weightSum = weights.reduce((acc, w) => acc + w, 0);
  if (weightSum === 0) return [];

  const totalGrams = totalGramsPerPerson * effectiveEaters;

  return cuts.map((cut, idx) => {
    const share = weights[idx] / weightSum;
    const cutTotal = totalGrams * share;
    return {
      cut_id: cut.id,
      total_grams: Math.round(cutTotal),
      per_person_grams: Math.round(cutTotal / Math.max(1, effectiveEaters)),
    };
  });
}

function calculateDrinks(input: CalculationInput): DrinkCalculation[] {
  const { drinkers_count, duration_hours, drink_preferences } = input;
  const headCount = input.adults_count + input.children_count;
  const drinks: DrinkCalculation[] = [];

  if (drink_preferences.beer) {
    const def = DRINK_CATALOG.cerveja;
    const totalMl = (def.avg_consumption_per_drinker_per_hour ?? 0) * duration_hours * drinkers_count;
    drinks.push({ type: 'cerveja', total_ml_or_units: Math.round(totalMl), unit: def.unit });
  }
  if (drink_preferences.wine) {
    const def = DRINK_CATALOG.vinho_tinto;
    const totalMl = (def.avg_consumption_per_drinker ?? 0) * drinkers_count;
    drinks.push({ type: 'vinho_tinto', total_ml_or_units: Math.round(totalMl), unit: def.unit });
  }
  if (drink_preferences.caipirinha) {
    const def = DRINK_CATALOG.caipirinha;
    const totalMl = (def.avg_consumption_per_drinker ?? 0) * drinkers_count;
    drinks.push({ type: 'caipirinha', total_ml_or_units: Math.round(totalMl), unit: def.unit });
  }
  if (drink_preferences.soft_drinks) {
    const refri = DRINK_CATALOG.refrigerante;
    const refriMl = (refri.avg_consumption_per_person_per_hour ?? 0) * duration_hours * headCount;
    drinks.push({
      type: 'refrigerante',
      total_ml_or_units: Math.round(refriMl),
      unit: refri.unit,
    });
  }

  // Água é sempre incluída e considera o head count completo (adultos + crianças).
  const agua = DRINK_CATALOG.agua;
  const aguaMl = (agua.avg_consumption_per_person_per_hour ?? 0) * duration_hours * headCount;
  drinks.push({ type: 'agua', total_ml_or_units: Math.round(aguaMl), unit: agua.unit });

  return drinks;
}

function calculateSides(sideIds: string[], effectiveEaters: number): SideCalculation[] {
  return SIDES.filter((side) => sideIds.includes(side.id)).map((side) => ({
    id: side.id,
    name_pt: side.name_pt,
    name_en: side.name_en,
    total_grams: Math.round(side.grams_per_person * effectiveEaters),
  }));
}

export function calculate(input: CalculationInput): CalculationOutput {
  if (input.adults_count < 0 || input.children_count < 0) {
    throw new Error('counts must be non-negative');
  }
  if (input.adults_count + input.children_count <= 0) {
    throw new Error('at least one guest is required');
  }
  if (input.drinkers_count < 0 || input.drinkers_count > input.adults_count) {
    throw new Error('drinkers_count must be between 0 and adults_count');
  }
  if (input.duration_hours <= 0) {
    throw new Error('duration_hours must be positive');
  }

  const effectiveEaters = input.adults_count + input.children_count * CHILD_PORTION_FACTOR;
  const headCount = input.adults_count + input.children_count;

  const baseGrams = TOTAL_GRAMS_PER_PERSON[input.meat_preferences.weight_profile];
  const styleMultiplier = STYLE_MULTIPLIERS[input.style];
  const targetGramsPerPerson = Math.round(baseGrams * styleMultiplier);

  const meats = distributeMeats(
    input.meat_preferences.cut_ids,
    targetGramsPerPerson,
    effectiveEaters,
    input.style,
  );

  const drinks = calculateDrinks(input);
  const sides = calculateSides(input.side_ids, effectiveEaters);

  const totalMeatGrams = meats.reduce((acc, m) => acc + m.total_grams, 0);

  return {
    meats,
    drinks,
    sides,
    meta: {
      total_meat_grams: totalMeatGrams,
      target_grams_per_person: targetGramsPerPerson,
      effective_eaters_count: effectiveEaters,
      total_head_count: headCount,
    },
  };
}

// Cortes sugeridos por estilo — ponto de partida quando o anfitrião não escolheu manualmente.
export function suggestCutsForStyle(style: BarbecueStyle): string[] {
  switch (style) {
    case 'parrilla':
      // Parrilla argentina/uruguaia clássica: cortes nobres bovinos + chorizo.
      return ['bife_ancho', 'asado_de_tira', 'vacio', 'entranha', 'salsichao', 'pao_alho'];
    case 'espeto_corrido':
      // Variedade larga, gramagem distribuída entre vários cortes.
      return [
        'picanha',
        'fraldinha',
        'alcatra',
        'linguica',
        'sobrecoxa_frango',
        'coracao_frango',
        'queijo_coalho',
        'pao_alho',
        'abacaxi',
      ];
    case 'tradicional':
      // Mix bovino + suíno + frango + linguiça + queijo coalho.
      return [
        'picanha',
        'fraldinha',
        'linguica',
        'asinha_frango',
        'costela_suina',
        'queijo_coalho',
        'pao_alho',
      ];
    case 'americano':
      // Steakhouse / BBQ — ribeye + ribs + sides defumados.
      return ['ribeye', 'ny_strip', 'costela_suina', 'asinha_frango', 'pancetta', 'pao_alho'];
    case 'misto':
      return [
        'picanha',
        'bife_ancho',
        'linguica',
        'asinha_frango',
        'costela_suina',
        'queijo_coalho',
        'legumes_grelhados',
      ];
  }
}

// Acompanhamentos sugeridos por padrão para um novo churrasco.
export const DEFAULT_SIDE_IDS: string[] = ['vinagrete', 'farofa', 'maionese_batata'];
