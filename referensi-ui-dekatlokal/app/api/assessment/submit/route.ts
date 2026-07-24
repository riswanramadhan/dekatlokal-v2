import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { questionGroups, MANUAL_MAX_SCORE } from "@/components/assessment/data";
import type { Answers } from "@/components/assessment/types";
import {
  calculateCompensatedDigitalMaxScore,
  calculateManualAssessmentScore,
  ECOMMERCE_OTHER_TEXT_QUESTION_ID,
  roundScore,
  toPercent,
} from "@/features/digital-checkup/scoring";
import {
  createAssessmentResponse,
  markAssessmentScrapeFailure,
  updateAssessmentFinalScore,
} from "@/features/digital-checkup/server/persistence";
import { scrapeDigitalPresence } from "@/lib/scraping";
import {
  DIGITAL_PLATFORM_MAX_SCORES,
  GOOGLE_SCRAPING_ENABLED,
} from "@/lib/scraping/scoring";

interface SubmitPayload {
  answers: Answers;
}

// ── Max Score Strategy (Strict + System-Error Compensation) ────────────────
// - All scored manual questions (required + optional) always contribute to max score.
// - All enabled digital platforms always contribute to max score baseline.
// - If a user provides a scraping input and that platform fails due to SYSTEM
//   issues, that platform max is removed as compensation.

