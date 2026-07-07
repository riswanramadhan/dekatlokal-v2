import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaskWorkspace } from "@/components/tasks/task-workspace";
import { StateBlock } from "@/components/ui";
import { getTaskView } from "@/domain/services/app-service";

export const metadata: Metadata = { title: "Tugas Usaha" };

export default async function TaskPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  const view = await getTaskView(taskId);
  if (!view) notFound();

  if (view.blockedReason) {
    return (
      <StateBlock
        action={{ href: `/app/kuis/assessment-${view.module.slug}`, label: "Buka cek pemahaman" }}
        description={view.blockedReason}
        kind="locked"
        title="Tugas usaha belum terbuka"
      />
    );
  }

  return (
    <TaskWorkspace
      businessName={view.business.name}
      initialDraft={view.draft}
      moduleTitle={view.module.title}
      task={view.task}
    />
  );
}
