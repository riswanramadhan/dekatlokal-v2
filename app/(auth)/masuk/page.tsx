import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Mail,
  Send,
} from "lucide-react";
import { AuthConnectivityNotice } from "@/components/auth";
import { FieldLabel, Input } from "@/components/ui";

export const metadata: Metadata = {
  title: "Masuk ke Ruang Tumbuh",
};

type MasukPageProps = {
  searchParams: Promise<{ claim?: string; status?: string }>;
};

const statusCopy: Record<string, string> = {
  invalid: "Nomor WhatsApp belum valid. Periksa kembali lalu coba lagi.",
  "email-invalid": "Alamat email belum valid. Periksa kembali lalu coba lagi.",
};

export default async function MasukPage({ searchParams }: MasukPageProps) {
  const { claim, status } = await searchParams;
  if (claim) {
    redirect(`/mulai?claim=${encodeURIComponent(claim)}`);
  }

  const errorMessage = status ? statusCopy[status] : undefined;

  return (
    <article
      aria-labelledby="login-title"
      className="auth-card auth-login-card"
    >
      <section className="auth-login-intro">
        <header>
          <p className="auth-heading-kicker">Selamat datang</p>
          <h1 id="login-title">Masuk ke Ruang Tumbuh</h1>
          <p className="auth-heading-copy">
            Lanjutkan progres usaha dengan akunmu.
          </p>

          <Link
            aria-label="DekatLokal — kembali ke beranda"
            className="auth-login-brand"
            href="/"
          >
            <Image
              alt="DekatLokal"
              className="auth-login-brand-logo"
              height={48}
              priority
              src="/brand/dekat-lokal.png"
              width={165}
            />
          </Link>

          <Link className="auth-home-link" href="/">
            <ArrowLeft aria-hidden="true" />
            Kembali ke beranda
          </Link>
        </header>

        <p className="auth-card-footer">
          Belum punya akun? <Link href="/daftar">Daftar sekarang</Link>
        </p>
      </section>

      <section className="auth-login-main" aria-label="Pilihan masuk">
        <div className="auth-method-viewport">
          <input
            aria-label="Tampilkan formulir masuk dengan email"
            className="auth-panel-toggle"
            defaultChecked={status === "email-invalid"}
            id="auth-email-panel"
            type="checkbox"
          />

          <div className="auth-method-track">
            <div
              aria-label="Masuk dengan WhatsApp atau Google"
              className="auth-method-panel auth-method-panel-primary"
            >
              <AuthConnectivityNotice />

              {errorMessage && status !== "email-invalid" ? (
                <div className="auth-alert auth-alert-danger" role="alert">
                  <AlertCircle aria-hidden="true" />
                  <span>{errorMessage}</span>
                </div>
              ) : null}

              <div className="auth-form-stack">
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
                    Gunakan nomor yang terhubung dengan akunmu.
                  </p>
                </div>
                <button
                  className="auth-submit-button"
                  disabled
                  type="button"
                >
                  <Send aria-hidden="true" />
                  Kirim kode verifikasi
                </button>
              </div>

              <div className="auth-divider">atau</div>

              <button
                className="auth-secondary-button"
                disabled
                type="button"
              >
                <svg
                  aria-hidden="true"
                  className="auth-google-logo"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.55h3.24c1.9-1.75 2.98-4.33 2.98-7.42Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 22c2.7 0 4.98-.9 6.63-2.35l-3.24-2.55c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.63A10 10 0 0 0 12 22Z"
                    fill="#34A853"
                  />
                  <path
                    d="M6.39 13.93A6.02 6.02 0 0 1 6.07 12c0-.67.12-1.32.32-1.93V7.44H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.56l3.35-2.63Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.94c1.47 0 2.79.5 3.82 1.5l2.88-2.88A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.44l3.35 2.63C7.18 7.7 9.39 5.94 12 5.94Z"
                    fill="#EA4335"
                  />
                </svg>
                Lanjut dengan Google
              </button>

              <label
                className="auth-email-switch auth-email-switch-open"
                htmlFor="auth-email-panel"
              >
                <span>
                  <Mail aria-hidden="true" />
                  Masuk dengan email
                </span>
                <ChevronRight aria-hidden="true" />
              </label>
            </div>

            <div
              aria-label="Masuk dengan email"
              className="auth-method-panel auth-method-panel-email"
            >
              <label
                className="auth-email-switch auth-email-switch-back"
                htmlFor="auth-email-panel"
              >
                <ChevronLeft aria-hidden="true" />
                <span>Kembali ke pilihan masuk</span>
              </label>

              {errorMessage && status === "email-invalid" ? (
                <div className="auth-alert auth-alert-danger" role="alert">
                  <AlertCircle aria-hidden="true" />
                  <span>{errorMessage}</span>
                </div>
              ) : null}

              <div className="auth-email-form">
                <div className="auth-form-stack">
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
                  <button
                    className="auth-secondary-button"
                    disabled
                    type="button"
                  >
                    Lanjut dengan email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
