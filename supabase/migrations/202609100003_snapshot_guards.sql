-- Child rows must be as immutable as their parent snapshots, including service writes.
create function public.dc_guard_child() returns trigger language plpgsql set search_path = '' as $$
declare p jsonb; parent_status text; parent_frozen timestamptz; v uuid;
begin
 p := case when tg_op='DELETE' then to_jsonb(old) else to_jsonb(new) end;
 if tg_table_name='dc_assessment_answers' then
   select status into parent_status from public.dc_assessment_sessions where id=(p->>'session_id')::uuid;
 elsif tg_table_name='dc_expert_case_rankings' then
   select status into parent_status from public.dc_expert_case_assignments where id=(p->>'case_id')::uuid;
 elsif tg_table_name in ('dc_expert_profiles','dc_expert_item_reviews','dc_expert_pairwise_judgments','dc_expert_relevance_judgments') then
   select status into parent_status from public.dc_expert_assignments where id=(p->>'assignment_id')::uuid;
 elsif tg_table_name='dc_intervention_modules' then
   select frozen_at into parent_frozen from public.dc_decision_model_versions where id=(p->>'model_version_id')::uuid;
 elsif tg_table_name in ('dc_dimensions','dc_questions','dc_question_options') then
   if tg_table_name='dc_question_options' then
     select instrument_id into v from public.dc_questions where id=(p->>'question_id')::uuid;
   else v:=(p->>'instrument_id')::uuid; end if;
   select status into parent_status from public.dc_instrument_versions where id=v;
 end if;
 if parent_status in ('submitted','frozen','retired') or parent_frozen is not null then raise exception 'Parent snapshot is immutable'; end if;
 if tg_op='UPDATE' then
   -- Reparenting a row could otherwise evade its old parent's guard.
   if (to_jsonb(old)-array['score','safe_note','label','text','title','public_title','definition','relevance','clarity','suggestion','intensity','preferred','name','scope','initial_action','output_30_days']) <>
      (to_jsonb(new)-array['score','safe_note','label','text','title','public_title','definition','relevance','clarity','suggestion','intensity','preferred','name','scope','initial_action','output_30_days']) then raise exception 'Create a new row instead of changing ownership'; end if;
 end if;
 if tg_op='DELETE' then return old; end if; return new;
end $$;
do $$ declare t text; begin
 foreach t in array array['dc_assessment_answers','dc_expert_case_rankings','dc_expert_profiles','dc_expert_item_reviews','dc_expert_pairwise_judgments','dc_expert_relevance_judgments','dc_intervention_modules','dc_dimensions','dc_questions','dc_question_options'] loop
 execute format('create trigger guard_child before insert or update or delete on public.%I for each row execute function public.dc_guard_child()',t);
 end loop;
end $$;
create function public.dc_guard_model() returns trigger language plpgsql set search_path = '' as $$
begin
 if old.frozen_at is not null then raise exception 'Frozen model is immutable'; end if;
 if tg_op='DELETE' then return old; end if; return new;
end $$;
create trigger guard_model before update or delete on public.dc_decision_model_versions for each row execute function public.dc_guard_model();
create function public.dc_clone_model(p_source uuid,p_code text,p_actor uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare result uuid;
begin
 if not exists(select 1 from public.dc_profiles where user_id=p_actor and role in ('admin','researcher')) then raise exception 'Forbidden'; end if;
 insert into public.dc_decision_model_versions(code,instrument_id,tfn_map)
 select p_code,instrument_id,tfn_map from public.dc_decision_model_versions where id=p_source returning id into result;
 if result is null then raise exception 'Unknown source version'; end if;
 insert into public.dc_intervention_modules(model_version_id,code,ordinal,name,scope,initial_action,output_30_days)
 select result,code,ordinal,name,scope,initial_action,output_30_days from public.dc_intervention_modules where model_version_id=p_source;
 insert into public.dc_audit_events(actor,action,entity_type,entity_id) values(p_actor,'model_version_created','model_version',result);
 return result;
end $$;
revoke all on function public.dc_guard_child(), public.dc_guard_model(), public.dc_clone_model(uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.dc_guard_child(), public.dc_guard_model(), public.dc_clone_model(uuid,text,uuid) to service_role;
