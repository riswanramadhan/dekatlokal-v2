import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { instrument, PAIRS, DIMENSIONS, MODULES, buildModel, sensitivity, topsis } from "@/lib/decision-engine";
import { blankExpert, validateExpertFinal } from "@/lib/digital-checkup/validation";
import { inputHash } from "@/lib/digital-checkup/canonical";

const db = new PGlite();
const admin=randomUUID(), users=[randomUUID(),randomUUID(),randomUUID()], outsider=randomUUID();
let version:string, modelVersion:string, session:string, business:string, modelId:string, runId:string;
const assignments:string[]=[];
const raw=Object.fromEntries(instrument.questions.map(q=>[q.code,2]));
const profile={consent:true,sector:'SIMULASI TEST',district:'TEST',businessAgeMonths:12,peopleCount:2,respondentRole:'Pemilik',salesChannels:['Toko'],goal:'TEST',note:''};
const pairs=PAIRS.map(p=>({...p,preferred:'equal',intensity:1}));
const relevance=Object.fromEntries(MODULES.map((m,i)=>[m,Object.fromEntries(DIMENSIONS.map((d,j)=>[d,(i+j)%5]))]));
const input={pairs,relevance}, compiled=buildModel([input,input,input]);
async function scalar(sql:string,args:unknown[]=[]){const r=await db.query<{value:string}>(sql,args);return r.rows[0]?.value;}
beforeAll(async()=>{
  await db.exec("create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema public,auth to anon,authenticated,service_role; grant execute on function auth.uid() to authenticated,service_role;");
  for(const file of readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort())await db.exec(readFileSync(`supabase/migrations/${file}`,'utf8'));
  for(const id of [admin,...users,outsider])await db.query('insert into auth.users values($1)',[id]);
  await db.query("insert into dc_profiles(user_id,role) values($1,'admin'),($2,'expert'),($3,'expert'),($4,'expert'),($5,'umkm')",[admin,...users,outsider]);
  version=await scalar('select id as value from dc_instrument_versions limit 1');
  modelVersion=await scalar('select id as value from dc_decision_model_versions limit 1');
},180000);
afterAll(async()=>{await db.close();});
describe.sequential('real PostgreSQL migrations / transactions / RLS (isolated simulation)',()=>{
  it('seeds exact instrument counts and enables all 26 table policies',async()=>{
    for(const [table,count] of [['dc_dimensions',8],['dc_questions',32],['dc_question_options',160],['dc_intervention_modules',7]] as const)expect(Number(await scalar(`select count(*) as value from ${table}`))).toBe(count);
    expect(Number(await scalar("select count(*) as value from pg_tables where schemaname='public' and tablename like 'dc_%' and rowsecurity"))).toBe(30);
  });
  it('UMKM draft saves zeros, rejects null final, finalizes and retries idempotently',async()=>{
    business=await scalar("insert into dc_umkm_profiles(code,metadata,owner_id) values('SIMULASI-UMKM',$1,$2) returning id as value",[profile,outsider]);
    session=await scalar("insert into dc_assessment_sessions(umkm_id,instrument_id,token_hash,expires_at) values($1,$2,$3,now()+interval '1 day') returning id as value",[business,version,'a'.repeat(64)]);
    const save=(answers:unknown,rev:number,final:boolean)=>db.query('select dc_save_assessment($1,$2,$3,$4,$5)',[session,'a'.repeat(64),{profile,answers},rev,final]);
    await save({...raw,Q01:0},0,false);
    await expect(save({...raw,Q01:null},1,true)).rejects.toThrow();
    expect(Number(await scalar('select revision as value from dc_assessment_sessions where id=$1',[session]))).toBe(1);
    await save(raw,1,true);await save(raw,1,true);
    expect(Number(await scalar("select count(*) as value from dc_audit_events where action='assessment_submitted'"))).toBe(1);
    await expect(save(raw,2,false)).rejects.toThrow();
    await expect(db.query('update dc_assessment_answers set score=0 where session_id=$1',[session])).rejects.toThrow(/immutable/);
    await expect(db.query("update dc_assessment_sessions set payload='{}' where id=$1",[session])).rejects.toThrow(/immutable/);
  });
  it('three real final expert submissions compile and freeze atomically',async()=>{
    for(let i=0;i<3;i++){
      const id=await scalar('insert into dc_expert_assignments(expert_user_id,instrument_id,code) values($1,$2,$3) returning id as value',[users[i],version,`SIMULASI-AHLI-${i+1}`]);assignments.push(id);
      const draft={...blankExpert(),profile:{name:'SIMULASI',institution:'TEST',jobTitle:'TEST',expertise:'TEST',experienceYears:2,consent:true,assessmentDate:'2026-09-10'},decision:'layak_uji_coba',reviews:Object.fromEntries(instrument.questions.map(q=>[q.code,{relevance:4,clarity:4,suggestion:''}])),pairs,relevance};
      await db.query('select dc_save_expert($1,$2,$3,0,false)',[id,users[i],draft]);
      const final=validateExpertFinal(draft);
      await db.query('select dc_save_expert($1,$2,$3,1,true)',[id,users[i],final]);
      await db.query('select dc_save_expert($1,$2,$3,1,true)',[id,users[i],final]);
      await expect(db.query('update dc_expert_relevance_judgments set score=0 where assignment_id=$1',[id])).rejects.toThrow(/immutable/);
    }
    const snapshot={experts:[input,input,input],expertCodes:['SIMULASI-1','SIMULASI-2','SIMULASI-3'],instrumentVersion:instrument.version};
    modelId=await scalar('select dc_freeze_model($1,$2,$3,$4,$5,$6) as value',[modelVersion,assignments,inputHash(snapshot),snapshot,compiled,admin]);
    expect(await scalar('select dc_freeze_model($1,$2,$3,$4,$5,$6) as value',[modelVersion,assignments,inputHash(snapshot),snapshot,compiled,admin])).toBe(modelId);
    await expect(db.query("update dc_questions set text='changed' where instrument_id=$1",[version])).rejects.toThrow(/immutable/);
    await expect(db.query("update dc_intervention_modules set name='changed' where model_version_id=$1",[modelVersion])).rejects.toThrow(/immutable/);
    await expect(db.query("update dc_decision_model_versions set code='changed' where id=$1",[modelVersion])).rejects.toThrow(/immutable/);
  });
  it('persists reproducible trace with 32 scenarios and prevents duplicate run',async()=>{
    const canonical={instrumentVersion:instrument.version,modelVersion:instrument.modelVersion,dimensionCodes:DIMENSIONS,moduleCodes:MODULES,experts:[input,input,input],answers:raw};
    const args=[session,modelId,inputHash(canonical),canonical,topsis(raw,compiled.w,compiled.R),sensitivity(raw,compiled),'SIMULATION-TEST'];
    runId=await scalar('select dc_store_run($1,$2,$3,$4,$5,$6,$7) as value',args);
    expect(await scalar('select dc_store_run($1,$2,$3,$4,$5,$6,$7) as value',args)).toBe(runId);
    expect(Number(await scalar('select count(*) as value from dc_dimension_results'))).toBe(8);
    expect(Number(await scalar('select count(*) as value from dc_intervention_results'))).toBe(7);
    expect(Number(await scalar('select jsonb_array_length(sensitivity) as value from dc_decision_runs'))).toBe(32);
    await expect(db.query("update dc_decision_runs set trace='{}' where id=$1",[runId])).rejects.toThrow(/Immutable/);
  });
  it('blinded case validates seven unique ranks and locks final',async()=>{
    const id=await scalar('insert into dc_expert_case_assignments(expert_assignment_id,assessment_id) values($1,$2) returning id as value',[assignments[0],session]);
    const payload={decision:'Dinilai',ranks:Object.fromEntries(MODULES.map((m,i)=>[m,i+1])),rationale:'SIMULASI TEST'};
    await expect(db.query('select dc_save_case($1,$2,$3,true)',[id,users[1],payload])).rejects.toThrow(/Forbidden/);
    await expect(db.query('select dc_save_case($1,$2,$3,true)',[id,users[0],{...payload,ranks:{...payload.ranks,A7:1}}])).rejects.toThrow();
    await db.query('select dc_save_case($1,$2,$3,false)',[id,users[0],payload]);
    await db.query('select dc_save_case($1,$2,$3,true)',[id,users[0],payload]);
    await db.query('select dc_save_case($1,$2,$3,true)',[id,users[0],payload]);
    await expect(db.query('update dc_expert_case_rankings set rank=1 where case_id=$1',[id])).rejects.toThrow(/immutable/);
  });
  it('RLS keeps other users, model trace and role changes inaccessible',async()=>{
    const otherBusiness=await scalar("insert into dc_umkm_profiles(code,metadata,owner_id) values('SIMULASI-OTHER',$1,$2) returning id as value",[profile,users[2]]);
    await db.query("insert into dc_assessment_sessions(umkm_id,instrument_id,token_hash,expires_at) values($1,$2,$3,now()+interval '1 day')",[otherBusiness,version,'b'.repeat(64)]);
    await db.exec('set role authenticated');
    try{
      await db.query("select set_config('request.jwt.claim.sub',$1,false)",[users[0]]);
      expect(Number(await scalar('select count(*) as value from dc_expert_assignments'))).toBe(1);
      for(const table of ['dc_decision_runs','dc_decision_model_inputs','dc_assessment_sessions','dc_expert_relevance_judgments'])expect(Number(await scalar(`select count(*) as value from ${table}`))).toBe(0);
      await expect(db.query("update dc_profiles set role='admin' where user_id=$1",[users[0]])).rejects.toThrow(/permission denied/);
      await expect(db.query("select dc_save_assessment($1,$2,'{}',0,false)",[session,'a'.repeat(64)])).rejects.toThrow(/permission denied/);
      await db.query("select set_config('request.jwt.claim.sub',$1,false)",[outsider]);
      expect(Number(await scalar('select count(*) as value from dc_assessment_sessions'))).toBe(1);
      expect(Number(await scalar('select count(*) as value from dc_expert_assignments'))).toBe(0);
      await db.query("select set_config('request.jwt.claim.sub',$1,false)",[admin]);
      expect(Number(await scalar('select count(*) as value from dc_decision_runs'))).toBe(1);
    }finally{await db.exec('reset role');}
    await db.exec('set role anon');
    try{await expect(db.query('select * from dc_assessment_sessions')).rejects.toThrow(/permission denied/);}finally{await db.exec('reset role');}
  });
  it('automatically queues submitted assessments when a model is frozen and leases retries',async()=>{
    expect(Number(await scalar('select count(*) as value from dc_recommendation_jobs where assessment_id=$1 and model_input_id=$2',[session,modelId]))).toBe(1);
    const job=await scalar('select (dc_take_job()).id as value');
    expect(job).toBeTruthy();
    expect(await scalar('select (dc_take_job()).id as value')).toBeNull();
    await db.query("update dc_recommendation_jobs set lease_until=now()-interval '1 second' where id=$1",[job]);
    expect(await scalar('select (dc_take_job()).id as value')).toBe(job);
    expect(Number(await scalar('select attempts as value from dc_recommendation_jobs where id=$1',[job]))).toBe(2);
  });
  it('claims guest ownership idempotently, rejects another owner and expert roles',async()=>{
    const contactProfile={...profile,businessName:'SIMULASI GUEST',email:'simulation@example.org',whatsapp:'081234567890'};
    const id=await scalar("insert into dc_umkm_profiles(code,metadata) values('SIMULASI-GUEST',$1) returning id as value",[contactProfile]);
    const a=await scalar("insert into dc_assessment_sessions(umkm_id,instrument_id,token_hash,expires_at) values($1,$2,$3,now()+interval '1 day') returning id as value",[id,version,'c'.repeat(64)]);
    await db.query('select dc_save_assessment($1,$2,$3,0,true)',[a,'c'.repeat(64),{profile:contactProfile,answers:raw}]);
    expect(Number(await scalar('select count(*) as value from dc_recommendation_jobs where assessment_id=$1',[a]))).toBe(1);
    await expect(db.query('select dc_claim_assessment($1,$2)',['c'.repeat(64),users[0]])).rejects.toThrow(/Forbidden/);
    expect(await scalar('select dc_claim_assessment($1,$2) as value',['c'.repeat(64),outsider])).toBe(a);
    expect(await scalar('select status as value from dc_assessment_sessions where id=$1',[a])).toBe('submitted');
    expect(await scalar("select payload->'profile'->>'email' as value from dc_assessment_sessions where id=$1",[a])).toBe('simulation@example.org');
    expect(await scalar('select owner_id as value from dc_umkm_profiles where id=$1',[id])).toBe(outsider);
    expect(await scalar('select dc_claim_assessment($1,$2) as value',['c'.repeat(64),outsider])).toBe(a);
    const other=randomUUID();await db.query('insert into auth.users values($1)',[other]);
    await expect(db.query('select dc_claim_assessment($1,$2)',['c'.repeat(64),other])).rejects.toThrow(/another account/);
    await expect(db.query('select dc_claim_assessment($1,$2)',['d'.repeat(64),other])).rejects.toThrow(/expired/);
    await db.exec('set role authenticated');
    try{await expect(db.query('select dc_claim_assessment($1,$2)',['c'.repeat(64),outsider])).rejects.toThrow(/permission denied/);}finally{await db.exec('reset role');}
  });
  it('learning keeps best completion and scores; other users cannot read or forge progress',async()=>{
    const first=await scalar("select (dc_ensure_learning_access($1)).starts_at::text as value",[outsider]);
    const expires=await scalar("select (dc_ensure_learning_access($1)).expires_at::text as value",[outsider]);
    expect(new Date(expires).getTime()-new Date(first).getTime()).toBe(7*86400_000);
    expect(await scalar("select (dc_ensure_learning_access($1)).starts_at::text as value",[outsider])).toBe(first);
    await expect(db.query("select dc_ensure_learning_access($1)",[users[0]])).rejects.toThrow(/Final checkup required/);
    await db.query("select dc_save_learning($1,'DL-FREE-1.0','A1','__quiz','',true,100)",[outsider]);
    await db.query("select dc_save_learning($1,'DL-FREE-1.0','A1','__quiz','',false,0)",[outsider]);
    expect(Number(await scalar('select quiz_score as value from dc_learning_progress where user_id=$1',[outsider]))).toBe(100);
    expect(await scalar('select completed as value from dc_learning_progress where user_id=$1',[outsider])).toBe(true);
    await db.exec('set role authenticated');
    try{
      await db.query("select set_config('request.jwt.claim.sub',$1,false)",[users[0]]);
      expect(Number(await scalar('select count(*) as value from dc_learning_progress'))).toBe(0);
      await db.query("select set_config('request.jwt.claim.sub',$1,false)",[outsider]);
      expect(Number(await scalar('select count(*) as value from dc_learning_progress'))).toBe(1);
      await expect(db.query('update dc_learning_progress set quiz_score=100')).rejects.toThrow(/permission denied/);
      await expect(db.query("select dc_save_learning($1,'DL-FREE-1.0','A1','__quiz','',true,100)",[outsider])).rejects.toThrow(/permission denied/);
    }finally{await db.exec('reset role');}
  });
  it('supports email-free expert assignments without creating Auth users, while keeping final answers immutable',async()=>{
    const usersBefore=await scalar('select count(*) as value from auth.users');
    const draft={...blankExpert(),profile:{name:'SIMULASI TANPA EMAIL',institution:'TEST',jobTitle:'TEST',expertise:'TEST',experienceYears:2,consent:true,assessmentDate:'2026-09-10'},decision:'layak_uji_coba',reviews:Object.fromEntries(instrument.questions.map(q=>[q.code,{relevance:4,clarity:4,suggestion:''}])),pairs,relevance};
    const emailFree:string[]=[];
    for(let i=0;i<3;i++){
      const id=await scalar("insert into dc_expert_assignments(instrument_id,code) values($1,$2) returning id as value",[version,`SIMULASI-NO-EMAIL-${i}`]);emailFree.push(id);
      await db.query('select dc_save_expert($1,null,$2,0,false)',[id,draft]);
      await expect(db.query('select dc_save_expert($1,$2,$3,1,false)',[id,users[0],draft])).rejects.toThrow(/Forbidden/);
      await db.query('select dc_save_expert($1,null,$2,1,true)',[id,validateExpertFinal(draft)]);
      expect(await scalar('select status as value from dc_expert_assignments where id=$1',[id])).toBe('submitted');
      await expect(db.query("update dc_expert_assignments set payload='{}' where id=$1",[id])).rejects.toThrow(/immutable/);
    }
    const emailFreeVersion=await scalar("select dc_clone_model($1,'DC-MODEL-NO-EMAIL',$2) as value",[modelVersion,admin]);
    expect(await scalar("select dc_freeze_model($1,$2,$3,$4,$5,$6) as value",[emailFreeVersion,emailFree,inputHash({emailFree}),{experts:[input,input,input]},compiled,admin])).toBeTruthy();
    expect(await scalar('select count(*) as value from auth.users')).toBe(usersBefore);
    await db.exec('set role anon');
    try{await expect(db.query('select dc_save_expert($1,null,$2,0,false)',[emailFree[0],draft])).rejects.toThrow(/permission denied/);}finally{await db.exec('reset role');}
  });
});
