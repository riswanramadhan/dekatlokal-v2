import Link from "next/link";
import { ArrowRight, FileText, LayoutTemplate, MapPin } from "lucide-react";
import type { BusinessProfile } from "@/lib/digital-checkup/validation";
import { nextStepCards, type NextStepCard } from "@/lib/layanan/next-steps";
import "@/app/commerce.css";

const ICONS: Record<NextStepCard["key"], typeof FileText> = { checkup_pro: FileText, gbp: MapPin, website: LayoutTemplate };

/** Bagian "Langkah lanjut" di hasil Checkup: ringkas, jujur, tanpa desakan waktu. */
export function NextSteps({ scores, profile, signedIn }: { scores: number[]; profile: Partial<BusinessProfile>; signedIn: boolean }) {
  const cards = nextStepCards({ scores, profile, signedIn });
  return <section className="cm-nextsteps" aria-labelledby="next-steps-title">
    <div className="dc-result-section-heading">
      <span className="dc-eyebrow">Langkah lanjut</span>
      <h2 id="next-steps-title">Mau dibantu lebih jauh?</h2>
      <p>Belajar gratis tetap jalan. Kalau butuh bantuan langsung, ini pilihan yang paling nyambung dengan hasilmu.</p>
    </div>
    <div className="cm-nextsteps-grid">{cards.map((card) => {
      const Icon = ICONS[card.key];
      return <Link key={card.key} className={`cm-nextstep is-${card.key}`} href={card.href}>
        <span className="cm-nextstep-icon"><Icon size={20} aria-hidden="true" /></span>
        <span className="cm-nextstep-eyebrow">{card.eyebrow}</span>
        <strong>{card.title}</strong>
        <span className="cm-nextstep-body">{card.body}</span>
        <span className="cm-nextstep-foot"><span>{card.price}</span><span className="cm-nextstep-cta">{card.cta}<ArrowRight size={15} aria-hidden="true" /></span></span>
      </Link>;
    })}</div>
  </section>;
}
