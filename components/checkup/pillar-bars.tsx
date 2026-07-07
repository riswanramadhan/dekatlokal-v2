import type { CheckupPillarScore } from "@/domain/entities";
import { ProgressBar } from "@/components/ui";

export function PillarBars({ pillars }: { pillars: CheckupPillarScore[] }) {
  return (
    <div className="grid gap-4">
      {pillars.map((pillar) => (
        <div className="rounded-2xl bg-white p-4" key={pillar.pillarKey}>
          <ProgressBar label={pillar.label} value={pillar.score} />
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {pillar.explanation}
          </p>
        </div>
      ))}
    </div>
  );
}
