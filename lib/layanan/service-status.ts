// Status tiap layanan di halaman /layanan-pro (murni, aman di client).
import type { AccessState } from "@/lib/commerce/access";
import type { ProductCode } from "@/lib/commerce/catalog";

export interface OrderLike { code: string; productCode: ProductCode; status: "pending" | "active" | "cancelled"; createdAt: string }

export interface ServiceState {
  state: "active" | "pending" | "none";
  label: string;
  /** Kode pesanan yang masih menunggu pembayaran (juga dipakai untuk perpanjangan langganan). */
  pendingCode: string | null;
  expiresAt: string | null;
  daysLeft: number | null;
}

const shortDate = (iso: string) => new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Makassar" }).format(new Date(iso));

export function serviceState(access: AccessState | undefined, orders: OrderLike[], product: ProductCode): ServiceState {
  const pending = orders.filter((order) => order.productCode === product && order.status === "pending").sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const pendingCode = pending?.code ?? null;
  if (access?.active) {
    const until = access.expiresAt ? ` · sampai ${shortDate(access.expiresAt)}` : "";
    return { state: "active", label: `Aktif${until}`, pendingCode, expiresAt: access.expiresAt, daysLeft: access.daysLeft };
  }
  if (pendingCode) return { state: "pending", label: `Menunggu pembayaran · ${pendingCode}`, pendingCode, expiresAt: null, daysLeft: null };
  const hadBefore = orders.some((order) => order.productCode === product && order.status === "active");
  return { state: "none", label: hadBefore ? "Masa aktif berakhir" : "Belum dibeli", pendingCode: null, expiresAt: null, daysLeft: null };
}
