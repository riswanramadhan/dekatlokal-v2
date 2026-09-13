import { beforeEach, afterEach, expect, it, vi } from "vitest";
const m=vi.hoisted(()=>({roster:vi.fn(),client:vi.fn(),freeze:vi.fn(),assignments:[] as {id:string;status:string;instrument_id:string}[]}));
vi.mock("server-only",()=>({}));
vi.mock("@/lib/digital-checkup/expert-access",()=>({expertRoster:m.roster}));
vi.mock("@/lib/supabase/server",()=>({serviceClient:m.client}));
vi.mock("@/lib/digital-checkup/service",()=>({freezeModel:m.freeze}));
import { processExpertPanel } from "@/lib/digital-checkup/auto-panel";
beforeEach(()=>{
  vi.resetAllMocks();vi.stubEnv("DC_AUTO_MODEL_APPROVER","APPROVER");vi.stubEnv("DC_AUTO_MODEL_VERSION","VERSION");
  m.assignments=["E1","E2","E3"].map(id=>({id,status:"submitted",instrument_id:"I"}));
  m.roster.mockReturnValue(m.assignments.map(a=>({assignmentId:a.id})));
  m.client.mockReturnValue({from:(table:string)=>{const chain={select:()=>chain,eq:()=>chain,in:()=>chain,single:async()=>({data:{id:"VERSION",instrument_id:"I",frozen_at:null},error:null}),then:(resolve:(value:unknown)=>unknown)=>Promise.resolve({data:table==="dc_expert_assignments"?m.assignments:[],error:null}).then(resolve)};return chain;}});
  m.freeze.mockResolvedValue("MODEL");
});
afterEach(()=>vi.unstubAllEnvs());
it("automatically processes the configured panel after exactly three final expert assessments",async()=>{
  expect(await processExpertPanel()).toBe("MODEL");
  expect(m.freeze).toHaveBeenCalledWith("VERSION",["E1","E2","E3"],"APPROVER");
});
it("never substitutes incomplete assessments or mixes instruments",async()=>{
  m.assignments[2].status="draft";expect(await processExpertPanel()).toBeNull();
  m.assignments[2].status="submitted";m.assignments[2].instrument_id="OTHER";
  expect(await processExpertPanel()).toBeNull();expect(m.freeze).not.toHaveBeenCalled();
});
it("requires explicit model and approver configuration",async()=>{
  vi.stubEnv("DC_AUTO_MODEL_APPROVER","");expect(await processExpertPanel()).toBeNull();
  expect(m.freeze).not.toHaveBeenCalled();
});
