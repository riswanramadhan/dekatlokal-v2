"use client";

import { useEffect, useRef } from "react";
import type { SoundEventName } from "@/domain/entities";
import { soundRegistry } from "@/lib/sound/registry";
import {
  SOUND_CHANGE_EVENT,
  useSoundPreference,
} from "@/lib/sound/use-sound-preference";

function getSoundEvent(target: EventTarget | null): SoundEventName | null {
  if (!(target instanceof Element)) return null;
  const explicit = target.closest<HTMLElement>("[data-sound-event]");
  const value = explicit?.dataset.soundEvent;
  if (value && value in soundRegistry) {
    return value as SoundEventName;
  }

  const interactive = target.closest("button,a,label,input,select,textarea");
  return interactive ? "ui-click" : null;
}

export function SoundEffects() {
  const { enabled } = useSoundPreference();
  const interacted = useRef(false);
  const lastPlayedAt = useRef(0);
  const audioCache = useRef<Partial<Record<SoundEventName, HTMLAudioElement>>>({});
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    function markInteracted() {
      interacted.current = true;
    }

    function handlePreferenceChange() {
      enabledRef.current =
        window.localStorage.getItem("dekatlokal:sound-enabled") === "true";
    }

    function play(eventName: SoundEventName) {
      if (!enabledRef.current || !interacted.current) return;
      const now = Date.now();
      if (now - lastPlayedAt.current < 90) return;
      lastPlayedAt.current = now;

      const config = soundRegistry[eventName];
      const audio =
        audioCache.current[eventName] ??
        new Audio(config.src);
      audioCache.current[eventName] = audio;
      audio.volume = config.volume;
      audio.currentTime = 0;
      void audio.play().catch(() => {
        // Browsers can reject sound if user gesture heuristics are stricter.
      });
    }

    function handleClick(event: MouseEvent) {
      markInteracted();
      const eventName = getSoundEvent(event.target);
      if (eventName) play(eventName);
    }

    function handleKeydown(event: KeyboardEvent) {
      markInteracted();
      if (event.key !== "Enter" && event.key !== " ") return;
      const eventName = getSoundEvent(event.target);
      if (eventName) play(eventName);
    }

    window.addEventListener("pointerdown", markInteracted, { passive: true });
    window.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleKeydown);
    window.addEventListener(SOUND_CHANGE_EVENT, handlePreferenceChange);

    return () => {
      window.removeEventListener("pointerdown", markInteracted);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener(SOUND_CHANGE_EVENT, handlePreferenceChange);
    };
  }, []);

  return null;
}
