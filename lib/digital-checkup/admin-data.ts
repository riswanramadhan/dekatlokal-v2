import "server-only";
import { requireActor, serviceClient } from "@/lib/supabase/server";
import { dbError } from "./http";
import { compareRankings, conditionScores, instrument, type Decision, type ExpertInput, type Model } from "@/lib/decision-engine";
import { verifyRun, type ModelInputRow, type Verification } from "@/lib/decision-engine/verify";
import type { AssessmentRow, RunRow } from "./service";
import { expertDirectory } from "./expert-directory";
import { assignUmkmCodes, sessionLabel } from "./umkm-code";
import { verifyMethod, type MethodVerification } from "./verify-method";

export type Row = Record<string, unknown>;
export type ResearchTables = { instruments: Row[]; versions: Row[]; experts: Row[]; assessments: Row[]; models: Row[]; runs: Row[]; cases: Row[]; usability: Row[]; businesses: Row[] };
const TABLES = ["dc_instrument_versions", "dc_decision_model_versions", "dc_expert_assignments", "dc_assessment_sessions", "dc_decision_model_inputs", "dc_decision_runs", "dc_expert_case_assignments", "dc_usability_tests", "dc_umkm_profiles"] as const;
const ROLES = ["admin", "researcher"];

// Explicit pagination: exports must not silently stop at PostgREST's 1,000 rows.
export async function fetchResearchTables(): Promise<ResearchTables> {
  const db = serviceClient();
  const rows = await Promise.all(TABLES.map(async (table) => {
    const result: Row[] = [];
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await db.from(table).select("*").order("id").range(offset, offset + 499);
      dbError(error); result.push(...((data ?? []) as Row[])); if (!data || data.length < 500) return result;
    }
  }));
  const [instruments, versions, experts, assessments, models, runs, cases, usability, businesses] = rows;
  return { instruments, versions, experts, assessments, models, runs, cases, usability, businesses };
}

type ExpertPayload = {
  profile?: { name?: string; institution?: string; jobTitle?: string; experienceYears?: number | null; expertise?: string; assessmentDate?: string };
  reviews?: Record<string, { relevance: number | null; clarity: number | null; suggestion: string }>;
  decision?: string | null; generalNote?: string; pairs?: ExpertInput["pairs"]; relevance?: Record<string, Record<string, number | null>>;
  consistency?: { lambdaMax: number; CI: number; CR: number; consistent: boolean };
};
export type ValidationItem = {
  id: string; assessmentId: string; expertAssignmentId: string; umkmId: string | null; expertCode: string | undefined; expertName: string; umkmCode: string | undefined; umkmDemoCode: string | null;
  status: string; decision: string | undefined; ranks: Record<string, number> | undefined; rationale: string | undefined; runId: string | undefined; submittedAt: string | null;
  metrics: { firstInTopSet: boolean; overlapTop3: number; spearman: number | null } | null;
};
export type UsabilityItem = { id: string; assessmentId: string; umkmCode: string | null; date: string; tasks: Record<string, string>; minutes: number; ease: number; note: string; createdAt: string };

const str = (value: unknown) => (value == null ? "" : String(value));
const directoryEntry = (assignmentId: unknown) => expertDirectory.find((item) => item.assignmentId === assignmentId);
const expertName = (expert: Row | undefined) => directoryEntry(expert?.id)?.name || (expert?.payload as ExpertPayload | undefined)?.profile?.name?.trim() || str(expert?.code) || "Ahli";
const answeredCount = (answers: Record<string, unknown> | undefined) => Object.values(answers ?? {}).filter((value) => value != null).length;
const safeScores = (answers: Record<string, number | null> | undefined) => { try { return answers ? conditionScores(answers) : null; } catch { return null; } };
const latestRunFor = (runs: RunRow[], assessmentId: string) => runs.find((run) => run.assessment_id === assessmentId) ?? null;

