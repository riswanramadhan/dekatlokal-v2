import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentActor, supabaseConfigured } from "@/lib/supabase/server";
import { layananOverview, type LayananOverview } from "@/lib/layanan/overview";
import { ProServices } from "@/components/layanan/pro-services";
import "@/app/digital-checkup.css";
import "@/app/commerce.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Layanan Pro | DekatLokal",
  description: "Checkup Pro, Optimasi Google Business Profile, dan Website Care untuk UMKM. Bayar manual, diaktifkan admin.",
  robots: { index: false, follow: false },
};

const SIGN_IN = "/masuk?next=/layanan-pro";

export default async function LayananProPage() {
  if (!supabaseConfigured()) redirect(SIGN_IN);
  let actor: Awaited<ReturnType<typeof currentActor>> = null;
  try { actor = await currentActor(); } catch { actor = null; }
  if (!actor) redirect(SIGN_IN);
  if (actor.role === "expert") redirect("/ahli");
  if (actor.role === "admin") redirect("/admin/permintaan");
  if (actor.role !== "umkm") redirect("/admin");
  let initial: LayananOverview | null = null;
  try { initial = await layananOverview(actor.id); } catch { initial = null; }
  return <ProServices initial={initial} name={actor.name} />;
}
