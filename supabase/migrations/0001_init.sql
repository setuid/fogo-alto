-- Schema inicial do Fogo Alto.
-- Aplicar via Supabase CLI: `supabase db push` ou pelo SQL editor no dashboard.

create extension if not exists pgcrypto;

create table if not exists barbecues (
  id uuid primary key default gen_random_uuid(),
  host_id uuid references auth.users(id) not null,
  share_token text unique not null default encode(gen_random_bytes(16), 'hex'),
  title text not null,
  description text,
  event_date timestamptz not null,
  location text,
  style text not null check (style in ('tradicional', 'parrilla', 'espeto_corrido', 'americano', 'misto')),
  estimated_guests int not null,
  status text not null default 'planning' check (status in ('planning', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  include_sides boolean default true,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  barbecue_id uuid references barbecues(id) on delete cascade not null,
  name text not null,
  email text,
  rsvp_status text default 'pending' check (rsvp_status in ('pending', 'yes', 'no', 'maybe')),
  drinks_alcohol boolean default true,
  guest_token text unique not null default encode(gen_random_bytes(8), 'hex'),
  created_at timestamptz default now()
);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  barbecue_id uuid references barbecues(id) on delete cascade not null,
  category text not null check (category in ('meat', 'drink_alcoholic', 'drink_non_alcoholic', 'wine', 'side', 'other')),
  name text not null,
  cut_id text,
  quantity_grams numeric,
  quantity_liters numeric,
  quantity_units int,
  is_calculated boolean default true,
  brought_by_guest_id uuid references guests(id),
  notes text,
  created_at timestamptz default now()
);

create table if not exists contributions (
  id uuid primary key default gen_random_uuid(),
  barbecue_id uuid references barbecues(id) on delete cascade not null,
  guest_id uuid references guests(id) on delete cascade not null,
  item_name text not null,
  category text not null check (category in ('meat', 'drink_alcoholic', 'drink_non_alcoholic', 'wine', 'side', 'other')),
  quantity_description text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists cooking_sessions (
  id uuid primary key default gen_random_uuid(),
  barbecue_id uuid references barbecues(id) on delete cascade not null,
  item_id uuid references items(id) not null,
  technique text not null check (technique in ('grelha', 'parrilla', 'forno', 'defumador', 'brasa_direta', 'brasa_indireta')),
  doneness text not null check (doneness in ('mal_passado', 'ao_ponto_para_mal', 'ao_ponto', 'ao_ponto_para_bem', 'bem_passado')),
  thickness_cm numeric,
  started_at timestamptz,
  completed_at timestamptz,
  notes text
);

create index if not exists barbecues_host_id_idx on barbecues(host_id);
create index if not exists guests_barbecue_id_idx on guests(barbecue_id);
create index if not exists items_barbecue_id_idx on items(barbecue_id);
create index if not exists contributions_barbecue_id_idx on contributions(barbecue_id);
create index if not exists cooking_sessions_barbecue_id_idx on cooking_sessions(barbecue_id);

-- Atualiza `updated_at` automaticamente.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists barbecues_set_updated_at on barbecues;
create trigger barbecues_set_updated_at
before update on barbecues
for each row execute function set_updated_at();

-- RLS — anfitriões só enxergam os próprios churrascos.
alter table barbecues enable row level security;
alter table guests enable row level security;
alter table items enable row level security;
alter table contributions enable row level security;
alter table cooking_sessions enable row level security;

drop policy if exists "Hosts manage their barbecues" on barbecues;
create policy "Hosts manage their barbecues"
  on barbecues for all
  using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

drop policy if exists "Hosts manage guests of their barbecues" on guests;
create policy "Hosts manage guests of their barbecues"
  on guests for all
  using (exists (select 1 from barbecues b where b.id = guests.barbecue_id and b.host_id = auth.uid()))
  with check (exists (select 1 from barbecues b where b.id = guests.barbecue_id and b.host_id = auth.uid()));

drop policy if exists "Hosts manage items of their barbecues" on items;
create policy "Hosts manage items of their barbecues"
  on items for all
  using (exists (select 1 from barbecues b where b.id = items.barbecue_id and b.host_id = auth.uid()))
  with check (exists (select 1 from barbecues b where b.id = items.barbecue_id and b.host_id = auth.uid()));

drop policy if exists "Hosts manage contributions of their barbecues" on contributions;
create policy "Hosts manage contributions of their barbecues"
  on contributions for all
  using (exists (select 1 from barbecues b where b.id = contributions.barbecue_id and b.host_id = auth.uid()))
  with check (exists (select 1 from barbecues b where b.id = contributions.barbecue_id and b.host_id = auth.uid()));

drop policy if exists "Hosts manage cooking sessions of their barbecues" on cooking_sessions;
create policy "Hosts manage cooking sessions of their barbecues"
  on cooking_sessions for all
  using (exists (select 1 from barbecues b where b.id = cooking_sessions.barbecue_id and b.host_id = auth.uid()))
  with check (exists (select 1 from barbecues b where b.id = cooking_sessions.barbecue_id and b.host_id = auth.uid()));

-- Acesso anônimo de convidados será exposto via Edge Functions (validando
-- share_token / guest_token) — escolha registrada na seção 11 da SPEC.md.
-- Manter RLS estrito por padrão até o RPC estar pronto.
