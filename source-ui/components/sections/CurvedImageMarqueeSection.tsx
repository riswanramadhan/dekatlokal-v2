"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";

const images = Array.from({ length: 10 }, (_, index) => {
  const number = index + 1;

  return {
    id: `galeri-umkm-${number}`,
    src: `/image/website-umkm/gallery/${number}.webp`,
    alt: `Dokumentasi kegiatan UMKM DekatLokal ${number}`,
    title: `Galeri UMKM ${number}`,
  };
});

const duplicatedImages = [...images, ...images];
const MARQUEE_DURATION = 40_000;

export interface CurvedImageMarqueeSectionProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function CurvedImageMarqueeSection({
  id = "galeri-website-umkm",
  eyebrow = "WEBSITE UMKM SULAWESI SELATAN",
  title = "Cerita UMKM Lokal yang Mulai Hadir Secara Digital",
  description = "Setiap website yang dibuat DekatLokal adalah langkah kecil untuk membantu UMKM Sulawesi Selatan tampil lebih profesional dan mudah ditemukan pelanggan.",
  ctaLabel = "Lihat Website UMKM",
  ctaHref = "/website-umkm",
}: CurvedImageMarqueeSectionProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!viewport || !track) return;

    const cards = Array.from(
      track.querySelectorAll<HTMLElement>(".curved-marquee-item"),
    );
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const startedAt = performance.now();
    let animationFrame = 0;
    let cardWidth = 0;
    let step = 0;
    let loopWidth = 0;
    let viewportCenter = 0;

    const updateMetrics = () => {
      const styles = window.getComputedStyle(viewport);
      cardWidth = Number.parseFloat(styles.getPropertyValue("--marquee-card-width"));
      const gap = Number.parseFloat(styles.getPropertyValue("--marquee-gap"));
      step = cardWidth + gap;
      loopWidth = step * images.length;
      viewportCenter = viewport.clientWidth / 2;
    };

    const renderFrame = (now: number) => {
      const progress = reduceMotion
        ? 0
        : ((now - startedAt) % MARQUEE_DURATION) / MARQUEE_DURATION;
      const offset = progress * loopWidth;

      track.style.transform = `translate3d(${-offset}px, 0, 0)`;

      cards.forEach((card, index) => {
        const cardCenter = index * step + cardWidth / 2 - offset;
        const rawPosition = (cardCenter - viewportCenter) / (viewportCenter + step * 0.35);
        const position = Math.max(-1, Math.min(1, rawPosition));
        const distanceFromCenter = Math.min(1, Math.abs(position));
        const curve = Math.pow(distanceFromCenter, 1.35);
        const scale = 0.89 + curve * 0.16;
        const translateY = 17 - curve * 14;
        const translateZ = -115 + curve * 145;
        const rotateY = position * -17;

        card.style.transform = `translate3d(0, ${translateY}px, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
      });

      if (!reduceMotion) {
        animationFrame = window.requestAnimationFrame(renderFrame);
      }
    };

    const resizeObserver = new ResizeObserver(updateMetrics);
    updateMetrics();
    resizeObserver.observe(viewport);
    renderFrame(startedAt);

    return () => {
      resizeObserver.disconnect();
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <section
      id={id}
      className="curved-marquee-section relative mb-16 overflow-hidden md:mb-24 lg:mb-32"
      aria-labelledby="gallery-heading"
    >
      <motion.div
        className="mx-auto mb-8 max-w-4xl text-center md:mb-10 lg:mb-12"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <p className="mb-4 text-sm font-semibold tracking-[0.14em] text-primary md:mb-6 md:text-base">
          {eyebrow}
        </p>
        <h2
          id="gallery-heading"
          className="mb-4 text-3xl font-bold leading-tight text-foreground md:text-4xl lg:text-[2.75rem]"
        >
          {title}
        </h2>
        <p className="mx-auto max-w-3xl text-sm leading-relaxed text-neutral-600 md:text-lg">
          {description}
        </p>
      </motion.div>

      <motion.div
        ref={viewportRef}
        className="curved-marquee-viewport relative z-10"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.12 }}
        role="region"
        aria-label="Galeri website UMKM dengan carousel perspektif bergerak otomatis"
      >
        <div ref={trackRef} className="curved-marquee-track">
          {duplicatedImages.map((image, index) => {
            const isDuplicate = index >= images.length;

            return (
              <figure
                key={`${image.id}-${index}`}
                className="curved-marquee-item"
                aria-hidden={isDuplicate}
              >
                <div className="curved-marquee-card">
                  <Image
                    src={image.src}
                    alt={isDuplicate ? "" : image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 124px, (max-width: 1024px) 164px, 190px"
                  />
                  <figcaption className="sr-only">{image.title}</figcaption>
                </div>
              </figure>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        className="relative z-20 mt-1 flex justify-center md:mt-3"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.16 }}
      >
        <Link
          href={ctaHref}
          className="portfolio-outline-cta group inline-flex items-center gap-3 rounded-full border border-primary bg-white px-5 py-3 text-sm font-semibold text-primary shadow-[0_10px_28px_rgba(2,85,245,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:px-7 md:py-3.5 md:text-base"
        >
          <span>{ctaLabel}</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="cta-hover-icon h-5 w-5"
            aria-hidden="true"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </motion.div>
    </section>
  );
}