export function shapeResearchData(tables: ResearchTables, options: { version?: string | null; runId?: string | null } = {}) {
  const { instruments, versions, experts, assessments, models, cases, usability, businesses } = tables;
  const version = options.version || null, runId = options.runId || null;
  const codes = assignUmkmCodes(assessments.map((a) => ({ id: str(a.id), umkm_id: str(a.umkm_id), status: str(a.status), submitted_at: a.submitted_at as string | null, started_at: a.started_at as string | null })));
  const runs = (tables.runs as unknown as RunRow[]).slice().sort((a, b) => str(b.created_at).localeCompare(str(a.created_at)));
  const selectedRuns = runs.filter((r) => (!runId || r.id === runId) && (!version || r.canonical_input.modelVersion === version));
  const businessCode = (id: unknown) => str(businesses.find((b) => b.id === id)?.code);
  const sourceOf = (id: unknown) => assessments.find((a) => a.id === id) as unknown as AssessmentRow | undefined;
  const safeAssessments = assessments.filter((a) => (!runId && !version) || selectedRuns.some((r) => r.assessment_id === a.id)).map((a) => {
    const value = a as unknown as AssessmentRow, p = value.payload?.profile ?? ({} as AssessmentRow["payload"]["profile"]);
    return { id: str(a.id), code: businessCode(a.umkm_id), instrumentId: a.instrument_id, status: a.status, revision: a.revision_number, submittedAt: a.submitted_at, answers: value.payload?.answers ?? {}, metadata: { sector: p.sector, district: p.district, businessAgeMonths: p.businessAgeMonths, peopleCount: p.peopleCount, respondentRole: p.respondentRole, salesChannels: p.salesChannels } };
  });
  const selectedModels = models.filter((m) => (!runId && !version) || selectedRuns.some((r) => r.model_input_id === m.id));
  const safeExperts = experts.filter((e) => (!runId && !version) || selectedModels.some((m) => ((m.expert_ids as string[]) ?? []).includes(str(e.id)))).map((e) => {
    const p = (e.payload ?? {}) as ExpertPayload;
    // Free-text reviews may contain identifiers; use numeric reviews in anonymous exports.
    const reviews = Object.fromEntries(Object.entries(p.reviews ?? {}).map(([q, v]) => [q, { relevance: v.relevance, clarity: v.clarity }]));
    return { id: str(e.id), code: e.code, instrumentId: e.instrument_id, status: e.status, revision: e.revision, submittedAt: e.stage1_submitted_at, pairs: p.pairs ?? [], relevance: p.relevance ?? {}, reviews, decision: p.decision, consistency: p.consistency };
  });
  const validations: ValidationItem[] = cases.filter((c) => safeAssessments.some((a) => a.id === c.assessment_id)).map((c) => {
    const p = (c.payload ?? {}) as { decision?: string; ranks?: Record<string, number>; rationale?: string };
    const run = selectedRuns.find((r) => r.assessment_id === c.assessment_id);
    const expert = experts.find((e) => e.id === c.expert_assignment_id), source = sourceOf(c.assessment_id);
    let metrics: ValidationItem["metrics"] = null;
    if (c.status === "submitted" && p.decision === "Dinilai" && p.ranks && run?.status === "RANKED") { try { metrics = compareRankings(run.trace, p.ranks); } catch { metrics = null; } }
    return { id: str(c.id), assessmentId: str(c.assessment_id), expertAssignmentId: str(c.expert_assignment_id), umkmId: source?.umkm_id ?? null, expertCode: expert?.code as string | undefined, expertName: expertName(expert), umkmCode: safeAssessments.find((a) => a.id === c.assessment_id)?.code, umkmDemoCode: source ? codes.get(source.umkm_id) ?? null : null, status: str(c.status), decision: p.decision, ranks: p.ranks, rationale: p.rationale, runId: run?.id, submittedAt: (c.submitted_at as string | null) ?? null, metrics };
  });
  const valid = validations.filter((v) => v.metrics), abstains = validations.filter((v) => v.status === "submitted" && v.decision === "Tidak dapat menilai");
  const adminAssessments = safeAssessments.map((assessment) => {
    const source = sourceOf(assessment.id);
    return { ...assessment, umkmId: source?.umkm_id ?? null, demoCode: source ? codes.get(source.umkm_id) ?? null : null, businessName: source?.payload?.profile?.businessName?.trim() || "Usaha tanpa nama" };
  });
  const usedExpertIds = new Set(selectedModels.flatMap((model) => (model.expert_ids as string[]) ?? []));
  const adminExperts = safeExperts.map((expert) => ({ ...expert, displayName: directoryEntry(expert.id)?.name || "Ahli", usedInModel: usedExpertIds.has(expert.id) }));
  const reviewIssues = experts.flatMap((e) => {
    const p = (e.payload ?? {}) as ExpertPayload;
    return Object.entries(p.reviews ?? {}).filter(([, r]) => (r.relevance ?? 4) <= 2 || (r.clarity ?? 4) <= 2 || r.suggestion).map(([question, r]) => ({ expertCode: str(e.code), expertName: expertName(e), question, suggestion: r.suggestion, generalNote: p.generalNote }));
  });
  const usabilityItems: UsabilityItem[] = usability.filter((u) => safeAssessments.some((a) => a.id === u.assessment_id)).map((u) => {
    const source = sourceOf(u.assessment_id);
    return { id: str(u.id), assessmentId: str(u.assessment_id), umkmCode: source ? codes.get(source.umkm_id) ?? null : null, date: str(u.actual_date), tasks: (u.task_statuses ?? {}) as Record<string, string>, minutes: Number(u.total_minutes), ease: Number(u.ease), note: str(u.note), createdAt: str(u.created_at) };
  });
  const result = {
    reviewIssues,
    instruments: instruments.map(({ id, code, status, content, frozen_at }) => ({ id, code, status, content, frozenAt: frozen_at })),
    versions, experts: adminExperts, assessments: adminAssessments,
    models: selectedModels.map(({ id, model_version_id, input_hash, trace, created_at }) => ({ id, modelVersionId: model_version_id, inputHash: input_hash, trace, createdAt: created_at })),
    runs: selectedRuns, validations,
    usability: usabilityItems.map((u) => ({ id: u.id, umkmCode: safeAssessments.find((a) => a.id === u.assessmentId)?.code, date: u.date, tasks: u.tasks, minutes: u.minutes, ease: u.ease })),
    summary: { validPairs: valid.length, uniqueBusinesses: new Set(valid.map((v) => v.umkmId).filter(Boolean)).size, uniqueExperts: new Set(valid.map((v) => v.expertAssignmentId)).size, abstentions: abstains.length, sensitivityScenarios: selectedRuns.reduce((n, r) => n + (r.sensitivity?.length ?? 0), 0) },
  };
  return { tables, codes, runs, selectedRuns, safeAssessments, selectedModels, safeExperts, validations, valid, abstains, adminAssessments, usedExpertIds, adminExperts, reviewIssues, usabilityItems, result };
}
export type ShapedResearch = ReturnType<typeof shapeResearchData>;

