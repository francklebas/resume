-- Permet d'exempter certains comptes (uniquement le créateur du SaaS) des quotas IA/PDF de la
-- démo publique (voir server/utils/ai-usage.ts). Pas de policy insert/update : seul le service-role
-- (ou une requête SQL manuelle côté admin) peut positionner is_admin, jamais le client.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select using (auth.uid() = user_id);
