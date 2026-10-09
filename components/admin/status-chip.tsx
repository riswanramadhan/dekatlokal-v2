import type { ReactNode } from "react";
import { RUN_STATUS_TEXT, SESSION_STATUS_TEXT, type RunStatusKey } from "@/lib/digital-checkup/labels";

type Tone = "mint" | "primary" | "amber" | "coral" | "violet" | "neutral";
export function Chip({ tone = "neutral", children, dot = false, title }: { tone?: Tone; children: ReactNode; dot?: boolean; title?: string }) {
  return <span className={`adm-chip${tone === "neutral" ? "" : ` adm-chip-${tone}`}${dot ? " adm-chip-dot" : ""}`} title={title}>{children}</span>;
}

export function RunStatusChip({ status }: { status: string | null | undefined }) {
  if (!status) return <Chip tone="neutral">Belum dihitung</Chip>;
  const text = RUN_STATUS_TEXT[status as RunStatusKey];
  return text ? <Chip tone={text.tone} dot title={text.explanation}>{text.chip}</Chip> : <Chip>{status}</Chip>;
}

export function SessionStatusChip({ status }: { status: string }) {
  const text = SESSION_STATUS_TEXT[status];
  return text ? <Chip tone={text.tone}>{text.chip}</Chip> : <Chip>{status}</Chip>;
}

export function ConsistencyChip({ consistent }: { consistent: boolean | null | undefined }) {
  if (consistent == null) return <Chip>Belum final</Chip>;
  return consistent ? <Chip tone="mint" dot>Konsisten ≤ 0,10</Chip> : <Chip tone="coral" dot>Tidak konsisten</Chip>;
}
