import { requireActor } from "@/lib/supabase/server";
import { accessFor } from "@/lib/commerce/entitlements";
import { ensureAccess } from "@/lib/layanan/gating";
import { layananFailure } from "@/lib/layanan/http";
import { latestRankedRun } from "@/lib/layanan/pro-run";
import { listServiceRequests } from "@/lib/layanan/service-requests";
import { buildProReport, createProReportPdf, proReportFileName } from "@/lib/layanan/pro-report";
import { storedConsultationSchema } from "@/lib/layanan/request-schema";

/** Unduh PDF Checkup Pro. Hanya untuk akun dengan hak akses checkup_pro aktif (dicek dari database). */
export async function GET() {
  try {
    const actor = await requireActor(["umkm"]);
    ensureAccess(await accessFor(actor.id, "checkup_pro"), "checkup_pro");
    const [run, requests] = await Promise.all([latestRankedRun(actor.id), listServiceRequests(actor.id)]);
    if (!run?.trace) throw new Error("Laporan Pro butuh hasil Digital Checkup yang sudah berperingkat. Selesaikan checkup dulu, lalu coba lagi.");
    const booking = requests.find((item) => item.kind === "consultation" && item.status !== "cancelled");
    const stored = booking ? storedConsultationSchema.safeParse(booking.payload) : null;
    const report = buildProReport({
      profile: run.profile,
      submittedAt: run.submittedAt,
      trace: run.trace,
      consultation: booking && stored?.success ? { status: booking.status, slots: stored.data.slots, topic: stored.data.topic } : null,
    });
    return new Response(createProReportPdf(report), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${proReportFileName(report.businessName)}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) { return layananFailure(e); }
}
