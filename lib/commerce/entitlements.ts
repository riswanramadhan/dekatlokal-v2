import "server-only";
import { serviceClient } from "@/lib/supabase/server";
import { dbError } from "@/lib/digital-checkup/http";
import { TRIAL_DAYS, type Feature } from "./catalog";
import { accessFrom, type Entitlement } from "./access";

export { accessFrom, type AccessState, type Entitlement } from "./access";

type Row = { id: string; feature: Feature; resource_id: string | null; source: "trial" | "order"; starts_at: string; expires_at: string | null };
const map = (row: Row): Entitlement => ({ id: row.id, feature: row.feature, resourceId: row.resource_id, source: row.source, startsAt: row.starts_at, expiresAt: row.expires_at });

export async function listEntitlements(userId: string): Promise<Entitlement[]> {
  const { data, error } = await serviceClient().from("dc_entitlements").select("id,feature,resource_id,source,starts_at,expires_at").eq("user_id", userId).order("created_at", { ascending: false });
  dbError(error);
  return ((data ?? []) as Row[]).map(map);
}

export async function accessFor(userId: string, feature: Feature, resourceId?: string | null) {
  return accessFrom(await listEntitlements(userId), feature, resourceId);
}

/** Memulai trial sekali pakai. Bila trial pernah dipakai, mengembalikan trial lama (mungkin sudah habis). */
export async function startTrial(userId: string, feature: Feature, resourceId: string | null = null) {
  const days = TRIAL_DAYS[feature];
  if (!days) throw new Error("Fitur ini tidak punya masa coba gratis.");
  const { error } = await serviceClient().rpc("dc_start_trial", { p_user: userId, p_feature: feature, p_resource: resourceId, p_days: days });
  if (error) throw new Error(/UMKM account/.test(error.message) ? "Masa coba hanya untuk akun UMKM." : "Masa coba belum berhasil dimulai. Coba lagi.");
  return accessFor(userId, feature, resourceId);
}
