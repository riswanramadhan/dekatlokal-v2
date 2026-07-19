"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const navItems = [
  ["Beranda", "#beranda"],
  ["Cara Kerja", "#akses-belajar"],
  ["Cerita UMKM", "#pengalaman"],
  ["Course", "#course"],
  ["Harga", "#paket"],
] as const;

export function LandingNavbar({ checkupHref }: { checkupHref: string }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState("beranda");

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 32);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  useEffect(() => {
    const sections = navItems
      .map(([, href]) => document.querySelector<HTMLElement>(href))
      .filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
        if (visible?.target.id) setActiveId(visible.target.id);
      },
      { rootMargin: "-28% 0px -58%", threshold: [0.01, 0.2, 0.5] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.body.classList.add("dl-menu-is-open");
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.classList.remove("dl-menu-is-open");
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <header
        className={`dl-navbar${isScrolled ? " is-scrolled" : ""}`}
        data-scrolled={isScrolled ? "true" : "false"}
      >
        <Link aria-label="Ke beranda DekatLokal" className="dl-navbar-logo" href="#beranda">
          <Image alt="DekatLokal" height={44} priority src="/brand/dekat-lokal.png" width={143} />
        </Link>

        <nav aria-label="Navigasi landing page" className="dl-navbar-links">
          {navItems.map(([label, href]) => (
            <Link
              aria-current={activeId === href.slice(1) ? "page" : undefined}
              className={activeId === href.slice(1) ? "is-active" : undefined}
              href={href}
              key={href}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="dl-navbar-actions">
          <Link className="dl-navbar-login" href="/masuk">Masuk</Link>
          <Link className="dl-navbar-checkup" href={checkupHref}>
            Mulai Checkup <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>

        <button
          aria-expanded={isOpen}
          aria-label={isOpen ? "Tutup menu utama" : "Buka menu utama"}
          aria-controls="landing-mobile-menu"
          className="dl-navbar-menu-button"
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          {isOpen ? <X aria-hidden="true" size={22} /> : <Menu aria-hidden="true" size={22} />}
        </button>
      </header>

      <button
        aria-hidden={!isOpen}
        aria-label="Tutup menu"
        className={`dl-mobile-overlay${isOpen ? " is-open" : ""}`}
        onClick={closeMenu}
        tabIndex={isOpen ? 0 : -1}
        type="button"
      />
      <nav
        aria-label="Navigasi landing page mobile"
        className={`dl-mobile-menu${isOpen ? " is-open" : ""}`}
        id="landing-mobile-menu"
      >
        <div className="dl-mobile-menu-head">
          <span>Jelajahi Ruang Tumbuh</span>
          <button aria-label="Tutup menu utama" onClick={closeMenu} type="button">
            <X aria-hidden="true" size={22} />
          </button>
        </div>
        {navItems.map(([label, href], index) => (
          <Link href={href} key={href} onClick={closeMenu}>
            <span>0{index + 1}</span>{label}<ArrowRight aria-hidden="true" size={18} />
          </Link>
        ))}
        <Link className="dl-mobile-menu-login" href="/masuk" onClick={closeMenu}>Masuk ke Ruang Tumbuh</Link>
        <Link className="dl-mobile-menu-checkup" href={checkupHref} onClick={closeMenu}>Mulai Digital Checkup</Link>
      </nav>
    </>
  );
}
