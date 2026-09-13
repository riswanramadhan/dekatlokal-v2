import { afterEach, beforeEach, expect, it, vi } from "vitest";

const m=vi.hoisted(()=>({
  roster:vi.fn(),client:vi.fn(),freeze:vi.fn(),
}));
vi.mock("server-only",()=>({}));
vi.mock("@/lib/digital-checkup/expert-access",()=>({expertRoster:m.roster}));
vi.mock("@/lib/supabase/server",()=>({serviceClient:m.client}));
vi.mock("@/lib/digital-checkup/service",()=>({freezeModel:m.freeze}));
import { processExpertPanel } from "@/lib/digital-checkup/auto-panel";

type Assignment={id:string;status:string;instrument_id:string};
let assignments:Assignment[];
let approver:{user_id:string}|null;
let version:{id:string;instrument_id:string;frozen_at:string|null}|null;
function query(table:string){
  const result=()=>table==="dc_expert_assignments"?assignments:table==="dc_profiles"?approver:version;
  const chain={
    select:()=>chain,eq:()=>chain,in:()=>chain,order:()=>chain,limit:()=>chain,
    maybeSingle:async()=>({data:result(),error:null}),
    then:(resolve:(value:unknown)=>unknown)=>Promise.resolve({data:result(),error:null}).then(resolve),
  };
  return chain;
}
beforeEach(()=>{
  vi.resetAllMocks();vi.stubEnv("DC_AUTO_MODEL_APPROVER","APPROVER");vi.stubEnv("DC_AUTO_MODEL_VERSION","VERSION");
  assignments=["E1","E2","E3"].map(id=>({id,status:"submitted",instrument_id:"I"}));
  approver={user_id:"FALLBACK"};version={id:"VERSION",instrument_id:"I",frozen_at:null};
  m.roster.mockReturnValue(assignments.map(item=>({assignmentId:item.id})));
  m.client.mockReturnValue({from:query});
  m.freeze.mockResolvedValue("MODEL");
});
afterEach(()=>vi.unstubAllEnvs());

it("automatically processes exactly three final expert assessments",async()=>{
  expect(await processExpertPanel()).toBe("MODEL");
  expect(m.freeze).toHaveBeenCalledWith("VERSION",["E1","E2","E3"],"APPROVER");
});
it("never substitutes incomplete assessments or mixes instruments",async()=>{
  assignments[2].status="draft";expect(await processExpertPanel()).toBeNull();
  assignments[2].status="submitted";assignments[2].instrument_id="OTHER";
  expect(await processExpertPanel()).toBeNull();expect(m.freeze).not.toHaveBeenCalled();
});
it("uses the latest matching model version and an existing privileged approver when env ids are absent",async()=>{
  vi.stubEnv("DC_AUTO_MODEL_APPROVER","");vi.stubEnv("DC_AUTO_MODEL_VERSION","");
  expect(await processExpertPanel()).toBe("MODEL");
  expect(m.freeze).toHaveBeenCalledWith("VERSION",["E1","E2","E3"],"FALLBACK");
});
it("does not freeze without an existing admin or researcher",async()=>{
  vi.stubEnv("DC_AUTO_MODEL_APPROVER","");approver=null;
  expect(await processExpertPanel()).toBeNull();expect(m.freeze).not.toHaveBeenCalled();
});
