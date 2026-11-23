-- Optional System Usability Scale (SUS) per usability observation.
-- Only the ten raw answers (1–5) are written; the 0–100 score is derived by the database
-- with the standard formula, so a stored score can never disagree with its answers.
create or replace function public.dc_sus_score(p jsonb) returns double precision
language sql immutable set search_path = '' as $$
 select case
   when p is null or jsonb_typeof(p) <> 'array' or jsonb_array_length(p) <> 10 then null
   when exists(select 1 from jsonb_array_elements(p) e(v) where jsonb_typeof(e.v) <> 'number' or e.v::text !~ '^[1-5]$') then null
   else (select sum(case when t.ord % 2 = 1 then (t.v::text)::int - 1 else 5 - (t.v::text)::int end) * 2.5
         from jsonb_array_elements(p) with ordinality as t(v, ord))
 end
$$;
revoke all on function public.dc_sus_score(jsonb) from public, anon, authenticated;
grant execute on function public.dc_sus_score(jsonb) to service_role;

alter table public.dc_usability_tests add column if not exists sus_responses jsonb;
alter table public.dc_usability_tests add column if not exists sus_score double precision generated always as (public.dc_sus_score(sus_responses)) stored;
alter table public.dc_usability_tests drop constraint if exists dc_usability_sus_valid;
alter table public.dc_usability_tests add constraint dc_usability_sus_valid check (sus_responses is null or sus_score is not null);
