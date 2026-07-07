import {
  AlertCircle,
  CheckCircle2,
  CircleDot,
  Clock3,
  FileUp,
  Lock,
  RotateCcw,
} from "lucide-react";
import type { ModuleState } from "@/domain/entities";

export const pathStateCopy: Record<
  ModuleState,
  { label: string; tone: string; icon: typeof CircleDot }
> = {
  completed: {
    label: "Selesai",
    tone: "bg-success-soft text-success",
    icon: CheckCircle2,
  },
  active: {
    label: "Aktif",
    tone: "bg-brand-primary-soft text-brand-primary",
    icon: CircleDot,
  },
  in_progress: {
    label: "Berjalan",
    tone: "bg-brand-primary-soft text-brand-primary",
    icon: CircleDot,
  },
  available: {
    label: "Tersedia",
    tone: "bg-surface-subtle text-text-secondary",
    icon: CircleDot,
  },
  needs_retry: {
    label: "Perkuat lagi",
    tone: "bg-warning-soft text-warning",
    icon: RotateCcw,
  },
  awaiting_evidence: {
    label: "Butuh bukti",
    tone: "bg-warning-soft text-warning",
    icon: FileUp,
  },
  awaiting_review: {
    label: "Menunggu review",
    tone: "bg-surface-subtle text-text-secondary",
    icon: Clock3,
  },
  locked: {
    label: "Terkunci",
    tone: "bg-danger-soft text-danger",
    icon: Lock,
  },
};

export function canStartModule(state: ModuleState) {
  return state !== "locked" && state !== "awaiting_review";
}

export function moduleStartLabel(state: ModuleState) {
  if (state === "needs_retry") {
    return "Perkuat lagi";
  }
  if (state === "awaiting_evidence") {
    return "Lengkapi bukti";
  }
  if (state === "completed") {
    return "Lihat hasil";
  }
  if (state === "available") {
    return "Mulai modul";
  }
  return "Lanjutkan modul";
}

export const warningIcon = AlertCircle;
