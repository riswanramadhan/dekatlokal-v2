import { expect, it } from "vitest";
import { freeCourses, gradeQuiz } from "@/lib/digital-checkup/curriculum";
import { instrument } from "@/lib/decision-engine";
it("covers all seven real intervention modules with complete free journeys", () => {
  expect(freeCourses.map(c => c.code)).toEqual(instrument.modules.map(c => c.code));
  for (const course of freeCourses) {
    expect(course.lessons).toHaveLength(3); expect(course.quiz).toHaveLength(3);
    expect(new Set(course.lessons.map(l => l.id)).size).toBe(3);
    for (const lesson of course.lessons) { expect(lesson.steps).toHaveLength(3); expect(lesson.task.length).toBeGreaterThan(20); expect(lesson.example.length).toBeGreaterThan(20); }
    expect(gradeQuiz(course.code, course.quiz.map(q => q.correct))).toMatchObject({ score: 100, passed: true });
    expect(gradeQuiz(course.code, course.quiz.map(q => (q.correct + 1) % 3))).toMatchObject({ score: 0, passed: false });
    expect(gradeQuiz(course.code, course.quiz.map((q, i) => i === 0 ? (q.correct + 1) % 3 : q.correct))).toMatchObject({ score: 67, passed: true });
  }
});
it("rejects unknown modules, incomplete or out-of-range quiz answers", () => {
  for (const [code, answers] of [["A8", [0,0,0]], ["A1", [0]], ["A1", [0,0,3]], ["A1", [0,0,0.5]]] as [string, number[]][]) expect(() => gradeQuiz(code, answers)).toThrow();
});
