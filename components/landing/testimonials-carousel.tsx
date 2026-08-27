"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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

export function TestimonialsCarousel({ stories }: { stories: LandingStory[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  const goTo = useCallback((index: number) => {
    setActiveIndex((index + stories.length) % stories.length);
  }, [stories.length]);

  useEffect(() => {
    if (isPaused || reduceMotion || stories.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % stories.length);
    }, AUTOPLAY_DELAY);
    return () => window.clearInterval(timer);
  }, [isPaused, reduceMotion, stories.length]);

  if (!stories.length) return null;
  const story = stories[activeIndex];

  return (
    <div
      aria-roledescription="carousel"
      aria-label="Cerita perjalanan UMKM"
      className="dl-story-carousel"
      data-reveal-item
      data-testid="story-carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div aria-live="polite" className="dl-story-live-region">
        Cerita {activeIndex + 1} dari {stories.length}: {story.business}
      </div>

      <div className="dl-story-stage">
        <AnimatePresence initial={false} mode="wait">
          <motion.article
            animate={{ opacity: 1, x: 0 }}
            className="dl-story-card"
            exit={{ opacity: 0, x: reduceMotion ? 0 : -24 }}
            initial={{ opacity: 0, x: reduceMotion ? 0 : 24 }}
            key={story.id}
            transition={{ duration: reduceMotion ? 0 : 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="dl-story-image">
              <Image
                alt={story.imageAlt}
                fill
                priority={activeIndex === 0}
                sizes="(max-width: 699px) 100vw, 52vw"
                src={story.image}
                unoptimized
              />
              <span>{story.category}</span>
              <div aria-hidden="true" className="dl-story-image-index">
                {String(activeIndex + 1).padStart(2, "0")}
              </div>
            </div>

            <div className="dl-story-content">
              <div className="dl-story-brand">
                <span className="dl-story-logo">
                  <Image alt={`Logo ${story.business}`} fill sizes="96px" src={story.logo} unoptimized />
                </span>
                <span>
                  <small>Perjalanan UMKM</small>
                  <strong>{story.business}</strong>
                </span>
              </div>
              <blockquote>“{story.summary}”</blockquote>
              <p>Fokus pada progres yang nyata, bukan sekadar terlihat sibuk.</p>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>

      <div className="dl-story-controls">
        <div className="dl-story-arrows">
          <button aria-label="Cerita sebelumnya" onClick={() => goTo(activeIndex - 1)} type="button">
            <ArrowLeft aria-hidden="true" size={19} />
          </button>
          <button aria-label="Cerita berikutnya" onClick={() => goTo(activeIndex + 1)} type="button">
            <ArrowRight aria-hidden="true" size={19} />
          </button>
        </div>

        <div aria-label="Pilih cerita" className="dl-story-dots">
          {stories.map((item, index) => (
            <button
              aria-label={`Tampilkan cerita ${item.business}`}
              aria-pressed={index === activeIndex}
              className={index === activeIndex ? "is-active" : undefined}
              key={item.id}
              onClick={() => goTo(index)}
              type="button"
            >
              <span />
            </button>
          ))}
        </div>

        <div className="dl-story-status">
          <span>{String(activeIndex + 1).padStart(2, "0")} / {String(stories.length).padStart(2, "0")}</span>
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
