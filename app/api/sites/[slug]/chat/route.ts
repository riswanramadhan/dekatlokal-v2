import { after, NextResponse } from "next/server";
import { z } from "zod";
import { readBody } from "@/lib/digital-checkup/http";
import { siteAvailability } from "@/lib/sites/access";
import { buildSitePrompt, fallbackReply, guardReply, isValidSessionId, sanitizeHistory } from "@/lib/sites/chat";
import { GeminiError, parseModelList, streamGemini } from "@/lib/sites/gemini";
import { clientIp, createRateLimiter } from "@/lib/sites/rate-limit";
import { logSiteTurn, publicSite } from "@/lib/sites/repository";
import { isValidSlug, LIMITS } from "@/lib/sites/schema";
import { supabaseConfigured } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

// Per IP + website: 20 pesan / 10 menit. Per website: 300 pesan / jam (melindungi kuota Gemini pemilik).
const perVisitor = createRateLimiter({ windowMs: 10 * 60_000, max: 20 });
const perSite = createRateLimiter({ windowMs: 60 * 60_000, max: 300 });

const bodySchema = z.object({
  sessionId: z.string().refine(isValidSessionId, "Sesi tidak valid."),
  messages: z.array(z.object({ role: z.string().max(20), content: z.string().max(4000) })).min(1).max(40),
});

const error = (message: string, status: number) => NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
const text = (value: string, mode: string, status = 200) => new Response(value, { status, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-AI-Admin-Mode": mode } });

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isValidSlug(slug)) return error("Website tidak ditemukan.", 404);

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await readBody(request)); // readBody: cek same-origin + batas ukuran.
  } catch (e) {
    return error(e instanceof z.ZodError ? "Format pesan belum sesuai." : e instanceof Error ? e.message : "Permintaan tidak valid.", 400);
  }
  const latestRaw = [...body.messages].reverse().find((m) => m.role === "user")?.content.trim() ?? "";
  if (latestRaw.length > LIMITS.chatMessage) return error(`Pesan maksimal ${LIMITS.chatMessage} karakter.`, 400);
  const messages = sanitizeHistory(body.messages);
  if (!messages) return error("Pertanyaan belum diisi.", 400);

  if (perVisitor(`${clientIp(request)}:${slug}`) || perSite(slug)) {
    return text("Pesannya lagi banyak banget, Kak. Coba lagi beberapa menit lagi, atau langsung chat WhatsApp kami ya.", "rate-limit", 429);
  }

  if (!supabaseConfigured()) return error("Chat belum tersedia.", 503);
  let data: Awaited<ReturnType<typeof publicSite>>;
  try { data = await publicSite(slug); } catch { return error("Chat sedang tidak tersedia. Coba lagi sebentar.", 503); }
  if (!data) return error("Website tidak ditemukan.", 404);
  const { site, entitlements } = data;
  if (!siteAvailability({ id: site.id, status: site.status, aiEnabled: site.ai.enabled }, entitlements).chat) return error("Chat admin di website ini sedang tidak aktif.", 403);

  const latest = messages[messages.length - 1].content;
  const reply = (value: string, mode: string) => {
    // Jawaban instan tetap dicatat (setelah respons terkirim) agar pemilik melihat semua pertanyaan di kotak masuk.
    after(() => logSiteTurn(site.id, body.sessionId, latest, value, mode));
    return text(value, mode);
  };

  const guarded = guardReply(latest, site.content);
  if (guarded) return reply(guarded, "guard");
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return reply(fallbackReply(latest, site.content), "static");

  let opened: Awaited<ReturnType<typeof streamGemini>>;
  try {
    opened = await streamGemini({ apiKey, models: parseModelList(process.env.GEMINI_MODEL), system: buildSitePrompt(site.content, site.ai), messages, signal: request.signal });
  } catch (e) {
    console.error("[ai-admin] Gemini gagal:", e instanceof GeminiError ? e.message : "unknown");
    return reply(fallbackReply(latest, site.content), "static");
  }

  const { model, chunks } = opened;
  const encoder = new TextEncoder();
  let answer = "";
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of chunks) { answer += chunk; controller.enqueue(encoder.encode(chunk)); }
      } catch (e) {
        console.error(`[ai-admin] stream ${model} terputus`, e instanceof Error ? e.message : "unknown");
        if (!answer) { answer = fallbackReply(latest, site.content); controller.enqueue(encoder.encode(answer)); }
      } finally {
        // Simpan sebelum stream ditutup agar tidak terpotong saat fungsi serverless selesai.
        if (answer) await logSiteTurn(site.id, body.sessionId, latest, answer, model);
        controller.close();
      }
    },
    async cancel() { await chunks.return(undefined); },
  });
  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no", "X-AI-Admin-Mode": "stream" } });
}
