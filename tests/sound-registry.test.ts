import { describe, expect, it } from "vitest";
import { soundRegistry, SOUND_STORAGE_KEY } from "@/lib/sound/registry";

describe("V3 sound registry", () => {
  it("contains all required local UI sound events", () => {
    expect(Object.keys(soundRegistry)).toEqual([
      "ui-click",
      "option-select",
      "answer-correct",
      "answer-incorrect-soft",
      "module-unlock",
      "lesson-complete",
      "reward-complete",
    ]);
    expect(Object.values(soundRegistry).every((entry) => entry.src.startsWith("/sounds/"))).toBe(true);
    expect(Object.values(soundRegistry).every((entry) => entry.volume > 0 && entry.volume <= 0.35)).toBe(true);
  });

  it("uses the documented persisted preference key", () => {
    expect(SOUND_STORAGE_KEY).toBe("dekatlokal:sound-enabled");
  });
});
