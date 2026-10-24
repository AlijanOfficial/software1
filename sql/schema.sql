-- Run this once in the Supabase SQL editor.
create extension if not exists pgcrypto;

create table settings (
  user_id uuid primary key references auth.users on delete cascade,
  business_name text not null default '', sender_name text not null default '',
  reply_to text not null default '', postal_address text not null default '', offer text not null default ''
);
create table searches (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users on delete cascade,
  query text not null, max_results int not null, found int not null default 0, created_at timestamptz not null default now()
);
create table leads (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users on delete cascade,
  search_id uuid references searches on delete set null, place_id text, name text not null, address text, phone text,
  website text, email text, rating numeric,
  status text not null default 'new' check (status in ('new','qualified','rejected','approved','contacted','replied','meeting','unsubscribed')),
  score int, issues jsonb not null default '[]', analyzed_at timestamptz, reply_class text, created_at timestamptz not null default now(),
  unique (user_id, place_id)
);
create table emails (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users on delete cascade,
  lead_id uuid not null references leads on delete cascade, subject text not null, body text not null,
  status text not null default 'draft' check (status in ('draft','sent','failed')), provider_id text, sent_at timestamptz,
  created_at timestamptz not null default now()
);
create table replies (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users on delete cascade,
  lead_id uuid not null references leads on delete cascade, body text not null, classification text, summary text,
  created_at timestamptz not null default now()
);
create table meetings (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users on delete cascade,
  lead_id uuid not null references leads on delete cascade, token text not null unique, slot timestamptz,
  status text not null default 'link_sent' check (status in ('link_sent','booked','cancelled')),
  created_at timestamptz not null default now()
);
create table suppression (
  user_id uuid not null references auth.users on delete cascade, email text not null, created_at timestamptz not null default now(),
  primary key (user_id, email)
);
create table usage (
  id bigserial primary key, user_id uuid not null references auth.users on delete cascade, kind text not null,
  created_at timestamptz not null default now()
);
create index on usage (user_id, kind, created_at);
create index on leads (user_id, status);

-- Row Level Security: every customer can only ever see and change their own rows.
do $$
declare t text;
begin
  foreach t in array array['settings','searches','leads','emails','replies','meetings','suppression','usage'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "own rows" on %I for all using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
  end loop;
end $$;
