import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

// Tipos completos do schema vivem em `@/types/database`. Optamos por não
// passar o generic ao `createClient` por enquanto: a API do supabase-js
// v2.45 desabilita o `Insert` quando o Database type usa `Omit & Partial`,
// e o ganho de tipagem acaba neutralizado por type assertions nos hooks.
// Os tipos `BarbecueRow`, `GuestRow` etc. continuam guiando a aplicação.
export function getSupabase(): SupabaseClient {
  if (!client) {
    if (!url || !anonKey) {
      throw new Error(
        'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.',
      );
    }
    client = createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return client;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}
