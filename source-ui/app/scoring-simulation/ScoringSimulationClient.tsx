"use client";

import { useMemo, useState } from "react";
import { questionGroups } from "@/components/assessment/data";
import { GOOGLE_SCRAPING_ENABLED } from "@/lib/scraping/scoring";

type ScoredQuestionType = "single" | "multiple";
type ScrapeStatus = "not_requested" | "success" | "user_error" | "system_error";
type RequestedScrapeStatus = Exclude<ScrapeStatus, "not_requested">;

type PlatformKey = "instagram" | "tiktok" | "google";

const ECOMMERCE_PLATFORM_QUESTION_ID = "e-commerce-platform";
const ECOMMERCE_OTHER_OPTION_ID = "e-commerce-lainnya";

interface ManualOptionState {
  id: string;
  label: string;
  weight: number;
  defaultWeight: number;
}

interface ManualQuestionState {
  id: string;
  groupId: string;
  groupTitle: string;
  question: string;
  type: ScoredQuestionType;
  required: boolean;
  options: ManualOptionState[];
  selected: string[];
}

interface DigitalRuleState {
  id: string;
  label: string;
  weight: number;
  defaultWeight: number;
  met: boolean;
}

interface PlatformState {
  key: PlatformKey;
  label: string;
  enabled: boolean;
  provided: boolean;
  status: ScrapeStatus;
  rules: DigitalRuleState[];
}

interface TotalMetrics {
  earned: number;
  max: number;
  percentage: number;
}

const NUMBER = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 1,
});

const DIGITAL_RULE_DEFAULTS: Record<PlatformKey, Array<{ id: string; label: string; weight: number }>> = {
  instagram: [
    { id: "ig-exists", label: "Akun Instagram aktif", weight: 1 },
    { id: "ig-followers", label: "Followers >= 100", weight: 1 },
    { id: "ig-posts", label: "Postingan >= 5", weight: 1 },
    { id: "ig-bio", label: "Bio profil terisi", weight: 1 },
    { id: "ig-business", label: "Akun bisnis/profesional", weight: 1 },
  ],
  tiktok: [
    { id: "tt-exists", label: "Akun TikTok aktif", weight: 1 },
    { id: "tt-followers", label: "Followers >= 100", weight: 1 },
    { id: "tt-videos", label: "Video >= 3", weight: 1 },
    { id: "tt-likes", label: "Total likes >= 50", weight: 1 },
  ],
  google: [
    { id: "gb-exists", label: "Terdaftar di Google Maps", weight: 1 },
    { id: "gb-reviews", label: "Memiliki ulasan pelanggan", weight: 1 },
    { id: "gb-rating", label: "Rating >= 4.0", weight: 1 },
    { id: "gb-website", label: "Memiliki website di profil", weight: 1 },
  ],
};

function toOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function clampWeight(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return toOneDecimal(Math.max(0, value));
}

function calculatePercentage(earned: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((earned / max) * 100)));
}

function format(value: number): string {
  return NUMBER.format(toOneDecimal(value));
}

function isExistsRule(ruleId: string): boolean {
  return ruleId.endsWith("-exists");
}

function applyRulesForStatus(
  rules: DigitalRuleState[],
  status: ScrapeStatus,
  resetNonExistsOnSuccess: boolean,
): DigitalRuleState[] {
  if (status !== "success") {
    return rules.map((rule) => ({ ...rule, met: false }));
  }

  return rules.map((rule) => {
    if (isExistsRule(rule.id)) {
      // In real scoring, successful scraping always awards the "exists" rule.
      return { ...rule, met: true };
    }

    return {
      ...rule,
      met: resetNonExistsOnSuccess ? false : rule.met,
    };
  });
}

function buildInitialManualQuestions(): ManualQuestionState[] {
  const items: ManualQuestionState[] = [];

  for (const group of questionGroups) {
    for (const question of group.questions) {
      if (!question.options || question.options.length === 0) continue;
      if (question.type !== "single" && question.type !== "multiple") continue;

      items.push({
        id: question.id,
        groupId: group.id,
        groupTitle: group.sidebarTitle,
        question: question.question,
        type: question.type,
        required: question.required === true,
        selected: [],
        options: question.options.map((option) => ({
          id: option.id,
          label: option.label,
          weight: option.score,
          defaultWeight: option.score,
        })),
      });
    }
  }

  return items;
}

