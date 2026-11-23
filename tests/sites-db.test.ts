import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { SAMPLE_CONTENT } from "@/lib/sites/samples";

const db = new PGlite();
const owner = randomUUID(), other = randomUUID();
const one = async <T,>(sql: string, args: unknown[] = []) => (await db.query<T>(sql, args)).rows[0];
const count = async (sql: string, args: unknown[] = []) => Number((await one<{ n: string }>(sql, args)).n);
let siteId = "";

beforeAll(async () => {
  await db.exec("create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema public,auth to anon,authenticated,service_role; grant execute on function auth.uid() to authenticated,service_role;");
  for (const file of readdirSync("supabase/migrations").filter((f) => f.endsWith(".sql")).sort()) await db.exec(readFileSync(`supabase/migrations/${file}`, "utf8"));
  for (const id of [owner, other]) await db.query("insert into auth.users values($1)", [id]);
  await db.query("insert into dc_profiles(user_id,role) values($1,'umkm'),($2,'umkm')", [owner, other]);
}, 180000);
afterAll(async () => { await db.close(); });

describe.sequential("website UMKM & AI Admin (PostgreSQL)", () => {
  it("tabel baru aktif RLS", async () => {
    for (const table of ["dc_sites", "dc_site_conversations"]) expect((await one<{ r: boolean }>("select rowsecurity r from pg_tables where tablename=$1", [table])).r, table).toBe(true);
  });

  it("menyimpan website dengan default AI dan menjaga aturan alamat/status", async () => {
    const row = await one<{ id: string; status: string; ai: { enabled: boolean } }>("insert into dc_sites(owner_id,slug,template_code,category,content) values($1,'dapur-sekar','warung','kuliner',$2) returning id,status,ai", [owner, SAMPLE_CONTENT.kuliner]);
    siteId = row.id;
    expect(row.status).toBe("draft");
    expect(row.ai).toEqual({ enabled: true, welcome: "", extraKnowledge: "" });
    const insert = (slug: string, extra = "") => db.query(`insert into dc_sites(owner_id,slug,template_code,category${extra ? ",status" : ""}) values($1,$2,'warung','kuliner'${extra ? `,'${extra}'` : ""})`, [other, slug]);
    for (const bad of ["Dapur", "ab", "-dapur", "dapur-", "dapur--sekar", "dapur sekar", "a".repeat(41)]) await expect(insert(bad), bad).rejects.toThrow();
    await expect(insert("dapur-sekar")).rejects.toThrow(/duplicate|unique/);
    await expect(insert("toko-lain", "published")).rejects.toThrow(); // terbit wajib punya published_at
    await expect(db.query("insert into dc_sites(owner_id,slug,template_code,category,status) values($1,'toko-x','warung','kuliner','arsip')", [other])).rejects.toThrow();
    await expect(db.query("insert into dc_sites(owner_id,slug,template_code,category,content) values($1,'toko-y','warung','kuliner','[]')", [other])).rejects.toThrow();
    await db.query("update dc_sites set status='published', published_at=now() where id=$1", [siteId]);
  });

  it("mencatat percakapan secara atomik dan membatasi riwayat", async () => {
    await db.query("select dc_log_site_turn($1,$2,$3,$4,$5)", [siteId, "sesi-pelanggan-1", "Berapa harga coto?", "**Coto Ayam Kampung Rp30.000**", "gemini-2.5-flash"]);
    await db.query("select dc_log_site_turn($1,$2,$3,$4,$5)", [siteId, "sesi-pelanggan-1", "Buka jam berapa?", "Senin–Sabtu 07.00–20.00", "static"]);
    const row = await one<{ messages: { role: string; content: string }[]; message_count: number; last_message: string }>("select messages,message_count,last_message from dc_site_conversations where site_id=$1 and session_id='sesi-pelanggan-1'", [siteId]);
    expect(row.message_count).toBe(4);
    expect(row.last_message).toBe("Buka jam berapa?");
    expect(row.messages.map((m) => m.role)).toEqual(["user", "assistant", "user", "assistant"]);
    expect(row.messages[1].content).toContain("Rp30.000");
    for (let i = 0; i < 55; i += 1) await db.query("select dc_log_site_turn($1,'sesi-panjang-01',$2,'ok','static')", [siteId, `pesan ${i} ${"x".repeat(700)}`]);
    const long = await one<{ len: number; message_count: number; first: string; last: string }>("select jsonb_array_length(messages) len, message_count, messages->0->>'content' first, last_message last from dc_site_conversations where session_id='sesi-panjang-01'");
    expect(long.len).toBe(100);
    expect(long.message_count).toBe(110);
    expect(long.first.startsWith("pesan 5 ")).toBe(true);
    expect(long.last.length).toBe(600);
    await expect(db.query("select dc_log_site_turn($1,'bad id!','a','b','c')", [siteId])).rejects.toThrow(/Invalid session/);
    await expect(db.query("select dc_log_site_turn($1,'sesi-kosong-1',' ','b','c')", [siteId])).rejects.toThrow(/Empty turn/);
  });

  it("pemilik hanya melihat website & percakapannya sendiri; publik tidak punya akses langsung", async () => {
    await db.query("insert into dc_sites(owner_id,slug,template_code,category) values($1,'toko-lain','etalase','toko')", [other]);
    await db.exec("set role authenticated");
    try {
      await db.query("select set_config('request.jwt.claim.sub',$1,false)", [owner]);
      expect(await count("select count(*) n from dc_sites")).toBe(1);
      expect(await count("select count(*) n from dc_site_conversations")).toBe(2);
      await expect(db.query("update dc_sites set status='draft' where id=$1", [siteId])).rejects.toThrow(/permission denied/);
      await expect(db.query("select dc_log_site_turn($1,'sesi-pelanggan-9','a','b','c')", [siteId])).rejects.toThrow(/permission denied/);
      await db.query("select set_config('request.jwt.claim.sub',$1,false)", [other]);
      expect(await count("select count(*) n from dc_sites")).toBe(1);
      expect(await count("select count(*) n from dc_site_conversations")).toBe(0);
    } finally { await db.exec("reset role"); }
    await db.exec("set role anon");
    try { await expect(db.query("select * from dc_sites")).rejects.toThrow(/permission denied/); } finally { await db.exec("reset role"); }
  });

  it("menghapus website ikut menghapus kotak masuknya", async () => {
    await db.query("delete from dc_sites where id=$1", [siteId]);
    expect(await count("select count(*) n from dc_site_conversations where site_id=$1", [siteId])).toBe(0);
  });
});
