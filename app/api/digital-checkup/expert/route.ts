import { z } from "zod";
import { serviceClient, requireActor } from "@/lib/supabase/server";
import { blankExpert, caseSchema, expertDraftSchema, validateExpertFinal } from "@/lib/digital-checkup/validation";
import { blindCase, type AssessmentRow, type ExpertRow } from "@/lib/digital-checkup/service";
import { dbError, failure, json, readBody } from "@/lib/digital-checkup/http";

export async function GET() {
  try {
    const actor = await requireActor(["expert"]), db = serviceClient();
    const { data, error } = await db.from("dc_expert_assignments").select("*").eq("expert_user_id", actor.id); dbError(error);
    const assignments = (data as ExpertRow[]).map((e) => ({ ...e, payload: Object.keys(e.payload).length ? e.payload : blankExpert() }));
    const ids = assignments.map((e) => e.id);
    if (!ids.length) return json({ assignments: [], cases: [] });
    const { data: cases, error: ce } = await db.from("dc_expert_case_assignments").select("id,status,payload,assessment_id").in("expert_assignment_id", ids); dbError(ce);
    const safeCases = [];
    for (const row of cases ?? []) {
      const { data: assessment, error: ae } = await db.from("dc_assessment_sessions").select("*").eq("id", row.assessment_id).eq("status", "submitted").single(); dbError(ae);
      const { data: business } = await db.from("dc_umkm_profiles").select("code").eq("id", assessment!.umkm_id).single();
      safeCases.push(blindCase(row, assessment as AssessmentRow, String(business?.code)));
    }
    return json({ assignments, cases: safeCases });
  } catch (e) { return failure(e); }
}
export async function POST(request: Request) {
  try {
    const actor = await requireActor(["expert"]);
    const input = z.object({ kind: z.enum(["stage1", "case"]), id: z.string().uuid(), revision: z.number().int().min(0).default(0), final: z.boolean(), confirmed: z.boolean().default(false), payload: z.unknown() }).parse(await readBody(request));
    const db = serviceClient();
    if (input.final && !input.confirmed) throw new Error("Konfirmasi sebelum mengirim penilaian final.");
    if (input.kind === "case") {
      const payload = caseSchema.parse({ ...(input.payload as object), final: input.final, confirmed: input.confirmed });
      const { data, error } = await db.rpc("dc_save_case", { p_id: input.id, p_actor: actor.id, p_payload: payload, p_final: input.final }); dbError(error); return json(data);
    }
    const payload = input.final ? validateExpertFinal(input.payload) : expertDraftSchema.parse(input.payload);
    const { data, error } = await db.rpc("dc_save_expert", { p_id: input.id, p_actor: actor.id, p_payload: payload, p_revision: input.revision, p_final: input.final }); dbError(error); return json(data);
  } catch (e) { return failure(e); }
}
