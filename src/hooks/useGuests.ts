import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '@/lib/supabase';
import type { ContributionRow, GuestRow } from '@/types/database';

const guestsKey = (barbecueId: string) => ['guests', barbecueId] as const;
const contribsKey = (barbecueId: string) => ['contributions', barbecueId] as const;

export function useGuests(barbecueId: string | undefined) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: guestsKey(barbecueId ?? ''),
    enabled: !!barbecueId,
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from('guests')
        .select('*')
        .eq('barbecue_id', barbecueId!)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as GuestRow[];
    },
  });

  // Realtime: invalida o cache quando convidados mudam.
  useEffect(() => {
    if (!barbecueId) return;
    const channel = getSupabase()
      .channel(`guests:${barbecueId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'guests', filter: `barbecue_id=eq.${barbecueId}` },
        () => qc.invalidateQueries({ queryKey: guestsKey(barbecueId) }),
      )
      .subscribe();
    return () => {
      void getSupabase().removeChannel(channel);
    };
  }, [barbecueId, qc]);

  return query;
}

export function useContributions(barbecueId: string | undefined) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: contribsKey(barbecueId ?? ''),
    enabled: !!barbecueId,
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from('contributions')
        .select('*')
        .eq('barbecue_id', barbecueId!)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as ContributionRow[];
    },
  });

  useEffect(() => {
    if (!barbecueId) return;
    const channel = getSupabase()
      .channel(`contributions:${barbecueId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contributions',
          filter: `barbecue_id=eq.${barbecueId}`,
        },
        () => qc.invalidateQueries({ queryKey: contribsKey(barbecueId) }),
      )
      .subscribe();
    return () => {
      void getSupabase().removeChannel(channel);
    };
  }, [barbecueId, qc]);

  return query;
}

export function useAddGuestManually(barbecueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; email?: string }) => {
      const { data, error } = await getSupabase()
        .from('guests')
        .insert({
          barbecue_id: barbecueId,
          name: input.name,
          email: input.email ?? null,
          rsvp_status: 'pending',
          drinks_alcohol: true,
        })
        .select('*')
        .single();
      if (error) throw error;
      return data as GuestRow;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: guestsKey(barbecueId) }),
  });
}
