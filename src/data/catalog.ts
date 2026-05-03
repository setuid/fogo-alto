import type {
  CookingTechnique,
  Doneness,
  DrinkCategory,
  MeatCategory,
} from '@/types/domain';

export interface CookingTimeKey {
  technique: CookingTechnique;
  doneness: Doneness;
  thickness_cm: number;
}

export interface CookingTimeEntry {
  minutes_per_side: number;
  total_minutes: number;
  rest_minutes: number;
}

// Chave: `${technique}_${doneness}_${thickness_cm}` (ex.: `parrilla_ao_ponto_4`).
export type CookingTimeMatrix = Record<string, CookingTimeEntry>;

export interface MeatCut {
  id: string;
  name_pt: string;
  name_en: string;
  category: MeatCategory;
  default_grams_per_person: number;
  techniques: CookingTechnique[];
  cooking_times: CookingTimeMatrix;
  tips_pt: string[];
  tips_en: string[];
}

export interface DrinkDefinition {
  id: string;
  name_pt: string;
  name_en: string;
  category: DrinkCategory;
  unit: 'ml' | 'unidade';
  alcoholic: boolean;
  // Consumo médio: por bebedor (alcoólicas) ou por pessoa (não alcoólicas).
  avg_consumption_per_drinker_per_hour?: number;
  avg_consumption_per_drinker?: number;
  avg_consumption_per_person_per_hour?: number;
  avg_consumption_per_person?: number;
}

export const MEAT_CUTS: MeatCut[] = [
  {
    id: 'picanha',
    name_pt: 'Picanha',
    name_en: 'Top Sirloin Cap',
    category: 'bovina',
    default_grams_per_person: 250,
    techniques: ['grelha', 'parrilla', 'brasa_direta'],
    cooking_times: {
      parrilla_mal_passado_4: { minutes_per_side: 5, total_minutes: 10, rest_minutes: 5 },
      parrilla_ao_ponto_4: { minutes_per_side: 8, total_minutes: 16, rest_minutes: 5 },
      parrilla_bem_passado_4: { minutes_per_side: 11, total_minutes: 22, rest_minutes: 5 },
      grelha_ao_ponto_3: { minutes_per_side: 6, total_minutes: 12, rest_minutes: 4 },
    },
    tips_pt: [
      'Cortar contra as fibras na hora de servir',
      'Não furar a carne durante o preparo',
      'Sal grosso só antes de ir ao fogo',
    ],
    tips_en: [
      'Slice against the grain when serving',
      'Do not pierce the meat while cooking',
      'Coarse salt only just before grilling',
    ],
  },
  {
    id: 'fraldinha',
    name_pt: 'Fraldinha',
    name_en: 'Bottom Sirloin Flap',
    category: 'bovina',
    default_grams_per_person: 220,
    techniques: ['grelha', 'parrilla', 'brasa_direta'],
    cooking_times: {
      parrilla_ao_ponto_3: { minutes_per_side: 6, total_minutes: 12, rest_minutes: 4 },
      grelha_ao_ponto_3: { minutes_per_side: 5, total_minutes: 10, rest_minutes: 4 },
    },
    tips_pt: ['Selar bem dos dois lados', 'Cortar em fatias finas contra a fibra'],
    tips_en: ['Sear well on both sides', 'Slice thin against the grain'],
  },
  {
    id: 'costela_bovina',
    name_pt: 'Costela bovina',
    name_en: 'Beef Ribs',
    category: 'bovina',
    default_grams_per_person: 300,
    techniques: ['brasa_indireta', 'defumador', 'forno'],
    cooking_times: {
      brasa_indireta_bem_passado_8: { minutes_per_side: 180, total_minutes: 360, rest_minutes: 15 },
    },
    tips_pt: ['Fogo baixo e paciência', 'Embrulhar em papel alumínio nas últimas 2h'],
    tips_en: ['Low fire and patience', 'Wrap in foil for the last 2h'],
  },
  {
    id: 'maminha',
    name_pt: 'Maminha',
    name_en: 'Tri-tip',
    category: 'bovina',
    default_grams_per_person: 220,
    techniques: ['grelha', 'parrilla', 'brasa_direta'],
    cooking_times: {
      parrilla_ao_ponto_4: { minutes_per_side: 9, total_minutes: 18, rest_minutes: 5 },
    },
    tips_pt: ['Manter a capa de gordura', 'Fatiar fino'],
    tips_en: ['Keep the fat cap on', 'Slice thin'],
  },
  {
    id: 'alcatra',
    name_pt: 'Alcatra',
    name_en: 'Top Sirloin',
    category: 'bovina',
    default_grams_per_person: 220,
    techniques: ['grelha', 'parrilla'],
    cooking_times: {
      parrilla_ao_ponto_3: { minutes_per_side: 6, total_minutes: 12, rest_minutes: 4 },
    },
    tips_pt: ['Não passar do ponto', 'Salgar pouco antes'],
    tips_en: ['Do not overcook', 'Salt just before grilling'],
  },
  {
    id: 'linguica',
    name_pt: 'Linguiça',
    name_en: 'Sausage',
    category: 'embutidos',
    default_grams_per_person: 120,
    techniques: ['grelha', 'parrilla', 'brasa_direta'],
    cooking_times: {
      grelha_bem_passado_3: { minutes_per_side: 7, total_minutes: 14, rest_minutes: 2 },
    },
    tips_pt: ['Furar com palito antes de assar evita estourar', 'Fogo médio'],
    tips_en: ['Prick with a toothpick to avoid bursting', 'Medium heat'],
  },
  {
    id: 'asinha_frango',
    name_pt: 'Asinha de frango',
    name_en: 'Chicken Wings',
    category: 'aves',
    default_grams_per_person: 200,
    techniques: ['grelha', 'brasa_indireta'],
    cooking_times: {
      brasa_indireta_bem_passado_3: { minutes_per_side: 12, total_minutes: 24, rest_minutes: 3 },
    },
    tips_pt: ['Marinar pelo menos 1h', 'Pincelar molho no final'],
    tips_en: ['Marinate at least 1h', 'Brush sauce at the end'],
  },
  {
    id: 'coracao_frango',
    name_pt: 'Coração de frango',
    name_en: 'Chicken Hearts',
    category: 'aves',
    default_grams_per_person: 100,
    techniques: ['grelha', 'parrilla', 'brasa_direta'],
    cooking_times: {
      grelha_bem_passado_2: { minutes_per_side: 4, total_minutes: 8, rest_minutes: 1 },
    },
    tips_pt: ['Espetar bem juntos', 'Temperar com sal e cerveja'],
    tips_en: ['Skewer them tight together', 'Season with salt and beer'],
  },
  {
    id: 'queijo_coalho',
    name_pt: 'Queijo coalho',
    name_en: 'Coalho Cheese',
    category: 'vegetais',
    default_grams_per_person: 80,
    techniques: ['grelha', 'parrilla', 'brasa_direta'],
    cooking_times: {
      grelha_ao_ponto_2: { minutes_per_side: 2, total_minutes: 4, rest_minutes: 1 },
    },
    tips_pt: ['Servir imediatamente', 'Pincelar mel ou melado por cima'],
    tips_en: ['Serve immediately', 'Brush with honey on top'],
  },
  {
    id: 'pao_alho',
    name_pt: 'Pão de alho',
    name_en: 'Garlic Bread',
    category: 'vegetais',
    default_grams_per_person: 90,
    techniques: ['grelha', 'brasa_indireta'],
    cooking_times: {
      brasa_indireta_ao_ponto_3: { minutes_per_side: 4, total_minutes: 8, rest_minutes: 1 },
    },
    tips_pt: ['Embrulhar em papel alumínio', 'Tirar do fogo quando dourar'],
    tips_en: ['Wrap in foil', 'Remove when golden'],
  },
];

