import { cn } from "@/lib/utils/cn";

export function ProgressBar({
  value,
  label,
  className,
}: {
  value: number;
  label?: string;
  className?: string;
}) {
  const normalizedValue = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-medium text-text-secondary">{label}</span>
          <span className="font-semibold text-text-primary">
            {normalizedValue}%
          </span>
        </div>
      ) : null}
      <div
        aria-label={label}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={normalizedValue}
        className="h-3.5 overflow-hidden rounded-full bg-white/70 shadow-inner"
        role="progressbar"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-primary via-accent-purple to-accent-pink transition-[width]"
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
    </div>
  );
}
