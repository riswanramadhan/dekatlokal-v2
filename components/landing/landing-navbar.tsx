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
  const dialog = useRef<HTMLDialogElement>(null);
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
    const previous = document.body.style.overflow;
    if (isOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [isOpen]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (media.matches) dialog.current?.close(); };
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, []);

  const close = () => dialog.current?.close();

  return (
    <>
      <header className={`dl-navbar${isScrolled ? " is-scrolled" : ""}`} data-scrolled={String(isScrolled)}>
        <Link aria-label="Ke beranda DekatLokal" className="dl-navbar-logo" href="#beranda">
          <Image alt="DekatLokal" height={44} priority src="/brand/dekat-lokal.png" unoptimized width={143} />
        </Link>
        <nav aria-label="Navigasi landing page" className="dl-navbar-links">
          {navItems.map(([label, href]) => <Link aria-current={activeHref === href ? "location" : undefined} className={activeHref === href ? "is-active" : undefined} href={href} key={href}>{label}</Link>)}
        </nav>
        <div className="dl-navbar-actions">
          <Link className="dl-navbar-login" href="/masuk">Masuk</Link>
          <Link className="dl-navbar-checkup" href={checkupHref}>Mulai Cek <ArrowRight aria-hidden="true" size={16} /></Link>
        </div>
        <button aria-controls="landing-mobile-menu" aria-expanded={isOpen} aria-label="Buka menu utama" className="dl-navbar-menu-button" ref={trigger} onClick={() => { dialog.current?.showModal(); setIsOpen(true); }} type="button">
          <Menu aria-hidden="true" size={22} />
        </button>
      </header>
      <dialog className="dl-nav-dialog" id="landing-mobile-menu" aria-label="DekatLokal" ref={dialog}
        onClose={() => { setIsOpen(false); trigger.current?.focus({ preventScroll: true }); }}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("a[href], button:not(:disabled)"));
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
        <div className="dl-nav-dialog-content">
          <header>
            <Link aria-label="Ke beranda DekatLokal" href="#beranda" onClick={close}><Image alt="DekatLokal" width={143} height={44} src="/brand/dekat-lokal.png" unoptimized /></Link>
            <button aria-label="Tutup menu utama" type="button" onClick={close} autoFocus><X aria-hidden="true" size={22} /></button>
          </header>
          <nav aria-label="Navigasi landing page mobile">
            {navItems.map(([label, href], index) => <Link href={href} key={href} onClick={close} aria-current={activeHref === href ? "location" : undefined} style={{ animationDelay: `${index * 35}ms` }}>{label}<ArrowRight aria-hidden="true" size={18} /></Link>)}
          </nav>
          <footer>
            <Link href="/masuk" onClick={close}>Masuk</Link>
            <Link href={checkupHref} onClick={close}>Mulai Cek Gratis <ArrowRight aria-hidden="true" size={18} /></Link>
            <p>Cuma 5–7 menit. Mulai dari usahamu.</p>
          </footer>
        </div>
      </dialog>
    </>
  );
}
