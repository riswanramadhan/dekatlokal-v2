import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center rounded-full border border-white/70 bg-white/82 px-3.5 py-1 text-sm font-bold text-brand-primary shadow-[0_8px_18px_rgba(42,54,95,0.08)]",
        className,
      )}
      {...props}
    />
  );
}
