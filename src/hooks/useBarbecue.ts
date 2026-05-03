import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '@/lib/supabase';
import type { BarbecueRow, CalcParams } from '@/types/database';
import type { BarbecueStyle } from '@/types/domain';
import { useAuth } from '@/lib/auth';

const KEYS = {
  list: ['barbecues'] as const,
  detail: (id: string) => ['barbecues', id] as const,
};

export function useBarbecues() {
  const { user, configured } = useAuth();
  return useQuery({
    queryKey: [...KEYS.list, user?.id],
    enabled: configured && !!user,
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from('barbecues')
        .select('*')
        .order('event_date', { ascending: false });
      if (error) throw error;
      return data as BarbecueRow[];
    },
  });
}

export function useBarbecue(id: string | undefined) {
  const { configured } = useAuth();
  return useQuery({
    queryKey: KEYS.detail(id ?? ''),
    enabled: configured && !!id,
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from('barbecues')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as BarbecueRow;
    },
  });
}

export type CreateBarbecueInput = {
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  style: BarbecueStyle;
  estimated_guests: number;
  include_sides: boolean;
  notes?: string;
  calc_params: CalcParams;
};

export function useCreateBarbecue() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: CreateBarbecueInput): Promise<BarbecueRow> => {
      if (!user) throw new Error('not authenticated');
      const { data, error } = await getSupabase()
        .from('barbecues')
        .insert({
          host_id: user.id,
          title: input.title,
          description: input.description ?? null,
          event_date: input.event_date,
          location: input.location ?? null,
          style: input.style,
          estimated_guests: input.estimated_guests,
          status: 'planning',
          include_sides: input.include_sides,
          notes: input.notes ?? null,
          calc_params: input.calc_params,
        })
        .select('*')
        .single();
      if (error) throw error;
      return data as BarbecueRow;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list }),
  });
}

export function useUpdateBarbecue(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<BarbecueRow>) => {
      const { data, error } = await getSupabase()
        .from('barbecues')
        .update(patch)
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return data as BarbecueRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
      qc.invalidateQueries({ queryKey: KEYS.list });
    },
  });
}

export function useDeleteBarbecue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabase();

      // Caminho preferido: RPC SECURITY DEFINER (migration 0004). Evita
      // qualquer ciladinha de RLS no cascade das tabelas filhas. Se a
      // function não existir no projeto (migração ainda não aplicada),
      // caímos pro DELETE direto.
      const { error: rpcError } = await supabase.rpc('delete_barbecue', {
        barbecue_id: id,
      });

      if (rpcError) {
        const msg = rpcError.message ?? '';
        const fnMissing =
          rpcError.code === 'PGRST202' ||
          /function .*delete_barbecue/i.test(msg) ||
          /could not find/i.test(msg);

        if (!fnMissing) throw rpcError;

        // Fallback: DELETE direto. `.select()` traz as linhas removidas,
        // o que nos permite detectar quando a RLS bloqueia silenciosamente
        // (zero linhas afetadas, sem erro).
        const { data, error } = await supabase
          .from('barbecues')
          .delete()
          .eq('id', id)
          .select('id');
        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error(
            'Não foi possível excluir o churrasco. Verifique se você é o anfitrião.',
          );
        }
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list }),
  });
}

export function useDuplicateBarbecue() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (sourceId: string): Promise<BarbecueRow> => {
      if (!user) throw new Error('not authenticated');
      const supabase = getSupabase();
      const { data: source, error: sourceErr } = await supabase
        .from('barbecues')
        .select('*')
        .eq('id', sourceId)
        .single();
      if (sourceErr) throw sourceErr;
      const src = source as BarbecueRow;
      const { data, error } = await supabase
        .from('barbecues')
        .insert({
          host_id: user.id,
          title: `Cópia de ${src.title}`,
          description: src.description,
          event_date: src.event_date,
          location: src.location,
          style: src.style,
          estimated_guests: src.estimated_guests,
          status: 'planning',
          include_sides: src.include_sides,
          notes: src.notes,
          calc_params: src.calc_params,
        })
        .select('*')
        .single();
      if (error) throw error;
      return data as BarbecueRow;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list }),
  });
}
