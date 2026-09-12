import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { clearLocalCheckup, LOCAL_DRAFT_KEY, readLocalCheckup, saveLocalCheckup } from "@/lib/digital-checkup/local-draft";
const storage = new Map<string, string>();
beforeEach(() => { storage.clear(); vi.stubGlobal("localStorage", { getItem: (k: string) => storage.get(k) ?? null, setItem: (k: string, v: string) => storage.set(k, v), removeItem: (k: string) => storage.delete(k) }); });
afterEach(() => vi.unstubAllGlobals());
const draft = () => ({ version: 1 as const, savedAt: Date.now(), sessionId: null, revision: 0, step: -1, profile: { consent: true as const, sector: "", district: "", businessAgeMonths: 0, peopleCount: 1, respondentRole: "Pemilik" as const, salesChannels: [], goal: "", note: "" }, answers: { Q01: 0 } });
it("restores consented local drafts without losing zero answers and removes them after linking", () => {
  expect(saveLocalCheckup(draft())).toBe(true);
  expect(readLocalCheckup()?.answers.Q01).toBe(0);
  clearLocalCheckup(); expect(readLocalCheckup()).toBeNull();
});
it("discards expired or corrupt local data", () => {
  saveLocalCheckup({ ...draft(), savedAt: Date.now() - 8 * 86400000 });
  expect(readLocalCheckup()).toBeNull(); expect(storage.has(LOCAL_DRAFT_KEY)).toBe(false);
  storage.set(LOCAL_DRAFT_KEY, "{broken");
  expect(readLocalCheckup()).toBeNull();
});
it("does not crash when browser storage is unavailable", () => {
  vi.stubGlobal("localStorage", { getItem: () => { throw Error("denied"); }, setItem: () => { throw Error("denied"); }, removeItem: () => { throw Error("denied"); } });
  expect(readLocalCheckup()).toBeNull(); expect(saveLocalCheckup(draft())).toBe(false); expect(clearLocalCheckup).not.toThrow();
});
