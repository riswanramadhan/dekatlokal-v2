import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import "./auth.css";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-shell">
      <a className="auth-skip-link" href="#auth-content">
        Lewati ke formulir
      </a>

      <section className="auth-form-panel" aria-label="Akses akun Ruang Tumbuh">
        <div className="auth-form-shell" id="auth-content" tabIndex={-1}>
          <div className="auth-brand-row auth-default-brand-row">
            <Link
              className="auth-brand-link"
              href="/"
              aria-label="Kembali ke beranda DekatLokal"
            >
              <Image
                alt="DekatLokal"
                className="auth-brand-logo"
                height={48}
                priority
                src="/brand/dekat-lokal.png"
                width={165}
              />
            </Link>
            <span className="auth-context-pill auth-context-default">
              <span aria-hidden="true" />
              Ruang Tumbuh
            </span>
          </div>

          <div className="auth-status-row auth-maintenance-row">
            <span className="auth-context-pill" role="status">
              <span aria-hidden="true" />
              Dalam maintenance
            </span>
          </div>

          {children}

          <p className="auth-support-copy">
            Butuh bantuan?{" "}
            <a href="mailto:hello@dekatlokal.com">Hubungi tim DekatLokal</a>
          </p>
        </div>
      </section>
    </main>
  );
}
