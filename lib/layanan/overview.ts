import "server-only";
import { accessFrom, listEntitlements } from "@/lib/commerce/entitlements";
import { listOrders } from "@/lib/commerce/orders";
import { latestBusinessProfile } from "@/lib/commerce/business";
import { latestRankedRun } from "./pro-run";
import { listServiceRequests } from "./service-requests";

/** Ringkasan halaman /layanan-pro untuk satu akun UMKM: hak akses, pesanan, permintaan, dan data isian awal. */
export async function layananOverview(userId: string) {
  const [entitlements, orders, requests, business, ranked] = await Promise.all([listEntitlements(userId), listOrders(userId), listServiceRequests(userId), latestBusinessProfile(userId), latestRankedRun(userId, false)]);
  const profile = business?.profile ?? {};
  return {
    access: { checkup_pro: accessFrom(entitlements, "checkup_pro"), gbp: accessFrom(entitlements, "gbp"), website_care: accessFrom(entitlements, "website_care") },
    // Catatan internal admin tidak dikirim ke halaman pengguna.
    orders: orders.map(({ id, code, productCode, amount, status, createdAt, activatedAt }) => ({ id, code, productCode, amount, status, createdAt, activatedAt })),
    requests: requests.map(({ id, kind, status, payload, orderId, createdAt, updatedAt }) => ({ id, kind, status, payload, orderId, adminNote: "", createdAt, updatedAt })),
    proReady: Boolean(ranked),
    prefill: { businessName: profile.businessName ?? "", whatsapp: profile.whatsapp ?? "", googleMaps: profile.googleMaps ?? "", sector: profile.sector ?? "" },
  };
}
export type LayananOverview = Awaited<ReturnType<typeof layananOverview>>;
