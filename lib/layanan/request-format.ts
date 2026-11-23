// Ringkasan isi permintaan untuk admin (murni, aman di client).
import { ACCESS_METHODS, KIND_LABEL, MANAGER_ACCESS, WEBSITE_PLATFORMS, windowLabel, type RequestKind } from "./request-schema";

const str = (value: unknown) => typeof value === "string" ? value.trim() : "";
const labelOf = (items: readonly (readonly [string, string])[], code: unknown) => items.find(([value]) => value === code)?.[1] ?? (str(code) || "—");
const slotDate = (value: string) => {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(date);
};

export interface RequestRow { label: string; value: string; href?: string }

export function describeRequest(kind: RequestKind, payload: Record<string, unknown>): RequestRow[] {
  const contact = { label: "WhatsApp", value: str(payload.whatsapp) || "—" };
  if (kind === "consultation") {
    const slots = Array.isArray(payload.slots) ? payload.slots as { date?: unknown; window?: unknown }[] : [];
    return [
      ...slots.map((slot, index) => ({ label: `Pilihan ${index + 1}`, value: `${slotDate(str(slot.date))}, ${windowLabel(str(slot.window))}` })),
      { label: "Topik", value: str(payload.topic) || "—" },
      contact,
    ];
  }
  if (kind === "gbp") {
    const maps = str(payload.mapsUrl);
    const problems = Array.isArray(payload.problems) ? payload.problems.map(str).filter(Boolean) : [];
    return [
      { label: "Google Maps", value: maps || "Belum ada / belum muncul", href: maps.startsWith("https://") ? maps : undefined },
      { label: "Akses pengelola", value: labelOf(MANAGER_ACCESS, payload.managerAccess) },
      { label: "Kategori", value: str(payload.category) || "—" },
      { label: "Jam buka", value: str(payload.openingHours) || "—" },
      { label: "Produk utama", value: str(payload.mainProducts) || "—" },
      { label: "Masalah", value: problems.join("; ") || "—" },
      ...(str(payload.problemNote) ? [{ label: "Catatan", value: str(payload.problemNote) }] : []),
      contact,
    ];
  }
  const site = str(payload.websiteUrl);
  return [
    { label: "Website", value: site || "—", href: /^https?:\/\//.test(site) ? site : undefined },
    { label: "Platform", value: labelOf(WEBSITE_PLATFORMS, payload.platform) },
    { label: "Cara akses", value: labelOf(ACCESS_METHODS, payload.accessMethod) },
    { label: "Permintaan", value: str(payload.updates) || "—" },
    contact,
  ];
}

/** Tautan wa.me ke pelanggan; nomor 08… diubah ke 628…. Kosong bila nomor tidak ada. */
export function customerWhatsApp(phone: string, kind: RequestKind, businessName = "", orderCode: string | null = null) {
  const digits = phone.replace(/\D/g, "").replace(/^0/, "62").replace(/^8/, "628");
  if (digits.length < 9) return "";
  const text = `Halo${businessName ? ` ${businessName}` : ""}, ini Admin DekatLokal soal ${KIND_LABEL[kind]}${orderCode ? ` (pesanan ${orderCode})` : ""}.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
