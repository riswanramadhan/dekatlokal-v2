import "server-only";

import prisma from "@/lib/prisma";
import type { AssessmentAnswerRow } from "../scoring";

interface CreateAssessmentResponseInput {
  umkmName: string;
  ownerName: string;
  whatsapp: string;
  email: string;
  instagramUsername: string | null;
  tiktokUsername: string | null;
  googleBusinessUrl: string | null;
  totalScore: number;
  maxScore: number;
  percentage: number;
  hasDigitalPresence: boolean;
  answerRows: AssessmentAnswerRow[];
}

export function createAssessmentResponse(input: CreateAssessmentResponseInput) {
  return prisma.response.create({
    data: {
      umkmName: input.umkmName,
      ownerName: input.ownerName,
      whatsapp: input.whatsapp,
      email: input.email,
      instagramUsername: input.instagramUsername,
      tiktokUsername: input.tiktokUsername,
      googleBusinessUrl: input.googleBusinessUrl,
      totalScore: input.totalScore,
      maxScore: input.maxScore,
      percentage: input.percentage,
      scoringVersion: "v1",
      scrapeStatus: input.hasDigitalPresence ? "pending" : null,
      answers: {
        create: input.answerRows,
      },
    },
  });
}

export function markAssessmentScrapeFailure(
  responseId: number,
  scrapeError: string,
) {
  return prisma.response.update({
    where: { id: responseId },
    data: {
      scrapeStatus: "failed",
      scrapeError,
    },
  });
}

export function updateAssessmentFinalScore(
  responseId: number,
  totalScore: number,
  maxScore: number,
  percentage: number,
) {
  return prisma.response.update({
    where: { id: responseId },
    data: {
      totalScore,
      maxScore,
      percentage,
    },
  });
}

export function markAssessmentWhatsappClick(responseId: number) {
  return prisma.response.update({
    where: { id: responseId },
    data: { hasClickedWhatsapp: true },
  });
}