function buildInitialPlatforms(googleEnabled: boolean): PlatformState[] {
  const createRules = (platform: PlatformKey): DigitalRuleState[] =>
    DIGITAL_RULE_DEFAULTS[platform].map((rule) => ({
      id: rule.id,
      label: rule.label,
      weight: rule.weight,
      defaultWeight: rule.weight,
      met: false,
    }));

  return [
    {
      key: "instagram",
      label: "Instagram",
      enabled: true,
      provided: false,
      status: "not_requested",
      rules: createRules("instagram"),
    },
    {
      key: "tiktok",
      label: "TikTok",
      enabled: true,
      provided: false,
      status: "not_requested",
      rules: createRules("tiktok"),
    },
    {
      key: "google",
      label: "Google Business",
      enabled: googleEnabled,
      provided: false,
      status: "not_requested",
      rules: createRules("google"),
    },
  ];
}

function getQuestionMax(question: ManualQuestionState): number {
  if (question.type === "multiple") {
    return toOneDecimal(question.options.reduce((sum, option) => sum + option.weight, 0));
  }

  return toOneDecimal(
    question.options.reduce((max, option) => Math.max(max, option.weight), 0),
  );
}

function getQuestionEarned(question: ManualQuestionState): number {
  if (question.selected.length === 0) return 0;

  if (question.type === "single") {
    const selected = question.selected[0];
    const option = question.options.find((item) => item.id === selected);
    return toOneDecimal(option?.weight ?? 0);
  }

  return toOneDecimal(
    question.options
      .filter((option) => question.selected.includes(option.id))
      .reduce((sum, option) => sum + option.weight, 0),
  );
}

function getPlatformMax(platform: PlatformState): number {
  return toOneDecimal(platform.rules.reduce((sum, rule) => sum + rule.weight, 0));
}

function getPlatformEarned(platform: PlatformState): number {
  if (!platform.enabled || platform.status !== "success") return 0;
  return toOneDecimal(
    platform.rules.reduce((sum, rule) => sum + (rule.met ? rule.weight : 0), 0),
  );
}

function getManualQuestionById(
  manualQuestions: ManualQuestionState[],
  questionId: string,
): ManualQuestionState | undefined {
  return manualQuestions.find((question) => question.id === questionId);
}

function SummaryCard({
  title,
  subtitle,
  metrics,
}: {
  title: string;
  subtitle: string;
  metrics: TotalMetrics;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-neutral-500">{title}</p>
      <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>
      <p className="mt-3 text-xl font-bold text-neutral-900">
        {format(metrics.earned)} / {format(metrics.max)}
      </p>
      <p className="text-sm text-neutral-500">{metrics.percentage}%</p>
    </div>
  );
}

