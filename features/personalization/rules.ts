import type {
  CheckupResult,
  InterventionPlan,
  LearningPreference,
  NextBestAction,
  PlanStep,
} from "@/domain/entities";

type ScoreBreakdown = NonNullable<NextBestAction["scoring"]>;

const stateWeight: Record<PlanStep["state"], number> = {
  active: 100,
  in_progress: 95,
  awaiting_evidence: 92,
  needs_retry: 90,
  awaiting_review: 70,
  available: 84,
  completed: 0,
  locked: 0,
};

function severityForStep(step: PlanStep, checkup: CheckupResult | null) {
  if (!checkup) {
    return 40;
  }

  const text = `${step.title} ${step.summary} ${step.reason}`.toLowerCase();
  const matchingPillar = checkup.pillarScores.find((pillar) => {
    const key = pillar.pillarKey.replace(/_/g, " ").toLowerCase();
    return text.includes(key) || text.includes(pillar.label.toLowerCase());
  });
  const lowestPillar = [...checkup.pillarScores].sort(
    (left, right) => left.score - right.score,
  )[0];
  const score = matchingPillar?.score ?? lowestPillar?.score ?? checkup.totalScore;

  return Math.max(0, 100 - score);
}

function impactForStep(step: PlanStep) {
  if (step.required && step.assetCreated) {
    return 92;
  }
  if (step.required) {
    return 82;
  }
  return 65;
}

function quickWinForStep(step: PlanStep) {
  if (step.estimatedMinutes <= 6) {
    return 96;
  }
  if (step.estimatedMinutes <= 10) {
    return 86;
  }
  if (step.estimatedMinutes <= 15) {
    return 72;
  }
  return 54;
}

function readinessForPreference(step: PlanStep, preference: LearningPreference) {
  const durationFit =
    step.estimatedMinutes <= preference.dailyMinutes
      ? 100
      : Math.max(40, 100 - (step.estimatedMinutes - preference.dailyMinutes) * 8);
  const modeFit =
    preference.digitalComfort === "fast" && step.state === "available"
      ? 85
      : preference.digitalComfort === "guided" && step.state === "in_progress"
        ? 96
        : 88;

  return Math.round((durationFit + modeFit) / 2);
}

function scoreStep(
  step: PlanStep,
  checkup: CheckupResult | null,
  preference: LearningPreference,
): ScoreBreakdown {
  const scoreSeverity = severityForStep(step, checkup);
  const dependency = stateWeight[step.state];
  const expectedImpact = impactForStep(step);
  const quickWin = quickWinForStep(step);
  const readiness = readinessForPreference(step, preference);
  const learningPreference =
    preference.preferredFormats.includes("mixed") || step.estimatedMinutes <= preference.dailyMinutes
      ? 90
      : 72;

  const total =
    scoreSeverity * 0.25 +
    dependency * 0.2 +
    expectedImpact * 0.2 +
    quickWin * 0.15 +
    readiness * 0.12 +
    learningPreference * 0.08;

  return {
    scoreSeverity: Math.round(scoreSeverity),
    dependency: Math.round(dependency),
    expectedImpact: Math.round(expectedImpact),
    quickWin: Math.round(quickWin),
    readiness: Math.round(readiness),
    learningPreference: Math.round(learningPreference),
    total: Math.round(total),
  };
}

export function personalizePlan(input: {
  plan: InterventionPlan;
  checkup: CheckupResult | null;
  learningPreference: LearningPreference;
}): InterventionPlan {
  const candidates = input.plan.steps
    .filter((step) => step.state !== "completed" && step.state !== "locked")
    .map((step) => ({
      step,
      scoring: scoreStep(step, input.checkup, input.learningPreference),
    }))
    .sort((left, right) => right.scoring.total - left.scoring.total);

  const winner = candidates[0];

  if (!winner) {
    return input.plan;
  }

  const lowestPillar = input.checkup
    ? [...input.checkup.pillarScores].sort((left, right) => left.score - right.score)[0]
    : undefined;

  return {
    ...input.plan,
    nextBestAction: {
      id: `nba-${winner.step.id}`,
      title: winner.step.title,
      description: winner.step.summary,
      rationale:
        winner.step.reason +
        (lowestPillar
          ? ` Ini diprioritaskan karena ${lowestPillar.label} masih ${lowestPillar.score}/100 dan dampaknya langsung terasa pada usaha.`
          : " Ini diprioritaskan karena menjadi langkah paling siap untuk dikerjakan sekarang."),
      estimatedMinutes: winner.step.estimatedMinutes,
      href: `/app/modul/${winner.step.moduleSlug}`,
      ctaLabel:
        winner.step.state === "awaiting_evidence"
          ? "Lengkapi Bukti"
          : winner.step.state === "needs_retry"
            ? "Perkuat Lagi"
            : winner.step.state === "available"
              ? "Mulai Langkah"
              : `Lanjutkan ${winner.step.estimatedMinutes} Menit`,
      progressLabel: `Langkah ${winner.step.position} dari ${input.plan.steps.length}`,
      scoring: winner.scoring,
    },
  };
}

