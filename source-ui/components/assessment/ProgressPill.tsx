import { cn } from "@/lib/utils";

interface ProgressPillProps {
  current: number;
  total: number;
  percentage: number;
  roundedPercentage: number;
  className?: string;
  trackClassName?: string;
  valueClassName?: string;
}

export function ProgressPill({
  current,
  total,
  percentage,
  roundedPercentage,
  className,
  trackClassName,
  valueClassName,
}: ProgressPillProps) {
  return (
    <div className={cn("flex items-center justify-between bg-primary rounded-full gap-3", className)}>
      <span className={cn("text-sm text-primary-foreground tabular-nums", valueClassName)}>
        {current}/{total}
      </span>

      <div className={cn("w-full h-2 bg-primary-200 rounded-full overflow-hidden", trackClassName)}>
        <div
          className="h-full bg-primary-foreground rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <span className={cn("text-sm text-primary-foreground tabular-nums", valueClassName)}>
        {roundedPercentage}%
      </span>
    </div>
  );
}