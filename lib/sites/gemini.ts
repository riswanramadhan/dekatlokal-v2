import "server-only";
// Klien Gemini (Google AI Studio) tanpa dependency tambahan: REST + Server-Sent Events.
// Diporting dari DekatAI (dekat-lokal-web). Mencoba beberapa model berurutan bila model pertama
// sibuk (429/5xx/timeout). Kunci API hanya dibaca di route handler server.
import type { ChatTurn } from "./chat";

export const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
export const DEFAULT_GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-flash-latest"] as const;

export interface GeminiStreamOptions {
  apiKey: string;
  models: readonly string[];
  system: string;
  messages: readonly ChatTurn[];
  maxOutputTokens?: number;
  temperature?: number;
  /** Batas menunggu respons pertama per model. */
  firstByteTimeoutMs?: number;
  /** Batas jeda antar potongan teks setelah streaming berjalan. */
  idleTimeoutMs?: number;
  signal?: AbortSignal;
}

export interface GeminiStream {
  model: string;
  chunks: AsyncGenerator<string, void, void>;
}

export class GeminiError extends Error {
  constructor(message: string, readonly status: number | null, readonly retryable: boolean) {
    super(message);
    this.name = "GeminiError";
  }
}

/** Daftar model dari env GEMINI_MODEL (dipisah koma) atau default. */
export function parseModelList(value: string | undefined): string[] {
  const models = (value ?? "").split(",").map((item) => item.trim().replace(/^models\//, "")).filter((item) => /^[a-z0-9.\-]+$/i.test(item));
  return models.length ? Array.from(new Set(models)) : [...DEFAULT_GEMINI_MODELS];
}

/** Gemini 2.5 Flash/Flash-Lite bisa mematikan thinking: jawaban jauh lebih cepat untuk chat singkat. */
function thinkingConfigFor(model: string): Record<string, unknown> | undefined {
  if (/^gemini-2\.5-flash/.test(model)) return { thinkingBudget: 0 };
  return undefined;
}

export function buildGeminiRequest(model: string, options: Pick<GeminiStreamOptions, "system" | "messages" | "maxOutputTokens" | "temperature">) {
  const thinkingConfig = thinkingConfigFor(model);
  return {
    systemInstruction: { parts: [{ text: options.system }] },
    contents: options.messages.map((message) => ({ role: message.role === "assistant" ? "model" : "user", parts: [{ text: message.content }] })),
    generationConfig: { maxOutputTokens: options.maxOutputTokens ?? 600, temperature: options.temperature ?? 0.5, topP: 0.95, ...(thinkingConfig ? { thinkingConfig } : {}) },
  };
}

interface GeminiChunk {
  candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
  error?: { code?: number; message?: string; status?: string };
}

/** Ambil teks (tanpa bagian "thought") dari satu event SSE. */
export function textFromChunk(chunk: GeminiChunk): string {
  const parts = chunk.candidates?.[0]?.content?.parts ?? [];
  return parts.filter((part) => !part.thought && typeof part.text === "string").map((part) => part.text as string).join("");
}

/** Memecah aliran byte SSE menjadi objek JSON per baris `data:`. */
export async function* parseSse(body: ReadableStream<Uint8Array>): AsyncGenerator<GeminiChunk, void, void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let newline = buffer.indexOf("\n");
      while (newline !== -1) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        if (line.startsWith("data:")) {
          const payload = line.slice(5).trim();
          if (payload && payload !== "[DONE]") {
            try { yield JSON.parse(payload) as GeminiChunk; } catch { /* potongan tidak lengkap: abaikan */ }
          }
        }
        newline = buffer.indexOf("\n");
      }
    }
    const rest = buffer.trim();
    if (rest.startsWith("data:")) {
      try { yield JSON.parse(rest.slice(5).trim()) as GeminiChunk; } catch { /* abaikan */ }
    }
  } finally {
    reader.releaseLock();
  }
}

const RETRYABLE_STATUS = new Set([400, 404, 408, 429, 500, 502, 503, 504]);

async function openModelStream(model: string, options: GeminiStreamOptions): Promise<GeminiStream> {
  const controller = new AbortController();
  const abortFromParent = () => controller.abort();
  options.signal?.addEventListener("abort", abortFromParent, { once: true });
  let timer: ReturnType<typeof setTimeout> | undefined = setTimeout(() => controller.abort(), options.firstByteTimeoutMs ?? 12_000);
  const cleanup = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
    options.signal?.removeEventListener("abort", abortFromParent);
  };

  let response: Response;
  try {
    response = await fetch(`${GEMINI_API_BASE}/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": options.apiKey },
      body: JSON.stringify(buildGeminiRequest(model, options)),
      signal: controller.signal,
      cache: "no-store",
    });
  } catch (error) {
    cleanup();
    throw new GeminiError(controller.signal.aborted ? `${model}: timeout` : `${model}: ${error instanceof Error ? error.message : "network error"}`, null, true);
  }

  if (!response.ok || !response.body) {
    cleanup();
    let detail = "";
    try { detail = ((await response.json()) as GeminiChunk).error?.message ?? ""; } catch { /* abaikan */ }
    throw new GeminiError(`${model}: HTTP ${response.status} ${detail}`.trim(), response.status, RETRYABLE_STATUS.has(response.status));
  }

  const idleMs = options.idleTimeoutMs ?? 20_000;
  // Pastikan model benar-benar mengirim teks sebelum dianggap berhasil,
  // sehingga respons kosong/terblokir masih bisa pindah ke model berikutnya.
  const events = parseSse(response.body);
  const buffered: string[] = [];
  try {
    while (true) {
      const { value, done } = await events.next();
      if (done) break;
      if (value.error) throw new GeminiError(`${model}: ${value.error.message ?? "stream error"}`, value.error.code ?? null, true);
      if (value.promptFeedback?.blockReason) throw new GeminiError(`${model}: blocked ${value.promptFeedback.blockReason}`, null, false);
      const text = textFromChunk(value);
      if (text) { buffered.push(text); break; }
    }
  } catch (error) {
    cleanup();
    controller.abort();
    if (error instanceof GeminiError) throw error;
    throw new GeminiError(`${model}: ${controller.signal.aborted ? "timeout" : "stream error"}`, null, true);
  }
  if (!buffered.length) {
    cleanup();
    throw new GeminiError(`${model}: respons kosong`, null, true);
  }

  async function* chunks(): AsyncGenerator<string, void, void> {
    try {
      for (const text of buffered) yield text;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => controller.abort(), idleMs);
      for await (const value of { [Symbol.asyncIterator]: () => events }) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => controller.abort(), idleMs);
        const text = textFromChunk(value);
        if (text) yield text;
      }
    } finally {
      cleanup();
    }
  }
  return { model, chunks: chunks() };
}

/** Membuka streaming ke model pertama yang merespons. Melempar GeminiError bila semua gagal (pemanggil memakai jawaban cadangan). */
export async function streamGemini(options: GeminiStreamOptions): Promise<GeminiStream> {
  const errors: string[] = [];
  for (const model of options.models) {
    if (options.signal?.aborted) break;
    try {
      return await openModelStream(model, options);
    } catch (error) {
      const geminiError = error instanceof GeminiError ? error : new GeminiError(String(error), null, true);
      errors.push(geminiError.message);
      // Kunci tidak valid/ditolak: model lain juga akan gagal.
      if (geminiError.status === 401 || geminiError.status === 403 || !geminiError.retryable) throw geminiError;
    }
  }
  throw new GeminiError(`Semua model gagal: ${errors.join(" | ")}`, null, false);
}
