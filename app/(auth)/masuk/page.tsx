import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle, ChevronDown, Mail, MessageCircle } from "lucide-react";
import { AuthConnectivityNotice, AuthPendingButton } from "@/components/auth";
import { FieldLabel, Input } from "@/components/ui";
import {
  startEmailFallback,
  startGoogleLogin,
  startWhatsappLogin,
} from "@/features/auth/actions";

export const metadata: Metadata = {
  title: "Masuk ke Ruang Tumbuh",
};

type MasukPageProps = {
  searchParams: Promise<{ claim?: string; status?: string }>;
};

const statusCopy: Record<string, string> = {
  invalid: "Nomor WhatsApp belum valid. Periksa kembali sebelum melanjutkan.",
  "email-invalid": "Alamat email belum valid. Periksa kembali sebelum melanjutkan.",
};

export default async function MasukPage({ searchParams }: MasukPageProps) {
  const { claim, status } = await searchParams;
  if (claim) {
    redirect(`/mulai?claim=${encodeURIComponent(claim)}`);
  }

  const errorMessage = status ? statusCopy[status] : undefined;

  return (
    <article className="auth-card">
      <header>
        <p className="auth-heading-kicker">Selamat datang kembali</p>
        <h2>Masuk ke Ruang Tumbuh</h2>
        <p className="auth-heading-copy">
          Lanjutkan Jalur Naik Kelas dan aksi usaha berdasarkan hasil Digital
          Checkup milikmu.
        </p>
      </header>

      <AuthConnectivityNotice />

      {errorMessage ? (
        <div className="auth-alert auth-alert-danger" role="alert">
          <AlertCircle aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      <form action={startWhatsappLogin} className="auth-form-stack">
        <div className="auth-field">
          <FieldLabel htmlFor="phone">Nomor WhatsApp</FieldLabel>
          <Input
            aria-describedby="phone-help"
            aria-invalid={status === "invalid"}
            autoComplete="tel"
            autoFocus
            className="auth-input"
            id="phone"
            inputMode="tel"
            name="phone"
            placeholder="Contoh: 0812 3456 7890"
            required
          />
          <p className="auth-field-hint" id="phone-help">
            Gunakan nomor yang terhubung dengan hasil Digital Checkup.
          </p>
        </div>
        <AuthPendingButton
          className="auth-submit-button"
          pendingLabel="Menyiapkan verifikasi..."
        >
          <MessageCircle aria-hidden="true" />
          Kirim kode verifikasi
        </AuthPendingButton>
      </form>

      <div className="auth-divider">atau</div>

      <form action={startGoogleLogin}>
        <AuthPendingButton
          className="auth-secondary-button"
          pendingLabel="Menghubungkan Google..."
          variant="secondary"
        >
          <span aria-hidden="true" className="auth-google-mark">G</span>
          Lanjut dengan Google
        </AuthPendingButton>
      </form>

      <details className="auth-details" open={status === "email-invalid"}>
        <summary>
          <span>
            <Mail aria-hidden="true" />
            Masuk dengan email
          </span>
          <ChevronDown aria-hidden="true" />
        </summary>
        <div className="auth-details-body">
          <form action={startEmailFallback} className="auth-form-stack">
            <div className="auth-field">
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                aria-invalid={status === "email-invalid"}
                autoComplete="email"
                className="auth-input"
                id="email"
                name="email"
                placeholder="nama@email.com"
                required
                type="email"
              />
            </div>
            <AuthPendingButton
              className="auth-secondary-button"
              pendingLabel="Menyiapkan verifikasi..."
              variant="secondary"
            >
              Lanjut dengan email
            </AuthPendingButton>
          </form>
        </div>
      </details>

      <p className="auth-card-footer">
        Belum punya akun? <Link href="/daftar">Buat akun baru</Link>
      </p>
    </article>
  );
}
