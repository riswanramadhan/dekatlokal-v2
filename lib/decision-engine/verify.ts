// Hitung ulang model dan hasil dari input mentah yang tersimpan, lalu bandingkan dengan jejak
// yang disimpan. Tidak menyentuh mesin hitung; hanya memanggilnya ulang.
import { buildModel, topsis, type Answers, type Decision, type ExpertInput, type Model } from "./index";
import { inputHash } from "@/lib/digital-checkup/canonical";

export type ModelInputRow = { id: string; model_version_id: string; expert_ids: string[]; input_hash: string; snapshot: { experts: ExpertInput[]; expertCodes?: string[]; instrumentVersion?: string }; trace: Model; created_at: string };
export type RunLike = { id: string; input_hash: string; trace: Decision; canonical_input: { experts: ExpertInput[]; answers: Answers } };
export type FieldCheck = { key: string; label: string; ok: boolean; maxDiff: number };
export type Verification = { ok: boolean; hashMatch: boolean; fields: FieldCheck[]; error?: string };

export function compareNumeric(stored: unknown, live: unknown, tol = 1e-10): { ok: boolean; maxDiff: number } {
  if (typeof live === "number") {
    if (typeof stored !== "number") return { ok: false, maxDiff: Number.POSITIVE_INFINITY };
    const diff = Math.abs(stored - live);
    return { ok: Number.isFinite(diff) && diff <= tol, maxDiff: Number.isFinite(diff) ? diff : Number.POSITIVE_INFINITY };
  }
  if (Array.isArray(live)) {
    if (!Array.isArray(stored) || stored.length !== live.length) return { ok: false, maxDiff: Number.POSITIVE_INFINITY };
    return live.reduce<{ ok: boolean; maxDiff: number }>((acc, item, i) => { const r = compareNumeric(stored[i], item, tol); return { ok: acc.ok && r.ok, maxDiff: Math.max(acc.maxDiff, r.maxDiff) }; }, { ok: true, maxDiff: 0 });
  }
  if (live !== null && typeof live === "object") {
    if (stored === null || typeof stored !== "object" || Array.isArray(stored)) return { ok: false, maxDiff: Number.POSITIVE_INFINITY };
    const liveObject = live as Record<string, unknown>, storedObject = stored as Record<string, unknown>;
    return Object.keys(liveObject).reduce<{ ok: boolean; maxDiff: number }>((acc, key) => { const r = compareNumeric(storedObject[key], liveObject[key], tol); return { ok: acc.ok && r.ok, maxDiff: Math.max(acc.maxDiff, r.maxDiff) }; }, { ok: true, maxDiff: 0 });
  }
  return { ok: stored === live, maxDiff: stored === live ? 0 : Number.POSITIVE_INFINITY };
}

const MODEL_FIELDS: [keyof Model, string][] = [["crisp", "Matriks perbandingan tiap ahli"], ["individualCR", "Konsistensi tiap ahli"], ["groupCrisp", "Matriks gabungan"], ["groupCR", "Konsistensi gabungan"], ["individualTFN", "Angka kabur tiap ahli"], ["groupTFN", "Angka kabur gabungan"], ["rowGM", "Rata-rata geometrik baris"], ["sumGM", "Jumlah rata-rata geometrik"], ["fuzzyWeights", "Bobot kabur"], ["centroid", "Titik tengah bobot"], ["w", "Bobot akhir"], ["individualR", "Kecocokan modul tiap ahli"], ["R", "Kecocokan modul gabungan"]];
const RUN_FIELDS: [keyof Decision, string][] = [["S", "Nilai bagian"], ["g", "Yang masih kurang"], ["w", "Bobot dari ahli"], ["H", "Total kekurangan berbobot"], ["q", "Bobot kebutuhan usaha ini"], ["R", "Kecocokan modul dengan bagian"], ["N", "Dibuat sebanding"], ["V", "Dikalikan bobot kebutuhan"], ["idealPlus", "Titik terbaik"], ["idealMinus", "Titik terburuk"], ["Dplus", "Jarak ke yang terbaik"], ["Dminus", "Jarak ke yang terburuk"], ["C", "Nilai kedekatan"], ["rank", "Urutan"], ["topSet", "Rekomendasi utama"], ["status", "Status hasil"]];

function checkFields<T extends object>(stored: T, live: T, fields: [keyof T, string][], tol: number): FieldCheck[] {
  return fields.map(([key, label]) => { const r = compareNumeric(stored?.[key], live[key], tol); return { key: String(key), label, ok: r.ok, maxDiff: r.maxDiff }; });
}

export function verifyModelInput(row: ModelInputRow, tol = 1e-10): Verification {
  try {
    const live = buildModel(row.snapshot.experts);
    const fields = checkFields(row.trace, live, MODEL_FIELDS, tol);
    const hashMatch = inputHash(row.snapshot) === row.input_hash;
    return { ok: hashMatch && fields.every((f) => f.ok), hashMatch, fields };
  } catch (error) { return { ok: false, hashMatch: false, fields: [], error: error instanceof Error ? error.message : "Model tidak bisa dihitung ulang." }; }
}

export function verifyRun(row: RunLike, tol = 1e-10): Verification {
  try {
    const model = buildModel(row.canonical_input.experts);
    const live = topsis(row.canonical_input.answers, model.w, model.R);
    const fields = checkFields(row.trace, live, RUN_FIELDS, tol);
    const hashMatch = inputHash(row.canonical_input) === row.input_hash;
    return { ok: hashMatch && fields.every((f) => f.ok), hashMatch, fields };
  } catch (error) { return { ok: false, hashMatch: false, fields: [], error: error instanceof Error ? error.message : "Hasil tidak bisa dihitung ulang." }; }
}
