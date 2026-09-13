import "server-only";
import { expertRoster } from "./expert-access";
import { serviceClient } from "@/lib/supabase/server";
import { freezeModel } from "./service";
import { dbError } from "./http";
export async function processExpertPanel() {
  const roster=expertRoster(), actor=process.env.DC_AUTO_MODEL_APPROVER, versionId=process.env.DC_AUTO_MODEL_VERSION;
  if(roster.length!==3 || !actor || !versionId) return null;
  const db=serviceClient();
  const {data:version,error:ve}=await db.from("dc_decision_model_versions").select("id,instrument_id,frozen_at").eq("id",versionId).single();dbError(ve);
  if(version?.frozen_at)return null;
  const ids=roster.map(x=>x.assignmentId);
  const {data:assignments,error}=await db.from("dc_expert_assignments").select("id,status,instrument_id").in("id",ids);dbError(error);
  if(assignments?.length!==3 || assignments.some(x=>x.status!=="submitted" || x.instrument_id!==version?.instrument_id))return null;
  return freezeModel(versionId,ids,actor);
}
