import "server-only";

/**
 * Status penyedia login dari Supabase Auth (`/auth/v1/settings`, endpoint publik).
 * Dipakai untuk menyembunyikan tombol Google selama provider belum diaktifkan di dashboard,
 * supaya pengguna tidak mendarat di halaman error JSON Supabase.
 */
type Settings = { external?: Record<string, boolean> };

let cache: { value: boolean | null; expiresAt: number } | null = null;
const CACHE_MS = 5 * 60_000;

export function googleEnabledFrom(settings: unknown): boolean | null {
  if (!settings || typeof settings !== "object") return null;
  const external = (settings as Settings).external;
  if (!external || typeof external !== "object") return null;
  return external.google === true;
}

/** true/false bila status diketahui; null bila Supabase tidak bisa dihubungi (tombol tetap ditampilkan). */
export async function googleAuthEnabled(): Promise<boolean | null> {
  if (cache && cache.expiresAt > Date.now()) return cache.value;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  let value: boolean | null = null;
  if (url && key) {
    try {
      const response = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key }, signal: AbortSignal.timeout(4000), cache: "no-store" });
      if (response.ok) value = googleEnabledFrom(await response.json());
    } catch {
      value = null;
    }
  }
  cache = { value, expiresAt: Date.now() + (value === null ? 30_000 : CACHE_MS) };
  return value;
}
