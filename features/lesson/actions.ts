"use server";

import { z } from "zod";
import { advanceLessonProgress } from "@/features/lesson/progress";
import { getRepositoriesForRequest } from "@/domain/services/app-service";

const saveLessonInputSchema = z.object({
  lessonId: z.string(),
  screenIndex: z.number().int().min(0),
  responses: z.record(z.string(), z.union([z.string(), z.array(z.string())])).default({}),
  completeScreen: z.boolean().default(true),
});

export async function saveLessonScreen(input: {
  lessonId: string;
  screenIndex: number;
  responses?: Record<string, string | string[]>;
  completeScreen?: boolean;
}) {
  const parsed = saveLessonInputSchema.parse(input);
  const repositories = await getRepositoriesForRequest();
  const lesson = await repositories.learning.getLesson(parsed.lessonId);

  if (!lesson) {
    return { status: "error" as const, message: "Lesson tidak ditemukan." };
  }

  const previous = await repositories.learning.getLessonProgress(lesson.id);
  const progress = advanceLessonProgress({
    lesson,
    previous,
    screenIndex: parsed.screenIndex,
    responses: parsed.responses,
    completeScreen: parsed.completeScreen,
  });
  await repositories.learning.saveLessonProgress(progress);

  const nextHref =
    progress.status !== "completed"
      ? null
      : lesson.nextLessonId
        ? `/app/belajar/${lesson.nextLessonId}`
        : `/app/kuis/${lesson.assessmentId}`;

  return { status: "saved" as const, progress, nextHref };
}
