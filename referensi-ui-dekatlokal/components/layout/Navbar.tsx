"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
} from "react";
import { CommercialIcon } from "@/components/commercial/SharedCommercialSections";
import { siteRoutes } from "@/lib/site-config";

const serviceItems = [
  {
    label: "Digital Checkup",
    description: "Prioritas digital UMKM",
    href: siteRoutes.digitalCheckup,
    icon: "checkup" as const,
  },
  {
    label: "Website UMKM Cepat",
    description: "Web cepat siap tayang",
    href: siteRoutes.websiteUmkmService,
    icon: "website" as const,
  },
  {
    label: "Website Custom",
    description: "Web brand sesuai kebutuhan",
    href: siteRoutes.websiteCustomService,
    icon: "custom" as const,
  },
  {
    label: "Sistem Digital",
    description: "Alur kerja jadi sistem",
    href: siteRoutes.digitalSystemService,
    icon: "system" as const,
  },
] as const;

const primaryItems = [
  { label: "Beranda", href: siteRoutes.home },
  { label: "Portofolio", href: siteRoutes.websiteUmkm },
  { label: "Artikel", href: siteRoutes.articles },
] as const;

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-hover-motion h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <path d="m5.5 7.5 4.5 4.5 4.5-4.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
      aria-hidden="true"
    >
      <path d="M4 10h12M11.5 5.5 16 10l-4.5 4.5" />
    </svg>
  );
}

