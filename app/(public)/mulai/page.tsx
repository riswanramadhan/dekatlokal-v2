import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Construction,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Digital Checkup Maintenance | DekatLokal",
  description:
    "Halaman informasi maintenance Assessment Digital Checkup 8 Dimensi DekatLokal.",
};

const dimensions = [
  "Branding",
  "Produk",
  "Media sosial",
  "Operasional",
  "Keuangan",
  "Legalitas",
  "Kanal penjualan",
  "Kesiapan website",
] as const;

export default function MulaiMaintenancePage() {
  return (
    <main className="maintenance-page">
      <section className="maintenance-card" aria-labelledby="maintenance-title">
        <Link className="maintenance-logo" href="/" aria-label="Kembali ke beranda DekatLokal">
          <Image
            alt="DekatLokal"
            height={48}
            priority
            src="/brand/dekat-lokal.png"
            width={165}
          />
        </Link>

        <div className="maintenance-icon" aria-hidden="true">
          <Construction />
        </div>

        <p className="maintenance-kicker">Digital Checkup 8 Dimensi</p>
        <h1 id="maintenance-title">
          Assessment sedang dalam tahap maintenance.
        </h1>
        <p className="maintenance-copy">
          Kami sedang merapikan pengalaman pertanyaan, hasil analisis, dan
          rekomendasi agar setiap UMKM mendapatkan langkah yang lebih tepat.
        </p>

        <div className="maintenance-dimensions" aria-label="Dimensi Digital Checkup">
          {dimensions.map((dimension) => (
            <span key={dimension}>
              <CheckCircle2 aria-hidden="true" />
              {dimension}
            </span>
          ))}
        </div>

        <div className="maintenance-info">
          <span>
            <Clock3 aria-hidden="true" />
            Estimasi kembali segera
          </span>
          <span>
            <ShieldCheck aria-hidden="true" />
            Data lama tetap aman
          </span>
        </div>

        <div className="maintenance-actions">
          <Link className="maintenance-primary" href="/">
            <ArrowLeft aria-hidden="true" />
            Kembali ke Beranda
          </Link>
          <Link className="maintenance-secondary" href="/masuk">
            Masuk ke Ruang Tumbuh
          </Link>
        </div>
      </section>
    </main>
  );
}
