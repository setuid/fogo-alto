-- Funções RPC `SECURITY DEFINER` para acesso anônimo de convidados.
-- O cliente (anon key) chama essas funções via supabase-js `.rpc(...)`.
-- A validação acontece dentro da função: o token é a credencial.

-- 1) get_barbecue_by_share_token: retorna barbecue + guests + contributions
create or replace function public.get_barbecue_by_share_token(token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  bbq record;
  guests_json jsonb;
  contributions_json jsonb;
begin
  select id, title, description, event_date, location, style, estimated_guests, status, include_sides, calc_params
    into bbq
  from barbecues
  where share_token = token;

  if not found then
    raise exception 'invalid share token';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
      'id', g.id,
      'name', g.name,
      'rsvp_status', g.rsvp_status,
      'drinks_alcohol', g.drinks_alcohol
    )), '[]'::jsonb) into guests_json
  from guests g where g.barbecue_id = bbq.id;

  select coalesce(jsonb_agg(jsonb_build_object(
      'id', c.id,
      'guest_id', c.guest_id,
      'item_name', c.item_name,
      'category', c.category,
      'quantity_description', c.quantity_description
    )), '[]'::jsonb) into contributions_json
  from contributions c where c.barbecue_id = bbq.id;

  return jsonb_build_object(
    'barbecue', jsonb_build_object(
      'id', bbq.id,
      'title', bbq.title,
      'description', bbq.description,
      'event_date', bbq.event_date,
      'location', bbq.location,
      'style', bbq.style,
      'estimated_guests', bbq.estimated_guests,
      'status', bbq.status,
      'include_sides', bbq.include_sides,
      'calc_params', bbq.calc_params
    ),
    'guests', guests_json,
    'contributions', contributions_json
  );
end;
$$;

grant execute on function public.get_barbecue_by_share_token(text) to anon, authenticated;

-- 2) upsert_guest_rsvp: cria convidado novo (sem token) ou atualiza um existente (com token).
-- Retorna { guest_token } para o cliente armazenar em localStorage.
create or replace function public.upsert_guest_rsvp(
  share_token text,
  guest_token text,
  guest_name text,
  guest_email text,
  new_rsvp_status text,
  drinks_alcohol_input boolean
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  bbq_id uuid;
  result_token text;
begin
  if new_rsvp_status not in ('yes', 'no', 'maybe') then
    raise exception 'invalid rsvp status';
  end if;

  select id into bbq_id from barbecues where barbecues.share_token = upsert_guest_rsvp.share_token;
  if not found then
    raise exception 'invalid share token';
  end if;

  if guest_token is not null then
    update guests
       set name = guest_name,
           email = guest_email,
           rsvp_status = new_rsvp_status,
           drinks_alcohol = drinks_alcohol_input
     where guests.guest_token = upsert_guest_rsvp.guest_token
       and guests.barbecue_id = bbq_id
     returning guests.guest_token into result_token;

    if result_token is null then
      raise exception 'invalid guest token';
    end if;
  else
    insert into guests (barbecue_id, name, email, rsvp_status, drinks_alcohol)
    values (bbq_id, guest_name, guest_email, new_rsvp_status, drinks_alcohol_input)
    returning guest_token into result_token;
  end if;

  return jsonb_build_object('guest_token', result_token);
end;
$$;

grant execute on function public.upsert_guest_rsvp(text, text, text, text, text, boolean)
  to anon, authenticated;

-- 3) add_contribution: adiciona contribuição autenticando o convidado pelo guest_token.
create or replace function public.add_contribution(
  share_token text,
  guest_token text,
  item_name_input text,
  category_input text,
  quantity_description_input text,
  notes_input text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  bbq_id uuid;
  g_id uuid;
  new_id uuid;
begin
  if category_input not in ('meat', 'drink_alcoholic', 'drink_non_alcoholic', 'wine', 'side', 'other') then
    raise exception 'invalid category';
  end if;

  select id into bbq_id from barbecues where barbecues.share_token = add_contribution.share_token;
  if not found then
    raise exception 'invalid share token';
  end if;

  select id into g_id from guests
    where guests.guest_token = add_contribution.guest_token
      and guests.barbecue_id = bbq_id;
  if not found then
    raise exception 'invalid guest token';
  end if;

  insert into contributions (barbecue_id, guest_id, item_name, category, quantity_description, notes)
  values (bbq_id, g_id, item_name_input, category_input, quantity_description_input, notes_input)
  returning id into new_id;

  return jsonb_build_object('id', new_id);
end;
$$;

grant execute on function public.add_contribution(text, text, text, text, text, text)
  to anon, authenticated;

-- 4) remove_contribution: convidado remove uma contribuição própria.
create or replace function public.remove_contribution(
  share_token text,
  guest_token text,
  contribution_id_input uuid
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  bbq_id uuid;
  g_id uuid;
begin
  select id into bbq_id from barbecues where barbecues.share_token = remove_contribution.share_token;
  if not found then
    raise exception 'invalid share token';
  end if;

  select id into g_id from guests
    where guests.guest_token = remove_contribution.guest_token
      and guests.barbecue_id = bbq_id;
  if not found then
    raise exception 'invalid guest token';
  end if;

  delete from contributions
   where id = contribution_id_input
     and guest_id = g_id
     and barbecue_id = bbq_id;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.remove_contribution(text, text, uuid) to anon, authenticated;

-- Habilitar realtime nas tabelas relevantes (Supabase usa publication supabase_realtime).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'guests'
  ) then
    alter publication supabase_realtime add table guests;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'contributions'
  ) then
    alter publication supabase_realtime add table contributions;
  end if;
exception when undefined_object then
  -- publication can be missing in self-hosted variants; ignore.
  null;
end $$;
