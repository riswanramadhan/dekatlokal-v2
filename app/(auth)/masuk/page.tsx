import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/auth/sign-in-form";
import "./signin.css";

export const metadata: Metadata = { title: "Masuk ke DekatLokal", robots: { index: false, follow: true } };

export default async function MasukPage({ searchParams }: {
  searchParams: Promise<{ claim?: string; status?: string }>;
}) {
  const { claim, status } = await searchParams;
  if (claim) redirect(`/mulai?claim=${encodeURIComponent(claim)}`);
  return <SignInForm initialNotice={status === "tautan-kedaluwarsa" ? "Tautan masuk sudah tidak berlaku atau belum bisa diverifikasi. Minta tautan baru lewat email di bawah ini." : ""} />;
}
