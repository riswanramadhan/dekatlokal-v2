-- Account ownership is acquired with the guest's secret, never a public assessment ID.
create function public.dc_claim_assessment(p_hash text,p_actor uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare a public.dc_assessment_sessions; u public.dc_umkm_profiles;
begin
 if not exists(select 1 from auth.users where id=p_actor) or exists(select 1 from public.dc_profiles where user_id=p_actor and role<>'umkm') then raise exception 'Forbidden'; end if;
 select * into a from public.dc_assessment_sessions where token_hash=p_hash and expires_at>now() order by revision_number desc limit 1;
 if not found then raise exception 'Guest session expired'; end if;
 select * into u from public.dc_umkm_profiles where id=a.umkm_id for update;
 if u.owner_id is not null and u.owner_id<>p_actor then raise exception 'Already claimed by another account'; end if;
 insert into public.dc_profiles(user_id,role) values(p_actor,'umkm') on conflict(user_id) do nothing;
 if u.owner_id is null then
   update public.dc_umkm_profiles set owner_id=p_actor where id=u.id;
   insert into public.dc_audit_events(actor,action,entity_type,entity_id) values(p_actor,'assessment_claimed','assessment',a.id);
 end if;
 return a.id;
end $$;

create table public.dc_recommendation_jobs (
 id uuid primary key default gen_random_uuid(), assessment_id uuid not null references public.dc_assessment_sessions,
 model_input_id uuid not null references public.dc_decision_model_inputs,
 status text not null default 'queued' check(status in ('queued','running','done')),
 attempts int not null default 0, available_at timestamptz not null default now(), lease_until timestamptz,
 created_at timestamptz not null default now(), unique(assessment_id,model_input_id)
);
alter table public.dc_recommendation_jobs enable row level security;
revoke all on public.dc_recommendation_jobs from anon,authenticated;
grant all on public.dc_recommendation_jobs to service_role;
grant select on public.dc_recommendation_jobs to authenticated;
create policy researcher_read on public.dc_recommendation_jobs for select to authenticated using(public.dc_researcher());
create index dc_jobs_available on public.dc_recommendation_jobs(status,available_at);
create function public.dc_enqueue_recommendations() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_table_name='dc_assessment_sessions' then
   if new.status='submitted' and old.status<>'submitted' then
     insert into public.dc_recommendation_jobs(assessment_id,model_input_id)
     select new.id,mi.id from public.dc_decision_model_inputs mi join public.dc_decision_model_versions mv on mv.id=mi.model_version_id where mv.instrument_id=new.instrument_id
     on conflict do nothing;
   end if;
 else
   insert into public.dc_recommendation_jobs(assessment_id,model_input_id)
   select a.id,new.id from public.dc_assessment_sessions a join public.dc_decision_model_versions mv on mv.instrument_id=a.instrument_id where mv.id=new.model_version_id and a.status='submitted'
   on conflict do nothing;
 end if;
 return new;
end $$;
create trigger enqueue_assessment after update on public.dc_assessment_sessions for each row execute function public.dc_enqueue_recommendations();
create trigger enqueue_model after insert on public.dc_decision_model_inputs for each row execute function public.dc_enqueue_recommendations();
insert into public.dc_recommendation_jobs(assessment_id,model_input_id)
select a.id,mi.id from public.dc_assessment_sessions a join public.dc_decision_model_versions mv on mv.instrument_id=a.instrument_id join public.dc_decision_model_inputs mi on mi.model_version_id=mv.id
where a.status='submitted' and not exists(select 1 from public.dc_decision_runs r where r.assessment_id=a.id and r.model_input_id=mi.id) on conflict do nothing;
create function public.dc_take_job() returns public.dc_recommendation_jobs language plpgsql security definer set search_path='' as $$
declare j public.dc_recommendation_jobs;
begin
 select * into j from public.dc_recommendation_jobs where (status='queued' and available_at<=now()) or (status='running' and lease_until<now()) order by available_at for update skip locked limit 1;
 if found then update public.dc_recommendation_jobs set status='running',attempts=attempts+1,lease_until=now()+interval '5 minutes' where id=j.id returning * into j; end if;
 return j;
end $$;

create table public.dc_learning_progress (
 user_id uuid not null references auth.users, curriculum_version text not null,
 module_code text not null check(module_code ~ '^A[1-7]$'), lesson_id text not null,
 completed boolean not null default false, exercise text not null default '' check(length(exercise)<=3000),
 quiz_score int check(quiz_score between 0 and 100), updated_at timestamptz not null default now(),
 primary key(user_id,curriculum_version,module_code,lesson_id)
);
alter table public.dc_learning_progress enable row level security;
revoke all on public.dc_learning_progress from anon,authenticated;
grant select on public.dc_learning_progress to authenticated;
grant all on public.dc_learning_progress to service_role;
create policy own_learning on public.dc_learning_progress for select to authenticated using(user_id=auth.uid());

revoke all on function public.dc_claim_assessment(text,uuid),public.dc_enqueue_recommendations(),public.dc_take_job() from public,anon,authenticated;
grant execute on function public.dc_claim_assessment(text,uuid),public.dc_enqueue_recommendations(),public.dc_take_job() to service_role;

-- Preserve completion and the highest score even with simultaneous tabs/retries.
create function public.dc_save_learning(p_user uuid,p_version text,p_module text,p_lesson text,p_exercise text,p_complete boolean,p_score int)
returns void language sql security definer set search_path='' as $$
 insert into public.dc_learning_progress(user_id,curriculum_version,module_code,lesson_id,exercise,completed,quiz_score)
 values(p_user,p_version,p_module,p_lesson,p_exercise,p_complete,p_score)
 on conflict(user_id,curriculum_version,module_code,lesson_id) do update
 set exercise=excluded.exercise,
 completed=public.dc_learning_progress.completed or excluded.completed,
 quiz_score=greatest(public.dc_learning_progress.quiz_score,excluded.quiz_score),
 updated_at=now();
$$;
revoke all on function public.dc_save_learning(uuid,text,text,text,text,boolean,int) from public,anon,authenticated;
grant execute on function public.dc_save_learning(uuid,text,text,text,text,boolean,int) to service_role;
