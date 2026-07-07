import type { AssetRegistryEntry } from "@/domain/entities";
import { assetRegistryEntrySchema } from "@/domain/schemas";

function asset(entry: AssetRegistryEntry) {
  return assetRegistryEntrySchema.parse(entry);
}

export const assetRegistry = {
  logoHorizontal: asset({
    key: "logo-horizontal",
    src: "/brand/dekat-lokal.svg",
    alt: "DekatLokal",
    type: "brand",
    usage: "Primary logo in header and public landing page.",
    license: "Official DekatLokal brand asset.",
  }),
  logoMark: asset({
    key: "logo-mark",
    src: "/brand/dekat-lokal-icon.png",
    alt: "Logo DekatLokal",
    type: "brand",
    usage: "Compact app shell and helper identity.",
    license: "Official DekatLokal brand asset.",
  }),
  onboardingHero: asset({
    key: "onboarding-hero",
    src: "/illustrations/onboarding-hero.png",
    alt: "",
    type: "illustration",
    usage: "Pre-auth and onboarding supportive illustration.",
    license: "Local temporary demo illustration.",
  }),
  dashboardHero: asset({
    key: "dashboard-hero",
    src: "/illustrations/dashboard-hero.png",
    alt: "",
    type: "illustration",
    usage: "Dashboard product preview.",
    license: "Local temporary demo illustration.",
  }),
  learningAction: asset({
    key: "learning-action",
    src: "/illustrations/learning-action.png",
    alt: "",
    type: "illustration",
    usage: "Learning and business action preview.",
    license: "Local temporary demo illustration.",
  }),
  rewardHero: asset({
    key: "reward-hero",
    src: "/illustrations/reward-hero.png",
    alt: "",
    type: "illustration",
    usage: "Reward and certificate preview.",
    license: "Local temporary demo illustration.",
  }),
} as const;

export type AssetRegistryKey = keyof typeof assetRegistry;
