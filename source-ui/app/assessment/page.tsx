import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AssessmentFlow } from "@/features/digital-checkup/components/AssessmentFlow";
import { isDigitalCheckupHostname } from "@/lib/host-routing";

export default async function AssessmentPage() {
  const requestHeaders = await headers();

  if (!isDigitalCheckupHostname(requestHeaders.get("host"))) {
    redirect("/digital-checkup");
  }

  return <AssessmentFlow />;
}
