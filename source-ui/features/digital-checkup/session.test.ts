import assert from "node:assert/strict";
import test from "node:test";

import type {
  AssessmentResponse,
  AssessmentStep,
} from "@/components/assessment/types";
import {
  ASSESSMENT_SESSION_KEY,
  ASSESSMENT_SESSION_TTL_MS,
  createAssessmentSessionSnapshot,
  parseAssessmentSessionSnapshot,
} from "./session";

const NOW = 1_800_000_000_000;
const FUTURE_CLOCK_SKEW_MS = 5 * 60 * 1000;

const RESULT: AssessmentResponse = {
  id: 42,
  totalScore: 23.5,
  maxScore: 32.5,
  percentage: 72,
  scoringVersion: "v1",
  digitalPresence: null,
};

function createSnapshot(
  currentStep: AssessmentStep = "questions",
  responseData: AssessmentResponse | null = null,
  now = NOW,
) {
  return createAssessmentSessionSnapshot({
    currentStep,
    currentGroupIndex: 3,
    answers: {
      "umkm-name": "Toko Uji",
      "e-commerce-platform": ["shopee", "tokopedia"],
    },
    consentChecked: true,
    termsChecked: true,
    responseData,
    unlockedGroups: [3, 0, 2, 2, 1],
    touchedQuestions: ["umkm-name", "email", "umkm-name"],
    now,
  });
}

test("session metadata and snapshot normalization remain stable", () => {
  const snapshot = createSnapshot();

  assert.equal(ASSESSMENT_SESSION_KEY, "dekatlokal:digital-checkup-session:v1");
  assert.equal(ASSESSMENT_SESSION_TTL_MS, 2 * 60 * 60 * 1000);
  assert.equal(snapshot.version, 1);
  assert.equal(snapshot.savedAt, NOW);
  assert.deepEqual(snapshot.unlockedGroups, [0, 1, 2, 3]);
  assert.deepEqual(snapshot.touchedQuestions, ["umkm-name", "email"]);
});

test("calculating snapshots without a response restore as questions", () => {
  const snapshot = createSnapshot("calculating");

  assert.equal(snapshot.currentStep, "questions");
  assert.equal(snapshot.currentGroupIndex, 3);
  assert.equal(snapshot.responseData, null);
  assert.deepEqual(snapshot.answers["e-commerce-platform"], [
    "shopee",
    "tokopedia",
  ]);
});

test("calculating snapshots retain a successful response for refresh", () => {
  const snapshot = createSnapshot("calculating", RESULT);

  assert.equal(snapshot.currentStep, "results");
  assert.deepEqual(snapshot.responseData, RESULT);
});

test("results snapshots preserve the validated API response contract", () => {
  const snapshot = createSnapshot("results", RESULT);
  const restored = parseAssessmentSessionSnapshot(
    JSON.stringify(snapshot),
    NOW,
  );

  assert.deepEqual(restored, snapshot);
  assert.deepEqual(restored?.responseData, RESULT);
  assert.equal(restored?.currentStep, "results");
});

test("non-result snapshots discard stale response data", () => {
  for (const step of ["welcome", "questions"] as const) {
    assert.equal(createSnapshot(step, RESULT).responseData, null);
  }
});

test("session TTL and future clock skew use inclusive boundaries", () => {
  const serialized = JSON.stringify(createSnapshot());

  assert.ok(
    parseAssessmentSessionSnapshot(serialized, NOW + ASSESSMENT_SESSION_TTL_MS),
  );
  assert.equal(
    parseAssessmentSessionSnapshot(
      serialized,
      NOW + ASSESSMENT_SESSION_TTL_MS + 1,
    ),
    null,
  );

  const exactFuture = JSON.stringify(
    createSnapshot("questions", null, NOW + FUTURE_CLOCK_SKEW_MS),
  );
  const excessiveFuture = JSON.stringify(
    createSnapshot("questions", null, NOW + FUTURE_CLOCK_SKEW_MS + 1),
  );

  assert.ok(parseAssessmentSessionSnapshot(exactFuture, NOW));
  assert.equal(parseAssessmentSessionSnapshot(excessiveFuture, NOW), null);
});

test("missing, malformed, and structurally invalid sessions are rejected", () => {
  const valid = createSnapshot("results", RESULT);
  const invalidValues: unknown[] = [
    null,
    [],
    { ...valid, version: 2 },
    { ...valid, savedAt: "now" },
    { ...valid, currentStep: "calculating" },
    { ...valid, currentGroupIndex: -1 },
    { ...valid, currentGroupIndex: 1.5 },
    { ...valid, answers: { score: 1 } },
    { ...valid, consentChecked: "yes" },
    { ...valid, termsChecked: null },
    { ...valid, unlockedGroups: [0, -1] },
    { ...valid, touchedQuestions: ["name", 2] },
    { ...valid, responseData: null },
    { ...valid, responseData: { ...RESULT, id: 0 } },
    { ...valid, responseData: { ...RESULT, percentage: "72" } },
    { ...valid, responseData: { ...RESULT, digitalPresence: [] } },
  ];

  assert.equal(parseAssessmentSessionSnapshot(null, NOW), null);
  assert.equal(parseAssessmentSessionSnapshot("", NOW), null);
  assert.equal(parseAssessmentSessionSnapshot("{invalid", NOW), null);

  for (const value of invalidValues) {
    assert.equal(
      parseAssessmentSessionSnapshot(JSON.stringify(value), NOW),
      null,
    );
  }
});
