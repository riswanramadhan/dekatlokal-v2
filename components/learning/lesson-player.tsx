"use client";

import {
  BookOpen,
  ChevronRight,
  FileText,
  Headphones,
  Pause,
  Play,
  SignalLow,
  Video,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import type { Lesson, LessonProgress, LessonScreen } from "@/domain/entities";
import { saveLessonScreen } from "@/features/lesson/actions";
import { Button, Card, CardContent, FixedCta, Input, StatusPill, VisualPanel } from "@/components/ui";
import { useHydrated } from "@/lib/hooks/use-hydrated";

type Responses = Record<string, string | string[]>;

export function LessonPlayer({
  lesson,
  initialProgress,
  completionHref,
}: {
  lesson: Lesson;
  initialProgress: LessonProgress;
  completionHref: string;
}) {
  const router = useRouter();
  const hydrated = useHydrated();
  const [screenIndex, setScreenIndex] = useState(initialProgress.currentScreen);
  const [responses, setResponses] = useState<Responses>(initialProgress.responses);
  const [lowBandwidth, setLowBandwidth] = useState(false);
  const [syncState, setSyncState] = useState<"synced" | "pending" | "failed">(
    initialProgress.syncState,
  );
  const [isPending, startTransition] = useTransition();
  const screen = lesson.screens[screenIndex];
  const progressPercent = Math.round(
    ((screenIndex + 1) / lesson.screens.length) * 100,
  );
  const ready = useMemo(
    () => isScreenReady(screen, responses),
    [screen, responses],
  );

  useEffect(() => {
    if (Object.keys(responses).length === 0) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void saveLessonScreen({
        lessonId: lesson.id,
        screenIndex,
        responses,
        completeScreen: false,
      }).then((result) => {
        setSyncState(result.status === "saved" ? "synced" : "failed");
      });
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [lesson.id, responses, screenIndex]);

  function updateResponse(key: string, value: string | string[]) {
    setSyncState("pending");
    setResponses((current) => ({ ...current, [key]: value }));
  }

  function continueLesson() {
    startTransition(async () => {
      setSyncState("pending");
      const result = await saveLessonScreen({
        lessonId: lesson.id,
        screenIndex,
        responses,
        completeScreen: true,
      });
      if (result.status !== "saved") {
        setSyncState("failed");
        return;
      }

      setSyncState("synced");
      if (result.nextHref) {
        router.push(completionHref);
        return;
      }
      setScreenIndex(result.progress.currentScreen);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function closeSafely() {
    startTransition(async () => {
      setSyncState("pending");
      const result = await saveLessonScreen({
        lessonId: lesson.id,
        screenIndex,
        responses,
        completeScreen: false,
      });
      if (result.status === "saved") {
        router.push(`/app/modul/${lesson.moduleSlug}`);
      } else {
        setSyncState("failed");
      }
    });
  }

  return (
    <div className="learning-focus mx-auto max-w-[860px] pb-28 md:pb-0">
      <header className="mb-5 overflow-hidden rounded-[var(--radius-xl)] bg-gradient-to-br from-brand-primary to-accent-purple p-5 text-white shadow-[var(--shadow-card)] md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3 text-sm font-bold text-white/78">
              <span>Bagian {screenIndex + 1} dari {lesson.screens.length}</span>
              <span aria-live="polite">
                {syncState === "pending"
                  ? "Menyimpan..."
                  : syncState === "failed"
                    ? "Belum tersimpan"
                    : "Tersimpan"}
              </span>
            </div>
            <div
              aria-label={`Progres lesson ${progressPercent}%`}
              className="mt-3 h-3 overflow-hidden rounded-full bg-white/20"
              role="progressbar"
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={progressPercent}
            >
              <div
                className="h-full rounded-full bg-white transition-[width]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <button
            aria-label="Simpan dan tutup lesson"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] bg-white/16 text-white"
            onClick={closeSafely}
            type="button"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="truncate text-sm font-extrabold text-white">{lesson.title}</p>
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-white/12 px-3 text-sm font-bold text-white/86">
            <SignalLow aria-hidden="true" className="h-4 w-4" />
            <input
            checked={lowBandwidth}
              className="h-4 w-4"
              onChange={(event) => setLowBandwidth(event.target.checked)}
              disabled={!hydrated}
              type="checkbox"
            />
            Hemat data
          </label>
        </div>
      </header>

      <Card className="overflow-hidden">
        <CardContent className="space-y-5 p-5 md:p-7">
          <div>
            <StatusPill>{screen.eyebrow}</StatusPill>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight text-text-primary md:text-4xl">
              {screen.title}
            </h1>
            <p className="mt-3 text-base leading-7 text-text-secondary">{screen.body}</p>
          </div>

          <ScreenContent
            lowBandwidth={lowBandwidth}
            hydrated={hydrated}
            onResponse={updateResponse}
            responses={responses}
            screen={screen}
          />

          {screen.businessExample ? (
            <VisualPanel className="shadow-none" tone="sky">
              <p className="font-extrabold text-text-primary">Contoh untuk usaha Anda</p>
              <p className="mt-1 text-base leading-7 text-text-secondary">
                {screen.businessExample}
              </p>
            </VisualPanel>
          ) : null}
        </CardContent>
      </Card>

      <div className="mt-5 hidden md:block">
        <Button disabled={!hydrated || !ready || isPending} onClick={continueLesson}>
          {screenIndex === lesson.screens.length - 1 ? "Selesaikan lesson" : "Lanjut"}
          <ChevronRight aria-hidden="true" className="h-5 w-5" />
        </Button>
      </div>

      <FixedCta>
        <Button
          className="w-full"
          data-sound-event={
            screenIndex === lesson.screens.length - 1
              ? "lesson-complete"
              : "ui-click"
          }
          disabled={!hydrated || !ready || isPending}
          onClick={continueLesson}
        >
          {screenIndex === lesson.screens.length - 1 ? "Selesaikan lesson" : "Lanjut"}
          <ChevronRight aria-hidden="true" className="h-5 w-5" />
        </Button>
      </FixedCta>
    </div>
  );
}

function ScreenContent({
  screen,
  responses,
  onResponse,
  lowBandwidth,
  hydrated,
}: {
  screen: LessonScreen;
  responses: Responses;
  onResponse: (key: string, value: string | string[]) => void;
  lowBandwidth: boolean;
  hydrated: boolean;
}) {
  if (screen.type === "story" || screen.type === "reading") {
    const Icon = screen.type === "story" ? BookOpen : FileText;
    return (
      <div className="flex items-start gap-3 rounded-[24px] bg-surface-yellow p-4 shadow-[var(--shadow-soft)]">
        <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />
        <p className="text-base leading-7 text-text-primary">
          Ambil satu ide utama dari bagian ini sebelum melanjutkan.
        </p>
      </div>
    );
  }

  if (screen.type === "video") {
    return (
      <div className="overflow-hidden rounded-[28px] bg-[var(--brand-primary-900)] text-white shadow-[var(--shadow-card)]">
        {lowBandwidth ? (
          <p className="p-5 text-base leading-7">{screen.transcript}</p>
        ) : (
          <div className="flex aspect-video flex-col items-center justify-center gap-3 p-5 text-center">
            <Video aria-hidden="true" className="h-9 w-9" />
            <p className="font-semibold">Video pembelajaran {screen.mediaDuration}</p>
            <p className="text-sm text-white/75">Video pembelajaran belum tersedia</p>
          </div>
        )}
        <Transcript text={screen.transcript} />
      </div>
    );
  }

  if (screen.type === "audio") {
    return <MockAudio screen={screen} lowBandwidth={lowBandwidth} />;
  }

  if (screen.type === "choice") {
    const selected = String(responses[screen.id] ?? "");
    const selectedChoice = screen.choices?.find((choice) => choice.id === selected);
    return (
      <fieldset className="grid gap-3">
        <legend className="sr-only">Pilih jawaban</legend>
        {screen.choices?.map((choice) => (
          <label
            className="flex min-h-16 cursor-pointer items-start gap-3 rounded-[24px] bg-white/86 p-4 shadow-[var(--shadow-soft)] has-[:checked]:bg-brand-primary-soft"
            key={choice.id}
          >
            <input
              checked={selected === choice.id}
              className="mt-1 h-4 w-4"
              name={screen.id}
              data-sound-event="option-select"
              disabled={!hydrated}
              onChange={() => onResponse(screen.id, choice.id)}
              type="radio"
            />
            <span className="font-semibold leading-6 text-text-primary">{choice.label}</span>
          </label>
        ))}
        {selectedChoice ? (
          <p
            aria-live="polite"
            className={`rounded-[24px] p-4 text-base leading-7 ${
              selectedChoice.isRecommended
                ? "bg-success-soft text-success"
                : "bg-warning-soft text-warning"
            }`}
          >
            {selectedChoice.feedback}
          </p>
        ) : null}
      </fieldset>
    );
  }

  if (screen.type === "checklist") {
    const selected = Array.isArray(responses[screen.id])
      ? (responses[screen.id] as string[])
      : [];
    return (
      <fieldset className="grid gap-3">
        <legend className="sr-only">Checklist lesson</legend>
        {screen.checklistItems?.map((item) => (
          <label
            className="flex min-h-16 cursor-pointer items-start gap-3 rounded-[24px] bg-white/86 p-4 shadow-[var(--shadow-soft)] has-[:checked]:bg-brand-primary-soft"
            key={item}
          >
            <input
              checked={selected.includes(item)}
              className="mt-1 h-4 w-4"
              onChange={(event) =>
                onResponse(
                  screen.id,
                  event.target.checked
                    ? [...selected, item]
                    : selected.filter((value) => value !== item),
                )
              }
              disabled={!hydrated}
              data-sound-event="option-select"
              type="checkbox"
            />
            <span className="leading-6 text-text-primary">{item}</span>
          </label>
        ))}
      </fieldset>
    );
  }

  return (
    <div className="grid gap-4">
      {screen.templateFields?.map((field) => (
        <label className="grid gap-2" key={field.key}>
          <span className="font-semibold text-text-primary">{field.label}</span>
          <Input
            disabled={!hydrated}
            onChange={(event) => onResponse(`${screen.id}:${field.key}`, event.target.value)}
            placeholder={field.placeholder}
            value={String(responses[`${screen.id}:${field.key}`] ?? "")}
          />
          <span className="text-sm leading-6 text-text-muted">Contoh: {field.example}</span>
        </label>
      ))}
    </div>
  );
}

function MockAudio({ screen, lowBandwidth }: { screen: LessonScreen; lowBandwidth: boolean }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="rounded-[28px] bg-surface-lavender p-4 shadow-[var(--shadow-soft)]">
      {lowBandwidth ? (
        <p className="text-base leading-7 text-text-primary">{screen.transcript}</p>
      ) : (
        <div className="flex items-center gap-4">
          <button
            aria-label={playing ? "Jeda audio pembelajaran" : "Putar audio pembelajaran"}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary text-white"
            onClick={() => setPlaying((current) => !current)}
            type="button"
          >
            {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          </button>
          <Headphones aria-hidden="true" className="h-5 w-5 text-brand-primary" />
          <div>
            <p className="font-semibold text-text-primary">
              Audio pembelajaran belum tersedia
            </p>
            <p className="text-sm text-text-secondary">{screen.mediaDuration}</p>
          </div>
        </div>
      )}
      <Transcript text={screen.transcript} />
    </div>
  );
}

function Transcript({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <details className="border-t border-white/15 p-4 text-sm leading-6">
      <summary className="cursor-pointer font-semibold">Baca transkrip</summary>
      <p className="mt-2">{text}</p>
    </details>
  );
}

function isScreenReady(screen: LessonScreen, responses: Responses) {
  if (screen.type === "choice") {
    return Boolean(responses[screen.id]);
  }
  if (screen.type === "checklist") {
    return (
      Array.isArray(responses[screen.id]) &&
      (responses[screen.id] as string[]).length === screen.checklistItems?.length
    );
  }
  if (screen.type === "template") {
    return screen.templateFields?.every((field) =>
      Boolean(String(responses[`${screen.id}:${field.key}`] ?? "").trim()),
    );
  }
  return true;
}
