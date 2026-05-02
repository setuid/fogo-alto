// Catálogo de preços de referência. Atualizar periodicamente via PR.
// Valores médios em BRL — base supermercados SP/RJ, jan 2026.

export interface PriceReference {
  item_id: string;
  avg_price_brl_per_kg?: number;
  avg_price_brl_per_unit?: number;
  avg_price_brl_per_liter?: number;
  last_updated: string; // YYYY-MM-DD
  source_note: string;
}

export const PRICES: Record<string, PriceReference> = {
  // Carnes
  picanha: {
    item_id: 'picanha',
    avg_price_brl_per_kg: 89.9,
    last_updated: '2026-01-15',
    source_note: 'média supermercados SP/RJ, jan 2026',
  },
  fraldinha: {
    item_id: 'fraldinha',
    avg_price_brl_per_kg: 64.9,
    last_updated: '2026-01-15',
    source_note: 'média supermercados SP/RJ, jan 2026',
  },
  costela_bovina: {
    item_id: 'costela_bovina',
    avg_price_brl_per_kg: 49.9,
    last_updated: '2026-01-15',
    source_note: 'média supermercados SP/RJ, jan 2026',
  },
  maminha: {
    item_id: 'maminha',
    avg_price_brl_per_kg: 59.9,
    last_updated: '2026-01-15',
    source_note: 'média supermercados SP/RJ, jan 2026',
  },
  alcatra: {
    item_id: 'alcatra',
    avg_price_brl_per_kg: 54.9,
    last_updated: '2026-01-15',
    source_note: 'média supermercados SP/RJ, jan 2026',
  },
  linguica: {
    item_id: 'linguica',
    avg_price_brl_per_kg: 36.9,
    last_updated: '2026-01-15',
    source_note: 'média supermercados SP/RJ, jan 2026',
  },
  asinha_frango: {
    item_id: 'asinha_frango',
    avg_price_brl_per_kg: 19.9,
    last_updated: '2026-01-15',
    source_note: 'média supermercados SP/RJ, jan 2026',
  },
  coracao_frango: {
    item_id: 'coracao_frango',
    avg_price_brl_per_kg: 24.9,
    last_updated: '2026-01-15',
    source_note: 'média supermercados SP/RJ, jan 2026',
  },
  queijo_coalho: {
    item_id: 'queijo_coalho',
    avg_price_brl_per_kg: 59.9,
    last_updated: '2026-01-15',
    source_note: 'média supermercados SP/RJ, jan 2026',
  },
  pao_alho: {
    item_id: 'pao_alho',
    avg_price_brl_per_kg: 32.9,
    last_updated: '2026-01-15',
    source_note: 'média supermercados SP/RJ, jan 2026',
  },

  // Bebidas (preço por litro de produto pronto)
  cerveja: {
    item_id: 'cerveja',
    avg_price_brl_per_liter: 12.0,
    last_updated: '2026-01-15',
    source_note: 'média mainstream long neck, SP/RJ, jan 2026',
  },
  vinho_tinto: {
    item_id: 'vinho_tinto',
    avg_price_brl_per_liter: 60.0,
    last_updated: '2026-01-15',
    source_note: 'vinho de mesa categoria média, jan 2026',
  },
  caipirinha: {
    item_id: 'caipirinha',
    // Cachaça pura (200ml/pessoa estimados). Limão e açúcar à parte.
    avg_price_brl_per_liter: 35.0,
    last_updated: '2026-01-15',
    source_note: 'cachaça artesanal categoria média, jan 2026',
  },
  refrigerante: {
    item_id: 'refrigerante',
    avg_price_brl_per_liter: 9.0,
    last_updated: '2026-01-15',
    source_note: 'média 2L mercado, jan 2026',
  },
  suco: {
    item_id: 'suco',
    avg_price_brl_per_liter: 12.0,
    last_updated: '2026-01-15',
    source_note: 'suco pronto integral, jan 2026',
  },
  agua: {
    item_id: 'agua',
    avg_price_brl_per_liter: 3.5,
    last_updated: '2026-01-15',
    source_note: 'água mineral garrafa 1.5L, jan 2026',
  },

  // Acompanhamentos (matérias-primas; receitas ajustam ao escalar)
  arroz_branco: {
    item_id: 'arroz_branco',
    avg_price_brl_per_kg: 8.0,
    last_updated: '2026-01-15',
    source_note: 'arroz tipo 1, jan 2026',
  },
  feijao_tropeiro: {
    item_id: 'feijao_tropeiro',
    avg_price_brl_per_kg: 22.0,
    last_updated: '2026-01-15',
    source_note: 'preparado pronto + ingredientes, jan 2026',
  },
  farofa: {
    item_id: 'farofa',
    avg_price_brl_per_kg: 18.0,
    last_updated: '2026-01-15',
    source_note: 'farofa temperada pronta, jan 2026',
  },
  vinagrete: {
    item_id: 'vinagrete',
    avg_price_brl_per_kg: 12.0,
    last_updated: '2026-01-15',
    source_note: 'tomate + cebola + vinagre, jan 2026',
  },
  maionese_batata: {
    item_id: 'maionese_batata',
    avg_price_brl_per_kg: 16.0,
    last_updated: '2026-01-15',
    source_note: 'batata + maionese + ovos, jan 2026',
  },
};

export const PRICES_LAST_UPDATED = '2026-01-15';
