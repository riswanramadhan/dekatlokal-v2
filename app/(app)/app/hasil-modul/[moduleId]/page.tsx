import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, Circle, PartyPopper } from "lucide-react";
import { Badge, ButtonLink, Card, CardContent } from "@/components/ui";
import { getModuleResultView } from "@/domain/services/app-service";

export const metadata: Metadata = { title: "Hasil Modul" };

export default async function ModuleResultPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params;
  const view = await getModuleResultView(moduleId);
  if (!view) notFound();

  const gates = [
    {
      label: `Semua lesson (${view.completion.lessonsCompleted}/${view.completion.lessonsTotal})`,
      complete: view.completion.lessonsCompleted === view.completion.lessonsTotal,
    },
    { label: "Cek pemahaman dikuasai", complete: view.completion.assessmentPassed },
    {
      label: "Tugas usaha disetujui",
      complete: ["approved", "auto_approved"].includes(view.completion.taskStatus),
    },
  ];
  const nextHref =
    view.completion.lessonsCompleted < view.completion.lessonsTotal
      ? `/app/modul/${view.module.slug}/mulai`
      : !view.completion.assessmentPassed
        ? `/app/kuis/assessment-${view.module.slug}`
        : `/app/tugas/task-${view.module.slug}`;

  return (
    <div className="mx-auto max-w-[760px] space-y-5">
      <section className="space-y-2">
        <Badge>{view.completion.completed ? "Modul selesai" : "Progres modul"}</Badge>
        <h1 className="text-2xl font-bold text-text-primary md:text-3xl">{view.module.title}</h1>
        <p className="text-base leading-7 text-text-secondary">
          {view.completion.completed
            ? `Hasil belajar sudah diterapkan pada ${view.business.name} dan tersimpan sebagai Aset Usaha.`
            : "Menonton lesson saja belum menyelesaikan modul wajib. Kuasai materi dan terapkan pada usaha Anda."}
        </p>
      </section>

      {view.completion.completed ? (
        <div className="flex items-start gap-4 rounded-[var(--radius-lg)] bg-success-soft p-5 text-success">
          <PartyPopper aria-hidden="true" className="h-7 w-7 shrink-0" />
          <div>
            <p className="text-lg font-bold">Satu hasil usaha baru siap dipakai</p>
            <p className="mt-1 text-base leading-7">Aset ini dapat digunakan kembali untuk landing page dan Jejak Tumbuh.</p>
          </div>
        </div>
      ) : null}

      <Card>
        <CardContent className="space-y-4 p-5 md:p-7">
          <h2 className="text-lg font-bold text-text-primary">Syarat penyelesaian</h2>
          {gates.map((gate) => (
            <div className="flex min-h-12 items-center gap-3 rounded-2xl bg-surface-subtle p-4" key={gate.label}>
              {gate.complete ? (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-success text-white">
                  <Check aria-hidden="true" className="h-4 w-4" />
                </span>
              ) : (
                <Circle aria-hidden="true" className="h-7 w-7 text-text-muted" />
              )}
              <span className="font-semibold text-text-primary">{gate.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <ButtonLink className="w-full" href={view.completion.completed ? "/app/aset-usaha" : nextHref}>
        {view.completion.completed ? "Lihat Aset Usaha" : "Lanjutkan syarat berikutnya"}
      </ButtonLink>
    </div>
  );
}
