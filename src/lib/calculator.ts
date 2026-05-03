import { DESSERTS, DRINK_CATALOG, SIDES, findCutById } from '@/data/catalog';
import type { BarbecueStyle, WeightProfile } from '@/types/domain';

export interface CalculationInput {
  adults_count: number;
  children_count: number;
  drinkers_count: number;
  duration_hours: number;
  style: BarbecueStyle;
  // cut_id -> número de peças. Chave ausente significa não selecionado.
  cut_quantities: Record<string, number>;
  // side_id -> número de porções.
  side_quantities: Record<string, number>;
  // dessert_id -> número de porções. Opcional pra compat com churrascos
  // antigos sem o campo no calc_params.
  dessert_quantities?: Record<string, number>;
  weight_profile: WeightProfile;
  drink_preferences: {
    beer: boolean;
    wine: boolean;
    caipirinha: boolean;
    soft_drinks: boolean;
  };
}

export interface MeatCalculation {
  cut_id: string;
  pieces: number;
  piece_weight_grams: number;
  total_grams: number;
}

export interface DrinkCalculation {
  type: string;
  total_ml_or_units: number;
  unit: 'ml' | 'unidade';
  // Conversão pra unidades de venda do mercado.
  bottle_size_ml?: number;
  bottle_label_pt?: string;
  bottle_label_en?: string;
  bottles?: number;
  // Estimativa de doses individuais (ex.: caipirinhas servidas).
  serving_count?: number;
  serving_label_pt?: string;
  serving_label_en?: string;
}

// Tamanho típico de garrafa por tipo de bebida no varejo brasileiro.
// `sing/plur` evitam o bug de pluralização (`garrafa de 1.5Ls`).
const BOTTLE_SIZES = {
  cerveja: {
    ml: 355,
    sing_pt: 'long neck',
    plur_pt: 'long necks',
    sing_en: 'long neck',
    plur_en: 'long necks',
  },
  vinho_tinto: {
    ml: 750,
    sing_pt: 'garrafa',
    plur_pt: 'garrafas',
    sing_en: 'bottle',
    plur_en: 'bottles',
  },
  caipirinha: {
    ml: 700,
    sing_pt: 'garrafa de cachaça',
    plur_pt: 'garrafas de cachaça',
    sing_en: 'cachaça bottle',
    plur_en: 'cachaça bottles',
  },
  refrigerante: {
    ml: 2000,
    sing_pt: 'garrafa',
    plur_pt: 'garrafas',
    sing_en: 'bottle',
    plur_en: 'bottles',
  },
  suco: {
    ml: 1000,
    sing_pt: 'caixa',
    plur_pt: 'caixas',
    sing_en: 'carton',
    plur_en: 'cartons',
  },
  agua: {
    ml: 1500,
    sing_pt: 'garrafa',
    plur_pt: 'garrafas',
    sing_en: 'bottle',
    plur_en: 'bottles',
  },
} as const;

// Caipirinha usa ~50 ml de cachaça por dose, mais limão/açúcar à parte.
const CAIPIRINHA_ML_PER_SERVING = 50;

export interface SideCalculation {
  id: string;
  name_pt: string;
  name_en: string;
  pieces: number;
  piece_weight_grams: number;
  total_grams: number;
}

export interface DessertCalculation {
  id: string;
  name_pt: string;
  name_en: string;
  pieces: number;
  piece_weight_grams: number;
  total_grams: number;
  serves_total_people: number;
  emoji?: string;
}

