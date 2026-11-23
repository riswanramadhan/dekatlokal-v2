"use client";

import { useEffect, useRef, useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import type { SiteContent } from "@/lib/sites/schema";
import type { TemplateCode } from "@/lib/sites/templates";
import { SiteTemplate } from "../site-template";

const WIDTH = { mobile: 390, desktop: 1200 } as const;

/** Pratinjau langsung: template asli dirender selebar perangkat lalu diperkecil (zoom) agar muat di panel. */
export function SitePreview({ template, content }: { template: TemplateCode; content: SiteContent }) {
  const [device, setDevice] = useState<keyof typeof WIDTH>("mobile");
  const [paneWidth, setPaneWidth] = useState(0);
  const paneRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;
    const observer = new ResizeObserver(([entry]) => setPaneWidth(entry.contentRect.width));
    observer.observe(pane);
    return () => observer.disconnect();
  }, []);
  const width = WIDTH[device];
  const zoom = paneWidth ? Math.min(1, (paneWidth - 2) / width) : device === "mobile" ? 1 : 0.4;
  return <div className="sb-preview">
    <div className="sb-preview-bar">
      <span>Pratinjau langsung</span>
      <div className="sb-device" role="group" aria-label="Ukuran pratinjau">
        <button type="button" aria-pressed={device === "mobile"} onClick={() => setDevice("mobile")}><Smartphone size={15} aria-hidden="true" />Ponsel</button>
        <button type="button" aria-pressed={device === "desktop"} onClick={() => setDevice("desktop")}><Monitor size={15} aria-hidden="true" />Desktop</button>
      </div>
    </div>
    <div ref={paneRef} className="sb-preview-pane" data-device={device}>
      <div className="sb-preview-canvas" style={{ width, zoom }}>
        <SiteTemplate template={template} content={content} mode="preview" />
      </div>
    </div>
  </div>;
}
