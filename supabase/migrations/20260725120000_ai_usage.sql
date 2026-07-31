-- Table d'usage servant à l'application des quotas (par utilisateur + garde-fou global).
-- Reconstruite d'après app/types/database.types.ts : la table existait en local mais
-- n'avait jamais été versionnée ni poussée sur le projet Supabase distant.

create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  endpoint text not null,
  created_at timestamptz not null default now()
);

alter table public.ai_usage enable row level security;

-- Chaque utilisateur ne peut lire et insérer que ses propres lignes.
-- Le garde-fou global côté serveur utilise le client service-role, qui contourne la RLS.
create policy "ai_usage_select_own" on public.ai_usage
  for select using (auth.uid() = user_id);

create policy "ai_usage_insert_own" on public.ai_usage
  for insert with check (auth.uid() = user_id);

-- Index pour les fenêtres glissantes de 24h (par user et global).
create index if not exists ai_usage_user_created_idx on public.ai_usage (user_id, created_at desc);
create index if not exists ai_usage_created_idx on public.ai_usage (created_at desc);
