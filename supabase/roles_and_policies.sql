-- Helper: ¿es moderador o admin?
create or replace function public.is_moderator_or_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = uid
      and p.role in ('moderator','admin')
  );
$$;

-- POSTS
alter table public.posts enable row level security;

-- Leer todos
drop policy if exists "posts_read_all" on public.posts;
create policy "posts_read_all"
on public.posts
for select
to authenticated, anon
using (true);

-- Crear solo el propio
drop policy if exists "posts_insert_own" on public.posts;
create policy "posts_insert_own"
on public.posts
for insert
to authenticated
with check (auth.uid() = author_id);

-- Actualizar/Borrar: autor, moderador o admin
drop policy if exists "posts_update_owner_or_mod" on public.posts;
create policy "posts_update_owner_or_mod"
on public.posts
for update
to authenticated
using (auth.uid() = author_id or public.is_moderator_or_admin(auth.uid()))
with check (auth.uid() = author_id or public.is_moderator_or_admin(auth.uid()));

drop policy if exists "posts_delete_owner_or_mod" on public.posts;
create policy "posts_delete_owner_or_mod"
on public.posts
for delete
to authenticated
using (auth.uid() = author_id or public.is_moderator_or_admin(auth.uid()));

-- COMMENTS (similar criterio)
alter table public.comments enable row level security;

drop policy if exists "comments_read_all" on public.comments;
create policy "comments_read_all"
on public.comments
for select
to authenticated, anon
using (true);

drop policy if exists "comments_insert_own" on public.comments;
create policy "comments_insert_own"
on public.comments
for insert
to authenticated
with check (auth.uid() = author_id);

drop policy if exists "comments_update_owner_or_mod" on public.comments;
create policy "comments_update_owner_or_mod"
on public.comments
for update
to authenticated
using (auth.uid() = author_id or public.is_moderator_or_admin(auth.uid()))
with check (auth.uid() = author_id or public.is_moderator_or_admin(auth.uid()));

drop policy if exists "comments_delete_owner_or_mod" on public.comments;
create policy "comments_delete_owner_or_mod"
on public.comments
for delete
to authenticated
using (auth.uid() = author_id or public.is_moderator_or_admin(auth.uid()));