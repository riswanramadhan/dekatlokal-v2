import type { Metadata } from "next";
import {
  Award,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  RefreshCcw,
  Sparkles,
  Trophy,
} from "lucide-react";
import {
  HeroBanner,
  ProgressBar,
  ProgressTile,
  StateBlock,
  StatusPill,
  VisualPanel,
} from "@/components/ui";
import { getThreeFocusProgressView } from "@/domain/services/app-service";

export const metadata: Metadata = {
  title: "Progres",
};

const taskStatusCopy = {
  not_started: "Belum mulai",
  draft: "Draft",
  submitted: "Menunggu review",
  needs_revision: "Perlu revisi",
  approved: "Disetujui",
  auto_approved: "Disetujui otomatis",
};

export default async function ProgresPage() {
  const { dashboard, progress } = await getThreeFocusProgressView();

  if (!progress) {
    return (
      <StateBlock
        action={{ href: "/mulai", label: "Mulai dari Digital Checkup" }}
        description="Digital Checkup diperlukan agar Jejak Tumbuh berisi tiga fokus yang sesuai kondisi usaha."
        kind="empty"
        title="Progres belum tersedia"
      />
    );
  }

  const percent = Math.round((progress.completedModules / 3) * 100);

  return (
    <div className="space-y-6">
      <HeroBanner
        description={`Progres ${dashboard.business.name} menampilkan penguasaan materi, aksi usaha, Aset Usaha, dan kesiapan menuju Checkup ulang.`}
        eyebrow="Jejak Tumbuh"
        imageSrc="/illustrations/reward-hero.png"
        meta={
          <div className="flex flex-wrap gap-2">
            <StatusPill tone={progress.syncState === "synced" ? "success" : "warning"}>
              {progress.syncState === "synced" ? "Tersinkron" : "Sinkron tertunda"}
            </StatusPill>
            <StatusPill>{progress.activeDays} hari aktif</StatusPill>
          </div>
        }
        title={`${progress.completedModules} dari 3 fokus selesai`}
        tone="sky"
      />

      <section className="grid gap-4 md:grid-cols-4">
        <ProgressTile
          description="Tiga fokus dasar"
          icon={Sparkles}
          title="Progress"
          tone="blue"
          value={`${progress.completedModules}/3`}
        />
        <ProgressTile
          description="Dari aksi dan bukti usaha"
          icon={Trophy}
          title="Poin Tumbuh"
          tone="yellow"
          value={String(progress.points)}
        />
        <ProgressTile
          description="Aset siap dipakai ulang"
          icon={FileText}
          title="Aset Usaha"
          tone="purple"
          value={String(progress.assets.length)}
        />
        <ProgressTile
          description={progress.rewardReady ? "Reward siap dicek" : "Masih berjalan"}
          icon={Award}
          title="Reward"
          tone="pink"
          value={progress.rewardReady ? "Siap" : "Belum"}
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-5">
          <VisualPanel tone="white">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <StatusPill>Insight</StatusPill>
                <h2 className="mt-3 text-2xl font-extrabold text-text-primary">
                  Perkembangan usaha
                </h2>
              </div>
              <StatusPill tone={progress.completedModules === 3 ? "success" : "info"}>
                {percent}%
              </StatusPill>
            </div>
            <p className="mt-3 text-base leading-7 text-text-secondary">
              {progress.insight}
            </p>
            <ProgressBar className="mt-5" label="Penyelesaian tiga fokus" value={percent} />
          </VisualPanel>

          <VisualPanel tone="coral">
            <h2 className="text-2xl font-extrabold text-text-primary">
              Penguasaan dan aksi
            </h2>
            <div className="mt-4 grid gap-3">
              {progress.postTestMastery.map((item, index) => {
                const task = progress.actionTasks[index];
                return (
                  <div
                    className="rounded-[24px] bg-white/78 p-4 shadow-[var(--shadow-soft)]"
                    key={item.moduleTitle}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-extrabold text-text-primary">{item.moduleTitle}</p>
                      <StatusPill tone={item.passed ? "success" : "warning"}>
                        {item.passed ? "Dikuasai" : "Belum dikuasai"}
                      </StatusPill>
                    </div>
                    {task ? (
                      <p className="mt-2 text-sm leading-6 text-text-secondary">
                        Tugas: {taskStatusCopy[task.status]} - {task.assetLabel}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </VisualPanel>

          <VisualPanel tone="white">
            <h2 className="text-2xl font-extrabold text-text-primary">
              Timeline Jejak Tumbuh
            </h2>
            <div className="mt-4 grid gap-3">
              {progress.timeline.map((item) => (
                <div
                  className="flex items-start gap-3 rounded-[24px] bg-white/82 p-4 shadow-[var(--shadow-soft)]"
                  key={item.id}
                >
                  {item.status === "done" ? (
                    <CheckCircle2
                      aria-hidden="true"
                      className="mt-1 h-5 w-5 shrink-0 text-success"
                    />
                  ) : (
                    <FileText
                      aria-hidden="true"
                      className="mt-1 h-5 w-5 shrink-0 text-brand-primary"
                    />
                  )}
                  <div>
                    <p className="font-extrabold text-text-primary">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-text-secondary">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </VisualPanel>
        </div>

        <aside className="space-y-5">
          <ReadinessPanel
            complete={progress.finalTestReady}
            description={
              progress.finalTestReady
                ? "Ketiga modul sudah memenuhi aturan penyelesaian."
                : "Ujian akhir terkunci sampai belajar, kuis, dan tugas ketiga fokus selesai."
            }
            icon={ClipboardCheck}
            title="Ujian akhir"
          />
          <ReadinessPanel
            complete={progress.recheckupReady}
            description={
              progress.recheckupReady
                ? "Ujian akhir lulus. Checkup ulang terbuka."
                : "Checkup ulang menunggu ujian akhir lulus."
            }
            icon={RefreshCcw}
            title="Checkup ulang"
          />
          <ReadinessPanel
            complete={progress.rewardReady}
            description={
              progress.rewardReady
                ? "Syarat reward utama terpenuhi."
                : "Reward menunggu modul, ujian, Checkup ulang, aset, profil, syarat, dan kapasitas."
            }
            icon={Award}
            title="Reward"
          />

          <VisualPanel tone="yellow">
            <h2 className="text-lg font-extrabold text-text-primary">Aset Usaha</h2>
            <div className="mt-3 grid gap-3">
              {progress.assets.length > 0 ? (
                progress.assets.map((asset) => (
                  <div className="rounded-[22px] bg-white/78 p-4" key={asset.id}>
                    <p className="font-extrabold text-text-primary">{asset.label}</p>
                    <p className="mt-1 line-clamp-3 text-sm leading-6 text-text-secondary">
                      {asset.value}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-base leading-7 text-text-secondary">
                  Aset dari tugas usaha akan muncul setelah disetujui.
                </p>
              )}
            </div>
          </VisualPanel>
        </aside>
      </section>
    </div>
  );
}

function ReadinessPanel({
  complete,
  description,
  icon: Icon,
  title,
}: {
  complete: boolean;
  description: string;
  icon: typeof ClipboardCheck;
  title: string;
}) {
  return (
    <VisualPanel tone={complete ? "sky" : "white"}>
      <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-brand-primary-soft text-brand-primary">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-lg font-extrabold text-text-primary">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-text-secondary">{description}</p>
      <StatusPill className="mt-4" tone={complete ? "success" : "warning"}>
        {complete ? "Siap" : "Belum siap"}
      </StatusPill>
    </VisualPanel>
  );
}
