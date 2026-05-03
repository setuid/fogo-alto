import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Persiste localmente quais itens da lista de compras já foram marcados
// como "tenho/comprei" por churrasco. A chave é o id do barbecue, o valor
// é um set serializado de chaves de item (ex.: `meat:picanha`, `side:farofa`).

interface ShoppingChecksState {
  checked: Record<string, string[]>;
  toggle: (barbecueId: string, key: string) => void;
  isChecked: (barbecueId: string, key: string) => boolean;
  reset: (barbecueId: string) => void;
}

export const useShoppingChecks = create<ShoppingChecksState>()(
  persist(
    (set, get) => ({
      checked: {},
      toggle: (barbecueId, key) =>
        set((s) => {
          const current = new Set(s.checked[barbecueId] ?? []);
          if (current.has(key)) current.delete(key);
          else current.add(key);
          return { checked: { ...s.checked, [barbecueId]: Array.from(current) } };
        }),
      isChecked: (barbecueId, key) => (get().checked[barbecueId] ?? []).includes(key),
      reset: (barbecueId) =>
        set((s) => {
          const next = { ...s.checked };
          delete next[barbecueId];
          return { checked: next };
        }),
    }),
    { name: 'fogo-alto.shopping-checks' },
  ),
);
