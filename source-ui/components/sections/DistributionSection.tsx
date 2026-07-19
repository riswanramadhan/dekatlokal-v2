"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { umkmPortfolio } from "@/components/website-umkm/data";

const MARKERS = [
  {
    id: "makassar",
    label: "KOTA MAKASSAR",
    count: "20 UMKM",
    desc: "Pusat aktivitas UMKM dan digitalisasi terbesar di Sulawesi Selatan dengan pertumbuhan bisnis yang sangat aktif.",
    color: "#0255F5",
    x: 8.5,
    y: 82.5,
  },
  {
    id: "takalar",
    label: "KABUPATEN TAKALAR",
    count: "1 UMKM",
    desc: "Memiliki peluang besar di sektor perikanan dan kuliner lokal untuk masuk pasar digital.",
    color: "#0255F5",
    x: 8.5,
    y: 86.5,
  },
  {
    id: "pinrang",
    label: "KABUPATEN PINRANG",
    count: "2 UMKM",
    desc: "Didominasi sektor pertanian dan perdagangan lokal yang mulai membutuhkan akses digital lebih luas.",
    color: "#0255F5",
    x: 15,
    y: 40.25,
  },
  {
    id: "parepare",
    label: "KOTA PAREPARE",
    count: "3 UMKM",
    desc: "Kota perdagangan dan jasa yang mulai menunjukkan kebutuhan digitalisasi untuk memperluas pasar lokal.",
    color: "#0255F5",
    x: 15,
    y: 48.25,
  },
  {
    id: "barru",
    label: "KABUPATEN BARRU",
    count: "2 UMKM",
    desc: "Wilayah strategis jalur perdagangan dengan potensi pengembangan UMKM berbasis digital.",
    color: "#0255F5",
    x: 15,
    y: 68.25,
  },
  {
    id: "gowa",
    label: "KABUPATEN GOWA",
    count: "5 UMKM",
    desc: "Wilayah penyangga Makassar dengan pertumbuhan UMKM yang cepat dan adaptif terhadap teknologi.",
    color: "#0255F5",
    x: 17.75,
    y: 84.5,
  },
  {
    id: "maros",
    label: "KABUPATEN MAROS",
    count: "3 UMKM",
    desc: "Memiliki potensi besar di sektor kuliner, wisata, dan produk lokal yang siap masuk ekosistem digital.",
    color: "#0255F5",
    x: 21,
    y: 76.25,
  },
  {
    id: "enrekang",
    label: "KABUPATEN ENREKANG",
    count: "1 UMKM",
    desc: "Daerah dengan potensi produk lokal unggulan yang mulai diarahkan menuju transformasi digital.",
    color: "#0255F5",
    x: 24,
    y: 36.25,
  },
  {
    id: "sidrap",
    label: "KABUPATEN SIDRAP",
    count: "1 UMKM",
    desc: "UMKM lokal mulai tumbuh dengan peluang digitalisasi di sektor perdagangan dan produk daerah.",
    color: "#0255F5",
    x: 27.25,
    y: 44.25,
  },
  {
    id: "soppeng",
    label: "KABUPATEN SOPPENG",
    count: "2 UMKM",
    desc: "UMKM lokal mulai berkembang dengan peluang digitalisasi di sektor produk rumahan dan kuliner.",
    color: "#0255F5",
    x: 27.25,
    y: 64.5,
  },
  {
    id: "palopo",
    label: "KOTA PALOPO",
    count: "2 UMKM",
    desc: "Pusat ekonomi di wilayah Luwu Raya dengan potensi UMKM berkembang melalui transformasi digital.",
    color: "#0255F5",
    x: 36.5,
    y: 26.25,
  },
  {
    id: "wajo",
    label: "KABUPATEN WAJO",
    count: "2 UMKM",
    desc: "Dikenal dengan sektor perdagangan dan industri lokal yang memiliki peluang ekspansi melalui digitalisasi.",
    color: "#0255F5",
    x: 36.5,
    y: 64.5,
  },
  {
    id: "bulukumba",
    label: "KABUPATEN BULUKUMBA",
    count: "2 UMKM",
    desc: "Memiliki potensi UMKM kerajinan, kuliner, dan wisata yang dapat diperkuat melalui digitalisasi.",
    color: "#0255F5",
    x: 36.5,
    y: 88.25,
  },
  {
    id: "bone",
    label: "KABUPATEN BONE",
    count: "2 UMKM",
    desc: "Salah satu daerah dengan aktivitas usaha lokal yang kuat dan peluang digitalisasi yang terus berkembang.",
    color: "#0255F5",
    x: 39.75,
    y: 70.5,
  },
  {
    id: "sinjai",
    label: "KABUPATEN SINJAI",
    count: "1 UMKM",
    desc: "Tahap awal pengembangan digitalisasi dengan potensi UMKM lokal yang terus bertumbuh.",
    color: "#0255F5",
    x: 39.75,
    y: 80.25,
  },
];

