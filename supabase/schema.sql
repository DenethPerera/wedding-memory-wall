-- Wedding Memory Wall -- run this once in the Supabase SQL editor
-- (Project -> SQL Editor -> New query -> paste all -> Run).

-- 1. Table for every uploaded memory. Rows are only ever written by the
--    server (service role key), never directly by guest browsers.
create table if not exists public.uploads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  media_type text not null check (media_type in ('photo', 'video', 'voice')),
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null default 0,
  guest_name text,
  caption text,
  duration_seconds numeric
);

create index if not exists uploads_created_at_idx on public.uploads (created_at desc);
create index if not exists uploads_media_type_idx on public.uploads (media_type);

-- 2. Row Level Security: readable by anyone holding the anon key (the app
--    itself is gated by the PIN screen before a visitor ever reaches a page
--    that queries this table), but only the service role can insert /
--    update / delete. This also lets Supabase Realtime broadcast INSERTs to
--    every guest's browser on the /wall page.
alter table public.uploads enable row level security;

drop policy if exists "Public can read uploads" on public.uploads;
create policy "Public can read uploads"
  on public.uploads for select
  to anon, authenticated
  using (true);

-- No insert/update/delete policy is created for anon/authenticated, so only
-- the service role (which bypasses RLS) can write. Do not add one.

-- 3. Enable Realtime for this table.
-- In the Supabase dashboard: Database -> Replication -> toggle "uploads" on
-- for the "supabase_realtime" publication. Or run:
alter publication supabase_realtime add table public.uploads;

-- 4. Storage bucket for the actual photo/video/audio files.
-- Public-read (fast, CDN-served, no signing needed to *view* media) but
-- writes only happen via short-lived signed upload URLs issued by our own
-- server after checking the PIN cookie -- guests never get a key that lets
-- them write directly.
insert into storage.buckets (id, name, public)
values ('wedding-media', 'wedding-media', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read wedding media" on storage.objects;
create policy "Public can read wedding media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'wedding-media');

-- No insert/update/delete storage policy is created for anon/authenticated.
-- Uploads only succeed through a signed upload URL minted by the service
-- role from app/api/uploads/sign, which itself requires the PIN cookie.
