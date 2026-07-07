import Link from "next/link";
import type { PlanStep } from "@/domain/entities";
import { pathStateCopy } from "@/features/learning-path/state";
import { StatusPill } from "@/components/ui";

export function PathList({
  steps,
  collapsibleFuture = false,
}: {
  steps: PlanStep[];
  collapsibleFuture?: boolean;
}) {
  const visibleSteps = collapsibleFuture ? steps.slice(0, 4) : steps;
  const hiddenSteps = collapsibleFuture ? steps.slice(4) : [];

  return (
    <div className="relative grid gap-3">
      {visibleSteps.map((step) => (
        <PathStepCard key={step.id} step={step} />
      ))}
      {hiddenSteps.length > 0 ? (
        <details className="rounded-[var(--radius-lg)] bg-white/86 p-4 shadow-[var(--shadow-soft)]">
          <summary className="cursor-pointer font-semibold text-text-primary">
            Lihat {hiddenSteps.length} langkah berikutnya
          </summary>
          <div className="mt-3 grid gap-3">
            {hiddenSteps.map((step) => (
              <PathStepCard key={step.id} step={step} />
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}

function PathStepCard({ step }: { step: PlanStep }) {
  const state = pathStateCopy[step.state];
  const Icon = state.icon;

  return (
    <article className="grid gap-3 rounded-[26px] bg-white/86 p-4 shadow-[var(--shadow-soft)] md:grid-cols-[auto_1fr_auto] md:items-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-brand-primary-soft text-brand-primary">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-extrabold text-text-primary">{step.title}</h2>
          <StatusPill tone={step.state === "locked" ? "warning" : step.state === "completed" ? "success" : "info"}>
            {state.label}
          </StatusPill>
        </div>
        <p className="mt-1 text-base leading-7 text-text-secondary">{step.summary}</p>
        <p className="mt-2 text-sm leading-6 text-text-secondary">{step.reason}</p>
        {step.prerequisite ? (
          <p className="mt-3 rounded-[20px] bg-warning-soft p-3 text-sm leading-6 text-text-primary">
            {step.prerequisite}
          </p>
        ) : null}
      </div>
      <Link
        className="inline-flex min-h-11 items-center justify-center rounded-[18px] bg-white px-4 text-sm font-extrabold text-brand-primary shadow-[var(--shadow-soft)] transition hover:bg-brand-primary-soft"
        href={`/app/modul/${step.moduleSlug}`}
      >
        Preview
      </Link>
    </article>
  );
}
