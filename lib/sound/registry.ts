import type { SoundEventName } from "@/domain/entities";
import { soundEventNameSchema } from "@/domain/schemas";

export const SOUND_STORAGE_KEY = "dekatlokal:sound-enabled";

export const soundRegistry: Record<SoundEventName, { src: string; volume: number }> = {
  "ui-click": { src: "/sounds/ui-click.wav", volume: 0.2 },
  "option-select": { src: "/sounds/option-select.wav", volume: 0.22 },
  "answer-correct": { src: "/sounds/answer-correct.wav", volume: 0.26 },
  "answer-incorrect-soft": { src: "/sounds/answer-incorrect-soft.wav", volume: 0.18 },
  "module-unlock": { src: "/sounds/module-unlock.wav", volume: 0.28 },
  "lesson-complete": { src: "/sounds/lesson-complete.wav", volume: 0.26 },
  "reward-complete": { src: "/sounds/reward-complete.wav", volume: 0.3 },
};

export function parseSoundEventName(value: string) {
  return soundEventNameSchema.parse(value);
}
