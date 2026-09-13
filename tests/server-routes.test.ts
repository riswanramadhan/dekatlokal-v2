import { beforeEach, expect, it, vi } from 'vitest';
import { instrument } from '@/lib/decision-engine';
const mocks=vi.hoisted(()=>({actor:vi.fn(),client:vi.fn()}));
vi.mock('server-only',()=>({}));
vi.mock('@/lib/supabase/server',()=>({requireActor:mocks.actor,serviceClient:mocks.client}));
vi.mock('@/lib/digital-checkup/expert-access',()=>({requireExpertActor:()=>mocks.actor(["expert"]),expertRoster:()=>[],expertEntry:async()=>null}));
import { GET as expertGet } from '@/app/api/digital-checkup/expert/route';
import { GET as researchGet } from '@/app/api/digital-checkup/research/route';
import { readBody, sameOrigin } from '@/lib/digital-checkup/http';
const answers=Object.fromEntries(instrument.questions.map(q=>[q.code,2]));
function builder(result:unknown){const chain={select:()=>chain,eq:()=>chain,in:()=>chain,order:()=>chain,range:()=>chain,single:()=>Promise.resolve({data:result,error:null}),then:(resolve:(x:unknown)=>unknown)=>Promise.resolve({data:result,error:null}).then(resolve)};return chain;}
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
  expect(body).toMatchObject({schemaVersion:'DL-COLAB-1.0',records:[{umkmCode:'UMKM-SIMULATION'}]});
  expect(body.records[0].dimensionScores).toHaveLength(8);
  const serialized=JSON.stringify(body);
  expect(serialized).not.toContain('PRIVATE');
  expect(serialized).not.toMatch(/"(?:email|whatsapp)":/i);
});
it('rejects cross-site and missing Origin writes',()=>{
  expect(()=>sameOrigin(new Request('http://localhost/api/test',{headers:{Origin:'https://attacker.invalid'}}))).toThrow();
  expect(()=>sameOrigin(new Request('http://localhost/api/test'))).toThrow();
  expect(()=>sameOrigin(new Request('http://localhost/api/test',{headers:{Origin:'http://localhost'}}))).not.toThrow();
});
