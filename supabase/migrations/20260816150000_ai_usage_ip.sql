-- Le quota par utilisateur ne protège rien face à un compte anonyme (signInAnonymously) :
-- une nouvelle identité anonyme est gratuite (fenêtre privée ou storage vidé), ce qui vide le
-- garde-fou global (50/24h) au profit d'un seul visiteur. On ajoute un quota par IP, plus coûteux
-- à contourner, en complément du quota par utilisateur existant.
alter table public.ai_usage add column if not exists ip text;

create index if not exists ai_usage_ip_created_idx on public.ai_usage (ip, created_at desc);
