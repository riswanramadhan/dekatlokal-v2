// Status tayang website & AI Admin (murni, tanpa I/O) — dipakai halaman publik, dashboard, API chat, dan test.
import { accessFrom, type AccessState, type Entitlement } from "@/lib/commerce/access";

export type SiteStatus = "draft" | "published";

export type SiteVisibility =
  /** Draf: tidak publik (404). */
  | "draft"
  /** Terbit dan masa gratis/berbayar aktif. */
  | "live"
  /** Terbit tetapi masa gratis habis dan belum di-upgrade: tampil halaman "tidak aktif". */
  | "inactive";

export interface SiteAvailability {
  visibility: SiteVisibility;
  publish: AccessState;
  ai: AccessState;
  /** Widget chat tampil di website publik. */
  chat: boolean;
  /** Label singkat untuk dashboard pemilik. */
  label: string;
}

export function siteAvailability(site: { id: string; status: SiteStatus; aiEnabled: boolean }, entitlements: Entitlement[]): SiteAvailability {
  const publish = accessFrom(entitlements, "site_publish", site.id);
  const ai = accessFrom(entitlements, "ai_admin", site.id);
  const visibility: SiteVisibility = site.status !== "published" ? "draft" : publish.active ? "live" : "inactive";
  const chat = visibility === "live" && ai.active && site.aiEnabled;
  const label = visibility === "draft" ? "Draf" : visibility === "inactive" ? "Tidak aktif" : publish.paid ? "Aktif permanen" : `Gratis · ${publish.daysLeft ?? 0} hari lagi`;
  return { visibility, publish, ai, chat, label };
}

/** Tahap AI Admin untuk tombol di dashboard. */
export type AiStage = "available" | "trial" | "paid" | "ended";
export function aiStage(ai: AccessState): AiStage {
  if (ai.active) return ai.paid ? "paid" : "trial";
  return ai.trialUsed || ai.paid ? "ended" : "available";
}
