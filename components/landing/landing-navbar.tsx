import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, X } from "lucide-react";

const navItems = [
  ["Beranda", "#beranda"],
  ["Cara Kerja", "#akses-belajar"],
  ["Cerita", "#pengalaman"],
  ["Course", "#course"],
  ["Harga", "#paket"],
  ["FAQ", "#faq"],
] as const;

export function LandingNavbar({ checkupHref }: { checkupHref: string }) {
  return (
    <>
      <header className="dl-navbar" data-scrolled="false">
        <Link aria-label="Ke beranda DekatLokal" className="dl-navbar-logo" href="#beranda">
          <Image alt="DekatLokal" height={44} priority src="/brand/dekat-lokal.png" unoptimized width={143} />
        </Link>

        <nav aria-label="Navigasi landing page" className="dl-navbar-links">
          {navItems.map(([label, href]) => (
            <Link
              aria-current={href === "#beranda" ? "page" : undefined}
              className={href === "#beranda" ? "is-active" : undefined}
              href={href}
              key={href}
            >
              {label}
            </Link>
          ))}
          <span aria-hidden="true" className="dl-navbar-indicator" />
        </nav>

        <div className="dl-navbar-actions">
          <Link className="dl-navbar-login" href="/masuk">
            Masuk
          </Link>
          <Link className="dl-navbar-checkup" href={checkupHref}>
            Mulai Cek <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>

        <button
          aria-controls="landing-mobile-menu"
          aria-expanded="false"
          aria-label="Buka menu utama"
          className="dl-navbar-menu-button"
          type="button"
        >
          <span aria-hidden="true" className="dl-menu-button-glyph">
            <i />
            <i />
            <i />
          </span>
        </button>
      </header>

      <button
        aria-hidden="true"
        aria-label="Tutup menu"
        className="dl-mobile-overlay"
        tabIndex={-1}
        type="button"
      />
      <aside
        aria-hidden="true"
        aria-labelledby="landing-mobile-menu-title"
        aria-modal="true"
        className="dl-mobile-menu"
        id="landing-mobile-menu"
        role="dialog"
      >
        <div className="dl-mobile-menu-head">
          <Link
            aria-label="Ke beranda DekatLokal"
            className="dl-mobile-menu-brand"
            href="#beranda"
          >
            <Image
              alt=""
              aria-hidden="true"
              height={38}
              src="/brand/dekat-lokal-icon.png"
              unoptimized
              width={38}
            />
            <span>
              <strong id="landing-mobile-menu-title">DekatLokal</strong>
              <small>Ruang tumbuh UMKM</small>
            </span>
          </Link>
          <button aria-label="Tutup menu utama" type="button">
            <X aria-hidden="true" size={22} />
          </button>
        </div>

        <div className="dl-mobile-menu-intro">
          <span>
            <Sparkles aria-hidden="true" size={14} />
            Menu utama
          </span>
          <p>Temukan langkah paling relevan untuk membawa usahamu bertumbuh.</p>
        </div>

        <nav aria-label="Navigasi landing page mobile" className="dl-mobile-menu-links">
          {navItems.map(([label, href], index) => (
            <Link href={href} key={href}>
              <span>0{index + 1}</span>
              <strong>{label}</strong>
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
          ))}
        </nav>

        <div className="dl-mobile-menu-footer">
          <Link className="dl-mobile-menu-login" href="/masuk">
            Masuk ke Ruang Tumbuh
          </Link>
          <Link className="dl-mobile-menu-checkup" href={checkupHref}>
            Mulai Cek Gratis <ArrowRight aria-hidden="true" size={17} />
          </Link>
          <small>Gratis • 5–7 menit • Hasil langsung</small>
        </div>
      </aside>
    </>
  );
}
