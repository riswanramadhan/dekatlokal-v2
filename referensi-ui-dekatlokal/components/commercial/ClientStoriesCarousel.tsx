"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { commercialLinks } from "./config";

interface StoryItem {
  slug: string;
  name: string;
  category: string;
  location: string;
  description: string;
  logoImage: string;
}

const AUTOPLAY_INTERVAL = 5000;

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true">
      <path d="M4 10h12M11.5 5.5 16 10l-4.5 4.5" />
    </svg>
  );
}

function StoryCard({
  story,
  isCenter,
  onFocus,
}: {
  story: StoryItem;
  isCenter: boolean;
  onFocus?: () => void;
}) {
  return (
    <article
      className={`relative flex h-full flex-col rounded-[1.75rem] border bg-white p-5 shadow-[0_18px_46px_rgba(1,34,98,0.08)] md:p-7 ${
        isCenter ? "border-primary/30" : "border-neutral-200"
      }`}
    >
      <span className="absolute right-5 top-5 text-6xl font-black leading-none text-primary/14 md:text-7xl" aria-hidden="true">
        &rdquo;
      </span>
      <div className="relative z-10 flex items-center gap-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-full border border-primary-100 bg-primary-50 p-2 md:h-14 md:w-14">
          <Image
            src={story.logoImage}
            alt={`Logo ${story.name}`}
            fill
            className="object-contain mix-blend-multiply"
            sizes="56px"
          />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold tracking-[-0.025em] text-neutral-950 md:text-2xl">
            {story.name}
          </h3>
          <p className="mt-1 truncate text-xs font-medium text-primary/75">
            {story.category} | {story.location}
          </p>
        </div>
      </div>

      <p className={`relative z-10 mt-5 flex-1 text-sm leading-7 text-neutral-600 ${isCenter ? "md:text-base" : "line-clamp-4"}`}>
        {story.description}
      </p>

      <Link
        href={`${commercialLinks.portfolio}/${story.slug}`}
        className="group relative z-10 mt-6 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onFocus={onFocus}
      >
        Baca cerita usahanya
        <ArrowIcon />
      </Link>
    </article>
  );
}

function getRelativePosition(index: number, activeIndex: number, length: number) {
  let position = index - activeIndex;
  const midpoint = length / 2;

  if (position > midpoint) position -= length;
  if (position < -midpoint) position += length;

  return position;
}

export default function ClientStoriesCarousel({ stories }: { stories: readonly StoryItem[] }) {
  const [activeIndex, setActiveIndex] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (isPaused || shouldReduceMotion || stories.length < 2) return;

    const timer = window.setInterval(() => {
      setDirection(1);
      setActiveIndex((index) => (index + 1) % stories.length);
    }, AUTOPLAY_INTERVAL);

    return () => window.clearInterval(timer);
  }, [isPaused, shouldReduceMotion, stories.length]);

  const selectStory = (index: number) => {
    setDirection(index >= activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  const activeStory = stories[activeIndex];

  return (
    <div
      className="relative mt-9 overflow-hidden py-4 md:mt-11 md:py-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-30 hidden w-16 bg-linear-to-r from-white to-transparent md:block" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-30 hidden w-16 bg-linear-to-l from-white to-transparent md:block" aria-hidden="true" />

      <div className="relative hidden h-[25rem] md:block lg:h-[23rem]">
        {stories.map((story, index) => {
          const position = getRelativePosition(index, activeIndex, stories.length);
          const isCenter = position === 0;
          const isVisible = Math.abs(position) <= 1;
          const x =
            position < -1
              ? "-205%"
              : position === -1
                ? "-125%"
                : isCenter
                  ? "-50%"
                  : position === 1
                    ? "25%"
                    : "105%";

          return (
            <motion.div
              key={story.slug}
              className="absolute left-1/2 top-1/2 h-[21rem] w-[42%] lg:h-[20rem]"
              initial={false}
              animate={{
                x,
                y: "-50%",
                scale: isCenter ? 1 : 0.82,
                opacity: isVisible ? (isCenter ? 1 : 0.66) : 0,
                zIndex: isCenter ? 20 : isVisible ? 10 : 0,
              }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.72, ease: [0.22, 1, 0.36, 1] }
              }
              style={{ pointerEvents: isVisible ? "auto" : "none" }}
              aria-hidden={!isVisible}
            >
              <StoryCard
                story={story}
                isCenter={isCenter}
                onFocus={() => selectStory(index)}
              />
            </motion.div>
          );
        })}
      </div>

      <div className="relative grid md:hidden">
        <AnimatePresence initial={false} custom={direction}>
          {activeStory ? (
            <motion.div
              key={activeStory.slug}
              custom={direction}
              className="col-start-1 row-start-1"
              initial={shouldReduceMotion ? false : { x: direction > 0 ? "70%" : "-70%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={shouldReduceMotion ? undefined : { x: direction > 0 ? "-70%" : "70%", opacity: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
              aria-live="polite"
            >
              <StoryCard story={activeStory} isCenter />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="mt-5 flex justify-center gap-2">
        {stories.map((story, index) => (
          <button
            key={story.slug}
            type="button"
            className={`h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              index === activeIndex ? "w-8 bg-primary" : "w-2 bg-primary/20"
            }`}
            aria-label={`Tampilkan cerita ${story.name}`}
            onClick={() => selectStory(index)}
          />
        ))}
      </div>
    </div>
  );
}
