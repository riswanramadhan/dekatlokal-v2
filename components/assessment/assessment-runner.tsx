"use client";

import { CheckCircle2, RotateCcw, ShieldCheck, XCircle } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import type {
  Assessment,
  AssessmentResult,
} from "@/domain/entities";
import { Button, ButtonLink, Card, CardContent, ProgressBar, StatusPill } from "@/components/ui";
import { submitAssessment } from "@/features/assessment/actions";
import { useHydrated } from "@/lib/hooks/use-hydrated";

export function AssessmentRunner({
  assessment,
  initialResult,
  targeted,
}: {
  assessment: Assessment;
  initialResult: AssessmentResult | null;
  targeted: boolean;
}) {
  const questions = useMemo(() => {
    if (!targeted || !initialResult || initialResult.passed) {
      return assessment.questions;
    }
    return assessment.questions.filter((question) =>
      initialResult.weakTopics.includes(question.topic),
    );
  }, [assessment.questions, initialResult, targeted]);
  const hydrated = useHydrated();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(
    targeted ? null : initialResult,
  );
  const [isPending, startTransition] = useTransition();
  const question = questions[index];
  const selected = question ? answers[question.id] : undefined;
  const selectedCorrect = selected === question?.correctOptionId;

  if (result) {
    return <AssessmentResultView assessment={assessment} result={result} />;
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
      const response = await submitAssessment({
        assessmentId: assessment.id,
        answers,
        targeted,
      });
      if (response.status === "saved") {
        setResult(response.result);
      }
    });
  }

  if (!question) {
    return null;
  }

  return (
    <div className="mx-auto max-w-[820px] space-y-5">
      <header className="rounded-[var(--radius-xl)] bg-gradient-to-br from-surface-lavender to-white p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between gap-4 text-sm font-extrabold text-text-secondary">
          <span>{targeted ? "Coba ulang topik pilihan" : `Pertanyaan ${index + 1} dari ${questions.length}`}</span>
          <span>{Math.round(((index + 1) / questions.length) * 100)}%</span>
        </div>
        <ProgressBar className="mt-2" value={Math.round(((index + 1) / questions.length) * 100)} />
      </header>

      <Card className="overflow-hidden">
        <CardContent className="space-y-5 p-5 md:p-7">
          <div>
            <StatusPill>{question.topic}</StatusPill>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight text-text-primary">
              {question.prompt}
            </h1>
          </div>

          <fieldset className="grid gap-3">
            <legend className="sr-only">Pilihan jawaban</legend>
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
                    setAnswers((current) => ({ ...current, [question.id]: option.id }))
                  }
                  type="radio"
                />
                <span className="font-semibold leading-6 text-text-primary">{option.label}</span>
              </label>
            ))}
          </fieldset>

          {checked ? (
            <div
              aria-live="polite"
              className={`flex items-start gap-3 rounded-[24px] p-4 ${
                selectedCorrect ? "bg-success-soft text-success" : "bg-warning-soft text-warning"
              }`}
            >
              {selectedCorrect ? (
                <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
              ) : (
                <XCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
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
            data-sound-event={
              !checked
                ? selectedCorrect
                  ? "answer-correct"
                  : "answer-incorrect-soft"
                : "ui-click"
            }
            disabled={!hydrated || !selected || isPending}
            onClick={advance}
          >
            {!checked
              ? "Periksa jawaban"
              : index === questions.length - 1
                ? "Lihat hasil"
                : "Pertanyaan berikutnya"}
          </Button>
        </CardContent>
      </Card>

      <p className="flex items-center justify-center gap-2 text-center text-sm leading-6 text-text-muted">
        <ShieldCheck aria-hidden="true" className="h-4 w-4" />
        Jawaban yang belum tepat tidak mengurangi Poin Tumbuh.
      </p>
    </div>
  );
}

function AssessmentResultView({
  assessment,
  result,
}: {
  assessment: Assessment;
  result: AssessmentResult;
}) {
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
            {result.passed ? <CheckCircle2 aria-hidden="true" /> : <RotateCcw aria-hidden="true" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-primary">Skor {result.score}</p>
            <h1 className="mt-2 text-2xl font-bold text-text-primary">
              {result.passed ? "Pemahaman sudah kuat" : "Sedikit lagi, perkuat topik pilihan"}
            </h1>
            <p className="mt-2 text-base leading-7 text-text-secondary">
              {result.passed
                ? "Anda siap menerapkan materi pada usaha. Langkah berikutnya adalah membuat bukti dan Aset Usaha."
                : "DekatLokal hanya menampilkan materi yang berkaitan dengan jawaban yang belum tepat."}
            </p>
            <p className="mt-2 text-sm font-semibold text-text-muted">
              Tidak ada pengurangan Poin Tumbuh pada percobaan ini.
            </p>
          </div>

          {result.strongTopics.length > 0 ? (
            <TopicList title="Sudah kuat" topics={result.strongTopics} tone="success" />
          ) : null}
          {result.weakTopics.length > 0 ? (
            <TopicList title="Perlu diperkuat" topics={result.weakTopics} tone="warning" />
          ) : null}

          {result.passed ? (
            <ButtonLink className="w-full" href={`/app/tugas/${assessment.taskId}`}>
              Kerjakan tugas usaha
            </ButtonLink>
          ) : (
            <div className="grid gap-3">
              {result.correctiveLessonIds.map((lessonId) => {
                const question = assessment.questions.find(
                  (item) => item.correctiveLessonId === lessonId,
                );
                return (
                  <Link
                    className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-border-default bg-white p-4 font-semibold text-text-primary hover:border-brand-primary"
                    href={`/app/belajar/${lessonId}`}
                    key={lessonId}
                  >
                    Penguatan: {question?.topic}
                    <RotateCcw aria-hidden="true" className="h-5 w-5 text-brand-primary" />
                  </Link>
                );
              })}
            </div>
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
    <div className={tone === "success" ? "rounded-2xl bg-success-soft p-4" : "rounded-2xl bg-warning-soft p-4"}>
      <p className="font-extrabold text-text-primary">{title}</p>
      <p className="mt-1 text-sm leading-6 text-text-secondary">{topics.join(" · ")}</p>
    </div>
  );
}
