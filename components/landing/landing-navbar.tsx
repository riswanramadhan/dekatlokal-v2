"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeHref, setActiveHref] = useState("#beranda");

  useEffect(() => {
    const updateNavigation = () => {
      setIsScrolled(window.scrollY > 24);
      const marker = window.scrollY + Math.max(120, window.innerHeight * 0.34);
      let nextHref: (typeof navItems)[number][1] = navItems[0][1];
      navItems.forEach(([, href]) => {
        const section = document.querySelector<HTMLElement>(href);
        if (section && section.offsetTop <= marker) nextHref = href;
      });
      setActiveHref(nextHref);
    };

    updateNavigation();
    window.addEventListener("scroll", updateNavigation, { passive: true });
    window.addEventListener("resize", updateNavigation, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateNavigation);
      window.removeEventListener("resize", updateNavigation);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dl-menu-is-open", isOpen);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.classList.remove("dl-menu-is-open");
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <>
      <header
        className={`dl-navbar${isScrolled ? " is-scrolled" : ""}`}
        data-scrolled={String(isScrolled)}
      >
        <Link aria-label="Ke beranda DekatLokal" className="dl-navbar-logo" href="#beranda">
          <Image alt="DekatLokal" height={44} priority src="/brand/dekat-lokal.png" unoptimized width={143} />
        </Link>

        <nav aria-label="Navigasi landing page" className="dl-navbar-links">
          {navItems.map(([label, href]) => {
            const isActive = activeHref === href;
            return (
              <Link aria-current={isActive ? "page" : undefined} className={isActive ? "is-active" : undefined} href={href} key={href}>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="dl-navbar-actions">
          <Link className="dl-navbar-login" href="/masuk">Masuk</Link>
          <Link className="dl-navbar-checkup" href={checkupHref}>Mulai Cek <ArrowRight aria-hidden="true" size={16} /></Link>
        </div>

        <button
          aria-controls="landing-mobile-menu"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Tutup menu utama" : "Buka menu utama"}
          className="dl-navbar-menu-button"
          onClick={() => setIsOpen((open) => !open)}
          type="button"
        >
          <span aria-hidden="true" className="dl-menu-button-glyph"><i /><i /><i /></span>
        </button>
      </header>

      <button aria-hidden={!isOpen} aria-label="Tutup menu" className={`dl-mobile-overlay${isOpen ? " is-open" : ""}`} onClick={() => setIsOpen(false)} tabIndex={isOpen ? 0 : -1} type="button" />
      <aside aria-hidden={!isOpen} aria-labelledby="landing-mobile-menu-title" aria-modal="true" className={`dl-mobile-menu${isOpen ? " is-open" : ""}`} id="landing-mobile-menu" role="dialog">
        <div className="dl-mobile-menu-head">
          <Link aria-label="Ke beranda DekatLokal" className="dl-mobile-menu-brand" href="#beranda" onClick={() => setIsOpen(false)}>
            <Image alt="" aria-hidden="true" height={38} src="/brand/dekat-lokal-icon.png" unoptimized width={38} />
            <span><strong id="landing-mobile-menu-title">DekatLokal</strong><small>Ruang tumbuh UMKM</small></span>
          </Link>
          <button aria-label="Tutup menu utama" onClick={() => setIsOpen(false)} type="button"><X aria-hidden="true" size={22} /></button>
        </div>

        <div className="dl-mobile-menu-intro"><span><Sparkles aria-hidden="true" size={14} /> Menu utama</span><p>Temukan langkah yang paling relevan untuk usahamu sekarang.</p></div>
        <nav aria-label="Navigasi landing page mobile" className="dl-mobile-menu-links">
          {navItems.map(([label, href], index) => (
            <Link className={activeHref === href ? "is-active" : undefined} href={href} key={href} onClick={() => setIsOpen(false)}>
              <span>0{index + 1}</span><strong>{label}</strong><ArrowRight aria-hidden="true" size={18} />
            </Link>
          ))}
        </nav>
        <div className="dl-mobile-menu-footer">
          <Link className="dl-mobile-menu-login" href="/masuk" onClick={() => setIsOpen(false)}>Masuk ke Ruang Tumbuh</Link>
          <Link className="dl-mobile-menu-checkup" href={checkupHref} onClick={() => setIsOpen(false)}>Mulai Cek Gratis <ArrowRight aria-hidden="true" size={17} /></Link>
          <small>Gratis • 5–7 menit • Hasil langsung</small>
        </div>
      </aside>
    </>
  );
}
