// SIMULASI: in-memory rows only, to prove export → dashboard summary → Colab notebook parity. Nothing is stored.
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { beforeEach, expect, it, vi } from "vitest";
import { compareRankings } from "@/lib/decision-engine";
import { pythonCommand } from "./helpers/python";
import { builder, rows, runs } from "./helpers/research-fixture";
const mocks = vi.hoisted(() => ({ actor: vi.fn(), client: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({ requireActor: mocks.actor, serviceClient: mocks.client }));
vi.mock("@/lib/digital-checkup/expert-access", () => ({ requireExpertActor: () => mocks.actor(["expert"]), expertRoster: () => [], expertEntry: async () => null }));
import { GET as researchGet } from "@/app/api/digital-checkup/research/route";

beforeEach(() => { vi.resetAllMocks(); mocks.actor.mockResolvedValue({ id: "admin", role: "admin" }); mocks.client.mockReturnValue({ from: (table: string) => builder(rows[table] ?? []) }); });
const get = async (query: string) => (await researchGet(new Request(`http://localhost/api/digital-checkup/research${query}`))).json();
function runNotebook(bundle: unknown) {
  const dir = mkdtempSync(join(tmpdir(), "dl-colab-")), data = join(dir, "bundle.json"), script = join(dir, "notebook.py");
  const notebook = JSON.parse(readFileSync("notebooks/validasi_fahp_topsis_colab.ipynb", "utf8")) as { cells: { cell_type: string; source: string[]; outputs?: unknown[] }[] };
  expect(notebook.cells.filter((c) => c.cell_type === "code").every((c) => c.outputs?.length === 0)).toBe(true);
  writeFileSync(data, JSON.stringify(bundle));
  writeFileSync(script, notebook.cells.filter((c) => c.cell_type === "code").map((c) => c.source.join("")).join("\n\n"));
  return spawnSync(pythonCommand(), ["-I", script], { encoding: "utf8", env: { ...process.env, DL_COLAB_JSON: data } });
}

it("codes only submitted snapshots by submission time and counts email-free experts", async () => {
  const dashboard = await get("");
  expect(dashboard.assessments.map((a: { id: string; demoCode: string | null }) => [a.id, a.demoCode])).toEqual([["a-1", "U001"], ["a-2", "U002"], ["a-3", "U003"], ["a-0-draft", null]]);
  const expected = rows.dc_expert_case_assignments.slice(0, 3).map((c) => compareRankings(runs[1].trace, (c as { payload: { ranks: Record<string, number> } }).payload.ranks));
  expect(dashboard.summary).toMatchObject({ validPairs: 3, uniqueExperts: 3, uniqueBusinesses: 1, abstentions: 1, sus: { n: 1, mean: 75 } });
  expect(dashboard.summary.validation).toMatchObject({ cases: 1, experts: 3, submittedPairs: 4, assignedPairs: 5, target: { completeCases: 1, pairs: 30 } });
  expect(dashboard.summary.validation.meanOverlapTop3).toBeCloseTo(expected.reduce((s, m) => s + m.overlapTop3, 0) / 3, 14);
  expect(dashboard.summary.validation.perExpert.map((e: { expertCode: string; assigned: number; validPairs: number }) => [e.expertCode, e.assigned, e.validPairs])).toEqual([["AHLI-SIM-1", 2, 1], ["AHLI-SIM-2", 2, 1], ["AHLI-SIM-3", 1, 1]]);
  expect(dashboard.validations.find((v: { id: string }) => v.id === "c1").umkmCode).toBe("U001");
  const csv = await (await researchGet(new Request("http://localhost/api/digital-checkup/research?format=csv"))).text();
  expect(csv).toContain('"validationByExpert"');
  expect(csv).toContain("meanSpearman");
});

it("exports every submitted record with dashboard codes, skips drafts, and per-UMKM files keep their code", async () => {
  const bundle = await get("?format=colab");
  expect(bundle.records.map((r: { umkmCode: string; run: { status: string } }) => [r.umkmCode, r.run.status])).toEqual([["U001", "RANKED"], ["U002", "RANKED"], ["U003", "NO_IDENTIFIED_GAP"]]);
  expect(bundle.skippedRecords).toEqual([{ assessmentId: "a-0-draft", status: "draft", answered: 1, reason: expect.any(String) }]);
  const single = await get("?format=colab&run=run-a-2");
  expect(single.records.map((r: { umkmCode: string }) => r.umkmCode)).toEqual(["U002"]);
});

it("the Colab notebook validates every RANKED record and stage-2 metric, and rejects a tampered trace", async () => {
  const bundle = await get("?format=colab");
  const ok = runNotebook(bundle);
  expect(ok.status, ok.stderr + ok.stdout).toBe(0);
  expect(ok.stdout).toContain("VALIDASI LULUS — 2 record RANKED");
  expect(ok.stdout).toMatch(/U001 +\| RANKED/);
  expect(ok.stdout).toContain("Metrik tahap 2 sama dengan web: ya");
  const tampered = JSON.parse(JSON.stringify(bundle));
  tampered.records[1].run.trace.C[0] += 1e-9;
  const bad = runNotebook(tampered);
  expect(bad.status).not.toBe(0);
  expect(bad.stdout).toMatch(/U002 .*GAGAL/);
  expect(bad.stderr).toContain("VALIDASI GAGAL: U002");
});
