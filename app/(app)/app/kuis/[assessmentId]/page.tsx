import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AssessmentRunner } from "@/components/assessment/assessment-runner";
import { StateBlock } from "@/components/ui";
import { getAssessmentView } from "@/domain/services/app-service";

export const metadata: Metadata = { title: "Cek Pemahaman" };

export default async function AssessmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ assessmentId: string }>;
  searchParams: Promise<{ retry?: string }>;
}) {
  const [{ assessmentId }, query] = await Promise.all([params, searchParams]);
  const view = await getAssessmentView(assessmentId);
  if (!view) notFound();

  if (view.blockedReason) {
    return (
      <StateBlock
        action={{ href: `/app/modul/${view.module.slug}`, label: "Kembali ke modul" }}
        description={view.blockedReason}
        kind="locked"
        title="Cek pemahaman belum terbuka"
      />
    );
  }

  const wantsTargetedRetry = query.retry === "targeted";
  const hasFailedResult = Boolean(
    view.latestResult && !view.latestResult.passed,
  );
  if (wantsTargetedRetry && hasFailedResult && !view.correctionReady) {
    return (
      <StateBlock
        action={{
          href: view.pendingCorrectiveLessonId
            ? `/app/belajar/${view.pendingCorrectiveLessonId}`
            : `/app/modul/${view.module.slug}`,
          label: "Buka materi penguatan",
        }}
        description="Selesaikan materi penguatan yang diberikan agar coba ulang hanya berisi topik yang perlu diperkuat."
        kind="locked"
        title="Materi penguatan belum selesai"
      />
    );
  }

  const targeted =
    (wantsTargetedRetry && hasFailedResult) ||
    Boolean(hasFailedResult && view.correctionReady);

  return (
    <AssessmentRunner
      assessment={view.assessment}
      initialResult={view.latestResult}
      targeted={targeted}
    />
  );
}
