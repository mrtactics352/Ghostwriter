create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  xp integer not null default 0 check (xp >= 0),
  level integer not null default 1 check (level >= 1),
  current_streak integer not null default 0 check (current_streak >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default '',
  body jsonb not null default '{}'::jsonb,
  current_word_count integer not null default 0 check (current_word_count >= 0),
  total_words_aim integer not null default 0 check (total_words_aim >= 0),
  start_date date,
  end_date date,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  icon text,
  xp_reward integer not null default 0 check (xp_reward >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_id uuid not null references public.achievements (id) on delete cascade,
  unlocked_at timestamptz not null default timezone('utc', now()),
  unique (user_id, achievement_id)
);

create index if not exists drafts_user_id_idx on public.drafts (user_id);
create index if not exists user_achievements_user_id_idx on public.user_achievements (user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists drafts_set_updated_at on public.drafts;
create trigger drafts_set_updated_at
before update on public.drafts
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.drafts enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
on public.profiles
for delete
using (auth.uid() = id);

drop policy if exists "drafts_select_own" on public.drafts;
create policy "drafts_select_own"
on public.drafts
for select
using (auth.uid() = user_id);

drop policy if exists "drafts_insert_own" on public.drafts;
create policy "drafts_insert_own"
on public.drafts
for insert
with check (auth.uid() = user_id);

drop policy if exists "drafts_update_own" on public.drafts;
create policy "drafts_update_own"
on public.drafts
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "drafts_delete_own" on public.drafts;
create policy "drafts_delete_own"
on public.drafts
for delete
using (auth.uid() = user_id);

drop policy if exists "achievements_select_all" on public.achievements;
create policy "achievements_select_all"
on public.achievements
for select
using (true);

drop policy if exists "user_achievements_select_own" on public.user_achievements;
create policy "user_achievements_select_own"
on public.user_achievements
for select
using (auth.uid() = user_id);

drop policy if exists "user_achievements_insert_own" on public.user_achievements;
create policy "user_achievements_insert_own"
on public.user_achievements
for insert
with check (auth.uid() = user_id);

comment on table public.profiles is 'Ghostwriter user profile stats for XP and streak progression.';
comment on table public.drafts is 'Supabase-backed story drafts stored as TipTap JSON.';
comment on table public.achievements is 'Catalog of unlockable writing achievements.';
comment on table public.user_achievements is 'Achievement unlocks scoped to the authenticated user.';