export interface CalculationOutput {
  meats: MeatCalculation[];
  drinks: DrinkCalculation[];
  sides: SideCalculation[];
  desserts: DessertCalculation[];
  meta: {
    target_meat_grams: number;
    selected_meat_grams: number;
    target_sides_grams: number;
    selected_sides_grams: number;
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

// Quantidade total de acompanhamentos por pessoa (somando todas as porções).
const SIDES_GRAMS_PER_PERSON = 200;

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

export function effectiveEaters(adults: number, children: number): number {
  return adults + children * CHILD_PORTION_FACTOR;
}

export function suggestedMeatGrams(
  adults: number,
  children: number,
  profile: WeightProfile,
  style: BarbecueStyle,
): number {
  const eaters = effectiveEaters(adults, children);
  const base = TOTAL_GRAMS_PER_PERSON[profile];
  return Math.round(base * STYLE_MULTIPLIERS[style] * eaters);
}

export function suggestedSidesGrams(adults: number, children: number): number {
  const eaters = effectiveEaters(adults, children);
  return Math.round(SIDES_GRAMS_PER_PERSON * eaters);
}

function calculateMeats(quantities: Record<string, number>): MeatCalculation[] {
  return Object.entries(quantities)
    .filter(([, pieces]) => pieces > 0)
    .map(([cutId, pieces]) => {
      const cut = findCutById(cutId);
      if (!cut) return null;
      const pieceGrams = Math.round(cut.typical_piece_kg * 1000);
      return {
        cut_id: cutId,
        pieces,
        piece_weight_grams: pieceGrams,
        total_grams: pieces * pieceGrams,
      };
    })
    .filter((m): m is MeatCalculation => m !== null);
}

function calculateDesserts(quantities: Record<string, number>): DessertCalculation[] {
  const result: DessertCalculation[] = [];
  for (const [dessertId, pieces] of Object.entries(quantities)) {
    if (pieces <= 0) continue;
    const def = DESSERTS.find((d) => d.id === dessertId);
    if (!def) continue;
    const pieceGrams = Math.round(def.typical_portion_kg * 1000);
    const item: DessertCalculation = {
      id: def.id,
      name_pt: def.name_pt,
      name_en: def.name_en,
      pieces,
      piece_weight_grams: pieceGrams,
      total_grams: pieces * pieceGrams,
      serves_total_people: pieces * def.serves_people,
    };
    if (def.emoji) item.emoji = def.emoji;
    result.push(item);
  }
  return result;
}

function calculateSides(quantities: Record<string, number>): SideCalculation[] {
  return Object.entries(quantities)
    .filter(([, pieces]) => pieces > 0)
    .map(([sideId, pieces]) => {
      const side = SIDES.find((s) => s.id === sideId);
      if (!side) return null;
      const pieceGrams = Math.round(side.typical_portion_kg * 1000);
      return {
        id: side.id,
        name_pt: side.name_pt,
        name_en: side.name_en,
        pieces,
        piece_weight_grams: pieceGrams,
        total_grams: pieces * pieceGrams,
      };
    })
    .filter((s): s is SideCalculation => s !== null);
}

function bottlesFor(type: keyof typeof BOTTLE_SIZES, totalMl: number): {
  bottles: number;
  bottle_size_ml: number;
  bottle_label_pt: string;
  bottle_label_en: string;
} {
  const meta = BOTTLE_SIZES[type];
  const count = Math.ceil(totalMl / meta.ml);
  return {
    bottles: count,
    bottle_size_ml: meta.ml,
    bottle_label_pt: count === 1 ? meta.sing_pt : meta.plur_pt,
    bottle_label_en: count === 1 ? meta.sing_en : meta.plur_en,
  };
}

function calculateDrinks(input: CalculationInput): DrinkCalculation[] {
  const { drinkers_count, duration_hours, drink_preferences } = input;
  const headCount = input.adults_count + input.children_count;
  const drinks: DrinkCalculation[] = [];

  if (drink_preferences.beer) {
    const def = DRINK_CATALOG.cerveja;
    // per_drinker (não escala por hora) — evita quantidades absurdas
    // em churrascos longos.
    const totalMl = (def.avg_consumption_per_drinker ?? 0) * drinkers_count;
    drinks.push({
      type: 'cerveja',
      total_ml_or_units: Math.round(totalMl),
      unit: def.unit,
      ...bottlesFor('cerveja', totalMl),
    });
  }
  if (drink_preferences.wine) {
    const def = DRINK_CATALOG.vinho_tinto;
    const totalMl = (def.avg_consumption_per_drinker ?? 0) * drinkers_count;
    drinks.push({
      type: 'vinho_tinto',
      total_ml_or_units: Math.round(totalMl),
      unit: def.unit,
      ...bottlesFor('vinho_tinto', totalMl),
    });
  }
  if (drink_preferences.caipirinha) {
    const def = DRINK_CATALOG.caipirinha;
    const totalMl = (def.avg_consumption_per_drinker ?? 0) * drinkers_count;
    drinks.push({
      type: 'caipirinha',
      total_ml_or_units: Math.round(totalMl),
      unit: def.unit,
      ...bottlesFor('caipirinha', totalMl),
      serving_count: Math.ceil(totalMl / CAIPIRINHA_ML_PER_SERVING),
      serving_label_pt: 'drinks',
      serving_label_en: 'drinks',
    });
  }
  if (drink_preferences.soft_drinks) {
    const refri = DRINK_CATALOG.refrigerante;
    const refriMl = (refri.avg_consumption_per_person_per_hour ?? 0) * duration_hours * headCount;
    drinks.push({
      type: 'refrigerante',
      total_ml_or_units: Math.round(refriMl),
      unit: refri.unit,
      ...bottlesFor('refrigerante', refriMl),
    });
  }

  // Água sempre presente, escala por head count completo.
  const agua = DRINK_CATALOG.agua;
  const aguaMl = (agua.avg_consumption_per_person_per_hour ?? 0) * duration_hours * headCount;
  drinks.push({
    type: 'agua',
    total_ml_or_units: Math.round(aguaMl),
    unit: agua.unit,
    ...bottlesFor('agua', aguaMl),
  });

  return drinks;
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

  const targetMeatGrams = suggestedMeatGrams(
    input.adults_count,
    input.children_count,
    input.weight_profile,
    input.style,
  );
  const targetSidesGrams = suggestedSidesGrams(input.adults_count, input.children_count);

  const meats = calculateMeats(input.cut_quantities);
  const sides = calculateSides(input.side_quantities);
  const desserts = calculateDesserts(input.dessert_quantities ?? {});
  const drinks = calculateDrinks(input);

  const selectedMeatGrams = meats.reduce((acc, m) => acc + m.total_grams, 0);
  const selectedSidesGrams = sides.reduce((acc, s) => acc + s.total_grams, 0);

  return {
    meats,
    drinks,
    sides,
    desserts,
    meta: {
      target_meat_grams: targetMeatGrams,
      selected_meat_grams: selectedMeatGrams,
      target_sides_grams: targetSidesGrams,
      selected_sides_grams: selectedSidesGrams,
      target_grams_per_person: Math.round(
        TOTAL_GRAMS_PER_PERSON[input.weight_profile] * STYLE_MULTIPLIERS[input.style],
      ),
      effective_eaters_count: effectiveEaters(input.adults_count, input.children_count),
      total_head_count: input.adults_count + input.children_count,
    },
  };
}

// Cortes sugeridos por estilo — ponto de partida quando o anfitrião não escolheu manualmente.
export function suggestCutsForStyle(style: BarbecueStyle): string[] {
  switch (style) {
    case 'parrilla':
      return ['bife_ancho', 'asado_de_tira', 'vacio', 'entranha', 'salsichao', 'pao_alho'];
    case 'espeto_corrido':
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

export const DEFAULT_SIDE_IDS: string[] = ['vinagrete', 'farofa', 'maionese_batata'];

/**
 * Sugere quantidades iniciais de peças para os cortes do estilo, tentando
 * encher o orçamento total sem estourar muito. Anfitrião ajusta com +/-.
 */
export function suggestCutQuantitiesForStyle(
  style: BarbecueStyle,
  targetGrams: number,
): Record<string, number> {
  const cutIds = suggestCutsForStyle(style);
  const result: Record<string, number> = {};
  let acc = 0;
  for (const id of cutIds) {
    const cut = findCutById(id);
    if (!cut) continue;
    const pieceGrams = cut.typical_piece_kg * 1000;
    if (acc >= targetGrams) break;
    result[id] = 1;
    acc += pieceGrams;
  }
  return result;
}

/**
 * Sugere quantidades iniciais para os acompanhamentos default, mirando
 * uma porção total razoável sem excesso.
 */
export function suggestSideQuantities(targetGrams: number): Record<string, number> {
  const result: Record<string, number> = {};
  let acc = 0;
  for (const id of DEFAULT_SIDE_IDS) {
    const side = SIDES.find((s) => s.id === id);
    if (!side) continue;
    if (acc >= targetGrams) break;
    result[id] = 1;
    acc += side.typical_portion_kg * 1000;
  }
  return result;
}
