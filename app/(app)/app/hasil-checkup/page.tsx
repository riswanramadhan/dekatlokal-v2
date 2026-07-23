import type { Metadata } from "next";
import { BarChart3, CheckCircle2, Target } from "lucide-react";
import {
  ButtonLink,
  HeroBanner,
  ProgressTile,
  StateBlock,
  StatusPill,
  VisualPanel,
} from "@/components/ui";
import { PillarBars } from "@/components/checkup/pillar-bars";
import { getDashboardView } from "@/domain/services/app-service";

export const metadata: Metadata = {
  title: "Hasil Checkup",
};

export default async function HasilCheckupPage() {
  const dashboard = await getDashboardView();

  if (!dashboard.checkup) {
    return (
      <StateBlock
        action={{
          href: "/hubungkan-checkup?token=clm_7N4k9Q2vY8pR5tX1",
          label: "Hubungkan hasil checkup",
        }}
        description="Hasil Digital Checkup diperlukan agar rekomendasi bisa dijelaskan dengan tepat."
        kind="empty"
        title="Belum ada hasil checkup"
      />
    );
  }

  return (
    <div className="space-y-6">
      <HeroBanner
        description={dashboard.checkup.summary}
        eyebrow="Digital Checkup"
        imageSrc="/illustrations/dashboard-hero.png"
        meta={<StatusPill>Skor {dashboard.checkup.totalScore}/100</StatusPill>}
        title={`Ringkasan kondisi ${dashboard.business.name}`}
        tone="sky"
      />

      <section className="grid gap-4 md:grid-cols-3">
        <ProgressTile
          description={dashboard.checkup.level}
          icon={BarChart3}
          title="Skor total"
          tone="blue"
          value={String(dashboard.checkup.totalScore)}
        />
        <ProgressTile
          description="Fondasi yang sudah bisa dipakai"
          icon={CheckCircle2}
          title="Kekuatan"
          tone="yellow"
          value={String(dashboard.checkup.strengths.length)}
        />
        <ProgressTile
          description="Peluang penguatan berikutnya"
          icon={Target}
          title="Prioritas"
          tone="coral"
          value={String(dashboard.checkup.priorities.length)}
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <VisualPanel tone="white">
          <h2 className="text-2xl font-extrabold text-text-primary">
            Fondasi yang sudah kuat
          </h2>
          <div className="mt-4 grid gap-3">
            {dashboard.checkup.strengths.map((item) => (
              <p
                className="rounded-[22px] bg-success-soft px-4 py-3 text-sm font-extrabold text-success"
                key={item}
              >
                {item}
              </p>
            ))}
          </div>
        </VisualPanel>

        <VisualPanel tone="coral">
          <h2 className="text-2xl font-extrabold text-text-primary">
            Prioritas berikutnya
          </h2>
          <div className="mt-4 grid gap-3">
            {dashboard.checkup.priorities.map((item) => (
              <p
                className="rounded-[22px] bg-white/76 px-4 py-3 text-sm font-extrabold text-brand-primary shadow-[var(--shadow-soft)]"
                key={item}
              >
                {item}
              </p>
            ))}
          </div>
        </VisualPanel>
      </section>

      <VisualPanel tone="white">
        <h2 className="text-2xl font-extrabold text-text-primary">
          Skor per kategori
        </h2>
        <div className="mt-5">
          <PillarBars pillars={dashboard.checkup.pillarScores} />
        </div>
      </VisualPanel>

      {dashboard.activePlan ? (
        <VisualPanel tone="purple">
          <h2 className="text-2xl font-extrabold text-text-primary">
            Mengapa modul diberikan
          </h2>
          <p className="mt-2 text-base leading-7 text-text-secondary">
            {dashboard.activePlan.rationale}
          </p>
          <ButtonLink className="mt-5 w-full md:w-fit" href="/app/jalur">
            Lihat Jalur Naik Kelas
          </ButtonLink>
        </VisualPanel>
      ) : null}
    </div>
  );
}
