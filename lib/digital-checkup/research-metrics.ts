// Pure research helpers: stable UMKM codes, stage-2 validation aggregates, and SUS scoring.
// No database access here so the same numbers are unit-tested and shared by dashboard and exports.
export const VALIDATION_TARGET = { umkm: 10, expertsPerUmkm: 3 } as const;

type CodedAssessment = { id: string; status: string; submitted_at?: string | null; submittedAt?: string | null };
const submittedTime = (a: CodedAssessment) => { const t = Date.parse(String(a.submitted_at ?? a.submittedAt ?? "")); return Number.isFinite(t) ? t : Infinity; };
/** U001… only for submitted snapshots, ordered by submission time then id, so codes never shift when drafts appear. */
export function researchCodes(assessments: CodedAssessment[]) {
  const submitted = assessments.filter((a) => a.status === "submitted").sort((a, b) => submittedTime(a) - submittedTime(b) || String(a.submitted_at ?? a.submittedAt ?? "").localeCompare(String(b.submitted_at ?? b.submittedAt ?? "")) || a.id.localeCompare(b.id));
  return new Map(submitted.map((a, i) => [a.id, `U${String(i + 1).padStart(3, "0")}`]));
}

export type PairMetrics = { firstInTopSet: boolean; overlapTop3: number; spearman: number | null };
export type ValidationRow = { assessmentId: string; businessId?: string | null; expertCode?: string | null; status: string; decision?: string | null; metrics: PairMetrics | null };
const mean = (values: number[]) => values.length ? values.reduce((s, x) => s + x, 0) / values.length : null;
function pairStats(rows: ValidationRow[]) {
  const valid = rows.filter((r) => r.metrics) as (ValidationRow & { metrics: PairMetrics })[];
  const rho = valid.map((r) => r.metrics.spearman).filter((x): x is number => typeof x === "number" && Number.isFinite(x));
  return {
    validPairs: valid.length,
    spearmanDefined: rho.length,
    meanSpearman: mean(rho),
    topSetHits: valid.filter((r) => r.metrics.firstInTopSet).length,
    topSetHitRate: valid.length ? valid.filter((r) => r.metrics.firstInTopSet).length / valid.length : null,
    meanOverlapTop3: mean(valid.map((r) => r.metrics.overlapTop3)),
  };
}
/** Aggregates real stage-2 judgments only; an empty input yields zero counts and null means, never placeholders. */
export function validationSummary(rows: ValidationRow[]) {
  const submitted = rows.filter((r) => r.status === "submitted");
  const valid = submitted.filter((r) => r.metrics);
  const abstained = (r: ValidationRow) => r.decision === "Tidak dapat menilai";
  const expertsByCase = new Map<string, Set<string>>();
  for (const r of valid) expertsByCase.set(r.assessmentId, (expertsByCase.get(r.assessmentId) ?? new Set()).add(String(r.expertCode ?? "")));
  const completeCases = [...expertsByCase.values()].filter((set) => set.size >= VALIDATION_TARGET.expertsPerUmkm).length;
  const expertCodes = [...new Set(rows.map((r) => String(r.expertCode ?? "")).filter(Boolean))].sort();
  return {
    ...pairStats(valid),
    assignedPairs: rows.length,
    submittedPairs: submitted.length,
    abstentions: submitted.filter(abstained).length,
    // Judged by an expert, but the system had no RANKED result to compare (e.g. no identified gap).
    notComparable: submitted.filter((r) => !r.metrics && !abstained(r)).length,
    cases: expertsByCase.size,
    businesses: new Set(valid.map((r) => r.businessId ?? r.assessmentId)).size,
    experts: new Set(valid.map((r) => r.expertCode).filter(Boolean)).size,
    target: { umkm: VALIDATION_TARGET.umkm, expertsPerUmkm: VALIDATION_TARGET.expertsPerUmkm, pairs: VALIDATION_TARGET.umkm * VALIDATION_TARGET.expertsPerUmkm, completeCases, met: completeCases >= VALIDATION_TARGET.umkm },
    perExpert: expertCodes.map((expertCode) => {
      const own = rows.filter((r) => r.expertCode === expertCode), ownSubmitted = own.filter((r) => r.status === "submitted");
      return { expertCode, assigned: own.length, submitted: ownSubmitted.length, abstentions: ownSubmitted.filter(abstained).length, ...pairStats(ownSubmitted) };
    }),
  };
}
export type ValidationSummary = ReturnType<typeof validationSummary>;

// System Usability Scale (Brooke, 1996): ten items, 1 = sangat tidak setuju … 5 = sangat setuju.
export const SUS_ITEMS = [
  "Saya rasa saya akan sering memakai aplikasi ini.",
  "Saya merasa aplikasi ini rumit tanpa alasan yang jelas.",
  "Saya merasa aplikasi ini mudah digunakan.",
  "Saya rasa saya butuh bantuan orang teknis untuk bisa memakai aplikasi ini.",
  "Saya merasa fitur-fitur di aplikasi ini terpadu dengan baik.",
  "Saya merasa banyak hal yang tidak konsisten di aplikasi ini.",
  "Saya rasa kebanyakan orang akan cepat belajar memakai aplikasi ini.",
  "Saya merasa aplikasi ini merepotkan untuk digunakan.",
  "Saya merasa percaya diri saat memakai aplikasi ini.",
  "Saya perlu mempelajari banyak hal sebelum bisa memakai aplikasi ini.",
] as const;
/** Standard SUS: odd items contribute (x − 1), even items (5 − x); the sum × 2,5 gives 0–100. */
export function susScore(responses: readonly number[]) {
  if (responses.length !== 10 || responses.some((x) => !Number.isInteger(x) || x < 1 || x > 5)) throw new Error("SUS membutuhkan 10 jawaban bernilai 1–5.");
  return responses.reduce((sum, x, i) => sum + (i % 2 === 0 ? x - 1 : 5 - x), 0) * 2.5;
}
export function susSummary(scores: (number | null | undefined)[]) {
  const valid = scores.filter((x): x is number => typeof x === "number" && Number.isFinite(x));
  return { n: valid.length, mean: mean(valid), min: valid.length ? Math.min(...valid) : null, max: valid.length ? Math.max(...valid) : null };
}
