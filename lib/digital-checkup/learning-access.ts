import "server-only";
import { serviceClient } from "@/lib/supabase/server";
import { dbError } from "./http";

type AccessRow = { starts_at: string; expires_at: string };
export type LearningAccess = { startsAt: string; expiresAt: string; active: boolean; daysLeft: number };

export async function ensureLearningAccess(userId: string): Promise<LearningAccess> {
  const { data, error } = await serviceClient().rpc("dc_ensure_learning_access", { p_user: userId });
  dbError(error);
  const row = (Array.isArray(data) ? data[0] : data) as AccessRow | null;
  if (!row?.starts_at || !row.expires_at) throw new Error("Masa akses belajar belum berhasil disiapkan.");
  const remaining = new Date(row.expires_at).getTime() - Date.now();
  return { startsAt: row.starts_at, expiresAt: row.expires_at, active: remaining > 0, daysLeft: Math.max(0, Math.ceil(remaining / 86_400_000)) };
}

export function requireActiveLearning(access: LearningAccess) {
  if (!access.active) throw new Error("Masa akses gratis 7 harimu sudah selesai. Progresmu tetap tersimpan.");
}
