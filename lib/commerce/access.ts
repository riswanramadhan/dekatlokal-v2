// Perhitungan status akses (murni, tanpa I/O) — dipakai server, client, dan test.
import type { Feature } from "./catalog";

export interface Entitlement {
  id: string;
  feature: Feature;
  resourceId: string | null;
  source: "trial" | "order";
  startsAt: string;
  expiresAt: string | null;
}

export interface AccessState {
  active: boolean;
  /** Ada hak akses berbayar (bukan sekadar trial). */
  paid: boolean;
  trialUsed: boolean;
  expiresAt: string | null;
  daysLeft: number | null;
}

const isLive = (item: Entitlement, now = Date.now()) => new Date(item.startsAt).getTime() <= now && (item.expiresAt === null || new Date(item.expiresAt).getTime() > now);

/**
 * Status akses sebuah fitur. Hak akses tanpa resource (akun) berlaku untuk semua resource;
 * trial dicatat per akun (sekali pakai) dan juga berlaku untuk resource apa pun.
 */
export function accessFrom(items: Entitlement[], feature: Feature, resourceId?: string | null): AccessState {
  const relevant = items.filter((item) => item.feature === feature && (item.resourceId === null || !resourceId || item.resourceId === resourceId || item.source === "trial"));
  const live = relevant.filter((item) => isLive(item));
  const forever = live.some((item) => item.expiresAt === null);
  const latest = live.map((item) => item.expiresAt).filter((value): value is string => Boolean(value)).sort().at(-1) ?? null;
  const expiresAt = forever ? null : latest;
  return {
    active: live.length > 0,
    paid: live.some((item) => item.source === "order"),
    trialUsed: items.some((item) => item.feature === feature && item.source === "trial"),
    expiresAt,
    daysLeft: live.length === 0 ? 0 : expiresAt === null ? null : Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86_400_000)),
  };
}

