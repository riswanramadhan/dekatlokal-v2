import { z } from "zod";
import { requireActor, serviceClient } from "@/lib/supabase/server";
import { claimGuest } from "@/lib/digital-checkup/account";
import { guestAssessment, publicAssessment, runAssessment } from "@/lib/digital-checkup/service";
import { CURRICULUM_VERSION, freeCourses, gradeQuiz } from "@/lib/digital-checkup/curriculum";
import { dbError, failure, json, readBody } from "@/lib/digital-checkup/http";
export async function GET() {
  try {
    const actor = await requireActor(["umkm"]), db = serviceClient();
    let claimPending = false;
    try { await claimGuest(actor.id); } catch { claimPending = true; }
    const row = await guestAssessment();
    let assessment = row ? await publicAssessment(row) : null;
    if (assessment?.linked && row?.status === "submitted" && !assessment.run) {
      try { await runAssessment(row); assessment = await publicAssessment(row); } catch { /* Worker retries. */ }
    }
    const { data: progress, error } = await db.from("dc_learning_progress").select("module_code,lesson_id,completed,exercise,quiz_score,updated_at").eq("user_id", actor.id).eq("curriculum_version", CURRICULUM_VERSION); dbError(error);
    return json({ name: actor.name, assessment: assessment?.linked ? assessment : null, claimPending, version: CURRICULUM_VERSION, progress: progress ?? [], courses: freeCourses.map((c) => ({ ...c, quiz: c.quiz.map((q) => ({ question: q.question, options: q.options })) })) });
  } catch (e) { return failure(e); }
}
export async function POST(request: Request) {
  try {
    const actor = await requireActor(["umkm"]), db = serviceClient();
    const input = z.discriminatedUnion("action", [
      z.object({ action: z.literal("lesson"), code: z.string(), lessonId: z.string(), exercise: z.string().trim().min(20, "Tulis hasil praktikmu, minimal 20 karakter.").max(3000), complete: z.boolean() }),
      z.object({ action: z.literal("quiz"), code: z.string(), answers: z.array(z.number().int().min(0).max(2)).length(3) }),
    ]).parse(await readBody(request));
    const course = freeCourses.find((c) => c.code === input.code); if (!course) throw new Error("Modul tidak ditemukan.");
    const { data: previous, error: pe } = await db.from("dc_learning_progress").select("lesson_id,completed,quiz_score").eq("user_id", actor.id).eq("curriculum_version", CURRICULUM_VERSION).eq("module_code", course.code); dbError(pe);
    const index = input.action === "lesson" ? course.lessons.findIndex((l) => l.id === input.lessonId) : course.lessons.length;
    if (index < 0) throw new Error("Materi tidak ditemukan.");
    if (course.lessons.slice(0, index).some((l) => !previous?.some((p) => p.lesson_id === l.id && p.completed))) throw new Error("Selesaikan materi sebelumnya agar belajarnya runtut.");
    if (input.action === "quiz") {
      const result = gradeQuiz(course.code, input.answers);
      const best = Math.max(result.score, previous?.find((p) => p.lesson_id === "__quiz")?.quiz_score ?? 0);
      const { error } = await db.rpc("dc_save_learning", { p_user: actor.id, p_version: CURRICULUM_VERSION, p_module: course.code, p_lesson: "__quiz", p_exercise: "", p_complete: best >= 67, p_score: best }); dbError(error);
      return json(result);
    }
    const { error } = await db.rpc("dc_save_learning", { p_user: actor.id, p_version: CURRICULUM_VERSION, p_module: course.code, p_lesson: input.lessonId, p_exercise: input.exercise, p_complete: input.complete, p_score: null }); dbError(error);
    return json({ saved: true });
  } catch (e) { return failure(e); }
}
