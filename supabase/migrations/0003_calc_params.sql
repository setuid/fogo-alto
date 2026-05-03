-- Persiste os parâmetros do wizard de cálculo no próprio churrasco.
-- A engine `src/lib/calculator.ts` lê desse JSONB para reconstruir o resultado.

alter table barbecues
  add column if not exists calc_params jsonb not null default '{}'::jsonb;

-- Estrutura esperada (validação no cliente via zod):
-- {
--   "cut_ids": ["picanha", "linguica"],
--   "drinkers_count": 7,
--   "duration_hours": 5,
--   "weight_profile": "normal",
--   "drink_preferences": { "beer": true, "wine": false, "caipirinha": false, "soft_drinks": true }
-- }