const WEBSITE_COUNT_BY_REGION = umkmPortfolio
  .filter((business) => business.type === "UMKM")
  .reduce<Record<string, number>>((counts, business) => {
    business.regions.forEach((region) => {
      counts[region] = (counts[region] ?? 0) + 1;
    });
    return counts;
  }, {});

function WebsiteDigitalizationPills({ regionId }: { regionId: string }) {
  const websiteCount = WEBSITE_COUNT_BY_REGION[regionId] ?? 0;

  return (
    <div className="mt-3 flex flex-col gap-2">
      <span className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white px-3.5 py-2.5 text-[0.68rem] font-semibold leading-4 text-neutral-700 shadow-[0_8px_24px_rgba(1,34,98,0.07)] lg:text-xs">
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
          <path d="M4 5.5h16v11H4v-11Z" stroke="#0255F5" strokeWidth="1.8" />
          <path d="M8 20h8M12 16.5V20" stroke="#0255F5" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        {websiteCount > 0
          ? `${websiteCount} UMKM sudah terdigitalisasi lewat website`
          : "Jadilah UMKM pertama dari daerah ini"}
      </span>
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3.5 py-2.5 text-[0.68rem] font-semibold leading-4 text-emerald-800 lg:text-xs">
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-40 motion-reduce:animate-none" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
        </span>
        Slot website gratis masih tersedia
      </span>
    </div>
  );
}

const DISTRIBUTION_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Sebaran Program Digitalisasi UMKM DekatLokal di Sulawesi Selatan",
  itemListElement: MARKERS.map((marker, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Place",
      name: marker.label,
      description: `${marker.count}. ${marker.desc}`,
    },
  })),
}).replace(/</g, "\\u003c");

const CARD_STYLE_BY_BREAKPOINT = {
  md: {
    top: "2%",
    left: "0%",
    width: "18rem",
  },
  lg: {
    top: "56%",
    left: "0%",
    width: "28rem",
  },
} as const;

function useBreakpoint(): "mobile" | "md" | "lg" {
  const [bp, setBp] = useState<"mobile" | "md" | "lg">("md");

  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1024) setBp("lg");
      else if (window.innerWidth >= 768) setBp("md");
      else setBp("mobile");
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return bp;
}

