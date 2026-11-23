import "server-only";
import { serviceClient } from "@/lib/supabase/server";
import { dbError } from "@/lib/digital-checkup/http";
import { adminWhatsApp } from "@/lib/digital-checkup/contact";
import { latestBusinessProfiles } from "./business";
import { formatRupiah, priceLabel, productByCode, type ProductCode } from "./catalog";

export interface OrderRecord {
  id: string;
  code: string;
  userId: string;
  productCode: ProductCode;
  amount: number;
  status: "pending" | "active" | "cancelled";
  resourceId: string | null;
  customerNote: string;
  adminNote: string;
  activatedAt: string | null;
  createdAt: string;
}

type Row = { id: string; code: string; user_id: string; product_code: ProductCode; amount: number; status: OrderRecord["status"]; resource_id: string | null; customer_note: string; admin_note: string; activated_at: string | null; created_at: string };
const columns = "id,code,user_id,product_code,amount,status,resource_id,customer_note,admin_note,activated_at,created_at";
const map = (row: Row): OrderRecord => ({ id: row.id, code: row.code, userId: row.user_id, productCode: row.product_code, amount: row.amount, status: row.status, resourceId: row.resource_id, customerNote: row.customer_note, adminNote: row.admin_note, activatedAt: row.activated_at, createdAt: row.created_at });

export function orderWhatsApp(order: Pick<OrderRecord, "code" | "productCode" | "amount">, businessName = "") {
  const product = productByCode(order.productCode);
  return adminWhatsApp(
    `Halo Admin DekatLokal, saya mau bayar pesanan ${order.code}: ${product?.name ?? order.productCode} (${formatRupiah(order.amount)}${product?.period === "month" ? "/bulan" : ""})${businessName ? ` untuk ${businessName}` : ""}. Mohon info cara pembayarannya.`,
  );
}

export async function listOrders(userId: string): Promise<OrderRecord[]> {
  const { data, error } = await serviceClient().from("dc_orders").select(columns).eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
  dbError(error);
  return ((data ?? []) as Row[]).map(map);
}

/** Membuat pesanan; pesanan menunggu yang sama dipakai ulang agar tidak dobel. */
export async function createOrder(userId: string, productCode: ProductCode, resourceId: string | null, note: string, businessName = "") {
  const product = productByCode(productCode);
  if (!product) throw new Error("Produk tidak dikenal.");
  if (product.needsResource && !resourceId) throw new Error("Pilih website yang ingin di-upgrade dulu.");
  const db = serviceClient();
  let query = db.from("dc_orders").select(columns).eq("user_id", userId).eq("product_code", productCode).eq("status", "pending");
  query = resourceId ? query.eq("resource_id", resourceId) : query.is("resource_id", null);
  const { data: existing, error: readError } = await query.limit(1).maybeSingle();
  dbError(readError);
  let order: OrderRecord;
  if (existing) {
    order = map(existing as Row);
  } else {
    const { data, error } = await db.from("dc_orders").insert({ user_id: userId, product_code: productCode, amount: product.price, resource_id: resourceId, customer_note: note.slice(0, 1000) }).select(columns).single();
    dbError(error);
    order = map(data as Row);
  }
  return { order, whatsappUrl: orderWhatsApp(order, businessName), priceLabel: priceLabel(product) };
}

// ─── Admin ────────────────────────────────────────────────────────────────

export interface AdminOrder extends OrderRecord {
  email: string;
  businessName: string;
  whatsapp: string;
}

export async function listAllOrders(status: "pending" | "active" | "cancelled" | "all" = "all"): Promise<AdminOrder[]> {
  const db = serviceClient();
  let query = db.from("dc_orders").select(columns).order("created_at", { ascending: false }).limit(200);
  if (status !== "all") query = query.eq("status", status);
  const { data, error } = await query;
  dbError(error);
  const orders = ((data ?? []) as Row[]).map(map);
  const userIds = [...new Set(orders.map((order) => order.userId))];
  const [profiles, emails] = await Promise.all([
    latestBusinessProfiles(userIds),
    Promise.all(userIds.map(async (id) => [id, (await db.auth.admin.getUserById(id)).data.user?.email ?? ""] as const)),
  ]);
  const emailMap = new Map(emails);
  return orders.map((order) => {
    const profile = profiles.get(order.userId)?.profile;
    return { ...order, email: emailMap.get(order.userId) ?? "", businessName: profile?.businessName?.trim() ?? "", whatsapp: profile?.whatsapp ?? "" };
  });
}

export async function activateOrder(actorId: string, orderId: string, adminNote: string) {
  const db = serviceClient();
  const { data, error } = await db.from("dc_orders").select("product_code,status").eq("id", orderId).maybeSingle();
  dbError(error);
  if (!data) throw new Error("Pesanan tidak ditemukan.");
  const product = productByCode(String(data.product_code));
  if (!product) throw new Error("Produk pesanan tidak dikenal.");
  const { error: rpcError } = await db.rpc("dc_activate_order", { p_order: orderId, p_actor: actorId, p_feature: product.feature, p_days: product.days, p_admin_note: adminNote.slice(0, 1000) });
  if (rpcError) throw new Error(/already processed/.test(rpcError.message) ? "Pesanan ini sudah diproses." : "Aktivasi gagal. Muat ulang lalu coba lagi.");
}

export async function cancelOrder(orderId: string, adminNote: string) {
  const { error } = await serviceClient().from("dc_orders").update({ status: "cancelled", admin_note: adminNote.slice(0, 1000), updated_at: new Date().toISOString() }).eq("id", orderId).eq("status", "pending");
  dbError(error);
}
