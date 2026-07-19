import { NextResponse } from "next/server";

const MAX_MESSAGE_LENGTH = 500;

const SYSTEM_INSTRUCTION = `
Kamu adalah DekatAI, asisten resmi DekatLokal. Jawab hanya pertanyaan tentang layanan internal DekatLokal: Website UMKM Cepat, Website Custom, Sistem Digital, Digital Checkup, program website gratis, portofolio, harga, proses kerja, pemeliharaan, dan konsultasi.

Jika pertanyaan di luar topik tersebut, jawab singkat bahwa kamu hanya dapat membantu seputar kebutuhan website UMKM dan solusi digital DekatLokal. Jangan memberi saran umum di luar layanan DekatLokal, jangan mengarang data, dan jangan menyebut sumber internal.

Gunakan Bahasa Indonesia yang santai, semi-formal, ramah, dan terasa seperti anak muda profesional. Jawaban harus ringkas, maksimal sekitar 120 kata. Gunakan **bold** untuk poin penting dan bullet list jika membantu. Arahkan ke CTA yang relevan tanpa memaksa.
`.trim();

function isRelevantMessage(message: string) {
  return /dekatlokal|umkm|website|web|digital checkup|checkup|gratis|pemeliharaan|maintenance|ai assistant|chatbot|erp|absensi|aplikasi mobile|mobile app|sistem|portofolio|marketplace|harga|paket|konsultasi|layanan|domain|hosting|whatsapp/i.test(
    message,
  );
}

function fallbackReply(message: string) {
  if (/harga|biaya|999|paket/i.test(message)) {
    return "**Website UMKM Cepat** tersedia mulai **Rp999.000** dari harga normal Rp1.599.000. Sudah termasuk domain, hosting, pemeliharaan 1 tahun, AI Assistant chatbot 24 jam, dan pengerjaan 1-2 hari setelah materi utama lengkap.";
  }

  if (/gratis|checkup/i.test(message)) {
    return "Ikuti **Digital Checkup gratis** untuk melihat prioritas digital usaha dan membuka peluang mendapatkan website gratis. Setelah selesai, hasil serta rekomendasi akan membantu menentukan langkah berikutnya.";
  }

  if (/custom|marketplace|portofolio|dinamis/i.test(message)) {
    return "**Website Custom** mulai **Rp1.999.999** dari harga normal Rp5.259.000. Cocok untuk marketplace, portofolio, dan website dinamis dengan pengerjaan 3-4 hari setelah cakupan disepakati.";
  }

  if (/erp|absensi|mobile|ai|sistem/i.test(message)) {
    return "**Sistem Digital** cocok untuk dashboard, booking, otomasi, atau sistem internal sesuai alur kerja tim. Versi awal biasanya bisa siap dalam 1 pekan setelah prioritas disepakati.";
  }

  return "Hai! Aku **DekatAI**. Aku siap membantu menjelaskan layanan DekatLokal, mulai dari Website UMKM Cepat, Website Custom, Sistem Digital, Digital Checkup, sampai program website gratis.";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { message?: unknown };
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!message) {
      return NextResponse.json({ error: "Pertanyaan belum diisi." }, { status: 400 });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Pertanyaan maksimal ${MAX_MESSAGE_LENGTH} karakter.` },
        { status: 400 },
      );
    }

    if (!isRelevantMessage(message)) {
      return NextResponse.json({
        reply:
          "Aku hanya bisa membantu seputar **DekatLokal**, kebutuhan website UMKM, Digital Checkup, program website gratis, dan sistem digital internal.",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

    if (!apiKey) {
      return NextResponse.json({ reply: fallbackReply(message) });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents: [{ role: "user", parts: [{ text: message }] }],
          generationConfig: {
            temperature: 0.45,
            maxOutputTokens: 240,
          },
        }),
      },
    );

    if (!response.ok) {
      return NextResponse.json({ reply: fallbackReply(message) });
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const reply = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    return NextResponse.json({ reply: reply || fallbackReply(message) });
  } catch {
    return NextResponse.json({ reply: "Maaf, DekatAI sedang belum siap merespons. Coba lagi sebentar." });
  }
}
