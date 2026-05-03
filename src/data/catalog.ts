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
  // Peso típico de uma "peça" como o açougue vende.
  // Usado pelo seletor de quantidades no wizard (+/-).
  typical_piece_kg: number;
  // Como o anfitrião vai contar as peças no wizard (ex.: "peça", "manta",
  // "bife", "maço"). Bilíngue.
  piece_label_pt: string;
  piece_label_en: string;
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
  // === BOVINOS NACIONAIS ===
  {
    id: 'picanha',
    name_pt: 'Picanha',
    name_en: 'Top Sirloin Cap',
    category: 'bovina',
    default_grams_per_person: 250,
    typical_piece_kg: 1.2,
    piece_label_pt: 'peça',
    piece_label_en: 'piece',
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
    typical_piece_kg: 1.0,
    piece_label_pt: 'peça',
    piece_label_en: 'piece',
    techniques: ['grelha', 'parrilla', 'brasa_direta'],
    cooking_times: {
      parrilla_ao_ponto_3: { minutes_per_side: 6, total_minutes: 12, rest_minutes: 4 },
      grelha_ao_ponto_3: { minutes_per_side: 5, total_minutes: 10, rest_minutes: 4 },
    },
    tips_pt: ['Selar bem dos dois lados', 'Cortar em fatias finas contra a fibra'],
    tips_en: ['Sear well on both sides', 'Slice thin against the grain'],
  },
  {
    id: 'maminha',
    name_pt: 'Maminha',
    name_en: 'Tri-tip',
    category: 'bovina',
    default_grams_per_person: 220,
    typical_piece_kg: 1.5,
    piece_label_pt: 'peça',
    piece_label_en: 'piece',
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
    typical_piece_kg: 1.5,
    piece_label_pt: 'peça',
    piece_label_en: 'piece',
    techniques: ['grelha', 'parrilla'],
    cooking_times: {
      parrilla_ao_ponto_3: { minutes_per_side: 6, total_minutes: 12, rest_minutes: 4 },
    },
    tips_pt: ['Não passar do ponto', 'Salgar pouco antes'],
    tips_en: ['Do not overcook', 'Salt just before grilling'],
  },
  {
    id: 'contrafile',
    name_pt: 'Contrafilé',
    name_en: 'Striploin',
    category: 'bovina',
    default_grams_per_person: 250,
    typical_piece_kg: 1.5,
    piece_label_pt: 'peça',
    piece_label_en: 'piece',
    techniques: ['grelha', 'parrilla', 'brasa_direta'],
    cooking_times: {
      parrilla_ao_ponto_3: { minutes_per_side: 5, total_minutes: 10, rest_minutes: 4 },
    },
    tips_pt: ['Manter a capa de gordura', 'Selar em fogo alto'],
    tips_en: ['Keep the fat cap on', 'Sear over high heat'],
  },
  {
    id: 'costela_bovina',
    name_pt: 'Costela bovina',
    name_en: 'Beef Ribs',
    category: 'bovina',
    default_grams_per_person: 350,
    typical_piece_kg: 2.5,
    piece_label_pt: 'rack',
    piece_label_en: 'rack',
    techniques: ['brasa_indireta', 'defumador', 'forno'],
    cooking_times: {
      brasa_indireta_bem_passado_8: { minutes_per_side: 180, total_minutes: 360, rest_minutes: 15 },
    },
    tips_pt: ['Fogo baixo e paciência', 'Embrulhar em papel alumínio nas últimas 2h'],
    tips_en: ['Low fire and patience', 'Wrap in foil for the last 2h'],
  },
  {
    id: 'cupim',
    name_pt: 'Cupim',
    name_en: 'Beef Hump',
    category: 'bovina',
    default_grams_per_person: 300,
    typical_piece_kg: 2.0,
    piece_label_pt: 'peça',
    piece_label_en: 'piece',
    techniques: ['brasa_indireta', 'forno', 'defumador'],
    cooking_times: {
      brasa_indireta_bem_passado_10: { minutes_per_side: 150, total_minutes: 300, rest_minutes: 15 },
    },
    tips_pt: ['Cozimento longo em fogo baixo', 'Selar antes de embrulhar em alumínio'],
    tips_en: ['Long, low cook', 'Sear before wrapping in foil'],
  },
  {
    id: 'file_mignon',
    name_pt: 'Filé Mignon',
    name_en: 'Tenderloin',
    category: 'bovina',
    default_grams_per_person: 220,
    typical_piece_kg: 1.5,
    piece_label_pt: 'peça',
    piece_label_en: 'piece',
    techniques: ['grelha', 'parrilla', 'brasa_direta'],
    cooking_times: {
      parrilla_ao_ponto_3: { minutes_per_side: 4, total_minutes: 8, rest_minutes: 4 },
      parrilla_mal_passado_3: { minutes_per_side: 3, total_minutes: 6, rest_minutes: 3 },
    },
    tips_pt: [
      'Bem passado é desperdício — pare no ao ponto',
      'Enrolar em bacon ajuda a não ressecar',
    ],
    tips_en: ['Well-done wastes the cut — stop at medium', 'Wrap in bacon to keep it juicy'],
  },

  // === CORTES DE STEAKHOUSE / AMERICANOS ===
  {
    id: 'ribeye',
    name_pt: 'Ribeye',
    name_en: 'Ribeye',
    category: 'bovina',
    default_grams_per_person: 280,
    typical_piece_kg: 0.4,
    piece_label_pt: 'bife',
    piece_label_en: 'steak',
    techniques: ['grelha', 'parrilla', 'brasa_direta', 'brasa_indireta'],
    cooking_times: {
      parrilla_ao_ponto_3: { minutes_per_side: 5, total_minutes: 10, rest_minutes: 5 },
      parrilla_mal_passado_3: { minutes_per_side: 3, total_minutes: 6, rest_minutes: 5 },
      brasa_direta_ao_ponto_4: { minutes_per_side: 6, total_minutes: 12, rest_minutes: 5 },
    },
    tips_pt: [
      'Reverse sear funciona bem em peças grossas',
      'O marmoreio derrete a 50ºC — paciência no fogo',
    ],
    tips_en: ['Reverse sear works great on thick steaks', 'Marbling melts at 50°C — be patient'],
  },
  {
    id: 'bife_ancho',
    name_pt: 'Bife Ancho',
    name_en: 'Bife Ancho (boneless ribeye)',
    category: 'bovina',
    default_grams_per_person: 280,
    typical_piece_kg: 0.4,
    piece_label_pt: 'bife',
    piece_label_en: 'steak',
    techniques: ['grelha', 'parrilla', 'brasa_direta'],
    cooking_times: {
      parrilla_ao_ponto_3: { minutes_per_side: 5, total_minutes: 10, rest_minutes: 5 },
      parrilla_mal_passado_3: { minutes_per_side: 3, total_minutes: 6, rest_minutes: 4 },
    },
    tips_pt: [
      'Cortar grosso, no mínimo 3 dedos',
      'Sal grosso e fogo alto pra crosta',
      'Deixar descansar antes de fatiar',
    ],
    tips_en: [
      'Cut thick — at least 3 fingers',
      'Coarse salt and high heat for the crust',
      'Rest before slicing',
    ],
  },
  {
    id: 'ny_strip',
    name_pt: 'Bife de Chorizo / NY Strip',
    name_en: 'NY Strip / Striploin',
    category: 'bovina',
    default_grams_per_person: 280,
    typical_piece_kg: 0.4,
    piece_label_pt: 'bife',
    piece_label_en: 'steak',
    techniques: ['grelha', 'parrilla', 'brasa_direta'],
    cooking_times: {
      parrilla_ao_ponto_3: { minutes_per_side: 4, total_minutes: 8, rest_minutes: 5 },
      parrilla_mal_passado_3: { minutes_per_side: 3, total_minutes: 6, rest_minutes: 4 },
    },
    tips_pt: [
      'Sela rápido em fogo alto, dourado e pronto',
      'A capa de gordura derretendo é o ponto certo',
    ],
    tips_en: ['Quick sear over high heat — golden and done', 'Fat cap melting marks the right point'],
  },
  {
    id: 't_bone',
    name_pt: 'T-Bone',
    name_en: 'T-Bone',
    category: 'bovina',
    default_grams_per_person: 350,
    typical_piece_kg: 0.5,
    piece_label_pt: 'bife',
    piece_label_en: 'steak',
    techniques: ['grelha', 'parrilla', 'brasa_direta'],
    cooking_times: {
      parrilla_ao_ponto_4: { minutes_per_side: 7, total_minutes: 14, rest_minutes: 6 },
    },
    tips_pt: [
      'Posicione o filé mais longe da brasa — cozinha mais rápido',
      'Não vire toda hora, deixa formar crosta',
    ],
    tips_en: [
      'Keep the tenderloin side away from the hottest spot — it cooks faster',
      'Flip only once, let the crust form',
    ],
  },
  {
    id: 'tomahawk',
    name_pt: 'Tomahawk',
    name_en: 'Tomahawk',
    category: 'bovina',
    default_grams_per_person: 400,
    typical_piece_kg: 1.2,
    piece_label_pt: 'peça',
    piece_label_en: 'piece',
    techniques: ['brasa_indireta', 'parrilla', 'forno'],
    cooking_times: {
      brasa_indireta_ao_ponto_5: { minutes_per_side: 25, total_minutes: 50, rest_minutes: 10 },
    },
    tips_pt: [
      'Reverse sear: cozinha em brasa indireta até 48ºC, depois sela em fogo alto',
      'Use termômetro — peças muito grossas pra sentir no toque',
    ],
    tips_en: [
      'Reverse sear: cook indirect to 48°C, then sear over high heat',
      'Use a thermometer — too thick to judge by touch',
    ],
  },

  // === CORTES ARGENTINOS / PARRILLA ===
  {
    id: 'asado_de_tira',
    name_pt: 'Asado de Tira',
    name_en: 'Asado de Tira (cross-cut short ribs)',
    category: 'bovina',
    default_grams_per_person: 350,
    typical_piece_kg: 1.0,
    piece_label_pt: 'manta',
    piece_label_en: 'rack strip',
    techniques: ['parrilla', 'brasa_direta', 'brasa_indireta'],
    cooking_times: {
      parrilla_bem_passado_3: { minutes_per_side: 25, total_minutes: 50, rest_minutes: 5 },
      parrilla_ao_ponto_3: { minutes_per_side: 18, total_minutes: 36, rest_minutes: 5 },
    },
    tips_pt: [
      'Começa pelo lado do osso pra render gordura',
      'Brasa baixa e tempo — não tem pressa',
      'Sal grosso só, sem outros temperos',
    ],
    tips_en: [
      'Start bone-side down to render the fat',
      'Low coals and time — no rushing',
      'Coarse salt only, no other seasoning',
    ],
  },
  {
    id: 'vacio',
    name_pt: 'Vacio',
    name_en: 'Vacio (Argentinian flank)',
    category: 'bovina',
    default_grams_per_person: 250,
    typical_piece_kg: 1.5,
    piece_label_pt: 'peça',
    piece_label_en: 'piece',
    techniques: ['parrilla', 'brasa_indireta', 'brasa_direta'],
    cooking_times: {
      parrilla_ao_ponto_4: { minutes_per_side: 20, total_minutes: 40, rest_minutes: 8 },
    },
    tips_pt: [
      'Manter a capa de gordura, ela derrete e tempera a carne',
      'Fatiar contra a fibra na hora de servir',
    ],
    tips_en: [
      'Keep the fat cap — it bastes the meat as it melts',
      'Slice against the grain when serving',
    ],
  },
  {
    id: 'entranha',
    name_pt: 'Entranha',
    name_en: 'Skirt Steak',
    category: 'bovina',
    default_grams_per_person: 200,
    typical_piece_kg: 0.6,
    piece_label_pt: 'peça',
    piece_label_en: 'piece',
    techniques: ['grelha', 'parrilla', 'brasa_direta'],
    cooking_times: {
      parrilla_ao_ponto_2: { minutes_per_side: 4, total_minutes: 8, rest_minutes: 3 },
      parrilla_mal_passado_2: { minutes_per_side: 3, total_minutes: 6, rest_minutes: 3 },
    },
    tips_pt: [
      'Marinada simples (sal, alho, salsinha, azeite)',
      'Fogo alto e rápido — bem passado vira sola',
      'Fatiar fino contra a fibra',
    ],
    tips_en: [
      'Simple marinade (salt, garlic, parsley, olive oil)',
      'High heat, quick cook — well-done turns to leather',
      'Slice thin against the grain',
    ],
  },
  {
    id: 'matambre',
    name_pt: 'Matambre',
    name_en: 'Matambre',
    category: 'bovina',
    default_grams_per_person: 220,
    typical_piece_kg: 0.8,
    piece_label_pt: 'peça',
    piece_label_en: 'piece',
    techniques: ['parrilla', 'grelha', 'brasa_direta'],
    cooking_times: {
      parrilla_ao_ponto_2: { minutes_per_side: 6, total_minutes: 12, rest_minutes: 4 },
    },
    tips_pt: [
      'Corte fino, cozinha rápido',
      'Bom recheado e enrolado (matambre arrollado)',
    ],
    tips_en: ['Thin cut, cooks fast', 'Great stuffed and rolled (matambre arrollado)'],
  },

  // === SUÍNOS ===
  {
    id: 'costela_suina',
    name_pt: 'Costela suína',
    name_en: 'Pork Ribs',
    category: 'suina',
    default_grams_per_person: 350,
    typical_piece_kg: 1.5,
    piece_label_pt: 'rack',
    piece_label_en: 'rack',
    techniques: ['brasa_indireta', 'defumador', 'forno'],
    cooking_times: {
      brasa_indireta_bem_passado_4: { minutes_per_side: 90, total_minutes: 180, rest_minutes: 10 },
    },
    tips_pt: [
      'Retirar a membrana das costas antes de assar',
      'Pincelar molho barbecue só nos últimos 20 min',
    ],
    tips_en: ['Remove the back membrane before cooking', 'Brush BBQ sauce only in the last 20 min'],
  },
  {
    id: 'pancetta',
    name_pt: 'Pancetta',
    name_en: 'Pork Belly',
    category: 'suina',
    default_grams_per_person: 200,
    typical_piece_kg: 1.0,
    piece_label_pt: 'peça',
    piece_label_en: 'piece',
    techniques: ['brasa_indireta', 'parrilla', 'defumador'],
    cooking_times: {
      brasa_indireta_bem_passado_3: { minutes_per_side: 30, total_minutes: 60, rest_minutes: 8 },
    },
    tips_pt: [
      'Pele crocante: secar bem, sal grosso e fogo alto no final',
      'Cortar em fatias grossas pra servir',
    ],
    tips_en: [
      'Crispy skin: dry well, coarse salt, high heat at the end',
      'Cut in thick slices to serve',
    ],
  },
  {
    id: 'bisteca_suina',
    name_pt: 'Bisteca suína',
    name_en: 'Pork Chop',
    category: 'suina',
    default_grams_per_person: 220,
    typical_piece_kg: 0.4,
    piece_label_pt: 'bisteca',
    piece_label_en: 'chop',
    techniques: ['grelha', 'parrilla', 'brasa_direta'],
    cooking_times: {
      grelha_ao_ponto_2: { minutes_per_side: 6, total_minutes: 12, rest_minutes: 4 },
    },
    tips_pt: ['Não passar do ponto, suíno hoje pode ficar levemente rosado', 'Marinar com limão e ervas'],
    tips_en: ['Slight pink is safe and juicy nowadays', 'Marinate with lemon and herbs'],
  },

  // === EMBUTIDOS ===
  {
    id: 'linguica',
    name_pt: 'Linguiça',
    name_en: 'Sausage',
    category: 'embutidos',
    default_grams_per_person: 120,
    typical_piece_kg: 0.5,
    piece_label_pt: 'maço',
    piece_label_en: 'string',
    techniques: ['grelha', 'parrilla', 'brasa_direta'],
    cooking_times: {
      grelha_bem_passado_3: { minutes_per_side: 7, total_minutes: 14, rest_minutes: 2 },
    },
    tips_pt: ['Furar com palito antes de assar evita estourar', 'Fogo médio'],
    tips_en: ['Prick with a toothpick to avoid bursting', 'Medium heat'],
  },
  {
    id: 'salsichao',
    name_pt: 'Salsichão / Chorizo',
    name_en: 'Chorizo',
    category: 'embutidos',
    default_grams_per_person: 150,
    typical_piece_kg: 0.5,
    piece_label_pt: 'maço',
    piece_label_en: 'string',
    techniques: ['grelha', 'parrilla', 'brasa_direta'],
    cooking_times: {
      parrilla_bem_passado_3: { minutes_per_side: 8, total_minutes: 16, rest_minutes: 2 },
    },
    tips_pt: ['Brasa baixa pra não estourar', 'Servir com pão e chimichurri (choripán)'],
    tips_en: ['Low coals so it does not burst', 'Serve in bread with chimichurri (choripán)'],
  },

  // === AVES ===
  {
    id: 'asinha_frango',
    name_pt: 'Asinha de frango',
    name_en: 'Chicken Wings',
    category: 'aves',
    default_grams_per_person: 200,
    typical_piece_kg: 1.0,
    piece_label_pt: 'bandeja (1 kg)',
    piece_label_en: 'tray (1 kg)',
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
    typical_piece_kg: 0.5,
    piece_label_pt: 'bandeja (500 g)',
    piece_label_en: 'tray (500 g)',
    techniques: ['grelha', 'parrilla', 'brasa_direta'],
    cooking_times: {
      grelha_bem_passado_2: { minutes_per_side: 4, total_minutes: 8, rest_minutes: 1 },
    },
    tips_pt: ['Espetar bem juntos', 'Temperar com sal e cerveja'],
    tips_en: ['Skewer them tight together', 'Season with salt and beer'],
  },
  {
    id: 'sobrecoxa_frango',
    name_pt: 'Sobrecoxa de frango',
    name_en: 'Chicken Thighs',
    category: 'aves',
    default_grams_per_person: 250,
    typical_piece_kg: 1.0,
    piece_label_pt: 'bandeja (1 kg)',
    piece_label_en: 'tray (1 kg)',
    techniques: ['brasa_indireta', 'grelha', 'forno'],
    cooking_times: {
      brasa_indireta_bem_passado_4: { minutes_per_side: 15, total_minutes: 30, rest_minutes: 5 },
    },
    tips_pt: ['Começa com pele pra cima na brasa indireta', 'Termina com pele pra baixo pra dourar'],
    tips_en: ['Start skin up over indirect heat', 'Finish skin down to crisp it up'],
  },

  // === PEIXES ===
  {
    id: 'salmao',
    name_pt: 'Salmão',
    name_en: 'Salmon',
    category: 'peixes',
    default_grams_per_person: 220,
    typical_piece_kg: 0.5,
    piece_label_pt: 'posta',
    piece_label_en: 'fillet',
    techniques: ['grelha', 'forno', 'brasa_indireta'],
    cooking_times: {
      grelha_ao_ponto_3: { minutes_per_side: 4, total_minutes: 8, rest_minutes: 2 },
    },
    tips_pt: ['Pele para baixo primeiro pra ficar crocante', 'Não passar do ponto — fica seco rápido'],
    tips_en: ['Skin side down first for crispy skin', 'Do not overcook — dries out fast'],
  },

  // === VEGETAIS / EXTRAS ===
  {
    id: 'queijo_coalho',
    name_pt: 'Queijo coalho',
    name_en: 'Coalho Cheese',
    category: 'vegetais',
    default_grams_per_person: 80,
    typical_piece_kg: 0.5,
    piece_label_pt: 'pacote (8 espetinhos)',
    piece_label_en: 'pack (8 skewers)',
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
    typical_piece_kg: 0.4,
    piece_label_pt: 'unidade',
    piece_label_en: 'loaf',
    techniques: ['grelha', 'brasa_indireta'],
    cooking_times: {
      brasa_indireta_ao_ponto_3: { minutes_per_side: 4, total_minutes: 8, rest_minutes: 1 },
    },
    tips_pt: ['Embrulhar em papel alumínio', 'Tirar do fogo quando dourar'],
    tips_en: ['Wrap in foil', 'Remove when golden'],
  },
  {
    id: 'abacaxi',
    name_pt: 'Abacaxi grelhado',
    name_en: 'Grilled Pineapple',
    category: 'vegetais',
    default_grams_per_person: 100,
    typical_piece_kg: 1.0,
    piece_label_pt: 'unidade',
    piece_label_en: 'pineapple',
    techniques: ['grelha', 'parrilla', 'brasa_direta'],
    cooking_times: {
      grelha_ao_ponto_2: { minutes_per_side: 3, total_minutes: 6, rest_minutes: 1 },
    },
    tips_pt: ['Polvilhar canela depois de grelhar', 'Cortar em rodelas grossas'],
    tips_en: ['Dust with cinnamon after grilling', 'Cut in thick rings'],
  },
  // === LEGUMES PARA GRELHAR ===
  {
    id: 'cenoura',
    name_pt: 'Cenoura',
    name_en: 'Carrot',
    category: 'vegetais',
    default_grams_per_person: 80,
    typical_piece_kg: 0.5,
    piece_label_pt: 'maço',
    piece_label_en: 'bunch',
    techniques: ['grelha', 'brasa_indireta', 'forno'],
    cooking_times: {
      grelha_ao_ponto_2: { minutes_per_side: 6, total_minutes: 12, rest_minutes: 1 },
    },
    tips_pt: ['Cortar em rodelas grossas pra grelhar bem', 'Pincelar com mel ao final'],
    tips_en: ['Cut in thick rounds to grill well', 'Brush with honey at the end'],
  },
  {
    id: 'palmito_pupunha',
    name_pt: 'Palmito pupunha',
    name_en: 'Pupunha palm heart',
    category: 'vegetais',
    default_grams_per_person: 100,
    typical_piece_kg: 0.6,
    piece_label_pt: 'tolete',
    piece_label_en: 'log',
    techniques: ['grelha', 'parrilla', 'brasa_direta'],
    cooking_times: {
      grelha_ao_ponto_2: { minutes_per_side: 4, total_minutes: 8, rest_minutes: 1 },
    },
    tips_pt: ['Cortar ao meio no comprimento', 'Selar bem e regar com azeite e limão'],
    tips_en: ['Halve lengthwise', 'Sear well and dress with olive oil and lemon'],
  },
  {
    id: 'batata',
    name_pt: 'Batata',
    name_en: 'Potato',
    category: 'vegetais',
    default_grams_per_person: 120,
    typical_piece_kg: 1.0,
    piece_label_pt: 'kg',
    piece_label_en: 'kg',
    techniques: ['brasa_indireta', 'forno', 'grelha'],
    cooking_times: {
      brasa_indireta_bem_passado_3: { minutes_per_side: 25, total_minutes: 50, rest_minutes: 3 },
    },
    tips_pt: ['Embrulhar em alumínio com manteiga e ervas', 'Furar com garfo antes'],
    tips_en: ['Wrap in foil with butter and herbs', 'Prick with a fork first'],
  },
  {
    id: 'cebola',
    name_pt: 'Cebola',
    name_en: 'Onion',
    category: 'vegetais',
    default_grams_per_person: 50,
    typical_piece_kg: 0.5,
    piece_label_pt: 'maço',
    piece_label_en: 'bunch',
    techniques: ['grelha', 'parrilla', 'brasa_direta'],
    cooking_times: {
      grelha_ao_ponto_2: { minutes_per_side: 4, total_minutes: 8, rest_minutes: 1 },
    },
    tips_pt: ['Cortar em rodelas grossas pra não desmanchar', 'Pincelar com azeite e sal'],
    tips_en: ['Cut in thick rings to hold together', 'Brush with olive oil and salt'],
  },
  {
    id: 'tomate',
    name_pt: 'Tomate',
    name_en: 'Tomato',
    category: 'vegetais',
    default_grams_per_person: 80,
    typical_piece_kg: 0.5,
    piece_label_pt: 'maço',
    piece_label_en: 'bunch',
    techniques: ['grelha', 'brasa_indireta'],
    cooking_times: {
      grelha_ao_ponto_2: { minutes_per_side: 3, total_minutes: 6, rest_minutes: 1 },
    },
    tips_pt: ['Cortar ao meio, regar com azeite e ervas', 'Cuidado pra não desmanchar'],
    tips_en: ['Halve, drizzle with olive oil and herbs', "Don't let it fall apart"],
  },
  {
    id: 'pimentao_vermelho',
    name_pt: 'Pimentão vermelho',
    name_en: 'Red bell pepper',
    category: 'vegetais',
    default_grams_per_person: 70,
    typical_piece_kg: 0.4,
    piece_label_pt: 'maço',
    piece_label_en: 'bunch',
    techniques: ['grelha', 'parrilla', 'brasa_direta'],
    cooking_times: {
      grelha_ao_ponto_2: { minutes_per_side: 4, total_minutes: 8, rest_minutes: 1 },
    },
    tips_pt: ['Grelhar inteiro até a casca queimar e descascar', 'Ou em pedaços nos espetinhos'],
    tips_en: ['Grill whole until skin chars then peel', 'Or in chunks on skewers'],
  },
  {
    id: 'pimentao_amarelo',
    name_pt: 'Pimentão amarelo',
    name_en: 'Yellow bell pepper',
    category: 'vegetais',
    default_grams_per_person: 70,
    typical_piece_kg: 0.4,
    piece_label_pt: 'maço',
    piece_label_en: 'bunch',
    techniques: ['grelha', 'parrilla', 'brasa_direta'],
    cooking_times: {
      grelha_ao_ponto_2: { minutes_per_side: 4, total_minutes: 8, rest_minutes: 1 },
    },
    tips_pt: ['Bom no espetinho com cebola e abobrinha', 'Mais doce que o vermelho'],
    tips_en: ['Great skewered with onion and zucchini', 'Sweeter than red'],
  },
  {
    id: 'pimentao_verde',
    name_pt: 'Pimentão verde',
    name_en: 'Green bell pepper',
    category: 'vegetais',
    default_grams_per_person: 70,
    typical_piece_kg: 0.4,
    piece_label_pt: 'maço',
    piece_label_en: 'bunch',
    techniques: ['grelha', 'parrilla', 'brasa_direta'],
    cooking_times: {
      grelha_ao_ponto_2: { minutes_per_side: 4, total_minutes: 8, rest_minutes: 1 },
    },
    tips_pt: ['Sabor mais marcado, vai bem com cortes gordurosos', 'Cortar em pétalas'],
    tips_en: ['Stronger flavor, pairs with fatty cuts', 'Cut in petals'],
  },
  {
    id: 'aspargos',
    name_pt: 'Aspargos',
    name_en: 'Asparagus',
    category: 'vegetais',
    default_grams_per_person: 80,
    typical_piece_kg: 0.3,
    piece_label_pt: 'maço',
    piece_label_en: 'bunch',
    techniques: ['grelha', 'parrilla', 'brasa_direta'],
    cooking_times: {
      grelha_ao_ponto_1: { minutes_per_side: 2, total_minutes: 4, rest_minutes: 1 },
    },
    tips_pt: ['Quebrar a base lenhosa antes', 'Regar com azeite, sal e limão'],
    tips_en: ['Snap off the woody base first', 'Drizzle with olive oil, salt, and lemon'],
  },
  {
    id: 'abobrinha',
    name_pt: 'Abobrinha',
    name_en: 'Zucchini',
    category: 'vegetais',
    default_grams_per_person: 80,
    typical_piece_kg: 0.5,
    piece_label_pt: 'unidade',
    piece_label_en: 'unit',
    techniques: ['grelha', 'parrilla', 'brasa_direta'],
    cooking_times: {
      grelha_ao_ponto_1: { minutes_per_side: 3, total_minutes: 6, rest_minutes: 1 },
    },
    tips_pt: ['Fatiar no comprimento em tiras finas', 'Não passar do ponto pra não virar mingau'],
    tips_en: ['Slice lengthwise in thin strips', "Don't overcook or it turns mushy"],
  },
  {
    id: 'berinjela',
    name_pt: 'Berinjela',
    name_en: 'Eggplant',
    category: 'vegetais',
    default_grams_per_person: 80,
    typical_piece_kg: 0.5,
    piece_label_pt: 'unidade',
    piece_label_en: 'unit',
    techniques: ['grelha', 'parrilla', 'brasa_direta'],
    cooking_times: {
      grelha_ao_ponto_2: { minutes_per_side: 4, total_minutes: 8, rest_minutes: 1 },
    },
    tips_pt: ['Salgar 15 min antes pra tirar a água', 'Pincelar bem com azeite'],
    tips_en: ['Salt 15 min before to draw out water', 'Brush generously with olive oil'],
  },
  {
    id: 'cogumelo',
    name_pt: 'Cogumelo',
    name_en: 'Mushroom',
    category: 'vegetais',
    default_grams_per_person: 60,
    typical_piece_kg: 0.3,
    piece_label_pt: 'bandeja',
    piece_label_en: 'tray',
    techniques: ['grelha', 'brasa_indireta'],
    cooking_times: {
      grelha_ao_ponto_2: { minutes_per_side: 3, total_minutes: 6, rest_minutes: 1 },
    },
    tips_pt: ['Champignon ou paris inteiros nos espetinhos', 'Manteiga, alho e salsinha no final'],
    tips_en: ['Whole champignon or paris on skewers', 'Butter, garlic, parsley at the end'],
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
    // ~1 long neck por hora por bebedor. Suficiente pra socializar
    // sem ninguém ficar bêbado — antes era 500 ml/h (~1,4 long necks/h),
    // que dava mais de 7 long necks por pessoa em 5h.
    avg_consumption_per_drinker_per_hour: 350,
  },
  vinho_tinto: {
    id: 'vinho_tinto',
    name_pt: 'Vinho tinto',
    name_en: 'Red Wine',
    category: 'vinho',
    unit: 'ml',
    alcoholic: true,
    // ~1/3 de garrafa por bebedor durante todo o evento.
    avg_consumption_per_drinker: 250,
  },
  caipirinha: {
    id: 'caipirinha',
    name_pt: 'Caipirinha (cachaça)',
    name_en: 'Caipirinha (cachaça)',
    category: 'destilado',
    unit: 'ml',
    alcoholic: true,
    // ~4 doses de 50 ml de cachaça por bebedor.
    avg_consumption_per_drinker: 200,
  },
  refrigerante: {
    id: 'refrigerante',
    name_pt: 'Refrigerante',
    name_en: 'Soft Drink',
    category: 'soft',
    unit: 'ml',
    alcoholic: false,
    // ~2 latas (~600 ml) por pessoa em 5h. Antes era 1,25 L/pessoa.
    avg_consumption_per_person_per_hour: 120,
  },
  suco: {
    id: 'suco',
    name_pt: 'Suco',
    name_en: 'Juice',
    category: 'soft',
    unit: 'ml',
    alcoholic: false,
    // ~2 copos por pessoa em 5h.
    avg_consumption_per_person_per_hour: 100,
  },
  agua: {
    id: 'agua',
    name_pt: 'Água',
    name_en: 'Water',
    category: 'agua',
    unit: 'ml',
    alcoholic: false,
    // ~1,25 L/pessoa em 5h. Antes era 1,5 L/pessoa, levemente alto.
    avg_consumption_per_person_per_hour: 250,
  },
};

