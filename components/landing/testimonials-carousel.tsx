import Image from "next/image";
import type { CSSProperties } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export type LandingStory = {
  id: string;
  business: string;
  category: string;
  summary: string;
  image: string;
  imageAlt: string;
};

const initialVisibleCount = 3;

export function TestimonialsCarousel({ stories }: { stories: LandingStory[] }) {
  const maxIndex = Math.max(0, stories.length - initialVisibleCount);

  return (
    <div className="dl-story-carousel" data-testid="story-carousel">
      <div className="dl-story-viewport">
        <div
          className="dl-story-track"
          style={
            {
              "--story-index": 0,
              "--story-visible": initialVisibleCount,
            } as CSSProperties
          }
        >
          {stories.map((story, storyIndex) => (
            <article
              aria-hidden={storyIndex >= initialVisibleCount}
              className="dl-story-card"
              key={story.id}
            >
              <div className="dl-story-image">
                <Image
                  alt={story.imageAlt}
                  fill
                  sizes="(max-width: 699px) 88vw, (max-width: 1079px) 44vw, 30vw"
                  src={story.image}
                  unoptimized
                />
                <span>{story.category}</span>
              </div>
              <div className="dl-story-content">
                <span aria-hidden="true" className="dl-story-quote">
                  &quot;
                </span>
                <p>{story.summary}</p>
                <footer>
                  <span className="dl-story-avatar">
                    <Image alt="" fill sizes="48px" src={story.image} unoptimized />
                  </span>
                  <span>
                    <strong>{story.business}</strong>
                    <small>Fokus perjalanan usaha</small>
                  </span>
                </footer>
              </div>
            </article>
          ))}
        </div>
      </div>

      <button className="dl-story-side-arrow is-left" aria-label="Cerita sebelumnya" type="button">
        <ArrowLeft aria-hidden="true" size={19} />
      </button>
      <button className="dl-story-side-arrow is-right" aria-label="Cerita berikutnya" type="button">
        <ArrowRight aria-hidden="true" size={19} />
      </button>

      <div className="dl-story-controls">
        <div aria-label="Pilih kelompok cerita" className="dl-story-dots">
          {Array.from({ length: maxIndex + 1 }, (_, dotIndex) => (
            <button
              aria-label={`Tampilkan cerita ${dotIndex + 1}`}
              aria-pressed={dotIndex === 0}
              className={dotIndex === 0 ? "is-active" : undefined}
              key={dotIndex}
              type="button"
            />
          ))}
        </div>
        <span className="dl-story-count">
          01 / {String(maxIndex + 1).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
