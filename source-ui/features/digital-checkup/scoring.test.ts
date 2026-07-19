import assert from "node:assert/strict";
import test from "node:test";

import { questionGroups, MANUAL_MAX_SCORE } from "../../components/assessment/data";
import type {
  Answers,
  Question,
} from "../../components/assessment/types";
import {
  calculateCompensatedDigitalMaxScore,
  calculateGroupScores,
  calculateManualAssessmentScore,
  getQuestionMaxScore,
  getQuestionScore,
  getSanitizedMultipleValues,
  normalizeAnswerValue,
  toPercent,
} from "./scoring";
import {
  buildCategoryBreakdown,
  getBarColor,
  getRecommendations,
  getResultCtaConfig,
  getScoreCategory,
  type CategoryItem,
} from "./results";
import { DIGITAL_MAX_SCORE } from "../../lib/scraping/scoring";

const MAX_MANUAL_ANSWERS: Answers = {
  nib: "yes",
  "product-active": "yes",
  "product-price-clear": "yes",
  "product-stock-system": "ready-stock",
  "brand-name": "yes",
  "brand-logo": "yes",
  "brand-visual-consistency": "yes",
  "gb-manual-registered": "yes",
  "gb-manual-reviews": "yes",
  "gb-manual-rating": "above-4",
  facebook: "yes",
  "whatsapp-business": "yes",
  "e-commerce-platform": [
    "shopee",
    "tokopedia",
    "bukalapak",
    "lazada",
    "blibli",
    "tiktok_shop",
    "e-commerce-lainnya",
  ],
  "e-commerce-platform-other": "Website sendiri",
  "social-media-activity": "active",
  "social-media-consistency": "regular",
  "payment-method": "qris-transfer",
  "order-delivery": "yes",
  "order-channel": "whatsapp",
  "manage-website": "yes",
  "update-information": "yes",
  "learn-and-grow": "yes",
};

const LOWEST_VALID_MANUAL_ANSWERS: Answers = {
  nib: "no",
  "product-active": "no",
  "product-price-clear": "no",
  "product-stock-system": "ready-stock",
  "brand-name": "no",
  "brand-logo": "no",
  "brand-visual-consistency": "no",
  "gb-manual-registered": "no",
  "gb-manual-reviews": "no",
  "gb-manual-rating": "unknown",
  facebook: "no",
  "whatsapp-business": "no",
  "social-media-activity": "inactive",
  "social-media-consistency": "never",
  "payment-method": "cash",
  "order-delivery": "no",
  "order-channel": "in-store",
  "manage-website": "no",
  "update-information": "no",
  "learn-and-grow": "no",
};

function getQuestion(questionId: string): Question {
  const question = questionGroups
    .flatMap((group) => group.questions)
    .find((candidate) => candidate.id === questionId);

  assert.ok(question, `Question ${questionId} must exist`);
  return question;
}

test("manual scoring keeps the production 23.5 strict denominator", () => {
  const maximum = calculateManualAssessmentScore(
    MAX_MANUAL_ANSWERS,
    questionGroups,
  );
  const empty = calculateManualAssessmentScore({}, questionGroups);
  const lowest = calculateManualAssessmentScore(
    LOWEST_VALID_MANUAL_ANSWERS,
    questionGroups,
  );

  assert.equal(MANUAL_MAX_SCORE, 23.5);
  assert.equal(DIGITAL_MAX_SCORE, 9);
  assert.equal(MANUAL_MAX_SCORE + DIGITAL_MAX_SCORE, 32.5);
  assert.deepEqual(
    {
      earned: maximum.totalScore,
      max: maximum.manualMaxScoreForResponse,
      theoreticalMax: maximum.theoreticalManualMaxScore,
    },
    { earned: 23.5, max: 23.5, theoreticalMax: 23.5 },
  );
  assert.deepEqual(
    { earned: empty.totalScore, max: empty.manualMaxScoreForResponse },
    { earned: 0, max: 23.5 },
  );
  assert.deepEqual(
    { earned: lowest.totalScore, max: lowest.manualMaxScoreForResponse },
    { earned: 1.1, max: 23.5 },
  );
});

test("manual max per group stays aligned with the production question config", () => {
  const groupMax = Object.fromEntries(
    questionGroups.map((group) => [
      group.id,
      calculateGroupScores([group.id], questionGroups, {}).max,
    ]),
  );

  assert.deepEqual(groupMax, {
    identity: 0,
    legality: 1,
    product: 3,
    branding: 3,
    digitalization: 8.5,
    consistency: 2,
    operations: 3,
    commitment: 3,
  });
});