export interface DessertDefinition {
  id: string;
  name_pt: string;
  name_en: string;
  // Mesma ideia das sides: tamanho típico de uma "porção" comprada/preparada.
  typical_portion_kg: number;
  portion_label_pt: string;
  portion_label_en: string;
  // Quantas pessoas uma porção costuma servir (pra UI ajudar).
  serves_people: number;
  // Ícone curto pra exibir na lista (emoji ou null pra fallback).
  emoji?: string;
  // Receita opcional (vai bater com `RECIPES[id]`).
  has_recipe?: boolean;
}

export const DESSERTS: DessertDefinition[] = [
  {
    id: 'sorvete',
    name_pt: 'Sorvete',
    name_en: 'Ice cream',
    typical_portion_kg: 1.5,
    portion_label_pt: 'pote (1.5 L)',
    portion_label_en: 'tub (1.5 L)',
    serves_people: 10,
    emoji: '🍨',
  },
  {
    id: 'picole',
    name_pt: 'Picolé',
    name_en: 'Popsicle',
    typical_portion_kg: 0.72,
    portion_label_pt: 'caixa (12 unid.)',
    portion_label_en: 'box (12 units)',
    serves_people: 12,
    emoji: '🍡',
  },
  {
    id: 'banana_canela',
    name_pt: 'Banana com canela e açúcar',
    name_en: 'Banana with cinnamon & sugar',
    typical_portion_kg: 1.0,
    portion_label_pt: 'cacho',
    portion_label_en: 'bunch',
    serves_people: 6,
    emoji: '🍌',
    has_recipe: true,
  },
  {
    id: 'salada_frutas',
    name_pt: 'Salada de frutas',
    name_en: 'Fruit salad',
    typical_portion_kg: 1.5,
    portion_label_pt: 'tigela',
    portion_label_en: 'bowl',
    serves_people: 8,
    emoji: '🥝',
    has_recipe: true,
  },
  {
    id: 'romeu_julieta',
    name_pt: 'Romeu e Julieta',
    name_en: 'Romeo & Juliet (cheese & guava)',
    typical_portion_kg: 0.6,
    portion_label_pt: 'kit (queijo + goiabada)',
    portion_label_en: 'set (cheese + guava)',
    serves_people: 6,
    emoji: '🧀',
  },
  {
    id: 'pave',
    name_pt: 'Pavê',
    name_en: 'Pavê',
    typical_portion_kg: 1.5,
    portion_label_pt: 'travessa',
    portion_label_en: 'tray',
    serves_people: 10,
    emoji: '🍰',
    has_recipe: true,
  },
  {
    id: 'brigadeiro',
    name_pt: 'Brigadeiros',
    name_en: 'Brigadeiros',
    typical_portion_kg: 0.6,
    portion_label_pt: 'porção (~30 un.)',
    portion_label_en: 'batch (~30 units)',
    serves_people: 10,
    emoji: '🍫',
    has_recipe: true,
  },
];

