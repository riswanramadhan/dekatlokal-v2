import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock3, LockKeyhole, Sparkles } from "lucide-react";
import { ButtonLink, ProgressBar, StatusPill } from "@/components/ui";
import { getActivePlanView } from "@/domain/services/app-service";

export const metadata: Metadata = {
  title: "Detail Jalur",
};

type PlanDetailPageProps = {
  params: Promise<{ planId: string }>;
};

export default async function PlanDetailPage({ params }: PlanDetailPageProps) {
  const { planId } = await params;
  const plan = await getActivePlanView(planId);

  if (!plan) {
    notFound();
  }

  const completed = plan.steps.filter((step) => step.state === "completed").length;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <section className="compact-card p-4 md:p-5">
        <StatusPill>Detail Jalur</StatusPill>
        <h1 className="mt-3 text-2xl font-extrabold leading-tight">{plan.headline}</h1>
        <p className="mt-2 max-w-2xl text-base leading-7 text-text-secondary">
          {plan.summary}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <StatusPill tone="neutral">
            <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
            {plan.estimatedMinutes} menit
          </StatusPill>
          <StatusPill tone="neutral">3 fokus</StatusPill>
          <StatusPill>
            <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
            {plan.nextBestAction.title}
          </StatusPill>
        </div>
        <ProgressBar
          className="mt-5"
          label={`${completed} dari ${plan.steps.length} fokus selesai`}
          value={Math.round((completed / plan.steps.length) * 100)}
        />
      </section>

      <section className="grid gap-3">
        {plan.steps.map((step, index) => (
          <Link
            className="compact-card grid gap-3 p-4 transition hover:border-brand-primary/30 md:grid-cols-[auto_1fr_auto] md:items-center"
            href={`/app/modul/${step.moduleSlug}`}
            key={step.id}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary-soft text-brand-primary">
              {step.state === "completed" ? (
                <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-success" />
              ) : step.state === "locked" ? (
                <LockKeyhole aria-hidden="true" className="h-5 w-5 text-warning" />
              ) : (
                <span className="text-sm font-extrabold">{index + 1}</span>
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-extrabold">{step.title}</h2>
                <StatusPill tone={step.state === "locked" ? "warning" : step.state === "completed" ? "success" : "info"}>
                  {step.state === "locked" ? "Terkunci" : step.state === "completed" ? "Selesai" : "Aktif"}
                </StatusPill>
              </div>
              <p className="mt-1 text-sm leading-6 text-text-secondary">{step.reason}</p>
              {step.prerequisite ? (
                <p className="mt-2 rounded-2xl bg-warning-soft p-3 text-sm leading-6 text-text-secondary">
                  {step.prerequisite}
                </p>
              ) : null}
            </div>
            <ArrowRight aria-hidden="true" className="hidden h-5 w-5 text-text-muted md:block" />
          </Link>
        ))}
      </section>

      <ButtonLink className="w-full md:w-fit" href={plan.nextBestAction.href}>
        {plan.nextBestAction.ctaLabel}
        <ArrowRight aria-hidden="true" className="h-5 w-5" />
      </ButtonLink>
    </div>
  );
}
