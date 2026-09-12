import { guestAssessment, publicAssessment, runAssessment } from "@/lib/digital-checkup/service";
import { failure, json, sameOrigin } from "@/lib/digital-checkup/http";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const assessment = await guestAssessment();
    if (!assessment) return json(null);
    if (assessment.status === "submitted") { try { await runAssessment(assessment); } catch { /* Durable jobs retry. */ } }
    return json(await publicAssessment(assessment));
  } catch (e) { return failure(e); }
}
