import "server-only";
import { serviceClient } from "@/lib/supabase/server";
import { dbError } from "@/lib/digital-checkup/http";
import { accessFrom, listEntitlements } from "@/lib/commerce/entitlements";
import { listOrders } from "@/lib/commerce/orders";
import { latestBusinessProfiles } from "@/lib/commerce/business";
import { ensureAccess } from "./gating";
import { FEATURE_FOR_KIND, OPEN_STATUSES, PRODUCT_FOR_KIND, planRequestWrite, type RequestInput, type RequestKind, type RequestStatus, type ServiceRequest } from "./request-schema";

type Row = { id: string; user_id: string; kind: RequestKind; status: RequestStatus; payload: Record<string, unknown> | null; order_id: string | null; admin_note: string; created_at: string; updated_at: string };
const columns = "id,user_id,kind,status,payload,order_id,admin_note,created_at,updated_at";
const map = (row: Row): ServiceRequest & { userId: string } => ({ id: row.id, userId: row.user_id, kind: row.kind, status: row.status, payload: row.payload ?? {}, orderId: row.order_id, adminNote: row.admin_note, createdAt: row.created_at, updatedAt: row.updated_at });

export async function listServiceRequests(userId: string) {
  const { data, error } = await serviceClient().from("dc_service_requests").select(columns).eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
  dbError(error);
  return ((data ?? []) as Row[]).map(map);
}

/**
 * Membuat atau memperbarui permintaan layanan. Hak akses selalu dicek di server dari dc_entitlements
 * sebelum menulis apa pun; payload sudah divalidasi zod oleh pemanggil (requestInputSchema).
 */
export async function submitServiceRequest(userId: string, input: RequestInput) {
  const feature = FEATURE_FOR_KIND[input.kind];
  ensureAccess(accessFrom(await listEntitlements(userId), feature), feature);
  const [orders, existing] = await Promise.all([listOrders(userId), listServiceRequests(userId)]);
  const paid = orders.filter((order) => order.productCode === PRODUCT_FOR_KIND[input.kind] && order.status === "active").sort((a, b) => (b.activatedAt ?? b.createdAt).localeCompare(a.activatedAt ?? a.createdAt));
  const plan = planRequestWrite(input.kind, existing, paid.length);
  if (plan.action === "reject") throw new Error(plan.message);
  const db = serviceClient();
  if (plan.action === "update") {
    const { data, error } = await db.from("dc_service_requests").update({ payload: input.payload, updated_at: new Date().toISOString() }).eq("id", plan.id).eq("user_id", userId).eq("status", "new").select(columns).maybeSingle();
    dbError(error);
    if (!data) throw new Error("Permintaan sudah diproses admin. Muat ulang halaman untuk melihat statusnya.");
    return { request: map(data as Row), updated: true };
  }
  const { data, error } = await db.from("dc_service_requests").insert({ user_id: userId, kind: input.kind, payload: input.payload, order_id: paid[0]?.id ?? null }).select(columns).single();
  dbError(error);
  return { request: map(data as Row), updated: false };
}

// ─── Admin ────────────────────────────────────────────────────────────────

export interface AdminServiceRequest extends ServiceRequest {
  userId: string;
  email: string;
  businessName: string;
  whatsapp: string;
  orderCode: string | null;
}
export type RequestStatusFilter = RequestStatus | "open" | "all";

export async function listAllServiceRequests({ kind = "all", status = "open" }: { kind?: RequestKind | "all"; status?: RequestStatusFilter }): Promise<AdminServiceRequest[]> {
  const db = serviceClient();
  let query = db.from("dc_service_requests").select(columns).order("created_at", { ascending: false }).limit(200);
  if (kind !== "all") query = query.eq("kind", kind);
  if (status === "open") query = query.in("status", OPEN_STATUSES);
  else if (status !== "all") query = query.eq("status", status);
  const { data, error } = await query;
  dbError(error);
  const requests = ((data ?? []) as Row[]).map(map);
  const userIds = [...new Set(requests.map((item) => item.userId))];
  const orderIds = [...new Set(requests.map((item) => item.orderId).filter((id): id is string => Boolean(id)))];
  const [profiles, emails, orderCodes] = await Promise.all([
    latestBusinessProfiles(userIds),
    Promise.all(userIds.map(async (id) => [id, (await db.auth.admin.getUserById(id)).data.user?.email ?? ""] as const)),
    orderIds.length
      ? db.from("dc_orders").select("id,code").in("id", orderIds).then(({ data: rows, error: orderError }) => { dbError(orderError); return new Map(((rows ?? []) as { id: string; code: string }[]).map((row) => [row.id, row.code])); })
      : Promise.resolve(new Map<string, string>()),
  ]);
  const emailMap = new Map(emails);
  return requests.map((item) => {
    const profile = profiles.get(item.userId)?.profile;
    const contact = typeof item.payload.whatsapp === "string" ? item.payload.whatsapp : "";
    return { ...item, email: emailMap.get(item.userId) ?? "", businessName: profile?.businessName?.trim() ?? "", whatsapp: contact || profile?.whatsapp || "", orderCode: item.orderId ? orderCodes.get(item.orderId) ?? null : null };
  });
}

export async function updateServiceRequest(id: string, status: RequestStatus, adminNote: string) {
  const { data, error } = await serviceClient().from("dc_service_requests").update({ status, admin_note: adminNote.slice(0, 2000), updated_at: new Date().toISOString() }).eq("id", id).select("id").maybeSingle();
  dbError(error);
  if (!data) throw new Error("Permintaan tidak ditemukan. Muat ulang halaman.");
}
