"use client";

import { useEffect, useRef } from "react";
import type { TickerItem } from "@/lib/ecosystem/ticker";

// Kecepatan dalam piksel per detik (bukan durasi tetap), jadi teks berjalan sama cepatnya
// berapa pun panjang isinya dan lebar layarnya. Ponsel sedikit lebih pelan agar tetap terbaca.
const SPEED = { mobile: 70, tablet: 85, desktop: 100 } as const;

function TickerText({ item, hidden = false }: { item: TickerItem; hidden?: boolean }) {
  const isExternal = /^https?:\/\//i.test(item.href) && !/^https?:\/\/digitalcheckup\.dekatlokal\.com/i.test(item.href);
  const content = <>
    <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" aria-hidden="true" />
    {item.text}
  </>;
  const className = "inline-flex items-center gap-2 rounded-full px-2 py-0.5 font-medium transition-colors hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80";
  if (!item.href) return <span className={className} aria-hidden={hidden}>{content}</span>;
  return <a href={item.href} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noopener noreferrer" : undefined} tabIndex={hidden ? -1 : 0} aria-hidden={hidden} className={className}>{content}</a>;
}

export function TickerMarquee({ items }: { items: TickerItem[] }) {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const view = viewport.current, row = track.current;
    if (!view || !row) return;
    const update = () => {
      const width = row.scrollWidth;
      const speed = window.innerWidth < 640 ? SPEED.mobile : window.innerWidth < 1024 ? SPEED.tablet : SPEED.desktop;
      view.style.setProperty("--ticker-duration", `${Math.max(8, width / speed).toFixed(2)}s`);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(row);
    window.addEventListener("resize", update, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [items]);

  return <div className="public-ticker mx-auto flex min-h-6 max-w-7xl items-center" aria-label="Kabar terbaru Digital Checkup">
    <div ref={viewport} className="public-ticker__viewport" style={{ "--ticker-duration": `${Math.max(20, items.length * 6)}s` } as React.CSSProperties}>
      <div ref={track} className="public-ticker__track">
        {items.map((item) => <TickerText key={item.id} item={item} />)}
      </div>
      <div className="public-ticker__track" aria-hidden="true">
        {items.map((item) => <TickerText key={`clone-${item.id}`} item={item} hidden />)}
      </div>
    </div>
  </div>;
}
