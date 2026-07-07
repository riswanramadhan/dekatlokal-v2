import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import {
  getDashboardView,
  getScenarioOptions,
} from "@/domain/services/app-service";

export default async function SignedInAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [dashboard, scenarios] = await Promise.all([
    getDashboardView(),
    getScenarioOptions(),
  ]);

  return (
    <AppShell
      appView={dashboard}
      nextActionHref={dashboard.activePlan?.nextBestAction.href}
      nextActionLabel={dashboard.activePlan?.nextBestAction.ctaLabel}
      scenarios={scenarios}
    >
      {children}
    </AppShell>
  );
}
