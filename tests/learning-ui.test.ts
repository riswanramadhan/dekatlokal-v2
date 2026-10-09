// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { freeCourses } from "@/lib/digital-checkup/curriculum";
const m = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock("@/components/digital-checkup/api", () => ({ api: m.api }));
vi.mock("next/image", () => ({ default: (props: { src: string; alt: string }) => createElement("img", props) }));
vi.mock("next/link", () => ({ default: (props: { href: string; children: unknown }) => createElement("a", { href: props.href }, props.children as string) }));
import { LearningDashboard } from "@/components/digital-checkup/learning-dashboard";
afterEach(cleanup);
it("completes a real free-module UI journey with isolated simulated storage", async () => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
  const progress: { module_code: string; lesson_id: string; completed: boolean; exercise: string; quiz_score: number | null }[] = [];
  const c = freeCourses[0];
  m.api.mockImplementation(async (_path: string, method?: string, body?: Record<string, unknown>) => {
    if (method === "POST" && body?.action === "lesson") {
      progress.push({ module_code: c.code, lesson_id: String(body.lessonId), completed: Boolean(body.complete), exercise: String(body.exercise), quiz_score: null });
      return { saved: true };
    }
    if (method === "POST" && body?.action === "quiz") {
      progress.push({ module_code: c.code, lesson_id: "__quiz", completed: true, exercise: "", quiz_score: 100 });
      return { score: 100, passed: true, feedback: c.quiz.map(q => ({ correct: true, explanation: q.explanation })) };
    }
    return { name: "SIMULASI", assessment: null, claimPending: false, access: {startsAt:"2026-09-14T00:00:00Z",expiresAt:"2099-09-21T00:00:00Z",active:true,daysLeft:7}, version: "DL-FREE-1.0", progress: [...progress], courses: freeCourses.map(x => ({ ...x, quiz: x.quiz.map(q => ({ question: q.question, options: q.options })) })) };
  });
  render(createElement(LearningDashboard));
  await waitFor(() => expect(screen.getAllByRole("button", { name: "Mulai belajar" })).toHaveLength(7));
  fireEvent.click(screen.getAllByRole("button", { name: "Mulai belajar" })[0]);
  expect(screen.getByRole("button", { name: /Cek pemahaman/ }).hasAttribute("disabled")).toBe(true);
  for (const lesson of c.lessons) {
    await screen.findByRole("heading", { name: lesson.title });
    fireEvent.change(screen.getByLabelText("Catatan praktikmu"), { target: { value: "SIMULASI: hasil latihan ini sudah dipraktikkan." } });
    fireEvent.click(screen.getByRole("button", { name: /Sudah dipraktikkan, lanjut/ }));
  }
  await screen.findByRole("heading", { name: "Cek pemahaman, yuk." });
  for (const q of c.quiz) fireEvent.click(screen.getByRole("radio", { name: q.options[q.correct] }));
  fireEvent.click(screen.getByRole("button", { name: /Periksa jawaban/ }));
  await screen.findByText("Modul ini sudah kamu tuntaskan.");
  expect(progress.filter(p => p.completed)).toHaveLength(4);
  fireEvent.click(screen.getByRole("button", { name: /Kembali ke modul/ }));
  await screen.findByRole("button", { name: "Lihat kembali" });
});
it("orders dashboard courses by the exact TOPSIS ranking",async()=>{
  vi.spyOn(window,"scrollTo").mockImplementation(()=>undefined);
  const ranking=["A7","A4","A2","A1","A3","A5","A6"].map((code,index)=>({code,rank:index+1,C:1-index/10,Dplus:index,Dminus:7-index}));
  m.api.mockResolvedValue({name:"Demo",claimPending:false,access:{startsAt:"2026-09-16T00:00:00Z",expiresAt:"2099-09-23T00:00:00Z",active:true,daysLeft:7},version:"DL-FREE-1.0",progress:[],courses:freeCourses.map(course=>({...course,quiz:course.quiz.map(item=>({question:item.question,options:item.options}))})),assessment:{status:"submitted",linked:true,run:{trace:{ranking,topSet:["A7"],status:"RANKED"}},payload:{profile:{}},scores:Array(8).fill(50)}});
  const {container}=render(createElement(LearningDashboard));
  await screen.findByText("Urutan modul dari hasil checkup-mu");
  const titles=[...container.querySelectorAll(".ld-card h3")].map(node=>node.textContent);
  expect(titles.slice(0,3)).toEqual(["Rencana kecil, jalan terus","Promosi yang punya arah","Merek yang gampang dikenali"]);
  expect(container.querySelector(".ld-card .chip")?.textContent).toBe("Prioritas #1");
  expect(screen.getByRole("button",{name:/Mulai modul pertama/})).toBeTruthy();
});
