import { z } from "zod";
import {
  assessmentResultSchema,
  businessAssetSchema,
  evidenceDraftSchema,
  lessonProgressSchema,
} from "@/domain/schemas";

export const mockLearningSessionSchema = z.object({
  lessonProgress: z.record(z.string(), lessonProgressSchema).default({}),
  assessmentResults: z.record(z.string(), z.array(assessmentResultSchema)).default({}),
  taskDrafts: z.record(z.string(), evidenceDraftSchema).default({}),
  assets: z.array(businessAssetSchema).default([]),
  uploadAttempts: z.record(z.string(), z.number().int().min(0)).default({}),
});

export type MockLearningSession = z.infer<typeof mockLearningSessionSchema>;

export const emptyLearningSession: MockLearningSession = {
  lessonProgress: {},
  assessmentResults: {},
  taskDrafts: {},
  assets: [],
  uploadAttempts: {},
};

export function encodeLearningSession(session: MockLearningSession): string {
  return encodeURIComponent(JSON.stringify(mockLearningSessionSchema.parse(session)));
}

export function decodeLearningSession(value: string | undefined): MockLearningSession {
  if (!value) {
    return emptyLearningSession;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as unknown;
    return mockLearningSessionSchema.parse(parsed);
  } catch {
    return emptyLearningSession;
  }
}
