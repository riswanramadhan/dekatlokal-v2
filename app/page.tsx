import { PublicLanding } from "@/components/landing/public-landing";
import { getRepositoriesForRequest } from "@/domain/services/app-service";

export default async function PublicLandingPage() {
  const repositories = await getRepositoriesForRequest();
  const modules = await repositories.learning.listFoundationalModules();

  return <PublicLanding modules={modules} checkupHref="/mulai" />;
}
