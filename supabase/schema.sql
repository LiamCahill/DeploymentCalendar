-- ============================================================
-- Family Deployment Calendar — Supabase Schema
-- Run this in the Supabase SQL Editor for your project.
-- ============================================================

-- 1. app_config table (stores the hashed passphrase)
create table if not exists app_config (
  key   text primary key,
  value text not null
);

-- Insert the passphrase hash. Replace the value with:
--   SELECT crypt('your-passphrase', gen_salt('bf'));
-- You can run that query in the Supabase SQL editor first to get the hash.
-- Example (DO NOT use this literal value in production):
-- insert into app_config (key, value)
-- values ('passphrase_hash', crypt('family2026', gen_salt('bf')));

-- 2. posts table
create table if not exists posts (
  id          uuid primary key default gen_random_uuid(),
  date        date not null,
  author_id   uuid not null,
  author_name text not null,
  author_color text not null,
  content     text not null default '',
  photo_paths text[] not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 3. Unique constraint: one post per person per day
alter table posts
  add constraint posts_date_author_unique unique (date, author_id);

-- 4. Updated_at trigger
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger posts_updated_at
  before update on posts
  for each row execute function update_updated_at();

-- ============================================================
-- Passphrase Verification Function
-- Returns true if the input matches the stored bcrypt hash.
-- SECURITY DEFINER so the hash value is never exposed to the client.
-- ============================================================

create or replace function verify_passphrase(input_passphrase text)
returns boolean
language sql
security definer
stable
as $$
  select value = crypt(input_passphrase, value)
  from app_config
  where key = 'passphrase_hash';
$$;

-- ============================================================
-- RLS Policies
-- ============================================================

-- Grant execute on verify_passphrase to authenticated and anon roles
grant execute on function verify_passphrase(text) to authenticated;

-- Enable RLS on both tables
alter table app_config enable row level security;
alter table posts enable row level security;

-- app_config: authenticated sessions can read (needed for passphrase check)
create policy "Authenticated users can read app_config"
  on app_config for select
  to authenticated
  using (true);

-- posts: authenticated sessions can do everything
create policy "Authenticated users can read posts"
  on posts for select
  to authenticated
  using (true);

create policy "Authenticated users can insert posts"
  on posts for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update posts"
  on posts for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete posts"
  on posts for delete
  to authenticated
  using (true);

-- ============================================================
-- Storage
-- ============================================================

-- Create the private bucket (run via Supabase dashboard or API):
-- Dashboard → Storage → New bucket → Name: "post-photos" → Private (unchecked public)

-- Storage RLS (add these in the Supabase dashboard under Storage → Policies,
-- or via SQL if using the storage schema):

-- Allow authenticated users to upload objects
-- insert policy: bucket_id = 'post-photos' AND auth.role() = 'authenticated'

-- Allow authenticated users to read any object (for signed URLs)
-- select policy: bucket_id = 'post-photos' AND auth.role() = 'authenticated'

-- Allow authenticated users to delete any object (honor-system editing)
-- delete policy: bucket_id = 'post-photos' AND auth.role() = 'authenticated'
