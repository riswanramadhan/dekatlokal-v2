import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { currentActor, serviceClient, supabaseConfigured } from "@/lib/supabase/server";
import { dbError } from "./http";
const COOKIE = "dc_expert_access";
const rosterSchema = z.array(z.object({ name: z.string().trim().min(2).max(150), assignmentId: z.string().uuid(), accessCode: z.string().min(12).max(64).optional() })).length(3);
export function expertRoster() {
  try {
    const list = rosterSchema.parse(JSON.parse(process.env.DC_EXPERT_ROSTER ?? "[]"));
    if (new Set(list.map(x => x.assignmentId)).size !== 3 || new Set(list.map(x => x.name)).size !== 3) return [];
    if (list.some(x => !x.accessCode) && process.env.DC_EXPERT_ALLOW_PUBLIC_ENTRY !== "true") return [];
    return list;
  } catch { return []; }
}
function signature(value: string) {
  const secret = process.env.DC_EXPERT_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || secret.length < 32) throw new Error("Akses ahli belum disiapkan.");
  return createHmac("sha256", secret).update("dc-expert-v1:"+value).digest("hex");
}
function equal(a: string, b: string) { return a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b)); }
export async function enterExpert(slot: number, code?: string) {
  const member = expertRoster()[slot]; if (!member) throw new Error("Nama ahli belum tersedia.");
  if (member.accessCode && !equal(signature(code ?? ""), signature(member.accessCode))) throw new Error("Kode belum cocok. Cek lagi kode dari peneliti, ya.");
  const { data, error } = await serviceClient().from("dc_expert_assignments").select("id,expert_user_id").eq("id", member.assignmentId).single(); dbError(error);
  if (!data?.id) throw new Error("Penugasan ahli belum tersedia.");
  const payload = Buffer.from(JSON.stringify({ id: member.assignmentId, expires: Date.now()+8*3600000 })).toString("base64url");
  (await cookies()).set(COOKIE, payload+"."+signature(payload), { httpOnly:true, secure:process.env.NODE_ENV === "production", sameSite:"lax", path:"/", maxAge:8*3600 });
}
export async function expertEntry() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || token.length > 1024) return null;
  try {
    const [payload, sig, extra] = token.split(".");
    if (extra || !sig || !equal(sig, signature(payload))) return null;
    const parsed = z.object({ id:z.string().uuid(), expires:z.number() }).parse(JSON.parse(Buffer.from(payload,"base64url").toString()));
    if (parsed.expires <= Date.now()) return null;
    return expertRoster().find(x => x.assignmentId === parsed.id) ?? null;
  } catch { return null; }
}
export async function clearExpertEntry() { (await cookies()).delete(COOKIE); }
export async function requireExpertActor() {
  const member = await expertEntry();
  if (member) {
    const { data, error } = await serviceClient().from("dc_expert_assignments").select("id,expert_user_id").eq("id",member.assignmentId).single(); dbError(error);
    if (data?.id) return { id:data.expert_user_id ? String(data.expert_user_id) : null, assignmentId:member.assignmentId, name:member.name };
  }
  const actor = supabaseConfigured() ? await currentActor() : null;
  if (actor?.role === "expert") return { id:actor.id, assignmentId:null, name:actor.name };
  throw new Error("Pilih nama ahli di halaman Ruang Ahli terlebih dahulu.");
}
