import "server-only";

import { cookies } from "next/headers";
import type {
  AssessmentResult,
  BusinessAsset,
  EvidenceDraft,
  LessonProgress,
} from "@/domain/entities";
import {
  decodeLearningSession,
  encodeLearningSession,
  type MockLearningSession,
} from "@/infrastructure/storage/learning-session-codec";

const PROGRESS_COOKIE = "dekatlokal_mock_progress";
const ASSESSMENT_COOKIE = "dekatlokal_mock_assessment";
const TASK_COOKIE = "dekatlokal_mock_task";

export async function getMockLearningSession(): Promise<MockLearningSession> {
  const cookieStore = await cookies();
  const progress = decodeLearningSession(cookieStore.get(PROGRESS_COOKIE)?.value);
  const assessment = decodeLearningSession(
    cookieStore.get(ASSESSMENT_COOKIE)?.value,
  );
  const task = decodeLearningSession(cookieStore.get(TASK_COOKIE)?.value);
  return {
    lessonProgress: progress.lessonProgress,
    assessmentResults: assessment.assessmentResults,
    taskDrafts: task.taskDrafts,
    assets: task.assets,
    uploadAttempts: task.uploadAttempts,
  };
}

async function writeLearningSession(name: string, session: MockLearningSession) {
  const cookieStore = await cookies();
  cookieStore.set(name, encodeLearningSession(session), {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
}

export async function persistLessonProgress(progress: LessonProgress) {
  const session = await getMockLearningSession();
  await writeLearningSession(PROGRESS_COOKIE, {
    lessonProgress: { ...session.lessonProgress, [progress.lessonId]: progress },
    assessmentResults: {},
    taskDrafts: {},
    assets: [],
    uploadAttempts: {},
  });
  return progress;
}

export async function persistAssessmentResult(result: AssessmentResult) {
  const session = await getMockLearningSession();
  await writeLearningSession(ASSESSMENT_COOKIE, {
    lessonProgress: {},
    assessmentResults: {
      ...session.assessmentResults,
      [result.assessmentId]: [result],
    },
    taskDrafts: {},
    assets: [],
    uploadAttempts: {},
  });
  return result;
}

export async function persistTaskDraft(
  draft: EvidenceDraft,
  uploadAttempt?: { taskId: string; attempts: number },
) {
  const session = await getMockLearningSession();
  await writeLearningSession(TASK_COOKIE, {
    lessonProgress: {},
    assessmentResults: {},
    taskDrafts: { ...session.taskDrafts, [draft.taskId]: draft },
    assets: session.assets,
    uploadAttempts: uploadAttempt
      ? {
          ...session.uploadAttempts,
          [uploadAttempt.taskId]: uploadAttempt.attempts,
        }
      : session.uploadAttempts,
  });
  return draft;
}

export async function persistTaskAndAsset(
  draft: EvidenceDraft,
  asset: BusinessAsset,
) {
  const session = await getMockLearningSession();
  const assets = [
    ...session.assets.filter((item) => item.id !== asset.id),
    asset,
  ];
  await writeLearningSession(TASK_COOKIE, {
    lessonProgress: {},
    assessmentResults: {},
    taskDrafts: { ...session.taskDrafts, [draft.taskId]: draft },
    assets,
    uploadAttempts: session.uploadAttempts,
  });
  return draft;
}

export async function incrementUploadAttempt(taskId: string) {
  const session = await getMockLearningSession();
  const attempts = (session.uploadAttempts[taskId] ?? 0) + 1;
  await writeLearningSession(TASK_COOKIE, {
    lessonProgress: {},
    assessmentResults: {},
    taskDrafts: session.taskDrafts,
    assets: session.assets,
    uploadAttempts: { ...session.uploadAttempts, [taskId]: attempts },
  });
  return attempts;
}
