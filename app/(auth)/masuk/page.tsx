import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/auth/sign-in-form";
import { safeNextPath } from "@/lib/digital-checkup/next-path";
import "./signin.css";

export const metadata: Metadata = { title: "Masuk ke DekatLokal", robots: { index: false, follow: true } };

export default async function MasukPage({ searchParams }: {
  searchParams: Promise<{ claim?: string; status?: string; next?: string }>;
}) {
  const { claim, status, next } = await searchParams;
  if (claim) redirect(`/mulai?claim=${encodeURIComponent(claim)}`);
  return <SignInForm next={safeNextPath(next)} initialNotice={status === "tautan-kedaluwarsa" ? "Tautan sudah tidak berlaku atau belum bisa diverifikasi. Minta kode baru lewat email di bawah ini." : ""} />;
}
