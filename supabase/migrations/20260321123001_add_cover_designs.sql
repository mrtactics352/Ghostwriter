create table if not exists public.cover_designs (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid not null unique references public.drafts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  subtitle text,
  author text,
  layout text,
  typography text,
  background_color text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
