import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Digital Checkup Sedang Dipelihara",
  description:
    "Informasi pemeliharaan sementara layanan Digital Checkup DekatLokal.",
};

export default function MulaiMaintenancePage() {
  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="maintenance-title">
        <div className={styles.visualPanel}>
          <Link
            className={styles.logo}
            href="/"
            aria-label="Kembali ke beranda DekatLokal"
          >
            <Image
              alt="DekatLokal"
              height={48}
              priority
              src="/brand/dekat-lokal.png"
              width={165}
            />
          </Link>

          <div className={styles.visual} aria-hidden="true">
            <Image
              alt=""
              className={styles.maintenanceImage}
              height={420}
              priority
              src="/illustrations/maintenance-toolkit.png"
              width={420}
            />
          </div>
        </div>

        <div className={styles.content}>
          <p className={styles.kicker}>Digital Checkup</p>
          <h1 id="maintenance-title">Kami sedang melakukan pemeliharaan.</h1>
          <p className={styles.copy}>
            Layanan ini sementara belum tersedia. Kami sedang menyiapkan
            pengalaman yang lebih stabil dan nyaman untukmu.
          </p>

          <p className={styles.status} role="status">
            <span aria-hidden="true" />
            Silakan kembali lagi beberapa saat.
          </p>

          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/">
              <ArrowLeft aria-hidden="true" />
              Kembali ke Beranda
            </Link>
            <a
              className={styles.secondaryAction}
              href="mailto:hello@dekatlokal.com"
            >
              <Mail aria-hidden="true" />
              Hubungi Tim
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
