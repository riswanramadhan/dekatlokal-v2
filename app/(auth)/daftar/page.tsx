import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle, ArrowRight, MessageCircle } from "lucide-react";
import { AuthConnectivityNotice, AuthPendingButton } from "@/components/auth";
import { FieldLabel, Input } from "@/components/ui";
import { startSignup } from "@/features/auth/actions";

export const metadata: Metadata = {
  title: "Buat Akun Ruang Tumbuh",
};

type DaftarPageProps = {
  searchParams: Promise<{ claim?: string; status?: string }>;
};

export default async function DaftarPage({ searchParams }: DaftarPageProps) {
  const { claim, status } = await searchParams;
  if (claim) {
    redirect(`/mulai?claim=${encodeURIComponent(claim)}`);
  }

  return (
    <article className="auth-card">
      <header>
        <p className="auth-heading-kicker">Mulai perjalananmu</p>
        <h2>Buat akun Ruang Tumbuh</h2>
        <p className="auth-heading-copy">
          Simpan hasil Checkup, fokus usaha, dan progres belajar.
        </p>
      </header>

      <AuthConnectivityNotice />

      {status === "invalid" ? (
        <div className="auth-alert auth-alert-danger" role="alert">
          <AlertCircle aria-hidden="true" />
          <span>Lengkapi nama pemilik, nama usaha, dan nomor WhatsApp.</span>
        </div>
      ) : null}

      <form action={startSignup} className="auth-form-stack">
        <div className="auth-field">
          <FieldLabel htmlFor="name">Nama pemilik</FieldLabel>
          <Input
            autoComplete="name"
            autoFocus
            className="auth-input"
            id="name"
            name="ownerName"
            placeholder="Contoh: Bu Rina"
            required
          />
        </div>
        <div className="auth-field">
          <FieldLabel htmlFor="business">Nama usaha</FieldLabel>
          <Input
            autoComplete="organization"
            className="auth-input"
            id="business"
            name="businessName"
            placeholder="Contoh: Warung Rina"
            required
          />
        </div>
        <div className="auth-field">
          <FieldLabel htmlFor="phone">Nomor WhatsApp</FieldLabel>
          <Input
            autoComplete="tel"
            className="auth-input"
            id="phone"
            inputMode="tel"
            name="phone"
            placeholder="0812 3456 7890"
            required
          />
        </div>
        <p className="auth-privacy-note">
          Data ini menghubungkan progres dengan usaha yang tepat.
        </p>
        <AuthPendingButton
          className="auth-submit-button"
          pendingLabel="Menyiapkan verifikasi..."
        >
          <MessageCircle aria-hidden="true" />
          Lanjut ke verifikasi
          <ArrowRight aria-hidden="true" />
        </AuthPendingButton>
      </form>

      <p className="auth-card-footer">
        Sudah punya akun? <Link href="/masuk">Masuk sekarang</Link>
      </p>
    </article>
  );
}
