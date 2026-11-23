// Ringkasan verifikasi untuk halaman "Cara hitung & verifikasi": setiap model dan setiap
// hasil dihitung ulang dari input mentah, lalu dibandingkan dengan yang tersimpan.
import { verifyModelInput, verifyRun, type ModelInputRow, type RunLike, type Verification } from "@/lib/decision-engine/verify";

export type VerifyRow = { id: string; label: string; createdAt: string; hash: string } & Verification;
export type MethodVerification = { models: VerifyRow[]; runs: VerifyRow[]; summary: { total: number; ok: number; allOk: boolean } };

export function verifyMethod(input: { models: ModelInputRow[]; runs: (RunLike & { created_at: string })[]; modelLabel?: (model: ModelInputRow) => string; runLabel?: (run: RunLike & { created_at: string }) => string }, tol = 1e-10): MethodVerification {
  const models = input.models.map((model) => ({ id: model.id, label: input.modelLabel?.(model) ?? `Model ${model.id.slice(0, 8)}`, createdAt: model.created_at, hash: model.input_hash, ...verifyModelInput(model, tol) }));
  const runs = input.runs.map((run) => ({ id: run.id, label: input.runLabel?.(run) ?? `Hasil ${run.id.slice(0, 8)}`, createdAt: run.created_at, hash: run.input_hash, ...verifyRun(run, tol) }));
  const all = [...models, ...runs], ok = all.filter((row) => row.ok).length;
  return { models, runs, summary: { total: all.length, ok, allOk: ok === all.length } };
}
