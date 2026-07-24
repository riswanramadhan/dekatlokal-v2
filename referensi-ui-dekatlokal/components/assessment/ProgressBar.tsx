import { ProgressPill } from "./ProgressPill";
import { getProgressMetrics } from "./utils";

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const progress = getProgressMetrics(current, total);
  
  return (
    <div className="w-full">
      <ProgressPill
        current={progress.current}
        total={progress.total}
        percentage={progress.percentage}
        roundedPercentage={progress.roundedPercentage}
        className="px-24 py-1 text-neutral-600"
      />
    </div>
  );
}
