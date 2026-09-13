import { expertDirectory } from "@/lib/digital-checkup/expert-directory";
import { z } from "zod";
import { after } from "next/server";
import { processRecommendationJobs } from "@/lib/digital-checkup/jobs";
export const maxDuration = 60;
import { serviceClient } from "@/lib/supabase/server";
import { requireExpertActor } from "@/lib/digital-checkup/expert-access";
import { blankExpert, caseSchema, expertDraftSchema, validateExpertFinal } from "@/lib/digital-checkup/validation";
import { blindCase, type AssessmentRow, type ExpertRow } from "@/lib/digital-checkup/service";
import { dbError, failure, json, readBody } from "@/lib/digital-checkup/http";

export async function GET() {
  try {
    const actor = await requireExpertActor(), db = serviceClient();
    let query = db.from("dc_expert_assignments").select("*");
    if (actor.assignmentId) query = query.eq("id",actor.assignmentId);
    else query = query.eq("expert_user_id",actor.id);
    const { data, error } = await query; dbError(error);
    const assignments = (data as ExpertRow[]).map((e) => {
      const payload = Object.keys(e.payload).length ? e.payload : blankExpert();
      return { ...e, payload: actor.assignmentId && e.status !== "submitted" ? { ...payload, profile:{...payload.profile,name:actor.name, institution:expertDirectory.find(x=>x.name===actor.name)?.institution ?? payload.profile.institution, jobTitle:expertDirectory.find(x=>x.name===actor.name)?.jobTitle ?? payload.profile.jobTitle} } : payload };
    });
    const ids = assignments.map((e) => e.id);
    if (!ids.length) return json({ assignments: [], cases: [] });
    const { data: cases, error: ce } = await db.from("dc_expert_case_assignments").select("id,status,payload,assessment_id").in("expert_assignment_id", ids); dbError(ce);
    const safeCases = [];
    for (const row of cases ?? []) {
      const { data: assessment, error: ae } = await db.from("dc_assessment_sessions").select("*").eq("id", row.assessment_id).eq("status", "submitted").single(); dbError(ae);
      const { data: business } = await db.from("dc_umkm_profiles").select("code").eq("id", assessment!.umkm_id).single();
      safeCases.push(blindCase(row, assessment as AssessmentRow, String(business?.code)));
    }
    return json({ assignments, cases: safeCases, identityName: actor.assignmentId ? actor.name : null });
  } catch (e) { return failure(e); }
}
export async function POST(request: Request) {
  try {
    const actor = await requireExpertActor();
    const input = z.object({ kind: z.enum(["stage1", "case"]), id: z.string().uuid(), revision: z.number().int().min(0).default(0), final: z.boolean(), confirmed: z.boolean().default(false), payload: z.unknown() }).parse(await readBody(request));
    const db = serviceClient();
    if (actor.assignmentId) {
      if (input.kind === "stage1" && input.id !== actor.assignmentId) throw new Error("Penilaian ini bukan penugasanmu.");
      if (input.kind === "case") {
        const { data, error } = await db.from("dc_expert_case_assignments").select("id").eq("id",input.id).eq("expert_assignment_id",actor.assignmentId).maybeSingle(); dbError(error);
        if (!data) throw new Error("Kasus ini bukan penugasanmu.");
      }
    }
    if (input.final && !input.confirmed) throw new Error("Konfirmasi sebelum mengirim penilaian final.");
    if (input.kind === "case") {
      const payload = caseSchema.parse({ ...(input.payload as object), final: input.final, confirmed: input.confirmed });
      const { data, error } = await db.rpc("dc_save_case", { p_id: input.id, p_actor: actor.id, p_payload: payload, p_final: input.final }); dbError(error); return json(data);
    }
    const incoming = expertDraftSchema.parse(input.payload);
    if(actor.assignmentId) incoming.profile.name=actor.name;
    const payload = input.final ? validateExpertFinal(incoming) : incoming;
    const { data, error } = await db.rpc("dc_save_expert", { p_id: input.id, p_actor: actor.id, p_payload: payload, p_revision: input.revision, p_final: input.final }); dbError(error);
    if(input.final) after(async()=>{try{await processRecommendationJobs();}catch{/* Durable scheduler retries; final answers are already safe. */}});
    return json(data);
  } catch (e) { return failure(e); }
}