test("optional e-commerce remains in the denominator when unanswered", () => {
  const answers = { ...MAX_MANUAL_ANSWERS };
  delete answers["e-commerce-platform"];
  delete answers["e-commerce-platform-other"];

  const result = calculateManualAssessmentScore(answers, questionGroups);

  assert.deepEqual(
    { earned: result.totalScore, max: result.manualMaxScoreForResponse },
    { earned: 20, max: 23.5 },
  );
  assert.equal(toPercent(20, 32.5), 62);
});

test("multiple-choice normalization removes duplicates and invalid options", () => {
  const question = getQuestion("e-commerce-platform");
  const answer = ["tokopedia", "shopee", "tokopedia", "invalid-option"];

  assert.deepEqual(getSanitizedMultipleValues(question, answer), [
    "tokopedia",
    "shopee",
  ]);
  assert.equal(
    normalizeAnswerValue(question, answer),
    '["tokopedia","shopee"]',
  );
  assert.equal(getQuestionScore(question, answer), 1);
  assert.equal(getQuestionMaxScore(question), 3.5);

  const result = calculateManualAssessmentScore(
    { "e-commerce-platform": answer },
    questionGroups,
  );
  assert.deepEqual(
    { earned: result.totalScore, max: result.manualMaxScoreForResponse },
    { earned: 1, max: 23.5 },
  );
});

test("multiple-choice keeps the existing single-string compatibility", () => {
  const question = getQuestion("e-commerce-platform");

  assert.deepEqual(getSanitizedMultipleValues(question, "shopee"), ["shopee"]);
  assert.equal(normalizeAnswerValue(question, "shopee"), '["shopee"]');
  assert.equal(getQuestionScore(question, "shopee"), 0.5);
});

test("invalid single choices are ignored and decimal scores are rounded", () => {
  const nibQuestion = getQuestion("nib");
  const result = calculateManualAssessmentScore(
    {
      nib: "invalid-option",
      "payment-method": "cash",
      "order-channel": "in-store",
    },
    questionGroups,
  );

  assert.equal(normalizeAnswerValue(nibQuestion, "invalid-option"), null);
  assert.equal(getQuestionScore(nibQuestion, "invalid-option"), 0);
  assert.equal(result.totalScore, 0.6);
  assert.equal(result.manualMaxScoreForResponse, 23.5);
});

test("conditional e-commerce detail is trimmed without changing its score", () => {
  const result = calculateManualAssessmentScore(
    {
      "e-commerce-platform": ["e-commerce-lainnya"],
      "e-commerce-platform-other": "  Shopify  ",
    },
    questionGroups,
  );
  const detailRow = result.answerRows.find(
    (row) => row.questionId === "e-commerce-platform-other",
  );

  assert.equal(result.hasEcommerceOther, true);
  assert.equal(result.totalScore, 0.5);
  assert.equal(detailRow?.choice, "Shopify");
});

test("answer rows preserve the persistence contract for dedicated and zero-score fields", () => {
  const result = calculateManualAssessmentScore(
    {
      ...MAX_MANUAL_ANSWERS,
      "umkm-name": "Toko Uji",
      "owner-name": "Pemilik Uji",
      whatsapp: "081234567890",
      email: "test@example.com",
      "instagram-username": "tokouji",
      "tiktok-username": "tokouji",
      "google-business-url": "https://maps.app.goo.gl/example",
    },
    questionGroups,
  );
  const dedicatedFields = new Set([
    "umkm-name",
    "owner-name",
    "whatsapp",
    "email",
    "instagram-username",
    "tiktok-username",
    "google-business-url",
  ]);
  const ecommerceRow = result.answerRows.find(
    (row) => row.questionId === "e-commerce-platform",
  );

  assert.equal(result.answerRows.length, 22);
  assert.equal(
    result.answerRows.some((row) => dedicatedFields.has(row.questionId)),
    false,
  );
  assert.equal(
    ecommerceRow?.choice,
    '["shopee","tokopedia","bukalapak","lazada","blibli","tiktok_shop","e-commerce-lainnya"]',
  );

  const zeroScoreRows = calculateManualAssessmentScore(
    LOWEST_VALID_MANUAL_ANSWERS,
    questionGroups,
  ).answerRows;
  assert.equal(
    zeroScoreRows.some((row) => row.questionId === "nib" && row.score === 0),
    true,
  );
});

