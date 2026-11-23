import "server-only";
import type { Decision } from "@/lib/decision-engine";
import { serviceClient } from "@/lib/supabase/server";
import { dbError } from "@/lib/digital-checkup/http";
import type { BusinessProfile } from "@/lib/digital-checkup/validation";

export interface RankedRunSource {
  assessmentId: string;
  submittedAt: string | null;
  profile: Partial<BusinessProfile>;
  runId: string;
  runCreatedAt: string;
  trace: Decision | null;
}

type SessionRow = { id: string; submitted_at: string | null; payload: { profile?: Partial<BusinessProfile> } | null };
type RunRow = { id: string; assessment_id: string; created_at: string; trace?: Decision };

/**
 * Run berstatus RANKED terbaru milik pengguna: checkup terkirim paling akhir yang punya run berperingkat,
 * lalu run terbaru untuk checkup tersebut. withTrace=false hanya mengecek ketersediaan (lebih ringan).
 */
export async function latestRankedRun(userId: string, withTrace = true): Promise<RankedRunSource | null> {
  const db = serviceClient();
  const { data: owners, error } = await db.from("dc_umkm_profiles").select("id").eq("owner_id", userId);
  dbError(error);
  const umkmIds = ((owners ?? []) as { id: string }[]).map((row) => row.id);
  if (!umkmIds.length) return null;
  const { data: sessions, error: sessionError } = await db.from("dc_assessment_sessions").select("id,submitted_at,payload").in("umkm_id", umkmIds).eq("status", "submitted").order("submitted_at", { ascending: false }).limit(20);
  dbError(sessionError);
  const submitted = (sessions ?? []) as SessionRow[];
  if (!submitted.length) return null;
  const { data: runs, error: runError } = await db.from("dc_decision_runs").select(withTrace ? "id,assessment_id,created_at,trace" : "id,assessment_id,created_at").in("assessment_id", submitted.map((row) => row.id)).eq("status", "RANKED").order("created_at", { ascending: false }).limit(60);
  dbError(runError);
  const ranked = (runs ?? []) as unknown as RunRow[];
  for (const session of submitted) {
    const run = ranked.find((item) => item.assessment_id === session.id);
    if (run) return { assessmentId: session.id, submittedAt: session.submitted_at, profile: session.payload?.profile ?? {}, runId: run.id, runCreatedAt: run.created_at, trace: run.trace ?? null };
  }
  return null;
}