export async function loadResearchData(options: { version?: string | null; runId?: string | null } = {}) {
  await requireActor(ROLES);
  return shapeResearchData(await fetchResearchTables(), options);
}

export type CheckupListItem = {
  id: string; umkmId: string; code: string | null; label: string; businessName: string; sector: string; district: string; status: string; revisionNumber: number;
  startedAt: string | null; submittedAt: string | null; answered: number; runStatus: string | null; latestRunId: string | null; modelVersion: string | null; topSet: string[];
};
function listFromShape(shape: ShapedResearch): CheckupListItem[] {
  return (shape.tables.assessments as unknown as AssessmentRow[]).map((a) => {
    const run = latestRunFor(shape.runs, a.id), code = shape.codes.get(a.umkm_id) ?? null, profile = a.payload?.profile;
    return { id: a.id, umkmId: a.umkm_id, code, label: sessionLabel(code, a.revision_number), businessName: profile?.businessName?.trim() || "Usaha tanpa nama", sector: profile?.sector ?? "", district: profile?.district ?? "", status: a.status, revisionNumber: a.revision_number, startedAt: (a as unknown as Row).started_at as string | null, submittedAt: a.submitted_at, answered: answeredCount(a.payload?.answers), runStatus: run?.status ?? null, latestRunId: run?.id ?? null, modelVersion: run?.canonical_input?.modelVersion ?? null, topSet: run?.trace?.topSet ?? [] };
  }).sort((a, b) => str(b.submittedAt ?? b.startedAt).localeCompare(str(a.submittedAt ?? a.startedAt)));
}
export async function listCheckups(): Promise<CheckupListItem[]> {
  return listFromShape(await loadResearchData());
}

