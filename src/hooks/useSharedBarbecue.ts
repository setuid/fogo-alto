import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '@/lib/supabase';
import type { BarbecueRow, ContributionRow, GuestRow } from '@/types/database';

export interface SharedBarbecuePayload {
  barbecue: Pick<
    BarbecueRow,
    | 'id'
    | 'title'
    | 'description'
    | 'event_date'
    | 'location'
    | 'style'
    | 'estimated_guests'
    | 'status'
    | 'include_sides'
    | 'calc_params'
  >;
  guests: Pick<GuestRow, 'id' | 'name' | 'rsvp_status' | 'drinks_alcohol'>[];
  contributions: Pick<
    ContributionRow,
    'id' | 'guest_id' | 'item_name' | 'category' | 'quantity_description'
  >[];
}

const sharedKey = (token: string) => ['shared', token] as const;

export function useSharedBarbecue(shareToken: string | undefined) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: sharedKey(shareToken ?? ''),
    enabled: !!shareToken,
    queryFn: async (): Promise<SharedBarbecuePayload> => {
      const { data, error } = await getSupabase().rpc('get_barbecue_by_share_token', {
        token: shareToken!,
      });
      if (error) throw error;
      // RPC retorna JSON com a estrutura SharedBarbecuePayload.
      return data as unknown as SharedBarbecuePayload;
    },
  });

  // Realtime no convidado: tabela `contributions` filtrada pelo barbecue_id.
  useEffect(() => {
    if (!query.data?.barbecue.id) return;
    const id = query.data.barbecue.id;
    const channel = getSupabase()
      .channel(`shared:${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contributions', filter: `barbecue_id=eq.${id}` },
        () => qc.invalidateQueries({ queryKey: sharedKey(shareToken!) }),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'guests', filter: `barbecue_id=eq.${id}` },
        () => qc.invalidateQueries({ queryKey: sharedKey(shareToken!) }),
      )
      .subscribe();
    return () => {
      void getSupabase().removeChannel(channel);
    };
  }, [query.data?.barbecue.id, qc, shareToken]);

  return query;
}

export interface RsvpInput {
  share_token: string;
  guest_token?: string | null;
  name: string;
  email?: string | null;
  rsvp_status: 'yes' | 'no' | 'maybe';
  drinks_alcohol: boolean;
}

export function useUpsertRsvp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: RsvpInput): Promise<{ guest_token: string }> => {
      const { data, error } = await getSupabase().rpc('upsert_guest_rsvp', {
        share_token: input.share_token,
        guest_token: input.guest_token ?? null,
        guest_name: input.name,
        guest_email: input.email ?? null,
        new_rsvp_status: input.rsvp_status,
        drinks_alcohol_input: input.drinks_alcohol,
      });
      if (error) throw error;
      return data as unknown as { guest_token: string };
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: sharedKey(vars.share_token) }),
  });
}

export interface AddContributionInput {
  share_token: string;
  guest_token: string;
  item_name: string;
  category: ContributionRow['category'];
  quantity_description?: string | null;
  notes?: string | null;
}

export function useAddContribution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: AddContributionInput) => {
      const { data, error } = await getSupabase().rpc('add_contribution', {
        share_token: input.share_token,
        guest_token: input.guest_token,
        item_name_input: input.item_name,
        category_input: input.category,
        quantity_description_input: input.quantity_description ?? null,
        notes_input: input.notes ?? null,
      });
      if (error) throw error;
      return data as unknown as { id: string };
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: sharedKey(vars.share_token) }),
  });
}

export function useRemoveContribution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { share_token: string; guest_token: string; contribution_id: string }) => {
      const { error } = await getSupabase().rpc('remove_contribution', {
        share_token: input.share_token,
        guest_token: input.guest_token,
        contribution_id_input: input.contribution_id,
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: sharedKey(vars.share_token) }),
  });
}
