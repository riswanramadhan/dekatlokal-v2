import "server-only";
import { serviceClient } from "@/lib/supabase/server";
import { runAssessment, type AssessmentRow } from "./service";
import { dbError } from "./http";
import { processExpertPanel } from "./auto-panel";
export async function processRecommendationJobs() {
  let panelPending = false;
  try { await processExpertPanel(); } catch { panelPending = true; }
  const db = serviceClient(), deadline = Date.now() + 40_000;
  let completed = 0;
  for (let i = 0; i < 8 && Date.now() < deadline; i++) {
    const { data: job, error } = await db.rpc("dc_take_job"); dbError(error);
    if (!job?.id) break;
    try {
      const { data: assessment, error: ae } = await db.from("dc_assessment_sessions").select("*").eq("id", job.assessment_id).single(); dbError(ae);
      const run = await runAssessment(assessment as AssessmentRow, job.model_input_id);
      if (!run) throw new Error("Model not ready");
      const { error: doneError } = await db.from("dc_recommendation_jobs").update({ status: "done", lease_until: null }).eq("id", job.id); dbError(doneError); completed++;
    } catch {
      await db.from("dc_recommendation_jobs").update({ status: "queued", lease_until: null, available_at: new Date(Date.now() + Math.min(3600, 30 * 2 ** Math.min(job.attempts, 7)) * 1000).toISOString() }).eq("id", job.id);
    }
  }
  return { completed, panelPending };
}
