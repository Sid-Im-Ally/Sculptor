-- Sculptor — Supabase schema, row-level security and the signup trigger.
-- Safe to re-run: every statement is guarded, so running this against the
-- existing project will not drop data or duplicate objects.
--
-- Paste into the Supabase SQL editor and run.

-- ============ tables ============
-- profiles is keyed on the auth user id itself; sets and mind reference it
-- through user_id. t is epoch milliseconds, matching Date.now() in the app.

create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  username   text unique,
  sex        text,
  age        integer,
  height     integer,
  bw         numeric,
  sport      text,
  assessed   boolean default false,
  created_at timestamptz not null default now()
);

create table if not exists public.sets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  ex         text not null,
  w          numeric,
  r          integer,
  s          integer,
  t          bigint not null,
  src        text,
  created_at timestamptz not null default now()
);

create table if not exists public.mind (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  kind       text not null,
  skill      text,
  drill      integer,
  secs       integer,
  t          bigint not null,
  created_at timestamptz not null default now()
);

create index if not exists sets_user_t_idx on public.sets (user_id, t);
create index if not exists mind_user_t_idx on public.mind (user_id, t);

-- ============ row-level security ============
-- With RLS on and no policy matching, Postgres denies the row. Each policy
-- below pins the row to the caller, so a signed-in user can only ever reach
-- their own data and the anon key alone reaches nothing.

alter table public.profiles enable row level security;
alter table public.sets     enable row level security;
alter table public.mind     enable row level security;

drop policy if exists "profiles are self service" on public.profiles;
create policy "profiles are self service" on public.profiles
  for all to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "sets are self service" on public.sets;
create policy "sets are self service" on public.sets
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "mind is self service" on public.mind;
create policy "mind is self service" on public.mind
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============ profile on signup ============
-- The app passes the username as options.data.username in signUp, which lands
-- in raw_user_meta_data. security definer lets the trigger write the profile
-- row before the new user has a session of their own.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, nullif(new.raw_user_meta_data ->> 'username', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
