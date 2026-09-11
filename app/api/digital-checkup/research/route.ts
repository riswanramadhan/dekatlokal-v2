import { randomBytes } from "node:crypto";
import { z } from "zod";
import { requireActor, serviceClient } from "@/lib/supabase/server";
import { dbError, failure, json, readBody } from "@/lib/digital-checkup/http";
import { freezeModel, runAssessment, type AssessmentRow, type RunRow } from "@/lib/digital-checkup/service";
import { usabilitySchema } from "@/lib/digital-checkup/validation";
import { compareRankings } from "@/lib/decision-engine";
import { canonical, csvCell } from "@/lib/digital-checkup/canonical";

export async function GET(request: Request) {
  try {
    await requireActor(["admin", "researcher"]);
    const db = serviceClient(), params = new URL(request.url).searchParams;
    const tables = ["dc_instrument_versions", "dc_decision_model_versions", "dc_expert_assignments", "dc_assessment_sessions", "dc_decision_model_inputs", "dc_decision_runs", "dc_expert_case_assignments", "dc_usability_tests", "dc_umkm_profiles"] as const;
    // Explicit pagination: exports must not silently stop at PostgREST's 1,000 rows.
    const rows = await Promise.all(tables.map(async (table) => {
      const result: Record<string, unknown>[] = [];
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await db.from(table).select("*").order("id").range(offset, offset + 499);
        dbError(error); result.push(...(data ?? [])); if (!data || data.length < 500) return result;
      }
    }));
    const [instruments, versions, experts, assessments, models, runs, cases, usability, businesses] = rows;
    const version = params.get("version"), runId = params.get("run");
    const selectedRuns = (runs as unknown as RunRow[]).filter((r) => (!runId || r.id === runId) && (!version || r.canonical_input.modelVersion === version));
    if (params.get("format") === "canonical") {
      if (!runId || selectedRuns.length !== 1) throw new Error("Pilih satu run yang tersedia.");
      return new Response(canonical(selectedRuns[0].canonical_input), { headers: { "Content-Type": "application/json", "Content-Disposition": "attachment; filename=canonical-input.json", "Cache-Control": "private, no-store" } });
    }
    const code = (id: unknown) => String(businesses.find((b) => b.id === id)?.code ?? "");
    const safeAssessments = assessments.filter((a) => (!runId && !version) || selectedRuns.some((r) => r.assessment_id === a.id)).map((a) => {
      const value = a as unknown as AssessmentRow;
      const p = value.payload.profile;
      return { id: a.id, code: code(a.umkm_id), instrumentId: a.instrument_id, status: a.status, revision: a.revision_number, submittedAt: a.submitted_at, answers: value.payload.answers, metadata: { sector: p.sector, district: p.district, businessAgeMonths: p.businessAgeMonths, peopleCount: p.peopleCount, respondentRole: p.respondentRole, salesChannels: p.salesChannels } };
    });
    const selectedModels = models.filter((m) => (!runId && !version) || selectedRuns.some((r) => r.model_input_id === m.id));
    const safeExperts = experts.filter((e) => (!runId && !version) || selectedModels.some((m) => (m.expert_ids as string[]).includes(String(e.id)))).map((e) => {
      const p = e.payload as Record<string, unknown>;
      // Free-text reviews may contain identifiers; use numeric reviews in anonymous exports.
      const reviews = Object.fromEntries(Object.entries((p.reviews ?? {}) as Record<string, { relevance: number; clarity: number }>).map(([q, v]) => [q, { relevance: v.relevance, clarity: v.clarity }]));
      return { id: e.id, code: e.code, instrumentId: e.instrument_id, status: e.status, revision: e.revision, submittedAt: e.stage1_submitted_at, pairs: p.pairs ?? [], relevance: p.relevance ?? {}, reviews, decision: p.decision, consistency: p.consistency };
    });
    const validations = cases.filter((c) => safeAssessments.some((a) => a.id === c.assessment_id)).map((c) => {
      const p = c.payload as { decision?: string; ranks?: Record<string, number>; rationale?: string };
      const run = selectedRuns.filter((r) => r.assessment_id === c.assessment_id).sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
      return { id: c.id, assessmentId: c.assessment_id, expertCode: experts.find((e) => e.id === c.expert_assignment_id)?.code, umkmCode: safeAssessments.find((a) => a.id === c.assessment_id)?.code, status: c.status, decision: p.decision, ranks: p.ranks, rationale: p.rationale, runId: run?.id, metrics: c.status === "submitted" && p.decision === "Dinilai" && p.ranks && run?.status === "RANKED" ? compareRankings(run.trace, p.ranks) : null };
    });
    const valid = validations.filter((v) => v.metrics), abstains = validations.filter((v) => v.status === "submitted" && v.decision === "Tidak dapat menilai");
    const result = {
      ...(!params.get("format") ? { reviewIssues: experts.flatMap((e) => {
        const p = e.payload as { generalNote?: string; reviews?: Record<string, { relevance: number; clarity: number; suggestion: string }> };
        return Object.entries(p.reviews ?? {}).filter(([, r]) => r.relevance <= 2 || r.clarity <= 2 || r.suggestion).map(([question, r]) => ({ expertCode: e.code, question, suggestion: r.suggestion, generalNote: p.generalNote }));
      }) } : {}),
      instruments: instruments.map(({ id, code, status, content, frozen_at }) => ({ id, code, status, content, frozenAt: frozen_at })), versions, experts: safeExperts, assessments: safeAssessments,
      models: selectedModels.map(({ id, model_version_id, input_hash, trace, created_at }) => ({ id, modelVersionId: model_version_id, inputHash: input_hash, trace, createdAt: created_at })), runs: selectedRuns, validations,
      usability: usability.filter((u) => safeAssessments.some((a) => a.id === u.assessment_id)).map((u) => ({ id: u.id, umkmCode: safeAssessments.find((a) => a.id === u.assessment_id)?.code, date: u.actual_date, tasks: u.task_statuses, minutes: u.total_minutes, ease: u.ease })),
      summary: { validPairs: valid.length, uniqueBusinesses: new Set(valid.map((v) => v.umkmCode)).size, uniqueExperts: new Set(valid.map((v) => experts.find((e) => e.code === v.expertCode)?.expert_user_id).filter(Boolean)).size, abstentions: abstains.length, sensitivityScenarios: selectedRuns.reduce((n, r) => n + r.sensitivity.length, 0) },
    };
    if (params.get("format")) {
      // Rationale remains available in the authorized dashboard, not in anonymous downloads.
      const anonymous = { ...result, validations: validations.map((v) => ({ id: v.id, assessmentId: v.assessmentId, expertCode: v.expertCode, umkmCode: v.umkmCode, status: v.status, decision: v.decision, ranks: v.ranks, runId: v.runId, metrics: v.metrics })) };
      const csv = params.get("format") === "csv";
      const content = csv ? "dataset,data\r\n" + Object.entries(anonymous).flatMap(([name, values]) => (Array.isArray(values) ? values : [values]).map((v) => `${csvCell(name)},${csvCell(JSON.stringify(v))}`)).join("\r\n") : JSON.stringify(anonymous, null, 2);
      return new Response(content, { headers: { "Content-Type": csv ? "text/csv; charset=utf-8" : "application/json", "Content-Disposition": `attachment; filename=digital-checkup.${csv ? "csv" : "json"}`, "Cache-Control": "private, no-store" } });
    }
    return json(result);
  } catch (e) { return failure(e); }
}

