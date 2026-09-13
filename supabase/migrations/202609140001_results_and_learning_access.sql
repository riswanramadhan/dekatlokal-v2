-- Turn the three approved email-free expert assignments into the model input,
-- and grant each UMKM a single seven-day learning window after a final checkup.

create table if not exists public.dc_learning_access (
  user_id uuid primary key references auth.users on delete cascade,
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now(),
  check(expires_at > starts_at)
);
alter table public.dc_learning_access enable row level security;
revoke all on public.dc_learning_access from anon, authenticated;
grant select on public.dc_learning_access to authenticated;
grant all on public.dc_learning_access to service_role;
drop policy if exists own_learning_access on public.dc_learning_access;
create policy own_learning_access on public.dc_learning_access for select to authenticated using(user_id=auth.uid());

create or replace function public.dc_ensure_learning_access(p_user uuid) returns public.dc_learning_access
language plpgsql security definer set search_path='' as $$
declare result public.dc_learning_access;
begin
  if not exists(select 1 from auth.users where id=p_user)
     or not exists(select 1 from public.dc_profiles where user_id=p_user and role='umkm')
     or not exists(
       select 1 from public.dc_assessment_sessions a
       join public.dc_umkm_profiles u on u.id=a.umkm_id
       where u.owner_id=p_user and a.status='submitted'
     )
  then raise exception 'Final checkup required'; end if;

  insert into public.dc_learning_access(user_id) values(p_user)
  on conflict(user_id) do nothing;
  select * into result from public.dc_learning_access where user_id=p_user;
  return result;
end $$;

-- The email-free expert migration intentionally allows expert_user_id to be
-- null. Uniqueness must therefore be based on the three assignment IDs.
create or replace function public.dc_freeze_model(p_version uuid,p_experts uuid[],p_hash text,p_snapshot jsonb,p_trace jsonb,p_actor uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v public.dc_decision_model_versions; result uuid;
begin
 if not exists(select 1 from public.dc_profiles where user_id=p_actor and role in ('admin','researcher')) then raise exception 'Forbidden'; end if;
 select * into v from public.dc_decision_model_versions where id=p_version for update;
 if not found then raise exception 'Model version not found'; end if;
 select id into result from public.dc_decision_model_inputs where model_version_id=v.id;
 if result is not null then return result; end if;
 if cardinality(p_experts)<>3
    or (select count(distinct id) from public.dc_expert_assignments where id=any(p_experts) and instrument_id=v.instrument_id and status='submitted')<>3
 then raise exception 'Exactly three final experts required'; end if;
 insert into public.dc_decision_model_inputs(model_version_id,expert_ids,input_hash,snapshot,trace) values(v.id,p_experts,p_hash,p_snapshot,p_trace) returning id into result;
 update public.dc_instrument_versions set status='frozen',frozen_at=now() where id=v.instrument_id and status not in ('frozen','retired');
 update public.dc_decision_model_versions set frozen_at=now() where id=v.id;
 insert into public.dc_audit_events(actor,action,entity_type,entity_id) values(p_actor,'model_frozen','model_input',result);
 return result;
end $$;

revoke all on function public.dc_ensure_learning_access(uuid), public.dc_freeze_model(uuid,uuid[],text,jsonb,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.dc_ensure_learning_access(uuid), public.dc_freeze_model(uuid,uuid[],text,jsonb,jsonb,uuid) to service_role;