export type ExpertSummary = { id: string; code: string; name: string; jobTitle: string; institution: string; consistency: { CR: number; consistent: boolean } | null };
export type RunSummary = { id: string; status: string; createdAt: string; modelVersion: string; buildId: string; topSet: string[]; inputHash: string; modelInputId: string };
export type CheckupDetail = {
  assessment: AssessmentRow; code: string | null; label: string; businessCode: string; scores: number[] | null; answered: number;
  runs: RunSummary[]; latestRun: RunRow | null; modelInput: ModelInputRow | null; modelVersionCode: string | null; experts: ExpertSummary[];
  validations: ValidationItem[]; usability: UsabilityItem[]; verification: Verification | null; finalExpertIds: string[]; modelReady: boolean;
};
export async function getCheckupDetail(id: string): Promise<CheckupDetail | null> {
  const shape = await loadResearchData();
  const assessment = shape.tables.assessments.find((a) => a.id === id) as unknown as AssessmentRow | undefined;
  if (!assessment) return null;
  const code = shape.codes.get(assessment.umkm_id) ?? null;
  const runs = shape.runs.filter((r) => r.assessment_id === id), latestRun = runs[0] ?? null;
  const modelInput = latestRun ? (shape.tables.models.find((m) => m.id === latestRun.model_input_id) as unknown as ModelInputRow | undefined) ?? null : null;
  const modelVersion = modelInput ? shape.tables.versions.find((v) => v.id === modelInput.model_version_id) : null;
  const experts: ExpertSummary[] = (modelInput?.expert_ids ?? []).map((expertId) => {
    const row = shape.tables.experts.find((e) => e.id === expertId), entry = directoryEntry(expertId), payload = (row?.payload ?? {}) as ExpertPayload;
    return { id: expertId, code: str(row?.code), name: entry?.name || payload.profile?.name?.trim() || str(row?.code) || "Ahli", jobTitle: entry?.jobTitle || payload.profile?.jobTitle || "", institution: entry?.institution || payload.profile?.institution || "", consistency: payload.consistency ? { CR: payload.consistency.CR, consistent: payload.consistency.consistent } : null };
  });
  const finalExpertIds = shape.tables.experts.filter((e) => e.status === "submitted" && e.instrument_id === assessment.instrument_id).map((e) => str(e.id));
  const modelReady = shape.tables.versions.some((v) => v.instrument_id === assessment.instrument_id && v.frozen_at);
  return {
    assessment, code, label: sessionLabel(code, assessment.revision_number), businessCode: str(shape.tables.businesses.find((b) => b.id === assessment.umkm_id)?.code), scores: assessment.status === "submitted" ? safeScores(assessment.payload?.answers) : null, answered: answeredCount(assessment.payload?.answers),
    runs: runs.map((r) => ({ id: r.id, status: r.status, createdAt: r.created_at, modelVersion: r.canonical_input?.modelVersion ?? "", buildId: r.build_id, topSet: r.trace?.topSet ?? [], inputHash: r.input_hash, modelInputId: r.model_input_id })),
    latestRun, modelInput, modelVersionCode: modelVersion ? str(modelVersion.code) : latestRun?.canonical_input?.modelVersion ?? null, experts,
    validations: shape.validations.filter((v) => v.assessmentId === id), usability: shape.usabilityItems.filter((u) => u.assessmentId === id),
    verification: latestRun ? verifyRun(latestRun) : null, finalExpertIds, modelReady,
  };
}

