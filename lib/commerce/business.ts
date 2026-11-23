import "server-only";
import { serviceClient } from "@/lib/supabase/server";
import { dbError } from "@/lib/digital-checkup/http";
import type { BusinessProfile } from "@/lib/digital-checkup/validation";

export interface BusinessSnapshot {
  assessmentId: string;
  submittedAt: string | null;
  profile: Partial<BusinessProfile>;
}

/** Profil usaha dari Checkup terakhir yang sudah dikirim (untuk isi otomatis template, laporan, dan admin). */
export async function latestBusinessProfiles(userIds: string[]): Promise<Map<string, BusinessSnapshot>> {
  const result = new Map<string, BusinessSnapshot>();
  if (!userIds.length) return result;
  const db = serviceClient();
  const { data: owners, error } = await db.from("dc_umkm_profiles").select("id,owner_id").in("owner_id", userIds);
  dbError(error);
  const ownerByUmkm = new Map(((owners ?? []) as { id: string; owner_id: string }[]).map((row) => [row.id, row.owner_id]));
  if (!ownerByUmkm.size) return result;
  const { data: sessions, error: sessionError } = await db
    .from("dc_assessment_sessions")
    .select("id,umkm_id,payload,submitted_at")
    .in("umkm_id", [...ownerByUmkm.keys()])
    .eq("status", "submitted")
    .order("submitted_at", { ascending: false });
  dbError(sessionError);
  for (const row of (sessions ?? []) as { id: string; umkm_id: string; payload: { profile?: Partial<BusinessProfile> }; submitted_at: string | null }[]) {
    const owner = ownerByUmkm.get(row.umkm_id);
    if (owner && !result.has(owner)) result.set(owner, { assessmentId: row.id, submittedAt: row.submitted_at, profile: row.payload?.profile ?? {} });
  }
  return result;
}

export async function latestBusinessProfile(userId: string) {
  return (await latestBusinessProfiles([userId])).get(userId) ?? null;
}
