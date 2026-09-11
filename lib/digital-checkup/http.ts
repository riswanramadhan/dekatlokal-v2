import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  if (!origin || (origin !== new URL(expected).origin && origin !== new URL(request.url).origin)) throw new Error("Permintaan tidak diizinkan. Muat ulang halaman.");
}
export async function readBody(request: Request) {
  sameOrigin(request);
  if (Number(request.headers.get("content-length") ?? 0) > 180_000) throw new Error("Data terlalu besar.");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Data belum diisi.");
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 180_000) { await reader.cancel(); throw new Error("Data terlalu besar."); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder().decode(bytes)) as unknown; }
  catch { throw new Error("Format data belum sesuai. Muat ulang, lalu coba lagi."); }
}
export const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
export function failure(error: unknown) {
  if (error instanceof ZodError) return json({ error: "Periksa bagian yang belum lengkap.", fields: error.issues.map((i) => ({ path: i.path.join("."), message: i.message })) }, 400);
  // Only controlled Error messages are exposed, never PostgREST error objects or secrets.
  return json({ error: error instanceof Error ? error.message : "Data belum berhasil disimpan. Coba lagi." }, 400);
}
export function dbError(error: unknown) { if (error) throw new Error("Penyimpanan belum berhasil. Muat ulang untuk mendapatkan data terbaru, lalu coba lagi."); }
