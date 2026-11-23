import "server-only";
// Akses data website (service role, hanya di server). Semua fungsi pemilik selalu memfilter owner_id.
import { cache } from "react";
import { randomBytes } from "node:crypto";
import { serviceClient } from "@/lib/supabase/server";
import { dbError } from "@/lib/digital-checkup/http";
import { listEntitlements } from "@/lib/commerce/entitlements";
import type { Entitlement } from "@/lib/commerce/access";
import { isCategory } from "./categories";
import { coerceAi, coerceContent, isValidSlug, MAX_SITES_PER_OWNER, slugCandidates, SLUG_MAX, type SiteAi, type SiteContent } from "./schema";
import { isTemplateCode, type TemplateCode } from "./templates";
import type { ConversationDetail, ConversationSummary, SiteRecord, StoredChatMessage } from "./types";
import type { SiteStatus } from "./access";

const COLUMNS = "id,owner_id,slug,template_code,category,content,status,published_at,ai,created_at,updated_at";
type Row = { id: string; owner_id: string; slug: string; template_code: string; category: string; content: unknown; status: SiteStatus; published_at: string | null; ai: unknown; created_at: string; updated_at: string };

function mapSite(row: Row): SiteRecord {
  const category = isCategory(row.category) ? row.category : "toko";
  return {
    id: row.id,
    ownerId: row.owner_id,
    slug: row.slug,
    templateCode: (isTemplateCode(row.template_code) ? row.template_code : "warung") as TemplateCode,
    category,
    content: coerceContent(row.content, category),
    status: row.status,
    publishedAt: row.published_at,
    ai: coerceAi(row.ai),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const notFound = () => new Error("Website tidak ditemukan atau bukan milikmu.");
const UNIQUE_VIOLATION = "23505";

export async function listOwnerSites(ownerId: string): Promise<SiteRecord[]> {
  const { data, error } = await serviceClient().from("dc_sites").select(COLUMNS).eq("owner_id", ownerId).order("created_at", { ascending: true }).limit(MAX_SITES_PER_OWNER + 5);
  dbError(error);
  return ((data ?? []) as Row[]).map(mapSite);
}

export async function ownerSite(ownerId: string, id: string): Promise<SiteRecord> {
  const { data, error } = await serviceClient().from("dc_sites").select(COLUMNS).eq("id", id).eq("owner_id", ownerId).maybeSingle();
  dbError(error);
  if (!data) throw notFound();
  return mapSite(data as Row);
}

export async function slugTaken(slug: string, exceptId?: string | null) {
  let query = serviceClient().from("dc_sites").select("id").eq("slug", slug);
  if (exceptId) query = query.neq("id", exceptId);
  const { data, error } = await query.limit(1);
  dbError(error);
  return Boolean(data?.length);
}

/** Alamat yang masih kosong: pilihan pemilik bila tersedia, lalu nama/nama-kota/nama-2…, terakhir akhiran acak. */
export async function availableSlug(preferred: string | null, name: string, city = "", exceptId?: string | null) {
  const candidates = [...(preferred && isValidSlug(preferred) ? [preferred] : []), ...slugCandidates(name, city)];
  for (const candidate of candidates) if (!(await slugTaken(candidate, exceptId))) return candidate;
  const base = (candidates[0] ?? "usaha").slice(0, SLUG_MAX - 5).replace(/-+$/, "");
  return `${base}-${randomBytes(2).toString("hex")}`;
}

export async function createSite(ownerId: string, input: { template: TemplateCode; content: SiteContent; slug: string | null }) {
  const db = serviceClient();
  const { count, error: countError } = await db.from("dc_sites").select("id", { count: "exact", head: true }).eq("owner_id", ownerId);
  dbError(countError);
  if ((count ?? 0) >= MAX_SITES_PER_OWNER) throw new Error(`Satu akun bisa membuat maksimal ${MAX_SITES_PER_OWNER} website. Hapus salah satu draf dulu.`);
  if (input.slug && (await slugTaken(input.slug))) throw new Error("Alamat website itu sudah dipakai. Coba alamat lain.");
  const slug = input.slug ?? (await availableSlug(null, input.content.businessName, input.content.city));
  const { data, error } = await db.from("dc_sites").insert({ owner_id: ownerId, slug, template_code: input.template, category: input.content.category, content: input.content }).select(COLUMNS).single();
  if (error?.code === UNIQUE_VIOLATION) throw new Error("Alamat website itu baru saja dipakai. Coba alamat lain.");
  dbError(error);
  return mapSite(data as Row);
}

export async function updateSite(ownerId: string, id: string, patch: { template?: TemplateCode; content?: SiteContent; slug?: string; ai?: SiteAi }) {
  const current = await ownerSite(ownerId, id);
  if (patch.slug && patch.slug !== current.slug && (await slugTaken(patch.slug, id))) throw new Error("Alamat website itu sudah dipakai. Coba alamat lain.");
  const values: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.template) values.template_code = patch.template;
  if (patch.content) { values.content = patch.content; values.category = patch.content.category; }
  if (patch.slug) values.slug = patch.slug;
  if (patch.ai) values.ai = patch.ai;
  const { data, error } = await serviceClient().from("dc_sites").update(values).eq("id", id).eq("owner_id", ownerId).select(COLUMNS).single();
  if (error?.code === UNIQUE_VIOLATION) throw new Error("Alamat website itu baru saja dipakai. Coba alamat lain.");
  dbError(error);
  return { site: mapSite(data as Row), previousSlug: current.slug };
}

export async function setSiteStatus(ownerId: string, id: string, status: SiteStatus) {
  const current = await ownerSite(ownerId, id);
  const now = new Date().toISOString();
  const { data, error } = await serviceClient().from("dc_sites")
    .update({ status, published_at: status === "published" ? current.publishedAt ?? now : current.publishedAt, updated_at: now })
    .eq("id", id).eq("owner_id", ownerId).select(COLUMNS).single();
  dbError(error);
  return { site: mapSite(data as Row), firstPublish: status === "published" && !current.publishedAt };
}

export async function deleteSite(ownerId: string, id: string) {
  const current = await ownerSite(ownerId, id);
  const { error } = await serviceClient().from("dc_sites").delete().eq("id", id).eq("owner_id", ownerId);
  dbError(error);
  return current;
}

/** Website publik + hak akses pemiliknya. Di-cache per request agar metadata & halaman berbagi satu query. */
export const publicSite = cache(async (slug: string): Promise<{ site: SiteRecord; entitlements: Entitlement[] } | null> => {
  if (!isValidSlug(slug)) return null;
  const { data, error } = await serviceClient().from("dc_sites").select(COLUMNS).eq("slug", slug).maybeSingle();
  dbError(error);
  if (!data) return null;
  const site = mapSite(data as Row);
  return { site, entitlements: await listEntitlements(site.ownerId) };
});

// ─── Kotak masuk AI Admin ──────────────────────────────────────────────────
type ConversationRow = { session_id: string; message_count: number; last_message: string; created_at: string; updated_at: string; messages?: unknown };
const mapSummary = (row: ConversationRow): ConversationSummary => ({ sessionId: row.session_id, messageCount: row.message_count, lastMessage: row.last_message, createdAt: row.created_at, updatedAt: row.updated_at });

export async function listConversations(ownerId: string, siteId: string, limit = 50): Promise<ConversationSummary[]> {
  await ownerSite(ownerId, siteId);
  const { data, error } = await serviceClient().from("dc_site_conversations").select("session_id,message_count,last_message,created_at,updated_at").eq("site_id", siteId).order("updated_at", { ascending: false }).limit(limit);
  dbError(error);
  return ((data ?? []) as ConversationRow[]).map(mapSummary);
}

export async function conversationDetail(ownerId: string, siteId: string, sessionId: string): Promise<ConversationDetail> {
  await ownerSite(ownerId, siteId);
  const { data, error } = await serviceClient().from("dc_site_conversations").select("session_id,message_count,last_message,created_at,updated_at,messages").eq("site_id", siteId).eq("session_id", sessionId).maybeSingle();
  dbError(error);
  if (!data) throw new Error("Percakapan tidak ditemukan.");
  const row = data as ConversationRow;
  const messages = (Array.isArray(row.messages) ? row.messages : [])
    .filter((m): m is StoredChatMessage => Boolean(m) && typeof m === "object" && ["user", "assistant"].includes((m as StoredChatMessage).role) && typeof (m as StoredChatMessage).content === "string")
    .map((m) => ({ role: m.role, content: m.content, at: typeof m.at === "string" ? m.at : undefined }));
  return { ...mapSummary(row), messages };
}

/** Catat satu giliran chat. Gagal mencatat tidak boleh mengganggu pelanggan, jadi error hanya di-log. */
export async function logSiteTurn(siteId: string, sessionId: string, userMessage: string, reply: string, model: string) {
  try {
    const { error } = await serviceClient().rpc("dc_log_site_turn", { p_site: siteId, p_session: sessionId, p_user: userMessage, p_reply: reply, p_model: model });
    if (error) console.error("[ai-admin] gagal mencatat percakapan", error.message);
  } catch (error) {
    console.error("[ai-admin] gagal mencatat percakapan", error instanceof Error ? error.message : error);
  }
}
