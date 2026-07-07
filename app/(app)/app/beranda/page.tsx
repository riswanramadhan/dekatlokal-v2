import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  Gift,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { SoundToggle } from "@/components/sound";
import {
  ButtonLink,
  ProgressBar,
  StateBlock,
  StatusPill,
} from "@/components/ui";
import { getDashboardView } from "@/domain/services/app-service";

export const metadata: Metadata = {
  title: "Beranda",
};

export default async function BerandaPage() {
  const dashboard = await getDashboardView();

  if (!dashboard.checkup || !dashboard.activePlan) {
    return (
      <StateBlock
        action={{ href: "/mulai", label: "Mulai dari Digital Checkup" }}
        description="Digital Checkup diperlukan agar DekatLokal dapat menyusun tiga fokus usaha yang akurat."
        kind="empty"
        title="Belum ada Jalur Naik Kelas"
      />
    );
  }

  const steps = dashboard.activePlan.steps;
  const completedCount = steps.filter((step) => step.state === "completed").length;
  const allComplete = completedCount === 3;
  const currentStep = steps.find((step) => step.state !== "completed") ?? steps[2];
  const focusPosition = allComplete ? 3 : currentStep?.position ?? 1;
  const nextAction = dashboard.activePlan.nextBestAction;
  const reward = dashboard.activePlan.rewardPreview;
  const nextHref = allComplete ? "/app/ujian-akhir" : nextAction.href;
  const nextLabel = allComplete ? "Buka Ujian Akhir" : nextAction.ctaLabel;

  return (
    <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 space-y-5">
        <section className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-text-secondary">
              Halo, {dashboard.user.name}
            </p>
            <h1 className="mt-1 text-2xl font-extrabold leading-tight text-text-primary">
              Ruang Tumbuh {dashboard.business.name}
            </h1>
          </div>
          <SoundToggle className="sm:hidden" />
        </section>

        <section className="overflow-hidden rounded-[var(--radius-xl)] bg-brand-primary p-4 text-white shadow-[var(--shadow-blue)] md:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex min-h-8 items-center gap-1 rounded-full bg-white/16 px-3 text-sm font-extrabold text-white">
              <Sparkles aria-hidden="true" className="h-4 w-4" />
              Langkah Terbaik Hari Ini
            </span>
            <span className="inline-flex min-h-8 items-center gap-1 rounded-full bg-white/16 px-3 text-sm font-extrabold text-white">
              Fokus {focusPosition} dari 3
            </span>
            <span className="inline-flex min-h-8 items-center gap-1 rounded-full bg-white/16 px-3 text-sm font-extrabold text-white">
              <Clock3 aria-hidden="true" className="h-4 w-4" />
              {allComplete ? "Siap ujian" : `${nextAction.estimatedMinutes} menit`}
            </span>
          </div>
          <h2 className="mt-4 text-[1.7rem] font-extrabold leading-tight">
            {allComplete ? "Tiga fokus utama sudah selesai" : nextAction.title}
          </h2>
          <p className="mt-3 text-base leading-7 text-white/82">
            {allComplete
              ? "Fondasi usahamu sudah lengkap. Ujian akhir menjadi langkah pembuktian berikutnya."
              : nextAction.rationale}
          </p>
          <ProgressBar className="mt-4" value={Math.round((completedCount / 3) * 100)} />
          <ButtonLink
            className="mt-5 w-full rounded-[18px] bg-white text-brand-primary hover:bg-white md:w-fit"
            href={nextHref}
          >
            {nextLabel}
            <ArrowRight aria-hidden="true" className="h-5 w-5" />
          </ButtonLink>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <QuickAction href="/app/jalur" icon={BookOpen} title="Jalur" value={`${completedCount}/3 fokus`} />
          <QuickAction href="/app/progres" icon={ClipboardCheck} title="Jejak" value={dashboard.progress.syncState === "pending" ? "Sync pending" : "Tersimpan"} />
          <QuickAction href="/app/aset-usaha" icon={FileText} title="Aset" value={`${dashboard.assets.length} siap`} />
          <QuickAction href="/app/reward/landing-page" icon={Gift} title="Reward" value={reward?.isEligible ? "Siap" : "Preview"} />
        </section>

        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold">Tiga fokus usahamu</h2>
              <p className="mt-1 text-base leading-7 text-text-secondary">
                Dari hasil Digital Checkup, dibuka berurutan.
              </p>
            </div>
            <Link className="text-sm font-extrabold text-brand-primary" href="/app/jalur">
              Detail
            </Link>
          </div>
          <div className="grid gap-3">
            {steps.map((step) => (
              <Link
                className="compact-card grid min-h-[5.25rem] grid-cols-[auto_1fr_auto] items-center gap-3 p-3 transition hover:border-brand-primary/30"
                href={`/app/modul/${step.moduleSlug}`}
                key={step.id}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary-soft text-brand-primary">
                  {step.state === "completed" ? (
                    <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-success" />
                  ) : step.state === "locked" ? (
                    <LockKeyhole aria-hidden="true" className="h-5 w-5 text-warning" />
                  ) : (
                    <span className="text-sm font-extrabold">{step.position}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold leading-tight">{step.title}</h3>
                    <StatusPill tone={step.state === "completed" ? "success" : step.state === "locked" ? "warning" : "info"}>
                      {step.state === "completed" ? "Selesai" : step.state === "locked" ? "Terkunci" : "Aktif"}
                    </StatusPill>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-text-secondary">
                    {step.reason}
                  </p>
                </div>
                <ArrowRight aria-hidden="true" className="h-5 w-5 text-text-muted" />
              </Link>
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-4">
        <section className="compact-card p-4">
          <StatusPill>Insight checkup</StatusPill>
          <h2 className="mt-3 text-xl font-extrabold">{dashboard.checkup.level}</h2>
          <p className="mt-2 text-base leading-7 text-text-secondary">
            {dashboard.checkup.summary}
          </p>
          <ProgressBar
            className="mt-4"
            label={`Skor ${dashboard.checkup.totalScore}/100`}
            value={dashboard.checkup.totalScore}
          />
        </section>

        <section className="compact-card p-4">
          <div className="flex items-start gap-3">
            <Banknote aria-hidden="true" className="mt-1 h-5 w-5 text-brand-primary" />
            <div>
              <h2 className="font-extrabold">Aset Usaha</h2>
              <p className="mt-1 text-sm leading-6 text-text-secondary">
                Output tugas disimpan untuk profil, Jejak Tumbuh, dan reward.
              </p>
            </div>
          </div>
          <div className="mt-3 grid gap-2">
            {(dashboard.assets.length ? dashboard.assets.slice(0, 2) : []).map((asset) => (
              <div className="rounded-2xl bg-surface-subtle p-3" key={asset.id}>
                <p className="font-bold">{asset.label}</p>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-text-secondary">
                  {asset.value}
                </p>
              </div>
            ))}
            {dashboard.assets.length === 0 ? (
              <p className="rounded-2xl bg-surface-subtle p-3 text-sm leading-6 text-text-secondary">
                Aset pertama muncul setelah tugas usaha disetujui.
              </p>
            ) : null}
          </div>
        </section>

        <section className="compact-card p-4">
          <Gift aria-hidden="true" className="h-5 w-5 text-brand-primary" />
          <h2 className="mt-3 font-extrabold">{reward?.title ?? "Reward landing page"}</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {reward?.description ?? "Lengkapi tiga fokus untuk membuka checklist reward."}
          </p>
          <ButtonLink className="mt-4 w-full" href="/app/reward/landing-page" variant="secondary">
            Lihat reward
          </ButtonLink>
        </section>
      </aside>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  value,
}: {
  href: string;
  icon: typeof BookOpen;
  title: string;
  value: string;
}) {
  return (
    <Link className="compact-card min-h-[5.25rem] p-3" href={href}>
      <Icon aria-hidden="true" className="h-5 w-5 text-brand-primary" />
      <p className="mt-2 text-sm font-bold text-text-muted">{title}</p>
      <p className="mt-0.5 font-extrabold leading-tight">{value}</p>
    </Link>
  );
}
