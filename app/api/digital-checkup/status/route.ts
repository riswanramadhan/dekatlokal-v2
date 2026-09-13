import { guestAssessment, publicAssessment, runAssessment } from "@/lib/digital-checkup/service";
import { failure, json, sameOrigin } from "@/lib/digital-checkup/http";
import { processExpertPanel } from "@/lib/digital-checkup/auto-panel";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const assessment = await guestAssessment();
    if (!assessment) return json(null);
    if (assessment.status === "submitted") { try { await processExpertPanel(); await runAssessment(assessment); } catch { /* Durable jobs retry. */ } }
    return json(await publicAssessment(assessment));
  } catch (e) { return failure(e); }
}
