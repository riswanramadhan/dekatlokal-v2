"use client";

import { Eye, FileImage, Link2, LockKeyhole, RotateCcw, Save, Send } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import type { BusinessTask, EvidenceDraft } from "@/domain/entities";
import {
  Button,
  ButtonLink,
  Card,
  CardContent,
  FixedCta,
  Input,
  StatusPill,
  VisualPanel,
} from "@/components/ui";
import { saveEvidenceDraft, submitEvidence } from "@/features/evidence/actions";
import { useHydrated } from "@/lib/hooks/use-hydrated";

type DraftValue = {
  text: string;
  link: string;
  imageName: string;
  checklist: string[];
};

const emptyDraft: DraftValue = { text: "", link: "", imageName: "", checklist: [] };

export function TaskWorkspace({
  task,
  initialDraft,
  businessName,
  moduleTitle,
}: {
  task: BusinessTask;
  initialDraft: EvidenceDraft | null;
  businessName: string;
  moduleTitle: string;
}) {
  const [draft, setDraft] = useState<DraftValue>(
    initialDraft
      ? {
          text: initialDraft.text,
          link: initialDraft.link,
          imageName: initialDraft.imageName,
          checklist: initialDraft.checklist,
        }
      : emptyDraft,
  );
  const hydrated = useHydrated();
  const [status, setStatus] = useState(initialDraft?.status ?? "not_started");
  const [sync, setSync] = useState<"synced" | "pending" | "failed">(
    initialDraft?.syncState ?? "synced",
  );
  const [message, setMessage] = useState(initialDraft?.reviewerFeedback ?? "");
  const [preview, setPreview] = useState(false);
  const [isPending, startTransition] = useTransition();
  const initialRender = useRef(true);
  const revision = useRef(0);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const submitted =
    status === "submitted" || status === "approved" || status === "auto_approved";

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    if (submitted) return;
    const savedRevision = revision.current;
    const snapshot = { ...draft, checklist: [...draft.checklist] };
    const timeout = window.setTimeout(() => {
      saveQueue.current = saveQueue.current.then(async () => {
        const result = await saveEvidenceDraft({ taskId: task.id, ...snapshot });
        if (revision.current !== savedRevision) return;
        if (result.status === "saved") {
          setStatus(result.draft.status);
          setSync("synced");
          return;
        }
        setSync("failed");
      });
    }, 800);
    return () => window.clearTimeout(timeout);
  }, [draft, submitted, task.id]);

  const hasEvidence = Boolean(
    draft.text || draft.link || draft.imageName || draft.checklist.length,
  );
  function updateDraft(update: (current: DraftValue) => DraftValue) {
    revision.current += 1;
    setSync("pending");
    setDraft(update);
  }

  function submit() {
    startTransition(async () => {
      setSync("pending");
      await saveQueue.current;
      const result = await submitEvidence({ taskId: task.id, ...draft });
      if (result.status === "error") {
        setSync("failed");
        setMessage(result.message);
        return;
      }
      if (result.status === "upload_failed") {
        setSync("failed");
        setStatus(result.draft.status);
        setMessage(result.message);
        return;
      }
      setStatus(result.draft.status);
      setSync("synced");
      setMessage(result.draft.reviewerFeedback ?? "Tugas berhasil dikirim.");
    });
  }

  return (
    <div className="learning-focus mx-auto max-w-5xl space-y-5 pb-28 md:pb-0">
      <header className="overflow-hidden rounded-[var(--radius-xl)] bg-gradient-to-br from-surface-coral via-white to-surface-yellow p-5 shadow-[var(--shadow-card)] md:p-7">
        <StatusPill>Tugas usaha - {moduleTitle}</StatusPill>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-text-primary md:text-4xl">
          {task.title}
        </h1>
        <p className="mt-2 max-w-3xl text-base leading-7 text-text-secondary">
          {task.instruction}
        </p>
        <p aria-live="polite" className="mt-3 text-sm font-extrabold text-text-muted">
          {sync === "pending"
            ? "Menyimpan draft..."
            : sync === "failed"
              ? "Perlu dicoba lagi"
              : "Draft tersimpan"}
        </p>
      </header>

      {status === "needs_revision" ? (
        <div className="rounded-[24px] bg-warning-soft p-4 text-warning">
          <p className="font-extrabold">Perlu diperbaiki</p>
          <p className="mt-1 text-sm leading-6">
            {message || "Perjelas bukti agar hasil usaha mudah dipahami."}
          </p>
        </div>
      ) : null}

      {message ? (
        <div
          className={`rounded-[24px] p-4 text-sm leading-6 ${
            sync === "failed" ? "bg-danger-soft text-danger" : "bg-success-soft text-success"
          }`}
          role="status"
        >
          {message}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1fr_0.82fr]">
        <Card>
          <CardContent className="space-y-5 p-5 md:p-7">
            <div>
              <h2 className="text-2xl font-extrabold text-text-primary">
                Bukti dari usaha Anda
              </h2>
              <p className="mt-1 text-sm leading-6 text-text-secondary">
                Isi satu atau beberapa jenis bukti. Semua perubahan disimpan sebagai draft.
              </p>
            </div>

            <label className="grid gap-2">
              <span className="font-extrabold text-text-primary">Teks hasil usaha</span>
              <textarea
                className="min-h-36 w-full rounded-[24px] border border-white/70 bg-white/86 p-4 text-base leading-7 text-text-primary shadow-[var(--shadow-soft)]"
                disabled={!hydrated || submitted}
                onChange={(event) =>
                  updateDraft((current) => ({ ...current, text: event.target.value }))
                }
                placeholder="Tulis versi yang siap digunakan pelanggan"
                value={draft.text}
              />
            </label>

            <label className="grid gap-2">
              <span className="flex items-center gap-2 font-extrabold text-text-primary">
                <Link2 aria-hidden="true" className="h-4 w-4 text-brand-primary" />
                Tautan pendukung
              </span>
              <Input
                disabled={!hydrated || submitted}
                onChange={(event) =>
                  updateDraft((current) => ({ ...current, link: event.target.value }))
                }
                placeholder="https://..."
                type="url"
                value={draft.link}
              />
            </label>

            <label className="grid cursor-pointer gap-2 rounded-[28px] border border-dashed border-brand-primary/40 bg-gradient-to-br from-brand-primary-soft to-white p-5 shadow-[var(--shadow-soft)]">
              <span className="flex items-center gap-2 font-extrabold text-text-primary">
                <FileImage aria-hidden="true" className="h-5 w-5 text-brand-primary" />
                Bukti gambar
              </span>
              <span className="text-sm leading-6 text-text-secondary">
                {draft.imageName || "Pilih foto atau tangkapan layar. Demo hanya menyimpan nama file."}
              </span>
              <input
                accept="image/*"
                className="block w-full text-sm text-text-secondary file:mr-3 file:rounded-xl file:border-0 file:bg-white file:px-3 file:py-2 file:font-bold file:text-brand-primary"
                disabled={!hydrated || submitted}
                onChange={(event) =>
                  updateDraft((current) => ({
                    ...current,
                    imageName: event.target.files?.[0]?.name ?? current.imageName,
                  }))
                }
                type="file"
              />
            </label>

            <fieldset className="grid gap-3">
              <legend className="font-extrabold text-text-primary">Checklist sebelum kirim</legend>
              {task.checklistOptions.map((item) => (
                <label
                  className="flex min-h-14 items-start gap-3 rounded-[22px] bg-white/82 p-4 shadow-[var(--shadow-soft)]"
                  key={item}
                >
                  <input
                    checked={draft.checklist.includes(item)}
                    className="mt-1 h-4 w-4"
                    disabled={!hydrated || submitted}
                    onChange={(event) =>
                      updateDraft((current) => ({
                        ...current,
                        checklist: event.target.checked
                          ? [...current.checklist, item]
                          : current.checklist.filter((value) => value !== item),
                      }))
                    }
                    type="checkbox"
                  />
                  <span className="leading-6 text-text-primary">{item}</span>
                </label>
              ))}
            </fieldset>

            <Button
              className="w-full"
              disabled={!hydrated}
              onClick={() => setPreview((current) => !current)}
              variant="secondary"
            >
              <Eye aria-hidden="true" className="h-5 w-5" />
              {preview ? "Tutup preview" : "Preview hasil"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <VisualPanel tone="sky">
            <h2 className="text-lg font-extrabold text-text-primary">
              Contoh untuk {businessName}
            </h2>
            <p className="mt-2 text-base leading-7 text-text-secondary">
              {task.businessExample}
            </p>
            <div className="mt-4 rounded-[24px] bg-white/78 p-4 text-sm leading-6 text-text-primary shadow-[var(--shadow-soft)]">
              {task.template}
            </div>
          </VisualPanel>

          {preview ? (
            <VisualPanel tone="yellow">
              <StatusPill>Preview Aset Usaha</StatusPill>
              <h2 className="mt-3 text-lg font-extrabold text-text-primary">
                {task.createsAssetLabel}
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-base leading-7 text-text-secondary">
                {draft.text || draft.link || draft.imageName || "Isi bukti akan terlihat di sini."}
              </p>
              <p className="mt-2 text-sm leading-6 text-text-muted">{task.futureUse}</p>
            </VisualPanel>
          ) : null}

          <div className="flex items-start gap-3 rounded-[24px] bg-white/82 p-4 shadow-[var(--shadow-soft)]">
            <LockKeyhole aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />
            <p className="text-sm leading-6 text-text-secondary">
              Bukti hanya dipakai untuk progres, review mock, dan Aset Usaha {businessName}. Bukti tidak dipublikasikan tanpa persetujuan Anda.
            </p>
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        {submitted ? (
          <ButtonLink href={`/app/hasil-modul/${task.moduleId}`}>Lihat hasil modul</ButtonLink>
        ) : (
          <Button disabled={!hydrated || !hasEvidence || isPending} onClick={submit}>
            {sync === "failed" ? (
              <RotateCcw aria-hidden="true" className="h-5 w-5" />
            ) : (
              <Send aria-hidden="true" className="h-5 w-5" />
            )}
            {sync === "failed" ? "Coba kirim lagi" : "Kirim tugas usaha"}
          </Button>
        )}
      </div>

      <FixedCta>
        {submitted ? (
          <ButtonLink className="w-full" href={`/app/hasil-modul/${task.moduleId}`}>
            Lihat hasil modul
          </ButtonLink>
        ) : (
          <Button
            className="w-full"
            disabled={!hydrated || !hasEvidence || isPending}
            onClick={submit}
          >
            {sync === "failed" ? (
              <RotateCcw aria-hidden="true" className="h-5 w-5" />
            ) : (
              <Save aria-hidden="true" className="h-5 w-5" />
            )}
            {sync === "failed" ? "Coba kirim lagi" : "Kirim tugas usaha"}
          </Button>
        )}
      </FixedCta>
    </div>
  );
}
