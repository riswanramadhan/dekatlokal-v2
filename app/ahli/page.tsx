import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentActor, supabaseConfigured } from "@/lib/supabase/server";
import { ExpertWorkspace } from "@/components/digital-checkup/expert-workspace";
import "@/app/digital-checkup.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Ruang Ahli Digital Checkup", robots: { index: false, follow: false } };
export default async function ExpertPage() {
  if (!supabaseConfigured()) redirect("/masuk");
  const actor = await currentActor(); if (actor?.role !== "expert") redirect("/masuk");
  return <ExpertWorkspace />;
}
