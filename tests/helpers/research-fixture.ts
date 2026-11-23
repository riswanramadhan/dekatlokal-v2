// SIMULASI: in-memory Supabase rows for route/notebook/dashboard tests only. Never written to any database.
import { buildModel, DIMENSIONS, instrument, MODULES, PAIRS, topsis, type ExpertInput } from "@/lib/decision-engine";
import { inputHash } from "@/lib/digital-checkup/canonical";

export function builder(result: unknown) { const chain = { select: () => chain, eq: () => chain, in: () => chain, order: () => chain, range: () => chain, then: (resolve: (x: unknown) => unknown) => Promise.resolve({ data: result, error: null }).then(resolve) }; return chain; }
const expert = (variant: number): ExpertInput => ({ pairs: PAIRS.map((p) => ({ ...p, preferred: variant && p.left === "C1" ? p.left : "equal", intensity: variant && p.left === "C1" ? variant + 1 : 1 })), relevance: Object.fromEntries(MODULES.map((m, i) => [m, Object.fromEntries(DIMENSIONS.map((d, j) => [d, (i * 3 + j + variant) % 5]))])) });
const experts = [expert(0), expert(1), expert(2)], model = buildModel(experts);
const pattern = (f: (i: number) => number) => Object.fromEntries(instrument.questions.map((q, i) => [q.code, f(i)]));
const sessions = [
  { id: "a-2", answers: pattern((i) => Math.floor(i / 4) % 5), submitted_at: "2026-10-02T08:00:00+00:00" },
  { id: "a-1", answers: pattern((i) => (i * 7) % 5), submitted_at: "2026-10-01T08:00:00+00:00" },
  { id: "a-3", answers: pattern(() => 4), submitted_at: "2026-10-03T08:00:00+00:00" },
];
export const runs = sessions.map((s) => {
  const canonicalInput = { instrumentVersion: instrument.version, modelVersion: "DC-MODEL-SIMULASI", dimensionCodes: DIMENSIONS, moduleCodes: MODULES, experts, answers: s.answers };
  const trace = topsis(s.answers, model.w, model.R);
  return { id: `run-${s.id}`, assessment_id: s.id, model_input_id: "model", status: trace.status, trace, canonical_input: canonicalInput, sensitivity: [], created_at: "2026-10-04T00:00:00Z", input_hash: inputHash(canonicalInput), build_id: "test" };
});
const ranks = (order: string[]) => Object.fromEntries(order.map((code, i) => [code, i + 1]));
const caseRow = (id: string, assessment: string, expertId: string, status: string, payload: object) => ({ id, assessment_id: assessment, expert_assignment_id: expertId, status, payload });
export const rows: Record<string, unknown[]> = {
  dc_instrument_versions: [{ id: "instrument", code: instrument.version, status: "frozen", content: instrument, frozen_at: "2026-10-01T00:00:00Z" }],
  dc_decision_model_versions: [{ id: "version", code: "DC-MODEL-SIMULASI", instrument_id: "instrument", frozen_at: "2026-10-01T00:00:00Z" }],
  dc_umkm_profiles: sessions.map((s) => ({ id: `b-${s.id}`, code: `UMKM-${s.id}` })).concat({ id: "b-draft", code: "UMKM-DRAFT" }),
  dc_assessment_sessions: [
    ...sessions.map((s) => ({ id: s.id, umkm_id: `b-${s.id}`, instrument_id: "instrument", status: "submitted", revision_number: 1, submitted_at: s.submitted_at, payload: { answers: s.answers, profile: { businessName: `SIMULASI ${s.id}`, sector: "SIMULASI", district: "SIMULASI" } } })),
    { id: "a-0-draft", umkm_id: "b-draft", instrument_id: "instrument", status: "draft", revision_number: 1, submitted_at: null, payload: { answers: { Q01: 2, Q02: null }, profile: { sector: "SIMULASI" } } },
  ],
  dc_expert_assignments: ["e1", "e2", "e3"].map((id, i) => ({ id, code: `AHLI-SIM-${i + 1}`, expert_user_id: null, instrument_id: "instrument", status: "submitted", payload: { pairs: experts[i].pairs, relevance: experts[i].relevance } })),
  dc_decision_model_inputs: [{ id: "model", model_version_id: "version", expert_ids: ["e1", "e2", "e3"], input_hash: "model-hash", trace: model, created_at: "2026-10-01T00:00:00Z" }],
  dc_decision_runs: runs,
  dc_expert_case_assignments: [
    caseRow("c1", "a-1", "e1", "submitted", { decision: "Dinilai", ranks: ranks(["A1", "A2", "A3", "A4", "A5", "A6", "A7"]), rationale: "SIMULASI" }),
    caseRow("c2", "a-1", "e2", "submitted", { decision: "Dinilai", ranks: ranks(["A7", "A6", "A5", "A4", "A3", "A2", "A1"]), rationale: "SIMULASI" }),
    caseRow("c3", "a-1", "e3", "submitted", { decision: "Dinilai", ranks: ranks(["A3", "A1", "A2", "A5", "A4", "A7", "A6"]), rationale: "SIMULASI" }),
    caseRow("c4", "a-2", "e1", "submitted", { decision: "Tidak dapat menilai", ranks: {}, rationale: "SIMULASI" }),
    caseRow("c5", "a-2", "e2", "draft", { decision: "Dinilai", ranks: {}, rationale: "" }),
  ],
  dc_usability_tests: [
    { id: "t1", assessment_id: "a-1", actual_date: "2026-10-05", task_statuses: { kirim: "selesai" }, total_minutes: 6, ease: 4, sus_responses: [4, 2, 4, 2, 4, 2, 4, 2, 4, 2], sus_score: 75 },
    { id: "t2", assessment_id: "a-2", actual_date: "2026-10-05", task_statuses: { kirim: "selesai" }, total_minutes: 7, ease: 3 },
  ],
};
