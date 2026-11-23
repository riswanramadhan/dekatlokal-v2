-- Produk berbayar DekatLokal (pembayaran manual): pesanan, hak akses, dan trial sekali pakai.
-- Alur: pengguna memesan -> bayar via WhatsApp/transfer -> admin mengaktifkan -> hak akses tercatat.
-- Katalog produk & harga ada di lib/commerce/catalog.ts; tabel hanya menyimpan kode produk.

create table if not exists public.dc_orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('DL-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  user_id uuid not null references auth.users on delete cascade,
  product_code text not null check (product_code in ('site_upgrade', 'ai_admin_monthly', 'checkup_pro', 'gbp_optimization', 'website_care_monthly')),
  amount integer not null check (amount >= 0),
  status text not null default 'pending' check (status in ('pending', 'active', 'cancelled')),
  resource_id uuid,
  customer_note text not null default '' check (char_length(customer_note) <= 1000),
  admin_note text not null default '' check (char_length(admin_note) <= 1000),
  activated_at timestamptz,
  activated_by uuid references auth.users on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists dc_orders_user_idx on public.dc_orders (user_id, created_at desc);
create index if not exists dc_orders_status_idx on public.dc_orders (status, created_at desc);

create table if not exists public.dc_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  feature text not null check (feature in ('site_publish', 'ai_admin', 'checkup_pro', 'gbp', 'website_care')),
  -- Untuk fitur per-website (mis. AI Admin di situs tertentu); null = berlaku untuk akun.
  resource_id uuid,
  source text not null check (source in ('trial', 'order')),
  order_id uuid references public.dc_orders on delete set null,
  starts_at timestamptz not null default now(),
  -- null = tanpa batas waktu (mis. pembelian sekali bayar).
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  check (expires_at is null or expires_at > starts_at)
);
create index if not exists dc_entitlements_user_idx on public.dc_entitlements (user_id, feature);
-- Trial hanya sekali per akun per fitur.
create unique index if not exists dc_entitlements_one_trial on public.dc_entitlements (user_id, feature) where source = 'trial';

alter table public.dc_orders enable row level security;
alter table public.dc_entitlements enable row level security;
revoke all on public.dc_orders, public.dc_entitlements from anon, authenticated;
grant select on public.dc_orders, public.dc_entitlements to authenticated;
grant all on public.dc_orders, public.dc_entitlements to service_role;
drop policy if exists own_orders on public.dc_orders;
create policy own_orders on public.dc_orders for select to authenticated using (user_id = auth.uid());
drop policy if exists own_entitlements on public.dc_entitlements;
create policy own_entitlements on public.dc_entitlements for select to authenticated using (user_id = auth.uid());

-- Trial sekali pakai: mengembalikan hak akses trial yang sudah ada atau membuat yang baru.
create or replace function public.dc_start_trial(p_user uuid, p_feature text, p_resource uuid, p_days integer)
returns public.dc_entitlements
language plpgsql security definer set search_path = '' as $$
declare result public.dc_entitlements;
begin
  if p_days is null or p_days < 1 or p_days > 31 then raise exception 'Invalid trial length'; end if;
  if not exists (select 1 from public.dc_profiles where user_id = p_user and role = 'umkm') then raise exception 'UMKM account required'; end if;
  insert into public.dc_entitlements (user_id, feature, resource_id, source, expires_at)
  values (p_user, p_feature, p_resource, 'trial', now() + make_interval(days => p_days))
  on conflict (user_id, feature) where source = 'trial' do nothing;
  select * into result from public.dc_entitlements where user_id = p_user and feature = p_feature and source = 'trial';
  return result;
end $$;

-- Aktivasi pesanan oleh admin. Langganan diperpanjang dari masa aktif terakhir bila masih berjalan.
create or replace function public.dc_activate_order(p_order uuid, p_actor uuid, p_feature text, p_days integer, p_admin_note text)
returns public.dc_entitlements
language plpgsql security definer set search_path = '' as $$
declare o public.dc_orders; base timestamptz; result public.dc_entitlements;
begin
  if not exists (select 1 from public.dc_profiles where user_id = p_actor and role = 'admin') then raise exception 'Forbidden'; end if;
  select * into o from public.dc_orders where id = p_order for update;
  if not found then raise exception 'Order not found'; end if;
  if o.status <> 'pending' then raise exception 'Order already processed'; end if;
  if p_days is not null and (p_days < 1 or p_days > 400) then raise exception 'Invalid period'; end if;

  select greatest(now(), coalesce(max(expires_at), now())) into base
  from public.dc_entitlements
  where user_id = o.user_id and feature = p_feature and coalesce(resource_id::text, '') = coalesce(o.resource_id::text, '') and expires_at is not null;

  insert into public.dc_entitlements (user_id, feature, resource_id, source, order_id, starts_at, expires_at)
  values (o.user_id, p_feature, o.resource_id, 'order', o.id, now(),
          case when p_days is null then null else base + make_interval(days => p_days) end)
  returning * into result;

  update public.dc_orders
  set status = 'active', activated_at = now(), activated_by = p_actor, admin_note = coalesce(p_admin_note, ''), updated_at = now()
  where id = o.id;
  return result;
end $$;

revoke all on function public.dc_start_trial(uuid, text, uuid, integer) from public, anon, authenticated;
revoke all on function public.dc_activate_order(uuid, uuid, text, integer, text) from public, anon, authenticated;
grant execute on function public.dc_start_trial(uuid, text, uuid, integer) to service_role;
grant execute on function public.dc_activate_order(uuid, uuid, text, integer, text) to service_role;
