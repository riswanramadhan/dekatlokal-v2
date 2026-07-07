import type {
  Assessment,
  BusinessTask,
  FoundationalModule,
  LearningModule,
  Lesson,
  LessonScreenType,
  PlanStep,
} from "@/domain/entities";
import {
  assessmentSchema,
  businessTaskSchema,
  learningModuleSchema,
  lessonSchema,
} from "@/domain/schemas";
import { getFoundationalModule } from "@/infrastructure/mock/foundational-modules";

function moduleId(slug: string) {
  return `module-${slug}`;
}

function assessmentId(slug: string) {
  return `assessment-${slug}`;
}

function taskId(slug: string) {
  return `task-${slug}`;
}

function lessonId(slug: string, index: number) {
  return `${slug}-lesson-${index + 1}`;
}

function summaryType(type: FoundationalModule["lessons"][number]["type"]) {
  if (type === "image") return "reading";
  return type === "template" || type === "checklist" || type === "choice"
    ? type
    : "reading";
}

function screenType(type: FoundationalModule["lessons"][number]["type"]): LessonScreenType {
  if (type === "image") return "reading";
  return type === "template" || type === "checklist" || type === "choice"
    ? type
    : type === "story"
      ? "story"
      : "reading";
}

function fallbackModule(step: PlanStep): FoundationalModule {
  return {
    id: moduleId(step.moduleSlug),
    slug: step.moduleSlug,
    title: step.title,
    shortTitle: step.title,
    outcome: step.outcome ?? step.summary,
    summary: step.summary,
    icon: "BookOpen",
    theme: "blue",
    estimatedMinutes: step.estimatedMinutes,
    lessons: [0, 1, 2, 3].map((index) => ({
      id: lessonId(step.moduleSlug, index),
      title: index === 0 ? "Kenali masalahnya" : index === 1 ? "Pahami caranya" : index === 2 ? "Cek kesiapan" : "Susun aset usaha",
      focus: step.summary,
      type: index === 0 ? "story" : index === 1 ? "reading" : index === 2 ? "checklist" : "template",
      estimatedMinutes: index + 4,
    })) as FoundationalModule["lessons"],
    practicalTask: {
      title: `Terapkan: ${step.title}`,
      instruction:
        "Lengkapi tugas singkat agar hasil belajar menjadi bukti dan aset usaha.",
      assetType: step.moduleSlug.replaceAll("-", "_"),
      assetLabel: step.assetCreated ?? step.title,
      futureUse:
        "Dapat dipakai kembali untuk reward landing page dan Jejak Tumbuh.",
    },
    postTestQuestions: Array.from({ length: 8 }, (_, index) => ({
      id: `${step.moduleSlug}-post-${index + 1}`,
      topic: `Topik ${index + 1}`,
      prompt: "Pilihan mana yang paling praktis untuk usaha?",
      options: [
        { id: "practical", label: "Mulai dari informasi yang benar dan mudah dipakai." },
        { id: "generic", label: "Gunakan kalimat umum agar terlihat lengkap." },
      ],
      correctOptionId: "practical",
      correctExplanation: "Benar. Langkah praktis membantu usaha bergerak.",
      incorrectExplanation: "Belum tepat. Pilih langkah yang spesifik dan bisa dipakai.",
    })),
    correctiveReviews: [
      {
        topic: "Langkah praktis",
        title: "Penguatan: langkah praktis",
        body: "Ulangi inti materi dan pilih satu tindakan kecil.",
      },
    ],
    badge: "Aset Usaha Siap",
  };
}

function moduleForStep(step: PlanStep) {
  return getFoundationalModule(step.moduleSlug) ?? fallbackModule(step);
}

export function createModuleFromStep(step: PlanStep): LearningModule {
  const foundational = moduleForStep(step);

  return learningModuleSchema.parse({
    id: foundational.id,
    slug: foundational.slug,
    title: foundational.title,
    outcome: foundational.outcome,
    reasonAssigned: step.reason,
    description: foundational.summary,
    estimatedMinutes: foundational.estimatedMinutes,
    state: step.state,
    lessons: foundational.lessons.map((lesson, index) => ({
      id: lessonId(foundational.slug, index),
      title: lesson.title,
      type: summaryType(lesson.type),
      estimatedMinutes: lesson.estimatedMinutes,
    })),
    requiredTask: {
      title: foundational.practicalTask.title,
      description: foundational.practicalTask.instruction,
    },
    assetCreated: foundational.practicalTask.assetLabel,
    prerequisite: step.prerequisite,
    entitlement: step.entitlement,
    completionRule:
      "Selesai setelah semua lesson dipelajari, post-test dikuasai, dan tugas usaha disetujui.",
  });
}

