"use client";

import { Check, Lightbulb, RotateCcw } from "lucide-react";
import { useState } from "react";
import type {
  CheckupClaimPreview,
  PreAuthJourney,
  RecallEvaluation,
} from "@/domain/entities";
import {
  Button,
  Card,
  CardContent,
  FixedCta,
} from "@/components/ui";
import {
  continueToPathPreview,
  revealRecallHelp,
  submitRecall,
} from "@/features/preauth/actions";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { trackMockAnalytics } from "@/lib/analytics/mock";
import { cn } from "@/lib/utils/cn";

export function RecallChallenge({
  evaluation,
  journey,
  preview,
}: {
  evaluation: RecallEvaluation | null;
  journey: PreAuthJourney;
  preview: CheckupClaimPreview;
}) {
  const hydrated = useHydrated();
  const [selectedIds, setSelectedIds] = useState(journey.selectedModuleIds);
  const choices = preview.recommendedModules.flatMap((module, index) => [
    module,
    preview.distractorModules[index],
  ]);

  if (journey.completedRecall || journey.helpRevealed) {
    return (
      <section className="space-y-5">
        <div>
          <p className="text-sm font-semibold text-brand-primary">Fokus ditemukan</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-text-primary">
            {journey.completedRecall
              ? "Pas! Kamu mengingat ketiga fokus usahamu."
              : "Ini tiga fokus utama usahamu."}
          </h1>
          <p className="mt-3 text-base leading-7 text-text-secondary">
            {journey.completedRecall
              ? "Ketiganya akan disusun menjadi Jalur Naik Kelas yang bisa dikerjakan bertahap."
              : "Tidak apa-apa perlu bantuan. Yang penting sekarang kamu tahu tiga langkah yang paling relevan."}
          </p>
        </div>
        <div className="grid gap-3">
          {preview.recommendedModules.map((module) => (
            <div
              className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-success/30 bg-success-soft p-4"
              key={module.id}
            >
              <Check aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              <div>
                <p className="font-bold text-text-primary">{module.title}</p>
                <p className="mt-1 text-base leading-7 text-text-secondary">
                  {module.shortOutcome}
                </p>
              </div>
            </div>
          ))}
        </div>
        <form action={continueToPathPreview} id="continue-to-preview">
          <Button className="hidden w-full md:inline-flex" type="submit">
            Lihat Jalur Naik Kelas
          </Button>
        </form>
        <FixedCta>
          <Button className="w-full" form="continue-to-preview" type="submit">
            Lihat Jalur Naik Kelas
          </Button>
        </FixedCta>
      </section>
    );
  }

  function toggleChoice(moduleId: string) {
    setSelectedIds((current) => {
      if (current.includes(moduleId)) {
        return current.filter((id) => id !== moduleId);
      }
      if (current.length === 3) {
        return current;
      }
      trackMockAnalytics({ name: "recall_option_selected" });
      return [...current, moduleId];
    });
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-brand-primary">Ingat kembali</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-text-primary">
          Masih ingat tiga fokus usahamu?
        </h1>
        <p className="mt-3 text-base leading-7 text-text-secondary">
          Pilih tiga rekomendasi yang muncul pada hasil Digital Checkup tadi.
        </p>
      </div>

      {evaluation && !evaluation.isCorrect ? (
        <Card className="border-warning/30 bg-warning-soft" role="status">
          <CardContent className="space-y-2 p-4">
            <h2 className="text-xl font-bold text-text-primary">Hampir tepat!</h2>
            <p className="text-base leading-7 text-text-secondary">
              {evaluation.matchingCount} dari 3 pilihanmu sudah sesuai.
            </p>
            <p className="flex items-start gap-2 text-base leading-7 text-text-secondary">
              <Lightbulb aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-warning" />
              {evaluation.contextualHint}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <p aria-live="polite" className="font-semibold text-text-primary">
        {selectedIds.length} dari 3 dipilih
      </p>

      <form action={submitRecall} className="grid gap-3" id="recall-form">
        {choices.map((module) => {
          const selected = selectedIds.includes(module.id);
          const blocked = selectedIds.length === 3 && !selected;
          return (
            <label
              className={cn(
                "flex min-h-20 cursor-pointer items-start gap-3 rounded-[var(--radius-lg)] border bg-white p-4 transition",
                selected
                  ? "border-brand-primary bg-brand-primary-soft shadow-[var(--shadow-card)]"
                  : "border-border-default",
                blocked && "cursor-not-allowed opacity-55",
              )}
              key={module.id}
            >
              <input
                checked={selected}
                className="mt-1 h-5 w-5 shrink-0 accent-[var(--brand-primary)]"
                data-sound-event="option-select"
                disabled={!hydrated || blocked}
                name="selectedModuleIds"
                onChange={() => toggleChoice(module.id)}
                type="checkbox"
                value={module.id}
              />
              <span>
                <span className="block font-bold text-text-primary">{module.title}</span>
                <span className="mt-1 block text-base leading-7 text-text-secondary">
                  {module.shortOutcome}
                </span>
                {selected ? (
                  <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-primary">
                    <Check aria-hidden="true" className="h-4 w-4" /> Dipilih
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
        <Button
          className="mt-2 hidden w-full md:inline-flex"
          disabled={!hydrated || selectedIds.length !== 3}
          type="submit"
        >
          Periksa Pilihan
        </Button>
      </form>

      {evaluation?.canRevealHelp ? (
        <form action={revealRecallHelp}>
          <Button className="w-full" type="submit" variant="secondary">
            <RotateCcw aria-hidden="true" className="h-5 w-5" />
            Tampilkan bantuan
          </Button>
        </form>
      ) : null}

      <FixedCta>
        <Button
          className="w-full"
          disabled={!hydrated || selectedIds.length !== 3}
          form="recall-form"
          type="submit"
        >
          Periksa Pilihan
        </Button>
      </FixedCta>
    </section>
  );
}
