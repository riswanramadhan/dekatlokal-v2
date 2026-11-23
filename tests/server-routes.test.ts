import { beforeEach, expect, it, vi } from 'vitest';
import { buildModel, DIMENSIONS, instrument, MODULES, PAIRS, topsis, type ExpertInput } from '@/lib/decision-engine';
const mocks=vi.hoisted(()=>({actor:vi.fn(),client:vi.fn()}));
vi.mock('server-only',()=>({}));
vi.mock('@/lib/supabase/server',()=>({requireActor:mocks.actor,serviceClient:mocks.client}));
vi.mock('@/lib/digital-checkup/expert-access',()=>({requireExpertActor:()=>mocks.actor(["expert"]),expertRoster:()=>[],expertEntry:async()=>null}));
import { GET as expertGet } from '@/app/api/digital-checkup/expert/route';
import { GET as researchGet } from '@/app/api/digital-checkup/research/route';
import { POST as researchPost } from '@/app/api/digital-checkup/research/route';
import { readBody, sameOrigin } from '@/lib/digital-checkup/http';
const answers=Object.fromEntries(instrument.questions.map(q=>[q.code,2]));
const panelExpert=(offset=0):ExpertInput=>({pairs:PAIRS.map(pair=>({...pair,preferred:'equal',intensity:1})),relevance:Object.fromEntries(MODULES.map((module,i)=>[module,Object.fromEntries(DIMENSIONS.map((dimension,j)=>[dimension,(i+j+offset)%5]))]))});
function builder(result:unknown){const chain={select:()=>chain,eq:()=>chain,in:()=>chain,contains:()=>chain,limit:()=>chain,delete:()=>chain,order:()=>chain,range:()=>chain,single:()=>Promise.resolve({data:result,error:null}),then:(resolve:(x:unknown)=>unknown)=>Promise.resolve({data:result,error:null}).then(resolve)};return chain;}
beforeEach(()=>{vi.resetAllMocks();});
it('caps actual request bytes without trusting Content-Length',async()=>{
  const request=new Request('http://localhost/api/test',{method:'POST',headers:{Origin:'http://localhost'},body:'x'.repeat(180001)});
  await expect(readBody(request)).rejects.toThrow('Data terlalu besar.');
  await expect(readBody(new Request('http://localhost/api/test',{method:'POST',headers:{Origin:'http://localhost'},body:'{invalid'}))).rejects.toThrow('Format data');
});
it('expert endpoint whitelists blinded metadata; no model or other expert query',async()=>{
  mocks.actor.mockResolvedValue({id:'expert',role:'expert'});
  const from=vi.fn().mockImplementationOnce(()=>builder([{id:'assignment',payload:{},expert_user_id:'expert'}])).mockImplementationOnce(()=>builder([{id:'case',status:'draft',payload:{},assessment_id:'assessment'}])).mockImplementationOnce(()=>builder({id:'assessment',umkm_id:'business',token_hash:'SECRET_TOKEN',payload:{answers,profile:{sector:'Test',businessAgeMonths:4,peopleCount:2,respondentRole:'Pemilik',salesChannels:['Toko'],goal:'PRIVATE',note:'PRIVATE'}}})).mockImplementationOnce(()=>builder({code:'UMKM-SIMULATION'}));
  mocks.client.mockReturnValue({from});
  const response=await expertGet(),body=await response.json();
  expect(response.status).toBe(200);
  expect(Object.keys(body.cases[0]).sort()).toEqual(['id','status','payload','code','metadata','answers','scores'].sort());
  expect(JSON.stringify(body)).not.toMatch(/SECRET_TOKEN|PRIVATE|canonical_input|topSet|Dplus|model_input/);
  expect(from.mock.calls.map(c=>c[0])).not.toContain('dc_decision_runs');
});
it('research endpoint rejects expert before any service query',async()=>{
  mocks.actor.mockRejectedValue(new Error('Akses tidak diizinkan.'));
  const response=await researchGet(new Request('http://localhost/api/digital-checkup/research?format=json'));
  expect(response.status).toBe(400);expect(mocks.client).not.toHaveBeenCalled();
});
it('research exports exclude tokens, contacts, identity and free-text notes',async()=>{
  mocks.actor.mockResolvedValue({id:'admin',role:'admin'});
  const rows:Record<string,unknown[]>={dc_assessment_sessions:[{id:'assessment',umkm_id:'business',payload:{answers,profile:{sector:'Test',district:'Test',goal:'PRIVATE',note:'PRIVATE'}},token_hash:'SECRET_TOKEN'}],dc_umkm_profiles:[{id:'business',code:'UMKM-SIMULATION',email:'PRIVATE'}],dc_expert_assignments:[{id:'expert',code:'EXPERT-SIMULATION',payload:{profile:{name:'PRIVATE',institution:'PRIVATE'},reviews:{Q01:{relevance:4,clarity:4,suggestion:'PRIVATE'}},pairs:[],relevance:{}}}]};
  mocks.client.mockReturnValue({from:(t:string)=>builder(rows[t]??[])});
  const response=await researchGet(new Request('http://localhost/api/digital-checkup/research?format=json'));
  expect(response.status).toBe(200);const text=await response.text();expect(text).toContain('UMKM-SIMULATION');expect(text).not.toMatch(/PRIVATE|SECRET_TOKEN|token_hash|email/);
});
it('provides an anonymized Colab-ready result file for authorized admins',async()=>{
  mocks.actor.mockResolvedValue({id:'admin',role:'admin'});
  const rows:Record<string,unknown[]>={dc_assessment_sessions:[{id:'assessment',umkm_id:'business',instrument_id:'instrument',status:'submitted',revision_number:1,submitted_at:'2026-09-14T00:00:00Z',payload:{answers,profile:{sector:'Test',district:'Test',businessAgeMonths:12,peopleCount:1,respondentRole:'Pemilik',salesChannels:['WhatsApp'],email:'PRIVATE',whatsapp:'PRIVATE'}}}],dc_umkm_profiles:[{id:'business',code:'UMKM-SIMULATION'}]};
  mocks.client.mockReturnValue({from:(t:string)=>builder(rows[t]??[])});
  const response=await researchGet(new Request('http://localhost/api/digital-checkup/research?format=colab'));
  expect(response.status).toBe(200);
  expect(response.headers.get('content-disposition')).toContain('digital-checkup-colab.json');
  const body=await response.json();
  expect(body).toMatchObject({schemaVersion:'DL-COLAB-1.0',records:[{umkmCode:'U001'}]});
  expect(body.records[0].dimensionScores).toHaveLength(8);
  const serialized=JSON.stringify(body);
  expect(serialized).not.toContain('PRIVATE');
  expect(serialized).not.toMatch(/"(?:email|whatsapp)":/i);
});
it('exports canonical input and the complete production trace for notebook parity',async()=>{
  mocks.actor.mockResolvedValue({id:'admin',role:'admin'});
  const experts=[panelExpert(),panelExpert(1),panelExpert(2)],model=buildModel(experts),trace=topsis(answers,model.w,model.R);
  const canonicalInput={instrumentVersion:instrument.version,modelVersion:instrument.modelVersion,dimensionCodes:DIMENSIONS,moduleCodes:MODULES,experts,answers};
  const rows:Record<string,unknown[]>={
    dc_assessment_sessions:[{id:'assessment',umkm_id:'business',instrument_id:'instrument',status:'submitted',revision_number:1,submitted_at:'2026-09-14T00:00:00Z',payload:{answers,profile:{sector:'Test',district:'Test'}}}],
    dc_umkm_profiles:[{id:'business',code:'UMKM-PRIVATE-CODE'}],
    dc_decision_runs:[{id:'run',assessment_id:'assessment',model_input_id:'model',status:trace.status,trace,canonical_input:canonicalInput,sensitivity:[],created_at:'2026-09-14T00:00:00Z',input_hash:'hash',build_id:'test'}],
    dc_decision_model_inputs:[{id:'model',model_version_id:'version',expert_ids:['e1','e2','e3'],input_hash:'model-hash',trace:model,created_at:'2026-09-14T00:00:00Z'}],
  };
  mocks.client.mockReturnValue({from:(table:string)=>builder(rows[table]??[])});
  const response=await researchGet(new Request('http://localhost/api/digital-checkup/research?format=colab&run=run'));
  const body=await response.json();
  expect(body.records[0]).toMatchObject({umkmCode:'U001',canonicalInput,run:{trace:{w:model.w,R:model.R,S:trace.S,g:trace.g,H:trace.H,q:trace.q,C:trace.C,rank:trace.rank}}});
  expect(JSON.stringify(body)).not.toContain('UMKM-PRIVATE-CODE');
});
it('numbers businesses by first submission across the full list, even when a single run is exported',async()=>{
  mocks.actor.mockResolvedValue({id:'admin',role:'admin'});
  const experts=[panelExpert(),panelExpert(1),panelExpert(2)],model=buildModel(experts),trace=topsis(answers,model.w,model.R);
  const canonicalInput={instrumentVersion:instrument.version,modelVersion:instrument.modelVersion,dimensionCodes:DIMENSIONS,moduleCodes:MODULES,experts,answers};
  const session=(id:string,umkm:string,submitted:string|null,status='submitted')=>({id,umkm_id:umkm,instrument_id:'instrument',status,revision_number:1,submitted_at:submitted,payload:{answers,profile:{businessName:`Usaha ${umkm}`,sector:'Test',district:'Test'}}});
  const rows:Record<string,unknown[]>={
    dc_assessment_sessions:[session('a-later','biz-later','2026-09-20T00:00:00Z'),session('a-first','biz-first','2026-09-10T00:00:00Z'),session('a-draft','biz-draft',null,'draft')],
    dc_umkm_profiles:[{id:'biz-first',code:'UMKM-A'},{id:'biz-later',code:'UMKM-B'},{id:'biz-draft',code:'UMKM-C'}],
    dc_decision_runs:[{id:'run-later',assessment_id:'a-later',model_input_id:'model',status:trace.status,trace,canonical_input:canonicalInput,sensitivity:[],created_at:'2026-09-21T00:00:00Z',input_hash:'hash',build_id:'test'}],
    dc_decision_model_inputs:[{id:'model',model_version_id:'version',expert_ids:['e1','e2','e3'],input_hash:'model-hash',trace:model,created_at:'2026-09-14T00:00:00Z'}],
  };
  mocks.client.mockReturnValue({from:(table:string)=>builder(rows[table]??[])});
  const colab=await (await researchGet(new Request('http://localhost/api/digital-checkup/research?format=colab&run=run-later'))).json();
  expect(colab.records).toHaveLength(1);expect(colab.records[0].umkmCode).toBe('U002');
  const dashboard=await (await researchGet(new Request('http://localhost/api/digital-checkup/research'))).json();
  const byId=Object.fromEntries(dashboard.assessments.map((a:{id:string;demoCode:string|null})=>[a.id,a.demoCode]));
  expect(byId).toEqual({'a-first':'U001','a-later':'U002','a-draft':null});
  expect(byId['a-later']).toBe(colab.records[0].umkmCode);
  const readable=await (await researchGet(new Request('http://localhost/api/digital-checkup/research?format=umkm-answers'))).json();
  expect(readable.businesses.find((b:{businessName:string})=>b.businessName==='Usaha biz-later').code).toBe('U002');
});
it('downloads readable expert assessments and UMKM answers without direct contact data',async()=>{
  mocks.actor.mockResolvedValue({id:'admin',role:'admin'});
  const reviews=Object.fromEntries(instrument.questions.map(question=>[question.code,{relevance:4,clarity:3,suggestion:''}]));
  const expertPayload={profile:{name:'Ayu Anisela',institution:'Rumah BUMN Makassar',jobTitle:'CFO',experienceYears:4,expertise:'UMKM',assessmentDate:'2026-09-14'},reviews,decision:'layak_uji_coba',generalNote:'Catatan panel',pairs:PAIRS.map(pair=>({...pair,preferred:'equal',intensity:1})),relevance:panelExpert().relevance,consistency:{lambdaMax:8,CI:0,CR:0,consistent:true}};
  const rows:Record<string,unknown[]>={
    dc_expert_assignments:[{id:'723c62f6-af29-43b8-8e9a-32d8923d0f0e',code:'AHLI-01',instrument_id:'instrument',status:'submitted',revision:1,stage1_submitted_at:'2026-09-14T00:00:00Z',payload:expertPayload}],
    dc_decision_model_inputs:[{id:'model',expert_ids:['723c62f6-af29-43b8-8e9a-32d8923d0f0e']}],
    dc_assessment_sessions:[{id:'assessment',umkm_id:'business',instrument_id:'instrument',status:'submitted',revision_number:1,payload:{answers,profile:{businessName:'Warung Uji',email:'PRIVATE@EXAMPLE.ORG',whatsapp:'081234567890',sector:'Kuliner',district:'Makassar',businessAgeMonths:12,peopleCount:2,respondentRole:'Pemilik',salesChannels:['WhatsApp'],goal:'Rapikan pemasaran',note:''}}}],
    dc_umkm_profiles:[{id:'business',code:'UMKM-LONG-CODE'}],
  };
  mocks.client.mockReturnValue({from:(table:string)=>builder(rows[table]??[])});
  const expertResponse=await researchGet(new Request('http://localhost/api/digital-checkup/research?format=expert-assessments'));
  const expertReport=await expertResponse.json();
  expect(expertResponse.headers.get('content-disposition')).toContain('hasil-penilaian-ahli.json');
  expect(expertReport.experts[0]).toMatchObject({name:'Ayu Anisela',usedInModel:true,completion:{questionReviews:32,pairwise:28,relevance:56}});
  expect(expertReport.experts[0].questionReviews).toHaveLength(32);
  const umkmResponse=await researchGet(new Request('http://localhost/api/digital-checkup/research?format=umkm-answers'));
  const umkmReport=await umkmResponse.json();
  expect(umkmResponse.headers.get('content-disposition')).toContain('jawaban-digital-checkup-umkm.json');
  expect(umkmReport.businesses[0]).toMatchObject({code:'U001',businessName:'Warung Uji',completion:{answered:32,total:32}});
  expect(umkmReport.businesses[0].answers).toHaveLength(32);
  expect(JSON.stringify(umkmReport)).not.toMatch(/PRIVATE@EXAMPLE\.ORG|081234567890|"email"\s*:|"whatsapp"\s*:/i);
});
it('allows deleting only an unused expert draft',async()=>{
  mocks.actor.mockResolvedValue({id:'admin',role:'admin'});
  const from=vi.fn((table:string)=>builder(table==='dc_decision_model_inputs'?[]:{id:'723c62f6-af29-43b8-8e9a-32d8923d0f0e',status:'draft'}));
  mocks.client.mockReturnValue({from});
  const response=await researchPost(new Request('http://localhost/api/digital-checkup/research',{method:'POST',headers:{Origin:'http://localhost','Content-Type':'application/json'},body:JSON.stringify({action:'deleteExpert',id:'723c62f6-af29-43b8-8e9a-32d8923d0f0e',confirmed:true})}));
  expect(response.status).toBe(200);expect(await response.json()).toEqual({ok:true});
  expect(from).toHaveBeenCalledWith('dc_expert_assignments');
});
it('refuses to delete an expert assessment already used by a model',async()=>{
  mocks.actor.mockResolvedValue({id:'admin',role:'admin'});
  mocks.client.mockReturnValue({from:()=>builder([{id:'model-input'}])});
  const response=await researchPost(new Request('http://localhost/api/digital-checkup/research',{method:'POST',headers:{Origin:'http://localhost','Content-Type':'application/json'},body:JSON.stringify({action:'deleteExpert',id:'723c62f6-af29-43b8-8e9a-32d8923d0f0e',confirmed:true})}));
  expect(response.status).toBe(400);expect(await response.json()).toMatchObject({error:expect.stringContaining('sudah dipakai model')});
});
it('rejects cross-site and missing Origin writes',()=>{
  expect(()=>sameOrigin(new Request('http://localhost/api/test',{headers:{Origin:'https://attacker.invalid'}}))).toThrow();
  expect(()=>sameOrigin(new Request('http://localhost/api/test'))).toThrow();
  expect(()=>sameOrigin(new Request('http://localhost/api/test',{headers:{Origin:'http://localhost'}}))).not.toThrow();
});
