import type { Metadata } from "next";
import { ArrowRight, RefreshCcw, TrendingUp } from "lucide-react";
import {
  Button,
  HeroBanner,
  ProgressBar,
  ProgressTile,
  StateBlock,
  StatusPill,
  VisualPanel,
} from "@/components/ui";
import { getRecheckupView } from "@/domain/services/app-service";
import { completeMockRecheckup } from "@/features/recheckup/actions";

export const metadata: Metadata = { title: "Checkup ulang" };

export default async function RecheckupPage() {
  const view = await getRecheckupView();

  if (!view.progress || !view.dashboard.checkup) {
    return (
      <StateBlock
        action={{ href: "/mulai", label: "Mulai dari Digital Checkup" }}
        description="Checkup ulang membutuhkan hasil awal agar perubahan sebelum dan sesudah bisa dibandingkan."
        kind="empty"
        title="Belum ada hasil awal"
      />
    );
  }

  if (!view.progress.recheckupReady) {
    return (
      <StateBlock
        action={{ href: "/app/ujian-akhir", label: "Buka ujian akhir" }}
        description="Checkup ulang terbuka setelah tiga fokus selesai dan ujian akhir lulus."
        kind="locked"
        title="Checkup ulang masih terkunci"
      />
    );
  }

  if (view.comparison) {
    const original = view.comparison.originalResult;
    const latest = view.comparison.latestResult;
    const gain = latest.totalScore - original.totalScore;

    return (
      <div className="space-y-6">
        <HeroBanner
          action={{ href: `/app/sertifikat/${view.certificateId}`, label: "Lihat sertifikat" }}
          description="Checkup ulang membandingkan data awal dengan data terbaru. Jalur tiga fokus yang sudah selesai tetap tersimpan sebagai riwayat."
          eyebrow="Before-after"
          imageSrc="/illustrations/reward-hero.png"
          meta={<StatusPill tone="success">Naik {gain} poin</StatusPill>}
          title={`Perubahan ${view.dashboard.business.name} sudah terlihat`}
          tone="sky"
        />

        <section className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <ScoreCard label="Sebelum" score={original.totalScore} />
          <ArrowRight aria-hidden="true" className="mx-auto hidden h-6 w-6 text-brand-primary md:block" />
          <ScoreCard label="Sesudah" score={latest.totalScore} highlighted />
        </section>

        <VisualPanel tone="white">
          <ProgressBar label={`Kenaikan ${gain} poin`} value={latest.totalScore} />
        </VisualPanel>

        <section className="grid gap-5 lg:grid-cols-2">
          <VisualPanel tone="purple">
            <h2 className="text-2xl font-extrabold text-text-primary">
              Apa yang berubah
            </h2>
            <div className="mt-4 grid gap-3">
              {view.comparison.changedHighlights.map((item) => (
                <p className="rounded-[24px] bg-white/78 p-4 text-base leading-7 text-text-secondary" key={item}>
                  {item}
                </p>
              ))}
            </div>
          </VisualPanel>

          <VisualPanel tone="yellow">
            <h2 className="text-2xl font-extrabold text-text-primary">
              Aksi dan aset yang berkontribusi
            </h2>
            <div className="mt-4 grid gap-3">
              {view.comparison.contributingActions.map((item) => (
                <div className="rounded-[24px] bg-white/78 p-4" key={item.label}>
                  <p className="font-extrabold text-text-primary">{item.label}</p>
                  <p className="mt-1 text-sm leading-6 text-text-secondary">
                    Kontribusi: {item.source}
                  </p>
                </div>
              ))}
            </div>
          </VisualPanel>
        </section>

        <VisualPanel tone="white">
          <h2 className="text-2xl font-extrabold text-text-primary">
            Rekomendasi lanjutan
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {view.comparison.updatedRecommendationPreview.map((item) => (
              <div className="rounded-[24px] bg-surface-blue p-4" key={item.title}>
                <p className="font-extrabold text-text-primary">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-text-secondary">
                  {item.reason}
                </p>
                <p className="mt-2 text-sm font-extrabold text-brand-primary">
                  Nilai usaha: {item.expectedValue}
                </p>
              </div>
            ))}
          </div>
        </VisualPanel>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <HeroBanner
        description="DekatLokal memakai kembali nama usaha, kategori, kota, dan Aset Usaha yang sudah dibuat. Anda tidak perlu mengulang dari nol."
        eyebrow="Checkup ulang"
        imageSrc="/illustrations/dashboard-hero.png"
        meta={<StatusPill>Data usaha tersedia</StatusPill>}
        title="Gunakan data usaha yang sudah ada"
        tone="purple"
      />

      <VisualPanel tone="white">
        <div className="grid gap-4 md:grid-cols-3">
          <ProgressTile
            description="Skor awal"
            icon={TrendingUp}
            title="Digital Checkup"
            tone="blue"
            value={String(view.dashboard.checkup.totalScore)}
          />
          <ProgressTile
            description={`${view.dashboard.business.category}, ${view.dashboard.business.city}`}
            icon={RefreshCcw}
            title={view.dashboard.business.name}
            tone="yellow"
            value="Siap"
          />
          <ProgressTile
            description="Akan membantu menjelaskan perubahan"
            icon={RefreshCcw}
            title="Aset usaha"
            tone="pink"
            value={String(view.progress.assets.length)}
          />
        </div>
        <form action={completeMockRecheckup} className="mt-5">
          <Button className="w-full" type="submit">
            Selesaikan Checkup ulang
          </Button>
        </form>
      </VisualPanel>
    </div>
  );
}

function ScoreCard({
  highlighted = false,
  label,
  score,
}: {
  highlighted?: boolean;
  label: string;
  score: number;
}) {
  return (
    <VisualPanel tone={highlighted ? "blue" : "white"}>
      <p className={highlighted ? "text-sm font-extrabold text-white/76" : "text-sm font-extrabold text-text-muted"}>
        {label}
      </p>
      <p className="mt-2 text-6xl font-extrabold">{score}</p>
      <p className={highlighted ? "mt-1 text-sm leading-6 text-white/76" : "mt-1 text-sm leading-6 text-text-secondary"}>
        dari 100
      </p>
    </VisualPanel>
  );
}
