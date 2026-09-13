import type { Metadata } from "next";
import { AdminSignIn } from "@/components/auth/admin-sign-in";
import { currentActor, supabaseConfigured } from "@/lib/supabase/server";
import { ResearchDashboard } from "@/components/digital-checkup/research-dashboard";
import "@/app/digital-checkup.css";
export const metadata: Metadata = { title: "Admin Digital Checkup", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function AdminPage() {
  if (!supabaseConfigured()) return <AdminSignIn available={false}/>;
  let actor;
  try {actor=await currentActor();} catch {return <AdminSignIn notice="Sesi belum dapat diperiksa. Silakan masuk kembali."/>;}
  if (!actor || !["admin", "researcher"].includes(actor.role)) return <AdminSignIn notice={actor?"Gunakan akun yang memiliki akses admin atau peneliti.":""}/>;
  return <ResearchDashboard name={actor.name} />;
}