export async function POST(request: Request) {
  try {
    const actor = await requireActor(["admin", "researcher"]), db = serviceClient();
    const input = z.discriminatedUnion("action", [
      z.object({ action: z.literal("freeze"), versionId: z.string().uuid(), expertIds: z.array(z.string().uuid()).length(3), confirmed: z.literal(true) }),
      z.object({ action: z.literal("compute"), assessmentId: z.string().uuid() }),
      z.object({ action: z.literal("invite"), email: z.email(), instrumentId: z.string().uuid() }),
      z.object({ action: z.literal("cases"), assessmentId: z.string().uuid(), expertIds: z.array(z.string().uuid()).min(1).max(3) }),
      z.object({ action: z.literal("usability"), payload: usabilitySchema }),
      z.object({ action: z.literal("version"), sourceId: z.string().uuid(), code: z.string().regex(/^DC-MODEL-[A-Za-z0-9.-]{1,40}$/) }),
    ]).parse(await readBody(request));
    if (input.action === "freeze") return json({ id: await freezeModel(input.versionId, input.expertIds, actor.id) });
    if (input.action === "compute") {
      const { data, error } = await db.from("dc_assessment_sessions").select("*").eq("id", input.assessmentId).eq("status", "submitted").single(); dbError(error);
      const run = await runAssessment(data as AssessmentRow); if (!run) throw new Error("Bekukan model dengan tiga ahli final lebih dulu."); return json({ id: run.id });
    }
    if (input.action === "invite") {
      const { data: instrument, error: ie } = await db.from("dc_instrument_versions").select("id,status").eq("id", input.instrumentId).single(); dbError(ie);
      if (!["draft", "review"].includes(instrument!.status)) throw new Error("Versi ini sudah dikunci.");
      const { data, error } = await db.auth.admin.inviteUserByEmail(input.email, { redirectTo: `${new URL(process.env.NEXT_PUBLIC_APP_URL || request.url).origin}/auth/callback` });
      if (error || !data.user) throw new Error("Undangan belum terkirim. Periksa alamat email dan konfigurasi email Supabase.");
      const { error: pe } = await db.from("dc_profiles").insert({ user_id: data.user.id, role: "expert", display_name: "Ahli" }); dbError(pe);
      const { error: ae } = await db.from("dc_expert_assignments").insert({ expert_user_id: data.user.id, instrument_id: input.instrumentId, code: `AHLI-${randomBytes(4).toString("hex").toUpperCase()}` }); dbError(ae);
    }
    if (input.action === "cases") {
      const { data: assessment, error } = await db.from("dc_assessment_sessions").select("instrument_id").eq("id", input.assessmentId).eq("status", "submitted").single(); dbError(error);
      const { data: experts, error: ee } = await db.from("dc_expert_assignments").select("id").in("id", input.expertIds).eq("instrument_id", assessment!.instrument_id).eq("status", "submitted"); dbError(ee);
      if (experts?.length !== input.expertIds.length) throw new Error("Pilih ahli final dari instrumen yang sama.");
      const { error: ce } = await db.from("dc_expert_case_assignments").upsert(experts.map((e) => ({ expert_assignment_id: e.id, assessment_id: input.assessmentId })), { onConflict: "expert_assignment_id,assessment_id", ignoreDuplicates: true }); dbError(ce);
    }
    if (input.action === "usability") {
      const p = input.payload;
      const { error } = await db.from("dc_usability_tests").insert({ assessment_id: p.assessmentId, actual_date: p.date, task_statuses: p.tasks, total_minutes: p.minutes, ease: p.ease, note: p.note, recorded_by: actor.id }); dbError(error);
    }
    if (input.action === "version") {
      const { data, error } = await db.rpc("dc_clone_model", { p_source: input.sourceId, p_code: input.code, p_actor: actor.id }); dbError(error); return json({ id: data });
    }
    return json({ ok: true });
  } catch (e) { return failure(e); }
}
