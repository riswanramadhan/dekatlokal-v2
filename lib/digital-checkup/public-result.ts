import { instrument, type Decision } from "@/lib/decision-engine";
// Public results never expose global panel weights/matrices, even through a guest session.
export function publicResult(trace: Decision) {
  return {
    trace: { status: trace.status, ranking: trace.ranking.map(({ code, rank }) => ({ code, rank })), topSet: trace.topSet, uncovered: trace.uncovered },
    reasons: Object.fromEntries(trace.ranking.map((r) => {
      const i = instrument.modules.findIndex((m) => m.code === r.code);
      const reasons = instrument.dimensions.map((d, j) => ({ title: d.title, need: trace.q[j], relevance: trace.R[i][j] })).filter((x) => x.need > 0 && x.relevance >= 3).sort((a, b) => b.need - a.need).slice(0, 2).map((x) => x.title);
      return [r.code, reasons];
    })),
  };
}
