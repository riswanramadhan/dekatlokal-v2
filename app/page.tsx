import { PublicLanding } from "@/components/landing/public-landing";
import { getRepositoriesForRequest } from "@/domain/services/app-service";
import { env } from "@/lib/env";

export default async function PublicLandingPage() {
  const repositories = await getRepositoriesForRequest();
  const modules = await repositories.learning.listFoundationalModules();
  const checkupHref = new URL("/digital-checkup", env.NEXT_PUBLIC_MAIN_SITE_URL).toString();

  return <PublicLanding modules={modules} checkupHref={checkupHref} />;
}
