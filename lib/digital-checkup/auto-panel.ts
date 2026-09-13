import "server-only";
import { expertRoster } from "./expert-access";
import { serviceClient } from "@/lib/supabase/server";
import { freezeModel } from "./service";
import { dbError } from "./http";
export async function processExpertPanel() {
  const roster=expertRoster();
  if(roster.length!==3)return null;
  const db=serviceClient(),ids=roster.map(x=>x.assignmentId);
  const {data:assignments,error}=await db.from("dc_expert_assignments").select("id,status,instrument_id").in("id",ids);dbError(error);
  if(assignments?.length!==3 || assignments.some(x=>x.status!=="submitted") || new Set(assignments.map(x=>x.instrument_id)).size!==1)return null;
  const configuredVersion=process.env.DC_AUTO_MODEL_VERSION;
  let versionQuery=db.from("dc_decision_model_versions").select("id,instrument_id,frozen_at").eq("instrument_id",assignments[0].instrument_id);
  if(configuredVersion)versionQuery=versionQuery.eq("id",configuredVersion);
  const {data:version,error:ve}=await versionQuery.order("created_at",{ascending:false}).limit(1).maybeSingle();dbError(ve);
  if(!version || version.frozen_at)return null;
  let actor=process.env.DC_AUTO_MODEL_APPROVER;
  if(!actor){
    const {data:approver,error:ae}=await db.from("dc_profiles").select("user_id").in("role",["admin","researcher"]).order("user_id").limit(1).maybeSingle();dbError(ae);
    actor=approver?.user_id;
  }
  if(!actor)return null;
  return freezeModel(version.id,ids,actor);
}