function routeIsActive(pathname: string, href: string) {
  if (href === siteRoutes.home) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [isDesktopServicesOpen, setIsDesktopServicesOpen] = useState(false);
  const desktopServicesRef = useRef<HTMLDivElement>(null);
  const desktopServicesLinkRef = useRef<HTMLButtonElement>(null);
  const desktopCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const servicesAreActive =
    pathname === siteRoutes.services ||
    serviceItems.some((item) => routeIsActive(pathname, item.href));

  useEffect(() => {
    let frame = 0;

    const updateScrolledState = () => {
      frame = 0;
      setHasScrolled(window.scrollY > 12);
    };

    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateScrolledState);
    };

    updateScrolledState();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
    setIsMobileServicesOpen(false);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      if (isMobileMenuOpen) {
        closeMobileMenu();
        return;
      }

      if (isDesktopServicesOpen) {
        setIsDesktopServicesOpen(false);
        desktopServicesLinkRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [closeMobileMenu, isDesktopServicesOpen, isMobileMenuOpen]);

  useEffect(() => {
    return () => {
      if (desktopCloseTimer.current) clearTimeout(desktopCloseTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  const openDesktopServices = () => {
    if (desktopCloseTimer.current) clearTimeout(desktopCloseTimer.current);
    setIsDesktopServicesOpen(true);
  };

  const scheduleDesktopClose = () => {
    if (desktopCloseTimer.current) clearTimeout(desktopCloseTimer.current);
    desktopCloseTimer.current = setTimeout(() => setIsDesktopServicesOpen(false), 140);
  };

  const handleDesktopBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!desktopServicesRef.current?.contains(event.relatedTarget as Node | null)) {
      scheduleDesktopClose();
    }
  };

  const navLinkClassName = (active: boolean) =>
    `inline-flex min-h-10 items-center rounded-full px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 lg:px-3.5 ${
      active
        ? "bg-primary-50 text-primary"
        : "text-neutral-800 hover:bg-neutral-50 hover:text-primary"
    }`;

  return (
    <header className="relative w-full">
      <nav
        className={`relative mx-auto hidden w-full items-center justify-between rounded-full border border-white/80 bg-white/90 shadow-[0_12px_40px_rgba(1,34,98,0.1)] backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:flex ${
          hasScrolled
            ? "min-h-16 max-w-7xl px-4 md:px-5 lg:px-6"
            : "min-h-14 max-w-[52rem] gap-2 px-3 md:px-4 lg:max-w-[56rem] lg:px-4"
        }`}
        aria-label="Navigasi utama"
      >
        <Link
          href={siteRoutes.home}
          className="flex-none rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="DekatLokal | Beranda"
        >
          <Image
            src="/image/brand/dekat-lokal.png"
            alt="DekatLokal"
            width={528}
            height={163}
            priority
            className={`h-auto transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              hasScrolled ? "w-36 lg:w-40" : "w-32 lg:w-[8.5rem]"
            }`}
          />
        </Link>

        <div className="flex items-center gap-0.5 lg:gap-1">
          <Link
            href={primaryItems[0].href}
            className={navLinkClassName(routeIsActive(pathname, primaryItems[0].href))}
          >
            {primaryItems[0].label}
          </Link>

          <div
            ref={desktopServicesRef}
            className="relative"
            onMouseEnter={openDesktopServices}
            onMouseLeave={scheduleDesktopClose}
            onFocusCapture={openDesktopServices}
            onBlurCapture={handleDesktopBlur}
          >
            <div
              className={`flex min-h-10 items-center rounded-full transition-colors ${
                servicesAreActive || isDesktopServicesOpen
                  ? "bg-primary-50 text-primary"
                  : "text-neutral-800 hover:bg-neutral-50 hover:text-primary"
              }`}
            >
              <button
                type="button"
                ref={desktopServicesLinkRef}
                className="inline-flex min-h-10 items-center rounded-l-full py-2 pl-3 pr-1 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary lg:pl-3.5"
                aria-current={pathname === siteRoutes.services ? "page" : undefined}
                aria-expanded={isDesktopServicesOpen}
                aria-controls="desktop-services-dropdown"
                onClick={() => {
                  if (desktopCloseTimer.current) clearTimeout(desktopCloseTimer.current);
                  setIsDesktopServicesOpen((open) => !open);
                }}
              >
                Layanan
              </button>
              <button
                type="button"
                className="inline-flex min-h-10 min-w-9 items-center justify-center rounded-r-full pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                aria-label="Tampilkan pilihan layanan"
                aria-expanded={isDesktopServicesOpen}
                aria-controls="desktop-services-dropdown"
                onClick={() => {
                  if (desktopCloseTimer.current) clearTimeout(desktopCloseTimer.current);
                  setIsDesktopServicesOpen((open) => !open);
                }}
              >
                <ChevronIcon open={isDesktopServicesOpen} />
              </button>
            </div>

            <div
              id="desktop-services-dropdown"
              className={`absolute left-1/2 top-full w-[min(18.5rem,calc(100vw-2rem))] -translate-x-1/2 pt-2.5 transition duration-200 ${
                isDesktopServicesOpen
                  ? "visible translate-y-0 opacity-100"
                  : "invisible -translate-y-2 opacity-0"
              }`}
              aria-hidden={!isDesktopServicesOpen}
            >
              <div className="grid gap-1 rounded-[1.15rem] border border-neutral-200 bg-white p-1.5 shadow-[0_16px_38px_rgba(1,34,98,0.13)]">
                {serviceItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    tabIndex={isDesktopServicesOpen ? undefined : -1}
                    onClick={() => setIsDesktopServicesOpen(false)}
                    className={`group flex items-center gap-2 rounded-[0.95rem] border p-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                      routeIsActive(pathname, item.href)
                        ? "border-primary-100 bg-primary-50"
                        : "border-transparent hover:border-neutral-200 hover:bg-neutral-50"
                    }`}
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl border text-primary transition-all group-hover:-translate-y-0.5 group-hover:rotate-[-4deg] ${
                        routeIsActive(pathname, item.href)
                          ? "border-primary-100 bg-white"
                          : "border-neutral-200 bg-neutral-50"
                      }`}
                    >
                      <CommercialIcon name={item.icon} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`flex items-center justify-between gap-2 text-[0.83rem] font-semibold ${routeIsActive(pathname, item.href) ? "text-primary" : "text-[#263e75]"}`}>
                        {item.label}
                        <ArrowIcon />
                      </span>
                      <span className="mt-0.5 block truncate text-[0.7rem] leading-4 text-neutral-600">
                        {item.description}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link
            href={primaryItems[1].href}
            className={navLinkClassName(routeIsActive(pathname, primaryItems[1].href))}
          >
            {primaryItems[1].label}
          </Link>

          <Link
            href={primaryItems[2].href}
            className={navLinkClassName(routeIsActive(pathname, primaryItems[2].href))}
          >
            {primaryItems[2].label}
          </Link>
        </div>

        <Link
          href={siteRoutes.websiteUmkmService}
          className={`button-link inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-full bg-primary py-2.5 text-sm font-bold text-white transition-[padding] duration-500 ${
            hasScrolled ? "px-4 lg:px-5" : "px-3.5 lg:px-4"
          }`}
        >
          Buat Website
        </Link>
      </nav>

      <nav
        className="relative w-full overflow-hidden rounded-[2rem] border border-white/80 bg-white/92 shadow-[0_12px_36px_rgba(1,34,98,0.1)] backdrop-blur-xl md:hidden"
        aria-label="Navigasi utama mobile"
      >
        <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href={siteRoutes.home}
            onClick={closeMobileMenu}
            className="flex-none rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="DekatLokal | Beranda"
          >
            <Image
              src="/image/brand/dekat-lokal.png"
              alt="DekatLokal"
              width={528}
              height={163}
              priority
              className="h-auto w-30"
            />
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-neutral-900 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation-menu"
            aria-label={isMobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
          >
            <span className="sr-only">Menu</span>
            <span className="relative block h-5 w-6" aria-hidden="true">
              <span
                className={`absolute left-0 top-0.5 h-0.5 w-6 bg-current transition-transform duration-200 ${
                  isMobileMenuOpen ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-2.5 h-0.5 w-6 bg-current transition-opacity duration-200 ${
                  isMobileMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 top-[1.125rem] h-0.5 w-6 bg-current transition-transform duration-200 ${
                  isMobileMenuOpen ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>

        <div
          id="mobile-navigation-menu"
          className={`grid transition-[grid-template-rows] duration-300 ease-out ${
            isMobileMenuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
          aria-hidden={!isMobileMenuOpen}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="max-h-[calc(100dvh-6.5rem)] overflow-y-auto border-t border-neutral-200 px-3 pb-4 pt-3 sm:px-5">
              <Link
                href={siteRoutes.home}
                tabIndex={isMobileMenuOpen ? undefined : -1}
                onClick={closeMobileMenu}
                className={navLinkClassName(pathname === siteRoutes.home) + " w-full"}
              >
                Beranda
              </Link>

              <div className="mt-1">
                <div
                  className={`flex items-center rounded-2xl ${
                    servicesAreActive ? "bg-primary-50 text-primary" : "text-neutral-800"
                  }`}
                >
                  <button
                    type="button"
                    tabIndex={isMobileMenuOpen ? undefined : -1}
                    onClick={() => setIsMobileServicesOpen((open) => !open)}
                    className="flex min-h-11 flex-1 items-center rounded-l-2xl px-3 text-left text-base font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                    aria-expanded={isMobileServicesOpen}
                    aria-controls="mobile-services-list"
                  >
                    Layanan
                  </button>
                  <button
                    type="button"
                    tabIndex={isMobileMenuOpen ? undefined : -1}
                    onClick={() => setIsMobileServicesOpen((open) => !open)}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-r-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                    aria-label="Tampilkan pilihan layanan"
                    aria-expanded={isMobileServicesOpen}
                    aria-controls="mobile-services-list"
                  >
                    <ChevronIcon open={isMobileServicesOpen} />
                  </button>
                </div>

                <div
                  id="mobile-services-list"
                  className={`grid transition-[grid-template-rows] duration-200 ${
                    isMobileServicesOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="ml-3 space-y-1 border-l border-primary-100 py-2 pl-3">
                      {serviceItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          tabIndex={isMobileMenuOpen && isMobileServicesOpen ? undefined : -1}
                          onClick={closeMobileMenu}
                          className={`group flex items-center gap-2.5 rounded-xl px-3 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                            routeIsActive(pathname, item.href)
                              ? "bg-primary-50 text-primary"
                              : "text-neutral-800 hover:bg-neutral-50"
                          }`}
                        >
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-neutral-200 bg-white text-primary">
                            <CommercialIcon name={item.icon} />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold">{item.label}</span>
                            <span className="mt-0.5 block truncate text-xs leading-5 text-neutral-600">
                              {item.description}
                            </span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href={siteRoutes.websiteUmkm}
                tabIndex={isMobileMenuOpen ? undefined : -1}
                onClick={closeMobileMenu}
                className={navLinkClassName(routeIsActive(pathname, siteRoutes.websiteUmkm)) + " mt-1 w-full"}
              >
                Portofolio
              </Link>

              <Link
                href={siteRoutes.articles}
                tabIndex={isMobileMenuOpen ? undefined : -1}
                onClick={closeMobileMenu}
                className={navLinkClassName(routeIsActive(pathname, siteRoutes.articles)) + " mt-1 w-full"}
              >
                Artikel
              </Link>

              <div className="mt-3 border-t border-neutral-200 pt-3">
                <Link
                  href={siteRoutes.websiteUmkmService}
                  tabIndex={isMobileMenuOpen ? undefined : -1}
                  onClick={closeMobileMenu}
                  className="button-link flex min-h-12 w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-center text-base font-bold text-white"
                >
                  Buat Website Sekarang
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <button
        type="button"
        className={`fixed inset-0 -z-10 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeMobileMenu}
        aria-label="Tutup menu navigasi"
        tabIndex={-1}
      />
    </header>
  );
}
