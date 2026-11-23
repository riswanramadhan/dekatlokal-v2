import { expect, it } from "vitest";
import { researchCodes, susScore, susSummary, validationSummary, type ValidationRow } from "@/lib/digital-checkup/research-metrics";

it("assigns U-codes only to submitted snapshots by submission time, then id", () => {
  const codes = researchCodes([
    { id: "c", status: "submitted", submitted_at: "2026-10-02T00:00:00+00:00" },
    { id: "draft", status: "draft", submitted_at: null },
    { id: "b", status: "submitted", submitted_at: "2026-10-01T00:00:00+00:00" },
    { id: "a", status: "submitted", submitted_at: "2026-10-02T00:00:00+00:00" },
  ]);
  expect([...codes.entries()]).toEqual([["b", "U001"], ["a", "U002"], ["c", "U003"]]);
  expect(codes.has("draft")).toBe(false);
  // A new draft or a later submission never renumbers earlier codes.
  const later = researchCodes([{ id: "0-new-draft", status: "draft" }, { id: "z", status: "submitted", submitted_at: "2026-12-01T00:00:00Z" }, { id: "c", status: "submitted", submitted_at: "2026-10-02T00:00:00+00:00" }, { id: "b", status: "submitted", submitted_at: "2026-10-01T00:00:00+00:00" }, { id: "a", status: "submitted", submitted_at: "2026-10-02T00:00:00+00:00" }]);
  expect(later.get("b")).toBe("U001"); expect(later.get("c")).toBe("U003"); expect(later.get("z")).toBe("U004");
});

it("aggregates stage-2 pairs per case and per expert without inventing values", () => {
  const empty = validationSummary([]);
  expect(empty).toMatchObject({ validPairs: 0, cases: 0, experts: 0, abstentions: 0, meanSpearman: null, topSetHitRate: null, meanOverlapTop3: null, target: { umkm: 10, expertsPerUmkm: 3, pairs: 30, completeCases: 0, met: false } });
  const m = (firstInTopSet: boolean, overlapTop3: number, spearman: number | null) => ({ firstInTopSet, overlapTop3, spearman });
  const rows: ValidationRow[] = [
    { assessmentId: "u1", businessId: "b1", expertCode: "E1", status: "submitted", decision: "Dinilai", metrics: m(true, 3, 1) },
    { assessmentId: "u1", businessId: "b1", expertCode: "E2", status: "submitted", decision: "Dinilai", metrics: m(false, 2, 0.5) },
    { assessmentId: "u1", businessId: "b1", expertCode: "E3", status: "submitted", decision: "Dinilai", metrics: m(true, 1, null) },
    { assessmentId: "u2", businessId: "b2", expertCode: "E1", status: "submitted", decision: "Tidak dapat menilai", metrics: null },
    { assessmentId: "u2", businessId: "b2", expertCode: "E2", status: "draft", decision: "Dinilai", metrics: null },
    { assessmentId: "u3", businessId: "b1", expertCode: "E3", status: "submitted", decision: "Dinilai", metrics: null },
  ];
  const s = validationSummary(rows);
  expect(s).toMatchObject({ validPairs: 3, assignedPairs: 6, submittedPairs: 5, abstentions: 1, notComparable: 1, cases: 1, businesses: 1, experts: 3, spearmanDefined: 2, topSetHits: 2 });
  expect(s.meanSpearman).toBeCloseTo(0.75, 14);
  expect(s.topSetHitRate).toBeCloseTo(2 / 3, 14);
  expect(s.meanOverlapTop3).toBeCloseTo(2, 14);
  expect(s.target.completeCases).toBe(1);
  expect(s.perExpert.map((e) => [e.expertCode, e.assigned, e.submitted, e.validPairs, e.abstentions, e.spearmanDefined])).toEqual([["E1", 2, 2, 1, 1, 1], ["E2", 2, 1, 1, 0, 1], ["E3", 2, 2, 1, 0, 0]]);
  expect(s.perExpert[2].meanSpearman).toBeNull();
});

it("scores SUS with the standard formula", () => {
  expect(susScore([5, 1, 5, 1, 5, 1, 5, 1, 5, 1])).toBe(100);
  expect(susScore([1, 5, 1, 5, 1, 5, 1, 5, 1, 5])).toBe(0);
  expect(susScore([3, 3, 3, 3, 3, 3, 3, 3, 3, 3])).toBe(50);
  expect(susScore([4, 2, 4, 1, 5, 2, 4, 2, 4, 3])).toBe(77.5);
  expect(() => susScore([5, 1, 5])).toThrow();
  expect(() => susScore([0, 1, 5, 1, 5, 1, 5, 1, 5, 1])).toThrow();
  expect(susSummary([100, 50, null, undefined])).toEqual({ n: 2, mean: 75, min: 50, max: 100 });
  expect(susSummary([])).toEqual({ n: 0, mean: null, min: null, max: null });
});
