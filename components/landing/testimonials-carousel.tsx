"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, type PanInfo } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export type LandingStory = {
  id: string;
  business: string;
  category: string;
  summary: string;
  image: string;
  imageAlt: string;
  logo: string;
};

const AUTOPLAY_DELAY = 4500;
const EASE = [0.16, 1, 0.3, 1] as const;

export function TestimonialsCarousel({ stories }: { stories: LandingStory[] }) {
  const reduceMotion = useReducedMotion();
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [rawIndex, setIndex] = useState(0);
  const [visible, setVisible] = useState(3);
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  // Setelah pengguna menekan panah/titik, autoplay ditahan sebentar supaya tidak melompat sendiri.
  const holdUntil = useRef(0);
  const maxIndex = Math.max(0, stories.length - visible);
  // Saat jumlah kartu terlihat berubah (resize), indeks dijepit tanpa setState di effect.
  const index = Math.min(rawIndex, maxIndex);

  // Ukur lebar kartu + jarak supaya geseran selalu pas satu kartu.
  useEffect(() => {
    const measure = () => {
      const card = track.current?.firstElementChild as HTMLElement | null;
      const viewportWidth = viewport.current?.clientWidth ?? 0;
      if (!card || !viewportWidth) return;
      const gap = parseFloat(getComputedStyle(track.current as HTMLElement).columnGap || "20") || 20;
      const cardWidth = card.getBoundingClientRect().width;
      setStep(cardWidth + gap);
      setVisible(Math.max(1, Math.round((viewportWidth + gap) / (cardWidth + gap))));
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (viewport.current) observer.observe(viewport.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const controls = animate(x, -index * step, reduceMotion ? { duration: 0 } : { duration: 0.55, ease: EASE });
    return () => controls.stop();
  }, [index, step, x, reduceMotion]);

  const goTo = useCallback(
    (next: number) => {
      const target = next > maxIndex ? 0 : next < 0 ? maxIndex : next;
      holdUntil.current = Date.now() + 6000;
      setIndex(target);
      setAnnouncement(`Menampilkan cerita ${target + 1} sampai ${Math.min(target + visible, stories.length)} dari ${stories.length}`);
    },
    [maxIndex, stories.length, visible],
  );

  useEffect(() => {
    if (reduceMotion || paused || maxIndex === 0) return;
    const delay = Math.max(AUTOPLAY_DELAY, holdUntil.current - Date.now());
    const timer = window.setTimeout(() => setIndex((current) => (current >= maxIndex ? 0 : current + 1)), delay);
    return () => window.clearTimeout(timer);
  }, [index, maxIndex, paused, reduceMotion]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const swipe = info.offset.x;
    const velocity = info.velocity.x;
    if (swipe < -40 || velocity < -400) goTo(Math.min(index + 1, maxIndex));
    else if (swipe > 40 || velocity > 400) goTo(Math.max(index - 1, 0));
    else animate(x, -index * step, { duration: 0.4, ease: EASE });
  };

  if (!stories.length) return null;

  return (
    <div
      aria-label="Cerita perjalanan UMKM"
      aria-roledescription="carousel"
      className="dl-stories"
      data-testid="story-carousel"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
      onFocus={(event) => {
        // Jeda hanya untuk fokus keyboard; klik mouse tidak menahan autoplay selamanya.
        if ((event.target as HTMLElement).matches(":focus-visible")) setPaused(true);
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div aria-atomic="true" aria-live="polite" className="dl-stories-live">{announcement}</div>

      <div className="dl-stories-viewport" ref={viewport}>
        <motion.div
          className="dl-stories-track"
          drag={maxIndex > 0 ? "x" : false}
          dragConstraints={{ left: -maxIndex * step, right: 0 }}
          dragElastic={0.12}
          onDragEnd={onDragEnd}
          onDragStart={() => setPaused(true)}
          ref={track}
          style={{ x }}
        >
          {stories.map((story, storyIndex) => {
            const isVisible = storyIndex >= index && storyIndex < index + visible;
            return (
              <article aria-hidden={!isVisible} className="dl-story" key={story.id}>
                <div className="dl-story-media">
                  <Image
                    alt={story.imageAlt}
                    draggable={false}
                    fill
                    priority={storyIndex < 3}
                    sizes="(max-width: 699px) 92vw, (max-width: 1079px) 46vw, 380px"
                    src={story.image}
                    unoptimized
                  />
                  <span className="chip">{story.category}</span>
                </div>
                <div className="dl-story-body">
                  <p>{story.summary}</p>
                  <footer className="dl-story-foot">
                    <span className="dl-story-logo">
                      <Image alt={`Logo ${story.business}`} draggable={false} fill sizes="46px" src={story.logo} unoptimized />
                    </span>
                    <span>
                      <strong>{story.business}</strong>
                      <small>Perjalanan usaha lokal</small>
                    </span>
                  </footer>
                </div>
              </article>
            );
          })}
        </motion.div>
      </div>

      <div className="dl-stories-nav">
        <div aria-label="Pilih kelompok cerita" className="dl-stories-dots" role="group">
          {Array.from({ length: maxIndex + 1 }, (_, dot) => (
            <button
              aria-label={`Tampilkan kelompok cerita ${dot + 1}`}
              aria-pressed={dot === index}
              className={dot === index ? "is-active" : undefined}
              key={dot}
              onClick={() => goTo(dot)}
              type="button"
            />
          ))}
        </div>
        <div className="dl-stories-arrows">
          <button aria-label="Cerita sebelumnya" onClick={() => goTo(index - 1)} type="button">
            <ArrowLeft aria-hidden="true" size={19} />
          </button>
          <button aria-label="Cerita berikutnya" onClick={() => goTo(index + 1)} type="button">
            <ArrowRight aria-hidden="true" size={19} />
          </button>
        </div>
      </div>
    </div>
  );
}
