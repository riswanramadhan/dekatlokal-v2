import "server-only";
import { cookies } from "next/headers";
import { currentActor, serviceClient } from "@/lib/supabase/server";
import { tokenHash } from "./canonical";
import { dbError } from "./http";

export async function claimGuest(actorId: string) {
  const jar = await cookies(), token = jar.get("dc_session")?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return;
  const { error } = await serviceClient().rpc("dc_claim_assessment", { p_hash: tokenHash(token), p_actor: actorId });
  dbError(error);
  jar.delete("dc_session");
}
export async function finishSignIn() {
  const actor = await currentActor();
  if (!actor) throw new Error("Sesi masuk belum terbentuk. Coba lagi.");
  if (actor.role === "expert") return "/ahli";
  if (["admin", "researcher"].includes(actor.role)) return "/admin";
  const { error } = await serviceClient().from("dc_profiles").upsert({ user_id: actor.id, role: "umkm" }, { onConflict: "user_id", ignoreDuplicates: true }); dbError(error);
  try { await claimGuest(actor.id); } catch { return "/dashboard?claim=pending"; }
  return "/dashboard";
}
