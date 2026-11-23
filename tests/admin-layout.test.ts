// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ actor: vi.fn(), configured: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({ currentActor: m.actor, supabaseConfigured: m.configured }));
vi.mock("next/image", () => ({ default: (props: { src: string; alt: string }) => createElement("img", { src: props.src, alt: props.alt }) }));
vi.mock("next/link", () => ({ default: (props: { href: string; children: unknown; className?: string; "aria-current"?: string }) => createElement("a", { href: props.href, className: props.className, "aria-current": props["aria-current"] }, props.children as string) }));
vi.mock("next/navigation", () => ({ usePathname: () => "/admin/checkup", useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
import AdminLayout from "@/app/admin/layout";
afterEach(cleanup);
beforeEach(() => { vi.resetAllMocks(); m.configured.mockReturnValue(true); });
const child = createElement("p", null, "ISI HALAMAN");

it("shows the sign-in form to a regular user and keeps the page content hidden", async () => {
  m.actor.mockResolvedValue({ id: "u", role: "umkm", name: "Pemilik" });
  render(await AdminLayout({ children: child }));
  expect(screen.getByRole("heading", { name: "Masuk admin" })).toBeTruthy();
  expect(screen.getByRole("alert").textContent).toContain("akses admin atau peneliti");
  expect(screen.queryByText("ISI HALAMAN")).toBeNull();
  expect(screen.queryByRole("navigation")).toBeNull();
});
it("shows the sign-in form without a notice when nobody is signed in, and a service notice when not configured", async () => {
  m.actor.mockResolvedValue(null);
  render(await AdminLayout({ children: child }));
  expect(screen.queryByRole("alert")).toBeNull();
  cleanup();
  m.configured.mockReturnValue(false);
  render(await AdminLayout({ children: child }));
  expect(screen.getByRole("status").textContent).toContain("belum tersedia");
  expect(m.actor).toHaveBeenCalledTimes(1);
});
it.each(["admin", "researcher"])("renders the shell with navigation and page content for a %s", async (role) => {
  m.actor.mockResolvedValue({ id: "a", role, name: "Riswan" });
  render(await AdminLayout({ children: child }));
  expect(screen.getByText("ISI HALAMAN")).toBeTruthy();
  const nav = screen.getByRole("navigation", { name: "Menu pengelola" });
  const links = Array.from(nav.querySelectorAll("a")).map((a) => a.getAttribute("href"));
  expect(links).toEqual(["/admin", "/admin/checkup", "/admin/ahli", "/admin/metode", "/admin/validasi", "/admin/ekspor"]);
  expect(screen.getByRole("link", { name: "Data checkup" })).toHaveAttribute("aria-current", "page");
  expect(screen.getByRole("button", { name: "Keluar" })).toBeTruthy();
  expect(screen.getByText("Riswan")).toBeTruthy();
});
it("falls back to sign-in when the session cannot be checked", async () => {
  m.actor.mockRejectedValue(new Error("PRIVATE DETAIL"));
  render(await AdminLayout({ children: child }));
  expect(screen.getByRole("alert").textContent).toContain("Sesi belum dapat diperiksa");
  expect(document.body.textContent).not.toContain("PRIVATE");
});
