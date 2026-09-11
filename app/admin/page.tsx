import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentActor, supabaseConfigured } from "@/lib/supabase/server";
import { ResearchDashboard } from "@/components/digital-checkup/research-dashboard";
import "@/app/digital-checkup.css";
export const metadata: Metadata = { title: "Admin Digital Checkup", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function AdminPage() {
  if (!supabaseConfigured()) return <main className="dc-page"><section className="dc-panel dc-admin"><h1>Admin Digital Checkup</h1><p>Hubungkan Supabase pengembangan melalui .env.local, jalankan migration, lalu buat akun admin dengan script seed yang disediakan.</p><a href="/masuk">Ke halaman masuk</a></section></main>;
  const actor = await currentActor();
  if (!actor || !["admin", "researcher"].includes(actor.role)) redirect("/masuk");
  return <ResearchDashboard name={actor.name} />;
}
