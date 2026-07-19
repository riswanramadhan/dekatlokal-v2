import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ScoringSimulationClient } from "./ScoringSimulationClient";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export default function ScoringSimulationPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <ScoringSimulationClient />;
}
