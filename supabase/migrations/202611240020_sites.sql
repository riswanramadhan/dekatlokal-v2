-- Website gratis dari template + AI Admin per website.
-- Isi website (content) divalidasi di kode (lib/sites/schema.ts); tabel hanya menjaga bentuk dasar.
-- Batas 3 website per akun dijaga di kode (lib/sites/repository.ts).

create table if not exists public.dc_sites (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users on delete cascade,
  slug text not null unique check (char_length(slug) between 3 and 40 and slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$' and position('--' in slug) = 0),
  template_code text not null check (template_code ~ '^[a-z0-9-]{2,40}$'),
  category text not null check (category ~ '^[a-z0-9-]{2,40}$'),
  content jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object' and pg_column_size(content) <= 100000),
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  ai jsonb not null default '{"enabled": true, "welcome": "", "extraKnowledge": ""}'::jsonb check (jsonb_typeof(ai) = 'object' and pg_column_size(ai) <= 20000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status = 'draft' or published_at is not null)
);
create index if not exists dc_sites_owner_idx on public.dc_sites (owner_id, created_at);

create table if not exists public.dc_site_conversations (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.dc_sites on delete cascade,
  session_id text not null check (session_id ~ '^[A-Za-z0-9_-]{8,64}$'),
  messages jsonb not null default '[]'::jsonb check (jsonb_typeof(messages) = 'array'),
  message_count integer not null default 0 check (message_count >= 0),
  last_message text not null default '' check (char_length(last_message) <= 600),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, session_id)
);
create index if not exists dc_site_conversations_site_idx on public.dc_site_conversations (site_id, updated_at desc);

alter table public.dc_sites enable row level security;
alter table public.dc_site_conversations enable row level security;
revoke all on public.dc_sites, public.dc_site_conversations from anon, authenticated;
grant select on public.dc_sites, public.dc_site_conversations to authenticated;
grant all on public.dc_sites, public.dc_site_conversations to service_role;
drop policy if exists own_sites on public.dc_sites;
create policy own_sites on public.dc_sites for select to authenticated using (owner_id = auth.uid());
drop policy if exists own_site_conversations on public.dc_site_conversations;
create policy own_site_conversations on public.dc_site_conversations for select to authenticated
  using (exists (select 1 from public.dc_sites s where s.id = site_id and s.owner_id = auth.uid()));

-- Mencatat satu giliran chat (pesan pelanggan + jawaban AI) secara atomik.
-- Riwayat disimpan maksimal 100 pesan terakhir per percakapan; message_count tetap menghitung total.
create or replace function public.dc_log_site_turn(p_site uuid, p_session text, p_user text, p_reply text, p_model text)
returns void
language plpgsql security definer set search_path = '' as $$
declare turn jsonb;
begin
  if p_session is null or p_session !~ '^[A-Za-z0-9_-]{8,64}$' then raise exception 'Invalid session'; end if;
  if coalesce(btrim(p_user), '') = '' or coalesce(btrim(p_reply), '') = '' then raise exception 'Empty turn'; end if;
  turn := jsonb_build_array(
    jsonb_build_object('role', 'user', 'content', left(p_user, 600), 'at', now()),
    jsonb_build_object('role', 'assistant', 'content', left(p_reply, 2000), 'at', now(), 'model', left(coalesce(p_model, ''), 60))
  );
  insert into public.dc_site_conversations as c (site_id, session_id, messages, message_count, last_message)
  values (p_site, p_session, turn, 2, left(p_user, 600))
  on conflict (site_id, session_id) do update set
    messages = (
      select coalesce(jsonb_agg(t.m order by t.i), '[]'::jsonb)
      from (
        select x.m, x.i from jsonb_array_elements(c.messages || excluded.messages) with ordinality as x(m, i)
        order by x.i desc limit 100
      ) t
    ),
    message_count = c.message_count + 2,
    last_message = excluded.last_message,
    updated_at = now();
end $$;

revoke all on function public.dc_log_site_turn(uuid, text, text, text, text) from public, anon, authenticated;
grant execute on function public.dc_log_site_turn(uuid, text, text, text, text) to service_role;
