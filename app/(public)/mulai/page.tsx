import type { Metadata } from "next";
import { CheckupWizard } from "@/components/digital-checkup/checkup-wizard";
import { currentActor, supabaseConfigured } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import "@/app/digital-checkup.css";
export const metadata: Metadata = { title: "Mulai Digital Checkup Gratis", description: "Kenali kondisi usahamu melalui 32 pertanyaan sederhana dan temukan pendampingan yang sesuai kebutuhan bersama DekatLokal." };
export const dynamic = "force-dynamic";
export default async function MulaiPage() {
  const configured = supabaseConfigured();
  if (configured && (await currentActor())?.role === "expert") redirect("/ahli");
  return <CheckupWizard configured={configured} />;
}
