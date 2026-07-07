import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Lock,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";
import {
  ButtonLink,
  ProgressBar,
  StatusPill,
} from "@/components/ui";
import { getModuleView } from "@/domain/services/app-service";
import {
  canStartModule,
  moduleStartLabel,
  pathStateCopy,
} from "@/features/learning-path/state";

export const metadata: Metadata = {
  title: "Detail Modul",
};

type ModuleDetailPageProps = {
  params: Promise<{ moduleSlug: string }>;
};

export default async function ModuleDetailPage({
  params,
}: ModuleDetailPageProps) {
  const { moduleSlug } = await params;
  const view = await getModuleView(moduleSlug);

  if (!view) {
    notFound();
  }

  const state = pathStateCopy[view.module.state];
  const startAllowed = canStartModule(view.module.state);
  const completedLessons = view.module.state === "completed" ? view.module.lessons.length : 0;
  const lessonProgress = Math.round((completedLessons / view.module.lessons.length) * 100);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="compact-card p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill>Preview Modul</StatusPill>
          <StatusPill tone={startAllowed ? "info" : "warning"}>{state.label}</StatusPill>
          <StatusPill tone="neutral">
            <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
            {view.module.estimatedMinutes} menit
          </StatusPill>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_18rem] lg:items-end">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight">{view.module.title}</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-text-secondary">
              {view.module.description}
            </p>
          </div>
          <ButtonLink
            className="w-full"
            href={startAllowed ? `/app/modul/${view.module.slug}/mulai` : "/app/jalur"}
            variant={startAllowed ? "primary" : "secondary"}
          >
            {startAllowed ? moduleStartLabel(view.module.state) : "Lihat prasyarat di Jalur"}
            <ArrowRight aria-hidden="true" className="h-5 w-5" />
          </ButtonLink>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <article className="compact-card p-4">
            <StatusPill>Outcome</StatusPill>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight">
              {view.module.outcome}
            </h2>
            <p className="mt-3 text-base leading-7 text-text-secondary">
              {view.module.reasonAssigned}
            </p>
          </article>

          <article className="compact-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold">Isi modul</h2>
                <p className="mt-1 text-base leading-7 text-text-secondary">
                  Empat lesson pendek, satu post-test, dan satu tugas usaha.
                </p>
              </div>
              <StatusPill tone="neutral">{view.module.lessons.length} lesson</StatusPill>
            </div>
            <div className="mt-4 grid gap-3">
              {view.module.lessons.map((lesson, index) => {
                const content = (
                  <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary-soft text-brand-primary">
                      <FileText aria-hidden="true" className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold leading-tight">{lesson.title}</p>
                      <p className="mt-1 text-sm leading-6 text-text-secondary">
                        {lesson.estimatedMinutes} menit - lesson {index + 1}
                      </p>
                    </div>
                    {startAllowed ? (
                      <ArrowRight aria-hidden="true" className="h-5 w-5 text-text-muted" />
                    ) : (
                      <Lock aria-hidden="true" className="h-5 w-5 text-warning" />
                    )}
                  </>
                );

                return startAllowed ? (
                  <Link
                    className="grid min-h-16 grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[18px] border border-border-default bg-white p-3 transition hover:border-brand-primary/30"
                    href={`/app/belajar/${lesson.id}`}
                    key={lesson.id}
                  >
                    {content}
                  </Link>
                ) : (
                  <div
                    className="grid min-h-16 grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[18px] border border-border-default bg-white p-3 opacity-80"
                    key={lesson.id}
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          </article>
        </div>

        <aside className="space-y-4">
          <article className="compact-card p-4">
            <ShieldCheck aria-hidden="true" className="h-5 w-5 text-brand-primary" />
            <h2 className="mt-3 font-extrabold">Aturan selesai</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {view.module.completionRule}
            </p>
            <ProgressBar className="mt-4" label={`${completedLessons}/${view.module.lessons.length} lesson`} value={lessonProgress} />
          </article>

          <article className="compact-card p-4">
            <PackageCheck aria-hidden="true" className="h-5 w-5 text-brand-primary" />
            <h2 className="mt-3 font-extrabold">Tugas wajib</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {view.module.requiredTask.title}: {view.module.requiredTask.description}
            </p>
            <StatusPill className="mt-4" tone="info">
              Aset: {view.module.assetCreated}
            </StatusPill>
          </article>

          {view.module.prerequisite ? (
            <article className="compact-card border-warning/30 bg-warning-soft p-4">
              <Lock aria-hidden="true" className="h-5 w-5 text-warning" />
              <h2 className="mt-3 font-extrabold">Prasyarat</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                {view.module.prerequisite}
              </p>
            </article>
          ) : null}

          <ButtonLink
            className="w-full"
            href={startAllowed ? `/app/modul/${view.module.slug}/mulai` : "/app/jalur"}
            variant={startAllowed ? "primary" : "secondary"}
          >
            {startAllowed ? moduleStartLabel(view.module.state) : "Lihat prasyarat di Jalur"}
          </ButtonLink>

          {view.module.state === "completed" ? (
            <div className="compact-card p-4">
              <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-success" />
              <p className="mt-2 text-sm font-bold text-success">Modul selesai</p>
            </div>
          ) : null}
        </aside>
      </section>
    </div>
  );
}
