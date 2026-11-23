"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Menu, X } from "lucide-react";

export const navItems = [
  ["Beranda", "#beranda"],
  ["Cara Kerja", "#akses-belajar"],
  ["Cerita", "#pengalaman"],
  ["Modul", "#course"],
  ["Harga", "#paket"],
  ["Tanya Jawab", "#faq"],
] as const;

const FOCUSABLE = "a[href], button:not([disabled])";

export function LandingNavbar({ checkupHref }: { checkupHref: string }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string>("#beranda");
  const reduceMotion = useReducedMotion();
  const dialog = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      setIsScrolled(window.scrollY > 24);
      let active: string = "#beranda";
      navItems.forEach(([, href]) => {
        const top = document.querySelector(href)?.getBoundingClientRect().top ?? Infinity;
        if (top <= 180) active = href;
      });
      setActiveHref(active);
      frame = 0;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true }));
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFirst = () => dialog.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus({ preventScroll: true });
    const raf = requestAnimationFrame(focusFirst);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, close]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (media.matches) setIsOpen(false);
    };
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, []);

  const trapFocus = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (!controls.length) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      <div className="dl-navbar-wrap">
        <header className={`dl-navbar${isScrolled ? " is-scrolled" : ""}${isOpen ? " is-menu-open" : ""}`} data-scrolled={String(isScrolled)}>
          <Link aria-label="Ke beranda DekatLokal" className="dl-navbar-logo" href="#beranda">
            <Image alt="DekatLokal" height={34} priority src="/brand/dekat-lokal.png" unoptimized width={110} />
          </Link>

          <nav aria-label="Navigasi landing page" className="dl-navbar-links">
            {navItems.map(([label, href]) => (
              <Link
                aria-current={activeHref === href ? "location" : undefined}
                className={activeHref === href ? "is-active" : undefined}
                href={href}
                key={href}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="dl-navbar-actions">
            <Link className="btn btn-ghost btn-sm" href="/masuk">Masuk</Link>
            <Link className="btn btn-primary btn-sm" href={checkupHref}>
              Mulai Checkup <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>

          <Link className="btn btn-primary btn-sm dl-navbar-mobile-cta" href={checkupHref}>Mulai</Link>
          <button
            aria-controls="landing-mobile-menu"
            aria-expanded={isOpen}
            aria-label={isOpen ? "Tutup menu utama" : "Buka menu utama"}
            className="dl-navbar-menu-button"
            onClick={() => setIsOpen((current) => !current)}
            ref={trigger}
            type="button"
          >
            {isOpen ? <X aria-hidden="true" size={22} /> : <Menu aria-hidden="true" size={22} />}
          </button>
        </header>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.button
              animate={{ opacity: 1 }}
              aria-label="Tutup menu utama"
              className="dl-navbar-backdrop"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="backdrop"
              onClick={close}
              tabIndex={-1}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              type="button"
            />
            <motion.div
              animate={{ opacity: 1, y: 0, scale: 1 }}
              aria-label="Menu utama DekatLokal"
              aria-modal="true"
              className="dl-navbar-menu"
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              id="landing-mobile-menu"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              key="menu"
              onKeyDown={trapFocus}
              ref={dialog}
              role="dialog"
              transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
            >
              <nav aria-label="Navigasi landing page mobile">
                {navItems.map(([label, href], index) => (
                  <Link
                    aria-current={activeHref === href ? "location" : undefined}
                    className={activeHref === href ? "is-active" : undefined}
                    href={href}
                    key={href}
                    onClick={close}
                  >
                    <span><small>0{index + 1}</small>{label}</span>
                    <ArrowRight aria-hidden="true" size={18} />
                  </Link>
                ))}
              </nav>
              <div className="dl-navbar-menu-foot">
                <Link className="btn btn-secondary" href="/masuk" onClick={close}>Masuk</Link>
                <Link className="btn btn-primary" href={checkupHref} onClick={close}>
                  Mulai Checkup Gratis <ArrowRight aria-hidden="true" size={18} />
                </Link>
                <p>Cuma 5–7 menit. Hasilnya langsung kelihatan.</p>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
