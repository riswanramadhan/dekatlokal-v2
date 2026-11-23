import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildModel, DIMENSIONS, instrument, MODULES, PAIRS, topsis, type ExpertInput } from "@/lib/decision-engine";
import { witaDate } from "@/lib/layanan/request-schema";

const mocks = vi.hoisted(() => ({ actor: vi.fn(), client: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({ requireActor: mocks.actor, serviceClient: mocks.client }));

import { GET as overviewGet, POST as requestPost } from "@/app/api/digital-checkup/layanan/route";
import { GET as reportGet } from "@/app/api/digital-checkup/layanan/laporan-pro/route";
import { GET as adminGet, POST as adminPost } from "@/app/api/digital-checkup/layanan/admin/route";

const USER = "11111111-1111-4111-8111-111111111111";
type Call = { table: string; op: string; args: unknown[] };
let calls: Call[] = [];

/** Klien Supabase palsu: data per tabel, semua operasi dicatat untuk diperiksa. */
function fakeDb(tables: Record<string, unknown[]>) {
  const from = (table: string) => {
    let op = "select";
    const result = () => {
      if (op === "insert" || op === "update") return { data: { id: "req-1", user_id: USER, kind: "consultation", status: "new", payload: {}, order_id: null, admin_note: "", created_at: "2026-11-24T00:00:00Z", updated_at: "2026-11-24T00:00:00Z" }, error: null };
      return { data: tables[table] ?? [], error: null };
    };
    const chain: Record<string, unknown> = {};
    for (const name of ["select", "eq", "in", "order", "limit", "is", "not"]) chain[name] = (...args: unknown[]) => { calls.push({ table, op: name, args }); return chain; };
    for (const name of ["insert", "update"]) chain[name] = (...args: unknown[]) => { op = name; calls.push({ table, op: name, args }); return chain; };
    chain.single = () => Promise.resolve(result());
    chain.maybeSingle = () => Promise.resolve(op === "select" ? { data: (tables[table] ?? [])[0] ?? null, error: null } : result());
    chain.then = (resolve: (value: unknown) => unknown) => Promise.resolve(result()).then(resolve);
    return chain;
  };
  return { from, auth: { admin: { getUserById: async () => ({ data: { user: { email: "umkm@example.org" } } }) } } };
}

const day = (offset: number) => witaDate(new Date(), offset);
const booking = { kind: "consultation", payload: { slots: [{ date: day(2), window: "09-11" }, { date: day(3), window: "11-13" }, { date: day(4), window: "19-21" }], topic: "Urutan modul", whatsapp: "081234567890" } };
const post = (body: unknown) => new Request("http://localhost/api/digital-checkup/layanan", { method: "POST", headers: { Origin: "http://localhost", "Content-Type": "application/json" }, body: JSON.stringify(body) });
const entitlement = (feature: string) => ({ id: "e1", feature, resource_id: null, source: "order", starts_at: "2026-11-01T00:00:00Z", expires_at: null });
const activeOrder = { id: "22222222-2222-4222-8222-222222222222", code: "DL-ABCD1234", user_id: USER, product_code: "checkup_pro", amount: 79000, status: "active", resource_id: null, customer_note: "", admin_note: "", activated_at: "2026-11-02T00:00:00Z", created_at: "2026-11-01T00:00:00Z" };

const expert = (offset: number): ExpertInput => ({ pairs: PAIRS.map((pair) => ({ ...pair, preferred: "equal", intensity: 1 })), relevance: Object.fromEntries(MODULES.map((module, i) => [module, Object.fromEntries(DIMENSIONS.map((dimension, j) => [dimension, (i + j + offset) % 5]))])) });
const model = buildModel([expert(0), expert(1), expert(2)]);
const trace = topsis(Object.fromEntries(instrument.questions.map((q) => [q.code, q.dimension === "C5" ? 0 : 2])), model.w, model.R);

beforeEach(() => { vi.resetAllMocks(); calls = []; mocks.actor.mockResolvedValue({ id: USER, role: "umkm", name: "Pemilik" }); });

describe("gerbang akses di server", () => {
  it("permintaan konsultasi ditolak 403 tanpa hak akses checkup_pro, tanpa menulis apa pun", async () => {
    mocks.client.mockImplementation(() => fakeDb({ dc_entitlements: [] }));
    const response = await requestPost(post(booking));
    expect(response.status).toBe(403);
    expect((await response.json()).code).toBe("ACCESS_REQUIRED");
    expect(calls.some((call) => call.table === "dc_service_requests")).toBe(false);
    expect(mocks.actor).toHaveBeenCalledWith(["umkm"]);
  });

  it("hak akses GBP tidak membuka konsultasi Checkup Pro", async () => {
    mocks.client.mockImplementation(() => fakeDb({ dc_entitlements: [entitlement("gbp")] }));
    expect((await requestPost(post(booking))).status).toBe(403);
  });

  it("dengan hak akses aktif, permintaan dicatat milik pengguna dan ditautkan ke pesanan berbayar", async () => {
    mocks.client.mockImplementation(() => fakeDb({ dc_entitlements: [entitlement("checkup_pro")], dc_orders: [activeOrder], dc_service_requests: [] }));
    const response = await requestPost(post(booking));
    expect(response.status).toBe(200);
    const insert = calls.find((call) => call.table === "dc_service_requests" && call.op === "insert");
    expect(insert?.args[0]).toMatchObject({ user_id: USER, kind: "consultation", order_id: activeOrder.id, payload: { topic: "Urutan modul" } });
  });

  it("payload berisi kata sandi ditolak sebelum menyentuh database", async () => {
    mocks.client.mockImplementation(() => fakeDb({ dc_entitlements: [entitlement("website_care")] }));
    const response = await requestPost(post({ kind: "website_care", payload: { websiteUrl: "https://kopiteko.id", platform: "wordpress", accessMethod: "undang_editor", updates: "password: admin123", whatsapp: "081234567890" } }));
    expect(response.status).toBe(400);
    expect(calls).toHaveLength(0);
  });

  it("akun non-UMKM tidak bisa membaca ringkasan layanan", async () => {
    mocks.actor.mockRejectedValue(new Error("Akses tidak diizinkan. Masuk dengan akun yang sesuai."));
    const response = await overviewGet();
    expect(response.status).toBe(400);
    expect(mocks.client).not.toHaveBeenCalled();
  });
});

describe("unduhan Laporan Pro", () => {
  const ranked = { dc_umkm_profiles: [{ id: "umkm-1" }], dc_assessment_sessions: [{ id: "assessment-1", submitted_at: "2026-11-20T00:00:00Z", payload: { profile: { businessName: "Kopi Teko", whatsapp: "081234567890" } } }], dc_decision_runs: [{ id: "run-1", assessment_id: "assessment-1", created_at: "2026-11-20T00:01:00Z", trace }], dc_service_requests: [] };

  it("403 tanpa hak akses, tanpa membaca run", async () => {
    mocks.client.mockImplementation(() => fakeDb({ ...ranked, dc_entitlements: [] }));
    const response = await reportGet();
    expect(response.status).toBe(403);
    expect(calls.some((call) => call.table === "dc_decision_runs")).toBe(false);
  });

  it("PDF dari run RANKED terbaru bila hak akses aktif", async () => {
    mocks.client.mockImplementation(() => fakeDb({ ...ranked, dc_entitlements: [entitlement("checkup_pro")] }));
    const response = await reportGet();
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toContain("checkup-pro-kopi-teko.pdf");
    const body = await response.text();
    expect(body.startsWith("%PDF-1.4")).toBe(true);
    expect(body).toContain("Kopi Teko");
    expect(calls.find((call) => call.table === "dc_decision_runs" && call.op === "eq")?.args).toEqual(["status", "RANKED"]);
  });

  it("menjelaskan bila belum ada hasil berperingkat", async () => {
    mocks.client.mockImplementation(() => fakeDb({ ...ranked, dc_decision_runs: [], dc_entitlements: [entitlement("checkup_pro")] }));
    const response = await reportGet();
    expect(response.status).toBe(400);
    expect((await response.json()).error).toMatch(/berperingkat/);
  });
});

describe("admin permintaan", () => {
  it("hanya peran admin", async () => {
    mocks.actor.mockRejectedValue(new Error("Akses tidak diizinkan. Masuk dengan akun yang sesuai."));
    expect((await adminGet(new Request("http://localhost/api/digital-checkup/layanan/admin"))).status).toBe(400);
    expect(mocks.actor).toHaveBeenCalledWith(["admin"]);
    const update = new Request("http://localhost/api/digital-checkup/layanan/admin", { method: "POST", headers: { Origin: "http://localhost" }, body: JSON.stringify({ id: activeOrder.id, status: "done", note: "" }) });
    expect((await adminPost(update)).status).toBe(400);
    expect(mocks.client).not.toHaveBeenCalled();
  });

  it("filter default: permintaan terbuka", async () => {
    mocks.actor.mockResolvedValue({ id: "admin", role: "admin", name: "Admin" });
    mocks.client.mockImplementation(() => fakeDb({ dc_service_requests: [] }));
    const response = await adminGet(new Request("http://localhost/api/digital-checkup/layanan/admin?status=bogus"));
    expect(response.status).toBe(200);
    expect(calls.find((call) => call.table === "dc_service_requests" && call.op === "in")?.args).toEqual(["status", ["new", "scheduled", "in_progress"]]);
  });
});
