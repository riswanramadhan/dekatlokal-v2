"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export type LandingStory = {
  id: string;
  business: string;
  category: string;
  summary: string;
  image: string;
  imageAlt: string;
};

function getVisibleCount() {
  if (window.innerWidth < 700) return 1;
  if (window.innerWidth < 1080) return 2;
  return 3;
}

export function TestimonialsCarousel({ stories }: { stories: LandingStory[] }) {
  const [index, setIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isUserPaused, setIsUserPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [canAutoplay, setCanAutoplay] = useState(false);
  const pointerStart = useRef<number | null>(null);

  const maxIndex = Math.max(0, stories.length - visibleCount);
  const goTo = useCallback(
    (next: number) => setIndex(next > maxIndex ? 0 : next < 0 ? maxIndex : next),
    [maxIndex],
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      const count = getVisibleCount();
      setVisibleCount(count);
      setCanAutoplay(!media.matches);
      setIndex((current) => Math.min(current, Math.max(0, stories.length - count)));
    };
    update();
    media.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      media.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, [stories.length]);

  useEffect(() => {
    if (!canAutoplay || isUserPaused || isHovered || isFocusWithin) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((current) => (current >= maxIndex ? 0 : current + 1));
    }, 5000);
    return () => window.clearInterval(timer);
  }, [canAutoplay, isFocusWithin, isHovered, isUserPaused, maxIndex]);

  return (
    <div
      className="dl-story-carousel"
      data-testid="story-carousel"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsFocusWithin(false);
      }}
      onFocus={() => setIsFocusWithin(true)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onPointerCancel={() => { pointerStart.current = null; }}
      onPointerDown={(event) => { pointerStart.current = event.clientX; }}
      onPointerUp={(event) => {
        if (pointerStart.current === null) return;
        const distance = event.clientX - pointerStart.current;
        if (Math.abs(distance) > 48) goTo(index + (distance < 0 ? 1 : -1));
        pointerStart.current = null;
      }}
    >
      <div className="dl-story-viewport">
        <div
          className="dl-story-track"
          style={{ "--story-index": index, "--story-visible": visibleCount } as React.CSSProperties}
        >
          {stories.map((story, storyIndex) => (
            <article
              aria-hidden={storyIndex < index || storyIndex >= index + visibleCount}
              className="dl-story-card"
              key={story.id}
            >
              <div className="dl-story-image">
                <Image alt={story.imageAlt} fill sizes="(max-width: 699px) 88vw, (max-width: 1079px) 44vw, 30vw" src={story.image} unoptimized />
                <span>{story.category}</span>
              </div>
              <div className="dl-story-content">
                <span aria-hidden="true" className="dl-story-quote">“</span>
                <p>{story.summary}</p>
                <footer>
                  <span className="dl-story-avatar">
                    <Image alt="" fill sizes="48px" src={story.image} unoptimized />
                  </span>
                  <span><strong>{story.business}</strong><small>Fokus perjalanan usaha</small></span>
                </footer>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="dl-story-controls">
        <div className="dl-story-arrows">
          <button aria-label="Cerita sebelumnya" onClick={() => goTo(index - 1)} type="button"><ArrowLeft aria-hidden="true" size={19} /></button>
          <button aria-label="Cerita berikutnya" onClick={() => goTo(index + 1)} type="button"><ArrowRight aria-hidden="true" size={19} /></button>
          {canAutoplay ? (
            <button
              aria-label={isUserPaused ? "Putar otomatis" : "Jeda putar otomatis"}
              aria-pressed={isUserPaused}
              onClick={() => setIsUserPaused((current) => !current)}
              type="button"
            >
              {isUserPaused ? <Play aria-hidden="true" size={17} /> : <Pause aria-hidden="true" size={17} />}
            </button>
          ) : null}
        </div>
        <div aria-label="Pilih kelompok cerita" className="dl-story-dots">
          {Array.from({ length: maxIndex + 1 }, (_, dotIndex) => (
            <button
              aria-label={`Tampilkan cerita ${dotIndex + 1}`}
              aria-pressed={index === dotIndex}
              className={index === dotIndex ? "is-active" : undefined}
              key={dotIndex}
              onClick={() => goTo(dotIndex)}
              type="button"
            />
          ))}
        </div>
        <span className="dl-story-count">{String(index + 1).padStart(2, "0")} / {String(maxIndex + 1).padStart(2, "0")}</span>
      </div>
    </div>
  );
}
