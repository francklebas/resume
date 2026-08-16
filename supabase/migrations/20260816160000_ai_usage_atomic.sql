-- enforceAiUsageLimit() faisait un SELECT count(*) suivi d'un INSERT séparé (deux allers-retours),
-- sans verrou ni transaction entre les deux : des requêtes concurrentes lisent le même compteur
-- avant qu'aucune n'ait inséré, et dépassent la limite (TOCTOU classique — confirmé en le
-- reproduisant : 5 requêtes passées au lieu de 4 attendues sur un burst de 10).
--
-- On remplace les 3 checks (global, IP, utilisateur) + l'insertion par une seule fonction
-- Postgres, sous un verrou advisory qui sérialise tous les appels : plus de fenêtre entre
-- lecture du compteur et écriture. Volume attendu très faible (action gatée par quota), donc
-- sérialiser entièrement les tentatives n'a aucun impact de performance perceptible.
--
-- security definer + accès restreint à service_role : cette fonction prend un user_id et une IP
-- en paramètres et bypasse la RLS, elle ne doit jamais être appelable avec la clé anon/authenticated.
create or replace function public.consume_ai_usage(
  p_user_id uuid,
  p_ip text,
  p_endpoint text,
  p_kinds text[],
  p_user_limit int,
  p_ip_limit int,
  p_global_limit int
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_since timestamptz := now() - interval '24 hours';
  v_count int;
begin
  perform pg_advisory_xact_lock(hashtext('ai_usage_quota'));

  select count(*) into v_count from public.ai_usage where created_at >= v_since;
  if v_count >= p_global_limit then
    return 'global';
  end if;

  if p_ip is not null then
    select count(*) into v_count from public.ai_usage
      where ip = p_ip and endpoint = any(p_kinds) and created_at >= v_since;
    if v_count >= p_ip_limit then
      return 'ip';
    end if;
  end if;

  select count(*) into v_count from public.ai_usage
    where user_id = p_user_id and endpoint = any(p_kinds) and created_at >= v_since;
  if v_count >= p_user_limit then
    return 'user';
  end if;

  insert into public.ai_usage (user_id, endpoint, ip) values (p_user_id, p_endpoint, p_ip);
  return 'ok';
end;
$$;

revoke all on function public.consume_ai_usage from public, anon, authenticated;
grant execute on function public.consume_ai_usage to service_role;
