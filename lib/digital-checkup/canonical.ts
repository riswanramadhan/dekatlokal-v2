import { createHash } from "node:crypto";
export function canonical(value: unknown): string {
  if (typeof value === "number" && !Number.isFinite(value)) throw new Error("Canonical input tidak boleh berisi NaN/Infinity.");
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value !== null && typeof value === "object") return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(",")}}`;
  if (value === undefined) throw new Error("Canonical input tidak boleh undefined.");
  return JSON.stringify(value);
}
export const inputHash = (value: unknown) => createHash("sha256").update(canonical(value)).digest("hex");
export const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");
export const csvCell = (value: unknown) => {
  let text = typeof value === "object" ? canonical(value) : String(value ?? "");
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
};
