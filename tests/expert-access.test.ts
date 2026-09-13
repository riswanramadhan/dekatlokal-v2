import { beforeEach, afterEach, expect, it, vi } from "vitest";
const m=vi.hoisted(()=>({cookie:undefined as string|undefined,set:vi.fn(),remove:vi.fn(),client:vi.fn(),actor:vi.fn()}));
vi.mock("server-only",()=>({}));
vi.mock("next/headers",()=>({cookies:async()=>({get:()=>m.cookie?{value:m.cookie}:undefined,set:m.set,delete:m.remove})}));
vi.mock("@/lib/supabase/server",()=>({serviceClient:m.client,currentActor:m.actor,supabaseConfigured:()=>true}));
import { enterExpert, expertEntry, expertRoster, requireExpertActor } from "@/lib/digital-checkup/expert-access";
const ids=["10000000-0000-4000-8000-000000000001","10000000-0000-4000-8000-000000000002","10000000-0000-4000-8000-000000000003"];
beforeEach(()=>{
  vi.resetAllMocks();m.cookie=undefined;
  vi.stubEnv("DC_EXPERT_SESSION_SECRET","SIMULATION-SECRET-NOT-PRODUCTION-123456");
  vi.stubEnv("DC_EXPERT_ALLOW_PUBLIC_ENTRY","false");
  vi.stubEnv("DC_EXPERT_ROSTER",JSON.stringify(ids.map((assignmentId,i)=>({name:"SIMULASI "+i,assignmentId,accessCode:"SIMULATED-CODE-"+i}))));
  const chain={select:()=>chain,eq:()=>chain,single:async()=>({data:{id:ids[0],expert_user_id:"EXPERT-USER"},error:null})};
  m.client.mockReturnValue({from:()=>chain});m.actor.mockResolvedValue(null);
});
afterEach(()=>vi.unstubAllEnvs());
it("requires exactly three genuine configured assignments; public entry requires explicit opt-in",()=>{
  expect(expertRoster()).toHaveLength(3);
  vi.stubEnv("DC_EXPERT_ROSTER",JSON.stringify(ids.map((assignmentId,i)=>({name:"SIMULASI "+i,assignmentId}))));
  expect(expertRoster()).toEqual([]);
  vi.stubEnv("DC_EXPERT_ALLOW_PUBLIC_ENTRY","true");expect(expertRoster()).toHaveLength(3);
});
it("rejects wrong access codes before setting a session",async()=>{
  await expect(enterExpert(0,"incorrect")).rejects.toThrow("Kode belum cocok");
  expect(m.set).not.toHaveBeenCalled();
});
it("enters without email and binds access to only the selected assignment",async()=>{
  await enterExpert(0,"SIMULATED-CODE-0");
  m.cookie=m.set.mock.calls[0][1];
  expect((await expertEntry())?.assignmentId).toBe(ids[0]);
  expect(await requireExpertActor()).toMatchObject({id:"EXPERT-USER",assignmentId:ids[0]});
  expect(m.set.mock.calls[0][2]).toMatchObject({httpOnly:true,sameSite:"lax",maxAge:28800});
  m.cookie=m.cookie+"tampered";expect(await expertEntry()).toBeNull();
});
it("also supports a real assignment without an Auth user",async()=>{
  const chain={select:()=>chain,eq:()=>chain,single:async()=>({data:{id:ids[0],expert_user_id:null},error:null})};
  m.client.mockReturnValue({from:()=>chain});
  await enterExpert(0,"SIMULATED-CODE-0");m.cookie=m.set.mock.calls[0][1];
  expect(await requireExpertActor()).toMatchObject({id:null,assignmentId:ids[0]});
});
