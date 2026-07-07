import { redirect } from "next/navigation";
import { StateBlock } from "@/components/ui";
import {
  getModuleResultView,
  getModuleView,
} from "@/domain/services/app-service";
import { canStartModule } from "@/features/learning-path/state";

type StartModulePageProps = {
  params: Promise<{ moduleSlug: string }>;
};

export default async function StartModulePage({ params }: StartModulePageProps) {
  const { moduleSlug } = await params;
  const view = await getModuleView(moduleSlug);

  if (!view || !canStartModule(view.module.state)) {
    return (
      <StateBlock
        action={{
          href: `/app/modul/${moduleSlug}`,
          label: "Lihat preview modul",
        }}
        description={
          view?.module.prerequisite ??
          "Modul ini belum bisa dimulai karena masih menunggu langkah sebelumnya."
        }
        kind="locked"
        title="Modul ini belum bisa dimulai"
      />
    );
  }

  if (view.module.state === "completed") {
    redirect(`/app/hasil-modul/${view.module.id}`);
  }

  const result = await getModuleResultView(view.module.id);
  if (result?.completion.completed) {
    redirect(`/app/hasil-modul/${view.module.id}`);
  }
  if (result?.completion.assessmentPassed) {
    redirect(`/app/tugas/task-${view.module.slug}`);
  }
  if (
    result &&
    result.completion.lessonsCompleted === result.completion.lessonsTotal
  ) {
    redirect(`/app/kuis/assessment-${view.module.slug}`);
  }

  redirect(`/app/belajar/${view.module.lessons[0].id}`);
}
