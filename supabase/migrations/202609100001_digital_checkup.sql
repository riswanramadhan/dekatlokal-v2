-- Isolated research aggregate; does not rewrite the legacy Neon learning schema.
create table public.dc_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'umkm' check (role in ('admin','researcher','expert','umkm')),
  display_name text not null default '', created_at timestamptz not null default now()
);
create function public.dc_researcher() returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.dc_profiles where user_id = auth.uid() and role in ('admin','researcher'));
$$;
create table public.dc_instrument_versions (
 id uuid primary key default gen_random_uuid(), code text unique not null,
 status text not null default 'review' check(status in ('draft','review','frozen','retired')),
 content jsonb not null, created_by uuid references auth.users, frozen_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.dc_dimensions (
 id uuid primary key default gen_random_uuid(), instrument_id uuid not null references public.dc_instrument_versions,
 code text not null check(code ~ '^C[1-8]$'), ordinal int not null check(ordinal between 1 and 8),
 title text not null, public_title text not null, definition text not null, unique(instrument_id,code), unique(instrument_id,ordinal)
);
create table public.dc_questions (
 id uuid primary key default gen_random_uuid(), instrument_id uuid not null references public.dc_instrument_versions,
 dimension_id uuid not null references public.dc_dimensions, code text not null check(code ~ '^Q(0[1-9]|[12][0-9]|3[0-2])$'),
 ordinal int not null check(ordinal between 1 and 32), text text not null, unique(instrument_id,code), unique(instrument_id,ordinal)
);
create table public.dc_question_options (
 id uuid primary key default gen_random_uuid(), question_id uuid not null references public.dc_questions,
 score int not null check(score between 0 and 4), label text not null, unique(question_id,score)
);
create table public.dc_decision_model_versions (
 id uuid primary key default gen_random_uuid(), code text not null unique,
 instrument_id uuid not null references public.dc_instrument_versions,
 algorithm text not null default 'FAHP_GM_PERSONAL_TOPSIS' check(algorithm='FAHP_GM_PERSONAL_TOPSIS'),
 epsilon double precision not null default 1e-12 check(epsilon=1e-12), ri double precision not null default 1.41 check(ri=1.41),
 tfn_map jsonb not null, frozen_at timestamptz, created_at timestamptz not null default now()
);
create table public.dc_intervention_modules (
 id uuid primary key default gen_random_uuid(), model_version_id uuid not null references public.dc_decision_model_versions,
 code text not null check(code ~ '^A[1-7]$'), ordinal int not null check(ordinal between 1 and 7),
 name text not null, scope text not null, initial_action text not null, output_30_days text not null,
 unique(model_version_id,code), unique(model_version_id,ordinal)
);
create table public.dc_expert_assignments (
 id uuid primary key default gen_random_uuid(), expert_user_id uuid not null references auth.users,
 instrument_id uuid not null references public.dc_instrument_versions,
 code text not null unique, status text not null default 'draft' check(status in ('draft','submitted')),
 payload jsonb not null default '{}', revision int not null default 0, invited_at timestamptz not null default now(),
 stage1_submitted_at timestamptz, unique(expert_user_id,instrument_id)
);
create table public.dc_expert_profiles (
 assignment_id uuid primary key references public.dc_expert_assignments,
 confirmed_name text not null, institution text not null, job_title text not null,
 experience_years double precision not null check(experience_years>=0), expertise text not null,
 consent boolean not null check(consent), assessment_date date not null
);
create table public.dc_expert_item_reviews (
 id uuid primary key default gen_random_uuid(), assignment_id uuid not null references public.dc_expert_assignments,
 question_id uuid not null references public.dc_questions, relevance int not null check(relevance between 1 and 4),
 clarity int not null check(clarity between 1 and 4), suggestion text not null default '',
 check((relevance>2 and clarity>2) or length(trim(suggestion))>0), unique(assignment_id,question_id)
);
create table public.dc_expert_pairwise_judgments (
 id uuid primary key default gen_random_uuid(), assignment_id uuid not null references public.dc_expert_assignments,
 left_code text not null check(left_code ~ '^C[1-8]$'), right_code text not null check(right_code ~ '^C[1-8]$'),
 preferred text not null, intensity int not null check(intensity between 1 and 9),
 check(left_code < right_code), check((preferred='equal' and intensity=1) or (preferred in (left_code,right_code) and intensity between 2 and 9)),
 unique(assignment_id,left_code,right_code)
);
create table public.dc_expert_relevance_judgments (
 id uuid primary key default gen_random_uuid(), assignment_id uuid not null references public.dc_expert_assignments,
 module_code text not null check(module_code ~ '^A[1-7]$'), dimension_code text not null check(dimension_code ~ '^C[1-8]$'),
 score int not null check(score between 0 and 4), unique(assignment_id,module_code,dimension_code)
);
create table public.dc_umkm_profiles (
 id uuid primary key default gen_random_uuid(), owner_id uuid references auth.users,
 code text not null unique, metadata jsonb not null, created_at timestamptz not null default now()
);
create table public.dc_assessment_sessions (
 id uuid primary key default gen_random_uuid(), umkm_id uuid not null references public.dc_umkm_profiles,
 instrument_id uuid not null references public.dc_instrument_versions, token_hash text not null check(length(token_hash)=64),
 expires_at timestamptz not null, status text not null default 'draft' check(status in ('draft','submitted','superseded')),
 revision int not null default 0, revision_number int not null default 1,
 parent_id uuid references public.dc_assessment_sessions, payload jsonb not null default '{}',
 started_at timestamptz not null default now(), submitted_at timestamptz,
 unique(umkm_id,revision_number)
);
create index dc_assess_token_idx on public.dc_assessment_sessions(token_hash);
create index dc_assess_instrument_idx on public.dc_assessment_sessions(instrument_id,status);
create table public.dc_assessment_answers (
 id uuid primary key default gen_random_uuid(), session_id uuid not null references public.dc_assessment_sessions,
 question_id uuid not null references public.dc_questions, score int not null check(score between 0 and 4),
 safe_note text, unique(session_id,question_id)
);
create table public.dc_expert_case_assignments (
 id uuid primary key default gen_random_uuid(), expert_assignment_id uuid not null references public.dc_expert_assignments,
 assessment_id uuid not null references public.dc_assessment_sessions,
 status text not null default 'draft' check(status in ('draft','submitted')),
 payload jsonb not null default '{}', created_at timestamptz not null default now(), submitted_at timestamptz,
 unique(expert_assignment_id,assessment_id)
);
create table public.dc_expert_case_rankings (
 id uuid primary key default gen_random_uuid(), case_id uuid not null references public.dc_expert_case_assignments,
 module_code text not null check(module_code ~ '^A[1-7]$'), rank int not null check(rank between 1 and 7),
 unique(case_id,module_code), unique(case_id,rank)
);
create table public.dc_decision_model_inputs (
 id uuid primary key default gen_random_uuid(), model_version_id uuid not null unique references public.dc_decision_model_versions,
 expert_ids uuid[] not null check(cardinality(expert_ids)=3), input_hash text not null,
 snapshot jsonb not null, trace jsonb not null, created_at timestamptz not null default now()
);
create table public.dc_decision_runs (
 id uuid primary key default gen_random_uuid(), assessment_id uuid not null references public.dc_assessment_sessions,
 model_input_id uuid not null references public.dc_decision_model_inputs,
 status text not null check(status in ('RANKED','NO_IDENTIFIED_GAP','UNCOVERED_DIMENSION','ALTERNATIVES_NOT_DISTINGUISHABLE')),
 h double precision not null check(h between 0 and 1.000000000001), input_hash text not null, canonical_input jsonb not null,
 trace jsonb not null, sensitivity jsonb not null, build_id text not null, created_at timestamptz not null default now(),
 unique(assessment_id,model_input_id)
);
create table public.dc_dimension_results (
 id uuid primary key default gen_random_uuid(), run_id uuid not null references public.dc_decision_runs,
 code text not null check(code ~ '^C[1-8]$'), s double precision not null check(s between 0 and 100),
 g double precision not null check(g between 0 and 1), w double precision not null check(w>0 and w<=1),
 q double precision not null check(q between 0 and 1.000000000001), unique(run_id,code)
);
create table public.dc_intervention_results (
 id uuid primary key default gen_random_uuid(), run_id uuid not null references public.dc_decision_runs,
 code text not null check(code ~ '^A[1-7]$'), dplus double precision not null check(dplus>=0), dminus double precision not null check(dminus>=0),
 c double precision not null check(c between 0 and 1), rank int not null check(rank between 1 and 7), is_top_tie boolean not null,
 unique(run_id,code)
);
create table public.dc_usability_tests (
 id uuid primary key default gen_random_uuid(), assessment_id uuid not null references public.dc_assessment_sessions,
 actual_date date not null, task_statuses jsonb not null, total_minutes double precision not null check(total_minutes>0),
 ease int not null check(ease between 1 and 5), note text not null, recorded_by uuid not null references auth.users,
 created_at timestamptz not null default now()
);
create table public.dc_audit_events (
 id uuid primary key default gen_random_uuid(), actor uuid references auth.users, action text not null,
 entity_type text not null, entity_id uuid not null, metadata jsonb not null default '{}', created_at timestamptz not null default now()
);

-- No client writes. Server authorization plus restricted RPCs are the write boundary.
do $$ declare t text; begin
 for t in select tablename from pg_tables where schemaname='public' and tablename like 'dc_%' loop
   execute format('alter table public.%I enable row level security',t);
   execute format('revoke all on public.%I from anon, authenticated',t);
   execute format('grant select on public.%I to authenticated',t);
   execute format('grant all on public.%I to service_role',t);
   execute format('create policy researcher_read on public.%I for select to authenticated using (public.dc_researcher())',t);
 end loop;
end $$;
create policy own_profile on public.dc_profiles for select to authenticated using(user_id=auth.uid());
create policy own_expert on public.dc_expert_assignments for select to authenticated using(expert_user_id=auth.uid());
create policy own_cases on public.dc_expert_case_assignments for select to authenticated using(exists(select 1 from public.dc_expert_assignments e where e.id=expert_assignment_id and e.expert_user_id=auth.uid()));
create policy own_umkm on public.dc_umkm_profiles for select to authenticated using(owner_id=auth.uid());
create policy own_assessment on public.dc_assessment_sessions for select to authenticated using(exists(select 1 from public.dc_umkm_profiles u where u.id=umkm_id and u.owner_id=auth.uid()));
-- Expert has NO result/model/other-assessment SELECT policies: blinded case DTO is built server-side.

create function public.dc_immutable() returns trigger language plpgsql set search_path = '' as $$
begin raise exception 'Immutable snapshot. Create a new revision.'; end $$;
do $$ declare t text; begin
 foreach t in array array['dc_decision_runs','dc_decision_model_inputs','dc_dimension_results','dc_intervention_results','dc_audit_events','dc_usability_tests'] loop
 execute format('create trigger immutable before update or delete on public.%I for each row execute function public.dc_immutable()',t);
 end loop;
end $$;
create function public.dc_guard_final() returns trigger language plpgsql set search_path = '' as $$
begin
 if old.status='submitted' then raise exception 'Submitted data is immutable'; end if;
 if tg_op='DELETE' then return old; end if;
 return new;
end $$;
create trigger guard_final before update or delete on public.dc_assessment_sessions for each row execute function public.dc_guard_final();
create trigger guard_final before update or delete on public.dc_expert_assignments for each row execute function public.dc_guard_final();
create trigger guard_final before update or delete on public.dc_expert_case_assignments for each row execute function public.dc_guard_final();
create function public.dc_guard_instrument() returns trigger language plpgsql set search_path = '' as $$
declare v uuid; locked boolean;
begin
 if tg_table_name='dc_instrument_versions' then
   if old.status in ('frozen','retired') then raise exception 'Frozen instrument is immutable'; end if;
 elsif tg_table_name='dc_question_options' then
   select instrument_id into v from public.dc_questions where id=old.question_id;
 else v:=old.instrument_id; end if;
 if v is not null then
   select status in ('frozen','retired') into locked from public.dc_instrument_versions where id=v;
   if locked then raise exception 'Frozen instrument is immutable'; end if;
 end if;
 if tg_op='DELETE' then return old; end if; return new;
end $$;
create trigger guard_instrument before update or delete on public.dc_instrument_versions for each row execute function public.dc_guard_instrument();
create trigger guard_instrument before update or delete on public.dc_dimensions for each row execute function public.dc_guard_instrument();
create trigger guard_instrument before update or delete on public.dc_questions for each row execute function public.dc_guard_instrument();
create trigger guard_instrument before update or delete on public.dc_question_options for each row execute function public.dc_guard_instrument();

create function public.dc_save_assessment(p_id uuid, p_token_hash text, p_payload jsonb, p_revision int, p_final boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare a public.dc_assessment_sessions; entry record; q uuid;
begin
 select * into a from public.dc_assessment_sessions where id=p_id and token_hash=p_token_hash and expires_at>now() for update;
 if not found then raise exception 'Session expired'; end if;
 if a.status='submitted' and p_final then return to_jsonb(a); end if;
 if a.status<>'draft' or a.revision<>p_revision then raise exception 'Draft changed. Reload before saving'; end if;
 if not coalesce((p_payload#>>'{profile,consent}')::boolean,false) then raise exception 'Consent required'; end if;
 if p_final and (select count(*) from jsonb_each(p_payload->'answers') where value<>'null'::jsonb)<>32 then raise exception '32 answers required'; end if;
 delete from public.dc_assessment_answers where session_id=a.id;
 for entry in select * from jsonb_each(p_payload->'answers') loop
   select id into q from public.dc_questions where instrument_id=a.instrument_id and code=entry.key;
   if q is null then raise exception 'Unknown question'; end if;
   if entry.value<>'null'::jsonb then
     if jsonb_typeof(entry.value)<>'number' or (entry.value::text)::numeric % 1 <> 0 then raise exception 'Invalid score'; end if;
     insert into public.dc_assessment_answers(session_id,question_id,score) values(a.id,q,(entry.value::text)::int);
   end if;
 end loop;
 update public.dc_assessment_sessions set payload=p_payload, revision=revision+1, status=case when p_final then 'submitted' else 'draft' end, submitted_at=case when p_final then now() else null end where id=a.id returning * into a;
 if p_final then insert into public.dc_audit_events(action,entity_type,entity_id) values('assessment_submitted','assessment',a.id); end if;
 return to_jsonb(a);
end $$;

create function public.dc_save_expert(p_id uuid, p_actor uuid, p_payload jsonb, p_revision int, p_final boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare a public.dc_expert_assignments; entry record; sub record; q uuid;
begin
 select * into a from public.dc_expert_assignments where id=p_id and expert_user_id=p_actor for update;
 if not found then raise exception 'Forbidden'; end if;
 if a.status='submitted' and p_final then return to_jsonb(a); end if;
 if a.status<>'draft' or a.revision<>p_revision then raise exception 'Draft changed or final'; end if;
 if p_final then
   if p_payload->>'decision'<>'layak_uji_coba' or not coalesce((p_payload#>>'{profile,consent}')::boolean,false) or (p_payload#>>'{consistency,CR}')::numeric>0.100000000001 then raise exception 'Final validation failed'; end if;
   if jsonb_array_length(p_payload->'pairs')<>28 or (select count(*) from jsonb_each(p_payload->'reviews'))<>32 then raise exception 'Incomplete expert data'; end if;
   insert into public.dc_expert_profiles values(a.id,p_payload#>>'{profile,name}',p_payload#>>'{profile,institution}',p_payload#>>'{profile,jobTitle}',(p_payload#>>'{profile,experienceYears}')::double precision,p_payload#>>'{profile,expertise}',true,(p_payload#>>'{profile,assessmentDate}')::date);
   for entry in select * from jsonb_each(p_payload->'reviews') loop
     select id into q from public.dc_questions where instrument_id=a.instrument_id and code=entry.key;
     insert into public.dc_expert_item_reviews(assignment_id,question_id,relevance,clarity,suggestion) values(a.id,q,(entry.value->>'relevance')::int,(entry.value->>'clarity')::int,entry.value->>'suggestion');
   end loop;
   for entry in select value from jsonb_array_elements(p_payload->'pairs') loop
     insert into public.dc_expert_pairwise_judgments(assignment_id,left_code,right_code,preferred,intensity) values(a.id,entry.value->>'left',entry.value->>'right',entry.value->>'preferred',(entry.value->>'intensity')::int);
   end loop;
   for entry in select * from jsonb_each(p_payload->'relevance') loop
     for sub in select * from jsonb_each(entry.value) loop
       insert into public.dc_expert_relevance_judgments(assignment_id,module_code,dimension_code,score) values(a.id,entry.key,sub.key,(sub.value::text)::int);
     end loop;
   end loop;
   if (select count(*) from public.dc_expert_relevance_judgments where assignment_id=a.id)<>56 then raise exception '56 judgments required'; end if;
 end if;
 update public.dc_expert_assignments set payload=p_payload,revision=revision+1,status=case when p_final then 'submitted' else 'draft' end,stage1_submitted_at=case when p_final then now() else null end where id=a.id returning * into a;
 if p_final then insert into public.dc_audit_events(actor,action,entity_type,entity_id) values(p_actor,'expert_submitted','expert',a.id); end if;
 return to_jsonb(a);
end $$;

create function public.dc_save_case(p_id uuid,p_actor uuid,p_payload jsonb,p_final boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare a public.dc_expert_case_assignments; entry record;
begin
 select c.* into a from public.dc_expert_case_assignments c join public.dc_expert_assignments e on e.id=c.expert_assignment_id where c.id=p_id and e.expert_user_id=p_actor for update of c;
 if not found then raise exception 'Forbidden'; end if;
 if a.status='submitted' and p_final then return to_jsonb(a); end if;
 if a.status<>'draft' then raise exception 'Case is final'; end if;
 if p_final then
   if length(trim(p_payload->>'rationale'))<1 then raise exception 'Reason required'; end if;
   if p_payload->>'decision'='Dinilai' then
     for entry in select * from jsonb_each(p_payload->'ranks') loop
       insert into public.dc_expert_case_rankings(case_id,module_code,rank) values(a.id,entry.key,(entry.value::text)::int);
     end loop;
     if (select count(*) from public.dc_expert_case_rankings where case_id=a.id)<>7 then raise exception 'Seven unique ranks required'; end if;
   elsif p_payload->>'decision'<>'Tidak dapat menilai' then raise exception 'Unknown case decision'; end if;
 end if;
 update public.dc_expert_case_assignments set payload=p_payload,status=case when p_final then 'submitted' else 'draft' end,submitted_at=case when p_final then now() else null end where id=a.id returning * into a;
 return to_jsonb(a);
end $$;

create function public.dc_freeze_model(p_version uuid,p_experts uuid[],p_hash text,p_snapshot jsonb,p_trace jsonb,p_actor uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v public.dc_decision_model_versions; result uuid;
begin
 if not exists(select 1 from public.dc_profiles where user_id=p_actor and role in ('admin','researcher')) then raise exception 'Forbidden'; end if;
 select * into v from public.dc_decision_model_versions where id=p_version for update;
 select id into result from public.dc_decision_model_inputs where model_version_id=v.id;
 if result is not null then return result; end if;
 if cardinality(p_experts)<>3 or (select count(distinct expert_user_id) from public.dc_expert_assignments where id=any(p_experts) and instrument_id=v.instrument_id and status='submitted')<>3 then raise exception 'Exactly three final experts required'; end if;
 insert into public.dc_decision_model_inputs(model_version_id,expert_ids,input_hash,snapshot,trace) values(v.id,p_experts,p_hash,p_snapshot,p_trace) returning id into result;
 update public.dc_instrument_versions set status='frozen',frozen_at=now() where id=v.instrument_id and status not in ('frozen','retired');
 update public.dc_decision_model_versions set frozen_at=now() where id=v.id;
 insert into public.dc_audit_events(actor,action,entity_type,entity_id) values(p_actor,'model_frozen','model_input',result);
 return result;
end $$;

create function public.dc_store_run(p_assessment uuid,p_model uuid,p_hash text,p_canonical jsonb,p_trace jsonb,p_sensitivity jsonb,p_build text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare a public.dc_assessment_sessions; result uuid; i int; r record;
begin
 select * into a from public.dc_assessment_sessions where id=p_assessment for update;
 if a.status<>'submitted' then raise exception 'Assessment must be final'; end if;
 if not exists(select 1 from public.dc_decision_model_inputs mi join public.dc_decision_model_versions mv on mv.id=mi.model_version_id where mi.id=p_model and mv.instrument_id=a.instrument_id and mv.frozen_at is not null) then raise exception 'Frozen model mismatch'; end if;
 if a.payload->'answers' <> p_canonical->'answers' then raise exception 'Input snapshot mismatch'; end if;
 select id into result from public.dc_decision_runs where assessment_id=p_assessment and model_input_id=p_model;
 if result is not null then return result; end if;
 insert into public.dc_decision_runs(assessment_id,model_input_id,status,h,input_hash,canonical_input,trace,sensitivity,build_id)
 values(p_assessment,p_model,p_trace->>'status',(p_trace->>'H')::double precision,p_hash,p_canonical,p_trace,p_sensitivity,p_build) returning id into result;
 for i in 0..7 loop
   insert into public.dc_dimension_results(run_id,code,s,g,w,q) values(result,'C'||(i+1),(p_trace->'S'->>i)::double precision,(p_trace->'g'->>i)::double precision,(p_trace->'w'->>i)::double precision,(p_trace->'q'->>i)::double precision);
 end loop;
 for r in select value from jsonb_array_elements(p_trace->'ranking') loop
   insert into public.dc_intervention_results(run_id,code,dplus,dminus,c,rank,is_top_tie) values(result,r.value->>'code',(r.value->>'Dplus')::double precision,(r.value->>'Dminus')::double precision,(r.value->>'C')::double precision,(r.value->>'rank')::int,(r.value->>'rank')::int=1 and jsonb_array_length(p_trace->'topSet')>1);
 end loop;
 insert into public.dc_audit_events(action,entity_type,entity_id) values('run_created','run',result);
 return result;
end $$;

-- Lock all mutations and RPC invocation to trusted server credentials.
do $$ declare fn record; begin
 for fn in select p.oid::regprocedure signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'dc_%' and p.proname<>'dc_researcher' loop
   execute format('revoke all on function %s from public, anon, authenticated',fn.signature);
   execute format('grant execute on function %s to service_role',fn.signature);
 end loop;
end $$;