export interface SideDefinition {
  id: string;
  name_pt: string;
  name_en: string;
  grams_per_person: number;
  // Tamanho de uma porção típica que se prepara/compra (ex.: 1 panela de arroz
  // pra ~6 pessoas ≈ 1 kg). Usado pelo seletor +/- no wizard.
  typical_portion_kg: number;
  portion_label_pt: string;
  portion_label_en: string;
}

export const SIDES: SideDefinition[] = [
  {
    id: 'arroz_branco',
    name_pt: 'Arroz branco',
    name_en: 'White rice',
    grams_per_person: 150,
    typical_portion_kg: 1.0,
    portion_label_pt: 'panela (≈ 6 pessoas)',
    portion_label_en: 'pot (≈ 6 people)',
  },
  {
    id: 'feijao_tropeiro',
    name_pt: 'Feijão tropeiro',
    name_en: 'Tropeiro beans',
    grams_per_person: 100,
    typical_portion_kg: 1.5,
    portion_label_pt: 'panela',
    portion_label_en: 'pot',
  },
  {
    id: 'farofa',
    name_pt: 'Farofa',
    name_en: 'Farofa',
    grams_per_person: 80,
    typical_portion_kg: 0.5,
    portion_label_pt: 'tigela',
    portion_label_en: 'bowl',
  },
  {
    id: 'vinagrete',
    name_pt: 'Vinagrete',
    name_en: 'Vinagrete salsa',
    grams_per_person: 60,
    typical_portion_kg: 0.5,
    portion_label_pt: 'tigela',
    portion_label_en: 'bowl',
  },
  {
    id: 'maionese_batata',
    name_pt: 'Maionese de batata',
    name_en: 'Potato salad',
    grams_per_person: 120,
    typical_portion_kg: 1.0,
    portion_label_pt: 'travessa',
    portion_label_en: 'tray',
  },
];
