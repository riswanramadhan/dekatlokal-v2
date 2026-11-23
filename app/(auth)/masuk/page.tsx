import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/auth/sign-in-form";
import { safeNextPath } from "@/lib/digital-checkup/next-path";
import { googleAuthEnabled } from "@/lib/digital-checkup/auth-providers";

const NOTICES: Record<string, string> = {
  "tautan-kedaluwarsa": "Tautan sudah tidak berlaku atau belum bisa diverifikasi. Minta kode baru lewat email di bawah ini.",
  "google-batal": "Masuk dengan Google dibatalkan. Coba lagi, atau pakai kode lewat email.",
  "google-gagal": "Masuk dengan Google belum berhasil. Coba lagi sebentar, atau pakai kode lewat email.",
};
import "./signin.css";

export const metadata: Metadata = { title: "Masuk ke DekatLokal", robots: { index: false, follow: true } };

export default async function MasukPage({ searchParams }: {
  searchParams: Promise<{ claim?: string; status?: string; next?: string }>;
}) {
  const { claim, status, next } = await searchParams;
  if (claim) redirect(`/mulai?claim=${encodeURIComponent(claim)}`);
  // Tombol Google disembunyikan hanya bila Supabase memastikan provider belum aktif.
  const google = (await googleAuthEnabled()) !== false;
  return <SignInForm next={safeNextPath(next)} google={google} initialNotice={(status && NOTICES[status]) || ""} />;
}
