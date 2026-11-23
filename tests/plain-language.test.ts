import { describe, expect, it } from "vitest";
import { instrument } from "@/lib/decision-engine";
import { levelLabels, plainDimension, plainDimensions, plainQuestion, plainQuestions } from "@/lib/digital-checkup/plain-language";

describe("lapisan bahasa mudah", () => {
  it("menyediakan judul, penjelasan, dan contoh untuk semua 32 pertanyaan", () => {
    for (const question of instrument.questions) {
      const plain = plainQuestions[question.code];
      expect(plain, question.code).toBeTruthy();
      expect(plain.title.length).toBeGreaterThan(8);
      expect(plain.title.length).toBeLessThanOrEqual(60);
      expect(plain.hint.length).toBeGreaterThan(10);
      expect(plain.example.startsWith("Contoh:")).toBe(true);
    }
    expect(Object.keys(plainQuestions)).toHaveLength(32);
  });
  it("menyediakan nama ramah untuk delapan bagian", () => {
    for (const dimension of instrument.dimensions) expect(plainDimensions[dimension.code], dimension.code).toBeTruthy();
    expect(Object.keys(plainDimensions)).toHaveLength(8);
    expect(levelLabels).toHaveLength(5);
  });
  it("jatuh kembali ke teks instrumen bila kode tidak dikenal", () => {
    expect(plainQuestion("Q99").title).toBe("Q99");
    expect(plainDimension("C9").friendlyTitle).toBe("C9");
    expect(plainQuestion("Q01").title).toBe("Siapa pembeli utamamu?");
  });
});
