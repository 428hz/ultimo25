-- Tabla follows (si no existe)
create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_no_self check (follower_id <> following_id)
);

alter table public.follows enable row level security;

-- SELECT para todos los autenticados
do $$
begin
  if not exists (
    select 1 from pg_policy where polname = 'follows select all' and polrelid = 'public.follows'::regclass
  ) then
    create policy "follows select all" on public.follows for select to authenticated using (true);
  end if;
end $$;

-- INSERT: sólo crear follows propios y no a sí mismo
do $$
begin
  if not exists (
    select 1 from pg_policy where polname = 'follows insert myself' and polrelid = 'public.follows'::regclass
  ) then
    create policy "follows insert myself" on public.follows for insert to authenticated
    with check (follower_id = auth.uid() and follower_id <> following_id);
  end if;
end $$;

-- DELETE: sólo borrar follows propios
do $$
begin
  if not exists (
    select 1 from pg_policy where polname = 'follows delete myself' and polrelid = 'public.follows'::regclass
  ) then
    create policy "follows delete myself" on public.follows for delete to authenticated
    using (follower_id = auth.uid());
  end if;
end $$;