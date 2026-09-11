import { z } from "zod";
import { conditionScores, crispMatrix, consistency, instrument, relevanceMatrix, MODULES } from "@/lib/decision-engine";

const text = (max: number) => z.string().trim().max(max);
const required = (max: number) => text(max).min(1, "Bagian ini perlu diisi.");
export const profileSchema = z.object({
  sector: required(100), district: required(100), businessAgeMonths: z.number().int().min(0).max(2400),
  peopleCount: z.number().int().min(1).max(100000), respondentRole: z.enum(["Pemilik", "Pengelola"]),
  salesChannels: z.array(required(60)).min(1).max(10), goal: required(500), note: text(1000).default(""), consent: z.literal(true),
});
export type BusinessProfile = z.infer<typeof profileSchema>;
export const answersSchema = z.record(z.string(), z.number().int().min(0).max(4).nullable()).superRefine((v, ctx) => {
  if (Object.keys(v).some((code) => !instrument.questions.some((q) => q.code === code))) ctx.addIssue({ code: "custom", message: "Kode pertanyaan tidak dikenal." });
});
export const assessmentSchema = z.object({ profile: profileSchema, answers: answersSchema, final: z.boolean(), revision: z.number().int().min(0), confirmed: z.boolean().default(false) }).superRefine((v, ctx) => {
  if (!v.final) return;
  if (!v.confirmed) ctx.addIssue({ code: "custom", path: ["confirmed"], message: "Tinjau dan konfirmasi jawaban sebelum kirim." });
  try { conditionScores(v.answers); } catch { ctx.addIssue({ code: "custom", path: ["answers"], message: "Lengkapi semua 32 pertanyaan, termasuk yang bernilai 0." }); }
});
const pairSchema = z.object({ left: required(2), right: required(2), preferred: required(5), intensity: z.number().int().min(1).max(9) });
export const expertDraftSchema = z.object({
  profile: z.object({ name: text(150), institution: text(150), jobTitle: text(150), experienceYears: z.number().min(0).max(100).nullable(), expertise: text(500), consent: z.boolean(), assessmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }),
  reviews: z.record(z.string(), z.object({ relevance: z.number().int().min(1).max(4).nullable(), clarity: z.number().int().min(1).max(4).nullable(), suggestion: text(1500) })),
  decision: z.enum(["layak_uji_coba", "perlu_revisi"]).nullable(), generalNote: text(3000), pairs: z.array(pairSchema).max(28),
  relevance: z.record(z.string(), z.record(z.string(), z.number().int().min(0).max(4).nullable())),
});
export type ExpertDraft = z.infer<typeof expertDraftSchema>;
export function validateExpertFinal(input: unknown) {
  const draft = expertDraftSchema.parse(input);
  const { profile } = draft;
  if (!profile.consent || !profile.name || !profile.institution || !profile.jobTitle || profile.experienceYears === null || !profile.expertise) throw new Error("Lengkapi profil dan persetujuan ahli.");
  if (draft.decision !== "layak_uji_coba") throw new Error("Instrumen perlu disepakati layak uji coba sebelum penilaian final. Simpan catatan revisi dan hubungi peneliti.");
  if (Object.keys(draft.reviews).length !== 32) throw new Error("Telaah semua 32 pertanyaan.");
  for (const q of instrument.questions) {
    const review = draft.reviews[q.code];
    if (!review || review.relevance === null || review.clarity === null) throw new Error(`Telaah ${q.code} belum lengkap.`);
    if ((review.relevance <= 2 || review.clarity <= 2) && !review.suggestion) throw new Error(`Tuliskan usulan perbaikan ${q.code}.`);
  }
  const result = consistency(crispMatrix(draft.pairs));
  if (!result.consistent) throw new Error(`CR ${result.CR.toFixed(4)} melebihi 0,10. Tinjau pasangan yang kurang konsisten.`);
  const relevance = draft.relevance as Record<string, Record<string, number>>;
  relevanceMatrix(relevance);
  return { ...draft, relevance, consistency: result };
}
export const caseSchema = z.object({ decision: z.enum(["Dinilai", "Tidak dapat menilai"]), ranks: z.record(z.string(), z.number().int().min(1).max(7)), rationale: text(2000), final: z.boolean(), confirmed: z.boolean().default(false) }).superRefine((v, ctx) => {
  if (!v.final) return;
  if (!v.rationale) ctx.addIssue({ code: "custom", path: ["rationale"], message: "Tuliskan alasan penilaian." });
  if (!v.confirmed) ctx.addIssue({ code: "custom", message: "Konfirmasi penilaian final." });
  if (v.decision === "Dinilai" && (Object.keys(v.ranks).length !== 7 || new Set(MODULES.map((m) => v.ranks[m])).size !== 7 || MODULES.some((m) => !v.ranks[m]))) ctx.addIssue({ code: "custom", message: "Urutkan ketujuh modul dengan peringkat unik 1–7." });
  if (v.decision === "Tidak dapat menilai" && Object.keys(v.ranks).length) ctx.addIssue({ code: "custom", message: "Abstain tidak menggunakan peringkat." });
});
export const usabilitySchema = z.object({ assessmentId: z.string().uuid(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), tasks: z.record(z.string(), z.enum(["selesai", "dengan_bantuan", "gagal"])).refine((x) => Object.keys(x).length > 0), minutes: z.number().positive().max(1440), ease: z.number().int().min(1).max(5), note: text(2000) });
export function blankExpert(): ExpertDraft {
  return { profile: { name: "", institution: "", jobTitle: "", experienceYears: null, expertise: "", consent: false, assessmentDate: new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Makassar" }) }, reviews: {}, decision: null, generalNote: "", pairs: [], relevance: {} };
}
