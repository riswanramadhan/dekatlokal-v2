import type { Lesson, LessonProgress } from "@/domain/entities";
import { lessonProgressSchema } from "@/domain/schemas";

export function advanceLessonProgress({
  lesson,
  previous,
  screenIndex,
  responses = {},
  completeScreen = true,
}: {
  lesson: Lesson;
  previous: LessonProgress | null;
  screenIndex: number;
  responses?: Record<string, string | string[]>;
  completeScreen?: boolean;
}): LessonProgress {
  const safeIndex = Math.min(Math.max(screenIndex, 0), lesson.screens.length - 1);
  const screen = lesson.screens[safeIndex];
  const completedScreenIds = Array.from(
    new Set([
      ...(previous?.completedScreenIds ?? []),
      ...(completeScreen ? [screen.id] : []),
    ]),
  );
  const completed = completedScreenIds.length === lesson.screens.length;

  return lessonProgressSchema.parse({
    lessonId: lesson.id,
    moduleId: lesson.moduleId,
    currentScreen: completed
      ? safeIndex
      : completeScreen
        ? Math.min(safeIndex + 1, lesson.screens.length - 1)
        : safeIndex,
    completedScreenIds,
    responses: { ...(previous?.responses ?? {}), ...responses },
    status: completed ? "completed" : "in_progress",
    syncState: "synced",
    updatedAt: new Date().toISOString(),
  });
}

export function createInitialLessonProgress(lesson: Lesson): LessonProgress {
  return lessonProgressSchema.parse({
    lessonId: lesson.id,
    moduleId: lesson.moduleId,
    currentScreen: 0,
    completedScreenIds: [],
    responses: {},
    status: "not_started",
    syncState: "synced",
    updatedAt: new Date().toISOString(),
  });
}
