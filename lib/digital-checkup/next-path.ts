// Validasi tujuan setelah masuk (modul murni, aman untuk client & test).
/** Tujuan setelah masuk yang aman (path internal produk UMKM saja, tanpa open redirect). */
const NEXT_PREFIXES = ["/dashboard", "/layanan-pro", "/templates", "/situs", "/mulai"];
export function safeNextPath(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 300) return null;
  if (!/^\/(?!\/)[A-Za-z0-9\-._~/?=&%]*$/.test(value)) return null;
  return NEXT_PREFIXES.some((prefix) => value === prefix || value.startsWith(`${prefix}/`) || value.startsWith(`${prefix}?`)) ? value : null;
}