export function findCutById(id: string): MeatCut | undefined {
  return MEAT_CUTS.find((cut) => cut.id === id);
}

export const DRINK_CATALOG: Record<string, DrinkDefinition> = {
  cerveja: {
    id: 'cerveja',
    name_pt: 'Cerveja',
    name_en: 'Beer',
    category: 'cerveja',
    unit: 'ml',
    alcoholic: true,
    avg_consumption_per_drinker_per_hour: 500,
  },
  vinho_tinto: {
    id: 'vinho_tinto',
    name_pt: 'Vinho tinto',
    name_en: 'Red Wine',
    category: 'vinho',
    unit: 'ml',
    alcoholic: true,
    avg_consumption_per_drinker: 250,
  },
  caipirinha: {
    id: 'caipirinha',
    name_pt: 'Caipirinha (cachaça)',
    name_en: 'Caipirinha (cachaça)',
    category: 'destilado',
    unit: 'ml',
    alcoholic: true,
    avg_consumption_per_drinker: 200, // cachaça por bebedor pro evento todo
  },
  refrigerante: {
    id: 'refrigerante',
    name_pt: 'Refrigerante',
    name_en: 'Soft Drink',
    category: 'soft',
    unit: 'ml',
    alcoholic: false,
    avg_consumption_per_person_per_hour: 250,
  },
  suco: {
    id: 'suco',
    name_pt: 'Suco',
    name_en: 'Juice',
    category: 'soft',
    unit: 'ml',
    alcoholic: false,
    avg_consumption_per_person_per_hour: 200,
  },
  agua: {
    id: 'agua',
    name_pt: 'Água',
    name_en: 'Water',
    category: 'agua',
    unit: 'ml',
    alcoholic: false,
    avg_consumption_per_person_per_hour: 300,
  },
};

export interface SideDefinition {
  id: string;
  name_pt: string;
  name_en: string;
  grams_per_person: number;
}

export const SIDES: SideDefinition[] = [
  { id: 'arroz_branco', name_pt: 'Arroz branco', name_en: 'White rice', grams_per_person: 150 },
  { id: 'feijao_tropeiro', name_pt: 'Feijão tropeiro', name_en: 'Tropeiro beans', grams_per_person: 100 },
  { id: 'farofa', name_pt: 'Farofa', name_en: 'Farofa', grams_per_person: 80 },
  { id: 'vinagrete', name_pt: 'Vinagrete', name_en: 'Vinagrete salsa', grams_per_person: 60 },
  { id: 'maionese_batata', name_pt: 'Maionese de batata', name_en: 'Potato salad', grams_per_person: 120 },
];
