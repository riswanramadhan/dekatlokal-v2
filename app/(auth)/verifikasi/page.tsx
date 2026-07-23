import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CheckCircle2, RotateCcw, ShieldCheck } from "lucide-react";
import { AuthConnectivityNotice, AuthPendingButton } from "@/components/auth";
import { FieldLabel, Input } from "@/components/ui";
import { resendOtp, verifyOtp } from "@/features/auth/actions";

export const metadata: Metadata = {
  title: "Verifikasi Akun",
};

type VerifikasiPageProps = {
  searchParams: Promise<{ status?: string }>;
};

const statusCopy: Record<string, { tone: "info" | "danger"; text: string }> = {
  sent: {
    tone: "info",
    text: "Permintaan verifikasi telah diterima. Masukkan kode 6 digit untuk melanjutkan.",
  },
  "email-sent": {
    tone: "info",
    text: "Lanjutkan dengan kode 6 digit untuk memverifikasi alamat email Anda.",
  },
  google: {
    tone: "info",
    text: "Akun Google dipilih. Selesaikan verifikasi untuk melanjutkan ke Ruang Tumbuh.",
  },
  invalid: {
    tone: "danger",
    text: "Kode verifikasi tidak cocok. Periksa kembali enam digit yang Anda masukkan.",
  },
  expired: {
    tone: "danger",
    text: "Kode verifikasi sudah kedaluwarsa. Minta kode baru sebelum mencoba lagi.",
  },
  format: {
    tone: "danger",
    text: "Kode verifikasi harus berisi tepat 6 digit angka.",
  },
  resend: {
    tone: "info",
    text: "Permintaan kode baru telah diterima. Masukkan kode terbaru untuk melanjutkan.",
  },
};

export default async function VerifikasiPage({
  searchParams,
}: VerifikasiPageProps) {
  const { status } = await searchParams;
  const statusMessage = status ? statusCopy[status] : undefined;
  const hasError = statusMessage?.tone === "danger";

  return (
    <article className="auth-card">
      <header>
        <p className="auth-heading-kicker">Keamanan akun</p>
        <h2>Masukkan kode 6 digit</h2>
        <p className="auth-heading-copy">
          Selesaikan verifikasi untuk mengakses Jalur Naik Kelas dan progres
          usahamu.
        </p>
      </header>

      <AuthConnectivityNotice />

      {statusMessage ? (
        <div
          className={
            hasError
              ? "auth-alert auth-alert-danger"
              : "auth-alert auth-alert-info"
          }
          role={hasError ? "alert" : "status"}
        >
          {hasError ? (
            <AlertCircle aria-hidden="true" />
          ) : (
            <CheckCircle2 aria-hidden="true" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      ) : null}

      <form action={verifyOtp} className="auth-form-stack">
        <div className="auth-field">
          <FieldLabel htmlFor="otp">Kode verifikasi</FieldLabel>
          <Input
            aria-describedby="otp-help"
            aria-invalid={hasError}
            autoComplete="one-time-code"
            autoFocus
            className="auth-input auth-otp-input"
            id="otp"
            inputMode="numeric"
            maxLength={6}
            name="code"
            pattern="[0-9]{6}"
            placeholder="6 digit"
            required
          />
          <p className="auth-field-hint" id="otp-help">
            Kode hanya dapat digunakan satu kali untuk proses masuk ini.
          </p>
        </div>
        <AuthPendingButton
          className="auth-submit-button"
          pendingLabel="Memverifikasi kode..."
        >
          <ShieldCheck aria-hidden="true" />
          Verifikasi dan lanjutkan
        </AuthPendingButton>
      </form>

      <form action={resendOtp} className="auth-form-stack">
        <AuthPendingButton
          className="auth-secondary-button"
          pendingLabel="Meminta kode baru..."
          variant="secondary"
        >
          <RotateCcw aria-hidden="true" />
          Kirim ulang kode
        </AuthPendingButton>
      </form>

      <Link className="auth-inline-link" href="/masuk">
        <ArrowLeft aria-hidden="true" />
        Kembali ke halaman masuk
      </Link>
    </article>
  );
}
