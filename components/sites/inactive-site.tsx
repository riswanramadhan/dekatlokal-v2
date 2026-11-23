import Link from "next/link";
import s from "./inactive-site.module.css";

/** Halaman pengganti saat masa gratis website habis dan belum di-upgrade. */
export function InactiveSite({ businessName }: { businessName: string }) {
  return <main className={s.page}>
    <div className={s.card}>
      <p className={s.eyebrow}>{businessName}</p>
      <h1>Website ini sedang tidak aktif</h1>
      <p>Pemilik usaha sedang menyiapkan ulang halamannya. Silakan kembali lagi nanti, atau hubungi usaha ini lewat media sosialnya.</p>
      <div className={s.actions}>
        <Link className={s.primary} href="/templates">Buat website gratis untuk usahamu</Link>
        <Link className={s.link} href="/">Kenali DekatLokal</Link>
      </div>
    </div>
  </main>;
}
