import type { Metadata } from "next";
import { AdminSignIn } from "@/components/auth/admin-sign-in";
import { RequestsAdmin } from "@/components/layanan/requests-admin";
import { currentActor, supabaseConfigured } from "@/lib/supabase/server";
import "@/app/digital-checkup.css";
import "@/app/commerce.css";

export const metadata: Metadata = { title: "Permintaan Layanan | Admin Digital Checkup", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ServiceRequestsPage() {
  if (!supabaseConfigured()) return <AdminSignIn available={false} />;
  let actor;
  try { actor = await currentActor(); } catch { return <AdminSignIn notice="Sesi belum dapat diperiksa. Silakan masuk kembali." />; }
  if (!actor || actor.role !== "admin") return <AdminSignIn notice={actor ? "Halaman permintaan layanan hanya untuk akun admin." : ""} />;
  return <RequestsAdmin name={actor.name} />;
}
