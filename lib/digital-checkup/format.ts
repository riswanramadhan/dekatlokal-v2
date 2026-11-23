// Pemformat angka dan tanggal untuk tampilan pengelola. Angka memakai titik desimal
// agar mudah dicocokkan dengan berkas ekspor dan notebook.
export function fmt(value: unknown, digits = 6): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  const text = value.toFixed(digits);
  return text.includes(".") ? text.replace(/0+$/, "").replace(/\.$/, "") : text;
}

export const pretty10 = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value.toFixed(10) : "—";

// Entri matriks perbandingan AHP: 1, 2–9, atau kebalikannya (1/2 … 1/9).
export function ratio(value: unknown): string {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return "—";
  if (value >= 1 - 1e-9) { const rounded = Math.round(value); return Math.abs(value - rounded) < 1e-9 ? String(rounded) : fmt(value, 4); }
  const inverse = 1 / value, rounded = Math.round(inverse);
  return Math.abs(inverse - rounded) < 1e-9 ? `1/${rounded}` : fmt(value, 4);
}

export const tfn = (value: unknown, digits = 4) => Array.isArray(value) && value.length === 3 ? `(${value.map((x) => fmt(x, digits)).join(", ")})` : "—";

export function fmtDate(iso: string | null | undefined, withTime = true): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return "—";
  try {
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", ...(withTime ? { timeStyle: "short" } : {}), timeZone: "Asia/Makassar" }).format(date) + (withTime ? " WITA" : "");
  } catch { return date.toISOString().slice(0, withTime ? 16 : 10).replace("T", " "); }
}

export const percent = (value: unknown, digits = 0) => typeof value === "number" && Number.isFinite(value) ? `${fmt(value, digits)}%` : "—";
