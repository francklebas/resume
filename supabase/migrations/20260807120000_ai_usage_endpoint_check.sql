-- La contrainte n'avait jamais été mise à jour quand les endpoints 'pdf' (export PDF) et
-- 'update' (mise à jour d'un CV via infos libres) ont été ajoutés côté code, ce qui faisait
-- échouer enforceAiUsageLimit() pour ces deux actions.
alter table public.ai_usage drop constraint if exists ai_usage_endpoint_check;
alter table public.ai_usage add constraint ai_usage_endpoint_check
  check (endpoint = any (array['tailor', 'import', 'update', 'pdf']));
