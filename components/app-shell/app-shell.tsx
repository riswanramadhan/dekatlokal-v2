import type { ReactNode } from "react";
import type { AppView, ScenarioKey } from "@/domain/entities";
import { BottomNavigation, DesktopSidebar } from "@/components/app-shell/navigation";
import { BrandLogo, BrandMark } from "@/components/app-shell/logo";
import { NotificationButton } from "@/components/app-shell/notification-button";
import { ScenarioSelector } from "@/components/app-shell/scenario-selector";
import { TekapButton } from "@/components/app-shell/tekap-button";
import { SoundToggle } from "@/components/sound";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { ProfileSummary } from "@/components/ui";
import { env } from "@/lib/env";
import { Search, SlidersHorizontal } from "lucide-react";

export function AppShell({
  appView,
  scenarios,
  children,
  nextActionHref,
  nextActionLabel,
}: {
  appView: AppView;
  scenarios: ScenarioKey[];
  children: ReactNode;
  nextActionHref?: string;
  nextActionLabel?: string;
}) {
  const unreadCount = appView.notifications.filter((item) => !item.read).length;
  const showScenarioSelector = env.NODE_ENV !== "production";

  return (
    <div className="app-surface min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[5.75rem] px-5 py-6 md:block">
        <BrandMark />
        <DesktopSidebar />
      </aside>

      <div className="md:pl-[5.75rem]">
        <header className="sticky top-0 z-20 px-4 py-3 backdrop-blur-xl md:px-8 md:py-5">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="shrink-0 md:hidden">
              <BrandLogo />
            </div>
            <div className="hidden min-w-0 flex-1 items-center gap-4 md:flex">
              <div className="relative w-full max-w-xl">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted"
                />
                <input
                  aria-label="Cari modul atau aset"
                  className="min-h-14 w-full rounded-full border border-white/70 bg-white/82 pl-14 pr-5 text-sm font-semibold text-text-primary shadow-[var(--shadow-soft)] placeholder:text-text-muted"
                  placeholder="Cari langkah, modul, atau Aset Usaha"
                  readOnly
                />
              </div>
              <button
                aria-label="Filter tampilan"
                className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/82 text-text-secondary shadow-[var(--shadow-soft)]"
                type="button"
              >
                <SlidersHorizontal aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block md:hidden">
                <p className="text-xs font-medium text-text-muted">
                  {appView.business.category}
                </p>
                <p className="text-sm font-bold text-text-primary">
                  {appView.business.name}
                </p>
              </div>
              <NotificationButton unreadCount={unreadCount} />
              <SoundToggle className="hidden sm:inline-flex" />
              <div className="hidden md:block">
                <ProfileSummary
                  business={appView.business.name}
                  detail={`${appView.business.category} di ${appView.business.city}`}
                  name={appView.user.name}
                />
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-4 fixed-cta-offset md:px-8 md:pb-10 md:pt-2">
          <OfflineBanner forceOffline={appView.isOffline} />
          {showScenarioSelector ? (
            <div className="mb-4 max-w-sm md:ml-auto">
              <ScenarioSelector
                activeScenario={appView.scenario}
                scenarios={scenarios}
              />
            </div>
          ) : null}
          {children}
        </main>
      </div>

      <TekapButton />
      <BottomNavigation
        nextActionHref={nextActionHref}
        nextActionLabel={nextActionLabel}
      />
    </div>
  );
}
