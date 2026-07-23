import Image from "next/image";
import Link from "next/link";
import { BookOpenCheck, ChartNoAxesColumnIncreasing, ClipboardCheck, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import "./auth.css";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-shell">
      <a className="auth-skip-link" href="#auth-content">
        Lewati ke formulir
      </a>

      <aside className="auth-brand-panel" aria-label="Perjalanan Ruang Tumbuh">
        <div className="auth-brand-inner">
          <Link className="auth-brand-link" href="/" aria-label="Kembali ke DekatLokal">
            <Image
              alt="DekatLokal"
              className="auth-brand-logo"
              height={48}
              priority
              src="/brand/dekat-lokal.png"
              width={165}
            />
          </Link>

          <div className="auth-brand-copy">
            <p className="auth-brand-eyebrow">Ruang Tumbuh untuk UMKM</p>
            <h1>
              Lanjutkan hasil <span>Checkup</span> menjadi langkah nyata.
            </h1>
            <p>
              Masuk untuk melihat fokus usaha, mengikuti course yang relevan,
              dan menyimpan setiap aksi yang sudah diterapkan.
            </p>
          </div>

          <ol className="auth-journey" aria-label="Tahap perjalanan usaha">
            <li>
              <span className="auth-journey-icon">
                <ClipboardCheck aria-hidden="true" />
              </span>
              <div>
                <strong>Checkup</strong>
                <small>Kenali kondisi dan prioritas usahamu.</small>
              </div>
            </li>
            <li>
              <span className="auth-journey-icon">
                <ChartNoAxesColumnIncreasing aria-hidden="true" />
              </span>
              <div>
                <strong>Jalur Naik Kelas</strong>
                <small>Dapatkan langkah yang disusun sesuai kebutuhan.</small>
              </div>
            </li>
            <li>
              <span className="auth-journey-icon">
                <BookOpenCheck aria-hidden="true" />
              </span>
              <div>
                <strong>Course &amp; Aksi Usaha</strong>
                <small>Belajar singkat, terapkan, lalu lihat perkembangannya.</small>
              </div>
            </li>
          </ol>

          <div className="auth-trust-note">
            <ShieldCheck aria-hidden="true" />
            <span>Data hasil Checkup tetap terhubung secara aman ke akunmu.</span>
          </div>
        </div>
      </aside>

      <section className="auth-form-panel" aria-label="Akses akun Ruang Tumbuh">
        <div className="auth-form-shell" id="auth-content" tabIndex={-1}>
          <div className="auth-context-pill">
            <span aria-hidden="true" />
            DekatLokal · Ruang Tumbuh
          </div>
          {children}
          <p className="auth-support-copy">
            Butuh bantuan? <a href="mailto:hello@dekatlokal.com">Hubungi tim DekatLokal</a>
          </p>
        </div>
      </section>
    </main>
  );
}
