"use client";

import { CheckCircle2, RotateCcw, ShieldCheck, XCircle } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Button, ButtonLink, Card, CardContent, ProgressBar, StatusPill } from "@/components/ui";
import type { FinalTest, FinalTestAttempt } from "@/domain/entities";
import { submitFinalTest } from "@/features/final-test/actions";
import { useHydrated } from "@/lib/hooks/use-hydrated";

export function FinalTestRunner({
  finalTest,
  initialAttempt,
  targeted,
}: {
  finalTest: FinalTest;
  initialAttempt: FinalTestAttempt | null;
  targeted: boolean;
}) {
  const questions = useMemo(() => {
    if (!targeted || !initialAttempt || initialAttempt.passed) {
      return finalTest.questions;
    }
    return finalTest.questions.filter((question) =>
      initialAttempt.weakFocuses.includes(question.focusTitle),
    );
  }, [finalTest.questions, initialAttempt, targeted]);
  const hydrated = useHydrated();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<FinalTestAttempt | null>(
    targeted ? null : initialAttempt,
  );
  const [isPending, startTransition] = useTransition();
  const question = questions[index];
  const selected = question ? answers[question.id] : undefined;
  const selectedCorrect = selected === question?.correctOptionId;

  if (result) {
    return <FinalTestResultView result={result} />;
  }

  function advance() {
    if (!checked) {
      setChecked(true);
      return;
    }

    if (index < questions.length - 1) {
      setIndex((current) => current + 1);
      setChecked(false);
      return;
    }

    startTransition(async () => {
      const response = await submitFinalTest({
        finalTestId: finalTest.id,
        answers,
        targeted,
      });
      if (response.status === "saved") {
        setResult(response.result);
      }
    });
  }

  if (!question) return null;

  return (
    <div className="mx-auto max-w-[820px] space-y-5">
      <header className="rounded-[var(--radius-xl)] bg-gradient-to-br from-surface-lavender to-white p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between gap-4 text-sm font-extrabold text-text-secondary">
          <span>
            {targeted
              ? "Ulangi fokus yang perlu diperkuat"
              : `Skenario ${index + 1} dari ${questions.length}`}
          </span>
          <span>{Math.round(((index + 1) / questions.length) * 100)}%</span>
        </div>
        <ProgressBar
          className="mt-2"
          value={Math.round(((index + 1) / questions.length) * 100)}
        />
      </header>

      <Card className="overflow-hidden">
        <CardContent className="space-y-5 p-5 md:p-7">
          <div>
            <StatusPill>{question.focusTitle}</StatusPill>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight text-text-primary">
              {question.scenario}
            </h1>
            <p className="mt-3 text-base leading-7 text-text-secondary">
              {question.prompt}
            </p>
          </div>

          <fieldset className="grid gap-3">
            <legend className="sr-only">Pilihan jawaban ujian akhir</legend>
            {question.options.map((option) => (
              <label
                className="flex min-h-16 cursor-pointer items-start gap-3 rounded-[24px] bg-white/86 p-4 shadow-[var(--shadow-soft)] has-[:checked]:bg-brand-primary-soft"
                key={option.id}
              >
                <input
                  checked={selected === option.id}
                  className="mt-1 h-4 w-4"
                  disabled={!hydrated || checked}
                  name={question.id}
                  onChange={() =>
                    setAnswers((current) => ({
                      ...current,
                      [question.id]: option.id,
                    }))
                  }
                  type="radio"
                />
                <span className="font-semibold leading-6 text-text-primary">
                  {option.label}
                </span>
              </label>
            ))}
          </fieldset>

          {checked ? (
            <div
              aria-live="polite"
              className={`flex items-start gap-3 rounded-[24px] p-4 ${
                selectedCorrect
                  ? "bg-success-soft text-success"
                  : "bg-warning-soft text-warning"
              }`}
            >
              {selectedCorrect ? (
                <CheckCircle2
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0"
                />
              ) : (
                <XCircle
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0"
                />
              )}
              <p className="text-base leading-7">
                {selectedCorrect
                  ? question.correctExplanation
                  : question.incorrectExplanation}
              </p>
            </div>
          ) : null}

          <Button
            className="w-full"
            disabled={!hydrated || !selected || isPending}
            onClick={advance}
          >
            {!checked
              ? "Periksa jawaban"
              : index === questions.length - 1
                ? "Lihat hasil ujian"
                : "Skenario berikutnya"}
          </Button>
        </CardContent>
      </Card>

      <p className="flex items-center justify-center gap-2 text-center text-sm leading-6 text-text-muted">
        <ShieldCheck aria-hidden="true" className="h-4 w-4" />
        Jawaban ulang tidak mengurangi Poin Tumbuh.
      </p>
    </div>
  );
}

function FinalTestResultView({ result }: { result: FinalTestAttempt }) {
  return (
    <div className="mx-auto max-w-[820px] space-y-5">
      <Card className="overflow-hidden">
        <CardContent className="space-y-5 p-5 md:p-7">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
              result.passed
                ? "bg-success-soft text-success"
                : "bg-warning-soft text-warning"
            }`}
          >
            {result.passed ? (
              <CheckCircle2 aria-hidden="true" />
            ) : (
              <RotateCcw aria-hidden="true" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-primary">
              Nilai {result.score}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-text-primary">
              {result.passed
                ? "Ujian akhir lulus"
                : "Sedikit lagi, perkuat fokus pilihan"}
            </h1>
            <p className="mt-2 text-base leading-7 text-text-secondary">
              {result.passed
                ? "Checkup ulang sekarang terbuka agar perubahan usaha dapat dibandingkan."
                : "DekatLokal hanya mengarahkan ulang ke fokus yang belum tepat, tanpa pengurangan Poin Tumbuh."}
            </p>
          </div>

          {result.strongFocuses.length > 0 ? (
            <TopicList title="Sudah kuat" topics={result.strongFocuses} tone="success" />
          ) : null}
          {result.weakFocuses.length > 0 ? (
            <TopicList title="Perlu review terarah" topics={result.weakFocuses} tone="warning" />
          ) : null}

          {result.reviewItems.length > 0 ? (
            <div className="grid gap-3">
              {result.reviewItems.map((item) => (
                <Link
                  className="rounded-[24px] bg-white/86 p-4 shadow-[var(--shadow-soft)] transition hover:bg-brand-primary-soft"
                  href={`/app/modul/${item.moduleSlug}`}
                  key={item.moduleSlug}
                >
                  <p className="font-semibold text-text-primary">
                    Review: {item.focusTitle}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-text-secondary">
                    {item.reason}
                  </p>
                </Link>
              ))}
            </div>
          ) : null}

          {result.passed ? (
            <ButtonLink className="w-full" href="/app/checkup-ulang">
              Lanjut ke Checkup ulang
            </ButtonLink>
          ) : (
            <ButtonLink className="w-full" href="/app/ujian-akhir?targeted=1">
              Coba ulang bagian yang perlu diperkuat
            </ButtonLink>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TopicList({
  title,
  topics,
  tone,
}: {
  title: string;
  topics: string[];
  tone: "success" | "warning";
}) {
  return (
    <div
      className={
        tone === "success"
          ? "rounded-[24px] bg-success-soft p-4"
          : "rounded-[24px] bg-warning-soft p-4"
      }
    >
      <p className="font-semibold text-text-primary">{title}</p>
      <p className="mt-1 text-sm leading-6 text-text-secondary">
        {topics.join(", ")}
      </p>
    </div>
  );
}
