"use client";

import { useCallback, useEffect, useState } from "react";
import { SOUND_STORAGE_KEY } from "@/lib/sound/registry";

export const SOUND_CHANGE_EVENT = "dekatlokal:sound-change";

function readPreference() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SOUND_STORAGE_KEY) === "true";
}

export function useSoundPreference() {
  const [enabled, setEnabledState] = useState(false);

  useEffect(() => {
    function handleChange() {
      setEnabledState(readPreference());
    }

    const timeout = window.setTimeout(handleChange, 0);
    window.addEventListener(SOUND_CHANGE_EVENT, handleChange);
    window.addEventListener("storage", handleChange);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener(SOUND_CHANGE_EVENT, handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  const setEnabled = useCallback((value: boolean) => {
    window.localStorage.setItem(SOUND_STORAGE_KEY, String(value));
    setEnabledState(value);
    window.dispatchEvent(new Event(SOUND_CHANGE_EVENT));
  }, []);

  return { enabled, setEnabled };
}
