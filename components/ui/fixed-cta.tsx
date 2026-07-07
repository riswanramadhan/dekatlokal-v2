import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function FixedCta({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 bg-white/78 px-4 py-3 shadow-[0_-18px_42px_rgba(42,54,95,0.12)] backdrop-blur-xl md:hidden",
        className,
      )}
      style={{ paddingBottom: "calc(0.75rem + var(--safe-bottom))" }}
    >
      <div className="mx-auto max-w-[430px]">{children}</div>
    </div>
  );
}
