// @vitest-environment jsdom
// SIMULASI: renders the admin dashboard from the real research route output built on in-memory rows.
import { createElement } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { builder, rows } from "./helpers/research-fixture";
const mocks = vi.hoisted(() => ({ actor: vi.fn(), client: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({ requireActor: mocks.actor, serviceClient: mocks.client }));
vi.mock("@/lib/digital-checkup/expert-access", () => ({ requireExpertActor: () => mocks.actor(["expert"]), expertRoster: () => [], expertEntry: async () => null }));
import { GET as researchGet } from "@/app/api/digital-checkup/research/route";
import { ResearchDashboard } from "@/components/digital-checkup/research-dashboard";

const posted: unknown[] = [];
beforeEach(async () => {
  mocks.actor.mockResolvedValue({ id: "admin", role: "admin" });
  mocks.client.mockReturnValue({ from: (table: string) => builder(rows[table] ?? []) });
  const data = await (await researchGet(new Request("http://localhost/api/digital-checkup/research"))).json();
  posted.length = 0;
  vi.stubGlobal("fetch", vi.fn(async (_url: string, init?: RequestInit) => { if (init?.method === "POST") posted.push(JSON.parse(String(init.body))); return new Response(JSON.stringify(init?.method === "POST" ? { ok: true } : data), { status: 200 }); }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.resetAllMocks(); });

it("shows stage-2 progress, aggregate metrics and per-expert rows from real route data", async () => {
  render(createElement(ResearchDashboard, { name: "SIMULASI" }));
  await screen.findByText("Alur demo yang siap dipakai");
  expect(screen.getByLabelText("Progres validasi tahap 2").textContent).toMatch(/1\/10.*3\/30/);
  fireEvent.click(screen.getByRole("button", { name: "Validasi & sensitivitas" }));
  expect(screen.getByText("Top-set hit rate", { selector: "span" })).toBeTruthy();
  expect(screen.getByText("Rata-rata Spearman", { selector: "span" }).parentElement?.textContent).toContain("(3/3 terdefinisi)");
  expect(screen.getAllByRole("row").some((row) => row.textContent?.includes("AHLI-SIM-1"))).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Data UMKM" }));
  expect(screen.getAllByText("U001").length).toBeGreaterThan(0);
  expect(screen.getByText("Draf")).toBeTruthy();
  expect(screen.getByText(/Draf belum dikirim/)).toBeTruthy();
});

it("captures an optional SUS questionnaire only when all ten items are answered", async () => {
  render(createElement(ResearchDashboard, { name: "SIMULASI" }));
  await screen.findByText("Alur demo yang siap dipakai");
  fireEvent.click(screen.getByRole("button", { name: "Uji aplikasi" }));
  expect(screen.getByText("Rata-rata SUS", { selector: "span" }).parentElement?.textContent).toContain("75,0");
  const form = screen.getByRole("button", { name: "Simpan observasi" }).closest("form")!;
  fireEvent.change(form.querySelector("select[name=assessment]")!, { target: { value: "a-1" } });
  fireEvent.change(form.querySelector("input[name=date]")!, { target: { value: "2026-11-24" } });
  fireEvent.change(form.querySelector("input[name=minutes]")!, { target: { value: "5" } });
  fireEvent.change(form.querySelector("input[name=ease]")!, { target: { value: "4" } });
  const items = screen.getAllByRole("combobox").filter((el) => (el as HTMLSelectElement).options[0]?.text === "Belum diisi");
  expect(items).toHaveLength(10);
  fireEvent.change(items[0], { target: { value: "5" } });
  fireEvent.submit(form);
  expect(screen.getByRole("status").textContent).toContain("Lengkapi 10 butir SUS");
  expect(posted).toHaveLength(0);
  items.forEach((item, i) => fireEvent.change(item, { target: { value: i % 2 ? "1" : "5" } }));
  expect(screen.getByText(/10\/10 terisi · skor 100,0/)).toBeTruthy();
  fireEvent.submit(form);
  await waitFor(() => expect(posted).toHaveLength(1));
  expect(posted[0]).toMatchObject({ action: "usability", payload: { assessmentId: "a-1", sus: [5, 1, 5, 1, 5, 1, 5, 1, 5, 1] } });
});
