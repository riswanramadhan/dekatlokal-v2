import type { Metadata } from "next";
import { Lock, Sparkles } from "lucide-react";
import { HeroBanner, StateBlock, StatusPill, VisualPanel } from "@/components/ui";
import { getPremiumView } from "@/domain/services/app-service";

export const metadata: Metadata = { title: "Premium" };

export default async function PremiumPage() {
  const view = await getPremiumView();

  if (!view.progress) {
    return (
      <StateBlock
        action={{ href: "/mulai", label: "Mulai dari Digital Checkup" }}
        description="Rekomendasi lanjutan membutuhkan Jalur Naik Kelas yang berasal dari Digital Checkup."
        kind="empty"
        title="Rekomendasi belum tersedia"
      />
    );
  }

  const foundationComplete = view.progress.completedModules === 3;

  return (
    <div className="space-y-6">
      <HeroBanner
        description="Premium di DekatLokal bukan marketplace umum. Rekomendasi muncul berdasarkan hasil usaha, prasyarat, dan nilai bisnis yang diharapkan. Tidak ada pembayaran nyata pada demo ini."
        eyebrow="Rekomendasi lanjutan"
        imageSrc="/illustrations/reward-hero.png"
        meta={<StatusPill tone={foundationComplete ? "success" : "warning"}>{foundationComplete ? "Relevan dibuka" : "Fondasi dulu"}</StatusPill>}
        title={
          foundationComplete
            ? "Langkah lanjutan yang relevan"
            : "Fokus dasar tetap menjadi prioritas"
        }
        tone="purple"
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {view.recommendations.map((item, index) => (
          <VisualPanel key={item.id} tone={foundationComplete ? (index === 0 ? "sky" : index === 1 ? "yellow" : "coral") : "white"}>
            <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-brand-primary-soft text-brand-primary">
              {foundationComplete ? (
                <Sparkles aria-hidden="true" className="h-5 w-5" />
              ) : (
                <Lock aria-hidden="true" className="h-5 w-5" />
              )}
            </div>
            <h2 className="mt-4 text-xl font-extrabold text-text-primary">{item.title}</h2>
            <p className="mt-2 text-base leading-7 text-text-secondary">
              {foundationComplete ? item.outcome : item.reason}
            </p>
            <div className="mt-4 rounded-[24px] bg-white/78 p-4 text-sm leading-6 text-text-secondary shadow-[var(--shadow-soft)]">
              <p>
                <span className="font-extrabold text-text-primary">Mengapa:</span>{" "}
                {item.reason}
              </p>
              <p className="mt-2">
                <span className="font-extrabold text-text-primary">Prasyarat:</span>{" "}
                {item.prerequisite}
              </p>
              <p className="mt-2">
                <span className="font-extrabold text-text-primary">Nilai usaha:</span>{" "}
                {item.expectedBusinessValue}
              </p>
            </div>
            <StatusPill className="mt-4" tone={foundationComplete ? "info" : "warning"}>
              Preview tanpa pembayaran
            </StatusPill>
          </VisualPanel>
        ))}
      </div>
    </div>
  );
}
