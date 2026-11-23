import "server-only";
import { redirect } from "next/navigation";
import { currentActor, supabaseConfigured } from "@/lib/supabase/server";

/** Halaman dashboard website hanya untuk akun UMKM; tamu diarahkan ke /masuk?next=… */
export async function requireSiteOwner(next: string) {
  const signIn = `/masuk?next=${encodeURIComponent(next)}`;
  if (!supabaseConfigured()) redirect(signIn);
  let actor: Awaited<ReturnType<typeof currentActor>> = null;
  try { actor = await currentActor(); } catch { actor = null; }
  if (!actor) redirect(signIn);
  if (actor.role === "expert") redirect("/ahli");
  if (actor.role !== "umkm") redirect("/admin");
  return actor;
}
