"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

/*
 * Navbar Digital Checkup. Gaya visual & perilakunya mengikuti dekatlokal.com
 * (pil kaca ringkas di atas yang melebar saat di-scroll, panel ponsel bertingkat),
 * tetapi menu dan brandingnya milik Digital Checkup sendiri.
 */

type NavItem = { label: string; href: string; section?: string };

const NAV_ITEMS: NavItem[] = [
  { label: "Cara Kerja", href: "/#akses-belajar", section: "akses-belajar" },
  { label: "Modul", href: "/#course", section: "course" },
  { label: "Harga", href: "/#paket", section: "paket" },
  { label: "Template Website", href: "/templates" },
];

const MOBILE_EXTRA: NavItem[] = [
  { label: "Cerita UMKM", href: "/#pengalaman", section: "pengalaman" },
  { label: "Tanya Jawab", href: "/#faq", section: "faq" },
];

function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const ids = [...NAV_ITEMS, ...MOBILE_EXTRA].map((item) => item.section).filter((id): id is string => Boolean(id));
    let frame = 0;
    const update = () => {
      frame = 0;
      let current: string | null = null;
      for (const id of ids) {
        const top = document.getElementById(id)?.getBoundingClientRect().top;
        if (top !== undefined && top <= 180) current = id;
      }
      setActive(current);
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
    };
  }, [enabled]);
  return enabled ? active : null;
}

function Brand({ compact, onClick }: { compact: boolean; onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} className="flex flex-none items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" aria-label="Digital Checkup DekatLokal, beranda">
      <Image src="/brand/dekat-lokal.png" alt="" width={528} height={163} priority className={`h-auto transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${compact ? "w-28" : "w-32 lg:w-36"}`} />
      <span className="hidden h-5 w-px bg-neutral-200 sm:block" aria-hidden="true" />
      <span className="hidden whitespace-nowrap text-[0.8rem] font-semibold tracking-[-0.01em] text-primary sm:block">Digital Checkup</span>
    </Link>
  );
}

export default function EcosystemNavbar() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const activeSection = useActiveSection(onHome);

  useEffect(() => {
    let frame = 0;
    const update = () => { frame = 0; setHasScrolled(window.scrollY > 12); };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") closeMobileMenu(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeMobileMenu]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const root = document.documentElement;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    root.dataset.mobileMenu = "open";
    return () => {
      document.body.style.overflow = previous;
      delete root.dataset.mobileMenu;
    };
  }, [isMobileMenuOpen]);

  const isActive = (item: NavItem) => (item.section ? onHome && activeSection === item.section : pathname === item.href || pathname.startsWith(`${item.href}/`));
  const linkClass = (active: boolean) =>
    `inline-flex min-h-10 items-center whitespace-nowrap rounded-full px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 lg:px-3.5 ${
      active ? "bg-primary-50 text-primary" : "text-neutral-800 hover:bg-neutral-50 hover:text-primary"
    }`;
  const signInActive = pathname.startsWith("/masuk") || pathname.startsWith("/dashboard");

  return (
    <header className="relative w-full">
      <nav
        className={`relative mx-auto hidden w-full items-center justify-between rounded-full border border-white/80 bg-white/90 shadow-[0_12px_40px_rgba(1,34,98,0.1)] backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:flex ${
          hasScrolled ? "min-h-16 max-w-7xl px-4 md:px-5 lg:px-6" : "min-h-14 max-w-[56rem] gap-2 px-3 md:px-4 lg:max-w-[60rem] lg:px-4"
        }`}
        aria-label="Navigasi Digital Checkup"
      >
        <Brand compact={!hasScrolled} />
        <div className="flex items-center gap-0.5 lg:gap-1">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass(isActive(item))} aria-current={isActive(item) ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Link href="/masuk" className={linkClass(signInActive)}>Masuk</Link>
          <Link
            href="/mulai"
            className={`button-link inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-full bg-primary py-2.5 text-sm font-bold text-white transition-[padding] duration-500 ${hasScrolled ? "px-4 lg:px-5" : "px-3.5 lg:px-4"}`}
          >
            Mulai Checkup
          </Link>
        </div>
      </nav>

      <nav className="relative w-full overflow-hidden rounded-[2rem] border border-white/80 bg-white/92 shadow-[0_12px_36px_rgba(1,34,98,0.1)] backdrop-blur-xl md:hidden" aria-label="Navigasi Digital Checkup (ponsel)">
        <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6">
          <Brand compact onClick={closeMobileMenu} />
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-neutral-900 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-expanded={isMobileMenuOpen}
            aria-controls="checkup-mobile-menu"
            aria-label={isMobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
          >
            <span className="relative block h-5 w-6" aria-hidden="true">
              <span className={`absolute left-0 top-0.5 h-0.5 w-6 bg-current transition-transform duration-200 ${isMobileMenuOpen ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`absolute left-0 top-2.5 h-0.5 w-6 bg-current transition-opacity duration-200 ${isMobileMenuOpen ? "opacity-0" : "opacity-100"}`} />
              <span className={`absolute left-0 top-[1.125rem] h-0.5 w-6 bg-current transition-transform duration-200 ${isMobileMenuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
            </span>
          </button>
        </div>

        <div id="checkup-mobile-menu" className={`grid transition-[grid-template-rows] duration-300 ease-out ${isMobileMenuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`} aria-hidden={!isMobileMenuOpen}>
          <div className="min-h-0 overflow-hidden">
            <div className="max-h-[calc(100dvh-6.5rem)] overflow-y-auto border-t border-neutral-200 px-3 pb-4 pt-3 sm:px-5">
              {[...NAV_ITEMS, ...MOBILE_EXTRA].map((item) => (
                <Link key={item.href} href={item.href} tabIndex={isMobileMenuOpen ? undefined : -1} onClick={closeMobileMenu} className={`${linkClass(isActive(item))} mt-1 w-full`}>
                  {item.label}
                </Link>
              ))}
              <div className="mt-3 grid gap-2 border-t border-neutral-200 pt-3">
                <Link href="/mulai" tabIndex={isMobileMenuOpen ? undefined : -1} onClick={closeMobileMenu} className="button-link flex min-h-12 w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-center text-base font-bold text-white">
                  Mulai Checkup Gratis
                </Link>
                <Link href="/masuk" tabIndex={isMobileMenuOpen ? undefined : -1} onClick={closeMobileMenu} className="flex min-h-12 w-full items-center justify-center rounded-full border border-primary-100 bg-white px-5 py-3 text-center text-base font-semibold text-primary">
                  Masuk ke ruang belajar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <button
        type="button"
        className={`fixed inset-0 -z-10 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={closeMobileMenu}
        aria-label="Tutup menu navigasi"
        tabIndex={-1}
      />
    </header>
  );
}
