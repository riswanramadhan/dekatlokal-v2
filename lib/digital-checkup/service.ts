import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { buildModel, conditionScores, instrument, sensitivity, topsis, type Answers, type ExpertInput, type Model, type Decision } from "@/lib/decision-engine";
import { currentActor, serviceClient, supabaseConfigured } from "@/lib/supabase/server";
import { inputHash, tokenHash } from "./canonical";
import { dbError } from "./http";
import { publicResult } from "./public-result";
import { expertEntry } from "./expert-access";
import type { BusinessProfile, ExpertDraft } from "./validation";

export type AssessmentRow = { id: string; umkm_id: string; instrument_id: string; status: string; revision: number; revision_number: number; submitted_at: string | null; payload: { profile: BusinessProfile; answers: Answers }; token_hash: string; expires_at: string };
export type ExpertRow = { id: string; code: string; expert_user_id: string | null; instrument_id: string; status: string; revision: number; payload: ExpertDraft };
export type RunRow = { id: string; assessment_id: string; model_input_id: string; status: string; trace: Decision; canonical_input: CanonicalInput; sensitivity: ReturnType<typeof sensitivity>; created_at: string; input_hash: string; build_id: string };
export type CanonicalInput = { instrumentVersion: string; modelVersion: string; dimensionCodes: string[]; moduleCodes: string[]; experts: ExpertInput[]; answers: Answers };
const COOKIE = "dc_session";
export async function currentInstrument() {
  const { data, error } = await serviceClient().from("dc_instrument_versions").select("*").eq("code", instrument.version).single();
  dbError(error); if (!data) throw new Error("Instrumen belum tersedia."); return data;
}
export async function guestAssessment(id?: string) {
  if (!supabaseConfigured()) return null;
  if (await expertEntry()) return null;
  const cookie = (await cookies()).get(COOKIE)?.value;
  const actor = await currentActor(), db = serviceClient();
  if (actor && actor.role !== "umkm") return null;
  if (cookie && /^[a-f0-9]{64}$/.test(cookie)) {
    let query = db.from("dc_assessment_sessions").select("*").eq("token_hash", tokenHash(cookie)).gt("expires_at", new Date().toISOString()).order("revision_number", { ascending: false }).limit(1);
    if (id) query = query.eq("id", id);
    const { data, error } = await query.maybeSingle(); dbError(error);
    if (data) {
      const { data: owner, error: oe } = await db.from("dc_umkm_profiles").select("owner_id").eq("id", data.umkm_id).single(); dbError(oe);
      if (owner && (!owner.owner_id || owner.owner_id === actor?.id)) return data as AssessmentRow;
    }
  }
  if (!actor) return null;
  const { data: businesses, error: be } = await db.from("dc_umkm_profiles").select("id").eq("owner_id", actor.id); dbError(be);
  if (!businesses?.length) return null;
  let query = db.from("dc_assessment_sessions").select("*").in("umkm_id", businesses.map((b) => b.id)).order("started_at", { ascending: false }).limit(1);
  if (id) query = query.eq("id", id);
  const { data, error } = await query.maybeSingle(); dbError(error);
  if (data?.status === "draft" && new Date(data.expires_at).getTime() <= Date.now()) {
    // Only a verified owner can resume an expired draft; submitted snapshots stay immutable.
    const { error: renewError } = await db.from("dc_assessment_sessions").update({ expires_at: new Date(Date.now() + 30 * 86400_000).toISOString() }).eq("id", data.id).eq("status", "draft"); dbError(renewError);
  }
  return data as AssessmentRow | null;
}
export async function startAssessment(profile: BusinessProfile, parent?: AssessmentRow) {
  const db = serviceClient(), version = await currentInstrument();
  const token = randomBytes(32).toString("hex"), hash = tokenHash(token), id = randomUUID();
  let umkmId = parent?.umkm_id;
  if (!umkmId) {
    const actor = await currentActor();
    const { data, error } = await db.from("dc_umkm_profiles").insert({ code: `UMKM-${randomBytes(6).toString("hex").toUpperCase()}`, metadata: profile, owner_id: actor?.role === "umkm" ? actor.id : null }).select("id").single();
    dbError(error); umkmId = data!.id;
  }
  const { data, error } = await db.from("dc_assessment_sessions").insert({ id, umkm_id: umkmId, instrument_id: version.id, token_hash: hash, expires_at: new Date(Date.now() + 30 * 86400_000).toISOString(), revision_number: parent ? parent.revision_number + 1 : 1, parent_id: parent?.id ?? null, payload: { profile, answers: parent?.payload.answers ?? {} } }).select("*").single();
  dbError(error);
  (await cookies()).set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 30 * 86400 });
  return data as AssessmentRow;
}
export async function runAssessment(assessment: AssessmentRow, modelInputId?: string) {
  if (assessment.status !== "submitted") return null;
  const db = serviceClient();
  let versionQuery = db.from("dc_decision_model_versions").select("id,code").eq("instrument_id", assessment.instrument_id).not("frozen_at", "is", null).order("created_at", { ascending: false }).limit(1);
  if (modelInputId) { const { data, error } = await db.from("dc_decision_model_inputs").select("model_version_id").eq("id", modelInputId).single(); dbError(error); versionQuery = versionQuery.eq("id", data!.model_version_id); }
  const { data: versions, error: ve } = await versionQuery;
  dbError(ve); if (!versions?.length) return null;
  const { data: model, error: me } = await db.from("dc_decision_model_inputs").select("*").eq("model_version_id", versions[0].id).single(); dbError(me);
  const { data: previous, error: pe } = await db.from("dc_decision_runs").select("*").eq("assessment_id", assessment.id).eq("model_input_id", model!.id).maybeSingle(); dbError(pe);
  if (previous) return previous as RunRow;
  const experts = model!.snapshot.experts as ExpertInput[];
  // Rebuild from immutable expert answers; stored weights are never trusted as input.
  const compiled = buildModel(experts);
  const input: CanonicalInput = { instrumentVersion: instrument.version, modelVersion: versions[0].code, dimensionCodes: compiled.dimensionCodes, moduleCodes: compiled.moduleCodes, experts, answers: assessment.payload.answers };
  const trace = topsis(input.answers, compiled.w, compiled.R);
  const { data: id, error } = await db.rpc("dc_store_run", { p_assessment: assessment.id, p_model: model!.id, p_hash: inputHash(input), p_canonical: input, p_trace: trace, p_sensitivity: sensitivity(input.answers, compiled), p_build: process.env.DC_BUILD_ID || process.env.VERCEL_GIT_COMMIT_SHA || "development" }); dbError(error);
  const { data: saved, error: re } = await db.from("dc_decision_runs").select("*").eq("id", id).single(); dbError(re); return saved as RunRow;
}
export async function publicAssessment(assessment: AssessmentRow) {
  const { data: business } = await serviceClient().from("dc_umkm_profiles").select("code,owner_id").eq("id", assessment.umkm_id).single();
  let run: RunRow | null = null;
  if (assessment.status === "submitted") {
    const db = serviceClient();
    const { data: version, error: ve } = await db.from("dc_decision_model_versions").select("id").eq("instrument_id", assessment.instrument_id).not("frozen_at", "is", null).order("created_at", { ascending: false }).limit(1).maybeSingle(); dbError(ve);
    if (version) {
      const { data: model, error: me } = await db.from("dc_decision_model_inputs").select("id").eq("model_version_id", version.id).single(); dbError(me);
      // A late retry of an older model must not replace the current recommendation.
      const { data, error } = await db.from("dc_decision_runs").select("*").eq("assessment_id", assessment.id).eq("model_input_id", model!.id).maybeSingle(); dbError(error); run = data as RunRow | null;
    }
  }
  return { id: assessment.id, code: business?.code, linked: Boolean(business?.owner_id), status: assessment.status, revision: assessment.revision, revisionNumber: assessment.revision_number, submittedAt: assessment.submitted_at, payload: assessment.payload, scores: assessment.status === "submitted" ? conditionScores(assessment.payload.answers) : null, run: run ? { id: run.id, ...publicResult(run.trace), createdAt: run.created_at, instrumentVersion: run.canonical_input.instrumentVersion, modelVersion: run.canonical_input.modelVersion } : null };
}
export type PublicAssessment = Awaited<ReturnType<typeof publicAssessment>>;
export async function freezeModel(versionId: string, ids: string[], actorId: string) {
  const db = serviceClient();
  const { data, error } = await db.from("dc_expert_assignments").select("*").in("id", ids).order("code"); dbError(error);
  if (data?.length !== 3 || data.some((e) => e.status !== "submitted")) throw new Error("Pilih tepat tiga ahli final.");
  const experts = data.map((e) => ({ pairs: e.payload.pairs, relevance: e.payload.relevance })) as ExpertInput[];
  const compiled: Model = buildModel(experts);
  const snapshot = { experts, expertCodes: data.map((e) => e.code), instrumentVersion: instrument.version };
  const { data: id, error: saveError } = await db.rpc("dc_freeze_model", { p_version: versionId, p_experts: data.map((e) => e.id), p_hash: inputHash(snapshot), p_snapshot: snapshot, p_trace: compiled, p_actor: actorId }); dbError(saveError); return id as string;
}
// Whitelist: never spread an assessment/run into a blinded expert response.
export function blindCase(caseRow: { id: string; status: string; payload: unknown }, assessment: AssessmentRow, code: string) {
  const p = assessment.payload.profile;
  return { id: caseRow.id, status: caseRow.status, payload: caseRow.payload, code, metadata: { sector: p.sector, businessAgeMonths: p.businessAgeMonths, peopleCount: p.peopleCount, respondentRole: p.respondentRole, salesChannels: p.salesChannels }, answers: assessment.payload.answers, scores: conditionScores(assessment.payload.answers) };
}
