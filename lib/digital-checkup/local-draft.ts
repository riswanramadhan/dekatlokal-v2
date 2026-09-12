import { z } from "zod";
import { answersSchema, profileSchema } from "./validation";
export const LOCAL_DRAFT_KEY = "dekatlokal.checkup.draft.v1";
const schema = z.object({ version: z.literal(1), savedAt: z.number(), sessionId: z.string().nullable(), revision: z.number().int().nonnegative(), step: z.number().int().min(-1).max(9), profile: profileSchema.extend({ sector: z.string().max(100), district: z.string().max(100), goal: z.string().max(500), salesChannels: z.array(z.string().max(60)).max(10) }), answers: answersSchema });
export type LocalDraft = z.infer<typeof schema>;
export function readLocalCheckup(): LocalDraft | null {
  try {
    const raw = localStorage.getItem(LOCAL_DRAFT_KEY); if (!raw) return null;
    const result = schema.safeParse(JSON.parse(raw));
    if (!result.success || result.data.savedAt > Date.now() + 60000 || Date.now() - result.data.savedAt > 7 * 86400000) { localStorage.removeItem(LOCAL_DRAFT_KEY); return null; }
    return result.data;
  } catch { return null; }
}
export function saveLocalCheckup(value: LocalDraft) { try { localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(schema.parse(value))); return true; } catch { return false; } }
export function clearLocalCheckup() { try { localStorage.removeItem(LOCAL_DRAFT_KEY); } catch { /* Storage can be unavailable; Supabase remains authoritative. */ } }
