import { describe, expect, it } from "vitest";
import {
  decodeLearningSession,
  encodeLearningSession,
  emptyLearningSession,
} from "@/infrastructure/storage/learning-session-codec";

describe("mock learning session codec", () => {
  it("persists lesson position and task draft through a cookie-safe adapter", () => {
    const encoded = encodeLearningSession({
      ...emptyLearningSession,
      lessonProgress: {
        "lesson-one": {
          lessonId: "lesson-one",
          moduleId: "module-one",
          currentScreen: 2,
          completedScreenIds: ["screen-one", "screen-two"],
          responses: { choice: "clear" },
          status: "in_progress",
          syncState: "synced",
          updatedAt: "2026-07-06T08:00:00.000Z",
        },
      },
      taskDrafts: {
        "task-one": {
          taskId: "task-one",
          text: "Draft usaha tetap aman.",
          link: "",
          imageName: "bukti.jpg",
          checklist: ["Data benar"],
          status: "draft",
          syncState: "synced",
          updatedAt: "2026-07-06T08:00:00.000Z",
        },
      },
    });

    const decoded = decodeLearningSession(encoded);
    expect(decoded.lessonProgress["lesson-one"].currentScreen).toBe(2);
    expect(decoded.taskDrafts["task-one"].imageName).toBe("bukti.jpg");
  });
});
