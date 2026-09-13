-- Email-free expert assignments. Existing Auth-linked assignments remain unchanged.
-- NULL actors are accepted only by service-only RPCs; the API validates the signed,
-- assignment-bound expert session before calling these functions.
alter table public.dc_expert_assignments alter column expert_user_id drop not null;

create or replace function public.dc_save_expert(p_id uuid, p_actor uuid, p_payload jsonb, p_revision int, p_final boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare a public.dc_expert_assignments; entry record; sub record; q uuid;
begin
 select * into a from public.dc_expert_assignments where id=p_id and (expert_user_id=p_actor or (expert_user_id is null and p_actor is null)) for update;
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

create or replace function public.dc_save_case(p_id uuid,p_actor uuid,p_payload jsonb,p_final boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare a public.dc_expert_case_assignments; entry record;
begin
 select c.* into a from public.dc_expert_case_assignments c join public.dc_expert_assignments e on e.id=c.expert_assignment_id where c.id=p_id and (e.expert_user_id=p_actor or (e.expert_user_id is null and p_actor is null)) for update of c;
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

revoke all on function public.dc_save_expert(uuid,uuid,jsonb,int,boolean),public.dc_save_case(uuid,uuid,jsonb,boolean) from public,anon,authenticated;
grant execute on function public.dc_save_expert(uuid,uuid,jsonb,int,boolean),public.dc_save_case(uuid,uuid,jsonb,boolean) to service_role;

