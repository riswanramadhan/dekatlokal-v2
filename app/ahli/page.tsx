import type { Metadata } from "next";
import { currentActor, supabaseConfigured } from "@/lib/supabase/server";
import { expertEntry, expertRoster } from "@/lib/digital-checkup/expert-access";
import { ExpertEntry } from "@/components/digital-checkup/expert-entry";
import { ExpertWorkspace } from "@/components/digital-checkup/expert-workspace";
import "@/app/digital-checkup.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Ruang Ahli Digital Checkup", robots: { index: false, follow: false } };
export default async function ExpertPage() {
  const actor = supabaseConfigured() ? await currentActor() : null;
  if (actor?.role === "expert" || await expertEntry()) return <ExpertWorkspace />;
  return <ExpertEntry experts={expertRoster().map((x,slot)=>({slot,name:x.name,requiresCode:Boolean(x.accessCode)}))}/>;
}
