import { describe, expect, it } from "vitest";
import { buildModel, DIMENSIONS, instrument, MODULES, PAIRS, topsis, type ExpertInput } from "@/lib/decision-engine";
import { compareNumeric, verifyModelInput, verifyRun } from "@/lib/decision-engine/verify";
import { inputHash } from "@/lib/digital-checkup/canonical";
import { verifyMethod } from "@/lib/digital-checkup/verify-method";

const answers = Object.fromEntries(instrument.questions.map((q) => [q.code, 2]));
const expert = (variant = 0): ExpertInput => ({ pairs: PAIRS.map((p) => ({ ...p, preferred: variant && p.left === "C1" ? p.left : "equal", intensity: variant && p.left === "C1" ? variant + 1 : 1 })), relevance: Object.fromEntries(MODULES.map((m, i) => [m, Object.fromEntries(DIMENSIONS.map((d, j) => [d, (i + j + variant) % 5]))])) });
const experts = [expert(), expert(1), expert(2)], model = buildModel(experts), trace = topsis(answers, model.w, model.R);
const canonicalInput = { instrumentVersion: instrument.version, modelVersion: instrument.modelVersion, dimensionCodes: DIMENSIONS, moduleCodes: MODULES, experts, answers };
const snapshot = { experts, expertCodes: ["E1", "E2", "E3"], instrumentVersion: instrument.version };
const roundTrip = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const run = () => ({ id: "run", assessment_id: "a", model_input_id: "m", status: trace.status, trace: roundTrip(trace), canonical_input: roundTrip(canonicalInput), sensitivity: [], created_at: "2026-09-14T00:00:00Z", input_hash: inputHash(canonicalInput), build_id: "test" });
const modelRow = () => ({ id: "m", model_version_id: "v", expert_ids: ["e1", "e2", "e3"], input_hash: inputHash(snapshot), snapshot: roundTrip(snapshot), trace: roundTrip(model), created_at: "2026-09-14T00:00:00Z" });

describe("verifikasi hitung ulang", () => {
  it("compares nested numbers within tolerance", () => {
    expect(compareNumeric({ a: [1, 2.00000000001] }, { a: [1, 2] })).toEqual({ ok: true, maxDiff: expect.closeTo(1e-11, 12) });
    expect(compareNumeric([1, 2], [1, 2.001]).ok).toBe(false);
    expect(compareNumeric([1], [1, 2]).ok).toBe(false);
    expect(compareNumeric("RANKED", "RANKED").ok).toBe(true);
  });
  it("accepts a stored run that matches the recomputation and the hash", () => {
    const result = verifyRun(run());
    expect(result.ok).toBe(true); expect(result.hashMatch).toBe(true);
    expect(result.fields.map((f) => f.key)).toEqual(["S", "g", "w", "H", "q", "R", "N", "V", "idealPlus", "idealMinus", "Dplus", "Dminus", "C", "rank", "topSet", "status"]);
    expect(result.fields.every((f) => f.ok && f.maxDiff <= 1e-10)).toBe(true);
  });
  it("flags only the tampered field", () => {
    const row = run(); row.trace.w[0] += 1e-6;
    const result = verifyRun(row);
    expect(result.ok).toBe(false); expect(result.hashMatch).toBe(true);
    expect(result.fields.filter((f) => !f.ok).map((f) => f.key)).toEqual(["w"]);
  });
  it("detects a changed input hash", () => {
    const row = run(); row.input_hash = "0".repeat(64);
    const result = verifyRun(row);
    expect(result.hashMatch).toBe(false); expect(result.ok).toBe(false); expect(result.fields.every((f) => f.ok)).toBe(true);
  });
  it("verifies a model input the same way", () => {
    expect(verifyModelInput(modelRow())).toMatchObject({ ok: true, hashMatch: true });
    const tampered = modelRow(); tampered.trace.R[0][0] += 0.5;
    expect(verifyModelInput(tampered).fields.filter((f) => !f.ok).map((f) => f.key)).toEqual(["R"]);
  });
  it("does not throw on an input the engine rejects", () => {
    const row = run(); row.canonical_input.experts = row.canonical_input.experts.slice(0, 2);
    expect(verifyRun(row)).toMatchObject({ ok: false, hashMatch: false, fields: [] });
  });
  it("summarizes every model and run for the method page", () => {
    const summary = verifyMethod({ models: [modelRow()], runs: [run()], runLabel: () => "U001 · Warung Uji" });
    expect(summary.summary).toEqual({ total: 2, ok: 2, allOk: true });
    expect(summary.runs[0].label).toBe("U001 · Warung Uji");
    expect(verifyMethod({ models: [], runs: [] }).summary).toEqual({ total: 0, ok: 0, allOk: true });
  });
});
