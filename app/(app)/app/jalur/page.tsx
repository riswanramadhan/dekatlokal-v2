import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { ButtonLink, ProgressBar, StateBlock, StatusPill } from "@/components/ui";
import {
  getDashboardView,
  getFoundationalModuleCatalogView,
} from "@/domain/services/app-service";

export const metadata: Metadata = {
  title: "Jalur Saya",
};

export default async function JalurPage() {
  const [dashboard, catalog] = await Promise.all([
    getDashboardView(),
    getFoundationalModuleCatalogView(),
  ]);

  if (!dashboard.activePlan) {
    return (
      <StateBlock
        action={{
          href: "/mulai?claim=clm_7N4k9Q2vY8pR5tX1",
          label: "Hubungkan hasil Digital Checkup",
        }}
        description="Jalur Naik Kelas dibuat setelah hasil Digital Checkup terhubung."
        kind="empty"
        title="Jalur belum tersedia"
      />
    );
  }

  const activeSlugs = new Set(dashboard.activePlan.steps.map((step) => step.moduleSlug));
  const completed = dashboard.activePlan.steps.filter((step) => step.state === "completed").length;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="compact-card p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill>Jalur Naik Kelas</StatusPill>
          <StatusPill tone="neutral">3 fokus aktif</StatusPill>
        </div>
        <div className="mt-3 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <h1 className="text-2xl font-extrabold leading-tight">
              {dashboard.activePlan.headline}
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-text-secondary">
              {dashboard.activePlan.rationale}
            </p>
          </div>
          <ButtonLink href={`/app/jalur/${dashboard.activePlan.id}`} variant="secondary">
            Buka detail jalur
            <ArrowRight aria-hidden="true" className="h-5 w-5" />
          </ButtonLink>
        </div>
        <ProgressBar
          className="mt-5"
          label={`${completed} dari 3 fokus selesai`}
          value={Math.round((completed / 3) * 100)}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-extrabold">Tiga fokus dari Digital Checkup</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {dashboard.activePlan.steps.map((step) => (
            <Link
              className="compact-card flex min-h-[9rem] flex-col justify-between p-4 transition hover:border-brand-primary/30"
              href={`/app/modul/${step.moduleSlug}`}
              key={step.id}
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary-soft text-sm font-extrabold text-brand-primary">
                    {step.state === "completed" ? (
                      <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-success" />
                    ) : step.state === "locked" ? (
                      <LockKeyhole aria-hidden="true" className="h-5 w-5 text-warning" />
                    ) : (
                      step.position
                    )}
                  </span>
                  <StatusPill tone={step.state === "locked" ? "warning" : step.state === "completed" ? "success" : "info"}>
                    {step.state === "locked" ? "Terkunci" : step.state === "completed" ? "Selesai" : "Aktif"}
                  </StatusPill>
                </div>
                <h3 className="mt-3 font-extrabold leading-tight">{step.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-text-secondary">
                  {step.reason}
                </p>
              </div>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-extrabold text-brand-primary">
                Preview modul <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-extrabold">Delapan modul fondasi</h2>
          <p className="mt-1 text-base leading-7 text-text-secondary">
            Modul di luar tiga fokus tampil sebagai referensi terkunci agar jalur aktif tetap sederhana.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {catalog.map((module) => {
            const assignedStep = dashboard.activePlan?.steps.find(
              (step) => step.moduleSlug === module.slug,
            );
            const assigned = activeSlugs.has(module.slug);
            return (
              <Link
                className="compact-card min-h-[8rem] p-4 transition hover:border-brand-primary/30"
                href={`/app/modul/${module.slug}`}
                key={module.slug}
              >
                <div className="flex items-start justify-between gap-3">
                  <BookOpen aria-hidden="true" className="h-5 w-5 text-brand-primary" />
                  <StatusPill tone={assigned ? "info" : "warning"}>
                    {assigned ? `Fokus ${assignedStep?.position}` : "Referensi"}
                  </StatusPill>
                </div>
                <h3 className="mt-3 font-extrabold leading-tight">{module.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-text-secondary">
                  {module.outcome}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="compact-card flex items-start gap-3 p-4">
        <Sparkles aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-brand-primary" />
        <p className="text-base leading-7 text-text-secondary">
          Pilihan recall membantu mengingat hasil, tetapi tiga fokus resmi tetap berasal dari Digital Checkup.
        </p>
      </section>
    </div>
  );
}