export function createReferenceModule(foundational: FoundationalModule): LearningModule {
  return learningModuleSchema.parse({
    id: foundational.id,
    slug: foundational.slug,
    title: foundational.title,
    outcome: foundational.outcome,
    reasonAssigned:
      "Modul fondasi ini tersedia sebagai referensi. Jalur aktif tetap mengikuti tiga fokus dari Digital Checkup.",
    description: foundational.summary,
    estimatedMinutes: foundational.estimatedMinutes,
    state: "locked",
    lessons: foundational.lessons.map((lesson, index) => ({
      id: lessonId(foundational.slug, index),
      title: lesson.title,
      type: summaryType(lesson.type),
      estimatedMinutes: lesson.estimatedMinutes,
    })),
    requiredTask: {
      title: foundational.practicalTask.title,
      description: foundational.practicalTask.instruction,
    },
    assetCreated: foundational.practicalTask.assetLabel,
    prerequisite: "Selesaikan tiga fokus aktif terlebih dahulu agar modul referensi ini dapat dibuka pada tahap berikutnya.",
    entitlement: "free",
    completionRule:
      "Selesai setelah semua lesson dipelajari, post-test dikuasai, dan tugas usaha disetujui.",
  });
}

export function createModulesFromSteps(steps: PlanStep[]) {
  return steps.map(createModuleFromStep);
}

export function createLessonsFromStep(step: PlanStep): Lesson[] {
  const foundational = moduleForStep(step);
  const lessons = foundational.lessons;

  return lessons.map((lesson, index) => {
    const id = lessonId(foundational.slug, index);
    const next = lessons[index + 1] ? lessonId(foundational.slug, index + 1) : undefined;
    const type = screenType(lesson.type);
    const screens = [
      {
        id: `${id}-intro`,
        type: index === 0 ? "story" : "reading",
        eyebrow: index === 0 ? "Cerita usaha" : "Inti materi",
        title: lesson.title,
        body: lesson.focus,
        businessExample: `${foundational.title} membantu usaha seperti milik Anda menghasilkan ${foundational.practicalTask.assetLabel.toLowerCase()} yang bisa dipakai ulang.`,
      },
      type === "checklist"
        ? {
            id: `${id}-checklist`,
            type: "checklist" as const,
            eyebrow: "Checklist",
            title: "Cek tiga bagian penting",
            body: "Centang semua bagian sebelum melanjutkan.",
            checklistItems: [
              "Informasi sesuai kondisi usaha saat ini",
              "Bahasa mudah dipahami pelanggan",
              "Ada langkah berikutnya yang jelas",
            ],
          }
        : type === "template"
          ? {
              id: `${id}-template`,
              type: "template" as const,
              eyebrow: "Template praktis",
              title: `Susun ${foundational.practicalTask.assetLabel}`,
              body: "Isi tiga bagian inti. Draft ini membantu tugas usaha berikutnya.",
              templateFields: [
                {
                  key: "current",
                  label: "Kondisi usaha saat ini",
                  placeholder: "Contoh: pelanggan sering bertanya menu lewat WhatsApp",
                  example: "Pelanggan sering bertanya daftar produk sebelum memesan",
                },
                {
                  key: "improvement",
                  label: "Perbaikan yang ingin dibuat",
                  placeholder: "Contoh: daftar menu ringkas dengan harga",
                  example: foundational.practicalTask.assetLabel,
                },
                {
                  key: "next_action",
                  label: "Langkah berikutnya untuk pelanggan",
                  placeholder: "Contoh: klik tombol pesan WhatsApp",
                  example: "Pelanggan dapat melihat informasi lalu menghubungi WhatsApp",
                },
              ],
            }
          : type === "choice"
            ? {
                id: `${id}-choice`,
                type: "choice" as const,
                eyebrow: "Coba pilih",
                title: "Mana langkah yang paling membantu pelanggan?",
                body: "Pilih satu jawaban. Umpan balik langsung muncul tanpa pengurangan Poin Tumbuh.",
                choices: [
                  {
                    id: "clear",
                    label: `Membuat ${foundational.practicalTask.assetLabel.toLowerCase()} yang ringkas dan mudah dipakai.`,
                    isRecommended: true,
                    feedback:
                      "Tepat. Output yang ringkas membuat pelanggan dan pemilik usaha lebih mudah bertindak.",
                  },
                  {
                    id: "broad",
                    label: "Menunggu sampai semua materi selesai sempurna.",
                    isRecommended: false,
                    feedback:
                      "Belum perlu menunggu sempurna. Mulai dari versi sederhana yang benar.",
                  },
                ],
              }
            : {
                id: `${id}-example`,
                type: "reading" as const,
                eyebrow: "Contoh lokal",
                title: "Buat versi yang bisa dipakai hari ini",
                body: `Untuk ${foundational.shortTitle.toLowerCase()}, gunakan data usaha yang sudah ada lalu rapikan menjadi output sederhana.`,
                businessExample: step.outcome ?? foundational.outcome,
              },
    ];

    return lessonSchema.parse({
      id,
      moduleId: foundational.id,
      moduleSlug: foundational.slug,
      title: lesson.title,
      outcome: lesson.focus,
      estimatedMinutes: lesson.estimatedMinutes,
      nextLessonId: next,
      assessmentId: assessmentId(foundational.slug),
      screens,
    });
  });
}

