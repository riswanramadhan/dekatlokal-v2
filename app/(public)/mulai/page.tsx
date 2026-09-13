import type { Metadata } from "next";
import { CheckupWizard } from "@/components/digital-checkup/checkup-wizard";
import { currentActor, supabaseConfigured } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { expertEntry } from "@/lib/digital-checkup/expert-access";
import "@/app/digital-checkup.css";
export const metadata: Metadata = { title: "Mulai Digital Checkup Gratis", description: "Kenali kondisi usahamu melalui 32 pertanyaan sederhana dan temukan pendampingan yang sesuai kebutuhan bersama DekatLokal." };
export const dynamic = "force-dynamic";
export default async function MulaiPage() {
  const configured = supabaseConfigured();
  if (await expertEntry()) redirect("/ahli");
  if (configured && (await currentActor())?.role === "expert") redirect("/ahli");
  return <CheckupWizard configured={configured} />;
}