export type ExpertPanelItem = {
  id: string; code: string; name: string; jobTitle: string; institution: string; status: string; instrumentId: string; usedInModel: boolean; submittedAt: string | null;
  decision: string | null; consistency: { lambdaMax: number; CI: number; CR: number; consistent: boolean } | null; completion: { reviews: number; pairs: number; relevance: number }; experienceYears: number | null; expertise: string;
};
export type ModelPanelItem = { id: string; versionCode: string; versionId: string; inputHash: string; createdAt: string; expertIds: string[]; expertCodes: string[]; expertNames: string[]; trace: Model };
export type ExpertPanelData = { versions: { id: string; code: string; instrumentId: string; frozenAt: string | null }[]; experts: ExpertPanelItem[]; models: ModelPanelItem[]; reviewIssues: ShapedResearch["reviewIssues"] };
export async function loadExpertPanel(): Promise<ExpertPanelData> {
  const shape = await loadResearchData();
  const versions = shape.tables.versions.slice().sort((a, b) => str(b.created_at).localeCompare(str(a.created_at))).map((v) => ({ id: str(v.id), code: str(v.code), instrumentId: str(v.instrument_id), frozenAt: (v.frozen_at as string | null) ?? null }));
  const experts: ExpertPanelItem[] = shape.tables.experts.map((e) => {
    const p = (e.payload ?? {}) as ExpertPayload, entry = directoryEntry(e.id);
    return { id: str(e.id), code: str(e.code), name: expertName(e), jobTitle: entry?.jobTitle || p.profile?.jobTitle || "", institution: entry?.institution || p.profile?.institution || "", status: str(e.status), instrumentId: str(e.instrument_id), usedInModel: shape.usedExpertIds.has(str(e.id)), submittedAt: (e.stage1_submitted_at as string | null) ?? null, decision: p.decision ?? null, consistency: p.consistency ?? null, completion: { reviews: Object.keys(p.reviews ?? {}).length, pairs: (p.pairs ?? []).length, relevance: Object.values(p.relevance ?? {}).flatMap((row) => Object.values(row)).filter((value) => value != null).length }, experienceYears: p.profile?.experienceYears ?? null, expertise: p.profile?.expertise || "" };
  }).sort((a, b) => a.code.localeCompare(b.code));
  return { versions, experts, models: panelModels(shape), reviewIssues: shape.reviewIssues };
}
function panelModels(shape: ShapedResearch): ModelPanelItem[] {
  return (shape.tables.models as unknown as ModelInputRow[]).slice().sort((a, b) => str(b.created_at).localeCompare(str(a.created_at))).map((m) => {
    const version = shape.tables.versions.find((v) => v.id === m.model_version_id);
    return { id: m.id, versionCode: str(version?.code), versionId: m.model_version_id, inputHash: m.input_hash, createdAt: m.created_at, expertIds: m.expert_ids ?? [], expertCodes: m.snapshot?.expertCodes ?? [], expertNames: (m.expert_ids ?? []).map((expertId) => expertName(shape.tables.experts.find((e) => e.id === expertId))), trace: m.trace };
  });
}

export type SummaryData = {
  codedBusinesses: number; finalCheckups: number; draftCheckups: number; readyResults: number; waitingModel: number; finalExperts: number; activeModel: { code: string; frozenAt: string | null } | null; runs: number;
  verification: { ok: number; total: number }; latest: CheckupListItem[];
};
export async function loadSummary(): Promise<SummaryData> {
  const shape = await loadResearchData(), list = listFromShape(shape);
  const frozen = shape.tables.versions.filter((v) => v.frozen_at).sort((a, b) => str(b.frozen_at).localeCompare(str(a.frozen_at)))[0];
  const verification = verifyMethod({ models: shape.tables.models as unknown as ModelInputRow[], runs: shape.runs });
  return {
    codedBusinesses: shape.codes.size, finalCheckups: list.filter((i) => i.status === "submitted").length, draftCheckups: list.filter((i) => i.status === "draft").length,
    readyResults: list.filter((i) => i.runStatus === "RANKED").length, waitingModel: list.filter((i) => i.status === "submitted" && !i.latestRunId).length,
    finalExperts: shape.tables.experts.filter((e) => e.status === "submitted").length, activeModel: frozen ? { code: str(frozen.code), frozenAt: (frozen.frozen_at as string | null) ?? null } : null, runs: shape.runs.length,
    verification: { ok: verification.summary.ok, total: verification.summary.total }, latest: list.filter((i) => i.status === "submitted").slice(0, 5),
  };
}

