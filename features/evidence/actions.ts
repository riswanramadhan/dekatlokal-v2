"use server";

import { z } from "zod";
import { evidenceDraftSchema } from "@/domain/schemas";
import { getRepositoriesForRequest } from "@/domain/services/app-service";

const taskDraftInputSchema = z.object({
  taskId: z.string(),
  text: z.string().max(1200),
  link: z.string().max(500),
  imageName: z.string().max(160),
  checklist: z.array(z.string()),
});

function toDraft(input: z.infer<typeof taskDraftInputSchema>) {
  return evidenceDraftSchema.parse({
    ...input,
    status: "draft",
    syncState: "synced",
    updatedAt: new Date().toISOString(),
  });
}

export async function saveEvidenceDraft(input: {
  taskId: string;
  text: string;
  link: string;
  imageName: string;
  checklist: string[];
}) {
  const parsed = taskDraftInputSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error" as const, message: "Periksa kembali isi draft." };
  }

  const repositories = await getRepositoriesForRequest();
  const task = await repositories.evidence.getTask(parsed.data.taskId);
  if (!task) {
    return { status: "error" as const, message: "Tugas tidak ditemukan." };
  }

  const draft = await repositories.evidence.saveDraft(toDraft(parsed.data));
  return { status: "saved" as const, draft };
}

export async function submitEvidence(input: {
  taskId: string;
  text: string;
  link: string;
  imageName: string;
  checklist: string[];
}) {
  const parsed = taskDraftInputSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error" as const, message: "Periksa kembali bukti tugas." };
  }

  const repositories = await getRepositoriesForRequest();
  const task = await repositories.evidence.getTask(parsed.data.taskId);
  if (!task) {
    return { status: "error" as const, message: "Tugas tidak ditemukan." };
  }

  if (
    !parsed.data.text &&
    !parsed.data.link &&
    !parsed.data.imageName &&
    parsed.data.checklist.length === 0
  ) {
    return {
      status: "error" as const,
      message: "Tambahkan minimal satu bukti sebelum mengirim.",
    };
  }

  const submitted = await repositories.evidence.submit(toDraft(parsed.data));
  if (submitted.syncState === "failed") {
    return {
      status: "upload_failed" as const,
      message: submitted.reviewerFeedback ?? "Unggahan belum berhasil.",
      draft: submitted,
    };
  }

  return { status: "submitted" as const, draft: submitted };
}
