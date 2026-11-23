import type { SiteContent } from "@/lib/sites/schema";
import type { TemplateCode } from "@/lib/sites/templates";
import { SiteTemplate } from "./site-template";
import s from "./template-thumb.module.css";

/** Pratinjau kecil: template asli dirender selebar desktop lalu diperkecil (zoom), tidak bisa difokus/diklik. */
export function TemplateThumb({ template, content, className }: { template: TemplateCode; content: SiteContent; className?: string }) {
  return <div className={`${s.thumb} ${className ?? ""}`} aria-hidden="true" inert>
    <div className={s.canvas}><SiteTemplate template={template} content={content} mode="thumb" /></div>
  </div>;
}
