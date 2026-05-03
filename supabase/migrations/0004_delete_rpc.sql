-- Defensivo: RPC SECURITY DEFINER pra excluir um churrasco.
--
-- Existe porque a RLS via EXISTS nas tabelas filhas (guests, items,
-- contributions, cooking_sessions) pode bloquear o cascade do delete em
-- alguns cenários — quando a deleção do parent dentro da mesma transação
-- faz o EXISTS subsequente retornar false. A função roda com privilégios
-- do owner e checa explicitamente que o caller é o host antes de excluir.

create or replace function public.delete_barbecue(barbecue_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  is_host boolean;
begin
  select exists (
    select 1 from barbecues
    where id = barbecue_id and host_id = auth.uid()
  ) into is_host;

  if not is_host then
    raise exception 'not authorized to delete this barbecue';
  end if;

  delete from barbecues where id = barbecue_id;
end;
$$;

grant execute on function public.delete_barbecue(uuid) to authenticated;
