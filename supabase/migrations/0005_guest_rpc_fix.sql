-- Corrige ambiguidade entre parâmetros e nomes de coluna nas RPCs de convidado.
-- O parâmetro `guest_token` colidia com a coluna `guests.guest_token`
-- (mesma coisa com `share_token` vs `barbecues.share_token`), causando
-- erros do tipo `column reference "guest_token" is ambiguous` em alguns
-- caminhos do plpgsql. Renomeamos todos os parâmetros com o prefixo `p_`.

-- Precisamos DROP antes de recriar porque a assinatura muda (nomes dos parâmetros).
drop function if exists public.upsert_guest_rsvp(text, text, text, text, text, boolean);
drop function if exists public.add_contribution(text, text, text, text, text, text);
drop function if exists public.remove_contribution(text, text, uuid);

-- 1) upsert_guest_rsvp
create or replace function public.upsert_guest_rsvp(
  p_share_token text,
  p_guest_token text,
  p_guest_name text,
  p_guest_email text,
  p_rsvp_status text,
  p_drinks_alcohol boolean
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  bbq_id uuid;
  result_token text;
begin
  if p_rsvp_status not in ('yes', 'no', 'maybe') then
    raise exception 'invalid rsvp status';
  end if;

  select id into bbq_id from barbecues where share_token = p_share_token;
  if not found then
    raise exception 'invalid share token';
  end if;

  if p_guest_token is not null then
    update guests
       set name = p_guest_name,
           email = p_guest_email,
           rsvp_status = p_rsvp_status,
           drinks_alcohol = p_drinks_alcohol
     where guest_token = p_guest_token
       and barbecue_id = bbq_id
     returning guest_token into result_token;

    if result_token is null then
      raise exception 'invalid guest token';
    end if;
  else
    insert into guests (barbecue_id, name, email, rsvp_status, drinks_alcohol)
    values (bbq_id, p_guest_name, p_guest_email, p_rsvp_status, p_drinks_alcohol)
    returning guest_token into result_token;
  end if;

  return jsonb_build_object('guest_token', result_token);
end;
$$;

grant execute on function public.upsert_guest_rsvp(text, text, text, text, text, boolean)
  to anon, authenticated;

-- 2) add_contribution
create or replace function public.add_contribution(
  p_share_token text,
  p_guest_token text,
  p_item_name text,
  p_category text,
  p_quantity_description text,
  p_notes text
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
  if p_category not in ('meat', 'drink_alcoholic', 'drink_non_alcoholic', 'wine', 'side', 'other') then
    raise exception 'invalid category';
  end if;

  select id into bbq_id from barbecues where share_token = p_share_token;
  if not found then
    raise exception 'invalid share token';
  end if;

  select id into g_id from guests
    where guest_token = p_guest_token
      and barbecue_id = bbq_id;
  if not found then
    raise exception 'invalid guest token';
  end if;

  insert into contributions (barbecue_id, guest_id, item_name, category, quantity_description, notes)
  values (bbq_id, g_id, p_item_name, p_category, p_quantity_description, p_notes)
  returning id into new_id;

  return jsonb_build_object('id', new_id);
end;
$$;

grant execute on function public.add_contribution(text, text, text, text, text, text)
  to anon, authenticated;

-- 3) remove_contribution
create or replace function public.remove_contribution(
  p_share_token text,
  p_guest_token text,
  p_contribution_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  bbq_id uuid;
  g_id uuid;
begin
  select id into bbq_id from barbecues where share_token = p_share_token;
  if not found then
    raise exception 'invalid share token';
  end if;

  select id into g_id from guests
    where guest_token = p_guest_token
      and barbecue_id = bbq_id;
  if not found then
    raise exception 'invalid guest token';
  end if;

  delete from contributions
   where id = p_contribution_id
     and guest_id = g_id
     and barbecue_id = bbq_id;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.remove_contribution(text, text, uuid) to anon, authenticated;
