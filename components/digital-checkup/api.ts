export async function api<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const response = await fetch(`/api/digital-checkup/${path}`, { method, cache: "no-store", headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
  const result = await response.json();
  if (!response.ok) throw new Error(result.fields?.length ? result.fields.map((f: { path: string; message: string }) => `${f.path}: ${f.message}`).join(" · ") : result.error || "Koneksi terputus. Coba lagi.");
  return result as T;
}
