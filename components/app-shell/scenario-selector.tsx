"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { ScenarioKey } from "@/domain/entities";
import { scenarioLabels } from "@/domain/scenario-labels";

export function ScenarioSelector({
  activeScenario,
  scenarios,
}: {
  activeScenario: ScenarioKey;
  scenarios: ScenarioKey[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <form className="rounded-2xl border border-border-default bg-white p-3 text-sm shadow-[var(--shadow-card)]">
      <label className="mb-2 block font-semibold text-text-primary" htmlFor="scenario">
        Skenario pengembangan
      </label>
      <select
        className="min-h-11 w-full rounded-xl border border-border-default bg-white px-3 text-sm"
        defaultValue={activeScenario}
        disabled={isPending}
        id="scenario"
        onChange={(event) => {
          const scenario = event.target.value;
          startTransition(async () => {
            await fetch("/api/dev/scenario", {
              body: JSON.stringify({ scenario }),
              headers: { "content-type": "application/json" },
              method: "POST",
            });
            router.refresh();
          });
        }}
      >
        {scenarios.map((scenario) => (
          <option key={scenario} value={scenario}>
            {scenarioLabels[scenario]}
          </option>
        ))}
      </select>
      <p className="mt-2 text-xs leading-5 text-text-muted">
        Hanya muncul di development. Tidak tersedia di production.
      </p>
    </form>
  );
}
