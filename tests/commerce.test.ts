import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PRODUCTS, TRIAL_DAYS, productByCode } from "@/lib/commerce/catalog";
import { accessFrom, type Entitlement } from "@/lib/commerce/access";

const db = new PGlite();
const admin = randomUUID(), umkm = randomUUID(), researcher = randomUUID();
const one = async <T,>(sql: string, args: unknown[] = []) => (await db.query<T>(sql, args)).rows[0];

beforeAll(async () => {
  await db.exec("create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema public,auth to anon,authenticated,service_role; grant execute on function auth.uid() to authenticated,service_role;");
  for (const file of readdirSync("supabase/migrations").filter((f) => f.endsWith(".sql")).sort()) await db.exec(readFileSync(`supabase/migrations/${file}`, "utf8"));
  for (const id of [admin, umkm, researcher]) await db.query("insert into auth.users values($1)", [id]);
  await db.query("insert into dc_profiles(user_id,role) values($1,'admin'),($2,'umkm'),($3,'researcher')", [admin, umkm, researcher]);
}, 180000);
afterAll(async () => { await db.close(); });

describe.sequential("produk berbayar: pesanan, trial, dan aktivasi (PostgreSQL)", () => {
  it("trial hanya sekali per akun per fitur", async () => {
    const first = await one<{ id: string; expires_at: string }>("select * from dc_start_trial($1,'ai_admin',null,7)", [umkm]);
    const again = await one<{ id: string }>("select * from dc_start_trial($1,'ai_admin',null,7)", [umkm]);
    expect(again.id).toBe(first.id);
    expect(Number((await one<{ n: string }>("select count(*) n from dc_entitlements where user_id=$1 and feature='ai_admin'", [umkm])).n)).toBe(1);
  });

  it("trial ditolak untuk akun non-UMKM", async () => {
    await expect(db.query("select dc_start_trial($1,'ai_admin',null,7)", [researcher])).rejects.toThrow(/UMKM account required/);
  });

  it("hanya admin yang bisa mengaktifkan; pesanan tidak bisa diaktifkan dua kali", async () => {
    const order = await one<{ id: string; code: string }>("insert into dc_orders(user_id,product_code,amount) values($1,'ai_admin_monthly',99000) returning id,code", [umkm]);
    expect(order.code).toMatch(/^DL-[A-F0-9]{8}$/);
    await expect(db.query("select dc_activate_order($1,$2,'ai_admin',30,'')", [order.id, researcher])).rejects.toThrow(/Forbidden/);
    const ent = await one<{ source: string; expires_at: string }>("select * from dc_activate_order($1,$2,'ai_admin',30,'transfer BCA')", [order.id, admin]);
    expect(ent.source).toBe("order");
    expect((await one<{ status: string }>("select status from dc_orders where id=$1", [order.id])).status).toBe("active");
    await expect(db.query("select dc_activate_order($1,$2,'ai_admin',30,'')", [order.id, admin])).rejects.toThrow(/already processed/);
  });

  it("langganan bulan kedua diperpanjang dari masa aktif terakhir", async () => {
    const second = await one<{ id: string }>("insert into dc_orders(user_id,product_code,amount) values($1,'ai_admin_monthly',99000) returning id", [umkm]);
    await db.query("select dc_activate_order($1,$2,'ai_admin',30,'')", [second.id, admin]);
    const { days } = await one<{ days: string }>("select extract(day from max(expires_at) - now()) as days from dc_entitlements where user_id=$1 and feature='ai_admin' and source='order'", [umkm]);
    expect(Number(days)).toBeGreaterThanOrEqual(59);
  });

  it("pembelian sekali bayar tanpa batas waktu", async () => {
    const order = await one<{ id: string }>("insert into dc_orders(user_id,product_code,amount) values($1,'checkup_pro',79000) returning id", [umkm]);
    const ent = await one<{ expires_at: string | null }>("select * from dc_activate_order($1,$2,'checkup_pro',null,'')", [order.id, admin]);
    expect(ent.expires_at).toBeNull();
  });

  it("kode produk dan RLS terjaga", async () => {
    await expect(db.query("insert into dc_orders(user_id,product_code,amount) values($1,'gratis_selamanya',0)", [umkm])).rejects.toThrow();
    for (const table of ["dc_orders", "dc_entitlements"]) expect((await one<{ r: boolean }>("select rowsecurity r from pg_tables where tablename=$1", [table])).r).toBe(true);
  });
});

describe("katalog & status akses", () => {
  it("setiap produk punya fitur, harga, dan trial yang konsisten", () => {
    expect(PRODUCTS.map((p) => p.code).sort()).toEqual(["ai_admin_monthly", "checkup_pro", "gbp_optimization", "site_upgrade", "website_care_monthly"]);
    expect(productByCode("site_upgrade")?.price).toBe(499000);
    expect(TRIAL_DAYS).toEqual({ site_publish: 14, ai_admin: 7 });
  });
  it("accessFrom: trial aktif, trial habis, dan berbayar tanpa batas", () => {
    const now = Date.now(), day = 86_400_000;
    const trial: Entitlement = { id: "1", feature: "ai_admin", resourceId: null, source: "trial", startsAt: new Date(now - day).toISOString(), expiresAt: new Date(now + 6 * day).toISOString() };
    expect(accessFrom([trial], "ai_admin")).toMatchObject({ active: true, paid: false, trialUsed: true, daysLeft: 6 });
    const expired = { ...trial, expiresAt: new Date(now - 1000).toISOString() };
    expect(accessFrom([expired], "ai_admin")).toMatchObject({ active: false, trialUsed: true, daysLeft: 0 });
    const forever: Entitlement = { ...trial, id: "2", source: "order", feature: "site_publish", resourceId: "site-a", expiresAt: null };
    expect(accessFrom([forever], "site_publish", "site-a")).toMatchObject({ active: true, paid: true, daysLeft: null });
    expect(accessFrom([forever], "site_publish", "site-b").active).toBe(false);
  });
});
