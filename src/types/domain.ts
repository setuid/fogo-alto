// Tipos de domínio compartilhados entre engine de cálculo, catálogos e UI.

export type BarbecueStyle =
  | 'tradicional'
  | 'parrilla'
  | 'espeto_corrido'
  | 'americano'
  | 'misto';

export type BarbecueStatus =
  | 'planning'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type CookingTechnique =
  | 'grelha'
  | 'parrilla'
  | 'forno'
  | 'defumador'
  | 'brasa_direta'
  | 'brasa_indireta';

export type Doneness =
  | 'mal_passado'
  | 'ao_ponto_para_mal'
  | 'ao_ponto'
  | 'ao_ponto_para_bem'
  | 'bem_passado';

export type MeatCategory =
  | 'bovina'
  | 'suina'
  | 'aves'
  | 'embutidos'
  | 'peixes'
  | 'vegetais';

export type DrinkCategory =
  | 'cerveja'
  | 'vinho'
  | 'destilado'
  | 'soft'
  | 'agua';

export type ItemCategory =
  | 'meat'
  | 'drink_alcoholic'
  | 'drink_non_alcoholic'
  | 'wine'
  | 'side'
  | 'other';

export type WeightProfile = 'light' | 'normal' | 'heavy';

export type RsvpStatus = 'pending' | 'yes' | 'no' | 'maybe';

export type Locale = 'pt-BR' | 'en';