export function createAssessmentFromStep(step: PlanStep): Assessment {
  const foundational = moduleForStep(step);

  return assessmentSchema.parse({
    id: assessmentId(foundational.slug),
    moduleId: foundational.id,
    moduleSlug: foundational.slug,
    title: `Post-test: ${foundational.title}`,
    description:
      "Delapan pertanyaan berbasis situasi usaha. Jawaban yang belum tepat diarahkan ke materi penguatan tanpa pengurangan Poin Tumbuh.",
    passScore: 80,
    taskId: taskId(foundational.slug),
    questions: foundational.postTestQuestions.map((question, index) => ({
      id: question.id,
      topic: question.topic,
      prompt: question.prompt,
      options: question.options,
      correctOptionId: question.correctOptionId,
      correctExplanation: question.correctExplanation,
      incorrectExplanation: question.incorrectExplanation,
      correctiveLessonId: `corrective-${foundational.slug}-${index + 1}`,
    })),
  });
}

export function createCorrectiveLessons(assessment: Assessment): Lesson[] {
  return assessment.questions.map((question) =>
    lessonSchema.parse({
      id: question.correctiveLessonId,
      moduleId: assessment.moduleId,
      moduleSlug: assessment.moduleSlug,
      title: `Penguatan: ${question.topic}`,
      outcome: `Memperkuat pemahaman tentang ${question.topic.toLowerCase()}.`,
      estimatedMinutes: 2,
      assessmentId: assessment.id,
      isCorrective: true,
      screens: [
        {
          id: `${question.correctiveLessonId}-reading`,
          type: "reading",
          eyebrow: "Materi penguatan",
          title: question.topic,
          body: question.correctExplanation,
          businessExample: question.incorrectExplanation,
        },
      ],
    }),
  );
}

export function createTaskFromStep(step: PlanStep): BusinessTask {
  const foundational = moduleForStep(step);

  return businessTaskSchema.parse({
    id: taskId(foundational.slug),
    moduleId: foundational.id,
    moduleSlug: foundational.slug,
    title: foundational.practicalTask.title,
    instruction: foundational.practicalTask.instruction,
    businessExample: `Contoh hasil untuk usaha: ${step.outcome ?? foundational.outcome}`,
    template:
      "Kondisi saat ini: [isi singkat]. Perbaikan yang dibuat: [isi singkat]. Langkah pelanggan berikutnya: [isi singkat].",
    evidenceTypes: ["text", "link", "image", "checklist"],
    checklistOptions: [
      "Informasi sesuai kondisi usaha saat ini",
      "Bahasa mudah dipahami pelanggan",
      "Kontak atau langkah berikutnya sudah benar",
    ],
    createsAssetType: foundational.practicalTask.assetType,
    createsAssetLabel: foundational.practicalTask.assetLabel,
    futureUse: foundational.practicalTask.futureUse,
    required: step.required,
  });
}

export function createLearningContent(steps: PlanStep[]) {
  const modules = createModulesFromSteps(steps);
  const lessons = steps.flatMap(createLessonsFromStep);
  const assessments = steps.map(createAssessmentFromStep);
  const correctiveLessons = assessments.flatMap(createCorrectiveLessons);
  const tasks = steps.map(createTaskFromStep);

  return { modules, lessons: [...lessons, ...correctiveLessons], assessments, tasks };
}
