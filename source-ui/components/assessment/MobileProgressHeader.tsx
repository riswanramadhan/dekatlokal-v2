import { AssessmentStep } from "./types";
import { ProgressPill } from "./ProgressPill";
import { getAssessmentProgressMetrics } from "./utils";

interface MobileProgressHeaderProps {
  currentStep: AssessmentStep;
  currentGroupIndex: number;
  totalSteps: number;
}

export function MobileProgressHeader({ 
  currentStep, 
  currentGroupIndex,
  totalSteps,
}: MobileProgressHeaderProps) {
  const progress = getAssessmentProgressMetrics(currentStep, currentGroupIndex, totalSteps);

  if (currentStep === "results") return null;

  return (
    <div className="lg:hidden sticky top-0 z-10 bg-white px-4 py-6">
      <ProgressPill
        current={progress.current}
        total={progress.total}
        percentage={progress.percentage}
        roundedPercentage={progress.roundedPercentage}
        className="px-8"
        trackClassName="h-1.5"
      />
    </div>
  );
}
