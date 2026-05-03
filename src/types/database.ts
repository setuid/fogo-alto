// Tipos do schema Supabase. Esqueleto inicial — substituir por geração via
// `supabase gen types typescript` quando o projeto remoto existir.

import type {
  BarbecueStatus,
  BarbecueStyle,
  CookingTechnique,
  Doneness,
  ItemCategory,
  RsvpStatus,
  WeightProfile,
} from './domain';

export interface CalcParams {
  cut_ids: string[];
  drinkers_count: number;
  duration_hours: number;
  weight_profile: WeightProfile;
  drink_preferences: {
    beer: boolean;
    wine: boolean;
    caipirinha: boolean;
    soft_drinks: boolean;
  };
}

export interface BarbecueRow {
  id: string;
  host_id: string;
  share_token: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  style: BarbecueStyle;
  estimated_guests: number;
  status: BarbecueStatus;
  include_sides: boolean;
  notes: string | null;
  calc_params: CalcParams;
  created_at: string;
  updated_at: string;
}

export interface GuestRow {
  id: string;
  barbecue_id: string;
  name: string;
  email: string | null;
  rsvp_status: RsvpStatus;
  drinks_alcohol: boolean;
  guest_token: string;
  created_at: string;
}

export interface ItemRow {
  id: string;
  barbecue_id: string;
  category: ItemCategory;
  name: string;
  cut_id: string | null;
  quantity_grams: number | null;
  quantity_liters: number | null;
  quantity_units: number | null;
  is_calculated: boolean;
  brought_by_guest_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface ContributionRow {
  id: string;
  barbecue_id: string;
  guest_id: string;
  item_name: string;
  category: ItemCategory;
  quantity_description: string | null;
  notes: string | null;
  created_at: string;
}

export interface CookingSessionRow {
  id: string;
  barbecue_id: string;
  item_id: string;
  technique: CookingTechnique;
  doneness: Doneness;
  thickness_cm: number | null;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
}

// Estrutura compatível com o helper `createClient<Database>()`.
export interface Database {
  public: {
    Tables: {
      barbecues: {
        Row: BarbecueRow;
        Insert: Omit<BarbecueRow, 'id' | 'share_token' | 'created_at' | 'updated_at'> &
          Partial<Pick<BarbecueRow, 'id' | 'share_token' | 'created_at' | 'updated_at'>>;
        Update: Partial<BarbecueRow>;
      };
      guests: {
        Row: GuestRow;
        Insert: Omit<GuestRow, 'id' | 'guest_token' | 'created_at'> &
          Partial<Pick<GuestRow, 'id' | 'guest_token' | 'created_at'>>;
        Update: Partial<GuestRow>;
      };
      items: {
        Row: ItemRow;
        Insert: Omit<ItemRow, 'id' | 'created_at'> & Partial<Pick<ItemRow, 'id' | 'created_at'>>;
        Update: Partial<ItemRow>;
      };
      contributions: {
        Row: ContributionRow;
        Insert: Omit<ContributionRow, 'id' | 'created_at'> &
          Partial<Pick<ContributionRow, 'id' | 'created_at'>>;
        Update: Partial<ContributionRow>;
      };
      cooking_sessions: {
        Row: CookingSessionRow;
        Insert: Omit<CookingSessionRow, 'id'> & Partial<Pick<CookingSessionRow, 'id'>>;
        Update: Partial<CookingSessionRow>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_barbecue_by_share_token: {
        Args: { token: string };
        Returns: unknown;
      };
      upsert_guest_rsvp: {
        Args: {
          share_token: string;
          guest_token: string | null;
          guest_name: string;
          guest_email: string | null;
          new_rsvp_status: string;
          drinks_alcohol_input: boolean;
        };
        Returns: unknown;
      };
      add_contribution: {
        Args: {
          share_token: string;
          guest_token: string;
          item_name_input: string;
          category_input: string;
          quantity_description_input: string | null;
          notes_input: string | null;
        };
        Returns: unknown;
      };
      remove_contribution: {
        Args: {
          share_token: string;
          guest_token: string;
          contribution_id_input: string;
        };
        Returns: unknown;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