export type SensitivityRow = { dimension: string; change: number; sameTopSet: boolean | null; overlapTop3: number | null; spearman: number | null; topSet: string[]; status: string };
export type SensitivitySummary = { runId: string; assessmentId: string; label: string; businessName: string; scenarios: SensitivityRow[]; ranked: number; stableTopSet: number; minSpearman: number | null };
export function summarizeSensitivity(run: RunRow, label: string, businessName: string): SensitivitySummary {
  const scenarios: SensitivityRow[] = (run.sensitivity ?? []).map((s) => ({ dimension: s.dimension, change: s.change, sameTopSet: s.sameTopSet, overlapTop3: s.overlapTop3, spearman: s.spearman, topSet: s.result?.topSet ?? [], status: s.result?.status ?? "" }));
  const spearmans = scenarios.map((s) => s.spearman).filter((x): x is number => typeof x === "number");
  return { runId: run.id, assessmentId: run.assessment_id, label, businessName, scenarios, ranked: scenarios.filter((s) => s.status === "RANKED").length, stableTopSet: scenarios.filter((s) => s.sameTopSet === true).length, minSpearman: spearmans.length ? Math.min(...spearmans) : null };
}
export type ValidationData = { validations: ValidationItem[]; summary: ShapedResearch["result"]["summary"]; sensitivity: SensitivitySummary[]; usability: UsabilityItem[]; assessments: { id: string; label: string }[] };
export async function loadValidation(): Promise<ValidationData> {
  const shape = await loadResearchData(), list = listFromShape(shape), labelOf = (assessmentId: string) => list.find((i) => i.id === assessmentId);
  return {
    validations: shape.validations.slice().sort((a, b) => str(a.umkmDemoCode ?? "zzz").localeCompare(str(b.umkmDemoCode ?? "zzz")) || a.expertName.localeCompare(b.expertName)),
    summary: shape.result.summary,
    sensitivity: shape.runs.map((run) => summarizeSensitivity(run, labelOf(run.assessment_id)?.label ?? "Draf", labelOf(run.assessment_id)?.businessName ?? "Usaha tanpa nama")),
    usability: shape.usabilityItems.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    assessments: list.filter((i) => i.status === "submitted").map((i) => ({ id: i.id, label: `${i.label} · ${i.businessName}` })),
  };
}

export type ExportData = { versions: { id: string; code: string; frozenAt: string | null }[]; runs: { id: string; label: string; businessName: string; status: string; createdAt: string; modelVersion: string }[] };
export async function loadExports(): Promise<ExportData> {
  const shape = await loadResearchData(), list = listFromShape(shape);
  return {
    versions: shape.tables.versions.slice().sort((a, b) => str(b.created_at).localeCompare(str(a.created_at))).map((v) => ({ id: str(v.id), code: str(v.code), frozenAt: (v.frozen_at as string | null) ?? null })),
    runs: shape.runs.map((run) => { const item = list.find((i) => i.id === run.assessment_id); return { id: run.id, label: item?.label ?? "Draf", businessName: item?.businessName ?? "Usaha tanpa nama", status: run.status, createdAt: run.created_at, modelVersion: run.canonical_input?.modelVersion ?? "" }; }),
  };
}

export type MethodData = { verification: MethodVerification; models: ModelPanelItem[]; runsCount: number };
export async function loadMethod(): Promise<MethodData> {
  const shape = await loadResearchData(), list = listFromShape(shape);
  const models = shape.tables.models as unknown as ModelInputRow[];
  const verification = verifyMethod({
    models, runs: shape.runs,
    modelLabel: (m) => `Model ${str(shape.tables.versions.find((v) => v.id === m.model_version_id)?.code) || m.id.slice(0, 8)}`,
    runLabel: (r) => { const item = list.find((i) => i.id === (r as RunRow).assessment_id); return `${item?.label ?? "Draf"} · ${item?.businessName ?? "Usaha tanpa nama"}`; },
  });
  return { verification, models: panelModels(shape), runsCount: shape.runs.length };
}

export const dimensionTitle = (code: string) => instrument.dimensions.find((d) => d.code === code)?.title ?? code;
export const moduleName = (code: string) => instrument.modules.find((m) => m.code === code)?.name ?? code;
export type { Decision };
