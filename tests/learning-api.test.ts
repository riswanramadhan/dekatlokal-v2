import { beforeEach, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ actor: vi.fn(), client: vi.fn(), claim: vi.fn(), rows: [] as unknown[], rpc: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({ requireActor: m.actor, serviceClient: m.client }));
vi.mock("@/lib/digital-checkup/account", () => ({ claimGuest: m.claim }));
vi.mock("@/lib/digital-checkup/service", () => ({ guestAssessment: async () => null, publicAssessment: vi.fn(), runAssessment: vi.fn() }));
import { GET, POST } from "@/app/api/digital-checkup/learning/route";
import { freeCourses } from "@/lib/digital-checkup/curriculum";
const request = (body: unknown) => new Request("https://digitalcheckup.dekatlokal.com/api/digital-checkup/learning", { method: "POST", headers: { Origin: "https://digitalcheckup.dekatlokal.com" }, body: JSON.stringify(body) });
beforeEach(() => {
  vi.resetAllMocks(); m.rows = []; m.actor.mockResolvedValue({ id: "USER", role: "umkm", name: "" });
  m.rpc.mockImplementation(async (name:string)=>name==="dc_ensure_learning_access"?{data:{starts_at:"2026-09-14T00:00:00Z",expires_at:"2099-09-21T00:00:00Z"},error:null}:{data:null,error:null});
  const chain = { select: () => chain, eq: () => chain, then: (resolve: (x: unknown) => unknown) => Promise.resolve({ data: m.rows, error: null }).then(resolve) };
  m.client.mockReturnValue({ from: () => chain, rpc: m.rpc });
});
it("returns all free content but no quiz answer keys", async () => {
  const response = await GET(), body = await response.json();
  expect(body.courses).toHaveLength(7);
  expect(Object.keys(body.courses[0].quiz[0]).sort()).toEqual(["options", "question"]);
});
it("rejects skipping lessons or quizzes", async () => {
  const c = freeCourses[0];
  expect((await POST(request({ action: "lesson", code: c.code, lessonId: c.lessons[1].id, exercise: "Catatan simulasi yang cukup panjang.", complete: true }))).status).toBe(400);
  expect((await POST(request({ action: "quiz", code: c.code, answers: [0,0,0] }))).status).toBe(400);
  expect(m.rpc).not.toHaveBeenCalledWith("dc_save_learning",expect.anything());
});
it("uses the authenticated owner and server-calculated quiz score", async () => {
  const c = freeCourses[0]; m.rows = c.lessons.map(l => ({ lesson_id: l.id, completed: true }));
  const response = await POST(request({ action: "quiz", code: c.code, answers: c.quiz.map(q => q.correct), user_id: "ATTACKER", score: 0 }));
  expect((await response.json()).score).toBe(100);
  expect(m.rpc).toHaveBeenCalledWith("dc_save_learning", expect.objectContaining({ p_user: "USER", p_score: 100, p_complete: true }));
});
it("keeps progress but rejects writes after the seven-day access window",async()=>{
  m.rpc.mockImplementation(async(name:string)=>name==="dc_ensure_learning_access"?{data:{starts_at:"2026-09-01T00:00:00Z",expires_at:"2026-09-08T00:00:00Z"},error:null}:{data:null,error:null});
  const c=freeCourses[0];
  const response=await POST(request({action:"lesson",code:c.code,lessonId:c.lessons[0].id,exercise:"Catatan simulasi yang cukup panjang.",complete:true}));
  expect(response.status).toBe(400);
  expect((await response.json()).error).toContain("7 hari");
  expect(m.rpc).not.toHaveBeenCalledWith("dc_save_learning",expect.anything());
});
it("denies unauthenticated users before reading or saving progress", async () => {
  m.actor.mockRejectedValue(new Error("Akses tidak diizinkan."));
  expect((await GET()).status).toBe(400);
  expect(m.client).not.toHaveBeenCalled();
});
