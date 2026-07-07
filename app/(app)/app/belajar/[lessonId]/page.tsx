import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonPlayer } from "@/components/learning/lesson-player";
import { StateBlock } from "@/components/ui";
import { getLessonView } from "@/domain/services/app-service";
import { createInitialLessonProgress } from "@/features/lesson/progress";

export const metadata: Metadata = { title: "Belajar" };

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const view = await getLessonView(lessonId);
  if (!view) notFound();

  if (view.blockedReason) {
    return (
      <StateBlock
        action={{ href: `/app/modul/${view.module.slug}`, label: "Kembali ke preview modul" }}
        description={view.blockedReason}
        kind="locked"
        title="Lesson belum dapat dibuka"
      />
    );
  }

  return (
    <LessonPlayer
      completionHref={view.completionHref}
      initialProgress={view.progress ?? createInitialLessonProgress(view.lesson)}
      lesson={view.lesson}
    />
  );
}
