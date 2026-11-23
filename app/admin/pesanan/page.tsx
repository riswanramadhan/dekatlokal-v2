import type { Metadata } from "next";
import { AdminSignIn } from "@/components/auth/admin-sign-in";
import { OrdersAdmin } from "@/components/commerce/orders-admin";
import { currentActor, supabaseConfigured } from "@/lib/supabase/server";
import "@/app/digital-checkup.css";
import "@/app/commerce.css";

export const metadata: Metadata = { title: "Pesanan | Admin Digital Checkup", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  if (!supabaseConfigured()) return <AdminSignIn available={false} />;
  let actor;
  try { actor = await currentActor(); } catch { return <AdminSignIn notice="Sesi belum dapat diperiksa. Silakan masuk kembali." />; }
  if (!actor || actor.role !== "admin") return <AdminSignIn notice={actor ? "Halaman pesanan hanya untuk akun admin." : ""} />;
  return <OrdersAdmin name={actor.name} />;
}
