import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminSignIn } from "@/components/auth/admin-sign-in";
import { AdminShell } from "@/components/admin/admin-shell";
import { currentActor, supabaseConfigured } from "@/lib/supabase/server";
import "./admin.css";

export const metadata: Metadata = { title: { default: "Admin Digital Checkup", template: "%s · Admin Digital Checkup" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
const ROLES = ["admin", "researcher"];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (!supabaseConfigured()) return <AdminSignIn available={false} />;
  let actor: Awaited<ReturnType<typeof currentActor>>;
  try { actor = await currentActor(); } catch { return <AdminSignIn notice="Sesi belum dapat diperiksa. Silakan masuk kembali." />; }
  if (!actor || !ROLES.includes(actor.role)) return <AdminSignIn notice={actor ? "Gunakan akun yang memiliki akses admin atau peneliti." : ""} />;
  return <AdminShell name={actor.name}>{children}</AdminShell>;
}
