"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useSoundPreference } from "@/lib/sound/use-sound-preference";
import { cn } from "@/lib/utils/cn";

export function SoundToggle({ className }: { className?: string }) {
  const { enabled, setEnabled } = useSoundPreference();
  const Icon = enabled ? Volume2 : VolumeX;

  return (
    <button
      aria-pressed={enabled}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-full border border-border-default bg-white px-3 text-sm font-bold text-text-secondary shadow-[var(--shadow-soft)] transition hover:border-brand-primary/30 hover:text-brand-primary",
        className,
      )}
      onClick={() => setEnabled(!enabled)}
      type="button"
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
      <span>{enabled ? "Suara aktif" : "Suara mati"}</span>
    </button>
  );
}
