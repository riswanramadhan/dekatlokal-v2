// Nomor UMKM yang dibaca pengelola: satu nomor per usaha, hanya untuk usaha yang sudah
// punya minimal satu checkup final. Urutan mengikuti waktu kirim pertama, sehingga nomor
// tidak berubah ketika data disaring atau usaha lain menambah revisi.
export type CodeSession = { id: string; umkm_id: string; status: string; submitted_at?: string | null; started_at?: string | null };

const time = (value?: string | null) => { const t = value ? Date.parse(value) : NaN; return Number.isFinite(t) ? t : Number.POSITIVE_INFINITY; };

export const umkmCode = (ordinal: number) => `U${String(ordinal).padStart(3, "0")}`;

export function assignUmkmCodes(sessions: CodeSession[]): Map<string, string> {
  const earliest = new Map<string, number>();
  for (const session of sessions) {
    if (session.status !== "submitted") continue;
    const at = Math.min(time(session.submitted_at), earliest.get(session.umkm_id) ?? Number.POSITIVE_INFINITY);
    earliest.set(session.umkm_id, at);
  }
  const ordered = [...earliest.entries()].sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]));
  return new Map(ordered.map(([umkmId], index) => [umkmId, umkmCode(index + 1)]));
}

export function sessionLabel(code: string | null | undefined, revisionNumber: number): string {
  if (!code) return "Draf";
  return revisionNumber > 1 ? `${code} · revisi ${revisionNumber}` : code;
}
