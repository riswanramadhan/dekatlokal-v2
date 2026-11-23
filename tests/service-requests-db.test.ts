import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const db = new PGlite();
const umkm = randomUUID(), other = randomUUID();
const one = async <T,>(sql: string, args: unknown[] = []) => (await db.query<T>(sql, args)).rows[0];

beforeAll(async () => {
  await db.exec("create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema public,auth to anon,authenticated,service_role; grant execute on function auth.uid() to authenticated,service_role;");
  for (const file of readdirSync("supabase/migrations").filter((f) => f.endsWith(".sql")).sort()) await db.exec(readFileSync(`supabase/migrations/${file}`, "utf8"));
  for (const id of [umkm, other]) await db.query("insert into auth.users values($1)", [id]);
  await db.query("insert into dc_profiles(user_id,role) values($1,'umkm'),($2,'umkm')", [umkm, other]);
}, 180000);
afterAll(async () => { await db.close(); });

describe.sequential("dc_service_requests (PostgreSQL)", () => {
  it("RLS aktif dan default status 'new'", async () => {
    expect((await one<{ r: boolean }>("select rowsecurity r from pg_tables where tablename='dc_service_requests'")).r).toBe(true);
    const row = await one<{ status: string; admin_note: string }>("insert into dc_service_requests(user_id,kind,payload) values($1,'consultation',$2) returning status,admin_note", [umkm, { topic: "Urutan modul" }]);
    expect(row).toEqual({ status: "new", admin_note: "" });
  });

  it("menolak jenis, status, dan payload yang tidak valid", async () => {
    await expect(db.query("insert into dc_service_requests(user_id,kind,payload) values($1,'seo',$2)", [umkm, {}])).rejects.toThrow();
    await expect(db.query("insert into dc_service_requests(user_id,kind,status,payload) values($1,'gbp','paid',$2)", [umkm, {}])).rejects.toThrow();
    await expect(db.query("insert into dc_service_requests(user_id,kind,payload) values($1,'gbp','[1,2]'::jsonb)", [umkm])).rejects.toThrow();
    await expect(db.query("insert into dc_service_requests(user_id,kind,payload) values($1,'gbp',$2)", [umkm, { note: "x".repeat(21000) }])).rejects.toThrow();
  });

  it("hanya satu permintaan berstatus 'new' per jenis per akun", async () => {
    await expect(db.query("insert into dc_service_requests(user_id,kind,payload) values($1,'consultation',$2)", [umkm, {}])).rejects.toThrow(/duplicate key/);
    await db.query("update dc_service_requests set status='scheduled' where user_id=$1 and kind='consultation'", [umkm]);
    await db.query("insert into dc_service_requests(user_id,kind,payload) values($1,'consultation',$2)", [umkm, {}]);
    expect(Number((await one<{ n: string }>("select count(*) n from dc_service_requests where user_id=$1 and kind='consultation'", [umkm])).n)).toBe(2);
  });

  it("pesanan yang ditautkan harus milik pengguna yang sama", async () => {
    const own = await one<{ id: string }>("insert into dc_orders(user_id,product_code,amount,status) values($1,'gbp_optimization',149000,'active') returning id", [umkm]);
    const foreign = await one<{ id: string }>("insert into dc_orders(user_id,product_code,amount,status) values($1,'gbp_optimization',149000,'active') returning id", [other]);
    await expect(db.query("insert into dc_service_requests(user_id,kind,payload,order_id) values($1,'gbp',$2,$3)", [umkm, {}, foreign.id])).rejects.toThrow(/another user/);
    const ok = await one<{ order_id: string }>("insert into dc_service_requests(user_id,kind,payload,order_id) values($1,'gbp',$2,$3) returning order_id", [umkm, {}, own.id]);
    expect(ok.order_id).toBe(own.id);
  });

  it("pengguna hanya bisa membaca miliknya sendiri dan tidak bisa menulis langsung", async () => {
    await db.query("insert into dc_service_requests(user_id,kind,payload) values($1,'website_care',$2)", [other, { websiteUrl: "https://contoh.id" }]);
    await db.exec("set role authenticated");
    try {
      await db.query("select set_config('request.jwt.claim.sub',$1,false)", [umkm]);
      const mine = await db.query<{ user_id: string }>("select user_id from dc_service_requests");
      expect(mine.rows.length).toBe(3);
      expect(mine.rows.every((row) => row.user_id === umkm)).toBe(true);
      await expect(db.query("insert into dc_service_requests(user_id,kind,payload) values($1,'gbp','{}')", [umkm])).rejects.toThrow(/permission denied/);
      await expect(db.query("update dc_service_requests set status='done'")).rejects.toThrow(/permission denied/);
    } finally { await db.exec("reset role"); }
    await db.exec("set role anon");
    try { await expect(db.query("select * from dc_service_requests")).rejects.toThrow(/permission denied/); } finally { await db.exec("reset role"); }
  });

  it("service_role mengelola semua permintaan", async () => {
    await db.exec("set role service_role");
    try {
      expect(Number((await one<{ n: string }>("select count(*) n from dc_service_requests")).n)).toBe(4);
      await db.query("update dc_service_requests set status='in_progress', admin_note='Dihubungi via WA' where user_id=$1 and kind='website_care'", [other]);
    } finally { await db.exec("reset role"); }
    expect((await one<{ status: string }>("select status from dc_service_requests where user_id=$1 and kind='website_care'", [other])).status).toBe("in_progress");
  });
});
