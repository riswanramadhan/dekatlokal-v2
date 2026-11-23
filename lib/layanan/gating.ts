// Gerbang akses layanan berbayar (murni). Server wajib memanggil ensureAccess dengan hak akses
// yang dibaca dari database; status di client hanya untuk tampilan.
import type { AccessState } from "@/lib/commerce/access";
import type { Feature } from "@/lib/commerce/catalog";

export class AccessRequiredError extends Error {
  readonly status = 403;
  constructor(message: string) { super(message); this.name = "AccessRequiredError"; }
}

const MESSAGES: Partial<Record<Feature, string>> = {
  checkup_pro: "Checkup Pro belum aktif di akunmu. Selesaikan pembayaran dulu, lalu admin akan mengaktifkannya.",
  gbp: "Layanan Optimasi Google Business Profile belum aktif di akunmu. Selesaikan pembayaran dulu, ya.",
  website_care: "Website Care belum aktif atau masa aktifnya sudah berakhir. Perpanjang dulu untuk mengirim permintaan.",
};

export function ensureAccess(access: AccessState, feature: Feature) {
  if (!access.active) throw new AccessRequiredError(MESSAGES[feature] ?? "Layanan ini belum aktif di akunmu.");
  return access;
}
