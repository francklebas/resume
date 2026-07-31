-- Schéma applicatif reconstruit d'après app/types/database.types.ts : ces tables
-- existaient en local mais n'avaient jamais été versionnées ni poussées sur le distant.
-- Défauts et user_id = auth.uid() alignés sur le comportement attendu par le code serveur
-- (les inserts omettent user_id ; account/delete compte sur la cascade DB).

create extension if not exists moddatetime schema extensions;

-- ── cvs ────────────────────────────────────────────────────────────────────
create table if not exists public.cvs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  slug text not null unique, -- unique global : /print et /download résolvent par slug seul (service-role, sans user)
  name text not null,
  content jsonb not null,
  is_base boolean not null default false,
  match_score numeric,
  match_summary text,
  pdf_key text,
  pdf_generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cvs enable row level security;

drop policy if exists cvs_select_own on public.cvs;
drop policy if exists cvs_insert_own on public.cvs;
drop policy if exists cvs_update_own on public.cvs;
drop policy if exists cvs_delete_own on public.cvs;
create policy cvs_select_own on public.cvs for select using (auth.uid() = user_id);
create policy cvs_insert_own on public.cvs for insert with check (auth.uid() = user_id);
create policy cvs_update_own on public.cvs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy cvs_delete_own on public.cvs for delete using (auth.uid() = user_id);

create index if not exists cvs_user_idx on public.cvs (user_id);

drop trigger if exists cvs_set_updated_at on public.cvs;
create trigger cvs_set_updated_at before update on public.cvs
  for each row execute procedure extensions.moddatetime (updated_at);

-- ── cv_snapshots ───────────────────────────────────────────────────────────
create table if not exists public.cv_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  cv_id uuid not null references public.cvs (id) on delete cascade,
  name text not null,
  content jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.cv_snapshots enable row level security;

drop policy if exists cv_snapshots_select_own on public.cv_snapshots;
drop policy if exists cv_snapshots_insert_own on public.cv_snapshots;
drop policy if exists cv_snapshots_update_own on public.cv_snapshots;
drop policy if exists cv_snapshots_delete_own on public.cv_snapshots;
create policy cv_snapshots_select_own on public.cv_snapshots for select using (auth.uid() = user_id);
create policy cv_snapshots_insert_own on public.cv_snapshots for insert with check (auth.uid() = user_id);
create policy cv_snapshots_update_own on public.cv_snapshots for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy cv_snapshots_delete_own on public.cv_snapshots for delete using (auth.uid() = user_id);

create index if not exists cv_snapshots_cv_idx on public.cv_snapshots (cv_id);
create index if not exists cv_snapshots_user_idx on public.cv_snapshots (user_id);