export async function POST(request: Request) {
  let payload: SubmitPayload;

  try {
    const text = await request.text();
    console.log("[API] Request body length:", text.length);

    if (!text || text.trim().length === 0) {
      console.error("[API] Empty request body");
      return NextResponse.json(
        { message: "Request body kosong." },
        { status: 400 }
      );
    }

    payload = JSON.parse(text) as SubmitPayload;
  } catch (error) {
    console.error("[API] Invalid JSON payload:", error);
    return NextResponse.json(
      { message: "Payload tidak valid." },
      { status: 400 }
    );
  }

  const answers = payload?.answers;
  if (!answers || typeof answers !== "object") {
    console.error("[API] No answers provided");
    return NextResponse.json({ message: "Jawaban tidak ditemukan." }, { status: 400 });
  }

  const umkmName = String(answers["umkm-name"] ?? "").trim();
  const ownerName = String(answers["owner-name"] ?? "").trim();
  const whatsapp = String(answers["whatsapp"] ?? "").trim();
  const email = String(answers["email"] ?? "").trim();

  if (!umkmName || !ownerName || !whatsapp || !email) {
    console.error("[API] Missing required fields");
    return NextResponse.json({ message: "Data identitas wajib diisi." }, { status: 400 });
  }

  const manualAssessment = calculateManualAssessmentScore(
    answers,
    questionGroups,
  );
  const ecommerceOtherText = String(answers[ECOMMERCE_OTHER_TEXT_QUESTION_ID] ?? "").trim();
  if (manualAssessment.hasEcommerceOther && !ecommerceOtherText) {
    return NextResponse.json(
      { message: "Detail platform e-commerce lainnya wajib diisi." },
      { status: 400 },
    );
  }

  const {
    answerRows,
    manualMaxScoreForResponse,
    theoreticalManualMaxScore,
  } = manualAssessment;
  let totalScore = manualAssessment.totalScore;

  // Validate source-data max score remains in sync with MANUAL_MAX_SCORE.
  if (theoreticalManualMaxScore !== MANUAL_MAX_SCORE) {
    console.warn(
      `[API] Manual max score mismatch! Expected: ${MANUAL_MAX_SCORE} (from data.ts), Calculated: ${theoreticalManualMaxScore}. ` +
      `This indicates scoring data inconsistency.`
    );
  }

  // Extract digitalization fields
  const instagramUsername = String(answers["instagram-username"] ?? "").trim() || null;
  const tiktokUsername = String(answers["tiktok-username"] ?? "").trim() || null;
  const googleBusinessUrl = String(answers["google-business-url"] ?? "").trim() || null;
  const effectiveGoogleBusinessUrl = GOOGLE_SCRAPING_ENABLED ? googleBusinessUrl : null;

  const digitalBaseMaxScoreForResponse =
    DIGITAL_PLATFORM_MAX_SCORES.instagram +
    DIGITAL_PLATFORM_MAX_SCORES.tiktok +
    (GOOGLE_SCRAPING_ENABLED ? DIGITAL_PLATFORM_MAX_SCORES.google : 0);

  let maxScore = roundScore(
    manualMaxScoreForResponse + digitalBaseMaxScoreForResponse,
  );

  const percentage = toPercent(totalScore, maxScore);

  console.log("[API] Score calculation:", { 
    totalScore, 
    manualMaxScoreForResponse,
    digitalBaseMaxScoreForResponse,
    maxScore,
    theoreticalManualMaxScore,
    configuredManualMax: MANUAL_MAX_SCORE,
    percentage 
  });
  console.log("[API] Answer rows:", answerRows.length);

  const hasDigitalPresence = Boolean(
    instagramUsername || tiktokUsername || effectiveGoogleBusinessUrl
  );

  try {
    console.log("[API] Creating response in database...");
    const response = await createAssessmentResponse({
      umkmName,
      ownerName,
      whatsapp,
      email,
      instagramUsername,
      tiktokUsername,
      googleBusinessUrl,
      totalScore,
      maxScore,
      percentage,
      hasDigitalPresence,
      answerRows,
    });

    console.log("[API] Response created successfully:", response.id);

    // Run scraping synchronously so results are available in the response
    let digitalPresence: {
      instagram: Awaited<ReturnType<typeof scrapeDigitalPresence>>["instagram"];
      tiktok: Awaited<ReturnType<typeof scrapeDigitalPresence>>["tiktok"];
      google: Awaited<ReturnType<typeof scrapeDigitalPresence>>["google"];
      scoring: Awaited<ReturnType<typeof scrapeDigitalPresence>>["scoring"];
      status: Awaited<ReturnType<typeof scrapeDigitalPresence>>["status"];
      maxScoreForResponse: number;
    } | null = null;

    let compensatedDigitalMaxScore = digitalBaseMaxScoreForResponse;

    if (hasDigitalPresence) {
      try {
        const scrapeResult = await scrapeDigitalPresence(response.id);

        compensatedDigitalMaxScore = calculateCompensatedDigitalMaxScore(
          digitalBaseMaxScoreForResponse,
          [
            {
              provided: Boolean(instagramUsername),
              maxScore: DIGITAL_PLATFORM_MAX_SCORES.instagram,
              state: scrapeResult.platforms.instagram,
            },
            {
              provided: Boolean(tiktokUsername),
              maxScore: DIGITAL_PLATFORM_MAX_SCORES.tiktok,
              state: scrapeResult.platforms.tiktok,
            },
            {
              provided: Boolean(effectiveGoogleBusinessUrl),
              maxScore: DIGITAL_PLATFORM_MAX_SCORES.google,
              state: scrapeResult.platforms.google,
            },
          ],
        );

        maxScore = roundScore(
          manualMaxScoreForResponse + compensatedDigitalMaxScore,
        );

        digitalPresence = {
          instagram: scrapeResult.instagram,
          tiktok: scrapeResult.tiktok,
          google: scrapeResult.google,
          scoring: scrapeResult.scoring,
          status: scrapeResult.status,
          maxScoreForResponse: compensatedDigitalMaxScore,
        };

        // Add digital scores to total after scraping.
        totalScore = roundScore(totalScore + scrapeResult.scoring.totalScore);

        if (scrapeResult.scoring.maxScore > digitalBaseMaxScoreForResponse) {
          console.warn(
            `[API] Digital max score exceeds expected! Expected base max for this response: ${digitalBaseMaxScoreForResponse}, ` +
            `Got: ${scrapeResult.scoring.maxScore}. This indicates scoring logic inconsistency.`
          );
        }
      } catch {
        console.error(
          "[API] Scraping failed; applying system-error compensation.",
        );

        // If orchestrator failed unexpectedly, compensate all user-provided
        // platforms because this is treated as a system-side failure.
        compensatedDigitalMaxScore = Math.max(
          0,
          digitalBaseMaxScoreForResponse -
            (instagramUsername ? DIGITAL_PLATFORM_MAX_SCORES.instagram : 0) -
            (tiktokUsername ? DIGITAL_PLATFORM_MAX_SCORES.tiktok : 0) -
            (effectiveGoogleBusinessUrl ? DIGITAL_PLATFORM_MAX_SCORES.google : 0),
        );
        maxScore = roundScore(
          manualMaxScoreForResponse + compensatedDigitalMaxScore,
        );

        digitalPresence = {
          instagram: null,
          tiktok: null,
          google: null,
          scoring: { items: [], totalScore: 0, maxScore: 0 },
          status: "failed",
          maxScoreForResponse: compensatedDigitalMaxScore,
        };

        await markAssessmentScrapeFailure(
          response.id,
          "Scraping orchestrator failed",
        ).catch(() => {});
      }
    }

    // Calculate final percentage with respondent-specific max score
    const finalPercentage = toPercent(totalScore, maxScore);

    console.log("[API] Final score:", { 
      totalScore, 
      maxScore,
      finalPercentage 
    });

    // Update database with final scores (including digital presence scores)
    // Always update when digital presence was attempted, even if scraping failed,
    // to ensure DB is consistent (scrapeDigitalPresence no longer modifies scores).
    if (hasDigitalPresence) {
      try {
        await updateAssessmentFinalScore(
          response.id,
          totalScore,
          maxScore,
          finalPercentage,
        );
        console.log("[API] Database updated with final scores");
      } catch {
        console.error("[API] Failed to update final scores");
      }
    }

    return NextResponse.json({
      id: response.id,
      totalScore,
      maxScore,
      percentage: finalPercentage,
      scoringVersion: response.scoringVersion,
      digitalPresence,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      console.error("[API] Duplicate assessment key");
      return NextResponse.json(
        { message: "Whatsapp atau email sudah terdaftar." },
        { status: 409 }
      );
    }

    console.error("[API] Database operation failed");
    return NextResponse.json({ message: "Gagal menyimpan checkup." }, { status: 500 });
  }
}