export default function DistributionSection() {
  const [activeId, setActiveId] = useState<string | null>("makassar");
  const [mobilePopupOpen, setMobilePopupOpen] = useState(false);
  const [isLineReady, setIsLineReady] = useState(false);
  const activeIdRef = useRef<string | null>("makassar");

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const markerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  // Single card ref (only one card shown at a time)
  const cardRef = useRef<HTMLDivElement | null>(null);

  const activeMarker = MARKERS.find((m) => m.id === activeId) ?? null;

  const bp = useBreakpoint();

  const clearLine = useCallback(() => {
    const svg = svgRef.current;
    if (svg) svg.innerHTML = "";
    setIsLineReady(false);
  }, []);

  const drawLine = useCallback((selectedId?: string | null) => {
    const svg = svgRef.current;
    const container = containerRef.current;
    const currentId = selectedId === undefined ? activeIdRef.current : selectedId;

    if (!svg || !container || !currentId || window.innerWidth < 768) {
      clearLine();
      return;
    }

    const marker = MARKERS.find((m) => m.id === currentId);
    if (!marker) {
      clearLine();
      return;
    }

    const markerEl = markerRefs.current[currentId];
    const cardEl = cardRef.current;
    if (!markerEl || !cardEl) {
      clearLine();
      return;
    }

    const cRect = container.getBoundingClientRect();
    const mRect = markerEl.getBoundingClientRect();
    const cardRect = cardEl.getBoundingClientRect();

    if (!cRect.width || !cRect.height || !mRect.width || !mRect.height || !cardRect.width || !cardRect.height) {
      clearLine();
      return;
    }

    const x1 = mRect.left - cRect.left + mRect.width / 2;
    const y1 = mRect.top - cRect.top + mRect.height / 2;
    // Always connect to the right edge of the card (card is on the left)
    const x2 = cardRect.right - cRect.left;
    const y2 = cardRect.top - cRect.top + cardRect.height / 2;

    if (![x1, y1, x2, y2].every(Number.isFinite)) {
      clearLine();
      return;
    }

    const markerId = `dot-${marker.color.replace("#", "")}`;

    svg.innerHTML = `
      <defs>
        <marker id="${markerId}" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <circle cx="3" cy="3" r="2.5" fill="${marker.color}" />
        </marker>
      </defs>
      <line
        x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
        stroke="${marker.color}" stroke-width="1.5" stroke-dasharray="5 3"
        marker-end="url(#${markerId})" opacity="0.85"
      />
    `;
    setIsLineReady(true);
  }, [clearLine]);

  const scheduleDrawLine = useCallback((selectedId?: string | null) => {
    window.requestAnimationFrame(() => {
      drawLine(selectedId);
      window.requestAnimationFrame(() => drawLine(selectedId));
    });
  }, [drawLine]);

  const handleMarkerClick = (id: string) => {
    activeIdRef.current = id;
    setActiveId(id);

    if (window.innerWidth < 768) {
      clearLine();
      setMobilePopupOpen(true);
      return;
    }

    scheduleDrawLine(id);
  };

  const closeMobilePopup = useCallback(() => {
    const closingId = activeIdRef.current;
    setMobilePopupOpen(false);
    activeIdRef.current = null;
    setActiveId(null);
    clearLine();

    window.requestAnimationFrame(() => {
      if (closingId) markerRefs.current[closingId]?.focus();
    });
  }, [clearLine]);

  useEffect(() => {
    if (!mobilePopupOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobilePopup();
    };

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mobilePopupOpen, closeMobilePopup]);

  useEffect(() => {
    if (!mobilePopupOpen) return;

    const handleResize = () => {
      if (window.innerWidth < 768) return;
      setMobilePopupOpen(false);
      scheduleDrawLine();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobilePopupOpen, scheduleDrawLine]);

  useLayoutEffect(() => {
    scheduleDrawLine();
    const handleResize = () => scheduleDrawLine();
    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => scheduleDrawLine()) : null;

    if (resizeObserver) {
      if (containerRef.current) resizeObserver.observe(containerRef.current);
      if (cardRef.current) resizeObserver.observe(cardRef.current);
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver?.disconnect();
    };
  }, [activeId, bp, scheduleDrawLine]);

  return (
    <section className="mb-12 md:mb-24 lg:mb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: DISTRIBUTION_JSON_LD }}
      />
      {/* Teks kiri */}
      <motion.div
        className="text-center mb-8 md:mb-16 lg:absolute lg:text-left text-block-lg-clamp"
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <p className="text-primary font-medium text-sm md:text-lg mb-4 md:mb-6">
          SEBARAN WILAYAH UMKM
        </p>
        <h2 className="text-foreground font-bold text-3xl md:text-4xl lg:text-[2.75rem] mb-3 md:mb-4">
          Sebaran Program Digitalisasi UMKM di Sulawesi Selatan
        </h2>
        <p className="text-foreground text-sm md:text-lg mb-3 md:mb-4">
          DekatLokal memulai program digitalisasi UMKM dari Sulawesi Selatan
          dengan pendekatan berbasis kesiapan dan kebutuhan di tiap daerah.
        </p>
        <p className="text-[#999999] text-sm md:text-lg italic">
          Sebaran ini bersifat dinamis dan dapat bertambah seiring kesiapan
          UMKM di setiap daerah.
        </p>
      </motion.div>

      {/* Map container */}
      <motion.div
        ref={containerRef}
        className="map-container relative w-full h-104 md:w-172 md:h-132 lg:w-full lg:h-138 mx-auto lg:mr-0"
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
      >
        {/* SVG connector */}
        <svg
          ref={svgRef}
          className={`pointer-events-none absolute inset-0 h-full w-full overflow-visible transition-opacity duration-200 ${isLineReady ? "opacity-100" : "opacity-0"}`}
          style={{ zIndex: 5 }}
        />

        {/* Info card: desktop only, fixed position */}
        {activeMarker && bp !== "mobile" && (
            <motion.div
              initial={{ opacity: 0, x: -10, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="absolute z-20 hidden md:block"
              style={CARD_STYLE_BY_BREAKPOINT[bp]}
            >
              <motion.div
                key={activeMarker.id}
                ref={(el: HTMLDivElement | null) => {
                  cardRef.current = el;
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="distribution-info-card relative overflow-hidden rounded-xl px-6 py-4 text-white"
                style={{
                  backgroundColor: activeMarker.color,
                  transformPerspective: 900,
                  transformOrigin: "left center",
                }}
              >
                <p className="relative z-10 mb-3 font-extrabold text-white md:text-base lg:text-lg">{activeMarker.label}</p>
                <p className="relative z-10 mb-2 font-semibold text-white md:text-xl lg:text-3xl">{activeMarker.count}</p>
                <p className="relative z-10 text-white md:text-base lg:text-base opacity-90">{activeMarker.desc}</p>
              </motion.div>
              <WebsiteDigitalizationPills regionId={activeMarker.id} />
            </motion.div>
        )}

        <div
          className={`
            absolute
            w-64 md:w-86 lg:w-88
            left-1/2 -translate-x-1/2
            md:left-auto md:translate-x-0 md:right-0
          `}
          style={{ aspectRatio: "710 / 1103" }}
        >
          <Image
            src="/image/maps/distribution.png"
            alt="Peta sebaran program digitalisasi UMKM DekatLokal di Sulawesi Selatan"
            width={710}
            height={1103}
            className="absolute inset-0 w-full h-full object-contain"
            onLoad={() => scheduleDrawLine()}
          />

          {MARKERS.map((m) => (
            <button
              type="button"
              key={m.id}
              ref={(el) => { markerRefs.current[m.id] = el; }}
              onClick={() => handleMarkerClick(m.id)}
              onDoubleClick={(event) => event.preventDefault()}
              className="map-marker absolute z-10 -translate-x-1/2 -translate-y-1/2 group rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              style={{ left: `${m.x}%`, top: `${m.y}%` }}
              aria-label={`${m.label}, ${m.count}`}
              aria-pressed={activeId === m.id}
            >
              {/* ① Idle halo */}
              <span
                className="absolute left-1/2 top-1/2 rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none"
                style={{
                  width: activeId === m.id ? "26px" : "20px",
                  height: activeId === m.id ? "26px" : "20px",
                  background: m.color,
                  opacity: activeId === m.id ? 0.2 : 0.12,
                }}
              />

              {/* ② Idle ping: lambat dan transparan untuk semua marker */}
              <span
                className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                style={{
                  background: m.color,
                  opacity: 0.25,
                  animation: "ping-idle 2s cubic-bezier(0, 0, 0.2, 1) infinite",
                }}
              />

              {/* ③ Active ping: lebih cepat dan solid untuk marker aktif */}
              {activeId === m.id && (
                <span
                  className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                  style={{
                    background: m.color,
                    opacity: 0.6,
                    animation: "ping-active 1s cubic-bezier(0, 0, 0.2, 1) infinite",
                  }}
                />
              )}

              {/* ④ Active: white ring */}
              {activeId === m.id && (
                <span
                  className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white pointer-events-none"
                />
              )}

              {/* ⑤ Dot utama */}
              <span
                className={`relative flex items-center justify-center rounded-full shadow transition-all duration-200 group-hover:scale-125 ${
                  activeId === m.id ? "w-2.25 h-2.25 md:w-3 md:h-3 scale-125" : "w-2.25 h-2.25 md:w-3 md:h-3"
                }`}
                style={{ background: m.color }}
              />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Modal informasi wilayah: mobile only */}
      <AnimatePresence>
        {mobilePopupOpen && activeMarker && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-primary-900/35 px-5 backdrop-blur-md md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            onClick={closeMobilePopup}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-region-title"
              className="relative w-full max-w-sm"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.94 }}
              transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="distribution-info-card relative overflow-hidden rounded-3xl bg-primary px-6 py-7 text-white shadow-[0_28px_80px_rgba(0,17,49,0.38)]">
                <button
                  type="button"
                  autoFocus
                  onClick={closeMobilePopup}
                  className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/14 text-white backdrop-blur-md transition-all hover:bg-white/24 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label="Tutup informasi wilayah"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                    <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                </button>

                <p className="relative z-10 mb-3 pr-12 text-xs font-semibold uppercase tracking-[0.14em] text-primary-100">
                  Sebaran Wilayah UMKM
                </p>
                <h3 id="mobile-region-title" className="relative z-10 mb-5 pr-12 text-xl font-extrabold text-white">
                  {activeMarker.label}
                </h3>
                <p className="relative z-10 mb-3 text-4xl font-bold text-white">
                  {activeMarker.count}
                </p>
                <p className="relative z-10 text-sm leading-7 text-white/90">
                  {activeMarker.desc}
                </p>
              </div>
              <WebsiteDigitalizationPills regionId={activeMarker.id} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
