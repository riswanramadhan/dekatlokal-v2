import instrument from "./instrument.json";

export { instrument };
export const EPSILON = 1e-12;
export const ALGORITHM = "FAHP_GM_PERSONAL_TOPSIS";
export const DIMENSIONS = instrument.dimensions.map((d) => d.code);
export const MODULES = instrument.modules.map((m) => m.code);
export const PAIRS = DIMENSIONS.flatMap((left, i) => DIMENSIONS.slice(i + 1).map((right) => ({ left, right })));
export type TFN = [number, number, number];
export type Pair = { left: string; right: string; preferred: string; intensity: number };
export type ExpertInput = { pairs: Pair[]; relevance: Record<string, Record<string, number>> };
export type Answers = Record<string, number | null>;
const sum = (a: number[]) => a.reduce((s, x) => s + x, 0);
const mean = (a: number[]) => sum(a) / a.length;
const gm = (a: number[]) => Math.exp(mean(a.map(Math.log)));
const finite = (v: number) => { if (!Number.isFinite(v)) throw new Error("Angka hitung tidak valid."); return v; };
const assert = (condition: boolean, message: string) => { if (!condition) throw new Error(message); };
const normalize = (a: number[]) => { const total = sum(a); assert(total > EPSILON, "Jumlah bobot harus positif."); return a.map((x) => finite(x / total)); };
export function score(value: unknown, max = 4): number {
  assert(typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= max, `Pilih nilai 0–${max}; jawaban kosong belum lengkap.`);
  return value as number;
}
export function crispMatrix(pairs: Pair[]): number[][] {
  assert(pairs.length === 28, "Lengkapi 28 pasangan dimensi.");
  const seen = new Set<string>();
  const matrix = DIMENSIONS.map(() => DIMENSIONS.map(() => 1));
  for (const pair of pairs) {
    const i = DIMENSIONS.indexOf(pair.left), j = DIMENSIONS.indexOf(pair.right);
    assert(i >= 0 && j > i && !seen.has(`${i}:${j}`), "Pasangan dimensi salah atau berulang.");
    seen.add(`${i}:${j}`);
    const k = score(pair.intensity, 9);
    assert(pair.preferred === "equal" ? k === 1 : [pair.left, pair.right].includes(pair.preferred) && k >= 2, "Pilihan setara harus 1; dimensi yang lebih penting memakai 2–9.");
    matrix[i][j] = pair.preferred === pair.right ? 1 / k : k;
    matrix[j][i] = 1 / matrix[i][j];
  }
  return matrix;
}
export function consistency(matrix: number[][]) {
  assert(matrix.length === 8 && matrix.every((row) => row.length === 8 && row.every((x) => Number.isFinite(x) && x > 0)), "Matriks harus positif 8 × 8.");
  let vector = Array<number>(8).fill(1 / 8), iterations = 0;
  for (; iterations < 10_000; iterations++) {
    const next = normalize(matrix.map((row) => sum(row.map((x, j) => x * vector[j]))));
    const delta = Math.max(...next.map((x, i) => Math.abs(x - vector[i])));
    vector = next;
    if (delta <= 1e-14) break;
  }
  assert(iterations < 10_000, "Iterasi eigen belum konvergen.");
  const lambdaMax = finite(mean(matrix.map((row, i) => sum(row.map((x, j) => x * vector[j])) / vector[i])));
  const rawCI = (lambdaMax - 8) / 7;
  assert(rawCI >= -EPSILON, "CI negatif di luar toleransi.");
  const CI = Math.max(0, rawCI), CR = CI / 1.41;
  const reviewPairs = PAIRS.map(({ left, right }) => {
    const i = DIMENSIONS.indexOf(left), j = DIMENSIONS.indexOf(right);
    return { left, right, deviation: Math.abs(Math.log(matrix[i][j] / (vector[i] / vector[j]))) };
  }).sort((a, b) => b.deviation - a.deviation).slice(0, 5);
  return { lambdaMax, CI, CR, consistent: CR <= .1 + EPSILON, method: "power-iteration", tolerance: 1e-14, iterations: iterations + 1, reviewPairs };
}
export function toTFN(value: number): TFN {
  if (value === 1) return [1, 1, 1];
  for (let k = 2; k <= 9; k++) {
    const direct: TFN = [Math.max(1, k - 1), k, Math.min(9, k + 1)];
    if (value === k) return direct;
    if (value === 1 / k) return [1 / direct[2], 1 / direct[1], 1 / direct[0]];
  }
  throw new Error("TFN hanya menerima 1, integer 2–9, atau resiprokalnya.");
}
export function relevanceMatrix(input: ExpertInput["relevance"]) {
  assert(Object.keys(input).length === 7, "Lengkapi tujuh modul.");
  return MODULES.map((m) => {
    assert(Boolean(input[m]) && Object.keys(input[m]).length === 8, "Lengkapi 56 relevansi modul.");
    return DIMENSIONS.map((d) => score(input[m][d]));
  });
}
export function buildModel(experts: ExpertInput[]) {
  assert(experts.length === 3, "Model membutuhkan tepat tiga ahli final.");
  const crisp = experts.map((e) => crispMatrix(e.pairs));
  const individualCR = crisp.map(consistency);
  assert(individualCR.every((c) => c.consistent), "CR setiap ahli harus ≤ 0,10.");
  const individualTFN = crisp.map((matrix) => matrix.map((row) => row.map(toTFN)));
  const groupTFN = DIMENSIONS.map((_, i) => DIMENSIONS.map((__, j) => [0, 1, 2].map((k) => gm(individualTFN.map((m) => m[i][j][k]))) as TFN));
  const rowGM = groupTFN.map((row) => [0, 1, 2].map((k) => gm(row.map((t) => t[k]))) as TFN);
  const sumGM = [0, 1, 2].map((k) => sum(rowGM.map((t) => t[k]))) as TFN;
  const fuzzyWeights = rowGM.map(([l, m, u]) => [l / sumGM[2], m / sumGM[1], u / sumGM[0]] as TFN);
  const centroid = fuzzyWeights.map(mean), w = normalize(centroid);
  assert(w.every((x) => x > 0) && Math.abs(sum(w) - 1) <= EPSILON, "Bobot umum tidak valid.");
  const individualR = experts.map((e) => relevanceMatrix(e.relevance));
  const R = MODULES.map((_, i) => DIMENSIONS.map((__, j) => mean(individualR.map((m) => m[i][j]))));
  const groupCrisp = DIMENSIONS.map((_, i) => DIMENSIONS.map((__, j) => gm(crisp.map((m) => m[i][j]))));
  return { algorithm: ALGORITHM, dimensionCodes: DIMENSIONS, moduleCodes: MODULES, crisp, individualCR, groupCrisp, groupCR: consistency(groupCrisp), individualTFN, groupTFN, rowGM, sumGM, fuzzyWeights, centroid, w, individualR, R };
}
export type Model = ReturnType<typeof buildModel>;
export function conditionScores(answers: Answers) {
  assert(Object.keys(answers).length === 32, "Lengkapi 32 jawaban.");
  return DIMENSIONS.map((d) => sum(instrument.questions.filter((q) => q.dimension === d).map((q) => score(answers[q.code]))) / 16 * 100);
}
export type RunStatus = "RANKED" | "NO_IDENTIFIED_GAP" | "UNCOVERED_DIMENSION" | "ALTERNATIVES_NOT_DISTINGUISHABLE";
export type Ranking = { code: string; C: number; rank: number; Dplus: number; Dminus: number };
export function minimumRanks(values: number[]): number[] {
  return values.map((value) => 1 + values.filter((other) => other > value + EPSILON).length);
}
export function topsis(answers: Answers, w: number[], R: number[][]) {
  assert(w.length === 8 && w.every((x) => Number.isFinite(x) && x > 0) && Math.abs(sum(w) - 1) <= EPSILON, "Delapan bobot positif harus berjumlah satu.");
  assert(R.length === 7 && R.every((row) => row.length === 8 && row.every((x) => Number.isFinite(x) && x >= 0 && x <= 4)), "Matriks relevansi harus 7 × 8 pada rentang 0–4.");
  const S = conditionScores(answers), g = S.map((s) => 1 - s / 100), H = finite(sum(w.map((x, j) => x * g[j])));
  const base = { S, g, H, w, R, q: Array<number>(8).fill(0), N: [] as number[][], V: [] as number[][], idealPlus: [] as number[], idealMinus: [] as number[], Dplus: [] as number[], Dminus: [] as number[], C: [] as number[], rank: [] as number[], ranking: [] as Ranking[], topSet: [] as string[], uncovered: [] as string[] };
  if (H <= EPSILON) return { ...base, status: "NO_IDENTIFIED_GAP" as RunStatus };
  const q = w.map((x, j) => finite(x * g[j] / H));
  assert(q.every((x) => x >= 0) && Math.abs(sum(q) - 1) <= EPSILON, "Bobot kebutuhan tidak valid.");
  const denom = DIMENSIONS.map((_, j) => Math.sqrt(sum(R.map((row) => row[j] ** 2))));
  const uncovered = DIMENSIONS.filter((_, j) => denom[j] === 0 && g[j] > EPSILON);
  if (uncovered.length) return { ...base, q, uncovered, status: "UNCOVERED_DIMENSION" as RunStatus };
  const N = R.map((row) => row.map((x, j) => denom[j] === 0 ? 0 : x / denom[j]));
  const V = N.map((row) => row.map((x, j) => x * q[j]));
  const idealPlus = DIMENSIONS.map((_, j) => Math.max(...V.map((row) => row[j])));
  const idealMinus = DIMENSIONS.map((_, j) => Math.min(...V.map((row) => row[j])));
  const Dplus = V.map((row) => Math.sqrt(sum(row.map((x, j) => (x - idealPlus[j]) ** 2))));
  const Dminus = V.map((row) => Math.sqrt(sum(row.map((x, j) => (x - idealMinus[j]) ** 2))));
  const distances = { ...base, q, N, V, idealPlus, idealMinus, Dplus, Dminus };
  if (Dplus.every((x, i) => x + Dminus[i] <= EPSILON)) return { ...distances, status: "ALTERNATIVES_NOT_DISTINGUISHABLE" as RunStatus };
  const C = Dplus.map((x, i) => finite(Dminus[i] / (x + Dminus[i]))), rank = minimumRanks(C);
  const ranking = MODULES.map((code, i) => ({ code, C: C[i], rank: rank[i], Dplus: Dplus[i], Dminus: Dminus[i] })).sort((a, b) => a.rank - b.rank || a.code.localeCompare(b.code));
  return { ...distances, C, rank, ranking, topSet: ranking.filter((r) => r.rank === 1).map((r) => r.code), status: "RANKED" as RunStatus };
}
export type Decision = ReturnType<typeof topsis>;
// Pearson correlation of midranks is Spearman, including tied rankings.
export function spearman(a: number[], b: number[]) {
  assert(a.length === b.length && a.length > 1, "Panjang ranking berbeda.");
  const mid = (v: number[]) => v.map((x) => 1 + v.filter((y) => y < x - EPSILON).length + (v.filter((y) => Math.abs(y - x) <= EPSILON).length - 1) / 2);
  const x = mid(a), y = mid(b), mx = mean(x), my = mean(y);
  const denom = Math.sqrt(sum(x.map((v) => (v - mx) ** 2)) * sum(y.map((v) => (v - my) ** 2)));
  return denom <= EPSILON ? null : sum(x.map((v, i) => (v - mx) * (y[i] - my))) / denom;
}
export function compareRankings(system: Decision, ranks: Record<string, number>) {
  assert(system.status === "RANKED", "Ranking sistem belum tersedia.");
  const expert = MODULES.map((m) => score(ranks[m], 7));
  assert(new Set(expert).size === 7 && expert.every((r) => r >= 1), "Peringkat harus unik 1–7.");
  const top3 = system.ranking.filter((r) => r.rank <= 3).map((r) => r.code);
  return { firstInTopSet: system.topSet.includes(MODULES[expert.indexOf(1)]), overlapTop3: MODULES.filter((m, i) => expert[i] <= 3 && top3.includes(m)).length, spearman: spearman(system.rank, expert) };
}
export function sensitivity(answers: Answers, model: Pick<Model, "w" | "R">) {
  const original = topsis(answers, model.w, model.R);
  return DIMENSIONS.flatMap((dimension, j) => [-.2, -.1, .1, .2].map((change) => {
    const w = normalize(model.w.map((x, k) => x * (j === k ? 1 + change : 1)));
    const result = topsis(answers, w, model.R);
    return { dimension, change, w, result, sameTopSet: original.status === "RANKED" && result.status === "RANKED" ? [...original.topSet].sort().join() === [...result.topSet].sort().join() : null, overlapTop3: result.status === "RANKED" && original.status === "RANKED" ? result.ranking.filter((r) => r.rank <= 3 && original.ranking.some((o) => o.code === r.code && o.rank <= 3)).length : null, spearman: result.status === "RANKED" && original.status === "RANKED" ? spearman(original.rank, result.rank) : null };
  }));
}