test("digital denominator compensates only requested system failures", () => {
  const systemFailure = {
    requested: true,
    success: false,
    errorType: "system",
  } as const;
  const userFailure = {
    requested: true,
    success: false,
    errorType: "user",
  } as const;

  assert.equal(
    calculateCompensatedDigitalMaxScore(9, [
      { provided: true, maxScore: 5, state: systemFailure },
      { provided: false, maxScore: 4, state: systemFailure },
    ]),
    4,
  );
  assert.equal(
    calculateCompensatedDigitalMaxScore(9, [
      { provided: true, maxScore: 5, state: userFailure },
      { provided: true, maxScore: 4, state: systemFailure },
    ]),
    5,
  );
  assert.equal(
    calculateCompensatedDigitalMaxScore(9, [
      { provided: true, maxScore: 5, state: systemFailure },
      { provided: true, maxScore: 4, state: systemFailure },
    ]),
    0,
  );
});

test("compensated final outcomes retain their production percentages", () => {
  assert.equal(toPercent(23.5, 32.5), 72);
  assert.equal(toPercent(23.5, 27.5), 85);
  assert.equal(toPercent(23.5, 28.5), 82);
  assert.equal(toPercent(23.5, 23.5), 100);

  const categories = buildCategoryBreakdown(
    questionGroups,
    MAX_MANUAL_ANSWERS,
    0,
    0,
  );
  const digitalCategory = categories.find(
    (category) => category.id === "digital-presence",
  );
  const recommendations = getRecommendations(categories);

  assert.deepEqual(
    digitalCategory && {
      earned: digitalCategory.earned,
      max: digitalCategory.max,
      percent: digitalCategory.percent,
    },
    { earned: 0, max: 0, percent: 0 },
  );
  assert.deepEqual(
    recommendations.map(({ title, percent, priority }) => ({
      title,
      percent,
      priority,
    })),
    [{ title: "Jejak Digital", percent: 0, priority: "high" }],
  );
});

test("score categories, bars, and CTA keep their exact boundaries", () => {
  const cases: Array<[number, string]> = [
    [-1, "Perlu Persiapan"],
    [0, "Perlu Persiapan"],
    [39.9, "Perlu Persiapan"],
    [40, "Cukup Siap"],
    [59.9, "Cukup Siap"],
    [60, "Siap"],
    [79.9, "Siap"],
    [80, "Sangat Siap"],
    [100, "Sangat Siap"],
  ];

  for (const [score, label] of cases) {
    assert.equal(getScoreCategory(score).label, label);
  }

  assert.equal(getBarColor(59), "bg-warning");
  assert.equal(getBarColor(60), "bg-primary");
  assert.equal(getBarColor(80), "bg-success");
  assert.equal(getResultCtaConfig(59, "Toko").isReady, false);
  assert.equal(getResultCtaConfig(60, "Toko").isReady, true);
});

test("recommendations filter, sort, and prioritize exactly as before", () => {
  const category = (id: string, percent: number): CategoryItem => ({
    id,
    label: id,
    percent,
    earned: 0,
    max: 1,
    icon: "test",
  });
  const recommendations = getRecommendations([
    category("operations", 60),
    category("consistency", 59),
    category("branding", 30),
    category("product", 29),
    category("legality", 0),
    category("unknown", 0),
  ]);

  assert.deepEqual(
    recommendations.map(({ title, icon, percent, priority }) => ({
      title,
      icon,
      percent,
      priority,
    })),
    [
      {
        title: "Persiapan Produk",
        icon: "mdi:package-variant",
        percent: 29,
        priority: "high",
      },
      {
        title: "Identitas Brand",
        icon: "mdi:palette-outline",
        percent: 30,
        priority: "medium",
      },
      {
        title: "Konsistensi Digital",
        icon: "mdi:chart-timeline-variant",
        percent: 59,
        priority: "medium",
      },
    ],
  );
});

test("full manual score without digital profiles keeps the 72/Siap result", () => {
  const manual = calculateManualAssessmentScore(
    MAX_MANUAL_ANSWERS,
    questionGroups,
  );
  const categories = buildCategoryBreakdown(
    questionGroups,
    MAX_MANUAL_ANSWERS,
    0,
    DIGITAL_MAX_SCORE,
  );
  const recommendations = getRecommendations(categories);
  const percentage = toPercent(
    manual.totalScore,
    manual.manualMaxScoreForResponse + DIGITAL_MAX_SCORE,
  );

  assert.equal(percentage, 72);
  assert.equal(getScoreCategory(percentage).label, "Siap");
  assert.deepEqual(
    recommendations.map(({ title, percent, priority }) => ({
      title,
      percent,
      priority,
    })),
    [{ title: "Jejak Digital", percent: 0, priority: "high" }],
  );
});
