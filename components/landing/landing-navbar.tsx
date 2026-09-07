"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

const navItems = [["Beranda", "#beranda"], ["Cara Kerja", "#akses-belajar"], ["Cerita", "#pengalaman"], ["Kelas", "#course"], ["Harga", "#paket"], ["Tanya Jawab", "#faq"]] as const;

export function LandingNavbar({ checkupHref }: { checkupHref: string }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string>("#beranda");
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      setIsScrolled(window.scrollY > 24);
      let active: string = "#beranda";
      navItems.forEach(([, href]) => {
        if ((document.querySelector(href)?.getBoundingClientRect().top ?? Infinity) <= 160) active = href;
      });
      setActiveHref(active);
      frame = 0;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("a[href]")?.focus({ preventScroll: true });
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true }));
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (media.matches) setIsOpen(false); };
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, []);

  const close = () => {
    setIsOpen(false);
    requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true }));
  };

  return (
    <>
      {isOpen ? <button aria-label="Tutup menu utama" className="dl-nav-mobile-backdrop" onClick={close} type="button" /> : null}
      <header className={`dl-navbar${isScrolled ? " is-scrolled" : ""}${isOpen ? " is-menu-open" : ""}`} data-scrolled={String(isScrolled)}>
        <Link aria-label="Ke beranda DekatLokal" className="dl-navbar-logo" href="#beranda">
          <Image alt="DekatLokal" height={44} priority src="/brand/dekat-lokal.png" unoptimized width={143} />
        </Link>
        <nav aria-label="Navigasi landing page" className="dl-navbar-links">
          {navItems.map(([label, href]) => <Link aria-current={activeHref === href ? "location" : undefined} className={activeHref === href ? "is-active" : undefined} href={href} key={href}>{label}</Link>)}
        </nav>
        <div className="dl-navbar-actions">
          <Link className="dl-navbar-login" href="/masuk">Masuk</Link>
          <Link className="dl-navbar-checkup" href={checkupHref}>Mulai Checkup <ArrowRight aria-hidden="true" size={16} /></Link>
        </div>
        <button
          aria-controls="landing-mobile-menu"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Tutup menu utama" : "Buka menu utama"}
          className="dl-navbar-menu-button"
          ref={trigger}
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          {isOpen ? <X aria-hidden="true" size={22} /> : <Menu aria-hidden="true" size={22} />}
        </button>

        <div
          aria-hidden={!isOpen}
          aria-label="Menu utama DekatLokal"
          className="dl-nav-mobile-expand"
          id="landing-mobile-menu"
          onKeyDown={(event) => {
            if (!isOpen || event.key !== "Tab") return;
            const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("a[href]"));
            const first = controls[0];
            const last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              trigger.current?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              trigger.current?.focus();
            }
          }}
          ref={panel}
        >
          <nav aria-label="Navigasi landing page mobile">
            {navItems.map(([label, href], index) => (
              <Link
                aria-current={activeHref === href ? "location" : undefined}
                href={href}
                key={href}
                onClick={close}
                style={{ animationDelay: `${index * 28}ms` }}
                tabIndex={isOpen ? undefined : -1}
              >
                <span><small>0{index + 1}</small>{label}</span>
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
            ))}
          </nav>
          <footer>
            <Link href="/masuk" onClick={close} tabIndex={isOpen ? undefined : -1}>Masuk</Link>
            <Link href={checkupHref} onClick={close} tabIndex={isOpen ? undefined : -1}>Mulai Checkup Gratis <ArrowRight aria-hidden="true" size={18} /></Link>
            <p>Cuma 5–7 menit. Hasilnya langsung kelihatan.</p>
          </footer>
        </div>
      </header>
    </>
  );
}
