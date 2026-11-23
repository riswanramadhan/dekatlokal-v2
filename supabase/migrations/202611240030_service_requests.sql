-- Permintaan layanan berbayar: jadwal konsultasi Checkup Pro, intake Optimasi Google Business Profile,
-- dan intake Website Care. Bentuk payload divalidasi di kode (lib/layanan/request-schema.ts);
-- tabel hanya menjaga jenis, status, ukuran, dan kepemilikan pesanan.
-- Tidak ada kata sandi yang disimpan: akses website dibagikan lewat panduan admin di WhatsApp.

create table if not exists public.dc_service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  kind text not null check (kind in ('consultation', 'gbp', 'website_care')),
  status text not null default 'new' check (status in ('new', 'scheduled', 'in_progress', 'done', 'cancelled')),
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 20000),
  order_id uuid references public.dc_orders on delete set null,
  admin_note text not null default '' check (char_length(admin_note) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists dc_service_requests_user_idx on public.dc_service_requests (user_id, created_at desc);
create index if not exists dc_service_requests_status_idx on public.dc_service_requests (status, created_at desc);
-- Permintaan yang belum diproses diperbarui, bukan diduplikasi (juga melindungi dari kirim ganda).
create unique index if not exists dc_service_requests_one_new on public.dc_service_requests (user_id, kind) where status = 'new';

-- Pesanan yang ditautkan harus milik pengguna yang sama.
create or replace function public.dc_service_request_guard()
returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.order_id is not null and not exists (select 1 from public.dc_orders where id = new.order_id and user_id = new.user_id) then
    raise exception 'Order belongs to another user';
  end if;
  return new;
end $$;
drop trigger if exists dc_service_request_guard on public.dc_service_requests;
create trigger dc_service_request_guard before insert or update of order_id, user_id on public.dc_service_requests
  for each row execute function public.dc_service_request_guard();
revoke all on function public.dc_service_request_guard() from public, anon, authenticated;

alter table public.dc_service_requests enable row level security;
revoke all on public.dc_service_requests from anon, authenticated;
grant select on public.dc_service_requests to authenticated;
grant all on public.dc_service_requests to service_role;
drop policy if exists own_service_requests on public.dc_service_requests;
create policy own_service_requests on public.dc_service_requests for select to authenticated using (user_id = auth.uid());
drop policy if exists service_role_service_requests on public.dc_service_requests;
create policy service_role_service_requests on public.dc_service_requests for all to service_role using (true) with check (true);
