import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentActor, supabaseConfigured } from "@/lib/supabase/server";
import { LearningDashboard } from "@/components/digital-checkup/learning-dashboard";
import "@/app/digital-checkup.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard Belajar Gratis", robots: { index: false, follow: false } };
export default async function DashboardPage() {
  if (!supabaseConfigured()) redirect("/masuk");
  const actor = await currentActor();
  if (!actor) redirect("/masuk");
  if (actor.role === "expert") redirect("/ahli");
  if (actor.role !== "umkm") redirect("/admin");
  return <LearningDashboard />;
}
