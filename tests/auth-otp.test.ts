import { beforeEach, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ auth: { signInWithOtp: vi.fn(), verifyOtp: vi.fn(), signInWithOAuth: vi.fn(), signOut: vi.fn() }, finish: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({ authClient: async () => ({ auth: m.auth }) }));
vi.mock("@/lib/digital-checkup/account", () => ({ finishSignIn: m.finish }));
import { POST } from "@/app/api/digital-checkup/auth/route";
const origin = "https://digitalcheckup.dekatlokal.com";
function request(body: unknown) { return new Request(origin + "/api/digital-checkup/auth", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: JSON.stringify(body) }); }
beforeEach(() => { vi.resetAllMocks(); });
it("requests OTP for new users with the production callback", async () => {
  m.auth.signInWithOtp.mockResolvedValue({ error: null });
  expect((await POST(request({ mode: "otp_request", email: "test@example.org" }))).status).toBe(200);
  expect(m.auth.signInWithOtp).toHaveBeenCalledWith({ email: "test@example.org", options: { shouldCreateUser: true, emailRedirectTo: origin + "/auth/callback" } });
  expect(m.finish).not.toHaveBeenCalled();
});
it("verifies email OTP before claiming a checkup", async () => {
  m.auth.verifyOtp.mockResolvedValue({ error: null }); m.finish.mockResolvedValue("/dashboard");
  const response = await POST(request({ mode: "otp_verify", email: "test@example.org", token: "123456" }));
  expect(await response.json()).toEqual({ next: "/dashboard" });
  expect(m.auth.verifyOtp).toHaveBeenCalledWith({ email: "test@example.org", token: "123456", type: "email" });
});
it("rejects invalid/expired OTP without claiming anything", async () => {
  m.auth.verifyOtp.mockResolvedValue({ error: { message: "PRIVATE PROVIDER DETAIL" } });
  const response = await POST(request({ mode: "otp_verify", email: "test@example.org", token: "123456" }));
  expect(response.status).toBe(400); expect(await response.text()).not.toContain("PRIVATE");
  expect(m.finish).not.toHaveBeenCalled();
  expect((await POST(request({ mode: "otp_verify", email: "test@example.org", token: "123" }))).status).toBe(400);
});
it("Google uses the production callback", async () => {
  m.auth.signInWithOAuth.mockResolvedValue({ data: { url: "https://accounts.google.com/" }, error: null });
  expect((await POST(request({ mode: "google" }))).status).toBe(200);
  expect(m.auth.signInWithOAuth).toHaveBeenCalledWith({ provider: "google", options: { redirectTo: origin + "/auth/callback" } });
});
