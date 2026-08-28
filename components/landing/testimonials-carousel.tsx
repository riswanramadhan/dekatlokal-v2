"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";

export type LandingStory = {
  id: string;
  business: string;
  category: string;
  summary: string;
  image: string;
  imageAlt: string;
  logo: string;
};

const AUTOPLAY_DELAY = 5000;

function getVisibleCount() {
  if (typeof window === "undefined") return 3;
  if (window.innerWidth < 700) return 1;
  if (window.innerWidth < 1080) return 2;
  return 3;
}

export function TestimonialsCarousel({ stories }: { stories: LandingStory[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const maxIndex = Math.max(0, stories.length - visibleCount);

  const goTo = useCallback((index: number) => {
    setActiveIndex(index > maxIndex ? 0 : index < 0 ? maxIndex : index);
  }, [maxIndex]);

  useEffect(() => {
    const updateLayout = () => {
      const nextVisibleCount = getVisibleCount();
      setVisibleCount(nextVisibleCount);
      setActiveIndex((current) => Math.min(current, Math.max(0, stories.length - nextVisibleCount)));
    };

    updateLayout();
    window.addEventListener("resize", updateLayout, { passive: true });
    return () => window.removeEventListener("resize", updateLayout);
  }, [stories.length]);

  useEffect(() => {
    if (isPaused || reduceMotion || maxIndex === 0) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current >= maxIndex ? 0 : current + 1));
    }, AUTOPLAY_DELAY);
    return () => window.clearInterval(timer);
  }, [isPaused, maxIndex, reduceMotion]);

  if (!stories.length) return null;

  return (
    <div
      aria-label="Cerita perjalanan UMKM"
      aria-roledescription="carousel"
      className="dl-story-carousel"
      data-reveal-item
      data-testid="story-carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div aria-live="polite" className="dl-story-live-region">
        Cerita {activeIndex + 1} sampai {Math.min(activeIndex + visibleCount, stories.length)} dari {stories.length}
      </div>

      <div className="dl-story-viewport">
        <div
          className="dl-story-track"
          style={{
            "--story-index": activeIndex,
            "--story-visible": visibleCount,
          } as CSSProperties}
        >
          {stories.map((story, storyIndex) => {
            const isVisible = storyIndex >= activeIndex && storyIndex < activeIndex + visibleCount;

            return (
              <article aria-hidden={!isVisible} className="dl-story-card" key={story.id}>
                <div className="dl-story-image">
                  <Image
                    alt={story.imageAlt}
                    fill
                    priority={storyIndex < 3}
                    sizes="(max-width: 699px) 88vw, (max-width: 1079px) 44vw, 30vw"
                    src={story.image}
                    unoptimized
                  />
                  <span>{story.category}</span>
                </div>

                <div className="dl-story-content">
                  <p>“{story.summary}”</p>
                  <footer>
                    <span className="dl-story-logo">
                      <Image alt={`Logo ${story.business}`} fill sizes="72px" src={story.logo} unoptimized />
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
        </div>
      </div>

      <div className="dl-story-arrows">
        <button aria-label="Cerita sebelumnya" onClick={() => goTo(activeIndex - 1)} type="button">
          <ArrowLeft aria-hidden="true" size={19} />
        </button>
        <button aria-label="Cerita berikutnya" onClick={() => goTo(activeIndex + 1)} type="button">
          <ArrowRight aria-hidden="true" size={19} />
        </button>
      </div>

      <div className="dl-story-controls">
        <div aria-label="Pilih kelompok cerita" className="dl-story-dots">
          {Array.from({ length: maxIndex + 1 }, (_, index) => (
            <button
              aria-label={`Tampilkan kelompok cerita ${index + 1}`}
              aria-pressed={index === activeIndex}
              className={index === activeIndex ? "is-active" : undefined}
              key={index}
              onClick={() => goTo(index)}
              type="button"
            >
              <span />
            </button>
          ))}
        </div>

        <div className="dl-story-status">
          <span>{String(activeIndex + 1).padStart(2, "0")} / {String(maxIndex + 1).padStart(2, "0")}</span>
          <button
            aria-label={isPaused ? "Putar otomatis cerita" : "Jeda putar otomatis cerita"}
            onClick={() => setIsPaused((paused) => !paused)}
            type="button"
          >
            {isPaused ? <Play aria-hidden="true" size={15} /> : <Pause aria-hidden="true" size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}