export function ScoringSimulationClient() {
  const [manualQuestions, setManualQuestions] = useState<ManualQuestionState[]>(
    () => buildInitialManualQuestions(),
  );
  const [ecommerceOtherDetail, setEcommerceOtherDetail] = useState<string>("");
  const [googleEnabled, setGoogleEnabled] = useState<boolean>(GOOGLE_SCRAPING_ENABLED);
  const [platforms, setPlatforms] = useState<PlatformState[]>(() =>
    buildInitialPlatforms(GOOGLE_SCRAPING_ENABLED),
  );

  const ecommerceQuestion = useMemo(
    () => getManualQuestionById(manualQuestions, ECOMMERCE_PLATFORM_QUESTION_ID),
    [manualQuestions],
  );

  const isEcommerceOtherSelected = useMemo(() => {
    if (!ecommerceQuestion) return false;
    return ecommerceQuestion.selected.includes(ECOMMERCE_OTHER_OPTION_ID);
  }, [ecommerceQuestion]);

  const isEcommerceOtherDetailValid =
    !isEcommerceOtherSelected || ecommerceOtherDetail.trim().length > 0;

  const groupedManual = useMemo(() => {
    const map = new Map<string, { title: string; questions: ManualQuestionState[] }>();

    for (const question of manualQuestions) {
      const existing = map.get(question.groupId);
      if (existing) {
        existing.questions.push(question);
        continue;
      }

      map.set(question.groupId, {
        title: question.groupTitle,
        questions: [question],
      });
    }

    return Array.from(map.entries()).map(([groupId, value]) => ({
      groupId,
      ...value,
    }));
  }, [manualQuestions]);

  const manualMetrics = useMemo(() => {
    const earned = toOneDecimal(manualQuestions.reduce((sum, q) => sum + getQuestionEarned(q), 0));
    const strictMax = toOneDecimal(manualQuestions.reduce((sum, q) => sum + getQuestionMax(q), 0));
    const answeredOnlyMax = toOneDecimal(
      manualQuestions.reduce(
        (sum, q) => sum + (q.selected.length > 0 ? getQuestionMax(q) : 0),
        0,
      ),
    );

    return {
      earned,
      strictMax,
      answeredOnlyMax,
      strictPercentage: calculatePercentage(earned, strictMax),
      answeredOnlyPercentage: calculatePercentage(earned, answeredOnlyMax),
    };
  }, [manualQuestions]);

  const digitalMetrics = useMemo(() => {
    let baselineMax = 0;
    let compensated = 0;
    let earned = 0;
    let requested = 0;
    let failed = 0;

    for (const platform of platforms) {
      if (!platform.enabled) continue;

      const platformMax = getPlatformMax(platform);
      baselineMax += platformMax;
      earned += getPlatformEarned(platform);

      if (platform.provided) {
        requested += 1;
        if (platform.status !== "success") {
          failed += 1;
        }
      }

      if (platform.provided && platform.status === "system_error") {
        compensated += platformMax;
      }
    }

    const finalMax = toOneDecimal(Math.max(0, baselineMax - compensated));
    const finalEarned = toOneDecimal(earned);

    let scrapeStatus: "null" | "completed" | "partial" | "failed" = "null";
    if (requested > 0) {
      if (failed === 0) scrapeStatus = "completed";
      else if (failed < requested) scrapeStatus = "partial";
      else scrapeStatus = "failed";
    }

    return {
      baselineMax: toOneDecimal(baselineMax),
      compensated: toOneDecimal(compensated),
      finalMax,
      earned: finalEarned,
      percentage: calculatePercentage(finalEarned, finalMax),
      requested,
      failed,
      scrapeStatus,
    };
  }, [platforms]);

  const totalStrict = useMemo(() => {
    const earned = toOneDecimal(manualMetrics.earned + digitalMetrics.earned);
    const max = toOneDecimal(manualMetrics.strictMax + digitalMetrics.finalMax);
    return { earned, max, percentage: calculatePercentage(earned, max) };
  }, [manualMetrics.earned, manualMetrics.strictMax, digitalMetrics.earned, digitalMetrics.finalMax]);

  const totalAnsweredOnly = useMemo(() => {
    const earned = toOneDecimal(manualMetrics.earned + digitalMetrics.earned);
    const max = toOneDecimal(manualMetrics.answeredOnlyMax + digitalMetrics.finalMax);
    return { earned, max, percentage: calculatePercentage(earned, max) };
  }, [
    manualMetrics.earned,
    manualMetrics.answeredOnlyMax,
    digitalMetrics.earned,
    digitalMetrics.finalMax,
  ]);

  const updateManualWeight = (questionId: string, optionId: string, weight: number) => {
    const nextWeight = clampWeight(weight);
    setManualQuestions((prev) =>
      prev.map((question) => {
        if (question.id !== questionId) return question;
        return {
          ...question,
          options: question.options.map((option) =>
            option.id === optionId ? { ...option, weight: nextWeight } : option,
          ),
        };
      }),
    );
  };

  const toggleSingleAnswer = (questionId: string, optionId: string) => {
    setManualQuestions((prev) =>
      prev.map((question) => {
        if (question.id !== questionId || question.type !== "single") return question;
        const alreadySelected = question.selected[0] === optionId;
        return {
          ...question,
          selected: alreadySelected ? [] : [optionId],
        };
      }),
    );
  };

  const toggleMultipleAnswer = (questionId: string, optionId: string) => {
    setManualQuestions((prev) =>
      prev.map((question) => {
        if (question.id !== questionId || question.type !== "multiple") return question;
        const selected = new Set(question.selected);
        if (selected.has(optionId)) selected.delete(optionId);
        else selected.add(optionId);

        if (
          questionId === ECOMMERCE_PLATFORM_QUESTION_ID &&
          optionId === ECOMMERCE_OTHER_OPTION_ID &&
          !selected.has(ECOMMERCE_OTHER_OPTION_ID)
        ) {
          setEcommerceOtherDetail("");
        }

        return {
          ...question,
          selected: Array.from(selected),
        };
      }),
    );
  };

  const clearManualAnswer = (questionId: string) => {
    setManualQuestions((prev) =>
      prev.map((question) => (question.id === questionId ? { ...question, selected: [] } : question)),
    );

    if (questionId === ECOMMERCE_PLATFORM_QUESTION_ID) {
      setEcommerceOtherDetail("");
    }
  };

  const resetManualDefaults = () => {
    setManualQuestions(buildInitialManualQuestions());
    setEcommerceOtherDetail("");
  };

  const setPlatformProvided = (platformKey: PlatformKey, provided: boolean) => {
    setPlatforms((prev) =>
      prev.map((platform) => {
        if (platform.key !== platformKey) return platform;
        if (!platform.enabled) {
          return {
            ...platform,
            provided: false,
            status: "not_requested",
            rules: applyRulesForStatus(platform.rules, "not_requested", true),
          };
        }

        const nextStatus: ScrapeStatus = provided ? "success" : "not_requested";
        return {
          ...platform,
          provided,
          status: nextStatus,
          rules: applyRulesForStatus(platform.rules, nextStatus, true),
        };
      }),
    );
  };

  const setPlatformStatus = (platformKey: PlatformKey, status: RequestedScrapeStatus) => {
    setPlatforms((prev) =>
      prev.map((platform) => {
        if (platform.key !== platformKey) return platform;
        if (!platform.enabled || !platform.provided) {
          return {
            ...platform,
            status: "not_requested",
            rules: applyRulesForStatus(platform.rules, "not_requested", true),
          };
        }

        return {
          ...platform,
          status,
          rules: applyRulesForStatus(platform.rules, status, false),
        };
      }),
    );
  };

  const toggleRuleMet = (platformKey: PlatformKey, ruleId: string) => {
    setPlatforms((prev) =>
      prev.map((platform) => {
        if (platform.key !== platformKey) return platform;
        if (!platform.enabled || platform.status !== "success") return platform;
        if (isExistsRule(ruleId)) return platform;

        return {
          ...platform,
          rules: platform.rules.map((rule) =>
            rule.id === ruleId ? { ...rule, met: !rule.met } : rule,
          ),
        };
      }),
    );
  };

  const updateRuleWeight = (platformKey: PlatformKey, ruleId: string, weight: number) => {
    const nextWeight = clampWeight(weight);
    setPlatforms((prev) =>
      prev.map((platform) => {
        if (platform.key !== platformKey) return platform;
        return {
          ...platform,
          rules: platform.rules.map((rule) =>
            rule.id === ruleId ? { ...rule, weight: nextWeight } : rule,
          ),
        };
      }),
    );
  };

  const resetDigitalDefaults = () => {
    setGoogleEnabled(GOOGLE_SCRAPING_ENABLED);
    setPlatforms(buildInitialPlatforms(GOOGLE_SCRAPING_ENABLED));
  };

  const handleGoogleEnabledToggle = (enabled: boolean) => {
    setGoogleEnabled(enabled);
    setPlatforms((prev) =>
      prev.map((platform) => {
        if (platform.key !== "google") return platform;
        if (!enabled) {
          return {
            ...platform,
            enabled: false,
            provided: false,
            status: "not_requested",
            rules: applyRulesForStatus(platform.rules, "not_requested", true),
          };
        }

        return {
          ...platform,
          enabled: true,
        };
      }),
    );
  };

  return (
    <div className="min-h-screen bg-neutral-100 py-8">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 md:px-8">
        <section className="rounded-3xl border border-amber-300 bg-amber-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Development Only</p>
          <h1 className="mt-2 text-3xl font-bold text-neutral-900">Scoring Simulation</h1>
          <p className="mt-2 text-sm text-neutral-700">
            Halaman ini hanya untuk simulasi bobot score. Perubahan bobot di sini tidak mengubah bobot asli
            checkup.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Manual (Strict)"
            subtitle="Max selalu menghitung semua pertanyaan berbobot"
            metrics={{
              earned: manualMetrics.earned,
              max: manualMetrics.strictMax,
              percentage: manualMetrics.strictPercentage,
            }}
          />
          <SummaryCard
            title="Manual (Answered Only)"
            subtitle="Perbandingan jika max hanya dari pertanyaan terjawab"
            metrics={{
              earned: manualMetrics.earned,
              max: manualMetrics.answeredOnlyMax,
              percentage: manualMetrics.answeredOnlyPercentage,
            }}
          />
          <SummaryCard
            title="Digital"
            subtitle={`Baseline ${format(digitalMetrics.baselineMax)} | Kompensasi ${format(digitalMetrics.compensated)}`}
            metrics={{
              earned: digitalMetrics.earned,
              max: digitalMetrics.finalMax,
              percentage: digitalMetrics.percentage,
            }}
          />
          <SummaryCard
            title="Total (Strict Policy)"
            subtitle="Manual strict + digital final"
            metrics={totalStrict}
          />
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Ringkasan Simulasi</h2>
              <p className="text-sm text-neutral-600">
                Simulasi scrape status: <span className="font-semibold">{digitalMetrics.scrapeStatus}</span> | Requested:
                {" "}
                {digitalMetrics.requested} | Failed: {digitalMetrics.failed}
              </p>
              <p className="text-sm text-neutral-600">
                Validasi e-commerce lainnya: {isEcommerceOtherDetailValid ? "valid" : "invalid"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-neutral-500">Total (Answered-Only Comparator)</p>
              <p className="text-lg font-bold text-neutral-900">
                {format(totalAnsweredOnly.earned)} / {format(totalAnsweredOnly.max)} ({totalAnsweredOnly.percentage}%)
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Manual Question Weights</h2>
              <p className="text-sm text-neutral-600">
                Ubah bobot tiap opsi dan pilih jawaban untuk melihat dampaknya ke earned score, max score, dan
                percentage.
              </p>
            </div>
            <button
              type="button"
              onClick={resetManualDefaults}
              className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Reset Bobot & Jawaban Manual
            </button>
          </div>

          <div className="space-y-6">
            {groupedManual.map((group) => (
              <div key={group.groupId} className="rounded-2xl border border-neutral-200 p-4">
                <h3 className="text-lg font-semibold text-neutral-900">{group.title}</h3>
                <div className="mt-3 space-y-4">
                  {group.questions.map((question) => {
                    const qMax = getQuestionMax(question);
                    const qEarned = getQuestionEarned(question);

                    return (
                      <div key={question.id} className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-neutral-900">{question.question}</p>
                            <p className="text-xs text-neutral-500">
                              {question.type === "single" ? "Single choice" : "Multiple choice"} |{" "}
                              {question.required ? "Required" : "Optional"}
                            </p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="font-semibold text-neutral-800">
                              Earned {format(qEarned)} / Max {format(qMax)}
                            </p>
                            <button
                              type="button"
                              onClick={() => clearManualAnswer(question.id)}
                              className="mt-1 text-xs font-semibold text-primary hover:underline"
                            >
                              Kosongkan Jawaban
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {question.options.map((option) => {
                            const isSelected = question.selected.includes(option.id);
                            return (
                              <div
                                key={option.id}
                                className="grid grid-cols-1 gap-2 rounded-lg border border-neutral-200 bg-white p-3 md:grid-cols-[1fr_auto] md:items-center"
                              >
                                <label className="flex items-start gap-2 text-sm text-neutral-700">
                                  <input
                                    type={question.type === "single" ? "radio" : "checkbox"}
                                    checked={isSelected}
                                    onChange={() =>
                                      question.type === "single"
                                        ? toggleSingleAnswer(question.id, option.id)
                                        : toggleMultipleAnswer(question.id, option.id)
                                    }
                                    name={question.type === "single" ? question.id : undefined}
                                    className="mt-0.5"
                                  />
                                  <span>{option.label}</span>
                                </label>

                                <label className="flex items-center gap-2 text-sm text-neutral-600">
                                  Bobot
                                  <input
                                    type="number"
                                    value={option.weight}
                                    step="0.1"
                                    min="0"
                                    onChange={(event) =>
                                      updateManualWeight(question.id, option.id, Number(event.target.value))
                                    }
                                    className="w-24 rounded-lg border border-neutral-300 px-2 py-1 text-right"
                                  />
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {ecommerceQuestion && isEcommerceOtherSelected && (
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <h3 className="text-lg font-semibold text-neutral-900">Detail Platform E-commerce Lainnya</h3>
                <p className="mt-1 text-sm text-neutral-600">
                  Mengikuti behavior checkup terbaru: jika memilih opsi &quot;Platform e-commerce lainnya&quot;,
                  detail platform wajib diisi sebelum submit payload.
                </p>
                <div className="mt-3">
                  <label className="flex flex-col gap-2 text-sm text-neutral-700">
                    Isi nama platform
                    <input
                      type="text"
                      value={ecommerceOtherDetail}
                      maxLength={100}
                      onChange={(event) => setEcommerceOtherDetail(event.target.value)}
                      placeholder="Contoh: Shopify, WooCommerce, website sendiri"
                      className={`w-full rounded-lg border px-3 py-2 ${
                        isEcommerceOtherDetailValid
                          ? "border-neutral-300"
                          : "border-red-400"
                      }`}
                    />
                  </label>
                  {!isEcommerceOtherDetailValid && (
                    <p className="mt-2 text-sm font-medium text-red-600">
                      Detail platform e-commerce lainnya wajib diisi.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Digital Scraping Simulation</h2>
              <p className="text-sm text-neutral-600">
                Simulasikan platform diisi/tidak diisi, hasil scraping, dan bobot rule digital.
              </p>
            </div>
            <button
              type="button"
              onClick={resetDigitalDefaults}
              className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Reset Simulasi Digital
            </button>
          </div>

          <div className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <label className="flex items-center gap-3 text-sm font-medium text-neutral-800">
              <input
                type="checkbox"
                checked={googleEnabled}
                onChange={(event) => handleGoogleEnabledToggle(event.target.checked)}
              />
              Google Scraping Enabled (simulasi)
            </label>
            <p className="mt-1 text-xs text-neutral-600">
              State default dari kode saat ini: {GOOGLE_SCRAPING_ENABLED ? "enabled" : "disabled"}
            </p>
          </div>

          <div className="space-y-4">
            {platforms.map((platform) => {
              const platformMax = getPlatformMax(platform);
              const platformEarned = getPlatformEarned(platform);
              const systemCompensated = platform.enabled && platform.provided && platform.status === "system_error";

              return (
                <div key={platform.key} className="rounded-2xl border border-neutral-200 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900">{platform.label}</h3>
                      <p className="text-xs text-neutral-500">
                        Enabled: {platform.enabled ? "Ya" : "Tidak"} | Earned {format(platformEarned)} / Max{" "}
                        {format(platformMax)}
                        {systemCompensated ? " | Kompensasi aktif" : ""}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={platform.provided}
                          disabled={!platform.enabled}
                          onChange={(event) => setPlatformProvided(platform.key, event.target.checked)}
                        />
                        Input diisi user
                      </label>

                      <label className="flex items-center gap-2">
                        Status
                        <select
                          value={platform.status}
                          disabled={!platform.enabled || !platform.provided}
                          onChange={(event) =>
                            setPlatformStatus(platform.key, event.target.value as RequestedScrapeStatus)
                          }
                          className="rounded-lg border border-neutral-300 px-2 py-1"
                        >
                          <option value="success">success</option>
                          <option value="user_error">user_error</option>
                          <option value="system_error">system_error</option>
                        </select>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {platform.rules.map((rule) => (
                      <div
                        key={rule.id}
                        className="grid grid-cols-1 gap-2 rounded-lg border border-neutral-100 bg-neutral-50 p-3 md:grid-cols-[1fr_auto] md:items-center"
                      >
                        <label className="flex items-start gap-2 text-sm text-neutral-700">
                          <input
                            type="checkbox"
                            checked={rule.met}
                            disabled={
                              !platform.enabled ||
                              platform.status !== "success" ||
                              isExistsRule(rule.id)
                            }
                            onChange={() => toggleRuleMet(platform.key, rule.id)}
                            className="mt-0.5"
                          />
                          <span>{rule.label}</span>
                        </label>

                        <label className="flex items-center gap-2 text-sm text-neutral-600">
                          Bobot
                          <input
                            type="number"
                            value={rule.weight}
                            step="0.1"
                            min="0"
                            onChange={(event) =>
                              updateRuleWeight(platform.key, rule.id, Number(event.target.value))
                            }
                            className="w-24 rounded-lg border border-neutral-300 px-2 py-1 text-right"
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
