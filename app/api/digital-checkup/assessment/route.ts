import { z } from "zod";
import { after } from "next/server";
import { processRecommendationJobs } from "@/lib/digital-checkup/jobs";
import { assessmentSchema, profileSchema } from "@/lib/digital-checkup/validation";
import { guestAssessment, publicAssessment, runAssessment, startAssessment, type AssessmentRow } from "@/lib/digital-checkup/service";
import { dbError, failure, json, readBody } from "@/lib/digital-checkup/http";
import { currentActor, serviceClient, supabaseConfigured } from "@/lib/supabase/server";
import { expertEntry } from "@/lib/digital-checkup/expert-access";
export const maxDuration = 60;

async function requireUmkmAccess() {
  if (await expertEntry()) throw new Error("Selesaikan sesi ahli sebelum membuka checkup UMKM.");
  if (supabaseConfigured() && (await currentActor())?.role === "expert") throw new Error("Gunakan ruang ahli untuk penilaian kasus. Akun ahli tidak membuka hasil UMKM.");
}

export async function GET() {
  try { await requireUmkmAccess(); const assessment = await guestAssessment(); return json(assessment ? await publicAssessment(assessment) : null); } catch (e) { return failure(e); }
}
export async function POST(request: Request) {
  try {
    await requireUmkmAccess();
    const input = z.object({ profile: profileSchema, revision: z.boolean().optional() }).parse(await readBody(request));
    const existing = await guestAssessment();
    if (existing && !input.revision) return json(await publicAssessment(existing));
    if (!existing && input.profile.profileVersion !== 2) throw new Error("Lengkapi nama bisnis, email, dan WhatsApp melalui form terbaru.");
    if (input.revision && (!existing || existing.status !== "submitted")) throw new Error("Kirim asesmen sebelumnya sebelum membuat revisi.");
    return json(await publicAssessment(await startAssessment(input.profile, input.revision ? existing! : undefined)));
  } catch (e) { return failure(e); }
}
export async function PATCH(request: Request) {
  try {
    await requireUmkmAccess();
    const input = assessmentSchema.parse(await readBody(request));
    const assessment = await guestAssessment(); if (!assessment) throw new Error("Sesi habis. Mulai checkup baru.");
    const { data, error } = await serviceClient().rpc("dc_save_assessment", { p_id: assessment.id, p_token_hash: assessment.token_hash, p_payload: { profile: input.profile, answers: input.answers }, p_revision: input.revision, p_final: input.final }); dbError(error);
    const saved = data as AssessmentRow;
    if (input.final) {
      after(async () => { try { await processRecommendationJobs(); } catch { /* Scheduled worker retries persisted jobs. */ } });
      // Snapshot is committed; a persisted background job retries failures automatically.
      try { await runAssessment(saved); } catch { return json({ ...await publicAssessment(saved), notice: "Jawabanmu sudah tersimpan. Rekomendasi sedang disiapkan." }); }
    }
    return json(await publicAssessment(saved));
  } catch (e) { return failure(e); }
}
